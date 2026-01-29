import { useRoute } from "wouter";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import PageSEO from "@/components/PageSEO";
import { MapPin, Phone, Mail, Heart, Users, Home as HomeIcon, Brain, Clock, Shield, Award, Star, CheckCircle2, Quote, ChevronDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";

interface LocationData {
  id: string;
  name: string;
  slug: string;
  county: string;
  region: string | null;
  zipCodes: string[];
  population: number | null;
  isCity: string;
  heroImageUrl?: string | null;
  galleryImages?: string[];
  description?: string | null;
  highlights?: string[];
}

interface CityFaq {
  id: string;
  locationId: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
}

const SERVICES = [
  { 
    key: "personal-care", 
    title: "Personal Care", 
    description: "Assistance with bathing, grooming, dressing, toileting, transfers and mobility",
    icon: <Heart className="w-6 h-6 text-primary" />
  },
  { 
    key: "companionship", 
    title: "Companionship", 
    description: "Friendly conversation, activities, and social engagement",
    icon: <Users className="w-6 h-6 text-primary" />
  },
  { 
    key: "homemaking", 
    title: "Homemaking", 
    description: "Meal preparation, light housekeeping, laundry, and errands",
    icon: <HomeIcon className="w-6 h-6 text-primary" />
  },
  { 
    key: "dementia-care", 
    title: "Dementia Care", 
    description: "Specialized support for those living with memory loss",
    icon: <Brain className="w-6 h-6 text-primary" />
  },
];

const BENEFITS = [
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: "Flexible Scheduling",
    description: "Care on your schedule, from a few hours to 24/7 support"
  },
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Vetted Caregivers",
    description: "All caregivers are background-checked and trained"
  },
  {
    icon: <Award className="w-8 h-8 text-primary" />,
    title: "Local Expertise",
    description: "Familiar with your community and local resources"
  }
];

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    location: "Massachusetts",
    rating: 5,
    text: "The caregiver we found through PrivateInHomeCareGiver has been an absolute blessing for our family. My mother looks forward to her visits and the quality of care is outstanding."
  },
  {
    name: "James T.",
    location: "Massachusetts", 
    rating: 5,
    text: "Professional, compassionate, and reliable. They took the time to understand my father's needs and matched us with the perfect caregiver. I can finally have peace of mind."
  },
  {
    name: "Linda K.",
    location: "Massachusetts",
    rating: 5,
    text: "After trying several other services, we finally found the right fit. The caregivers are not only skilled but truly care about their clients. Highly recommend!"
  }
];

const WHY_CHOOSE_US = [
  {
    title: "Local, Trusted Caregivers",
    description: "Our caregivers live and work in your community, bringing local knowledge and genuine care to every visit."
  },
  {
    title: "Personalized Care Plans",
    description: "Every family is unique. We create customized care plans that adapt to your loved one's changing needs."
  },
  {
    title: "Available 24/7",
    description: "From a few hours a day to round-the-clock support, we're here whenever you need us."
  },
  {
    title: "Fully Vetted & Trained",
    description: "All caregivers undergo comprehensive background checks and receive ongoing professional training."
  },
  {
    title: "Family Involvement",
    description: "We keep families informed with regular updates and welcome your input in care decisions."
  },
  {
    title: "Affordable Care",
    description: "Quality care at competitive rates, with flexible scheduling to fit your budget."
  }
];

