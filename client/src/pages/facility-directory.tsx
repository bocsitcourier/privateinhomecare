import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearch } from "wouter";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  MapPin, 
  Search, 
  Building2,
  ChevronRight,
  Star,
  Phone,
  Globe,
  DollarSign,
  Users,
  Heart,
  Brain,
  Home as HomeIcon,
  ShieldCheck,
  Leaf,
  Stethoscope,
  Activity
} from "lucide-react";

import type { Facility } from "@shared/schema";
import { getFacilityTypeImage } from "@/constants/facilityTypeMedia";

const FACILITY_TYPES = [
  { 
    key: "nursing-home", 
    title: "Nursing Homes", 
    description: "Skilled nursing facilities with 24/7 medical care",
    icon: Building2,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
  },
  { 
    key: "assisted-living", 
    title: "Assisted Living", 
    description: "Residential care with assistance for daily activities",
    icon: Heart,
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
  },
  { 
    key: "memory-care", 
    title: "Memory Care", 
    description: "Specialized care for dementia and Alzheimer's",
    icon: Brain,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
  },
  { 
    key: "independent-living", 
    title: "Independent Living", 
    description: "Senior communities for active adults",
    icon: Users,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
  },
  { 
    key: "continuing-care", 
    title: "Continuing Care", 
    description: "Full spectrum of care as needs change",
    icon: HomeIcon,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
  },
  { 
    key: "hospice", 
    title: "Hospice & Palliative Care", 
    description: "Compassionate end-of-life and comfort care",
    icon: Leaf,
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
  },
  { 
    key: "hospital", 
    title: "Hospitals", 
    description: "Acute care hospitals and medical centers",
    icon: Stethoscope,
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
  },
];

const MA_COUNTIES = [
  "Barnstable", "Berkshire", "Bristol", "Dukes", "Essex", "Franklin", 
  "Hampden", "Hampshire", "Middlesex", "Nantucket", "Norfolk", 
  "Plymouth", "Suffolk", "Worcester"
];

