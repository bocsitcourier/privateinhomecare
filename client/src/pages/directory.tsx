import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Heart, 
  Users, 
  Home as HomeIcon, 
  Brain, 
  Phone,
  Building2,
  ChevronRight,
  Star,
  Shield,
  Clock,
  HelpCircle
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import heroImage from "@assets/stock_images/elderly_care_caregiv_e43826bf.jpg";
import careImage1 from "@assets/stock_images/professional_home_ca_b42d5493.jpg";
import careImage2 from "@assets/stock_images/senior_companion_car_36a9cbbd.jpg";

interface MaLocation {
  id: string;
  name: string;
  slug: string;
  county: string;
  region: string | null;
  population: number | null;
  isCity: string;
}

const CARE_TYPES = [
  { 
    key: "personal-care", 
    title: "Personal Care", 
    description: "Bathing, grooming, dressing assistance",
    icon: Heart,
    color: "text-rose-600"
  },
  { 
    key: "companionship", 
    title: "Companionship", 
    description: "Social engagement and conversation",
    icon: Users,
    color: "text-blue-600"
  },
  { 
    key: "homemaking", 
    title: "Homemaking", 
    description: "Meal prep, light housekeeping",
    icon: HomeIcon,
    color: "text-emerald-600"
  },
  { 
    key: "dementia-care", 
    title: "Dementia Care", 
    description: "Memory care support",
    icon: Brain,
    color: "text-purple-600"
  },
];

const TRUST_BADGES = [
  { icon: Shield, text: "Background Checked" },
  { icon: Star, text: "10+ Years Experience" },
  { icon: Clock, text: "24/7 Availability" },
];

