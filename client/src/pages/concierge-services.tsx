import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import {
  Heart, Shield, Award, CheckCircle2, ArrowRight, Phone,
  Users, Clock, Home, Star, Sparkles, MapPin, DollarSign,
  HelpCircle, Calendar, ShoppingCart, Utensils, Pill,
  FileText, Briefcase, Gift, Stethoscope, Car, Building,
  Coffee, Mail, ClipboardList, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import ConciergeRequestForm from "@/components/ConciergeRequestForm";

const MASSACHUSETTS_CITIES = [
  { name: "Boston", slug: "boston-ma", county: "Suffolk", population: "675,647" },
  { name: "Cambridge", slug: "cambridge-ma", county: "Middlesex", population: "118,403" },
  { name: "Worcester", slug: "worcester-ma", county: "Worcester", population: "206,518" },
  { name: "Newton", slug: "newton-ma", county: "Middlesex", population: "88,923" },
  { name: "Brookline", slug: "brookline-ma", county: "Norfolk", population: "63,191" },
  { name: "Quincy", slug: "quincy-ma", county: "Norfolk", population: "101,636" },
  { name: "Somerville", slug: "somerville-ma", county: "Middlesex", population: "81,360" },
  { name: "Springfield", slug: "springfield-ma", county: "Hampden", population: "155,929" },
  { name: "Lowell", slug: "lowell-ma", county: "Middlesex", population: "115,554" },
  { name: "Brockton", slug: "brockton-ma", county: "Plymouth", population: "105,643" },
  { name: "New Bedford", slug: "new-bedford-ma", county: "Bristol", population: "101,079" },
  { name: "Fall River", slug: "fall-river-ma", county: "Bristol", population: "94,000" },
  { name: "Lynn", slug: "lynn-ma", county: "Essex", population: "101,253" },
  { name: "Framingham", slug: "framingham-ma", county: "Middlesex", population: "72,362" },
  { name: "Waltham", slug: "waltham-ma", county: "Middlesex", population: "62,227" },
  { name: "Medford", slug: "medford-ma", county: "Middlesex", population: "59,449" },
  { name: "Malden", slug: "malden-ma", county: "Middlesex", population: "66,263" },
  { name: "Weymouth", slug: "weymouth-ma", county: "Norfolk", population: "57,746" },
  { name: "Plymouth", slug: "plymouth-ma", county: "Plymouth", population: "61,217" },
  { name: "Lexington", slug: "lexington-ma", county: "Middlesex", population: "34,454" },
  { name: "Wellesley", slug: "wellesley-ma", county: "Norfolk", population: "28,747" },
  { name: "Needham", slug: "needham-ma", county: "Norfolk", population: "31,388" },
  { name: "Natick", slug: "natick-ma", county: "Middlesex", population: "36,050" },
  { name: "Hingham", slug: "hingham-ma", county: "Plymouth", population: "24,601" },
];

const CONCIERGE_SERVICES = [
  {
    icon: <ShoppingCart className="w-8 h-8 text-primary" />,
    title: "Errand Running & Shopping",
    description: "Grocery shopping, pharmacy pickups, dry cleaning, post office visits, and other essential errands",
    details: ["Weekly grocery shopping assistance", "Prescription pickup and delivery", "Return items and exchanges", "Package shipping and receiving"]
  },
  {
    icon: <Calendar className="w-8 h-8 text-primary" />,
    title: "Appointment Coordination",
    description: "Scheduling and managing medical appointments, social engagements, and daily activities",
    details: ["Doctor's appointment scheduling", "Transportation coordination", "Appointment reminders", "Calendar management"]
  },
  {
    icon: <Utensils className="w-8 h-8 text-primary" />,
    title: "Meal Planning & Preparation",
    description: "Nutritious meal planning, grocery list creation, and light meal preparation support",
    details: ["Weekly meal planning", "Dietary restriction accommodation", "Grocery list preparation", "Light cooking assistance"]
  },
  {
    icon: <Pill className="w-8 h-8 text-primary" />,
    title: "Medication Management Support",
    description: "Organizing medications, setting up pill organizers, and providing medication reminders",
    details: ["Pill organizer setup", "Prescription refill reminders", "Medication schedule coordination", "Pharmacy liaison services"]
  },
  {
    icon: <FileText className="w-8 h-8 text-primary" />,
    title: "Bill Pay & Paperwork Assistance",
    description: "Help organizing bills, filing paperwork, and managing correspondence",
    details: ["Bill organization and tracking", "Mail sorting and management", "Document filing systems", "Correspondence assistance"]
  },
  {
    icon: <Gift className="w-8 h-8 text-primary" />,
    title: "Special Occasion Planning",
    description: "Birthday party planning, holiday preparation, gift shopping, and event coordination",
    details: ["Birthday and anniversary planning", "Holiday decoration and preparation", "Gift selection and wrapping", "Family event coordination"]
  },
  {
    icon: <Coffee className="w-8 h-8 text-primary" />,
    title: "Social Engagement Support",
    description: "Accompanying seniors to social events, religious services, and community activities",
    details: ["Church and religious service accompaniment", "Senior center visits", "Community event participation", "Social club activities"]
  },
  {
    icon: <Building className="w-8 h-8 text-primary" />,
    title: "Home Organization",
    description: "Decluttering, organizing closets, managing household inventory, and seasonal organization",
    details: ["Closet organization", "Seasonal wardrobe rotation", "Household inventory management", "Downsizing assistance"]
  },
];

const BENEFITS = [
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: "Flexible Scheduling",
    description: "Services available when you need them, from a few hours weekly to daily assistance"
  },
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Vetted Professionals",
    description: "All concierge staff are background-checked, bonded, and professionally trained"
  },
  {
    icon: <Award className="w-8 h-8 text-primary" />,
    title: "Local Massachusetts Expertise",
    description: "Familiar with local businesses, services, and community resources throughout Massachusetts"
  },
  {
    icon: <Heart className="w-8 h-8 text-primary" />,
    title: "Personalized Service",
    description: "Care plans tailored to individual preferences, routines, and lifestyle needs"
  },
  {
    icon: <DollarSign className="w-8 h-8 text-primary" />,
    title: "Transparent Private Pay Pricing",
    description: "Clear, competitive rates with no hidden fees - private pay for quality care"
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Family Peace of Mind",
    description: "Regular updates and communication keep families informed and connected"
  }
];

