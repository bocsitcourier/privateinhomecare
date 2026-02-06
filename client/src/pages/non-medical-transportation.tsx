import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import {
  Car, Shield, Award, CheckCircle2, ArrowRight, Phone,
  Users, Clock, MapPin, Star, Sparkles, DollarSign,
  HelpCircle, Calendar, Stethoscope, ShoppingCart,
  Building, Heart, Accessibility, Navigation, Route,
  Timer, ThumbsUp, Briefcase, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import TransportationRequestForm from "@/components/TransportationRequestForm";

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

const TRANSPORTATION_SERVICES = [
  {
    icon: <Stethoscope className="w-8 h-8 text-primary" />,
    title: "Medical Appointment Transportation",
    description: "Safe, reliable transportation to doctor visits, specialists, therapy sessions, and routine checkups",
    details: ["Primary care physician visits", "Specialist appointments", "Physical therapy sessions", "Lab work and diagnostic tests", "Dental and vision appointments"]
  },
  {
    icon: <Building className="w-8 h-8 text-primary" />,
    title: "Dialysis & Treatment Transportation",
    description: "Scheduled recurring transportation for dialysis treatments, chemotherapy, and ongoing medical procedures",
    details: ["Dialysis center transportation (3x weekly)", "Chemotherapy and infusion therapy", "Radiation treatment appointments", "Wound care clinic visits", "Cardiac rehabilitation"]
  },
  {
    icon: <ShoppingCart className="w-8 h-8 text-primary" />,
    title: "Shopping & Errand Transportation",
    description: "Door-through-door assistance for grocery shopping, pharmacy visits, and essential errands",
    details: ["Grocery store trips", "Pharmacy prescription pickups", "Banking and post office", "Shopping mall visits", "Pet supply and grooming appointments"]
  },
  {
    icon: <Heart className="w-8 h-8 text-primary" />,
    title: "Social & Religious Transportation",
    description: "Maintaining connections with church, senior centers, family gatherings, and social activities",
    details: ["Church and religious services", "Senior center programs", "Family events and celebrations", "Friend visits", "Community activities"]
  },
  {
    icon: <Briefcase className="w-8 h-8 text-primary" />,
    title: "Personal Business Transportation",
    description: "Assistance getting to legal appointments, financial advisors, and other professional services",
    details: ["Attorney and legal appointments", "Financial advisor meetings", "Real estate appointments", "Government office visits", "Insurance meetings"]
  },
  {
    icon: <Star className="w-8 h-8 text-primary" />,
    title: "Recreational Transportation",
    description: "Helping seniors stay active with trips to restaurants, museums, parks, and entertainment venues",
    details: ["Restaurant and dining outings", "Museum and cultural events", "Parks and outdoor activities", "Movie theaters", "Special occasion outings"]
  },
];

const SERVICE_FEATURES = [
  {
    icon: <Accessibility className="w-8 h-8 text-primary" />,
    title: "Door-Through-Door Service",
    description: "Our drivers assist from inside your home to inside your destination - not just curb-to-curb"
  },
  {
    icon: <Car className="w-8 h-8 text-primary" />,
    title: "Wheelchair Accessible Vehicles",
    description: "Equipped vehicles for wheelchairs, walkers, and mobility devices at no extra charge"
  },
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Trained Companion Drivers",
    description: "Drivers trained in senior assistance, dementia awareness, and safety protocols"
  },
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: "Wait Time Included",
    description: "Drivers wait during appointments - no rushing, no separate pickup coordination"
  },
  {
    icon: <Timer className="w-8 h-8 text-primary" />,
    title: "On-Time Guarantee",
    description: "We understand medical appointments cannot wait - punctuality is our priority"
  },
  {
    icon: <ThumbsUp className="w-8 h-8 text-primary" />,
    title: "Same Driver Consistency",
    description: "Request the same driver for regular appointments - building trust and familiarity"
  }
];

const BENEFITS = [
  {
    icon: <Navigation className="w-8 h-8 text-primary" />,
    title: "All Massachusetts Coverage",
    description: "Service throughout all 14 counties including Boston, Cape Cod, Western MA, and everywhere in between"
  },
  {
    icon: <DollarSign className="w-8 h-8 text-primary" />,
    title: "Transparent Private Pay Rates",
    description: "Clear pricing with no hidden fees - know your costs upfront before every trip"
  },
  {
    icon: <Calendar className="w-8 h-8 text-primary" />,
    title: "Flexible Scheduling",
    description: "Same-day availability for urgent needs, plus advance booking for regular appointments"
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Family Communication",
    description: "Ride notifications, arrival confirmations, and updates keep families informed"
  }
];

