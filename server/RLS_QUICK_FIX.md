# 🔴 CRITICAL: Enable RLS Before Production

## 1-Minute Fix

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/grgcilftuxbhuirlypop

### Step 2: Run Security Script
1. Click **SQL Editor** in left sidebar
2. Click **New Query**
3. Copy/paste contents of `server/enable-rls.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify
Run this query to confirm RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

✅ All tables should show `rowsecurity = true`

## What This Fixes

**Current Risk:**
- ❌ All 10 database tables are publicly accessible
- ❌ Anyone with PostgREST URL can read PHI/PII data
- ❌ No row-level access control

**After Fix:**
- ✅ Only your Express backend can access data
- ✅ PHI/PII tables completely blocked from public access
- ✅ Published content (articles/jobs) safely readable

## Tables Secured

**PHI/PII (Backend Only):**
- `users` - Authentication data
- `recovery_codes` - Password recovery
- `inquiries` - Patient contact info
- `job_applications` - Applicant data
- `intake_forms` - Healthcare assessments
- `caregiver_logs` - Care notes

**Public Content (Controlled):**
- `articles` - Published articles readable
- `jobs` - Published jobs readable  
- `page_metadata` - SEO data readable
- `caregivers` - Active caregivers readable

## Why This Matters

Without RLS, your database is like a house with no locks:
- PostgREST API exposes everything
- Service role key is the only protection
- If someone gets database URL, they own your data

With RLS enabled:
- Database has built-in access control
- Even leaked credentials can't access PHI/PII
- Defense-in-depth security

## Next Steps After RLS

Once RLS is enabled and Replit connectivity works:

```typescript
// server/storage.ts
export const storage = new DbStorage();  // ✅ Safe now
// export const storage = new MemStorage();  // ❌ Remove this
```

See `server/SUPABASE_SECURITY.md` for complete documentation.
