/**
 * One-time script: Enrich facilities missing phone/website/hero image
 * using direct Google Places Details API (Place ID lookup — no text search).
 * Run: npx tsx scripts/enrich-missing.ts
 */

import { db } from "../server/db";
import { facilities } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import { enrichFacilityByPlaceId } from "../server/googlePlaces";

async function main() {
  console.log("Querying facilities needing enrichment...");

  const toEnrich = await db
    .select({
      id: facilities.id,
      name: facilities.name,
      googlePlaceId: facilities.googlePlaceId,
      phone: facilities.phone,
      website: facilities.website,
      heroImageUrl: facilities.heroImageUrl,
    })
    .from(facilities)
    .where(
      sql`google_place_id IS NOT NULL AND (
        hero_image_url IS NULL OR hero_image_url = '' OR
        phone IS NULL OR phone = '' OR phone = 'N/A' OR
        website IS NULL OR website = ''
      )`
    );

  console.log(`Found ${toEnrich.length} facilities to enrich\n`);

  let gotPhone = 0;
  let gotWebsite = 0;
  let gotImage = 0;
  let failed = 0;
  const BATCH = 5;

  for (let i = 0; i < toEnrich.length; i += BATCH) {
    const batch = toEnrich.slice(i, i + BATCH);
    process.stdout.write(`Batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(toEnrich.length / BATCH)} (${i + 1}-${Math.min(i + BATCH, toEnrich.length)})... `);

    const results = await Promise.all(
      batch.map(async (f) => {
        if (!f.googlePlaceId) return { name: f.name, success: false, error: "no place id" };
        try {
          const result = await enrichFacilityByPlaceId({
            id: f.id,
            name: f.name,
            googlePlaceId: f.googlePlaceId,
          });

          if (result.success && result.data) {
            const updates: Record<string, any> = {};
            if (result.data.phone && (!f.phone || f.phone === "N/A" || f.phone === "")) {
              updates.phone = result.data.phone;
              gotPhone++;
            }
            if (result.data.website && (!f.website || f.website === "")) {
              updates.website = result.data.website;
              gotWebsite++;
            }
            if (result.data.heroImageUrl && (!f.heroImageUrl || f.heroImageUrl === "")) {
              updates.heroImageUrl = result.data.heroImageUrl;
              if (result.data.galleryImages?.length) {
                updates.galleryImages = result.data.galleryImages;
              }
              gotImage++;
            }
            if (result.data.rating) updates.overallRating = result.data.rating;
            if (result.data.reviewCount) updates.reviewCount = result.data.reviewCount;
            if (result.data.latitude) updates.latitude = result.data.latitude;
            if (result.data.longitude) updates.longitude = result.data.longitude;
            if (result.data.openingHours) updates.openingHours = result.data.openingHours;
            if (result.data.googleReviews?.length) updates.googleReviews = result.data.googleReviews;
            if (result.data.businessStatus) updates.businessStatus = result.data.businessStatus;
            updates.lastEnrichedAt = new Date();

            await db.update(facilities).set(updates).where(eq(facilities.id, f.id));
            return { name: f.name, success: true };
          }
          failed++;
          return { name: f.name, success: false, error: result.error };
        } catch (err) {
          failed++;
          return { name: f.name, success: false, error: String(err) };
        }
      })
    );

    const successCount = results.filter((r) => r?.success).length;
    const failures = results.filter((r) => !r?.success).map((r) => `  FAIL: ${r?.name} — ${(r as any).error}`);
    console.log(`${successCount}/${batch.length} ok`);
    failures.forEach((f) => console.log(f));

    if (i + BATCH < toEnrich.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  console.log("\n=== ENRICHMENT COMPLETE ===");
  console.log(`Phone numbers added: ${gotPhone}`);
  console.log(`Websites added:      ${gotWebsite}`);
  console.log(`Hero images added:   ${gotImage}`);
  console.log(`Failed (no data):    ${failed}`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
