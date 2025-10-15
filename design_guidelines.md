# Design Guidelines: PrivateInHomeCare

## Design Approach
**Reference-Based Approach** - Healthcare & Service Platform
Drawing inspiration from Care.com, HealthCare.gov, and Modern Healthcare platforms with emphasis on trust, accessibility, and warmth. The design must balance professionalism with emotional connection, as families are making critical care decisions.

## Core Design Principles
1. **Trust Through Transparency**: Clean layouts, readable typography, authentic imagery
2. **Warmth & Compassion**: Soft color palette, rounded elements, human-centered content
3. **Accessibility First**: High contrast, clear CTAs, mobile-optimized for seniors and family caregivers
4. **Local Authority**: Emphasize Massachusetts presence throughout

## Color Palette

### Light Mode
- **Primary Purple**: 270 70% 55% (main brand color - trustworthy, caring)
- **Secondary Pink**: 330 80% 60% (warmth, compassion)
- **Accent Teal**: 180 60% 45% (success states, trust badges)
- **Neutral Gray**: 220 10% 45% (body text)
- **Background**: 240 20% 98% (soft, welcoming)
- **Surface White**: 0 0% 100%
- **Warning Amber**: 35 90% 55% (CAPTCHA alerts, form validation)

### Dark Mode
- **Primary Purple**: 270 60% 65%
- **Secondary Pink**: 330 70% 70%
- **Accent Teal**: 180 50% 55%
- **Neutral Gray**: 220 15% 75%
- **Background**: 240 15% 12%
- **Surface**: 240 12% 16%

## Typography
**Google Fonts via CDN**
- **Headings**: Inter (700, 600) - modern, clean, trustworthy
- **Body**: Inter (400, 500) - excellent readability
- **Accent/Numbers**: Plus Jakarta Sans (600) - friendly, approachable for stats

### Type Scale
- Hero H1: text-4xl md:text-5xl lg:text-6xl
- Section H2: text-3xl md:text-4xl
- Component H3: text-2xl
- Card H4: text-xl
- Body: text-base
- Small: text-sm

## Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 8, 12, 16, 20
- Section padding: py-16 md:py-20 lg:py-24
- Container max-width: max-w-7xl
- Content max-width: max-w-5xl
- Form max-width: max-w-2xl
- Card spacing: p-6 md:p-8
- Gap spacing: gap-6 md:gap-8

## Component Library

### Navigation
- **Sticky header** with backdrop-blur-md, border-b
- Logo + business name on left
- Horizontal nav (hidden on mobile, hamburger menu)
- Prominent "Contact" and subtle "Admin" buttons
- Trust indicator: "Licensed & Insured in MA" badge

### Hero Section
- **Large hero image**: Authentic photo of caregiver with senior in home setting (bright, natural lighting, Massachusetts home interior)
- Gradient overlay: from-purple-900/60 to-transparent for text legibility
- H1 + supporting paragraph + dual CTAs (Find Care / Join Our Team)
- Trust indicators below fold: "500+ Families Served" | "Background-Checked PCAs" | "Available 24/7"

### Service Cards (3-4 column grid)
- Icon (emoji or icon font) at top
- Service title (H4)
- Brief description
- "Learn More" expandable section
- "Request This Service" CTA button (pre-fills contact form)
- Hover: subtle lift shadow, scale-102

### Reviews/Testimonials (3 column grid)
- Circular customer photo (authentic stock photos of diverse ages)
- 5-star rating (visual stars)
- Customer name + City, MA
- Quote in quotation marks
- Soft background card (bg-gray-50 in light, bg-surface in dark)

### Contact Form with CAPTCHA
- **2-column layout on desktop** (form left, contact info/map right)
- Fields: Name, Email, Phone, Service dropdown, Message
- **Google reCAPTCHA v2 checkbox** integrated above submit button
- Disabled submit state until CAPTCHA verified
- Success message: green checkmark, "We'll respond within 24 hours"
- Error states: red border, amber warning icon for CAPTCHA failures
- Supporting content: Office hours, phone number, response time promise

### Admin Login Modal with CAPTCHA
- Centered modal overlay (backdrop blur)
- Card with logo + "Admin Access"
- Password field (type=password)
- **reCAPTCHA v2 checkbox** above login button
- Clear error messages: "Invalid password" or "CAPTCHA verification required"
- Simple, secure design - no extra decoration

### Areas Served Section
- **Map visual**: Stylized Massachusetts map with pin markers for major cities
- Grid of city names (4-5 columns, alphabetical)
- Each city is a link/button (future expansion for city pages)
- Section header: "Serving Communities Across Massachusetts"

### Careers/Jobs Section
- Job cards with: Title, Type (Part-time/Overnight), Description, Pay rate
- "Apply Now" button (opens application form/modal)
- Benefits callout: "Flexible Scheduling | Competitive Pay | Training Provided"
- Grid layout: 2 columns on tablet, 1 on mobile

### Articles/Resources (if included)
- Card layout with thumbnail image, headline, summary, date, "Read More" link
- 2-3 column grid
- Categories: "Senior Care Tips" | "Family Resources" | "PCA Guides"

### Footer
- **4-column layout** (desktop): About | Services | Quick Links | Contact
- Newsletter signup with CAPTCHA protection
- Social media icons
- Trust badges: "BBB Accredited" | "Insured" | "Licensed in MA"
- Copyright + Privacy Policy + Terms

## Images

### Required Images:
1. **Hero Image**: Caregiver (30s-40s) assisting senior (70s+) in bright, modern Massachusetts home living room - warm, natural light, genuine smiles
2. **About Section**: Close-up of hands holding (intergenerational care) - emotional connection
3. **Service Cards**: Consider small illustrative icons instead of photos to maintain speed
4. **Reviews**: Diverse customer photos (stock or real testimonials) - ages 40-70, professional headshots
5. **Areas Map**: Custom illustrated Massachusetts map with highlighted service areas
6. **Careers Section**: PCA in professional setting, clipboard/medical supplies - convey professionalism
7. **Footer/Trust Section**: Certification badges, insurance logos (actual or placeholder)

## CAPTCHA Integration Design
- **Visual Treatment**: Use Google reCAPTCHA v2 "I'm not a robot" checkbox
- **Placement**: Directly above submit buttons, with 4-unit margin
- **Container**: Centered in form, with subtle border (border-gray-200)
- **Error States**: Red border around CAPTCHA + error text below in text-red-600
- **Loading States**: Disabled button with spinner during verification
- **Mobile**: Ensure CAPTCHA scales properly, test on small screens

## Accessibility & Dark Mode
- Maintain WCAG AA contrast ratios (4.5:1 text, 3:1 UI)
- All form inputs have visible labels and focus states
- CAPTCHA includes aria-labels for screen readers
- Dark mode: Softer purples/pinks, maintain contrast
- Form inputs in dark mode: bg-gray-800 with lighter borders

## Animations (Minimal)
- Smooth scroll for anchor links (scroll-behavior: smooth)
- Button hover: scale-105 + shadow-lg
- Card hover: subtle lift (translateY-1 + shadow-md)
- Modal open: fade-in (opacity transition)
- Form success: checkmark slide-in
- **No scroll-triggered animations** - maintain accessibility