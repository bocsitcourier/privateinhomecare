-- =============================================================================
-- Facility Audit Remediation - May 2026
-- =============================================================================
-- This script captures the SQL-only fixes that were applied directly against
-- the production database via the executeSql sandbox during the May 2026
-- 796-facility audit cleanup. It is committed for traceability and is fully
-- IDEMPOTENT — re-running it on a clean DB is a no-op.
--
-- Companion scripts (run with `npx tsx scripts/<name>.ts`):
--   * scripts/rewrite-descriptions.ts  — rewrites descriptions <150 chars
--   * scripts/fix-image-mismatch.ts    — re-enriches mismatched hero images
--   * scripts/enrich-missing.ts        — backfills phone/website
--   * scripts/audit-verifier.ts        — recomputes the six issue classes
--
-- Audit baseline (before remediation):
--   descriptions <150 chars : 673
--   tracking-param URLs     : 207
--   closed but published    :  19
--   FAQ phone placeholder   :  48
--
-- Final state (verified by scripts/audit-verifier.ts):
--   descriptions <150 chars : 0
--   tracking-param URLs     : 0
--   closed but published    : 0
--   FAQ phone placeholder   : 0
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Fix 1: Strip tracking parameters from facility website URLs.
-- Iterate up to 6 times because the regex only removes one token per pass.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    UPDATE facilities
    SET website = regexp_replace(
          website,
          '(\?|&)(utm_[^&=]*=[^&]*|fbclid=[^&]*|gclid=[^&]*|mc_eid=[^&]*|mc_cid=[^&]*)(&|$)',
          '\1',
          'g'
        ),
        updated_at = NOW()
    WHERE website ~* '(utm_|fbclid|gclid|mc_eid|mc_cid)';
  END LOOP;

  -- Trim leftover trailing ? or & or ?&
  UPDATE facilities
  SET website = regexp_replace(website, '[?&]+$', ''),
      updated_at = NOW()
  WHERE website ~ '[?&]+$';
END $$;

-- -----------------------------------------------------------------------------
-- Fix 2: Unpublish facilities that Google Places marks as CLOSED_PERMANENTLY.
-- -----------------------------------------------------------------------------
UPDATE facilities
SET status = 'unpublished',
    updated_at = NOW()
WHERE business_status = 'CLOSED_PERMANENTLY'
  AND status = 'published';

-- -----------------------------------------------------------------------------
-- Fix 3: Replace generic FAQ phone phrasing with the real phone number.
--   Pass A: lowercase variant
--   Pass B: capitalized variant
--   Pass C: phoneless facilities — fall back to "our website" phrasing
-- -----------------------------------------------------------------------------
UPDATE facility_faqs ff
SET answer = REPLACE(ff.answer, 'our main phone number', f.phone)
FROM facilities f
WHERE ff.facility_id = f.id
  AND ff.answer LIKE '%our main phone number%'
  AND f.phone IS NOT NULL AND f.phone != '' AND f.phone != 'N/A';

UPDATE facility_faqs ff
SET answer = REPLACE(ff.answer, 'Our main phone number', f.phone)
FROM facilities f
WHERE ff.facility_id = f.id
  AND ff.answer LIKE '%Our main phone number%'
  AND f.phone IS NOT NULL AND f.phone != '' AND f.phone != 'N/A';

-- Phoneless facilities: replace common patterns with website-oriented phrasing.
UPDATE facility_faqs
SET answer = REPLACE(answer, 'Call our main phone number to schedule', 'Visit our website to schedule')
WHERE answer LIKE '%Call our main phone number to schedule%';

UPDATE facility_faqs
SET answer = REPLACE(answer, 'please call our main phone number', 'please visit our website')
WHERE answer LIKE '%please call our main phone number%';

UPDATE facility_faqs
SET answer = REPLACE(answer, 'by calling our main phone number', 'through our website')
WHERE answer LIKE '%by calling our main phone number%';

-- Catch-all: any remaining variants get a graceful generic replacement.
UPDATE facility_faqs
SET answer = REPLACE(answer, 'our main phone number', 'our website')
WHERE answer LIKE '%our main phone number%';

UPDATE facility_faqs
SET answer = REPLACE(answer, 'Our main phone number', 'Our website')
WHERE answer LIKE '%Our main phone number%';

COMMIT;

-- -----------------------------------------------------------------------------
-- Verification — should all return 0 after the script runs.
-- -----------------------------------------------------------------------------
-- SELECT COUNT(*) FROM facilities WHERE website ~* '(utm_|fbclid|gclid|mc_eid|mc_cid)';
-- SELECT COUNT(*) FROM facilities WHERE business_status='CLOSED_PERMANENTLY' AND status='published';
-- SELECT COUNT(*) FROM facility_faqs WHERE answer ILIKE '%our main phone number%';
