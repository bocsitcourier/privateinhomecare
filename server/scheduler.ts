import { storage } from "./storage";
import { enrichFacility, createDataHash } from "./googlePlaces";

const REFRESH_INTERVAL_DAYS = 90;
const BATCH_SIZE = 5;
const DELAY_BETWEEN_FACILITIES = 1500; // 1.5s between each to stay under rate limits
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function runAutoRefresh(): Promise<void> {
  try {
    const allFacilities = await storage.listFacilities({});
    const cutoff = new Date(Date.now() - REFRESH_INTERVAL_DAYS * 24 * 60 * 60 * 1000);

    const stale = allFacilities.filter(f =>
      f.googlePlaceId && (
        !f.lastEnrichedAt ||
        new Date(f.lastEnrichedAt) < cutoff
      )
    );

    if (stale.length === 0) {
      console.log(`[AutoRefresh] All facilities up to date (checked ${allFacilities.length})`);
      return;
    }

    console.log(`[AutoRefresh] Found ${stale.length} facilities needing refresh (>${REFRESH_INTERVAL_DAYS} days old)`);

    let done = 0;
    let errors = 0;

    for (let i = 0; i < stale.length; i += BATCH_SIZE) {
      const batch = stale.slice(i, i + BATCH_SIZE);

      for (const facility of batch) {
        try {
          const result = await enrichFacility(facility);

          if (result.success && result.data) {
            const newHash = createDataHash({
              address: result.data.address,
              phone: result.data.phone,
              rating: result.data.rating,
            });
            const dataChanged = facility.dataHash !== newHash;

            await storage.updateFacility(facility.id, {
              address: result.data.address || facility.address,
              phone: result.data.phone || facility.phone,
              website: result.data.website || facility.website,
              overallRating: result.data.rating || facility.overallRating,
              reviewCount: result.data.reviewCount || facility.reviewCount,
              googleMapsUrl: result.data.googleMapsUrl,
              googlePlaceId: result.data.googlePlaceId,
              businessStatus: result.data.businessStatus,
              isClosed: result.data.isClosed,
              heroImageUrl: facility.heroImageUrl || result.data.heroImageUrl,
              latitude: result.data.latitude || facility.latitude,
              longitude: result.data.longitude || facility.longitude,
              openingHours: result.data.openingHours,
              accessibilityOptions: result.data.accessibilityOptions,
              googleReviews: result.data.googleReviews.length > 0 ? result.data.googleReviews : (facility.googleReviews || undefined),
              lastEnrichedAt: new Date(),
              dataHash: newHash,
              needsRegeneration: dataChanged ? "yes" : facility.needsRegeneration,
            });
            done++;
          } else {
            errors++;
            console.warn(`[AutoRefresh] Failed: ${facility.name} — ${result.error}`);
          }
        } catch (err) {
          errors++;
          console.error(`[AutoRefresh] Error refreshing ${facility.name}:`, err);
        }

        await sleep(DELAY_BETWEEN_FACILITIES);
      }

      console.log(`[AutoRefresh] Progress: ${Math.min(i + BATCH_SIZE, stale.length)}/${stale.length}`);
    }

    console.log(`[AutoRefresh] Complete: ${done} refreshed, ${errors} errors`);
  } catch (err) {
    console.error("[AutoRefresh] Scheduler error:", err);
  }
}

export function startAutoRefreshScheduler(): void {
  // Run once on startup (after a 30s delay to let the server fully initialize)
  setTimeout(() => {
    console.log(`[AutoRefresh] Starting initial check...`);
    runAutoRefresh();
  }, 30_000);

  // Then run every 24 hours to check for stale facilities
  setInterval(() => {
    console.log(`[AutoRefresh] Running scheduled check...`);
    runAutoRefresh();
  }, CHECK_INTERVAL_MS);

  console.log(`[AutoRefresh] Scheduler started — refreshes facilities older than ${REFRESH_INTERVAL_DAYS} days`);
}
