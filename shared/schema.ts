import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  passwordUpdatedAt: timestamp("password_updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const recoveryCodes = pgTable("recovery_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  codeHash: text("code_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
});

export const insertRecoveryCodeSchema = createInsertSchema(recoveryCodes).omit({
  id: true,
  createdAt: true,
  usedAt: true,
});

export type InsertRecoveryCode = z.infer<typeof insertRecoveryCodeSchema>;
export type RecoveryCode = typeof recoveryCodes.$inferSelect;

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  payRange: text("pay_range"),
  location: text("location"),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateJobSchema = insertJobSchema.partial();

export type InsertJob = z.infer<typeof insertJobSchema>;
export type UpdateJob = z.infer<typeof updateJobSchema>;
export type Job = typeof jobs.$inferSelect;

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  body: text("body").notNull(),
  category: text("category").notNull().default("Care Tips"),
  heroImageUrl: text("hero_image_url"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: jsonb("keywords").$type<string[]>().default([]),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  keywords: z.array(z.string()).default([]),
  slug: z.string().optional(),
});

export const updateArticleSchema = insertArticleSchema.partial();

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type UpdateArticle = z.infer<typeof updateArticleSchema>;
export type Article = typeof articles.$inferSelect;

export const articleFaqs = pgTable("article_faqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: text("is_active").notNull().default("yes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertArticleFaqSchema = createInsertSchema(articleFaqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateArticleFaqSchema = insertArticleFaqSchema.partial();

export type InsertArticleFaq = z.infer<typeof insertArticleFaqSchema>;
export type UpdateArticleFaq = z.infer<typeof updateArticleFaqSchema>;
export type ArticleFaq = typeof articleFaqs.$inferSelect;

export const inquiries = pgTable("inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  service: text("service"),
  message: text("message"),
  agreedToTerms: text("agreed_to_terms").notNull().default("no"),
  agreedToPolicy: text("agreed_to_policy").notNull().default("no"),
  agreementTimestamp: timestamp("agreement_timestamp"),
  status: text("status").notNull().default("pending"),
  replies: jsonb("replies").$type<Array<{
    id: string;
    body: string;
    sentBy: string;
    sentAt: string;
  }>>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  status: true,
  replies: true,
  agreementTimestamp: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  phone: z.string().trim().min(1, "Phone number is required"),
  email: z.string().trim().email("Valid email is required"),
  agreedToTerms: z.enum(["yes", "no"], { required_error: "You must agree to the Terms of Service" }),
  agreedToPolicy: z.enum(["yes", "no"], { required_error: "You must agree to the Privacy Policy" }),
});

export const replySchema = z.object({
  body: z.string().min(1),
  sentBy: z.string(),
});

export const updateInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
}).extend({
  phone: z.string().trim().min(1, "Phone number is required").optional(),
  email: z.string().trim().email("Valid email is required").optional(),
}).partial();

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type UpdateInquiry = z.infer<typeof updateInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type Reply = z.infer<typeof replySchema>;

