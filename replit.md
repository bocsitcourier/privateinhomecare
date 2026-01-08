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
- A statewide senior care Facility Directory covering 6 facility types and 128+ facilities across all 14 Massachusetts counties, with search, filtering, and review capabilities.
- A dedicated Hospital Directory (`/find-hospital`) with 60 Massachusetts hospitals, specialty filtering, and ER badge detection.
- A Quiz Lead Generation System with 12 interactive assessment quizzes for lead capture, scoring, and automated email notifications.

### Backend

The backend is built with Express.js, Node.js, and TypeScript, providing a RESTful API for public inquiries and admin CRUD operations. Data persistence uses Drizzle ORM for PostgreSQL (with `MemStorage` for development and `DbStorage` for production with Supabase). Zod schemas are used for validation.

The database schema includes tables for users, jobs, articles (with FAQs), inquiries, page metadata, caregivers, job applications, lead magnets, intake forms, directory data (locations, pages, FAQs, reviews), care type data, and media (videos, podcasts).

Security is multi-layered, incorporating `bcrypt` for password hashing, `express-session` with a PostgreSQL-backed store, `helmet` for security headers, API hardening against common vulnerabilities, anti-spam measures (honeypot, disposable email blocking, server-side CAPTCHA), IP-based geo-blocking, DOMPurify for HTML sanitization, and audit logging. Admin login supports reCAPTCHA. SSN fields have been removed for compliance.

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