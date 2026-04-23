/**
 * Syncs all articles from the dev (Helium) database to production.
 * Connects to both databases, fetches all dev articles, and upserts them
 * into production using ON CONFLICT (slug) DO UPDATE.
 *
 * Run with:  PROD_DB_URL="..." npx tsx scripts/sync-articles-to-prod.ts
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";

const PROD_DB_URL = process.env.PROD_DB_URL;
if (!PROD_DB_URL) {
  console.error("Missing PROD_DB_URL environment variable");
  process.exit(1);
}

async function main() {
  // Connect to dev (Helium)
  const devConn = postgres(process.env.DATABASE_URL!, { ssl: false, max: 1 });
  const devDb = drizzle(devConn);

  // Connect to production
  const prodConn = postgres(PROD_DB_URL!, { ssl: false, max: 1 });
  const prodDb = drizzle(prodConn);

  console.log("Fetching all articles from dev...");
  const devArticles = await devDb.execute(
    sql`SELECT id, title, slug, excerpt, body, category, hero_image_url,
               meta_title, meta_description, keywords, status, published_at,
               created_at, updated_at
        FROM articles ORDER BY slug`
  );
  console.log(`Dev has ${devArticles.length} articles.`);

  console.log("Upserting into production...");
  let done = 0;
  let errors: string[] = [];

  for (const a of devArticles) {
    try {
      await prodDb.execute(sql`
        INSERT INTO articles
          (id, title, slug, excerpt, body, category, hero_image_url,
           meta_title, meta_description, keywords, status, published_at,
           created_at, updated_at)
        VALUES (
          ${a.id}, ${a.title}, ${a.slug}, ${a.excerpt}, ${a.body},
          ${a.category}, ${a.hero_image_url}, ${a.meta_title},
          ${a.meta_description}, ${a.keywords}::jsonb,
          ${a.status}, ${a.published_at}, ${a.created_at}, ${a.updated_at}
        )
        ON CONFLICT (slug) DO UPDATE SET
          title           = EXCLUDED.title,
          excerpt         = EXCLUDED.excerpt,
          body            = EXCLUDED.body,
          category        = EXCLUDED.category,
          hero_image_url  = EXCLUDED.hero_image_url,
          meta_title      = EXCLUDED.meta_title,
          meta_description= EXCLUDED.meta_description,
          keywords        = EXCLUDED.keywords,
          status          = EXCLUDED.status,
          published_at    = EXCLUDED.published_at,
          updated_at      = now()
      `);
      done++;
    } catch (err: any) {
      errors.push(`${a.slug}: ${err.message.slice(0, 80)}`);
    }
  }

  // Verify
  const [row] = await prodDb.execute(sql`SELECT COUNT(*)::int AS c FROM articles`);
  console.log(`\nDone. Upserted ${done} articles.`);
  if (errors.length) {
    console.log(`Errors (${errors.length}):`);
    errors.forEach(e => console.log(" -", e));
  }
  console.log(`Production now has ${(row as any).c} articles.`);

  await devConn.end();
  await prodConn.end();
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
