import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Phone, 
  MapPin, 
  Search,
  ArrowRight,
  ChevronRight,
  Heart,
  Shield,
  Users,
  Clock,
  ClipboardList
} from "lucide-react";
import type { MaLocation } from "@shared/schema";
import { careTypeDisplayNames, careTypeEnum, type CareType } from "@shared/schema";
import { getCareTypeImage } from "@/constants/careTypeMedia";

const CARE_TYPE_QUIZ_SLUGS: Record<string, string> = {
  "personal-care": "personal-care-assessment",
  "companionship": "companionship-needs-quiz",
  "homemaking": "homemaking-care-assessment",
  "dementia-care": "dementia-care-assessment",
  "respite-care": "respite-care-assessment",
  "live-in-care": "live-in-care-assessment",
  "post-hospital-care": "post-hospital-care-assessment"
};

const CARE_TYPE_DESCRIPTIONS: Record<string, { headline: string; description: string; benefits: string[] }> = {
  "personal-care": {
    headline: "Compassionate Personal Care Services Across Massachusetts",
    description: "Our personal care services help seniors maintain their dignity and independence with assistance for daily living activities including bathing, grooming, dressing, and mobility support.",
    benefits: ["Bathing & hygiene assistance", "Dressing & grooming help", "Mobility & transfer support", "Medication reminders", "Incontinence care"]
  },
  "companionship": {
    headline: "Meaningful Companionship Care Throughout Massachusetts",
    description: "Combat loneliness and isolation with our companionship services. Our caregivers provide social engagement, conversation, and emotional support to enhance quality of life.",
    benefits: ["Social engagement & conversation", "Accompaniment to appointments", "Recreational activities", "Meal companionship", "Light errands & outings"]
  },
  "homemaking": {
    headline: "Professional Homemaking Services in Massachusetts",
    description: "Keep your home safe, clean, and comfortable with our homemaking services. We handle housekeeping, meal preparation, laundry, and more.",
    benefits: ["Light housekeeping", "Meal planning & preparation", "Laundry & linen care", "Grocery shopping", "Home organization"]
  },
  "dementia-care": {
    headline: "Specialized Dementia & Memory Care in Massachusetts",
    description: "Our dementia care specialists provide compassionate, expert care for those living with Alzheimer's and other memory conditions. We create safe, supportive environments.",
    benefits: ["Memory stimulation activities", "Behavior management", "Safe environment creation", "Routine & structure", "Family education & support"]
  },
  "respite-care": {
    headline: "Flexible Respite Care Services Across Massachusetts",
    description: "Family caregivers need breaks too. Our respite care provides temporary relief so you can rest, travel, or attend to other responsibilities.",
    benefits: ["Short-term relief care", "Flexible scheduling", "Same quality as regular care", "Peace of mind for families", "Emergency coverage available"]
  },
  "live-in-care": {
    headline: "24/7 Live-In Care Services in Massachusetts",
    description: "For seniors who need around-the-clock support, our live-in caregivers provide comprehensive care while living in the home.",
    benefits: ["24/7 caregiver presence", "Consistent, trusted caregiver", "All-inclusive care services", "Cost-effective vs. facilities", "Maximum independence at home"]
  },
  "post-hospital-care": {
    headline: "Post-Hospital & Recovery Care in Massachusetts",
    description: "Smooth the transition from hospital to home with our post-hospital care services. We help with recovery, medication management, and rehabilitation support.",
    benefits: ["Hospital discharge support", "Medication management", "Wound care coordination", "Mobility rehabilitation", "Follow-up appointment assistance"]
  }
};

