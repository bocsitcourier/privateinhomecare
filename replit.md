# PrivateInHomeCareGiver - Massachusetts In-Home Care Platform

## Overview

PrivateInHomeCareGiver is a healthcare service platform designed to connect Massachusetts families with Personal Care Assistants (PCAs) for various in-home care services, including personal care, companionship, homemaking, and dementia support. The platform features a public-facing website for service discovery, caregiver job listings, and educational articles, complemented by a comprehensive admin portal. The project aims to establish itself as a leading provider of trusted in-home care services across Massachusetts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX & Frontend

The frontend is a React with TypeScript single-page application (SPA) utilizing Vite and Wouter for routing. Design is based on shadcn/ui (Radix UI + Tailwind CSS), emphasizing trust, warmth, accessibility, and mobile-first responsiveness. State management is handled by TanStack Query. Key features include a public homepage, articles, consultation forms with CAPTCHA, dynamic service and location pages, and a comprehensive admin dashboard.

The platform includes extensive SEO features such as database-driven metadata, dynamic sitemap generation, structured data (JSON-LD for various schemas), Open Graph tags, Twitter Cards, and Massachusetts geo-targeting. It supports Progressive Web App (PWA) capabilities.

Specific features include:
- A comprehensive Massachusetts Care Directory with 65+ municipalities, search/filter functionality, and dynamic city pages.
- SEO-optimized care type location pages (e.g., `/personal-care/massachusetts/boston-ma`) for 7 care types, complete with structured data and geo-targeting.
- An enhanced careers page for caregiver recruitment.
- A Caregiver Resources Hub with articles, videos, and podcasts, categorized for easy navigation.
- Educational "Care Options" landing pages (e.g., `/nursing-homes/massachusetts`) to guide families through different care types.
- A statewide senior care Facility Directory covering 7 facility types (nursing homes, assisted living, memory care, independent living, continuing care, hospice, hospitals) with 796+ facilities across all 14 Massachusetts counties, featuring search, filtering, reviews, and type-specific FAQs.
- A dedicated Hospital Directory (`/find-hospital`) with 60 Massachusetts hospitals, specialty filtering, and ER badge detection.
- A Quiz Lead Generation System with 12 interactive assessment quizzes for lead capture, scoring, and automated email notifications.

### Backend

The backend is built with Express.js, Node.js, and TypeScript, providing a RESTful API for public inquiries and admin CRUD operations. Data persistence uses Drizzle ORM for PostgreSQL (with `MemStorage` for development and `DbStorage` for production with Supabase). Zod schemas are used for validation.

The database schema includes tables for users, jobs, articles (with FAQs), inquiries, page metadata, caregivers, job applications, lead magnets, intake forms, directory data (locations, pages, FAQs, reviews), care type data, media (videos, podcasts), and facility FAQs. The `facilityFaqs` table stores personalized FAQs for each of the 796 facilities with categories including Location, Contact, Insurance, Capacity, Quality, Services, Amenities, Care, Admissions, Visits, Safety, and Emergency.

#### Facility FAQ System
- **Database Table**: `facilityFaqs` with fields: id, facilityId, question, answer, category, displayOrder, isActive, createdAt, updatedAt
- **Public API**: `GET /api/facilities/:slug/faqs` returns FAQs ordered by displayOrder
- **Admin API**: 
  - `POST /api/admin/facilities/:id/faqs` - Create FAQ with Zod validation
  - `PATCH /api/admin/facility-faqs/:id` - Update FAQ
  - `DELETE /api/admin/facility-faqs/:id` - Delete FAQ
- **Seed Endpoint**: `POST /api/seed/facility-faqs` generates 6-10 personalized FAQs per facility using actual facility data (name, location, services, ratings, insurance acceptance, bed capacity)
- **Frontend Display**: FAQs displayed in accordion format on facility detail pages using Radix UI
- **Admin Management**: FAQ management dialog in admin facilities page with add/edit/delete functionality

#### Smart Facility Data Synchronization
- **Change Detection**: Uses MD5 hashing (`dataHash` field) to detect when facility data has changed from Google Places
- **Regeneration Tracking**: `needsRegeneration` flag marks facilities needing content updates after data changes
- **Business Status**: Tracks Google Places `businessStatus` (OPERATIONAL, CLOSED_TEMPORARILY, CLOSED_PERMANENTLY)
- **Closure Detection**: `isClosed` flag automatically set to "yes" for permanently closed facilities
- **Data Freshness**: `lastEnrichedAt` timestamp tracks when facility was last synced with Google Places
- **Admin API**:
  - `GET /api/admin/facilities/stats` - Data freshness statistics (enriched count, stale data, closed facilities)
  - `GET /api/admin/facilities/needs-regeneration` - List facilities needing content updates
  - `POST /api/admin/facilities/:id/mark-regenerated` - Clear regeneration flag after updating content
  - `POST /api/admin/facilities/:id/enrich` - Refresh single facility from Google Places with smart change detection
