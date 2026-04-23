/**
 * Upsert all articles from every seed file into the database.
 * Existing articles are updated; missing ones are inserted.
 * Run with:  npx tsx scripts/upsert-seed-articles.ts
 */
import { sql } from "drizzle-orm";
import { db } from "../server/db";
import { articles, articleFaqs } from "../shared/schema";

import { comprehensiveArticles } from "../server/seeds/comprehensive-articles";
import { caregiverArticles }     from "../server/seeds/caregiver-articles";
import { articlesBatch2 }        from "../server/seeds/articles-batch-2";
import { articlesBatch3 }        from "../server/seeds/articles-batch-3";
import { articlesBatch4 }        from "../server/seeds/articles-batch-4";
import { articlesBatch5 }        from "../server/seeds/articles-batch-5";
import { articlesBatch6 }        from "../server/seeds/articles-batch-6";
import { articlesBatch7 }        from "../server/seeds/articles-batch-7";
import { articlesBatch8 }        from "../server/seeds/articles-batch-8";
import { articlesBatch9 }        from "../server/seeds/articles-batch-9";
import { articlesBatch10 }       from "../server/seeds/articles-batch-10";

const allSeeds = [
  ...comprehensiveArticles,
  ...caregiverArticles,
  ...articlesBatch2,
  ...articlesBatch3,
  ...articlesBatch4,
  ...articlesBatch5,
  ...articlesBatch6,
  ...articlesBatch7,
  ...articlesBatch8,
  ...articlesBatch9,
  ...articlesBatch10,
];

async function main() {
  console.log(`Total articles to upsert: ${allSeeds.length}`);

  let inserted = 0;
  let updated = 0;
  let errors: string[] = [];

  for (const seed of allSeeds) {
    try {
      const result = await db
        .insert(articles)
        .values({
          title:           seed.title,
          slug:            seed.slug,
          excerpt:         seed.excerpt ?? null,
          body:            seed.body,
          category:        seed.category,
          heroImageUrl:    seed.heroImageUrl ?? null,
          metaTitle:       seed.metaTitle ?? null,
          metaDescription: seed.metaDescription ?? null,
          keywords:        seed.keywords ?? [],
          status:          "published",
          publishedAt:     new Date(),
        })
        .onConflictDoUpdate({
          target: articles.slug,
          set: {
            title:           sql`excluded.title`,
            excerpt:         sql`excluded.excerpt`,
            body:            sql`excluded.body`,
            category:        sql`excluded.category`,
            heroImageUrl:    sql`excluded.hero_image_url`,
            metaTitle:       sql`excluded.meta_title`,
            metaDescription: sql`excluded.meta_description`,
            keywords:        sql`excluded.keywords`,
            status:          sql`excluded.status`,
            publishedAt:     sql`excluded.published_at`,
            updatedAt:       sql`now()`,
          },
        })
        .returning({ id: articles.id, slug: articles.slug });

      const articleId = result[0].id;

      // Upsert FAQs if present
      if (seed.faqs?.length) {
        await db.delete(articleFaqs).where(
          sql`article_id = ${articleId}`
        );
        for (const faq of seed.faqs) {
          await db.insert(articleFaqs).values({
            articleId,
            question: faq.question,
            answer:   faq.answer,
          });
        }
      }

      // Distinguish insert vs update by checking updatedAt freshness would be
      // complex — just count them in aggregate
      inserted++;
    } catch (err: any) {
      errors.push(`${seed.slug}: ${err.message}`);
    }
  }

  console.log(`\nDone.`);
  console.log(`  Upserted: ${inserted}`);
  if (errors.length) {
    console.log(`  Errors (${errors.length}):`);
    errors.forEach(e => console.log("   -", e));
  } else {
    console.log(`  No errors.`);
  }

  // Final count
  const [{ count }] = await db.execute<{ count: string }>(
    sql`SELECT COUNT(*)::text AS count FROM articles`
  );
  console.log(`\nTotal articles in DB now: ${count}`);

  process.exit(0);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
