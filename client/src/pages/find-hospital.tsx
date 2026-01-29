import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Phone,
  MapPin,
  Search,
  Building2,
  ExternalLink,
  Navigation,
  AlertCircle,
  Stethoscope,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";

import heroImage from "@assets/in-home-care-02115-mass-general-hospital-private-inhome-caregi_1769694632453.png";
import recoveryImage from "@assets/private-in-home-care-after-discharge-greater-boston_1769694632456.png";

import type { Facility } from "@shared/schema";

const MA_COUNTIES = [
  "Barnstable", "Berkshire", "Bristol", "Dukes", "Essex", "Franklin", 
  "Hampden", "Hampshire", "Middlesex", "Nantucket", "Norfolk", 
  "Plymouth", "Suffolk", "Worcester"
];

const HOSPITAL_SPECIALTY_FILTERS = [
  { key: "emergency", label: "Emergency Services", match: "Emergency" },
  { key: "cardiac", label: "Cardiac Care", match: "Cardiac" },
  { key: "cancer", label: "Cancer/Oncology", match: "Oncology" },
  { key: "trauma", label: "Trauma Center", match: "Trauma" },
  { key: "pediatric", label: "Pediatrics", match: "Pediatric" },
  { key: "rehabilitation", label: "Rehabilitation", match: "Rehabilitation" },
  { key: "transplant", label: "Transplant", match: "Transplant" },
];

