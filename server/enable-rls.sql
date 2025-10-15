-- Enable Row Level Security (RLS) on all tables
-- This script secures your Supabase database by blocking direct PostgREST access
-- Only the backend service role (your Express server) can access data

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

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
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES - BACKEND SERVICE ROLE ONLY
-- ============================================================================
-- These policies ensure ONLY your Express backend can access data
-- All direct PostgREST/public access is BLOCKED

-- Users table - Backend only (authentication data)
CREATE POLICY "Backend service role only" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

-- Recovery codes - Backend only (authentication data)
CREATE POLICY "Backend service role only" ON public.recovery_codes
  FOR ALL USING (auth.role() = 'service_role');

-- Articles - Public read, backend write
CREATE POLICY "Public read access" ON public.articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "Backend full access" ON public.articles
  FOR ALL USING (auth.role() = 'service_role');

-- Jobs - Public read, backend write
CREATE POLICY "Public read access" ON public.jobs
  FOR SELECT USING (status = 'published');

CREATE POLICY "Backend full access" ON public.jobs
  FOR ALL USING (auth.role() = 'service_role');

-- Inquiries - Backend only (contains PHI/PII)
CREATE POLICY "Backend service role only" ON public.inquiries
  FOR ALL USING (auth.role() = 'service_role');

-- Page metadata - Public read, backend write
CREATE POLICY "Public read access" ON public.page_metadata
  FOR SELECT USING (true);

CREATE POLICY "Backend full access" ON public.page_metadata
  FOR ALL USING (auth.role() = 'service_role');

-- Caregivers - Public read (for directory), backend write
CREATE POLICY "Public read access" ON public.caregivers
  FOR SELECT USING (status = 'active');

CREATE POLICY "Backend full access" ON public.caregivers
  FOR ALL USING (auth.role() = 'service_role');

-- Job applications - Backend only (contains PHI/PII)
CREATE POLICY "Backend service role only" ON public.job_applications
  FOR ALL USING (auth.role() = 'service_role');

-- Intake forms - Backend only (contains PHI/PII)
CREATE POLICY "Backend service role only" ON public.intake_forms
  FOR ALL USING (auth.role() = 'service_role');

-- Caregiver logs - Backend only (contains PHI)
CREATE POLICY "Backend service role only" ON public.caregiver_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Referrals - Backend only (contains PII)
CREATE POLICY "Backend service role only" ON public.referrals
  FOR ALL USING (auth.role() = 'service_role');

-- Lead magnets - Backend only (contains PII)
CREATE POLICY "Backend service role only" ON public.lead_magnets
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- CREATE PERFORMANCE INDEXES
-- ============================================================================
-- Indexes for query performance and efficient filtering

-- Articles - Frequent queries by status and slug
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);

-- Jobs - Frequent queries by status and location
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- Inquiries - Frequent queries by replied status and type
CREATE INDEX IF NOT EXISTS idx_inquiries_replied ON public.inquiries(replied);
CREATE INDEX IF NOT EXISTS idx_inquiries_type ON public.inquiries(type);
CREATE INDEX IF NOT EXISTS idx_inquiries_submitted_at ON public.inquiries(submitted_at DESC);

-- Job Applications - Frequent queries by status
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_submitted_at ON public.job_applications(submitted_at DESC);

-- Caregivers - Frequent queries by status and availability
CREATE INDEX IF NOT EXISTS idx_caregivers_status ON public.caregivers(status);

-- Referrals - Frequent queries by status
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_submitted_at ON public.referrals(submitted_at DESC);

-- Lead Magnets - Frequent queries by resource type
CREATE INDEX IF NOT EXISTS idx_lead_magnets_resource_type ON public.lead_magnets(resource_type);
CREATE INDEX IF NOT EXISTS idx_lead_magnets_submitted_at ON public.lead_magnets(submitted_at DESC);

-- Intake Forms - Frequent queries by submitted date
CREATE INDEX IF NOT EXISTS idx_intake_forms_submitted_at ON public.intake_forms(submitted_at DESC);

-- Page Metadata - Frequent queries by page identifier
CREATE INDEX IF NOT EXISTS idx_page_metadata_page_identifier ON public.page_metadata(page_identifier);

-- ============================================================================
-- VERIFY RLS IS ENABLED
-- ============================================================================
-- Run this query to verify all tables have RLS enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- ============================================================================
-- VERIFY INDEXES ARE CREATED
-- ============================================================================
-- Run this query to verify indexes exist:
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