const FAQS = [
  {
    question: "What are senior concierge services and how do they differ from traditional home care?",
    answer: "Senior concierge services focus on non-medical lifestyle support that helps seniors maintain independence and quality of life. Unlike traditional personal care (bathing, dressing), concierge services handle errands, appointments, organization, and social engagement. Our Massachusetts concierge staff assist with tasks like grocery shopping, bill management, appointment coordination, and accompanying seniors to social events. This private pay service complements personal care and provides comprehensive support for aging in place."
  },
  {
    question: "How much do private pay concierge services cost in Massachusetts?",
    answer: "Private pay concierge services in Massachusetts typically range from $25-$40 per hour depending on the services needed and scheduling requirements. Many families find that bundling services (such as weekly shopping, bi-weekly organization, and monthly appointment coordination) provides better value. We offer customized packages starting at 4 hours per week. Contact us for a free consultation and personalized quote tailored to your specific needs in Boston, Cambridge, Worcester, or anywhere in Massachusetts."
  },
  {
    question: "Are your concierge staff background-checked and insured?",
    answer: "Absolutely. All Private InHome CareGiver concierge staff undergo comprehensive CORI background checks, reference verification, and skills assessments before serving Massachusetts families. Our staff are bonded, insured, and receive ongoing training in senior-specific services, privacy protection, and professional communication. We maintain strict quality standards to ensure your loved ones receive safe, reliable, and professional service."
  },
  {
    question: "Can concierge services help with technology assistance for seniors?",
    answer: "Yes! Our concierge services include technology support for seniors, including help with smartphones, tablets, video calling with family, email management, online shopping, and smart home device setup. We patiently guide seniors through technology use at their pace, helping them stay connected with family and access online services throughout Massachusetts."
  },
  {
    question: "Do you serve all areas of Massachusetts with concierge services?",
    answer: "Yes, Private InHome CareGiver provides senior concierge services throughout all 14 Massachusetts counties, including Greater Boston (Boston, Cambridge, Brookline, Newton, Somerville, Quincy), MetroWest (Framingham, Natick, Wellesley), Worcester County, the South Shore, North Shore, Cape Cod, and Western Massachusetts. We have local staff familiar with each region's businesses, healthcare facilities, and community resources."
  },
  {
    question: "How quickly can concierge services begin in Massachusetts?",
    answer: "Most concierge services can begin within 48-72 hours of your initial consultation. For urgent needs, we can often accommodate same-day or next-day service starts. We carefully match each client with a concierge professional based on personality, needs, location, and scheduling preferences to ensure a great fit from day one."
  },
  {
    question: "Can concierge services accompany seniors to medical appointments?",
    answer: "Yes, appointment accompaniment is one of our most requested services. Our concierge staff can drive seniors to medical appointments (see our non-medical transportation services), wait during appointments, take notes during doctor visits, help communicate with medical staff, and ensure prescriptions are filled afterward. This service is especially valuable for families who cannot take time off work for routine appointments."
  },
  {
    question: "What if we need to change or cancel scheduled concierge services?",
    answer: "We understand that schedules change. For regular scheduled services, we request 24-hour notice for changes or cancellations to avoid any charges. We maintain flexible scheduling policies and can accommodate most schedule adjustments. Our goal is to provide reliable, convenient service that fits your family's changing needs."
  },
  {
    question: "Do you provide concierge services for seniors living in assisted living or continuing care communities?",
    answer: "Yes! Many families hire our concierge services to supplement care at assisted living facilities, independent living communities, and continuing care retirement communities throughout Massachusetts. We provide personalized services like shopping for specific items, accompanying residents to off-site appointments, organizing personal belongings, and maintaining family connections - services that facility staff may not have time to provide individually."
  },
  {
    question: "How do concierge services support family caregivers?",
    answer: "Our concierge services provide essential respite for family caregivers by handling time-consuming errands and tasks. When our professional staff manages grocery shopping, appointment scheduling, bill organization, and other logistics, family caregivers can focus on quality time with their loved ones instead of endless tasks. This support reduces caregiver burnout and improves the overall caregiving experience for Massachusetts families."
  },
  {
    question: "Are concierge services covered by Medicare or insurance?",
    answer: "Concierge services are typically not covered by Medicare, Medicaid, or standard health insurance as they are considered non-medical lifestyle support. However, some long-term care insurance policies may cover these services. Our private pay model ensures consistent, high-quality service without insurance restrictions or limitations. We can provide documentation for long-term care insurance reimbursement claims."
  },
  {
    question: "Can the same concierge staff work with my loved one consistently?",
    answer: "Consistency is important for building trust and understanding preferences. We prioritize matching each client with a primary concierge professional who will handle most visits. Your regular concierge learns your loved one's preferences, routines, favorite stores, and specific needs. If backup is ever needed, we ensure the substitute is fully briefed on preferences and requirements."
  }
];

