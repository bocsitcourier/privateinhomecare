import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  MapPin, 
  Building2,
  ChevronRight,
  ChevronLeft,
  Star,
  Phone,
  Globe,
  Mail,
  DollarSign,
  Users,
  Heart,
  Brain,
  Home as HomeIcon,
  ShieldCheck,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Leaf,
  Stethoscope,
  Activity,
  HelpCircle,
  ExternalLink,
  Navigation
} from "lucide-react";
import { SiGoogle } from "react-icons/si";

import type { Facility, FacilityReview, FacilityFaq } from "@shared/schema";
import { getFacilityTypeImage } from "@/constants/facilityTypeMedia";
import { generateFacilityKeywords, generateFacilityMetaDescription } from "@/components/SEOHead";

function generateGoogleMapsUrl(facility: Facility): string {
  if (facility.googleMapsUrl) return facility.googleMapsUrl;
  const query = encodeURIComponent(`${facility.name}, ${facility.address}, ${facility.city}, ${facility.state} ${facility.zipCode || ''}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function generateGoogleReviewsUrl(facility: Facility): string {
  if (facility.googlePlaceId) {
    return `https://search.google.com/local/reviews?placeid=${facility.googlePlaceId}`;
  }
  const query = encodeURIComponent(`${facility.name} ${facility.city} MA reviews`);
  return `https://www.google.com/search?q=${query}`;
}

const FACILITY_TYPES = [
  { key: "nursing-home", title: "Nursing Home", icon: Building2 },
  { key: "assisted-living", title: "Assisted Living", icon: Heart },
  { key: "memory-care", title: "Memory Care", icon: Brain },
  { key: "independent-living", title: "Independent Living", icon: Users },
  { key: "continuing-care", title: "Continuing Care", icon: HomeIcon },
  { key: "hospice", title: "Hospice & Palliative Care", icon: Leaf },
  { key: "hospital", title: "Hospital", icon: Stethoscope },
  { key: "academic-medical-center", title: "Academic Medical Center", icon: Activity },
  { key: "community-hospital", title: "Community Hospital", icon: Building2 },
  { key: "specialty-hospital", title: "Specialty Hospital", icon: Heart },
  { key: "rehabilitation", title: "Rehabilitation Hospital", icon: Users },
  { key: "critical-access-hospital", title: "Critical Access Hospital", icon: Building2 },
  { key: "childrens-hospital", title: "Children's Hospital", icon: Heart },
];