export const pageMeta = pgTable("page_meta", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageSlug: text("page_slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImageUrl: text("og_image_url"),
  keywords: jsonb("keywords").$type<string[]>().default([]),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPageMetaSchema = createInsertSchema(pageMeta).omit({
  id: true,
  updatedAt: true,
}).extend({
  keywords: z.array(z.string()).default([]),
});

export const updatePageMetaSchema = insertPageMetaSchema.partial().required({
  pageSlug: true,
});

export type InsertPageMeta = z.infer<typeof insertPageMetaSchema>;
export type UpdatePageMeta = z.infer<typeof updatePageMetaSchema>;
export type PageMeta = typeof pageMeta.$inferSelect;

export const caregivers = pgTable("caregivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  bio: text("bio").notNull(),
  yearsExperience: integer("years_experience").notNull(),
  certifications: jsonb("certifications").$type<string[]>().default([]),
  specialties: jsonb("specialties").$type<string[]>().default([]),
  hourlyRate: integer("hourly_rate").notNull(),
  location: text("location").notNull(),
  availability: text("availability").notNull(),
  status: text("status").notNull().default("active"),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCaregiverSchema = createInsertSchema(caregivers).omit({
  id: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  certifications: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
});

export const updateCaregiverSchema = insertCaregiverSchema.partial();

export type InsertCaregiver = z.infer<typeof insertCaregiverSchema>;
export type UpdateCaregiver = z.infer<typeof updateCaregiverSchema>;
export type Caregiver = typeof caregivers.$inferSelect;

export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id),
  positionInterested: text("position_interested"),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  backgroundScreeningConsent: text("background_screening_consent").notNull(),
  certificationType: text("certification_type"),
  drivingStatus: text("driving_status"),
  availability: jsonb("availability").$type<string[]>().default([]),
  startDate: text("start_date"),
  yearsExperience: integer("years_experience"),
  specialSkills: jsonb("special_skills").$type<string[]>().default([]),
  resumeUrl: text("resume_url"),
  coverLetter: text("cover_letter"),
  motivation: text("motivation"),
  adaptability: text("adaptability"),
  conflictHandling: text("conflict_handling"),
  safetyAchievement: text("safety_achievement"),
  experienceTypes: text("experience_types"),
  consent: text("consent"),
  agreedToTerms: text("agreed_to_terms").notNull().default("no"),
  agreedToPolicy: text("agreed_to_policy").notNull().default("no"),
  agreementTimestamp: timestamp("agreement_timestamp"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  status: true,
  agreementTimestamp: true,
  createdAt: true,
}).extend({
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
  backgroundScreeningConsent: z.enum(["Yes", "No"], { required_error: "Background screening consent is required" }),
  availability: z.array(z.string()).default([]),
  specialSkills: z.array(z.string()).default([]),
  agreedToTerms: z.enum(["yes", "no"], { required_error: "You must agree to the Terms of Service" }),
  agreedToPolicy: z.enum(["yes", "no"], { required_error: "You must agree to the Privacy Policy" }),
  captchaToken: z.string().min(1),
});

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

export const intakeForms = pgTable("intake_forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  dateOfBirth: text("date_of_birth"),
  caseRecordNo: text("case_record_no"),
  formData: jsonb("form_data").$type<{
    // Section AA: Identification
    sectionAA?: {
      socialSecurityNo?: string;
      healthInsuranceNo?: string;
    };
    // Section BB: Personal Items
    sectionBB?: {
      gender?: string;
      raceEthnicity?: string[];
      maritalStatus?: string;
      primaryLanguage?: string;
      education?: string;
      hasLegalGuardian?: string;
      hasAdvancedDirectives?: string;
    };
    // Section CC: Referral Items
    sectionCC?: {
      dateOpened?: string;
      reasonForReferral?: string;
      goalsOfCare?: string[];
      timeSinceHospital?: string;
      whereLivedAtReferral?: string;
      whoLivedWith?: string;
      priorNHPlacement?: string;
      movedWithinTwoYears?: string;
    };
    // Section A: Assessment Information
    sectionA?: {
      assessmentDate?: string;
      assessmentType?: string;
    };
    // Section B: Cognitive Patterns
    sectionB?: {
      shortTermMemory?: string;
      proceduralMemory?: string;
      decisionMaking?: string;
      decisionMakingWorsening?: string;
      deliriumOnset?: string;
      agitatedDisoriented?: string;
    };
    // Section C: Communication/Hearing
    sectionC?: {
      hearing?: string;
      makingSelfUnderstood?: string;
      abilityToUnderstand?: string;
      communicationDecline?: string;
    };
    // Section D: Vision
    sectionD?: {
      vision?: string;
      visualLimitations?: string;
      visionDecline?: string;
    };
    // Section E: Mood & Behavior
    sectionE?: {
      moodIndicators?: { [key: string]: string };
      moodDecline?: string;
      behavioralSymptoms?: { [key: string]: string };
      behaviorialChange?: string;
    };
    // Section F: Social Functioning
    sectionF?: {
      atEaseInteracting?: string;
      expressesConflict?: string;
      socialActivitiesChange?: string;
      timeAlone?: string;
      feelsLonely?: string;
    };
    // Section G: Informal Support
    sectionG?: {
      primaryHelper?: any;
      secondaryHelper?: any;
      caregiverStatus?: string[];
      informalHelpHours?: { weekdays?: number; weekend?: number };
    };
    // Section H: Physical Functioning
    sectionH?: {
      iadl?: { [key: string]: { performance: string; difficulty: string } };
      adl?: { [key: string]: { performance: string; support: string } };
    };
    // Legacy fields for backward compatibility
    administrativeInfo?: any;
    emergencyContacts?: any;
    functionalSupport?: any;
    healthInfo?: any;
    preferences?: any;
    authorization?: any;
  }>().notNull(),
  agreedToTerms: text("agreed_to_terms").notNull().default("no"),
  agreedToPolicy: text("agreed_to_policy").notNull().default("no"),
  agreementTimestamp: timestamp("agreement_timestamp"),
  status: text("status").notNull().default("pending"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertIntakeFormSchema = createInsertSchema(intakeForms).omit({
  id: true,
  status: true,
  agreementTimestamp: true,
  reviewedAt: true,
  reviewedBy: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  clientPhone: z.string().trim().min(1, "Client phone number is required"),
  clientEmail: z.string().trim().email("Valid client email is required"),
  agreedToTerms: z.enum(["yes", "no"], { required_error: "You must agree to the Terms of Service" }),
  agreedToPolicy: z.enum(["yes", "no"], { required_error: "You must agree to the Privacy Policy" }),
  captchaToken: z.string().min(1),
  formData: z.object({
    consent: z.any().optional(),
    personalInfo: z.any().optional(),
    medicalHistory: z.any().optional(),
    functionalIndependence: z.any().optional(),
    livingSituation: z.any().optional(),
    // Legacy fields for backward compatibility
    administrativeInfo: z.any().optional(),
    emergencyContacts: z.any().optional(),
    functionalSupport: z.any().optional(),
    healthInfo: z.any().optional(),
    preferences: z.any().optional(),
    authorization: z.any().optional(),
  }).passthrough(),
});

export const updateIntakeFormSchema = createInsertSchema(intakeForms).omit({
  id: true,
  createdAt: true,
}).extend({
  clientPhone: z.string().trim().min(1, "Client phone number is required").optional(),
  clientEmail: z.string().trim().email("Valid client email is required").optional(),
}).partial();

export type InsertIntakeForm = z.infer<typeof insertIntakeFormSchema>;
export type UpdateIntakeForm = z.infer<typeof updateIntakeFormSchema>;
export type IntakeForm = typeof intakeForms.$inferSelect;

export const caregiverLogs = pgTable("caregiver_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  caregiverName: text("caregiver_name").notNull(),
  caregiverEmail: text("caregiver_email").notNull(),
  caregiverPhone: text("caregiver_phone").notNull(),
  clientName: text("client_name").notNull(),
  shiftDate: text("shift_date").notNull(),
  shiftStartTime: text("shift_start_time").notNull(),
  shiftEndTime: text("shift_end_time"),
  logData: jsonb("log_data").$type<{
    clientDetails?: any;
    adlChecklist?: any;
    medicationSafety?: any;
    iadlEngagement?: any;
    narrativeObservations?: any;
  }>().notNull(),
  agreedToTerms: text("agreed_to_terms").notNull().default("no"),
  agreedToPolicy: text("agreed_to_policy").notNull().default("no"),
  agreementTimestamp: timestamp("agreement_timestamp"),
  status: text("status").notNull().default("submitted"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCaregiverLogSchema = createInsertSchema(caregiverLogs).omit({
  id: true,
  status: true,
  agreementTimestamp: true,
  reviewedAt: true,
  reviewedBy: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  caregiverEmail: z.string().trim().email("Valid caregiver email is required"),
  caregiverPhone: z.string().trim().min(1, "Caregiver phone number is required"),
  agreedToTerms: z.enum(["yes", "no"], { required_error: "You must agree to the Terms of Service" }),
  agreedToPolicy: z.enum(["yes", "no"], { required_error: "You must agree to the Privacy Policy" }),
  captchaToken: z.string().min(1),
  logData: z.object({
    clientDetails: z.any().optional(),
    adlChecklist: z.any().optional(),
    medicationSafety: z.any().optional(),
    iadlEngagement: z.any().optional(),
    narrativeObservations: z.any().optional(),
  }),
});

export const updateCaregiverLogSchema = createInsertSchema(caregiverLogs).omit({
  id: true,
  createdAt: true,
}).extend({
  caregiverEmail: z.string().trim().email("Valid caregiver email is required").optional(),
  caregiverPhone: z.string().trim().min(1, "Caregiver phone number is required").optional(),
}).partial();

export type InsertCaregiverLog = z.infer<typeof insertCaregiverLogSchema>;
export type UpdateCaregiverLog = z.infer<typeof updateCaregiverLogSchema>;
export type CaregiverLog = typeof caregiverLogs.$inferSelect;

export const hipaaAcknowledgments = pgTable("hipaa_acknowledgments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientFullName: text("client_full_name").notNull(),
  clientDateOfBirth: text("client_date_of_birth").notNull(),
  acknowledgedReceipt: text("acknowledged_receipt").notNull().default("no"),
  consentedToTPO: text("consented_to_tpo").notNull().default("no"),
  signature: text("signature").notNull(),
  signatureDate: text("signature_date").notNull(),
  printedName: text("printed_name").notNull(),
  relationshipToClient: text("relationship_to_client"),
  clientRefused: text("client_refused").default("no"),
  refusalDate: text("refusal_date"),
  refusalTime: text("refusal_time"),
  staffName: text("staff_name"),
  staffSignature: text("staff_signature"),
  refusalReason: text("refusal_reason"),
  agreedToTerms: text("agreed_to_terms").notNull().default("no"),
  agreedToPolicy: text("agreed_to_policy").notNull().default("no"),
  agreementTimestamp: timestamp("agreement_timestamp"),
  status: text("status").notNull().default("submitted"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHipaaAcknowledgmentSchema = createInsertSchema(hipaaAcknowledgments).omit({
  id: true,
  status: true,
  agreementTimestamp: true,
  reviewedAt: true,
  reviewedBy: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  clientFullName: z.string().trim().min(1, "Client full name is required"),
  clientDateOfBirth: z.string().trim().min(1, "Date of birth is required"),
  acknowledgedReceipt: z.enum(["yes", "no"], { required_error: "Acknowledgment is required" }),
  consentedToTPO: z.enum(["yes", "no"], { required_error: "Consent is required" }),
  signature: z.string().trim().min(1, "Signature is required"),
  signatureDate: z.string().trim().min(1, "Signature date is required"),
  printedName: z.string().trim().min(1, "Printed name is required"),
  relationshipToClient: z.string().trim().optional(),
  agreedToTerms: z.enum(["yes", "no"], { required_error: "You must agree to the Terms of Service" }),
  agreedToPolicy: z.enum(["yes", "no"], { required_error: "You must agree to the Privacy Policy" }),
  captchaToken: z.string().min(1),
});

export const updateHipaaAcknowledgmentSchema = createInsertSchema(hipaaAcknowledgments).omit({
  id: true,
  createdAt: true,
}).partial();

export type InsertHipaaAcknowledgment = z.infer<typeof insertHipaaAcknowledgmentSchema>;
export type UpdateHipaaAcknowledgment = z.infer<typeof updateHipaaAcknowledgmentSchema>;
export type HipaaAcknowledgment = typeof hipaaAcknowledgments.$inferSelect;

export const leadMagnets = pgTable("lead_magnets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  name: text("name"),
  resourceId: text("resource_id").notNull(), // e.g., 'family-guide', 'cost-guide'
  resourceTitle: text("resource_title").notNull(),
  source: text("source"), // e.g., 'article-cta', 'resources-page', 'homepage'
  agreedToTerms: text("agreed_to_terms").notNull().default("no"),
  agreedToPolicy: text("agreed_to_policy").notNull().default("no"),
  agreementTimestamp: timestamp("agreement_timestamp"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadMagnetSchema = createInsertSchema(leadMagnets).omit({
  id: true,
  agreementTimestamp: true,
  createdAt: true,
}).extend({
  email: z.string().trim().email("Valid email is required"),
  resourceId: z.string().min(1, "Resource ID is required"),
  resourceTitle: z.string().min(1, "Resource title is required"),
  agreedToTerms: z.enum(["yes", "no"], { required_error: "You must agree to the Terms of Service" }),
  agreedToPolicy: z.enum(["yes", "no"], { required_error: "You must agree to the Privacy Policy" }),
  captchaToken: z.string().min(1),
});

export type InsertLeadMagnet = z.infer<typeof insertLeadMagnetSchema>;
export type LeadMagnet = typeof leadMagnets.$inferSelect;

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Referrer Information
  referrerName: text("referrer_name").notNull(),
  referrerEmail: text("referrer_email").notNull(),
  referrerPhone: text("referrer_phone").notNull(),
  relationshipToReferred: text("relationship_to_referred").notNull(),
  // Referred Person Information
  referredName: text("referred_name").notNull(),
  referredPhone: text("referred_phone").notNull(),
  referredEmail: text("referred_email"),
  referredLocation: text("referred_location").notNull(),
  primaryNeedForCare: text("primary_need_for_care").notNull(),
  additionalInfo: text("additional_info"),
  // Honeypot field
  website: text("website"),
  // Agreement fields
  agreedToTerms: text("agreed_to_terms").notNull().default("no"),
  agreedToPolicy: text("agreed_to_policy").notNull().default("no"),
  agreementTimestamp: timestamp("agreement_timestamp"),
  // Compliance acknowledgments
  consentToContact: text("consent_to_contact").notNull().default("no"),
  acknowledgedCreditTerms: text("acknowledged_credit_terms").notNull().default("no"),
  acknowledgedComplianceTerms: text("acknowledged_compliance_terms").notNull().default("no"),
  // Status tracking
  status: text("status").notNull().default("pending"), // pending, contacted, converted, credited, declined
  trackingCode: text("tracking_code"),
  hoursCompleted: text("hours_completed").default("0"),
  creditIssued: text("credit_issued").default("no"),
  creditIssuedDate: timestamp("credit_issued_date"),
  notes: text("notes"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  status: true,
  trackingCode: true,
  hoursCompleted: true,
  creditIssued: true,
  creditIssuedDate: true,
  agreementTimestamp: true,
  reviewedAt: true,
  reviewedBy: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  referrerName: z.string().trim().min(1, "Your name is required"),
  referrerEmail: z.string().trim().email("Valid email is required"),
  referrerPhone: z.string().trim().min(1, "Your phone number is required"),
  relationshipToReferred: z.string().trim().min(1, "Relationship is required"),
  referredName: z.string().trim().min(1, "Referred person's name is required"),
  referredPhone: z.string().trim().min(1, "Referred person's phone is required"),
  referredLocation: z.string().trim().min(1, "Location is required"),
  primaryNeedForCare: z.string().trim().min(1, "Primary need for care is required"),
  agreedToTerms: z.enum(["yes", "no"], { required_error: "You must agree to the Terms of Service" }),
  agreedToPolicy: z.enum(["yes", "no"], { required_error: "You must agree to the Privacy Policy" }),
  consentToContact: z.enum(["yes", "no"], { required_error: "You must consent to us contacting the referred person" }),
  acknowledgedCreditTerms: z.enum(["yes", "no"], { required_error: "You must acknowledge the credit terms" }),
  acknowledgedComplianceTerms: z.enum(["yes", "no"], { required_error: "You must acknowledge compliance terms" }),
  captchaToken: z.string().min(1),
});

export const updateReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
}).partial();

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type UpdateReferral = z.infer<typeof updateReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// ============================================
// Massachusetts Care Directory Schema
// ============================================

// Care types enum - services offered by PrivateInHomeCareGiver
export const careTypeEnum = [
  "personal-care",
  "companionship", 
  "homemaking",
  "dementia-care",
  "respite-care",
  "live-in-care",
  "post-hospital-care"
] as const;
export type CareType = typeof careTypeEnum[number];

// Care type display names
export const careTypeDisplayNames: Record<CareType, string> = {
  "personal-care": "Personal Care",
  "companionship": "Companionship Care",
  "homemaking": "Homemaking Services",
  "dementia-care": "Dementia & Memory Care",
  "respite-care": "Respite Care",
  "live-in-care": "Live-In Care",
  "post-hospital-care": "Post-Hospital Care"
};

// Massachusetts locations (cities/towns)
export const maLocations = pgTable("ma_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  county: text("county").notNull(),
  region: text("region"),
  zipCodes: jsonb("zip_codes").$type<string[]>().default([]),
  population: integer("population"),
  isCity: text("is_city").notNull().default("no"),
  isActive: text("is_active").notNull().default("yes"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMaLocationSchema = createInsertSchema(maLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  zipCodes: z.array(z.string()).default([]),
});

export const updateMaLocationSchema = insertMaLocationSchema.partial();

export type InsertMaLocation = z.infer<typeof insertMaLocationSchema>;
export type UpdateMaLocation = z.infer<typeof updateMaLocationSchema>;
export type MaLocation = typeof maLocations.$inferSelect;

// Care type pages (content for each location + care type combination)
export const careTypePages = pgTable("care_type_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull().references(() => maLocations.id),
  careType: text("care_type").notNull(), // home-care, memory-care, assisted-living, nursing-homes
  slug: text("slug").notNull().unique(), // e.g., "home-care-boston-ma"
  
  // SEO fields
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: jsonb("keywords").$type<string[]>().default([]),
  
  // Content sections
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  overviewContent: text("overview_content"),
  whyChooseUsContent: text("why_choose_us_content"),
  servicesHighlights: jsonb("services_highlights").$type<string[]>().default([]),
  
  // Additional content
  localInfo: text("local_info"),
  ctaPhone: text("cta_phone"),
  ctaFormEnabled: text("cta_form_enabled").notNull().default("yes"),
  
  // Status
  status: text("status").notNull().default("draft"), // draft, published
  publishedAt: timestamp("published_at"),
  
  // AI content tracking
  aiGenerated: text("ai_generated").notNull().default("no"),
  aiGeneratedAt: timestamp("ai_generated_at"),
  lastEditedBy: text("last_edited_by"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCareTypePageSchema = createInsertSchema(careTypePages).omit({
  id: true,
  publishedAt: true,
  aiGeneratedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  keywords: z.array(z.string()).default([]),
  servicesHighlights: z.array(z.string()).default([]),
  careType: z.enum(careTypeEnum),
});

export const updateCareTypePageSchema = insertCareTypePageSchema.partial();

export type InsertCareTypePage = z.infer<typeof insertCareTypePageSchema>;
export type UpdateCareTypePage = z.infer<typeof updateCareTypePageSchema>;
export type CareTypePage = typeof careTypePages.$inferSelect;

// Location FAQs
export const locationFaqs = pgTable("location_faqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  careTypePageId: varchar("care_type_page_id").notNull().references(() => careTypePages.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: text("is_active").notNull().default("yes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLocationFaqSchema = createInsertSchema(locationFaqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLocationFaqSchema = insertLocationFaqSchema.partial();

export type InsertLocationFaq = z.infer<typeof insertLocationFaqSchema>;
export type UpdateLocationFaq = z.infer<typeof updateLocationFaqSchema>;
export type LocationFaq = typeof locationFaqs.$inferSelect;

// Location reviews/testimonials
export const locationReviews = pgTable("location_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  careTypePageId: varchar("care_type_page_id").notNull().references(() => careTypePages.id),
  reviewerName: text("reviewer_name").notNull(),
  reviewerLocation: text("reviewer_location"),
  rating: integer("rating").notNull().default(5), // 1-5 stars
  reviewText: text("review_text").notNull(),
  reviewDate: text("review_date"),
  isVerified: text("is_verified").notNull().default("no"),
  isActive: text("is_active").notNull().default("yes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLocationReviewSchema = createInsertSchema(locationReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLocationReviewSchema = insertLocationReviewSchema.partial();

export type InsertLocationReview = z.infer<typeof insertLocationReviewSchema>;
export type UpdateLocationReview = z.infer<typeof updateLocationReviewSchema>;
export type LocationReview = typeof locationReviews.$inferSelect;

// Service types for filtering
export const serviceTypes = pgTable("service_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  category: text("category").notNull(), // care-type, service, administrative
  isActive: text("is_active").notNull().default("yes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceTypeSchema = createInsertSchema(serviceTypes).omit({
  id: true,
  createdAt: true,
});

export type InsertServiceType = z.infer<typeof insertServiceTypeSchema>;
export type ServiceType = typeof serviceTypes.$inferSelect;

// Location services mapping (which services are available at each location)
export const locationServices = pgTable("location_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  careTypePageId: varchar("care_type_page_id").notNull().references(() => careTypePages.id),
  serviceTypeId: varchar("service_type_id").notNull().references(() => serviceTypes.id),
  isAvailable: text("is_available").notNull().default("yes"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLocationServiceSchema = createInsertSchema(locationServices).omit({
  id: true,
  createdAt: true,
});

export type InsertLocationService = z.infer<typeof insertLocationServiceSchema>;
export type LocationService = typeof locationServices.$inferSelect;

// ============================================
// Videos and Podcasts Schema
// ============================================

// Video categories for organization
export const videoCategoryEnum = [
  "care-tips",
  "caregiver-training",
  "family-support",
  "health-conditions",
  "massachusetts-resources",
  "testimonials",
  "company-news"
] as const;
export type VideoCategory = typeof videoCategoryEnum[number];

// Podcast categories for organization
export const podcastCategoryEnum = [
  "caregiver-stories",
  "expert-interviews",
  "family-conversations",
  "health-topics",
  "massachusetts-care",
  "tips-and-advice"
] as const;
export type PodcastCategory = typeof podcastCategoryEnum[number];

// Videos table
export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  category: text("category").notNull().default("care-tips"),
  
  // Video source - can be upload or embed (YouTube, Vimeo)
  videoType: text("video_type").notNull().default("upload"), // upload, youtube, vimeo
  videoUrl: text("video_url"), // For uploaded videos
  embedUrl: text("embed_url"), // For embedded videos (YouTube, Vimeo)
  thumbnailUrl: text("thumbnail_url"),
  
  // Duration in seconds
  duration: integer("duration"),
  
  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: jsonb("keywords").$type<string[]>().default([]),
  
  // Organization
  featured: text("featured").notNull().default("no"),
  sortOrder: integer("sort_order").notNull().default(0),
  
  // Status
  status: text("status").notNull().default("draft"), // draft, published
  publishedAt: timestamp("published_at"),
  
  // Tracking
  viewCount: integer("view_count").notNull().default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  viewCount: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  keywords: z.array(z.string()).default([]),
  slug: z.string().optional(),
  category: z.enum(videoCategoryEnum).default("care-tips"),
  videoType: z.enum(["upload", "youtube", "vimeo"]).default("upload"),
});

export const updateVideoSchema = insertVideoSchema.partial();

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type UpdateVideo = z.infer<typeof updateVideoSchema>;
export type Video = typeof videos.$inferSelect;

// Podcasts table
export const podcasts = pgTable("podcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  category: text("category").notNull().default("tips-and-advice"),
  
  // Audio source - can be upload or embed (Spotify, Apple, etc)
  audioType: text("audio_type").notNull().default("upload"), // upload, spotify, apple, anchor
  audioUrl: text("audio_url"), // For uploaded audio files
  embedUrl: text("embed_url"), // For embedded podcasts
  thumbnailUrl: text("thumbnail_url"),
  
  // Episode info
  episodeNumber: integer("episode_number"),
  seasonNumber: integer("season_number"),
  
  // Duration in seconds
  duration: integer("duration"),
  
  // Show notes / transcript
  showNotes: text("show_notes"),
  transcript: text("transcript"),
  
  // Guest/host info
  hostName: text("host_name"),
  guestName: text("guest_name"),
  guestTitle: text("guest_title"),
  
  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: jsonb("keywords").$type<string[]>().default([]),
  
  // Organization
  featured: text("featured").notNull().default("no"),
  sortOrder: integer("sort_order").notNull().default(0),
  
  // Status
  status: text("status").notNull().default("draft"), // draft, published
  publishedAt: timestamp("published_at"),
  
  // Tracking
  playCount: integer("play_count").notNull().default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPodcastSchema = createInsertSchema(podcasts).omit({
  id: true,
  playCount: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  keywords: z.array(z.string()).default([]),
  slug: z.string().optional(),
  category: z.enum(podcastCategoryEnum).default("tips-and-advice"),
  audioType: z.enum(["upload", "spotify", "apple", "anchor"]).default("upload"),
});

export const updatePodcastSchema = insertPodcastSchema.partial();

export type InsertPodcast = z.infer<typeof insertPodcastSchema>;
export type UpdatePodcast = z.infer<typeof updatePodcastSchema>;
export type Podcast = typeof podcasts.$inferSelect;

// Facility types enum
export const facilityTypeEnum = [
  "nursing-home",
  "assisted-living",
  "memory-care",
  "independent-living",
  "continuing-care",
  "hospice",
] as const;

// Facilities table for senior care facility directory
export const facilities = pgTable("facilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  facilityType: text("facility_type").notNull(), // nursing-home, assisted-living, memory-care, independent-living
  
  // Location info
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull().default("MA"),
  zipCode: text("zip_code"),
  county: text("county"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  
  // Contact info
  phone: text("phone"),
  website: text("website"),
  email: text("email"),
  
  // Description and details
  description: text("description"),
  shortDescription: text("short_description"),
  
  // Capacity and beds
  totalBeds: integer("total_beds"),
  certifiedBeds: integer("certified_beds"),
  
  // Images
  heroImageUrl: text("hero_image_url"),
  galleryImages: jsonb("gallery_images").$type<string[]>().default([]),
  
  // Services and amenities (stored as JSON arrays)
  services: jsonb("services").$type<string[]>().default([]),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  specializations: jsonb("specializations").$type<string[]>().default([]),
  
  // Pricing
  priceRangeMin: integer("price_range_min"),
  priceRangeMax: integer("price_range_max"),
  pricingNotes: text("pricing_notes"),
  
  // Ratings and reviews
  overallRating: text("overall_rating"), // stored as string for decimal like "4.5"
  reviewCount: integer("review_count").notNull().default(0),
  
  // Medicare/Medicaid info
  acceptsMedicare: text("accepts_medicare").default("unknown"),
  acceptsMedicaid: text("accepts_medicaid").default("unknown"),
  
  // Certifications and licensing
  licensedBy: text("licensed_by"),
  licenseNumber: text("license_number"),
  certifications: jsonb("certifications").$type<string[]>().default([]),
  
  // Quality metrics
  healthInspectionRating: text("health_inspection_rating"),
  staffingRating: text("staffing_rating"),
  qualityRating: text("quality_rating"),
  
  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: jsonb("keywords").$type<string[]>().default([]),
  
  // Organization
  featured: text("featured").notNull().default("no"),
  sortOrder: integer("sort_order").notNull().default(0),
  
  // Status
  status: text("status").notNull().default("draft"), // draft, published
  publishedAt: timestamp("published_at"),
  
  // Source tracking (for imported data)
  dataSource: text("data_source"), // e.g., "massgis", "medicare", "manual"
  externalId: text("external_id"), // ID from external data source
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFacilitySchema = createInsertSchema(facilities).omit({
  id: true,
  reviewCount: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  facilityType: z.enum(facilityTypeEnum),
  services: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  specializations: z.array(z.string()).default([]),
  galleryImages: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  slug: z.string().optional(),
  acceptsMedicare: z.enum(["yes", "no", "unknown"]).default("unknown"),
  acceptsMedicaid: z.enum(["yes", "no", "unknown"]).default("unknown"),
});

export const updateFacilitySchema = insertFacilitySchema.partial();

export type InsertFacility = z.infer<typeof insertFacilitySchema>;
export type UpdateFacility = z.infer<typeof updateFacilitySchema>;
export type Facility = typeof facilities.$inferSelect;

// Facility reviews table
export const facilityReviews = pgTable("facility_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityId: varchar("facility_id").notNull().references(() => facilities.id, { onDelete: "cascade" }),
  
  // Reviewer info
  reviewerName: text("reviewer_name").notNull(),
  reviewerRelation: text("reviewer_relation"), // e.g., "family member", "resident", "visitor"
  
  // Rating (1-5 scale)
  rating: integer("rating").notNull(),
  
  // Review content
  title: text("title"),
  content: text("content").notNull(),
  
  // Date of experience
  visitDate: timestamp("visit_date"),
  
  // Moderation
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFacilityReviewSchema = createInsertSchema(facilityReviews).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  rating: z.number().min(1).max(5),
});

export const updateFacilityReviewSchema = insertFacilityReviewSchema.partial();

export type InsertFacilityReview = z.infer<typeof insertFacilityReviewSchema>;
export type UpdateFacilityReview = z.infer<typeof updateFacilityReviewSchema>;
export type FacilityReview = typeof facilityReviews.$inferSelect;

// ==========================================
// Quiz Lead Generation System
// ==========================================

export const quizCategoryEnum = ["service", "facility"] as const;
export const quizQuestionTypeEnum = ["single_choice", "multiple_choice", "scale", "text"] as const;
export const quizLeadStatusEnum = ["new", "contacted", "qualified", "converted", "closed"] as const;

// Quiz definitions - metadata for each quiz
export const quizDefinitions = pgTable("quiz_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  category: text("category").notNull(), // "service" or "facility"
  targetType: text("target_type").notNull(), // e.g., "personal-care", "nursing-home"
  heroImageUrl: text("hero_image_url"),
  
  // Lead magnet content
  resultTitle: text("result_title"),
  resultDescription: text("result_description"),
  ctaText: text("cta_text").default("Get Your Free Care Assessment"),
  ctaUrl: text("cta_url"),
  
  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  
  // Status
  status: text("status").notNull().default("draft"), // draft, published
  sortOrder: integer("sort_order").notNull().default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuizDefinitionSchema = createInsertSchema(quizDefinitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  category: z.enum(quizCategoryEnum),
  slug: z.string().optional(),
});

export const updateQuizDefinitionSchema = insertQuizDefinitionSchema.partial();

export type InsertQuizDefinition = z.infer<typeof insertQuizDefinitionSchema>;
export type UpdateQuizDefinition = z.infer<typeof updateQuizDefinitionSchema>;
export type QuizDefinition = typeof quizDefinitions.$inferSelect;

// Quiz questions - individual questions for each quiz
export const quizQuestions = pgTable("quiz_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => quizDefinitions.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull().default("single_choice"), // single_choice, multiple_choice, scale, text
  helpText: text("help_text"),
  options: jsonb("options").$type<{ value: string; label: string; score?: number }[]>().default([]),
  isRequired: text("is_required").notNull().default("yes"),
  displayOrder: integer("display_order").notNull().default(0),
  
  // Scoring weight for lead scoring
  scoreWeight: integer("score_weight").notNull().default(1),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  questionType: z.enum(quizQuestionTypeEnum).default("single_choice"),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
    score: z.number().optional(),
  })).default([]),
});

export const updateQuizQuestionSchema = insertQuizQuestionSchema.partial();

export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type UpdateQuizQuestion = z.infer<typeof updateQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;

// Quiz leads - captured leads from quiz submissions
export const quizLeads = pgTable("quiz_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizId: varchar("quiz_id").notNull().references(() => quizDefinitions.id),
  
  // Contact info (name and email required, phone optional)
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  
  // Lead scoring
  leadScore: integer("lead_score").notNull().default(0),
  urgencyLevel: text("urgency_level"), // low, medium, high, immediate
  
  // Source tracking
  sourcePage: text("source_page"), // URL where quiz was taken
  referrer: text("referrer"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  
  // Status and follow-up
  status: text("status").notNull().default("new"), // new, contacted, qualified, converted, closed
  assignedTo: text("assigned_to"),
  notes: text("notes"),
  
  // Additional context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // Email notification tracking
  emailSent: text("email_sent").notNull().default("no"),
  emailSentAt: timestamp("email_sent_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuizLeadSchema = createInsertSchema(quizLeads).omit({
  id: true,
  leadScore: true,
  status: true,
  emailSent: true,
  emailSentAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
});

export const updateQuizLeadSchema = createInsertSchema(quizLeads).omit({
  id: true,
  createdAt: true,
}).partial();

export type InsertQuizLead = z.infer<typeof insertQuizLeadSchema>;
export type UpdateQuizLead = z.infer<typeof updateQuizLeadSchema>;
export type QuizLead = typeof quizLeads.$inferSelect;

// Quiz responses - individual answers for each lead
export const quizResponses = pgTable("quiz_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => quizLeads.id, { onDelete: "cascade" }),
  questionId: varchar("question_id").notNull().references(() => quizQuestions.id, { onDelete: "cascade" }),
  
  // Answer data
  answerValue: text("answer_value"), // For single choice / scale
  answerValues: jsonb("answer_values").$type<string[]>().default([]), // For multiple choice
  answerText: text("answer_text"), // For text responses
  
  // Score contribution
  scoreContribution: integer("score_contribution").notNull().default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuizResponseSchema = createInsertSchema(quizResponses).omit({
  id: true,
  createdAt: true,
}).extend({
  answerValues: z.array(z.string()).default([]),
});

export type InsertQuizResponse = z.infer<typeof insertQuizResponseSchema>;
export type QuizResponse = typeof quizResponses.$inferSelect;

// Extended type for quiz with questions
export type QuizWithQuestions = QuizDefinition & {
  questions: QuizQuestion[];
};

// Extended type for lead with responses
export type QuizLeadWithResponses = QuizLead & {
  quiz: QuizDefinition;
  responses: (QuizResponse & { question: QuizQuestion })[];
};