export default function CareTypeStatePage() {
  const [, params] = useRoute("/:careType/massachusetts");
  const careTypeSlug = params?.careType as CareType;
  const [searchQuery, setSearchQuery] = useState("");

  const { data: locations, isLoading } = useQuery<MaLocation[]>({
    queryKey: ["/api/directory/locations"],
  });

  const careTypeDisplay = careTypeSlug ? (careTypeDisplayNames as any)[careTypeSlug] || careTypeSlug : "";
  const careTypeInfo = CARE_TYPE_DESCRIPTIONS[careTypeSlug || "personal-care"] || CARE_TYPE_DESCRIPTIONS["personal-care"];

  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    const active = locations.filter(l => l.isActive === "yes");
    if (!searchQuery) return active.slice(0, 50);
    const query = searchQuery.toLowerCase();
    return active.filter(l => 
      l.name.toLowerCase().includes(query) || 
      l.county.toLowerCase().includes(query)
    );
  }, [locations, searchQuery]);

  const locationsByCounty = useMemo(() => {
    const grouped: Record<string, MaLocation[]> = {};
    filteredLocations.forEach(loc => {
      if (!grouped[loc.county]) grouped[loc.county] = [];
      grouped[loc.county].push(loc);
    });
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredLocations]);

  const structuredData = useMemo(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://privateinhomecaregiver.com";
    
    return JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: `${careTypeDisplay} Services in Massachusetts`,
        description: careTypeInfo.description,
        provider: {
          "@type": "HomeHealthCareService",
          name: "PrivateInHomeCareGiver",
          url: baseUrl
        },
        areaServed: {
          "@type": "State",
          name: "Massachusetts"
        },
        serviceType: careTypeDisplay
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
          { "@type": "ListItem", position: 2, name: careTypeDisplay, item: `${baseUrl}/${careTypeSlug}/massachusetts` }
        ]
      }
    ]);
  }, [careTypeSlug, careTypeDisplay, careTypeInfo]);

  const metaTitle = `${careTypeDisplay} in Massachusetts | PrivateInHomeCareGiver`;
  const metaDescription = `Find trusted ${careTypeDisplay?.toLowerCase()} services across Massachusetts. Professional caregivers serving Boston, Worcester, Springfield, and 60+ communities.`;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`${window.location.origin}/${careTypeSlug}/massachusetts`} />
        
        <meta name="geo.region" content="US-MA" />
        <meta name="geo.placename" content="Massachusetts" />
        
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        
        <script type="application/ld+json">{structuredData}</script>
      </Helmet>

      <Header />

      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{careTypeDisplay} in Massachusetts</span>
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-primary/90">{careTypeDisplay}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white" data-testid="text-title">
              {careTypeInfo.headline}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {careTypeInfo.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/consultation">
                  <Phone className="w-5 h-5 mr-2" />
                  Get Free Consultation
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                <a href="tel:+1-617-686-0595">
                  Call (617) 686-0595
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">What's Included in {careTypeDisplay}</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {careTypeInfo.benefits.map((benefit, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    {idx === 0 && <Heart className="w-6 h-6 text-primary" />}
                    {idx === 1 && <Users className="w-6 h-6 text-primary" />}
                    {idx === 2 && <Shield className="w-6 h-6 text-primary" />}
                    {idx === 3 && <Clock className="w-6 h-6 text-primary" />}
                    {idx === 4 && <MapPin className="w-6 h-6 text-primary" />}
                  </div>
                  <p className="font-medium text-sm">{benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Care Assessment CTA */}
      {careTypeSlug && CARE_TYPE_QUIZ_SLUGS[careTypeSlug] && (
        <section className="py-12 bg-primary/5">
          <div className="container mx-auto px-4">
            <Card className="max-w-3xl mx-auto border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Not Sure What You Need?</h3>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Take our free {careTypeDisplay?.toLowerCase()} assessment to help identify the right level of care for your loved one. Get personalized recommendations in just 2-3 minutes.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button asChild size="lg" data-testid="button-take-assessment">
                    <Link href={`/quiz/${CARE_TYPE_QUIZ_SLUGS[careTypeSlug]}`}>
                      <ClipboardList className="w-5 h-5 mr-2" />
                      Take Free Assessment
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" data-testid="button-speak-specialist">
                    <Link href="/consultation">
                      Speak with a Specialist
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* All Care Types Navigation */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-semibold mb-4 text-center">Explore All Care Types</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {careTypeEnum.map(ct => (
              <Link key={ct} href={`/${ct}/massachusetts`}>
                <Badge 
                  variant={ct === careTypeSlug ? "default" : "outline"} 
                  className="cursor-pointer hover-elevate"
                >
                  {(careTypeDisplayNames as any)[ct]}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Directory */}
      <section className="py-12 md:py-16" id="locations">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Find {careTypeDisplay} Near You
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            We provide {careTypeDisplay?.toLowerCase()} services in over 65 Massachusetts cities and towns.
            Click on a location to learn more about our services in your area.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by city or county..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading locations...</div>
          ) : (
            <div className="space-y-8">
              {locationsByCounty.map(([county, locs]) => (
                <div key={county}>
                  <h3 className="text-xl font-semibold mb-4 border-b pb-2">{county} County</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {locs.map(loc => (
                      <Link key={loc.id} href={`/${careTypeSlug}/massachusetts/${loc.slug}-ma`}>
                        <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-location-${loc.slug}`}>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary shrink-0" />
                              <span className="font-medium text-sm truncate">{loc.name}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started with {careTypeDisplay}?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Contact us today for a free, no-obligation consultation. We'll help you find 
            the right care solution for your family anywhere in Massachusetts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/consultation">
              <Button size="lg" variant="secondary">
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