function RatingStars({ rating, size = "default" }: { rating: number; size?: "default" | "large" }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  const starClass = size === "large" ? "w-6 h-6" : "w-4 h-4";

  return (
    <div className="flex items-center gap-0.5">
      {Array(fullStars).fill(0).map((_, i) => (
        <Star key={`full-${i}`} className={`${starClass} fill-amber-400 text-amber-400`} />
      ))}
      {hasHalf && (
        <Star className={`${starClass} fill-amber-400/50 text-amber-400`} />
      )}
      {Array(emptyStars).fill(0).map((_, i) => (
        <Star key={`empty-${i}`} className={`${starClass} text-gray-300 dark:text-gray-600`} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: FacilityReview }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="font-medium">{review.reviewerName}</p>
            {review.reviewerRelation && (
              <p className="text-sm text-muted-foreground">{review.reviewerRelation}</p>
            )}
          </div>
          <RatingStars rating={review.rating} />
        </div>
        {review.title && (
          <p className="font-medium mb-2">{review.title}</p>
        )}
        <p className="text-muted-foreground">{review.content}</p>
        {review.visitDate && (
          <p className="text-xs text-muted-foreground mt-2">
            Visited: {new Date(review.visitDate).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function FacilityDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: facility, isLoading, error } = useQuery<Facility>({
    queryKey: ["/api/facilities", slug],
    enabled: !!slug,
  });

  const { data: reviews = [] } = useQuery<FacilityReview[]>({
    queryKey: ["/api/facilities", slug, "reviews"],
    enabled: !!slug,
  });

  const { data: faqs = [] } = useQuery<FacilityFaq[]>({
    queryKey: ["/api/facilities", slug, "faqs"],
    enabled: !!slug,
  });

  const typeInfo = FACILITY_TYPES.find(t => t.key === facility?.facilityType);
  const Icon = typeInfo?.icon || Building2;

  const facilitySchemaType = useMemo(() => {
    const typeMap: Record<string, string> = {
      'nursing-home': 'NursingHome',
      'hospital': 'Hospital',
      'hospice': 'MedicalBusiness',
      'assisted-living': 'LodgingBusiness',
      'memory-care': 'LodgingBusiness',
      'independent-living': 'LodgingBusiness',
      'continuing-care': 'LodgingBusiness'
    };
    return typeMap[facility?.facilityType || ''] || 'LocalBusiness';
  }, [facility?.facilityType]);

  const schemaJson = useMemo(() => {
    if (!facility) return null;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://privateinhomecaregiver.com";
    
    return {
      "@context": "https://schema.org",
      "@type": facilitySchemaType,
      "@id": `${baseUrl}/facility/${facility.slug}`,
      "name": facility.name,
      "description": facility.description || facility.shortDescription,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": facility.address,
        "addressLocality": facility.city,
        "addressRegion": facility.state,
        "postalCode": facility.zipCode,
        "addressCountry": "US"
      },
      ...(facility.latitude && facility.longitude && {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": facility.latitude,
          "longitude": facility.longitude
        }
      }),
      ...(facility.phone && { "telephone": facility.phone }),
      ...(facility.website && { "url": facility.website }),
      ...(facility.email && { "email": facility.email }),
      ...(facility.heroImageUrl && { "image": facility.heroImageUrl }),
      ...(facility.overallRating && parseFloat(facility.overallRating) > 0 && { 
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": facility.overallRating,
          "reviewCount": facility.reviewCount || 1,
          "bestRating": "5",
          "worstRating": "1"
        }
      }),
      "areaServed": {
        "@type": "State",
        "name": "Massachusetts"
      },
      ...(facility.services && facility.services.length > 0 && {
        "amenityFeature": facility.services.map(s => ({
          "@type": "LocationFeatureSpecification",
          "name": s
        }))
      }),
      "priceRange": facility.priceRangeMin && facility.priceRangeMax 
        ? `$${facility.priceRangeMin.toLocaleString()} - $${facility.priceRangeMax.toLocaleString()}/mo`
        : undefined
    };
  }, [facility, facilitySchemaType]);

  const breadcrumbSchema = useMemo(() => {
    if (!facility) return null;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://privateinhomecaregiver.com";
    
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Facility Directory",
          "item": `${baseUrl}/facilities`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": typeInfo?.title || facility.facilityType,
          "item": `${baseUrl}/facilities/${facility.facilityType}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": facility.name,
          "item": `${baseUrl}/facility/${facility.slug}`
        }
      ]
    };
  }, [facility, typeInfo]);

  const faqSchema = useMemo(() => {
    if (!faqs || faqs.length === 0) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.filter(f => f.isActive === "yes").map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }, [faqs]);

  const seoKeywords = useMemo(() => {
    if (!facility) return [];
    if (facility.keywords && facility.keywords.length > 0) {
      return facility.keywords as string[];
    }
    return generateFacilityKeywords({
      name: facility.name,
      facilityType: facility.facilityType,
      city: facility.city,
      county: facility.county || undefined,
      services: facility.services as string[] || [],
      specializations: facility.specializations as string[] || []
    });
  }, [facility]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-12">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-64 bg-muted rounded-lg mb-6" />
              <div className="h-8 bg-muted rounded w-2/3 mb-4" />
              <div className="h-4 bg-muted rounded w-1/3 mb-6" />
              <div className="h-32 bg-muted rounded mb-4" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !facility) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-12">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Facility Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The facility you're looking for doesn't exist or is no longer available.
            </p>
            <Button asChild>
              <Link href="/facilities">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Directory
              </Link>
            </Button>
          </div>
        </main>
      </>
    );
  }

  const pageTitle = facility.metaTitle || `${facility.name} | ${typeInfo?.title || "Senior Care"} in ${facility.city}, MA`;
  const pageDescription = facility.metaDescription || generateFacilityMetaDescription({
    name: facility.name,
    facilityType: facility.facilityType,
    city: facility.city,
    state: facility.state,
    overallRating: facility.overallRating || undefined,
    reviewCount: facility.reviewCount || 0,
    services: facility.services as string[] || [],
    acceptsMedicare: facility.acceptsMedicare || undefined,
    acceptsMedicaid: facility.acceptsMedicaid || undefined
  });
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://privateinhomecaregiver.com";
  const canonicalUrl = `${baseUrl}/facility/${facility.slug}`;
  const ogImage = facility.heroImageUrl || getFacilityTypeImage(facility.facilityType).hero;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={seoKeywords.join(', ')} />
        <link rel="canonical" href={canonicalUrl} />
        
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        <meta name="geo.region" content="US-MA" />
        <meta name="geo.placename" content={`${facility.city}, Massachusetts`} />
        {facility.latitude && facility.longitude && (
          <>
            <meta name="geo.position" content={`${facility.latitude};${facility.longitude}`} />
            <meta name="ICBM" content={`${facility.latitude}, ${facility.longitude}`} />
          </>
        )}
        
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="place" />
        <meta property="og:site_name" content="PrivateInHomeCareGiver" />
        <meta property="og:locale" content="en_US" />
        {ogImage && <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`} />}
        <meta property="place:location:latitude" content={facility.latitude || ""} />
        <meta property="place:location:longitude" content={facility.longitude || ""} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`} />}
        
        {schemaJson && (
          <script type="application/ld+json">
            {JSON.stringify(schemaJson)}
          </script>
        )}
        {breadcrumbSchema && (
          <script type="application/ld+json">
            {JSON.stringify(breadcrumbSchema)}
          </script>
        )}
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
      </Helmet>

      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="bg-muted/30 py-3 border-b">
          <div className="container max-w-4xl mx-auto px-4">
            <nav className="flex items-center text-sm text-muted-foreground">
              <Link href="/facilities" className="hover:text-foreground transition-colors">
                Facility Directory
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <Link href={`/facilities/${facility.facilityType}`} className="hover:text-foreground transition-colors">
                {typeInfo?.title || facility.facilityType}
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-foreground truncate">{facility.name}</span>
            </nav>
          </div>
        </div>

        {/* Premium Hero Section */}
        <div className="relative h-[50vh] min-h-[400px] md:h-[60vh]">
          <img 
            src={facility.heroImageUrl || getFacilityTypeImage(facility.facilityType).hero}
            alt={facility.heroImageUrl ? facility.name : getFacilityTypeImage(facility.facilityType).alt}
            className="w-full h-full object-cover"
            data-testid="img-facility-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />
          
          {/* Hero Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  <Icon className="w-3 h-3 mr-1" />
                  {typeInfo?.title || facility.facilityType}
                </Badge>
                {facility.isClosed === "yes" && (
                  <Badge variant="destructive" data-testid="badge-facility-closed">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Permanently Closed
                  </Badge>
                )}
                {facility.overallRating && parseFloat(facility.overallRating) >= 4.0 && (
                  <Badge className="bg-amber-500/90 text-white border-amber-400">
                    <Star className="w-3 h-3 mr-1 fill-white" />
                    Top Rated
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4" data-testid="text-facility-name">
                {facility.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{facility.city}, {facility.state}</span>
                </div>
                {facility.overallRating && (
                  <div className="flex items-center gap-2">
                    <RatingStars rating={parseFloat(facility.overallRating)} size="large" />
                    <span className="font-semibold">{facility.overallRating}</span>
                    {facility.reviewCount > 0 && (
                      <span className="text-white/70">({facility.reviewCount} reviews)</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                {facility.phone && (
                  <Button size="lg" asChild data-testid="button-call-facility">
                    <a href={`tel:${facility.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      {facility.phone}
                    </a>
                  </Button>
                )}
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white backdrop-blur-sm" asChild data-testid="button-google-maps">
                  <a href={generateGoogleMapsUrl(facility)} target="_blank" rel="noopener noreferrer">
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </a>
                </Button>
                {facility.website && (
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white backdrop-blur-sm" asChild data-testid="link-facility-website">
                    <a href={facility.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Bar */}
        <div className="bg-card border-b">
          <div className="container max-w-5xl mx-auto px-4 py-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 inline mr-1" />
                {facility.address}, {facility.city}, {facility.state} {facility.zipCode}
              </p>
              <Button variant="outline" size="sm" asChild data-testid="button-google-reviews">
                <a href={generateGoogleReviewsUrl(facility)} target="_blank" rel="noopener noreferrer">
                  <SiGoogle className="w-4 h-4 mr-2" />
                  View Google Reviews
                </a>
              </Button>
            </div>
          </div>
        </div>

        <section className="py-10">
          <div className="container max-w-5xl mx-auto px-4">

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {facility.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Facility</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{facility.description}</p>
                    </CardContent>
                  </Card>
                )}

                {facility.services && facility.services.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {facility.services.map((service, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>{service}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {facility.amenities && facility.amenities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Amenities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {facility.amenities.map((amenity, i) => (
                          <Badge key={i} variant="secondary">{amenity}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {faqs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5" />
                        Frequently Asked Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                          <AccordionItem key={faq.id} value={`faq-${index}`}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <CardTitle>Reviews</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <a href={generateGoogleReviewsUrl(facility)} target="_blank" rel="noopener noreferrer">
                        <SiGoogle className="w-4 h-4 mr-2" />
                        Google Reviews
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviews.length > 0 ? (
                      reviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-muted-foreground mb-4">
                          No reviews yet on our platform. Check Google for more reviews.
                        </p>
                        <Button variant="outline" asChild>
                          <a href={generateGoogleReviewsUrl(facility)} target="_blank" rel="noopener noreferrer">
                            <SiGoogle className="w-4 h-4 mr-2" />
                            View Google Reviews
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {facility.totalBeds && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span><strong>{facility.totalBeds}</strong> total beds</span>
                      </div>
                    )}
                    {facility.county && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{facility.county} County</span>
                      </div>
                    )}
                    {(facility.acceptsMedicare === "yes" || facility.acceptsMedicaid === "yes") && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          {facility.acceptsMedicare === "yes" && (
                            <div className="flex items-center gap-2 text-green-600">
                              <ShieldCheck className="w-4 h-4" />
                              <span>Accepts Medicare</span>
                            </div>
                          )}
                          {facility.acceptsMedicaid === "yes" && (
                            <div className="flex items-center gap-2 text-green-600">
                              <ShieldCheck className="w-4 h-4" />
                              <span>Accepts MassHealth</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    {facility.certifications && facility.certifications.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium mb-2">Certifications</p>
                          <div className="flex flex-wrap gap-1">
                            {facility.certifications.map((cert, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {(facility.priceRangeMin || facility.priceRangeMax) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Pricing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {facility.priceRangeMin && facility.priceRangeMax
                          ? `$${facility.priceRangeMin.toLocaleString()} - $${facility.priceRangeMax.toLocaleString()}`
                          : facility.priceRangeMin
                            ? `From $${facility.priceRangeMin.toLocaleString()}`
                            : `Up to $${facility.priceRangeMax?.toLocaleString()}`}
                      </p>
                      <p className="text-sm text-muted-foreground">per month</p>
                      {facility.pricingNotes && (
                        <p className="text-sm text-muted-foreground mt-2">{facility.pricingNotes}</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {facility.email && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Contact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" asChild className="w-full">
                        <a href={`mailto:${facility.email}`}>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <p className="font-medium mb-2">Prefer In-Home Care?</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      We provide personalized in-home care as an alternative to facility care.
                    </p>
                    <Button asChild className="w-full">
                      <Link href="/consultation">
                        Get Free Consultation
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
