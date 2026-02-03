CREATE TABLE "articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"body" text NOT NULL,
	"category" text DEFAULT 'Care Tips' NOT NULL,
	"hero_image_url" text,
	"meta_title" text,
	"meta_description" text,
	"keywords" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "caregiver_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caregiver_name" text NOT NULL,
	"caregiver_email" text NOT NULL,
	"caregiver_phone" text NOT NULL,
	"client_name" text NOT NULL,
	"shift_date" text NOT NULL,
	"shift_start_time" text NOT NULL,
	"shift_end_time" text,
	"log_data" jsonb NOT NULL,
	"agreed_to_terms" text DEFAULT 'no' NOT NULL,
	"agreed_to_policy" text DEFAULT 'no' NOT NULL,
	"agreement_timestamp" timestamp,
	"status" text DEFAULT 'submitted' NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "caregivers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"photo_url" text,
	"bio" text NOT NULL,
	"years_experience" integer NOT NULL,
	"certifications" jsonb DEFAULT '[]'::jsonb,
	"specialties" jsonb DEFAULT '[]'::jsonb,
	"hourly_rate" integer NOT NULL,
	"location" text NOT NULL,
	"availability" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"rating" integer DEFAULT 0,
	"review_count" integer DEFAULT 0,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hipaa_acknowledgments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_full_name" text NOT NULL,
	"client_date_of_birth" text NOT NULL,
	"acknowledged_receipt" text DEFAULT 'no' NOT NULL,
	"consented_to_tpo" text DEFAULT 'no' NOT NULL,
	"signature" text NOT NULL,
	"signature_date" text NOT NULL,
	"printed_name" text NOT NULL,
	"relationship_to_client" text,
	"client_refused" text DEFAULT 'no',
	"refusal_date" text,
	"refusal_time" text,
	"staff_name" text,
	"staff_signature" text,
	"refusal_reason" text,
	"agreed_to_terms" text DEFAULT 'no' NOT NULL,
	"agreed_to_policy" text DEFAULT 'no' NOT NULL,
	"agreement_timestamp" timestamp,
	"status" text DEFAULT 'submitted' NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"service" text,
	"message" text,
	"agreed_to_terms" text DEFAULT 'no' NOT NULL,
	"agreed_to_policy" text DEFAULT 'no' NOT NULL,
	"agreement_timestamp" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"replies" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intake_forms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_name" text NOT NULL,
	"client_email" text NOT NULL,
	"client_phone" text NOT NULL,
	"date_of_birth" text,
	"case_record_no" text,
	"form_data" jsonb NOT NULL,
	"agreed_to_terms" text DEFAULT 'no' NOT NULL,
	"agreed_to_policy" text DEFAULT 'no' NOT NULL,
	"agreement_timestamp" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar,
	"position_interested" text,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"background_screening_consent" text NOT NULL,
	"certification_type" text,
	"driving_status" text,
	"availability" jsonb DEFAULT '[]'::jsonb,
	"start_date" text,
	"years_experience" integer,
	"special_skills" jsonb DEFAULT '[]'::jsonb,
	"resume_url" text,
	"cover_letter" text,
	"motivation" text,
	"adaptability" text,
	"conflict_handling" text,
	"safety_achievement" text,
	"experience_types" text,
	"consent" text,
	"agreed_to_terms" text DEFAULT 'no' NOT NULL,
	"agreed_to_policy" text DEFAULT 'no' NOT NULL,
	"agreement_timestamp" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text,
	"pay_range" text,
	"location" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_magnets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"resource_id" text NOT NULL,
	"resource_title" text NOT NULL,
	"source" text,
	"agreed_to_terms" text DEFAULT 'no' NOT NULL,
	"agreed_to_policy" text DEFAULT 'no' NOT NULL,
	"agreement_timestamp" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_meta" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"og_title" text,
	"og_description" text,
	"og_image_url" text,
	"keywords" jsonb DEFAULT '[]'::jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_meta_page_slug_unique" UNIQUE("page_slug")
);
--> statement-breakpoint
CREATE TABLE "recovery_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"code_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_name" text NOT NULL,
	"referrer_email" text NOT NULL,
	"referrer_phone" text NOT NULL,
	"relationship_to_referred" text NOT NULL,
	"referred_name" text NOT NULL,
	"referred_phone" text NOT NULL,
	"referred_email" text,
	"referred_location" text NOT NULL,
	"primary_need_for_care" text NOT NULL,
	"additional_info" text,
	"website" text,
	"agreed_to_terms" text DEFAULT 'no' NOT NULL,
	"agreed_to_policy" text DEFAULT 'no' NOT NULL,
	"agreement_timestamp" timestamp,
	"consent_to_contact" text DEFAULT 'no' NOT NULL,
	"acknowledged_credit_terms" text DEFAULT 'no' NOT NULL,
	"acknowledged_compliance_terms" text DEFAULT 'no' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"tracking_code" text,
	"hours_completed" text DEFAULT '0',
	"credit_issued" text DEFAULT 'no',
	"credit_issued_date" timestamp,
	"notes" text,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"password_updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_codes" ADD CONSTRAINT "recovery_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;