export default function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const { data: locations = [], isLoading } = useQuery<MaLocation[]>({
    queryKey: ["/api/directory/locations"],
  });

  const { data: counties = [] } = useQuery<string[]>({
    queryKey: ["/api/directory/counties"],
  });

  const { data: regions = [] } = useQuery<string[]>({
    queryKey: ["/api/directory/regions"],
  });

  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      const matchesSearch = !searchQuery || 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.county.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCounty = selectedCounty === "all" || location.county === selectedCounty;
      const matchesRegion = selectedRegion === "all" || location.region === selectedRegion;
      
      return matchesSearch && matchesCounty && matchesRegion;
    });
  }, [locations, searchQuery, selectedCounty, selectedRegion]);

  const groupedByCounty = useMemo(() => {
    const grouped: Record<string, MaLocation[]> = {};
    filteredLocations.forEach(location => {
      if (!grouped[location.county]) {
        grouped[location.county] = [];
      }
      grouped[location.county].push(location);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredLocations]);

  const schemaJson = useMemo(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://privateinhomecaregiver.com";
    
    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Massachusetts In-Home Care Directory",
      description: "Browse trusted in-home care services across Massachusetts cities and towns.",
      numberOfItems: locations.length,
      itemListElement: locations.slice(0, 50).map((loc, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: `${loc.name} In-Home Care`,
        url: `${baseUrl}/locations/${loc.slug}`
      }))
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
          item: `${baseUrl}/directory`
        }
      ]
    };

    return JSON.stringify([itemListSchema, breadcrumbSchema]);
  }, [locations]);

  useEffect(() => {
    try {
      if (typeof document !== "undefined" && schemaJson) {
        const existing = document.getElementById("directory-schema-json");
        if (existing) existing.remove();
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "directory-schema-json";
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
        pageSlug="directory"
        fallbackTitle="Massachusetts Senior Care Directory | 65+ Cities | Private Pay In-Home Care"
        fallbackDescription="Find private pay in-home senior care services across Massachusetts. Browse our directory covering 65+ cities and towns - Boston, Cambridge, Worcester, Plymouth and all 14 counties."
        canonicalPath="/locations"
        includeMaGeoTargeting={true}
        geoPlacename="Massachusetts"
        pageType="website"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Massachusetts Senior Care Directory", url: "/locations" }
        ]}
      />
      <Header />

      <main className="min-h-screen bg-background">
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/20" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-primary-foreground/80 mb-4">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wide">Massachusetts Care Directory</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Find Quality In-Home Care Near You
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Compassionate, professional caregivers serving families across Massachusetts. 
                Browse our directory of over 300 communities to find trusted care in your area.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {TRUST_BADGES.map((badge, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white border-white/20"
                  >
                    <badge.icon className="w-4 h-4 mr-2" />
                    {badge.text}
                  </Badge>
                ))}
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search by city, town, or county..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 bg-white text-foreground"
                      data-testid="input-directory-search"
                    />
                  </div>
                  <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                    <SelectTrigger className="w-full md:w-[200px] h-12 bg-white" data-testid="select-county">
                      <SelectValue placeholder="All Counties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Counties</SelectItem>
                      {counties.map(county => (
                        <SelectItem key={county} value={county}>{county}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-full md:w-[200px] h-12 bg-white" data-testid="select-region">
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30 border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {CARE_TYPES.map((type) => (
                <Card key={type.key} className="text-center hover-elevate transition-all" data-testid={`card-care-${type.key}`}>
                  <CardContent className="pt-6">
                    <type.icon className={`w-10 h-10 mx-auto mb-3 ${type.color}`} />
                    <h3 className="font-semibold mb-1">{type.title}</h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Communities We Serve</h2>
                <p className="text-muted-foreground">
                  {filteredLocations.length} locations found
                  {selectedCounty !== "all" && ` in ${selectedCounty} County`}
                  {selectedRegion !== "all" && ` (${selectedRegion})`}
                </p>
              </div>
              <Button variant="outline" asChild>
                <a href="/consultation">
                  <Phone className="w-4 h-4 mr-2" />
                  Request Consultation
                </a>
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : groupedByCounty.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No locations found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setSelectedCounty("all");
                    setSelectedRegion("all");
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-10">
                {groupedByCounty.map(([county, countyLocations]) => (
                  <div key={county}>
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold">{county} County</h3>
                      <Badge variant="secondary">{countyLocations.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {countyLocations.map((location) => (
                        <Link key={location.id} href={`/locations/${location.slug}`}>
                          <Card 
                            className="hover-elevate cursor-pointer group h-full"
                            data-testid={`card-location-${location.slug}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold group-hover:text-primary transition-colors">
                                    {location.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {location.isCity === "yes" ? "City" : "Town"}
                                    {location.population && ` • Pop. ${location.population.toLocaleString()}`}
                                  </p>
                                  {location.region && (
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      {location.region}
                                    </Badge>
                                  )}
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
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

        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Why Families Choose Us</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Vetted & Trained Caregivers</h3>
                      <p className="text-muted-foreground">All caregivers undergo comprehensive background checks and receive ongoing professional training.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Personalized Care Plans</h3>
                      <p className="text-muted-foreground">Every family is unique. We create customized care plans that adapt to your loved one's changing needs.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Flexible Scheduling</h3>
                      <p className="text-muted-foreground">From a few hours a day to round-the-clock support, we're here whenever you need us.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Button size="lg" asChild>
                    <a href="/consultation">Get Started Today</a>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img 
                  src={careImage1} 
                  alt="Professional caregiver with elderly patient" 
                  className="rounded-2xl shadow-xl w-full"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">S</div>
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">J</div>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">L</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">500+ families served</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Massachusetts In-Home Care FAQ Section */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 text-primary mb-4">
                <HelpCircle className="w-6 h-6" />
                <span className="text-sm font-medium uppercase tracking-wide">Frequently Asked Questions</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Common Questions About Senior Care in Massachusetts
              </h2>
              <p className="text-lg text-muted-foreground">
                Find answers to common questions about our private pay senior care services
              </p>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1" data-testid="accordion-faq-general-1">
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      What areas of Massachusetts do you serve?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      PrivateInHomeCareGiver provides comprehensive in-home care services throughout Massachusetts. We serve all 14 counties including Middlesex, Essex, Suffolk, Worcester, Norfolk, Bristol, Plymouth, Hampden, Hampshire, Berkshire, Franklin, Barnstable, Dukes, and Nantucket. Whether you're in Boston, Worcester, Springfield, or any community in between, we have local caregivers ready to help.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-2" data-testid="accordion-faq-general-2">
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      What payment options do you accept?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      PrivateInHomeCareGiver is exclusively a private pay home care agency. We accept private payment, long-term care insurance, and veterans benefits (VA Aid & Attendance). This allows us to offer more personalized, flexible care without the restrictions of government programs. Contact us for a free consultation to discuss payment options.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-3" data-testid="accordion-faq-general-3">
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      What types of in-home care services do you offer?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      We provide comprehensive care services including: Personal Care (bathing, grooming, dressing, toileting assistance), Companionship (conversation, activities, outings), Homemaking (meal preparation, light housekeeping, laundry), Dementia and Alzheimer's Care, Respite Care (giving family caregivers a break), Post-Hospital Recovery Support, and 24/7 Live-In Care. All services are tailored to your loved one's unique needs.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-4" data-testid="accordion-faq-general-4">
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      How are your caregivers screened and trained?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      All PrivateInHomeCareGiver caregivers undergo comprehensive background checks including criminal history, sex offender registry, and reference verification. They receive ongoing training in dementia care, safety protocols, and compassionate communication. Our caregivers are insured and bonded, giving families complete peace of mind.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-5" data-testid="accordion-faq-general-5">
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      How much does private pay home care cost in Massachusetts?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Pricing varies based on the level of care needed, hours of service, and location within Massachusetts. We offer flexible scheduling from a few hours per week to 24/7 live-in care. Contact us for a free, no-obligation assessment to receive a personalized quote. We're committed to making quality care accessible for your budget.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-6" data-testid="accordion-faq-general-6">
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      Can I choose or change my caregiver?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Absolutely! We believe the right caregiver match is essential for quality care. We arrange introductions before care begins so you can ensure compatibility. If at any time you'd like to change caregivers, we'll work quickly to find a better match at no additional cost.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq-7" data-testid="accordion-faq-general-7">
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      How quickly can care begin?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      We can often begin providing care within 24-48 hours of completing an initial assessment. For urgent situations, such as hospital discharges, we may be able to arrange same-day care placement. Our team works diligently to match your loved one with the right caregiver as quickly as possible.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Internal Linking Section - County Hubs */}
        <section className="py-12 bg-background border-t">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Explore Senior Care By County</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {counties.map((county) => (
                <Link 
                  key={county} 
                  href={`/locations?county=${encodeURIComponent(county)}`}
                  className="text-center p-3 rounded-lg border hover-elevate transition-all"
                  data-testid={`link-county-${county.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <span className="text-sm font-medium">{county}</span>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
              <Link href="/services" className="p-4 rounded-lg border hover-elevate" data-testid="link-services">
                <Heart className="w-6 h-6 mx-auto mb-2 text-primary" />
                <span className="font-medium">Our Care Services</span>
                <p className="text-sm text-muted-foreground mt-1">Personal care, companionship, dementia care</p>
              </Link>
              <Link href="/consultation" className="p-4 rounded-lg border hover-elevate" data-testid="link-consultation">
                <Phone className="w-6 h-6 mx-auto mb-2 text-primary" />
                <span className="font-medium">Free Consultation</span>
                <p className="text-sm text-muted-foreground mt-1">Speak with a care coordinator today</p>
              </Link>
              <Link href="/careers" className="p-4 rounded-lg border hover-elevate" data-testid="link-careers">
                <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                <span className="font-medium">Join Our Team</span>
                <p className="text-sm text-muted-foreground mt-1">Become a caregiver in your community</p>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Care for Your Loved One?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Our care coordinators are available 24/7 to help you find the perfect caregiver match.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <a href="/consultation">Schedule Free Consultation</a>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <a href="tel:617-686-0595">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us Now
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