const FAQS = [
  {
    question: "What is non-medical transportation for seniors and how is it different from medical transport?",
    answer: "Non-medical transportation (NEMT) for seniors provides safe, assisted transportation for medical appointments and daily activities without requiring medical licensing. Unlike ambulance or stretcher transport, our service is for ambulatory seniors or those using wheelchairs/walkers who don't require medical monitoring during transport. Our trained drivers provide door-through-door assistance, help with mobility devices, and wait during appointments. This private pay service is ideal for routine doctor visits, dialysis, shopping, and social activities throughout Massachusetts."
  },
  {
    question: "How much does private pay senior transportation cost in Massachusetts?",
    answer: "Private pay senior transportation in Massachusetts typically ranges from $35-$75 per one-way trip depending on distance, with round-trip rates offering savings. Wait time during appointments is included for trips up to 2 hours. We offer package discounts for recurring trips like dialysis (3x weekly) or regular medical appointments. Long-distance trips to Boston medical centers from outlying areas are quoted individually. Contact us for a personalized quote based on your pickup location and typical destinations in Boston, Cambridge, Worcester, or anywhere in Massachusetts."
  },
  {
    question: "Do your vehicles accommodate wheelchairs and mobility devices?",
    answer: "Yes! Our fleet includes wheelchair-accessible vehicles with ramps and secure tie-downs at no additional charge. We accommodate standard wheelchairs, electric wheelchairs, mobility scooters, walkers, canes, and rollators. Drivers are trained in proper wheelchair securement and transfer assistance. Simply let us know your mobility needs when scheduling so we can dispatch the appropriate vehicle for your Massachusetts senior transportation needs."
  },
  {
    question: "What is door-through-door service and why is it important for seniors?",
    answer: "Door-through-door service means our drivers assist seniors from inside their home, through their appointment, and back inside their home safely. This is different from curb-to-curb service where drivers wait at the curb. Our drivers help with stairs, carry personal items, navigate building entrances, and provide arm support as needed. For medical appointments, drivers escort seniors to the waiting room and remain on-site. This comprehensive assistance ensures safety and reduces fall risks for Massachusetts seniors."
  },
  {
    question: "Can the same driver take me to recurring appointments like dialysis?",
    answer: "Absolutely! Consistency is important for many seniors, especially those with dementia or anxiety about transportation. We prioritize assigning the same driver for recurring appointments like dialysis (typically 3x weekly), chemotherapy, physical therapy, or regular doctor visits. Your regular driver learns your preferences, pickup routines, and any special assistance needs. If your regular driver is unavailable, we fully brief the substitute on your specific requirements."
  },
  {
    question: "How far in advance should I book senior transportation in Massachusetts?",
    answer: "For the best availability and to secure your preferred driver, we recommend booking 48-72 hours in advance for routine appointments. However, we offer same-day booking for urgent medical appointments when available. For recurring appointments (dialysis, therapy, weekly doctor visits), we set up standing reservations so you don't need to call each time. Our Greater Boston, Worcester, and Springfield areas typically have excellent availability."
  },
  {
    question: "What areas of Massachusetts do you serve with senior transportation?",
    answer: "Private InHome CareGiver provides non-medical senior transportation throughout all of Massachusetts, including: Greater Boston (Boston, Cambridge, Brookline, Newton, Somerville, Quincy, Medford), MetroWest (Framingham, Natick, Wellesley, Needham), North Shore (Lynn, Salem, Beverly, Peabody), South Shore (Weymouth, Plymouth, Hingham, Brockton), Worcester County, Springfield and Western MA, Cape Cod and the Islands, and the Berkshires. We regularly transport seniors to Boston medical centers from all regions."
  },
  {
    question: "Will the driver wait during my medical appointment?",
    answer: "Yes, our standard service includes wait time during your appointment. For trips under 2 hours total (including travel and appointment), wait time is included in your quoted rate. For longer appointments like dialysis or surgical procedures, we discuss wait time options during booking. Drivers remain on-site or nearby and are ready when you finish. This eliminates the stress of coordinating separate pickup times and ensures you're never left waiting."
  },
  {
    question: "Are your drivers trained to assist seniors with special needs?",
    answer: "All Private InHome CareGiver drivers complete comprehensive training including: senior assistance techniques, dementia awareness and communication, safe wheelchair handling and securement, fall prevention and transfer assistance, patience and compassionate service, and CPR/First Aid certification. Drivers undergo thorough CORI background checks and driving record reviews. We match drivers with seniors based on needs, personality, and scheduling requirements."
  },
  {
    question: "Can family members ride along to appointments?",
    answer: "Yes, family members or caregivers are welcome to accompany seniors at no additional charge (vehicle capacity permitting). Many families appreciate having someone attend important medical appointments to help communicate with doctors. We also provide updates and arrival notifications to family members upon request. Our goal is supporting the entire family in caring for their loved one."
  },
  {
    question: "Is non-medical transportation covered by Medicare or insurance?",
    answer: "Non-medical transportation is generally not covered by Medicare Part A or Part B. However, some Medicare Advantage plans include transportation benefits - check with your plan. Medicaid/MassHealth covers medical transportation through PT-1 authorization, but our private pay service offers greater flexibility, door-through-door assistance, and no eligibility requirements. Some long-term care insurance policies cover transportation services - we provide documentation for reimbursement claims."
  },
  {
    question: "How do I schedule transportation to Boston hospitals from outside the city?",
    answer: "We regularly provide transportation to major Boston medical centers including Mass General, Brigham and Women's, Dana-Farber, Beth Israel, Boston Medical Center, and Boston Children's from across Massachusetts. For long-distance trips, call us with your pickup location, destination hospital, and appointment time. We quote a flat rate including wait time and return trip. Our drivers are familiar with Boston hospital parking, entrance locations, and navigation to make your visit as smooth as possible."
  }
];

