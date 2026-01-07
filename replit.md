# PrivateInHomeCareGiver - Massachusetts In-Home Care Platform

## Overview

PrivateInHomeCareGiver is a healthcare service platform connecting Massachusetts families with Personal Care Assistants (PCAs) for in-home care services, including personal care, companionship, homemaking, and dementia support. The platform features a public-facing website for service discovery, caregiver job listings, educational articles, and a comprehensive admin portal. The vision is to be a leading provider of trusted in-home care services across Massachusetts.

**Status**: Production-ready with enterprise-grade security and complete Digital Ocean deployment guides.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX & Frontend

-   **Framework**: React with TypeScript, Vite, Wouter for routing.
-   **Design**: Single-page application (SPA) using shadcn/ui (Radix UI + Tailwind CSS) with a focus on trust, warmth, and accessibility. Mobile-first responsive design.
-   **State Management**: TanStack Query for server state.
-   **Key Features**: Public homepage, articles, consultation page with CAPTCHA, services page, admin dashboard, Google reCAPTCHA, form validation with `react-hook-form` and Zod, floating action buttons (green "Get in touch" and red "Find a job").
-   **Navigation**: Header with purple "Contact Us" button, navigation links include About, Services, Locations (links to Communities section), Articles, Find Caregivers, and Careers. Mobile menu includes all navigation links.
-   **SEO**: Comprehensive SEO with database-driven metadata, dynamic sitemap generation, `robots.txt`, enhanced 404 page, canonical URLs, structured data (JSON-LD including SiteNavigationElement for Google search sitelinks, Article schema, FAQPage schema), Open Graph tags, Twitter Card support, Massachusetts geo targeting (geo.region, geo.placename, geo.position, ICBM meta tags), and custom favicon with MA location keywords. Performance optimized with resource hints.
-   **PWA**: Progressive Web App support with service worker for offline capabilities and secure caching.
-   **Massachusetts Care Directory**: Comprehensive location directory at `/care-directory` with 65+ MA municipalities, search/filter by region/county, dynamic city pages at `/care-directory/:slug` with HomeHealthCareService structured data, BreadcrumbList schema, real zip codes/county data, and stock images. Admin CMS for location management with full CRUD operations.
-   **Care Type Location Pages**: SEO-optimized pages following A Place for Mom URL structure:
    -   State-level pages: `/{care-type}/massachusetts` (e.g., `/personal-care/massachusetts`)
    -   City-level pages: `/{care-type}/massachusetts/{city}-ma` (e.g., `/personal-care/massachusetts/boston-ma`)
    -   7 care types: personal-care, companionship, homemaking, dementia-care, respite-care, live-in-care, post-hospital-care
    -   Full structured data (HomeHealthCareService, Service, BreadcrumbList, FAQPage schemas)
    -   Massachusetts geo-targeting meta tags
    -   Services, FAQs, reviews, and CTAs on each page
    -   Graceful fallback content when no database entry exists
-   **Careers Page**: Enhanced "Join Our Team" experience with benefits, role comparison, requirements, and multiple CTAs to the application system.
-   **Branding**: "Communities We Serve" section (previously "Areas We Serve"), emphasis on local community engagement.
-   **Caregiver Resources Hub**: Comprehensive resource center at `/caregiver-resources` modeled after A Place for Mom:
    -   6 resource categories: Signs for Care, Making Decisions, Costs & Payment, Finding Care, Health Conditions, Caregiver Self-Care
    -   Quick links grid for navigation to key pages
    -   Featured articles section
    -   Links to Videos and Podcasts pages
    -   Topic cards for Health & Medical, Legal & Financial, Safety & Home
-   **Videos Page**: Video gallery at `/videos` with:
    -   7 categories: care-tips, caregiver-training, family-support, health-conditions, massachusetts-resources, testimonials, company-news
    -   Support for upload, YouTube, and Vimeo embeds
    -   Category filtering, featured videos, view counts
    -   Responsive grid layout with video cards
-   **Podcasts Page**: Podcast listing at `/podcasts` with:
    -   6 categories: caregiver-stories, expert-interviews, family-conversations, health-topics, massachusetts-care, tips-and-advice
    -   Support for upload, Spotify, Apple Podcasts, and Anchor embeds
    -   Episode numbers, guest information, play counts
    -   Featured episodes section

### Backend

