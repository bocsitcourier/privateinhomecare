import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { useMemo } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Phone, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Heart, 
  Home, 
  Users, 
  Clock,
  Shield,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import type { CareTypePage, MaLocation, LocationFaq, LocationReview } from "@shared/schema";
import { careTypeDisplayNames, careTypeEnum } from "@shared/schema";
import { getCareTypeImage } from "@/constants/careTypeMedia";

interface CareTypePageData {
  page: CareTypePage;
  location: MaLocation;
  faqs: LocationFaq[];
  reviews: LocationReview[];
}

const SERVICES_BY_CARE_TYPE: Record<string, { title: string; description: string; icon: any }[]> = {
  "personal-care": [
    { title: "Bathing & Grooming", description: "Assistance with daily hygiene, bathing, and personal grooming", icon: Heart },
    { title: "Dressing Assistance", description: "Help with selecting and putting on clothing", icon: Users },
    { title: "Mobility Support", description: "Safe transfers and walking assistance", icon: Shield },
    { title: "Medication Reminders", description: "Timely reminders to take prescribed medications", icon: Clock },
  ],
  "companionship": [
    { title: "Social Engagement", description: "Meaningful conversation and emotional support", icon: Heart },
    { title: "Activity Participation", description: "Games, hobbies, and recreational activities", icon: Users },
    { title: "Errands & Outings", description: "Accompaniment to appointments and social events", icon: MapPin },
    { title: "Family Communication", description: "Regular updates to keep family members informed", icon: Phone },
  ],
  "homemaking": [
    { title: "Light Housekeeping", description: "Vacuuming, dusting, and general tidying", icon: Home },
    { title: "Meal Preparation", description: "Nutritious meal planning and cooking", icon: Heart },
    { title: "Laundry Services", description: "Washing, folding, and organizing clothes", icon: Clock },
    { title: "Grocery Shopping", description: "Shopping for groceries and household essentials", icon: MapPin },
  ],
  "dementia-care": [
    { title: "Memory Support", description: "Specialized techniques for memory stimulation", icon: Heart },
    { title: "Safe Environment", description: "Creating a secure, confusion-free living space", icon: Shield },
    { title: "Behavioral Support", description: "Managing agitation and behavioral changes", icon: Users },
    { title: "Family Education", description: "Training families on dementia care best practices", icon: Clock },
  ],
  "respite-care": [
    { title: "Short-Term Relief", description: "Temporary care while family caregivers rest", icon: Clock },
    { title: "Flexible Scheduling", description: "Available for hours, days, or weeks as needed", icon: Heart },
    { title: "Comprehensive Care", description: "Full range of personal and companion care services", icon: Shield },
    { title: "Emergency Coverage", description: "Last-minute care when unexpected situations arise", icon: Phone },
  ],
  "live-in-care": [
    { title: "24/7 Presence", description: "Round-the-clock caregiver in the home", icon: Clock },
    { title: "Consistent Caregiver", description: "Same trusted caregiver for routine and familiarity", icon: Heart },
    { title: "Comprehensive Support", description: "All personal care, homemaking, and companionship", icon: Home },
    { title: "Peace of Mind", description: "Someone always there for safety and assistance", icon: Shield },
  ],
  "post-hospital-care": [
    { title: "Recovery Support", description: "Helping with healing after surgery or illness", icon: Heart },
    { title: "Medication Management", description: "Ensuring proper medication schedules are followed", icon: Clock },
    { title: "Mobility Rehabilitation", description: "Assistance with exercises and physical therapy", icon: Users },
    { title: "Wound Care Coordination", description: "Supporting medical care instructions", icon: Shield },
  ],
};

const DEFAULT_REVIEWS = [
  { reviewerName: "Maria S.", reviewerLocation: "Family Member", rating: 5, reviewText: "The caregivers are professional, compassionate, and truly care about their clients. My mother loves her caregiver!" },
  { reviewerName: "Robert T.", reviewerLocation: "Son of Client", rating: 5, reviewText: "We couldn't be happier with the care our father receives. The team is responsive and accommodating." },
  { reviewerName: "Jennifer L.", reviewerLocation: "Daughter of Client", rating: 5, reviewText: "Finding quality in-home care was stressful until we found PrivateInHomeCareGiver. They made everything easy." },
];

