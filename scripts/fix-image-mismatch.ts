/**
 * Re-enrich facilities whose hero_image_url is from Google Places but doesn't
 * match their google_place_id (IMAGE_MISMATCH). Run: npx tsx scripts/fix-image-mismatch.ts
 */

import { db } from "../server/db";
import { facilities } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import { enrichFacilityByPlaceId } from "../server/googlePlaces";
import { writeFileSync } from "fs";

async function main() {
  console.log("Querying facilities with IMAGE_MISMATCH...");

  const toFix = await db
    .select({
      id: facilities.id,
      name: facilities.name,
      googlePlaceId: facilities.googlePlaceId,
      heroImageUrl: facilities.heroImageUrl,
    })
    .from(facilities)
    .where(
      sql`google_place_id IS NOT NULL
        AND hero_image_url LIKE '%places.googleapis.com%'
        AND hero_image_url NOT LIKE '%' || google_place_id || '%'`
    );

  console.log(`Found ${toFix.length} facilities with IMAGE_MISMATCH\n`);

  let processed = 0;
  let imagesReplaced = 0;
  let failed = 0;
  const failures: Array<{ id: string; name: string; error: string }> = [];
  const BATCH = 5;

  for (let i = 0; i < toFix.length; i += BATCH) {
    const batch = toFix.slice(i, i + BATCH);
    process.stdout.write(
      `Batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(toFix.length / BATCH)} (${i + 1}-${Math.min(i + BATCH, toFix.length)})... `
    );

    const results = await Promise.all(
      batch.map(async (f) => {
        processed++;
        if (!f.googlePlaceId) {
          failed++;
          return { id: f.id, name: f.name, success: false, error: "no place id" };
        }
        try {
          const result = await enrichFacilityByPlaceId({
            id: f.id,
            name: f.name,
            googlePlaceId: f.googlePlaceId,
          });

          if (result.success && result.data && result.data.heroImageUrl) {
            const newUrl = result.data.heroImageUrl;
            // Postcondition: new URL must reference this facility's place_id (or be a non-Google URL).
            const isGoogleUrl = newUrl.includes("places.googleapis.com");
            const matchesPlaceId = newUrl.includes(f.googlePlaceId);
            if (isGoogleUrl && !matchesPlaceId) {
              failed++;
              return {
                id: f.id,
                name: f.name,
                success: false,
                error: `postcondition failed: new URL does not contain place_id ${f.googlePlaceId}`,
              };
            }
            const updates: Record<string, any> = {
              heroImageUrl: newUrl,
              lastEnrichedAt: new Date(),
              updatedAt: new Date(),
            };
            if (result.data.galleryImages?.length) {
              updates.galleryImages = result.data.galleryImages;
            }
            await db.update(facilities).set(updates).where(eq(facilities.id, f.id));
            imagesReplaced++;
            return { id: f.id, name: f.name, success: true };
          }
          failed++;
          return {
            id: f.id,
            name: f.name,
            success: false,
            error: result.success ? "no heroImageUrl returned" : (result as any).error || "unknown",
          };
        } catch (err) {
          failed++;
          return { id: f.id, name: f.name, success: false, error: String(err) };
        }
      })
    );

    const successCount = results.filter((r) => r?.success).length;
    console.log(`${successCount}/${batch.length} ok`);
    results
      .filter((r) => !r?.success)
      .forEach((r) => {
        failures.push({ id: r!.id, name: r!.name, error: (r as any).error });
        console.log(`  FAIL: ${r!.name} — ${(r as any).error}`);
      });

    if (i + BATCH < toFix.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  console.log("\n=== IMAGE MISMATCH FIX COMPLETE ===");
  console.log(`Processed:        ${processed}`);
  console.log(`Images replaced:  ${imagesReplaced}`);
  console.log(`Failed:           ${failed}`);

  const summary = {
    processed,
    images_replaced: imagesReplaced,
    failed,
    failures,
  };
  writeFileSync("/tmp/fix_t102_result.json", JSON.stringify(summary, null, 2));
  console.log("\nWrote /tmp/fix_t102_result.json");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