export default function NonMedicalTransportationPage() {
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
    "name": "Non-Medical Senior Transportation Massachusetts",
    "description": "Private pay non-medical transportation for seniors in Massachusetts. Door-through-door service to medical appointments, dialysis, shopping, and social activities. Wheelchair accessible vehicles. Serving Boston, Cambridge, Worcester, and all MA cities.",
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
    "serviceType": "Non-Medical Transportation",
    "offers": {
      "@type": "Offer",
      "priceRange": "$35-$75/trip",
      "priceCurrency": "USD"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://privateinhomecaregiver.com" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://privateinhomecaregiver.com/services" },
      { "@type": "ListItem", "position": 3, "name": "Non-Medical Transportation", "item": "https://privateinhomecaregiver.com/non-medical-transportation/massachusetts" }
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Private InHome CareGiver - Senior Transportation",
    "description": "Private pay non-medical senior transportation throughout Massachusetts",
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
        <title>Non-Medical Transportation for Seniors Massachusetts | Private Pay Elderly Transport | Boston, Cambridge, Worcester</title>
        <meta name="description" content="Private pay non-medical transportation for seniors in Massachusetts. Door-through-door service to medical appointments, dialysis, shopping, and social activities. Wheelchair accessible. Serving Boston, Cambridge, Worcester, Newton, and all MA cities. Free quote." />
        <meta name="keywords" content="non-medical transportation Massachusetts, senior transport Boston, elderly transportation Cambridge, wheelchair accessible rides Worcester, dialysis transportation MA, medical appointment transport Newton, private pay senior rides Brookline, door-to-door elderly transport Quincy" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="Non-Medical Senior Transportation Massachusetts | Private InHome CareGiver" />
        <meta property="og:description" content="Private pay transportation for seniors throughout Massachusetts. Medical appointments, dialysis, shopping, and social activities. Door-through-door service. Serving Boston, Cambridge, Worcester & 60+ cities." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://privateinhomecaregiver.com/non-medical-transportation/massachusetts" />
        <meta property="og:image" content="https://privateinhomecaregiver.com/images/transportation-services-og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Non-medical senior transportation in Massachusetts - Wheelchair accessible door-through-door service" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="Private InHome CareGiver" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Non-Medical Senior Transportation Massachusetts | Private Pay" />
        <meta name="twitter:description" content="Private pay transportation for MA seniors. Medical appointments, dialysis, wheelchair accessible. Boston, Cambridge, Worcester & 60+ cities." />
        <meta name="twitter:image" content="https://privateinhomecaregiver.com/images/transportation-services-og.jpg" />
        <meta name="twitter:image:alt" content="Senior transportation Massachusetts - Wheelchair accessible rides" />

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
        <meta name="topic" content="Senior Transportation, Non-Medical Rides, Elder Care, Wheelchair Transport" />
        <meta name="summary" content="Private pay non-medical transportation for seniors in Massachusetts offering door-through-door service for medical appointments, dialysis, shopping, and social activities. Wheelchair accessible vehicles throughout Boston, Cambridge, Worcester and 60+ MA cities." />
        <meta name="abstract" content="Professional non-medical transportation for Massachusetts seniors including medical appointment rides, dialysis transport, shopping trips, and social activities. Private pay only with wheelchair accessible vehicles and trained companion drivers." />
        <meta name="classification" content="Healthcare Services, Senior Transportation, Non-Medical Rides" />
        <meta name="category" content="Senior Transportation" />
        <meta name="coverage" content="Massachusetts, United States" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="7 days" />
        <meta name="target" content="seniors, elderly, caregivers, family members, adult children" />

        <link rel="canonical" href="https://privateinhomecaregiver.com/non-medical-transportation/massachusetts" />
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
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=80&auto=format&fit=crop"
              alt="Non-medical transportation for seniors Massachusetts - Private pay elderly transport services in Boston, Cambridge, Worcester"
              title="Senior Transportation Services - Private InHome CareGiver Massachusetts"
              className="w-full h-full object-cover"
              data-testid="img-hero-transportation"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
            <div className="max-w-2xl animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
                <Car className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Private Pay Senior Transportation Throughout Massachusetts</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight" data-testid="heading-main">
                Non-Medical Transportation
              </h1>
              <p className="text-2xl md:text-3xl font-normal text-white/80 mb-6">
                Safe, Reliable Rides for Massachusetts Seniors
              </p>

              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-xl" data-testid="text-hero-description">
                Door-through-door transportation to medical appointments, dialysis, shopping,
                and social activities. Wheelchair accessible vehicles with trained, caring drivers.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/consultation">
                    <Phone className="w-5 h-5" />
                    Get Free Quote
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
              <Badge variant="secondary" className="mb-4">Private Pay Senior Transportation</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="heading-what-is">
                Comprehensive Non-Medical Transportation Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our private pay transportation service helps Massachusetts seniors maintain independence
                by providing safe, reliable rides to medical appointments, essential errands, and social
                activities. Unlike rideshare services, our trained drivers provide hands-on assistance
                from door to door.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRANSPORTATION_SERVICES.map((service, index) => (
                <Card key={index} className="hover-elevate h-full" data-testid={`card-transport-service-${index}`}>
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
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="heading-features">
                What Makes Our Senior Transportation Different
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                More than a ride - comprehensive assistance designed specifically for seniors
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SERVICE_FEATURES.map((feature, index) => (
                <div key={index} className="flex gap-4" data-testid={`feature-${index}`}>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
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
                Senior Transportation Near You in Massachusetts
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find private pay non-medical transportation for seniors in your Massachusetts city.
                Click on your location for local service details, pricing, and availability.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {MASSACHUSETTS_CITIES.map((city) => (
                <Link key={city.slug} href={`/non-medical-transportation/massachusetts/${city.slug}`}>
                  <Card className="hover-elevate cursor-pointer h-full" data-testid={`city-card-${city.slug}`}>
                    <CardContent className="p-4 text-center">
                      <Car className="w-5 h-5 text-primary mx-auto mb-2" />
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
                <Badge variant="secondary" className="mb-4">Transparent Private Pay Pricing</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6" data-testid="heading-pricing">
                  Clear, Upfront Transportation Rates
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Our private pay model means no insurance hassles, no eligibility requirements,
                  and flexible service when you need it. We quote transparent prices before every trip.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                    <Route className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Local Trips (Under 10 miles)</p>
                      <p className="text-muted-foreground">$35 - $50 one-way, includes wait time up to 1 hour</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                    <Navigation className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Regional Trips (10-30 miles)</p>
                      <p className="text-muted-foreground">$50 - $75 one-way, includes wait time up to 2 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                    <Calendar className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Recurring Trip Packages</p>
                      <p className="text-muted-foreground">10-15% discount for weekly dialysis, therapy, etc.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div id="request-form" className="mt-8 p-6 bg-primary/10 rounded-xl border-2 border-primary/20">
                <div className="text-center mb-6">
                  <Badge className="mb-3 bg-primary text-primary-foreground">Get Started Today</Badge>
                  <h3 className="text-2xl font-bold text-foreground">Request a Free Quote</h3>
                  <p className="text-muted-foreground mt-2">Fill out the form below and our transportation team will contact you within 24 hours</p>
                </div>
                <TransportationRequestForm />
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
                Senior Transportation FAQ
              </h2>
              <p className="text-lg text-muted-foreground">
                Answers to common questions about our private pay non-medical transportation in Massachusetts
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
              Ready to Schedule Senior Transportation?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Our caring, professional drivers are ready to help your loved one get where
              they need to go safely and comfortably. Book your first ride today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="gap-2" asChild>
                <a href="#request-form">
                  <Car className="w-5 h-5" />
                  Book Transportation
                </a>
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
