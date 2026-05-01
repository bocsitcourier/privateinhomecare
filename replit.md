# PrivateInHomeCareGiver - Massachusetts In-Home Care Platform

## Overview

PrivateInHomeCareGiver is a healthcare service platform connecting Massachusetts families with Personal Care Assistants (PCAs) for in-home care services like personal care, companionship, homemaking, and dementia support. The platform features a public-facing website for service discovery, caregiver job listings, and educational content, alongside a comprehensive admin portal. The project aims to become a leading provider of trusted in-home care services across Massachusetts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX & Frontend

The frontend is a React with TypeScript single-page application built with Vite and Wouter for routing. It uses shadcn/ui (Radix UI + Tailwind CSS) for a design focused on trust, warmth, accessibility, and mobile-first responsiveness. TanStack Query manages state. Key features include a public homepage, articles, consultation forms with CAPTCHA, dynamic service and location pages, and an extensive admin dashboard.

The platform has advanced SEO and GEO features, including database-driven metadata, dynamic sitemap generation, structured data (JSON-LD for multiple schemas), Open Graph tags, Twitter Cards, and Massachusetts geo-targeting. It also supports Progressive Web App (PWA) capabilities and integrates an `/llms.txt` file for AI system context and `robots.txt` for AI crawler directives, allowing major AI bots.

Specific implementations include:
- A comprehensive Massachusetts Care Directory covering 65+ municipalities with search/filter.
- SEO-optimized care type location pages (e.g., `/personal-care/massachusetts/boston-ma`).
- An enhanced careers page and a Caregiver Resources Hub (articles, videos, podcasts).
- Educational "Care Options" landing pages (e.g., `/nursing-homes/massachusetts`).
- A statewide senior care Facility Directory (7 facility types, 796+ facilities across 14 counties) with search, filtering, and reviews.
- A dedicated Hospital Directory (`/find-hospital`) with 60 Massachusetts hospitals.
- A Quiz Lead Generation System with 12 interactive assessment quizzes for lead capture.
- Senior Concierge Services and Non-Medical Transportation pages with city-specific sub-pages and full SEO/GEO optimization.

### Backend

The backend uses Express.js, Node.js, and TypeScript, providing a RESTful API. Drizzle ORM is used with PostgreSQL (Supabase in production). Zod schemas ensure validation.

The database schema includes tables for users, jobs, articles, inquiries, page metadata, caregivers, job applications, lead magnets, intake forms, and directory data (locations, pages, FAQs, reviews, facilities, care types, media). A `facilityFaqs` table stores personalized FAQs for each of the 796 facilities, manageable via dedicated API endpoints and an admin interface.

A Smart Facility Data Synchronization system uses MD5 hashing to detect changes in Google Places data, flagging facilities that need content regeneration. It tracks business status (operational, closed) and updates facility names and other details from Google Places. Admin APIs provide statistics on data freshness and allow manual enrichment.

Google Places enrichment coverage (as of May 2026): 713/796 hero images (89.6%), 782/796 phones (98.2%), 762/796 websites (95.7%). The remaining 83 without images are hospice/mobile services with no Google Maps photos. Two enrichment functions exist: `enrichFacility` (text search) and `enrichFacilityByPlaceId` (direct place ID lookup, more accurate). Admin endpoint: `POST /api/admin/enrich-missing-data`. Script: `scripts/enrich-missing.ts`.

SEO Redirect System: A legacy redirect middleware in `server/routes.ts` (bottom of file, before `httpServer`) issues 301 redirects for URLs left over from when this domain was used for a courier/trucking company. Redirects cover: `/Courier`, `/Trucking`, `/Logistics`, `/SameDay`, `/Medical`, `/Route`, `/Track`, `/blog/*`, `/Term/*`, `/Companies`, `/Applicationform`, 12 old quiz slugs, and URL aliases (`/terms`, `/privacy`, `/terms-of-service`). Article 404s set HTTP 404 status before calling `next()` — works in production (`serveStatic` preserves status), but dev Vite overrides it with 200.

Security measures include `bcrypt` for password hashing, `express-session` with a PostgreSQL store, `helmet` for security headers, API hardening, anti-spam (honeypot, disposable email blocking, server-side CAPTCHA), IP-based geo-blocking, DOMPurify for HTML sanitization, and audit logging. Admin login uses reCAPTCHA.

HIPAA Technical Safeguards are implemented:
- **Automatic Logoff**: 15-minute inactivity timeout with a warning component.
- **Audit Controls**: Enhanced middleware for structured logging of PHI access and actions.
- **Transmission Security**: TLS 1.3 enforced, HTTPS-only, security headers.
- **Access Control**: reCAPTCHA v2 on 7 PHI form endpoints, session-based authentication for admin.
- **PHI Field-Level Encryption Utility**: AES-256-GCM utility for future PHI field encryption.

Content management supports draft/published states and uses TipTap. The platform includes a lead magnet system, a 4-step job application process, a consultation system, and a health care plan assessment intake form. A dual-purpose HIPAA NPP and consumer Privacy Policy is implemented. Automated email notifications are configured via Resend API. The Admin Dashboard offers comprehensive management with KPIs and filterable data.

### Key Architectural Decisions

-   **Monorepo Structure**: Shared types and schemas between client and server for end-to-end type safety.
-   **Schema Validation**: Drizzle schemas with Zod are the single source of truth for data validation.
-   **Content Workflow**: Draft/published states for content items.
-   **Performance Optimization**: Lazy loading, code splitting, optimized font loading.
-   **Supabase Integration**: `DbStorage` implemented for Supabase PostgreSQL, with Row Level Security (RLS) planned.
-   **Facility Photo Storage**: 707 facility hero photos stored locally and served via `express.static`. A proxy endpoint handles fallback for expired Google Places references.

## Podcast Audio (Gemini TTS)

Each podcast episode can have audio generated on demand via Google Gemini TTS (`gemini-2.5-flash-preview-tts`). The system uses multi-speaker voices: Sarah = Kore (warm female), Michael = Charon (clear male). Generation is async — triggered by `POST /api/podcasts/:slug/audio/generate`, polled via `GET /api/podcasts/:slug/audio/status`, and served via `GET /api/podcasts/:slug/audio`. WAV files are cached to `attached_assets/podcasts/`. Full episodes (~51 lines) take roughly 60–90 seconds to generate in 3 chunked API calls. The frontend in `podcast-detail.tsx` handles the full lifecycle with an elapsed timer and polling.

## External Dependencies

-   **Third-Party Services**: Google reCAPTCHA v2, Supabase (PostgreSQL), Resend (email delivery), Google Fonts CDN, Google Gemini TTS API (podcast audio).
-   **UI Libraries**: Radix UI, shadcn/ui, Lucide React.
-   **Development Tools**: Drizzle Kit, esbuild.
-   **Session Management**: `express-session`.
-   **Rich Text Editor**: TipTap.
-   **Sanitization**: DOMPurify.
-   **File Upload**: Multer.