export default function CityPage() {
  const [, params] = useRoute("/locations/:citySlug");
  const citySlug = params?.citySlug || "";
  
  const cityName = citySlug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const { data: locationData, isLoading: isLoadingLocation } = useQuery<LocationData>({
    queryKey: [`/api/directory/locations/${citySlug}`],
    enabled: !!citySlug,
  });

  const { data: cityFaqs, isLoading: isLoadingFaqs } = useQuery<CityFaq[]>({
    queryKey: [`/api/directory/locations/${citySlug}/faqs`],
    enabled: !!citySlug,
  });

  const heroImageUrl = locationData?.heroImageUrl;

  const schemaJson = useMemo(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://privateinhomecaregiver.com";
    const zipCode = locationData?.zipCodes?.[0] || "";
    const county = locationData?.county || "";
    
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": ["HomeHealthCareService", "LocalBusiness", "MedicalBusiness", "ProfessionalService"],
      "@id": `${baseUrl}/locations/${citySlug}`,
      name: `PrivateInHomeCareGiver - ${cityName} Senior Care`,
      alternateName: `Private Pay Home Care ${cityName} MA`,
      url: `${baseUrl}/locations/${citySlug}`,
      logo: `${baseUrl}/logo.png`,
      image: locationData?.heroImageUrl || `${baseUrl}/logo.png`,
      description: `Premium private pay in-home care for seniors in ${cityName}, ${county ? county + ' County, ' : ''}Massachusetts. Professional caregivers providing personal care, companionship, homemaking, and specialized dementia care.`,
      telephone: "+1-617-686-0595",
      email: "info@privateinhomecaregiver.com",
      paymentAccepted: "Private Pay, Long-term Care Insurance, VA Benefits",
      currenciesAccepted: "USD",
      address: {
        "@type": "PostalAddress",
        addressLocality: cityName,
        addressRegion: "MA",
        postalCode: zipCode,
        addressCountry: "US"
      },
      areaServed: [
        {
          "@type": "City",
          name: cityName,
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: county ? `${county} County, Massachusetts` : "Massachusetts"
          }
        }
      ],
      serviceArea: {
        "@type": "AdministrativeArea",
        name: `${cityName} and surrounding communities`,
        containedInPlace: {
          "@type": "State",
          name: "Massachusetts"
        }
      },
      priceRange: "$$-$$$",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59"
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "127",
        bestRating: "5"
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Private Pay Senior Care Services",
        itemListElement: SERVICES.map(s => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: s.title,
            description: s.description,
            areaServed: {
              "@type": "City",
              name: cityName
            }
          }
        }))
      },
      knowsAbout: [
        "Senior Care",
        "Elderly Care",
        "In-Home Care",
        "Private Pay Home Care",
        "Dementia Care",
        "Personal Care Assistance",
        "Companion Care",
        "Homemaking Services"
      ]
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Massachusetts Care Directory",
          item: `${baseUrl}/locations`
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${cityName} Senior Home Care`,
          item: `${baseUrl}/locations/${citySlug}`
        }
      ]
    };

    // FAQPage schema for city-specific FAQs
    const faqSchema = cityFaqs && cityFaqs.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      name: `Frequently Asked Questions About Senior Care in ${cityName}, MA`,
      description: `Common questions about private pay in-home care services for seniors in ${cityName}, Massachusetts`,
      mainEntity: cityFaqs.map(faq => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
        }
      }))
    } : null;

    const schemas: object[] = [localBusinessSchema, breadcrumbSchema];
    if (faqSchema) schemas.push(faqSchema);
    
    return JSON.stringify(schemas);
  }, [citySlug, cityName, locationData, cityFaqs]);

  useEffect(() => {
    try {
      if (typeof document !== "undefined" && schemaJson) {
        const existing = document.getElementById("city-schema-json");
        if (existing) existing.remove();
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "city-schema-json";
        script.text = schemaJson;
        document.head.appendChild(script);
      }
    } catch {
      // Ignore schema injection errors
    }
  }, [schemaJson]);

  return (
    <>
      <PageSEO 
        pageSlug={`city-${citySlug}`}
        fallbackTitle={`${cityName} In-Home Care Services | Private Pay Senior Care | PrivateInHomeCareGiver`}
        fallbackDescription={`Premium private pay in-home care for seniors in ${cityName}, Massachusetts. Personal care, companionship, homemaking, and dementia care. 24/7 availability, background-checked caregivers.`}
        canonicalPath={`/locations/${citySlug}`}
        includeMaGeoTargeting={true}
        geoPlacename={cityName}
        geoRegion="US-MA"
        pageType="local_business"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Massachusetts Care Directory", url: "/locations" },
          { name: `${cityName} Senior Care`, url: `/locations/${citySlug}` }
        ]}
      />
      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero Section with Location Image */}
        <section className="relative overflow-hidden">
          {heroImageUrl ? (
            <>
              <div className="absolute inset-0 z-0">
                <img 
                  src={heroImageUrl} 
                  alt={`Private pay in-home senior care services in ${cityName}, Massachusetts - Trusted local caregivers`}
                  title={`Premium In-Home Care for Seniors - ${cityName}, MA`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/20" />
              </div>
              <div className="relative z-10 py-20 md:py-32">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="flex items-center gap-2 text-white/90 mb-4">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm font-medium uppercase tracking-wide">{cityName}, Massachusetts</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                    Trusted In-Home Care Services in {cityName}
                  </h1>
                  <p className="text-xl text-white/85 max-w-3xl mb-6">
                    Compassionate, professional caregivers providing personalized care for your loved ones in the comfort of home. 
                    Proudly serving {cityName} families with dignity, respect, and excellence.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1 text-sm" data-testid="badge-background-checked">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Background Checked
                    </Badge>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1 text-sm" data-testid="badge-licensed">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Licensed & Insured
                    </Badge>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1 text-sm" data-testid="badge-247">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      24/7 Availability
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Button size="lg" asChild data-testid="button-contact">
                      <a href="/consultation">Request Free Consultation</a>
                    </Button>
                    <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white" asChild data-testid="button-caregivers">
                      <a href="/caregivers">Meet Our Caregivers</a>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-24">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase tracking-wide">{cityName}, Massachusetts</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Trusted In-Home Care Services in {cityName}
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mb-6">
                  Compassionate, professional caregivers providing personalized care for your loved ones in the comfort of home. 
                  Proudly serving {cityName} families with dignity, respect, and excellence.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  <Badge variant="secondary" className="px-3 py-1 text-sm" data-testid="badge-background-checked">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Background Checked
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm" data-testid="badge-licensed">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Licensed & Insured
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm" data-testid="badge-247">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    24/7 Availability
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild data-testid="button-contact">
                    <a href="/consultation">Request Free Consultation</a>
                  </Button>
                  <Button size="lg" variant="outline" asChild data-testid="button-caregivers">
                    <a href="/caregivers">Meet Our Caregivers</a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Trust Stats Section */}
        <section className="py-12 bg-muted/30 border-y">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div data-testid="stat-families">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Families Served</div>
              </div>
              <div data-testid="stat-caregivers">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Certified Caregivers</div>
              </div>
              <div data-testid="stat-experience">
                <div className="text-4xl font-bold text-primary mb-2">10+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div data-testid="stat-rating">
                <div className="text-4xl font-bold text-primary mb-2">4.9★</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 md:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Comprehensive Care Services in {cityName}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From personal care to companionship, we provide the support your family needs to thrive at home
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SERVICES.map((service) => (
                <Card key={service.key} className="hover-elevate" data-testid={`card-service-${service.key}`}>
                  <CardContent className="p-6">
                    <div className="mb-4">{service.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button variant="outline" size="lg" asChild data-testid="button-view-services">
                <a href="/services">View All Services</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Families in {cityName} Trust Us
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We understand the importance of finding the right care for your loved ones. Here's what sets us apart.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WHY_CHOOSE_US.map((item, index) => (
                <Card key={index} data-testid={`why-choose-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What {cityName} Families Are Saying
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real feedback from families we've had the privilege to serve
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial, index) => (
                <Card key={index} data-testid={`testimonial-${index}`}>
                  <CardHeader>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Quote className="w-8 h-8 text-muted-foreground/20 mb-3" />
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Getting Started is Easy
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From consultation to care, we make the process simple and stress-free
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Free Consultation", description: "Tell us about your loved one's needs and preferences" },
                { step: "2", title: "Meet Caregivers", description: "We match you with qualified caregivers in your area" },
                { step: "3", title: "Create Care Plan", description: "Together we design a personalized care schedule" },
                { step: "4", title: "Start Care", description: "Your caregiver begins providing compassionate support" }
              ].map((item, index) => (
                <div key={index} className="text-center" data-testid={`step-${index}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Local Service Area Section */}
        <section className="py-16 md:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Serving {cityName} and Surrounding Communities
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our caregivers are local to your community, providing care throughout {cityName} and nearby areas
              </p>
            </div>
            
            <Card className="bg-muted/30">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Why Local Matters</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Knowledge of local resources and healthcare providers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Familiar with {cityName} neighborhoods and community</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Quick response times for urgent needs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Understanding of local culture and values</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Coverage Area</h3>
                    <p className="text-muted-foreground mb-4">
                      We provide comprehensive in-home care services throughout {cityName} and the greater Massachusetts area. 
                      Our caregivers are strategically located to serve you wherever you call home.
                    </p>
                    <Button variant="outline" asChild data-testid="button-find-caregivers">
                      <a href="/caregivers">Find Caregivers Near You</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Location-Specific FAQ Section */}
        {(isLoadingFaqs || (cityFaqs && cityFaqs.length > 0)) && (
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 text-primary mb-4">
                  <HelpCircle className="w-6 h-6" />
                  <span className="text-sm font-medium uppercase tracking-wide">FAQ</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Frequently Asked Questions About Senior Care in {cityName}
                </h2>
                <p className="text-lg text-muted-foreground">
                  Get answers to common questions about our private pay senior care services in {cityName}, Massachusetts
                </p>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  {isLoadingFaqs ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse">
                          <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : cityFaqs && cityFaqs.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {cityFaqs.map((faq, index) => (
                        <AccordionItem key={faq.id} value={`faq-${index}`} data-testid={`accordion-faq-${index}`}>
                          <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : null}
                </CardContent>
              </Card>
              
              <div className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Have more questions about senior care in {cityName}? We're here to help.
                </p>
                <Button asChild data-testid="button-contact-questions">
                  <a href="/consultation">Contact Us Today</a>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Provide the Best Care for Your Loved One?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of {cityName} families who trust us with their most precious relationships. 
              Schedule a free consultation today—no obligations, just caring guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a 
                href="tel:+16176860595" 
                className="flex items-center gap-2 text-primary hover:underline text-lg font-medium"
                data-testid="link-phone"
              >
                <Phone className="w-5 h-5" />
                +1 617-686-0595
              </a>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <a 
                href="mailto:info@privateinhomecaregiver.com" 
                className="flex items-center gap-2 text-primary hover:underline text-lg font-medium"
                data-testid="link-email"
              >
                <Mail className="w-5 h-5" />
                info@privateinhomecaregiver.com
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild data-testid="button-request-care">
                <a href="/consultation">Request Free Consultation</a>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-learn-services">
                <a href="/services">Learn About Our Services</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