-   **Server**: Express.js with Node.js and TypeScript.
-   **API**: RESTful API for public inquiries and admin CRUD operations (jobs, articles, inquiries, applications, referrals, page metadata).
-   **Data Layer**: Drizzle ORM for PostgreSQL (currently using in-memory `MemStorage` due to Replit network restrictions, `DbStorage` ready for Supabase). Zod schemas for validation.
-   **Database Schema**: Includes `Users`, `RecoveryCodes`, `Jobs`, `Articles`, `ArticleFaqs` (for article-specific FAQs), `Inquiries`, `PageMetadata`, `Caregivers`, `JobApplications`, `LeadMagnets`, `IntakeForm` for health care plan assessment, directory tables (`MaLocations`, `DirectoryPages`, `LocationFaqs`, `LocationReviews`) for the Massachusetts Care Directory, care type tables (`CareTypePages`, `LocationFaqs`, `LocationReviews`) for care-type specific location pages, and media tables (`Videos`, `Podcasts`) for educational content management.
-   **Caregiver Resources**: Comprehensive article library with 52 SEO-optimized articles covering:
    -   Care Guides: Complete guides to in-home care, home care vs home health care, choosing agencies
    -   Dementia Care: Alzheimer's care, dementia stages, memory care strategies, sundowning
    -   Caregiver Support: Burnout prevention, self-care, family dynamics, support networks
    -   Safety: Fall prevention, home safety checklists, emergency planning
    -   Financial Planning: Paying for care, MassHealth, veterans benefits, long-term care insurance
    -   Legal Planning: Power of attorney, healthcare proxy, advance directives
    -   Health & Wellness: Nutrition, medication management, chronic disease care
    -   Types of Care: Companion care, respite care, live-in care, post-hospital care
    -   Massachusetts Resources: PCA program, local ASAPs, state-specific programs
    -   Each article includes 2-4 FAQs for FAQ schema markup, meta descriptions, and keywords
    -   Seed endpoint: `POST /api/seed/articles` (with `?force=true` to reseed)
-   **Security**: Multi-layered architecture including `bcrypt` for password hashing, `express-session` with PostgreSQL-backed session store in production (MemoryStore in development), `helmet` for security headers (CSP, X-Frame-Options etc.), API hardening (SQL injection, XSS prevention, rate limiting), anti-spam measures (honeypot, disposable email blocking, server-side CAPTCHA), IP-based geo-blocking, DOMPurify for HTML sanitization, and comprehensive audit logging. Admin login requires reCAPTCHA when `RECAPTCHA_SECRET_KEY` is configured; skips CAPTCHA in development environments for testing. SSN field removed from applications for compliance. Cookie settings: secure (HTTPS-only in production), httpOnly, sameSite='lax' for compatibility with Digital Ocean deployments.
-   **Content Management**: Draft/published status for articles and jobs, Rich Text Editor (TipTap) for content.
-   **Lead Magnet System**: Email capture for downloadable resources with security measures.
-   **Job Application System**: Dual-pathway (job-specific and general) 4-step process with behavioral screening, background screening consent, and EOE statement.
-   **Consultation System**: Dedicated CAPTCHA-protected form.
-   **Health Care Plan Assessment**: Comprehensive intake form at `/intake` matching healthcare plan assessment standards.
-   **Privacy Policy**: Comprehensive dual-purpose HIPAA NPP and consumer Privacy Policy at `/privacy-policy`.
-   **Email Notifications**: Automated notifications via Resend API for consultation inquiries, job applications, and client referrals sent to `info@privateinhomecaregiver.com` (or configured HR_EMAIL). Notifications include complete form data and direct links to admin dashboard.
-   **Admin Dashboard**: Comprehensive management interface with two navigation patterns:
    -   Legacy tabs-based interface at `/admin` for Jobs, Articles, Page Metadata, Caregivers, Intake Forms, and HIPAA Acknowledgments
    -   New sidebar-based interface for dedicated pages: Inquiries (`/admin/inquiries`), Applications (`/admin/applications`), and Referrals (`/admin/referrals`)
    -   Features: KPI statistics cards, filterable data tables, detailed modals for each submission, status tracking, incentive management for referrals
    -   Mobile-responsive with collapsible sidebar navigation

### Key Architectural Decisions

-   **Monorepo**: Shared types and schemas between client and server for end-to-end type safety.
-   **Schema Validation**: Single source of truth using Drizzle schemas with Zod validators.
-   **Slug Generation**: Automatic and manual URL-friendly slug creation.
-   **Content Workflow**: Draft/published states for content.
-   **Performance**: Lazy loading for route components, code splitting, optimized font loading.
-   **Supabase Integration**: `DbStorage` fully implemented for Supabase PostgreSQL, awaiting Replit network connectivity. Critical RLS implementation required for Supabase.

## External Dependencies

-   **Third-Party Services**: Google reCAPTCHA v2, Supabase (PostgreSQL), Resend (email delivery), Google Fonts CDN.
-   **UI Libraries**: Radix UI, shadcn/ui, Lucide React.
-   **Development Tools**: Drizzle Kit, esbuild.
-   **Session Management**: `express-session`.
-   **Rich Text Editor**: TipTap.
-   **Sanitization**: DOMPurify.
-   **File Upload**: Multer.

## Deployment Guides

-   **Digital Ocean Deployment**: Complete step-by-step guide in `DIGITAL_OCEAN_DEPLOYMENT.md` with critical steps for:
    -   Switching from MemStorage to DbStorage before deployment
    -   Running database migrations (`npm run db:push`)
    -   Creating admin user via `/api/auth/seed-admin` endpoint
    -   Configuring environment variables (see `.env.example`)
-   **Production Readiness**: Security checklist and compliance guide in `PRODUCTION_READINESS.md`
-   **Quick Summary**: See `DEPLOYMENT_SUMMARY.md` for overview and next steps
-   **Security Implementation**: Database RLS in `server/enable-rls.sql`, API hardening in `server/api-hardening.ts`
-   **Environment Configuration**: `.env.example` documents all required and optional environment variables for Digital Ocean deployment