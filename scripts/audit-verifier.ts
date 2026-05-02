/**
 * Audit verifier — recomputes the six audit issue classes and emits a
 * timestamped JSON snapshot. Use as repeatable proof of cleanup state.
 *
 * Run: npx tsx scripts/audit-verifier.ts
 * Output: stdout + writes scripts/audit-snapshots/audit-YYYY-MM-DD.json
 */

import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

interface AuditSnapshot {
  timestamp: string;
  total_facilities: number;
  issues: {
    descriptions_too_short: number;
    descriptions_critical: number;
    tracking_urls: number;
    closed_published: number;
    missing_phone: number;
    missing_website: number;
    image_mismatch: number;
    faqs_generic_phone: number;
  };
  notes: string[];
}

async function main() {
  const result: any = await db.execute(sql`
    SELECT
      (SELECT COUNT(*)::int FROM facilities) as total,
      COUNT(*) FILTER (WHERE description IS NULL OR LENGTH(description) < 150)::int as desc_too_short,
      COUNT(*) FILTER (WHERE description IS NULL OR LENGTH(description) < 50)::int as desc_critical,
      COUNT(*) FILTER (WHERE website ~* '(utm_|fbclid|gclid|mc_eid|mc_cid)')::int as tracking_urls,
      COUNT(*) FILTER (WHERE business_status = 'CLOSED_PERMANENTLY' AND status = 'published')::int as closed_published,
      COUNT(*) FILTER (WHERE google_place_id IS NOT NULL AND (phone IS NULL OR phone = '' OR phone = 'N/A'))::int as missing_phone,
      COUNT(*) FILTER (WHERE google_place_id IS NOT NULL AND (website IS NULL OR website = ''))::int as missing_website,
      COUNT(*) FILTER (
        WHERE google_place_id IS NOT NULL
        AND hero_image_url LIKE '%places.googleapis.com%'
        AND hero_image_url NOT LIKE '%' || google_place_id || '%'
      )::int as image_mismatch,
      (SELECT COUNT(*)::int FROM facility_faqs WHERE answer ILIKE '%our main phone number%') as faqs_generic_phone
    FROM facilities
  `);

  const r = result.rows ? result.rows[0] : result[0];

  const notes: string[] = [];
  if (r.missing_phone > 0) {
    notes.push(
      `${r.missing_phone} facilities have no phone (Google Places returns no listing) — primarily hospices and mobile services.`
    );
  }
  if (r.missing_website > 0) {
    notes.push(`${r.missing_website} facilities have no website on Google Places.`);
  }
  if (r.image_mismatch > 0) {
    notes.push(
      `${r.image_mismatch} facilities have an image URL that doesn't match their place_id (Google Places has no current photo).`
    );
  }

  const snapshot: AuditSnapshot = {
    timestamp: new Date().toISOString(),
    total_facilities: r.total,
    issues: {
      descriptions_too_short: r.desc_too_short,
      descriptions_critical: r.desc_critical,
      tracking_urls: r.tracking_urls,
      closed_published: r.closed_published,
      missing_phone: r.missing_phone,
      missing_website: r.missing_website,
      image_mismatch: r.image_mismatch,
      faqs_generic_phone: r.faqs_generic_phone,
    },
    notes,
  };

  console.log("=== Facility Audit Snapshot ===");
  console.log(JSON.stringify(snapshot, null, 2));

  const dir = resolve(process.cwd(), "scripts/audit-snapshots");
  mkdirSync(dir, { recursive: true });
  // Full-timestamp filename prevents same-day overwrites.
  const stamp = snapshot.timestamp.replace(/[:.]/g, "-").slice(0, 19);
  const path = resolve(dir, `audit-${stamp}.json`);
  writeFileSync(path, JSON.stringify(snapshot, null, 2));
  console.log(`\nSnapshot written: ${path}`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