function FacilityCard({ facility }: { facility: Facility }) {
  const typeInfo = FACILITY_TYPES.find(t => t.key === facility.facilityType);
  const Icon = typeInfo?.icon || Building2;
  const fallbackImage = getFacilityTypeImage(facility.facilityType);
  const imageUrl = facility.heroImageUrl || fallbackImage.thumbnail;
  const imageAlt = facility.heroImageUrl ? facility.name : fallbackImage.alt;

  return (
    <Card className="hover-elevate transition-all">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-40 sm:h-auto flex-shrink-0">
            <img 
              src={imageUrl} 
              alt={imageAlt}
              className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
              data-testid={`img-facility-${facility.id}`}
            />
          </div>
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <Link href={`/facility/${facility.slug}`}>
                  <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer" data-testid={`link-facility-${facility.id}`}>
                    {facility.name}
                  </h3>
                </Link>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  {facility.city}, {facility.state} {facility.zipCode}
                </div>
              </div>
              <Badge className={typeInfo?.color || "bg-gray-100"}>
                <Icon className="w-3 h-3 mr-1" />
                {typeInfo?.title || facility.facilityType}
              </Badge>
            </div>

            {facility.shortDescription && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {facility.shortDescription}
              </p>
            )}

            <div className="flex flex-wrap gap-3 text-sm">
              {facility.overallRating && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-amber-500 mr-1" />
                  <span className="font-medium">{facility.overallRating}</span>
                  {facility.reviewCount > 0 && (
                    <span className="text-muted-foreground ml-1">({facility.reviewCount})</span>
                  )}
                </div>
              )}
              {facility.totalBeds && (
                <div className="flex items-center text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{facility.totalBeds} beds</span>
                </div>
              )}
              {(facility.priceRangeMin || facility.priceRangeMax) && (
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>
                    {facility.priceRangeMin && facility.priceRangeMax
                      ? `$${facility.priceRangeMin.toLocaleString()} - $${facility.priceRangeMax.toLocaleString()}/mo`
                      : facility.priceRangeMin
                        ? `From $${facility.priceRangeMin.toLocaleString()}/mo`
                        : `Up to $${facility.priceRangeMax?.toLocaleString()}/mo`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {facility.acceptsMedicare === "yes" && (
                <Badge variant="outline" className="text-xs">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Medicare
                </Badge>
              )}
              {facility.acceptsMedicaid === "yes" && (
                <Badge variant="outline" className="text-xs">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  MassHealth
                </Badge>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              {facility.phone && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${facility.phone}`} data-testid={`button-call-${facility.id}`}>
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </a>
                </Button>
              )}
              {facility.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={facility.website} target="_blank" rel="noopener noreferrer" data-testid={`link-website-${facility.id}`}>
                    <Globe className="w-4 h-4 mr-1" />
                    Website
                  </a>
                </Button>
              )}
              <Button variant="default" size="sm" asChild className="ml-auto">
                <Link href={`/facility/${facility.slug}`} data-testid={`button-details-${facility.id}`}>
                  View Details
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FacilityDirectoryPage() {
  const params = useParams<{ type?: string }>();
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const cityFromUrl = urlParams.get("city") || "";
  
  const [searchQuery, setSearchQuery] = useState(cityFromUrl);
  const [selectedType, setSelectedType] = useState<string>(params.type || "all");
  const [selectedCounty, setSelectedCounty] = useState<string>("all");

  useEffect(() => {
    setSearchQuery(cityFromUrl);
  }, [cityFromUrl]);

  const apiUrl = selectedType !== "all" 
    ? `/api/facilities?type=${selectedType}` 
    : "/api/facilities";
  
  const { data: facilities = [], isLoading } = useQuery<Facility[]>({
    queryKey: [apiUrl],
  });

  const filteredFacilities = useMemo(() => {
    return facilities.filter(facility => {
      const matchesSearch = !searchQuery || 
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === "all" || facility.facilityType === selectedType;
      const matchesCounty = selectedCounty === "all" || facility.county === selectedCounty;
      
      return matchesSearch && matchesType && matchesCounty;
    });
  }, [facilities, searchQuery, selectedType, selectedCounty]);

  const typeInfo = selectedType !== "all" 
    ? FACILITY_TYPES.find(t => t.key === selectedType)
    : null;

  const pageTitle = typeInfo 
    ? `${typeInfo.title} in Massachusetts | Senior Care Directory`
    : "Massachusetts Senior Care Facility Directory";
  
  const pageDescription = typeInfo
    ? `Find ${typeInfo.title.toLowerCase()} in Massachusetts. Compare ${filteredFacilities.length}+ facilities with ratings, services, and pricing information.`
    : `Comprehensive directory of ${filteredFacilities.length}+ senior care facilities in Massachusetts including nursing homes, assisted living, memory care, and independent living.`;

  const schemaJson = useMemo(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://privateinhomecaregiver.com";
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": pageTitle,
      "description": pageDescription,
      "numberOfItems": filteredFacilities.length,
      "itemListElement": filteredFacilities.slice(0, 10).map((facility, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "LocalBusiness",
          "name": facility.name,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": facility.address,
            "addressLocality": facility.city,
            "addressRegion": facility.state,
            "postalCode": facility.zipCode,
            "addressCountry": "US"
          },
          "url": `${baseUrl}/facility/${facility.slug}`,
          ...(facility.phone && { "telephone": facility.phone }),
          ...(facility.overallRating && { 
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": facility.overallRating,
              "reviewCount": facility.reviewCount || 1
            }
          })
        }
      }))
    };
  }, [filteredFacilities, pageTitle, pageDescription]);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`https://privateinhomecaregiver.com/facilities${selectedType !== "all" ? `/${selectedType}` : ""}`} />
        <script type="application/ld+json">
          {JSON.stringify(schemaJson)}
        </script>
      </Helmet>

      <Header />
      
      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-12 md:py-16">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {typeInfo ? `${typeInfo.title} in Massachusetts` : "Massachusetts Senior Care Facilities"}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {typeInfo 
                  ? typeInfo.description 
                  : "Find the right senior care facility for your loved one. Compare options, ratings, and services."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                onClick={() => setSelectedType("all")}
                data-testid="button-filter-all"
              >
                All Types
              </Button>
              {FACILITY_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.key}
                    variant={selectedType === type.key ? "default" : "outline"}
                    onClick={() => setSelectedType(type.key)}
                    data-testid={`button-filter-${type.key}`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {type.title}
                  </Button>
                );
              })}
            </div>

            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, city, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search"
                  />
                </div>
                <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                  <SelectTrigger className="w-full sm:w-48" data-testid="select-county">
                    <SelectValue placeholder="All Counties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Counties</SelectItem>
                    {MA_COUNTIES.map(county => (
                      <SelectItem key={county} value={county}>{county} County</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-8">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {isLoading 
                  ? "Loading facilities..."
                  : `${filteredFacilities.length} facilities found`}
              </p>
            </div>

            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="h-48 animate-pulse bg-muted" />
                ))}
              </div>
            ) : filteredFacilities.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Facilities Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCounty !== "all"
                    ? "Try adjusting your search or filters."
                    : "No facilities have been added yet."}
                </p>
                <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCounty("all"); }}>
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredFacilities.map(facility => (
                  <FacilityCard key={facility.id} facility={facility} />
                ))}
              </div>
            )}

            <div className="mt-12 p-6 bg-primary/5 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Looking for In-Home Care Instead?</h2>
              <p className="text-muted-foreground mb-4">
                Many families prefer the comfort and familiarity of in-home care. Our personal care assistants 
                can provide one-on-one support in your loved one's own home.
              </p>
              <Button asChild>
                <Link href="/services">
                  Explore In-Home Care
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
