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
  Activity
} from "lucide-react";

import type { Facility, FacilityReview } from "@shared/schema";
import { getFacilityTypeImage } from "@/constants/facilityTypeMedia";

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

  const typeInfo = FACILITY_TYPES.find(t => t.key === facility?.facilityType);
  const Icon = typeInfo?.icon || Building2;

  const schemaJson = useMemo(() => {
    if (!facility) return null;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://privateinhomecaregiver.com";
    
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
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
      ...(facility.phone && { "telephone": facility.phone }),
      ...(facility.website && { "url": facility.website }),
      ...(facility.email && { "email": facility.email }),
      ...(facility.heroImageUrl && { "image": facility.heroImageUrl }),
      ...(facility.overallRating && { 
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": facility.overallRating,
          "reviewCount": facility.reviewCount || 1,
          "bestRating": 5,
          "worstRating": 1
        }
      }),
      "areaServed": {
        "@type": "State",
        "name": "Massachusetts"
      },
      "priceRange": facility.priceRangeMin && facility.priceRangeMax 
        ? `$${facility.priceRangeMin.toLocaleString()} - $${facility.priceRangeMax.toLocaleString()}/mo`
        : undefined
    };
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

  const pageTitle = `${facility.name} | ${typeInfo?.title || "Senior Care"} in ${facility.city}, MA`;
  const pageDescription = facility.metaDescription || facility.shortDescription || 
    `${facility.name} is a ${typeInfo?.title?.toLowerCase() || "senior care facility"} in ${facility.city}, Massachusetts. View ratings, services, pricing, and contact information.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`https://privateinhomecaregiver.com/facility/${facility.slug}`} />
        {schemaJson && (
          <script type="application/ld+json">
            {JSON.stringify(schemaJson)}
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

        <div className="h-64 md:h-80 relative">
          <img 
            src={facility.heroImageUrl || getFacilityTypeImage(facility.facilityType).hero}
            alt={facility.heroImageUrl ? facility.name : getFacilityTypeImage(facility.facilityType).alt}
            className="w-full h-full object-cover"
            data-testid="img-facility-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <section className="py-8">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <Badge className="mb-2">
                  <Icon className="w-3 h-3 mr-1" />
                  {typeInfo?.title || facility.facilityType}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-facility-name">
                  {facility.name}
                </h1>
                <div className="flex items-center text-muted-foreground mt-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {facility.address}, {facility.city}, {facility.state} {facility.zipCode}
                </div>
                {facility.overallRating && (
                  <div className="flex items-center gap-2 mt-2">
                    <RatingStars rating={parseFloat(facility.overallRating)} size="large" />
                    <span className="font-semibold text-lg">{facility.overallRating}</span>
                    {facility.reviewCount > 0 && (
                      <span className="text-muted-foreground">({facility.reviewCount} reviews)</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {facility.phone && (
                  <Button size="lg" asChild data-testid="button-call-facility">
                    <a href={`tel:${facility.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      {facility.phone}
                    </a>
                  </Button>
                )}
                {facility.website && (
                  <Button variant="outline" asChild data-testid="link-facility-website">
                    <a href={facility.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </div>
            </div>

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

                {reviews.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Reviews</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {reviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </CardContent>
                  </Card>
                )}
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