export default function FindHospitalPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [showEROnly, setShowEROnly] = useState(false);

  const { data: hospitals = [], isLoading, error } = useQuery<Facility[]>({
    queryKey: ['/api/facilities', { type: 'hospital' }],
    queryFn: async () => {
      const response = await fetch('/api/facilities?type=hospital');
      if (!response.ok) throw new Error('Failed to fetch hospitals');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredHospitals = useMemo(() => {
    return hospitals.filter(hospital => {
      const matchesSearch = searchTerm === "" || 
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCounty = selectedCounty === "all" || hospital.county === selectedCounty;
      
      const matchesSpecialty = selectedSpecialty === "all" || (() => {
        const filter = HOSPITAL_SPECIALTY_FILTERS.find(f => f.key === selectedSpecialty);
        if (!filter) return true;
        const servicesMatch = hospital.services?.some(s => s.toLowerCase().includes(filter.match.toLowerCase()));
        const specMatch = hospital.specializations?.some(s => s.toLowerCase().includes(filter.match.toLowerCase()));
        return servicesMatch || specMatch;
      })();
      
      const matchesER = !showEROnly || hospital.services?.some(s => s.toLowerCase().includes("emergency"));

      return matchesSearch && matchesCounty && matchesSpecialty && matchesER;
    });
  }, [hospitals, searchTerm, selectedCounty, selectedSpecialty, showEROnly]);

  const getDirectionsUrl = (hospital: Facility) => {
    const address = encodeURIComponent(`${hospital.name}, ${hospital.address}, ${hospital.city}, ${hospital.state} ${hospital.zipCode}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  };

  const getHospitalType = (hospital: Facility): string => {
    return hospital.shortDescription || "Hospital";
  };

  const hasEmergencyRoom = (hospital: Facility): boolean => {
    return hospital.services?.some(s => s.toLowerCase().includes("emergency")) || false;
  };

  const countyStats = useMemo(() => {
    return MA_COUNTIES.map(county => ({
      county,
      count: hospitals.filter(h => h.county === county).length
    })).filter(s => s.count > 0);
  }, [hospitals]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Hospitals</h3>
            <p className="text-muted-foreground">Please try refreshing the page</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <>
      <PageSEO
        pageSlug="find-hospital"
        fallbackTitle="Find a Hospital Near Me in Massachusetts | PrivateInHomeCareGiver"
        fallbackDescription="Complete directory of Massachusetts hospitals with addresses, phone numbers, and emergency room information. Find the nearest hospital in your area."
        canonicalPath="/find-hospital"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="relative py-16 md:py-20">
            <div className="absolute inset-0 z-0">
              <img 
                src={heroImage} 
                alt="Healthcare in Massachusetts"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
            </div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-2xl">
                <Badge variant="secondary" className="mb-4" data-testid="badge-page-type">
                  Hospital Directory
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6" data-testid="text-page-title">
                  Find a Hospital in Massachusetts
                </h1>
                <p className="text-xl text-muted-foreground mb-4">
                  Complete directory of {hospitals.length} hospitals across all 14 Massachusetts counties. 
                  Search by location, type, or emergency services.
                </p>
                <div className="flex items-center gap-2 text-destructive font-medium bg-destructive/10 p-3 rounded-lg inline-flex">
                  <AlertCircle className="h-5 w-5" />
                  <span>For medical emergencies, call 911</span>
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 bg-muted/30 sticky top-0 z-10">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search hospital or city..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-hospital"
                    />
                  </div>
                  <Select value={selectedCounty} onValueChange={setSelectedCounty}>
                    <SelectTrigger data-testid="select-county">
                      <SelectValue placeholder="All Counties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Counties</SelectItem>
                      {MA_COUNTIES.map(county => (
                        <SelectItem key={county} value={county}>{county} County</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger data-testid="select-specialty">
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      {HOSPITAL_SPECIALTY_FILTERS.map(spec => (
                        <SelectItem key={spec.key} value={spec.key}>{spec.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant={showEROnly ? "default" : "outline"}
                    onClick={() => setShowEROnly(!showEROnly)}
                    className="flex items-center gap-2"
                    data-testid="button-filter-er"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Emergency Room Only
                  </Button>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  {isLoading ? "Loading hospitals..." : `Showing ${filteredHospitals.length} of ${hospitals.length} hospitals`}
                </div>
              </div>
            </div>
          </section>

          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                {isLoading ? (
                  <div className="grid gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Card key={i} className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                          </div>
                          <div className="flex flex-col gap-2 md:items-end">
                            <Skeleton className="h-8 w-32" />
                            <div className="flex gap-2">
                              <Skeleton className="h-8 w-24" />
                              <Skeleton className="h-8 w-24" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredHospitals.map((hospital, index) => (
                      <Card key={hospital.id} className="hover-elevate" data-testid={`card-hospital-${index}`}>
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Link href={`/facility/${hospital.slug}`}>
                                  <h3 className="font-semibold text-lg text-foreground hover:text-primary cursor-pointer" data-testid={`link-hospital-${hospital.id}`}>
                                    {hospital.name}
                                  </h3>
                                </Link>
                                {hasEmergencyRoom(hospital) && (
                                  <Badge variant="destructive" className="text-xs">
                                    <AlertCircle className="h-3 w-3 mr-1" /> ER
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>{hospital.address}, {hospital.city}, {hospital.state} {hospital.zipCode}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Building2 className="h-4 w-4 shrink-0" />
                                <span>{getHospitalType(hospital)} • {hospital.county} County</span>
                              </div>
                              {hospital.specializations && hospital.specializations.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {hospital.specializations.slice(0, 4).map(specialty => (
                                    <Badge key={specialty} variant="secondary" className="text-xs">
                                      {specialty}
                                    </Badge>
                                  ))}
                                  {hospital.specializations.length > 4 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{hospital.specializations.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 md:items-end">
                              {hospital.phone && (
                                <a
                                  href={`tel:${hospital.phone.replace(/[^0-9]/g, '')}`}
                                  className="flex items-center gap-2 text-primary font-medium hover:underline"
                                  data-testid={`link-phone-${index}`}
                                >
                                  <Phone className="h-4 w-4" />
                                  {hospital.phone}
                                </a>
                              )}
                              <div className="flex flex-wrap gap-2">
                                <Button asChild variant="outline" size="sm">
                                  <a href={getDirectionsUrl(hospital)} target="_blank" rel="noopener noreferrer">
                                    <Navigation className="h-4 w-4 mr-1" /> Directions
                                  </a>
                                </Button>
                                {hospital.website && (
                                  <Button asChild variant="outline" size="sm">
                                    <a href={hospital.website} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4 mr-1" /> Website
                                    </a>
                                  </Button>
                                )}
                                <Button asChild size="sm">
                                  <Link href={`/facility/${hospital.slug}`}>
                                    View Details <ArrowRight className="h-4 w-4 ml-1" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {!isLoading && filteredHospitals.length === 0 && (
                  <Card className="p-8 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hospitals found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </Card>
                )}
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                  Hospitals by County
                </h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {countyStats.map(({ county, count }) => (
                    <Card 
                      key={county} 
                      className="hover-elevate cursor-pointer"
                      onClick={() => {
                        setSelectedCounty(county);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      data-testid={`card-county-${county.toLowerCase()}`}
                    >
                      <CardContent className="p-4 text-center">
                        <MapPin className="h-5 w-5 text-primary mx-auto mb-2" />
                        <p className="font-medium text-foreground">{county} County</p>
                        <p className="text-sm text-muted-foreground">{count} hospital{count !== 1 ? 's' : ''}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-primary/5">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={recoveryImage} 
                      alt="Recovering at home with in-home care support"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      Recovering at Home?
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      After a hospital stay, many patients benefit from professional in-home care. 
                      Our trained Personal Care Assistants can help with medication reminders, 
                      mobility assistance, meal preparation, and more.
                    </p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-foreground">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        <span>Post-hospital recovery care</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        <span>Medication management</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        <span>Mobility and fall prevention</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild>
                        <Link href="/consultation">Request Care</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/post-hospital-care/massachusetts">Learn About Post-Hospital Care</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                  Related Resources
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="hover-elevate">
                    <CardContent className="p-6">
                      <Stethoscope className="h-8 w-8 text-primary mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">Hospice Care</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Find compassionate end-of-life care providers in Massachusetts.
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/facilities/hospice">View Hospice Directory</Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="hover-elevate">
                    <CardContent className="p-6">
                      <Building2 className="h-8 w-8 text-primary mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">Senior Care Facilities</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Browse assisted living, nursing homes, and memory care facilities.
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/facilities">Browse All Facilities</Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="hover-elevate">
                    <CardContent className="p-6">
                      <MapPin className="h-8 w-8 text-primary mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">Care Directory</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Find in-home care services by city and town in Massachusetts.
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/care-directory">Explore Locations</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