export default function CareTypeLocationPage() {
  const [, params] = useRoute("/:careType/massachusetts/:citySlug");
  const careTypeSlug = params?.careType;
  const citySlugRaw = params?.citySlug;
  
  const citySlug = citySlugRaw?.replace(/-ma$/, "") || "";

  const { data: allLocations } = useQuery<MaLocation[]>({
    queryKey: ["/api/directory/locations"],
  });

  const { data, isLoading } = useQuery<CareTypePageData>({
    queryKey: ["/api/care-pages", careTypeSlug, citySlug],
    queryFn: async () => {
      const response = await fetch(`/api/care-pages/${careTypeSlug}/${citySlug}`);
      if (!response.ok) {
        return null;
      }
      return response.json();
    },
    enabled: !!careTypeSlug && !!citySlug,
  });

  const locationFromDirectory = useMemo(() => {
    if (!allLocations) return null;
    return allLocations.find(l => l.slug === citySlug);
  }, [allLocations, citySlug]);

  const careTypeDisplay = careTypeSlug ? (careTypeDisplayNames as any)[careTypeSlug] || careTypeSlug : "";
  const cityName = data?.location?.name || locationFromDirectory?.name || citySlug?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const county = data?.location?.county || locationFromDirectory?.county || "";
  const zipCodes = data?.location?.zipCodes || locationFromDirectory?.zipCodes || [];

  const services = SERVICES_BY_CARE_TYPE[careTypeSlug || "personal-care"] || SERVICES_BY_CARE_TYPE["personal-care"];
  const faqs = data?.faqs || [];
  const reviews = data?.reviews?.length ? data.reviews : DEFAULT_REVIEWS;

  const structuredData = useMemo(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://privateinhomecaregiver.com";
    
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "HomeHealthCareService",
      "@id": `${baseUrl}/${careTypeSlug}/massachusetts/${citySlug}-ma`,
      name: `${careTypeDisplay} in ${cityName}, MA | PrivateInHomeCareGiver`,
      url: `${baseUrl}/${careTypeSlug}/massachusetts/${citySlug}-ma`,
      logo: `${baseUrl}/logo.png`,
      description: `Professional ${careTypeDisplay?.toLowerCase()} services in ${cityName}, Massachusetts. Trusted caregivers providing personalized in-home care.`,
      telephone: "+1-617-686-0595",
      address: {
        "@type": "PostalAddress",
        addressLocality: cityName,
        addressRegion: "MA",
        postalCode: zipCodes[0] || "",
        addressCountry: "US"
      },
      areaServed: {
        "@type": "City",
        name: cityName,
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: county ? `${county} County` : "Massachusetts"
        }
      },
      priceRange: "$$",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59"
      }
    };

    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${careTypeDisplay} Services`,
      description: `Professional ${careTypeDisplay?.toLowerCase()} services for seniors in ${cityName}, MA`,
      provider: {
        "@type": "HomeHealthCareService",
        name: "PrivateInHomeCareGiver"
      },
      areaServed: {
        "@type": "City",
        name: cityName
      },
      serviceType: careTypeDisplay
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
        { "@type": "ListItem", position: 2, name: careTypeDisplay, item: `${baseUrl}/${careTypeSlug}/massachusetts` },
        { "@type": "ListItem", position: 3, name: `${cityName}, MA`, item: `${baseUrl}/${careTypeSlug}/massachusetts/${citySlug}-ma` }
      ]
    };

    const schemas: any[] = [localBusinessSchema, serviceSchema, breadcrumbSchema];

    if (faqs.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map(faq => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer }
        }))
      });
    }

    return JSON.stringify(schemas);
  }, [careTypeSlug, citySlug, cityName, careTypeDisplay, county, zipCodes, faqs]);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted rounded w-3/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="grid md:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded"></div>)}
            </div>
          </div>
        </div>
      </>
    );
  }

  const page = data?.page;
  const metaTitle = page?.metaTitle || `${careTypeDisplay} in ${cityName}, MA | PrivateInHomeCareGiver`;
  const metaDescription = page?.metaDescription || `Find trusted ${careTypeDisplay?.toLowerCase()} services in ${cityName}, Massachusetts. Professional caregivers providing personalized in-home care for seniors.`;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`${window.location.origin}/${careTypeSlug}/massachusetts/${citySlug}-ma`} />
        
        <meta name="geo.region" content="US-MA" />
        <meta name="geo.placename" content={cityName} />
        
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        
        <script type="application/ld+json">{structuredData}</script>
      </Helmet>

      <Header />

      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="nav-breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/${careTypeSlug}/massachusetts`} className="hover:text-primary">{careTypeDisplay}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{cityName}, MA</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={getCareTypeImage(careTypeSlug || "personal-care").hero}
            alt={getCareTypeImage(careTypeSlug || "personal-care").alt}
            className="w-full h-full object-cover"
            data-testid="img-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/20" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-primary/90" data-testid="badge-care-type">{careTypeDisplay}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white" data-testid="text-title">
              {page?.heroTitle || `${careTypeDisplay} in ${cityName}, Massachusetts`}
            </h1>
            <p className="text-xl text-white/90 mb-8" data-testid="text-subtitle">
              {page?.heroSubtitle || `Trusted, compassionate ${careTypeDisplay?.toLowerCase()} services for seniors and families in ${cityName} and ${county} County.`}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/consultation">
                <Button size="lg" data-testid="button-cta-primary">
                  <Phone className="w-5 h-5 mr-2" />
                  Get Free Consultation
                </Button>
              </Link>
              <a href="tel:+1-617-686-0595">
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" data-testid="button-cta-call">
                  Call (617) 686-0595
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-12 md:py-16" id="overview">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold mb-6" data-testid="heading-overview">
              About {careTypeDisplay} in {cityName}
            </h2>
            <div className="prose prose-lg max-w-none" data-testid="content-overview">
              {page?.overviewContent ? (
                <div dangerouslySetInnerHTML={{ __html: page.overviewContent }} />
              ) : (
                <>
                  <p>
                    PrivateInHomeCareGiver provides professional {careTypeDisplay?.toLowerCase()} services 
                    throughout {cityName} and the surrounding {county} County area. Our experienced, 
                    compassionate caregivers are dedicated to helping seniors maintain their independence 
                    and quality of life in the comfort of their own homes.
                  </p>
                  <p>
                    Whether you need assistance for a few hours a week or around-the-clock care, 
                    our team works with you to create a personalized care plan that meets your 
                    unique needs and preferences.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 md:py-16 bg-muted/30" id="services">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center" data-testid="heading-services">
            Our {careTypeDisplay} Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {services.map((service, idx) => (
              <Card key={idx} className="hover-elevate" data-testid={`card-service-${idx}`}>
                <CardHeader>
                  <service.icon className="w-10 h-10 text-primary mb-2" />
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Local Context Section */}
      <section className="py-12 md:py-16" id="local-info">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6" data-testid="heading-local">
              {careTypeDisplay} Resources in {cityName}, MA
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Why Choose In-Home Care?</h3>
                <ul className="space-y-3">
                  {[
                    "Maintain independence in familiar surroundings",
                    "One-on-one personalized attention",
                    "Flexible scheduling to fit your needs",
                    "More affordable than facility care",
                    "Family involvement in care decisions"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Serving {county} County</h3>
                <p className="text-muted-foreground mb-4">
                  We proudly serve {cityName} and surrounding communities in {county} County. 
                  Our caregivers are familiar with local resources, healthcare facilities, 
                  and community services available to seniors.
                </p>
                {zipCodes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">ZIP Codes Served:</p>
                    <div className="flex flex-wrap gap-2">
                      {zipCodes.slice(0, 6).map(zip => (
                        <Badge key={zip} variant="secondary">{zip}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      {faqs.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30" id="faqs">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center" data-testid="heading-faqs">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4" data-testid={`faq-item-${idx}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="py-12 md:py-16" id="reviews">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center" data-testid="heading-reviews">
            What Families Say About Our Care
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {reviews.map((review, idx) => (
              <Card key={idx} data-testid={`card-review-${idx}`}>
                <CardContent className="pt-6">
                  <div className="flex mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{review.reviewText}"</p>
                  <div className="font-medium">{review.reviewerName}</div>
                  <div className="text-sm text-muted-foreground">{review.reviewerLocation}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started with {careTypeDisplay} in {cityName}?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Contact us today for a free, no-obligation consultation. We'll help you find 
            the right care solution for your family.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/consultation">
              <Button size="lg" variant="secondary" data-testid="button-cta-bottom">
                Schedule Free Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="tel:+1-617-686-0595">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Phone className="w-5 h-5 mr-2" />
                (617) 686-0595
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
