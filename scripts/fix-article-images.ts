import { db } from '../server/db';
import { articles } from '../shared/schema';
import { sql } from 'drizzle-orm';
import fs from 'fs';

async function fixArticleImages() {
  const manifest = JSON.parse(fs.readFileSync('./scripts/new_articles_manifest.json', 'utf8'));
  const aiDir = './attached_assets/ai_generated';

  let updated = 0;
  let notFound = 0;

  for (const art of manifest) {
    const imgFile = `${aiDir}/${art.slug}.png`;
    if (!fs.existsSync(imgFile)) {
      console.log(`No image file for ${art.slug} — skipping`);
      notFound++;
      continue;
    }
    const heroImageUrl = `/attached_assets/ai_generated/${art.slug}.png`;
    const res = await db.execute(
      sql`UPDATE articles SET hero_image_url = ${heroImageUrl} WHERE slug = ${art.slug} AND (hero_image_url NOT LIKE '/attached_assets/ai_generated/%' OR hero_image_url IS NULL) RETURNING slug`
    );
    if ((res as any).rows?.length > 0 || (res as any).rowCount > 0) {
      console.log(`Updated: ${art.slug}`);
      updated++;
    }
  }

  console.log(`\nDone. Updated ${updated} articles. Missing images: ${notFound}`);
  process.exit(0);
}

fixArticleImages().catch(e => { console.error(e); process.exit(1); });