export default function ConciergeServicesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Senior Concierge Services Massachusetts",
    "description": "Premium private pay concierge services for seniors in Massachusetts. Errand running, appointment coordination, meal planning, medication management support, and lifestyle assistance throughout Greater Boston and all MA counties.",
    "provider": {
      "@type": "Organization",
      "name": "Private InHome Caregiver",
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "Massachusetts",
        "addressCountry": "US"
      },
      "telephone": "(617) 555-0123",
      "areaServed": {
        "@type": "State",
        "name": "Massachusetts"
      }
    },
    "serviceType": "Senior Concierge Services",
    "offers": {
      "@type": "Offer",
      "priceRange": "$25-$40/hour",
      "priceCurrency": "USD"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://privateinhomecaregiver.com" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://privateinhomecaregiver.com/services" },
      { "@type": "ListItem", "position": 3, "name": "Concierge Services", "item": "https://privateinhomecaregiver.com/concierge-services/massachusetts" }
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Private InHome CareGiver - Concierge Services",
    "description": "Private pay senior concierge services throughout Massachusetts",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Boston",
      "addressRegion": "MA",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "42.3601",
      "longitude": "-71.0589"
    },
    "areaServed": [
      { "@type": "City", "name": "Boston" },
      { "@type": "City", "name": "Cambridge" },
      { "@type": "City", "name": "Worcester" },
      { "@type": "City", "name": "Newton" },
      { "@type": "City", "name": "Brookline" },
      { "@type": "State", "name": "Massachusetts" }
    ],
    "priceRange": "$$"
  };

  return (
    <>
      <Helmet>
        <title>Senior Concierge Services Massachusetts | Private Pay Non-Medical Care | Boston, Cambridge, Worcester</title>
        <meta name="description" content="Premium private pay senior concierge services in Massachusetts. Errand running, appointment coordination, meal planning, medication management support, and lifestyle assistance for seniors in Boston, Cambridge, Worcester, Newton, and all MA cities. Professional, vetted staff. Free consultation." />
        <meta name="keywords" content="senior concierge services Massachusetts, private pay elderly errands Boston, non-medical senior care Cambridge, errand services for elderly Worcester, appointment accompaniment MA, senior lifestyle assistance Newton, private concierge care Brookline, elderly shopping assistance Quincy" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="Senior Concierge Services Massachusetts | Private InHome CareGiver" />
        <meta property="og:description" content="Premium private pay concierge services for seniors throughout Massachusetts. Errands, appointments, organization, and lifestyle support. Serving Boston, Cambridge, Worcester & 60+ cities." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://privateinhomecaregiver.com/concierge-services/massachusetts" />
        <meta property="og:image" content="https://privateinhomecaregiver.com/images/concierge-services-og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Senior concierge services in Massachusetts - Professional assistance for elderly errands, shopping, and appointments" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="Private InHome CareGiver" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Senior Concierge Services Massachusetts | Private Pay Care" />
        <meta name="twitter:description" content="Premium private pay concierge services for MA seniors. Errands, appointments, meal planning, medication management. Boston, Cambridge, Worcester & 60+ cities." />
        <meta name="twitter:image" content="https://privateinhomecaregiver.com/images/concierge-services-og.jpg" />
        <meta name="twitter:image:alt" content="Senior concierge services Massachusetts - Professional elderly assistance" />

        {/* Geo-targeting */}
        <meta name="geo.region" content="US-MA" />
        <meta name="geo.placename" content="Massachusetts" />
        <meta name="geo.position" content="42.3601;-71.0589" />
        <meta name="ICBM" content="42.3601, -71.0589" />

        {/* AI Search / GEO Optimization */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large" />
        <meta name="bingbot" content="index, follow" />
        <meta name="author" content="Private InHome CareGiver" />
        <meta name="publisher" content="Private InHome CareGiver" />
        <meta name="copyright" content="2025 Private InHome CareGiver" />
        <meta name="topic" content="Senior Care Services, Concierge Services, Elder Care, In-Home Care" />
        <meta name="summary" content="Private pay senior concierge services in Massachusetts offering errand running, appointment coordination, meal planning, medication management support, and lifestyle assistance for elderly throughout Boston, Cambridge, Worcester and 60+ MA cities." />
        <meta name="abstract" content="Professional non-medical concierge services for Massachusetts seniors including shopping assistance, appointment accompaniment, home organization, and daily living support. Private pay only with transparent pricing." />
        <meta name="classification" content="Healthcare Services, Senior Care, Concierge Services" />
        <meta name="category" content="Senior Care" />
        <meta name="coverage" content="Massachusetts, United States" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="7 days" />
        <meta name="target" content="seniors, elderly, caregivers, family members, adult children" />

        <link rel="canonical" href="https://privateinhomecaregiver.com/concierge-services/massachusetts" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      </Helmet>

      <Header />

      <main>
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80&auto=format&fit=crop"
              alt="Senior concierge services Massachusetts - Private pay non-medical care assistance for elderly in Boston, Cambridge, Worcester"
              title="Senior Concierge Services - Private InHome CareGiver Massachusetts"
              className="w-full h-full object-cover"
              data-testid="img-hero-concierge"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
            <div className="max-w-2xl animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Private Pay Concierge Services Throughout Massachusetts</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight" data-testid="heading-main">
                Senior Concierge Services
              </h1>
              <p className="text-2xl md:text-3xl font-normal text-white/80 mb-6">
                Non-Medical Lifestyle Support for Massachusetts Seniors
              </p>

              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-xl" data-testid="text-hero-description">
                Professional errand running, appointment coordination, meal planning, and lifestyle assistance
                to help your loved ones thrive independently at home throughout Massachusetts.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/consultation">
                    <Phone className="w-5 h-5" />
                    Free Consultation
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 gap-2" asChild>
                  <a href="tel:+16175550123">
                    <Phone className="w-5 h-5" />
                    (617) 555-0123
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">Private Pay Non-Medical Care</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="heading-what-is">
                What Are Senior Concierge Services?
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Senior concierge services provide professional, non-medical lifestyle support that helps
                Massachusetts seniors maintain independence, manage daily tasks, and enjoy a higher quality
                of life. Our private pay services complement traditional care by handling errands,
                appointments, organization, and social engagement.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CONCIERGE_SERVICES.map((service, index) => (
                <Card key={index} className="hover-elevate h-full" data-testid={`card-service-${index}`}>
                  <CardHeader>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      {service.icon}
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="heading-benefits">
                Why Choose Our Private Pay Concierge Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience premium, personalized service from Massachusetts's trusted senior care provider
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BENEFITS.map((benefit, index) => (
                <div key={index} className="flex gap-4" data-testid={`benefit-${index}`}>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">Serving All 14 Massachusetts Counties</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="heading-locations">
                Concierge Services Near You in Massachusetts
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find premium private pay concierge services for seniors in your Massachusetts city.
                Click on your location for local service details and availability.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {MASSACHUSETTS_CITIES.map((city) => (
                <Link key={city.slug} href={`/concierge-services/massachusetts/${city.slug}`}>
                  <Card className="hover-elevate cursor-pointer h-full" data-testid={`city-card-${city.slug}`}>
                    <CardContent className="p-4 text-center">
                      <MapPin className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="font-semibold text-foreground">{city.name}</p>
                      <p className="text-xs text-muted-foreground">{city.county} County</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">
                Don't see your city? We serve all Massachusetts communities including Cape Cod,
                Western MA, and the Islands.
              </p>
              <Button variant="outline" asChild>
                <Link href="/directory">
                  View Full Service Directory
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">Private Pay Pricing</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6" data-testid="heading-pricing">
                  Transparent Concierge Service Pricing
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Our private pay model ensures you receive consistent, high-quality service without
                  insurance restrictions. We offer competitive rates and flexible packages tailored
                  to your family's needs.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                    <DollarSign className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Hourly Rate</p>
                      <p className="text-muted-foreground">$25 - $40 per hour based on services</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                    <Calendar className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Minimum Booking</p>
                      <p className="text-muted-foreground">4 hours per week for regular service</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                    <ClipboardList className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Custom Packages</p>
                      <p className="text-muted-foreground">Bundled services available at discounted rates</p>
                    </div>
                  </div>
                </div>
              </div>

              <div id="request-form" className="mt-8 p-6 bg-primary/10 rounded-xl border-2 border-primary/20">
                <div className="text-center mb-6">
                  <Badge className="mb-3 bg-primary text-primary-foreground">Get Started Today</Badge>
                  <h3 className="text-2xl font-bold text-foreground">Request a Free Consultation</h3>
                  <p className="text-muted-foreground mt-2">Fill out the form below and our care team will contact you within 24 hours</p>
                </div>
                <ConciergeRequestForm />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <HelpCircle className="w-6 h-6 text-primary" />
                <Badge variant="secondary">Frequently Asked Questions</Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="heading-faq">
                Senior Concierge Services FAQ
              </h2>
              <p className="text-lg text-muted-foreground">
                Answers to common questions about our private pay concierge services in Massachusetts
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {FAQS.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border rounded-lg px-6"
                  data-testid={`faq-item-${index}`}
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Simplify Life for Your Loved One?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Our professional concierge team is ready to provide the personalized support
              your family deserves. Contact us today for a free consultation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="gap-2" asChild>
                <Link href="/consultation">
                  <Calendar className="w-5 h-5" />
                  Schedule Consultation
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 gap-2" asChild>
                <a href="tel:+16175550123">
                  <Phone className="w-5 h-5" />
                  (617) 555-0123
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