- **Enrichment Logic**: Only updates database and marks for regeneration when data actually changes (hash comparison)
- **Frontend Features**: Data Freshness card in admin, closure badges, refresh buttons, "Needs Update" indicators

Security is multi-layered, incorporating `bcrypt` for password hashing, `express-session` with a PostgreSQL-backed store, `helmet` for security headers, API hardening against common vulnerabilities, anti-spam measures (honeypot, disposable email blocking, server-side CAPTCHA), IP-based geo-blocking, DOMPurify for HTML sanitization, and audit logging. Admin login supports reCAPTCHA. SSN fields have been removed for compliance.

#### HIPAA Technical Safeguards
The platform implements HIPAA Security Rule technical safeguards (§164.312):

- **Automatic Logoff (§164.312(a)(2)(iii))**: 15-minute inactivity timeout with rolling sessions. Session timeout warning component (`client/src/components/SessionTimeoutWarning.tsx`) displays non-dismissable dialog at 2 minutes before expiry, forcing user to either continue or logout. Session extend endpoint (`POST /api/session/extend`) resets rolling timeout on user activity.
- **Audit Controls (§164.312(b))**: Enhanced HIPAA audit middleware (`server/middleware/hipaa-audit.ts`) provides structured logging with PHI field detection, action classification (CREATE/READ/UPDATE/DELETE/EXPORT/LOGIN/LOGOUT), user attribution via session.userId, IP/user-agent tracking, and outcome logging (success/failure).
- **Transmission Security (§164.312(e)(1))**: TLS 1.3 enforced, HTTPS-only, helmet security headers configured in server/index.ts.
- **Access Control (§164.312(a)(1))**: reCAPTCHA v2 on all 7 PHI form endpoints (inquiries, intake, referrals, job applications, general apply, non-solicitation, initial-assessment), session-based authentication for admin portal.
- **PHI Field-Level Encryption Utility (§164.312(a)(2)(iv))**: Ready utility at `server/utils/phi-encryption.ts` using AES-256-GCM with scrypt key derivation. Integration into storage layer deferred pending data migration strategy for PHI fields (dateOfBirth, healthInsuranceNo, medicalHistory in intake forms).

**PHI Form Endpoints with reCAPTCHA**: All 7 endpoints validate captchaToken server-side before processing:
- POST /api/inquiries
- POST /api/intake
- POST /api/referrals
- POST /api/jobs/:id/apply
- POST /api/jobs/general-apply
- POST /api/forms/non-solicitation
- POST /api/forms/initial-assessment

**Documentation**: Comprehensive HIPAA deployment checklist at `docs/HIPAA_DEPLOYMENT_CHECKLIST.md`.

Content management supports draft/published states and uses TipTap for rich text editing. The platform includes a lead magnet system, a 4-step job application process, a dedicated consultation system, and a comprehensive health care plan assessment intake form. A dual-purpose HIPAA NPP and consumer Privacy Policy is implemented. Automated email notifications via Resend API are configured for inquiries, applications, and referrals.

The Admin Dashboard offers comprehensive management with KPI statistics, filterable data tables, detailed modals for submissions, and status tracking.

### Key Architectural Decisions

- **Monorepo Structure**: Enables shared types and schemas between client and server for end-to-end type safety.
- **Schema Validation**: Drizzle schemas with Zod validators serve as the single source of truth for data validation.
- **Content Workflow**: Implements draft/published states for content items.
- **Performance Optimization**: Includes lazy loading for route components, code splitting, and optimized font loading.
- **Supabase Integration**: `DbStorage` is fully implemented for Supabase PostgreSQL, pending network connectivity, with critical Row Level Security (RLS) implementation planned.

## External Dependencies

-   **Third-Party Services**: Google reCAPTCHA v2, Supabase (PostgreSQL), Resend (email delivery), Google Fonts CDN.
-   **UI Libraries**: Radix UI, shadcn/ui, Lucide React.
-   **Development Tools**: Drizzle Kit, esbuild.
-   **Session Management**: `express-session`.
-   **Rich Text Editor**: TipTap.
-   **Sanitization**: DOMPurify.
-   **File Upload**: Multer.