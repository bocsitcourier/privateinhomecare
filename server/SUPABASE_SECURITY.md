# Supabase Security Setup

## Critical Security Issue: RLS Not Enabled

Your Supabase database currently has **Row Level Security (RLS) disabled** on all tables. This is a critical security vulnerability that must be fixed before going to production.

### What is RLS?

Row Level Security (RLS) is PostgreSQL's mechanism to control which rows users can access. Without RLS:
- Anyone with database access can read/modify all data
- PostgREST API exposes all tables publicly
- PHI/PII data in `inquiries`, `job_applications`, `intake_forms` is unprotected

### Current Risk Level: 🔴 CRITICAL

**Affected Tables (all 12):**
- `users` - Authentication data exposed
- `recovery_codes` - Password recovery exposed
- `inquiries` - PHI/PII exposed
- `job_applications` - PHI/PII exposed
- `intake_forms` - PHI/PII exposed
- `caregiver_logs` - PHI exposed
- `referrals` - PII exposed
- `lead_magnets` - PII exposed
- `articles`, `jobs`, `page_metadata`, `caregivers` - Content exposed

## How to Fix (Run in Supabase SQL Editor)

### Option 1: Automated Script (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `server/enable-rls.sql`
3. Paste and run the script
4. Verify RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```
   All tables should show `rowsecurity = true`

### Option 2: Manual Setup

Run each command in the SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_logs ENABLE ROW LEVEL SECURITY;
```

Then create policies (see `enable-rls.sql` for full policy definitions).

## Security Architecture

### Backend-Only Access Model

Your Express backend is the **only** authorized way to access data:

1. **Backend (Express)** 
   - Uses service role key (full access)
   - Implements authentication/authorization
   - Validates all requests
   - Sanitizes data

2. **Direct PostgREST Access**
   - BLOCKED by RLS policies
   - Even if someone gets PostgREST URL, they cannot read data
   - Only backend service role can access PHI/PII tables

### RLS Policy Strategy

**PHI/PII Tables (Strictest):**
- `users`, `recovery_codes`, `inquiries`, `job_applications`, `intake_forms`, `caregiver_logs`
- **Policy:** Backend service role ONLY
- **Effect:** No public access whatsoever

**Public Content Tables:**
- `articles`, `jobs` (published only)
- `page_metadata`, `caregivers` (active only)
- **Policy:** Public SELECT, backend full access
- **Effect:** Safe public reading, backend controls writes

## After Enabling RLS

### Switch from MemStorage to DbStorage

Once RLS is enabled and Replit connectivity is restored:

1. Edit `server/storage.ts`:
   ```typescript
   // Uncomment this line:
   export const storage = new DbStorage();
   
   // Comment out this line:
   // export const storage = new MemStorage();
   ```

2. Ensure `DATABASE_URL` environment variable is set

3. Restart the application

### Verify Security

Run in Supabase SQL Editor:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

Expected output:
- All tables: `rowsecurity = true`
- Each table has at least one policy

## Important Notes

### Service Role vs Anon Key

Your backend uses two keys:

1. **Service Role Key** (`DATABASE_URL`)
   - Full database access (bypasses RLS when needed)
   - Used by Express backend
   - NEVER expose to frontend

2. **Anon Key** (if using PostgREST directly)
   - Limited by RLS policies
   - Would be safe for frontend use
   - NOT USED in this architecture

### Current State

- ✅ Backend authentication working (session-based)
- ✅ Express API validates all requests
- ✅ CAPTCHA protection on forms
- ✅ Rate limiting active
- ❌ **RLS NOT ENABLED** ← Fix this before production!
- ⏳ MemStorage active (waiting for Supabase connectivity)

## Production Readiness Checklist

Before deploying to production:

- [ ] Enable RLS on all tables (run `enable-rls.sql`)
- [ ] Verify RLS policies with test queries
- [ ] Switch from MemStorage to DbStorage
- [ ] Test all CRUD operations work correctly
- [ ] Verify PHI/PII tables are inaccessible via PostgREST
- [ ] Confirm service worker doesn't cache sensitive data
- [ ] Review all API endpoints for proper authentication

## Compliance Notes

### HIPAA Considerations

With RLS enabled, your database meets several HIPAA requirements:

- ✅ Access control: Only authenticated backend can access PHI
- ✅ Audit capability: Supabase logs all queries
- ✅ Encryption: Supabase provides encryption at rest and in transit
- ✅ Minimum necessary: RLS enforces least privilege access

### Additional Hardening (Optional)

For maximum security, consider:

1. **Database Network Isolation**
   - Use Supabase's Network Restrictions feature
   - Whitelist only your backend server IP

2. **Audit Logging**
   - Enable Supabase audit logs
   - Monitor all service role queries

3. **Secrets Rotation**
   - Rotate service role key quarterly
   - Update `DATABASE_URL` accordingly

## Need Help?

- **Supabase RLS Docs:** https://supabase.com/docs/guides/database/postgres/row-level-security
- **Current Status:** Using MemStorage (no RLS needed), switch to DbStorage when ready
- **Migration Script:** `server/enable-rls.sql`
