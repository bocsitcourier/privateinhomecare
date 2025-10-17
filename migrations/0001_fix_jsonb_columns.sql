-- Migration to fix column types that need to be converted to jsonb
-- This handles the automatic casting issue by dropping and recreating columns

-- Fix certifications column in caregivers table
DO $$ 
BEGIN
    -- Check if column exists and is not jsonb
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'caregivers' 
               AND column_name = 'certifications' 
               AND data_type != 'jsonb') THEN
        
        -- Drop the column and recreate as jsonb
        ALTER TABLE "caregivers" DROP COLUMN IF EXISTS "certifications";
        ALTER TABLE "caregivers" ADD COLUMN "certifications" jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Fix specialties column in caregivers table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'caregivers' 
               AND column_name = 'specialties' 
               AND data_type != 'jsonb') THEN
        
        ALTER TABLE "caregivers" DROP COLUMN IF EXISTS "specialties";
        ALTER TABLE "caregivers" ADD COLUMN "specialties" jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Fix keywords column in articles table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' 
               AND column_name = 'keywords' 
               AND data_type != 'jsonb') THEN
        
        ALTER TABLE "articles" DROP COLUMN IF EXISTS "keywords";
        ALTER TABLE "articles" ADD COLUMN "keywords" jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Fix keywords column in page_meta table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'page_meta' 
               AND column_name = 'keywords' 
               AND data_type != 'jsonb') THEN
        
        ALTER TABLE "page_meta" DROP COLUMN IF EXISTS "keywords";
        ALTER TABLE "page_meta" ADD COLUMN "keywords" jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Fix other jsonb columns that might have similar issues
-- Add more conversions as needed for other tables

-- Fix availability column in job_applications table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'job_applications' 
               AND column_name = 'availability' 
               AND data_type != 'jsonb') THEN
        
        ALTER TABLE "job_applications" DROP COLUMN IF EXISTS "availability";
        ALTER TABLE "job_applications" ADD COLUMN "availability" jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Fix special_skills column in job_applications table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'job_applications' 
               AND column_name = 'special_skills' 
               AND data_type != 'jsonb') THEN
        
        ALTER TABLE "job_applications" DROP COLUMN IF EXISTS "special_skills";
        ALTER TABLE "job_applications" ADD COLUMN "special_skills" jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;