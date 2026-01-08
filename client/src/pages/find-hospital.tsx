import { useState, useMemo } from "react";
import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Clock,
  AlertCircle,
  Heart,
  Baby,
  Brain,
  Activity,
  Stethoscope
} from "lucide-react";
import { Link } from "wouter";

import heroImage from "@assets/Compassionate_Hospice_PCA_in_Greater_Boston,_End-of-Life_Care__1767894946697.png";
import recoveryImage from "@assets/Comfort_and_Independence_Aging_in_Place_in_Massachusetts_1767894946697.png";

interface Hospital {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  county: string;
  type: string;
  hasER: boolean;
  specialties?: string[];
  website?: string;
}

const hospitals: Hospital[] = [
  { name: "Massachusetts General Hospital", address: "55 Fruit Street", city: "Boston", state: "MA", zip: "02114", phone: "(617) 726-2000", county: "Suffolk", type: "Academic Medical Center", hasER: true, specialties: ["Trauma Center", "Cardiac", "Oncology", "Neurology"], website: "https://www.massgeneral.org" },
  { name: "Brigham and Women's Hospital", address: "75 Francis Street", city: "Boston", state: "MA", zip: "02115", phone: "(617) 732-5500", county: "Suffolk", type: "Academic Medical Center", hasER: true, specialties: ["Cardiac", "Oncology", "Women's Health"], website: "https://www.brighamandwomens.org" },
  { name: "Beth Israel Deaconess Medical Center", address: "330 Brookline Avenue", city: "Boston", state: "MA", zip: "02215", phone: "(617) 667-7000", county: "Suffolk", type: "Academic Medical Center", hasER: true, specialties: ["Cardiac", "Gastroenterology", "Oncology"], website: "https://www.bidmc.org" },
  { name: "Boston Medical Center", address: "1 Boston Medical Center Place", city: "Boston", state: "MA", zip: "02118", phone: "(617) 638-8000", county: "Suffolk", type: "Academic Medical Center", hasER: true, specialties: ["Trauma Center", "Pediatrics"], website: "https://www.bmc.org" },
  { name: "Boston Children's Hospital", address: "300 Longwood Avenue", city: "Boston", state: "MA", zip: "02115", phone: "(617) 355-6000", county: "Suffolk", type: "Children's Hospital", hasER: true, specialties: ["Pediatric Specialties"], website: "https://www.childrenshospital.org" },
  { name: "Tufts Medical Center", address: "800 Washington Street", city: "Boston", state: "MA", zip: "02111", phone: "(617) 636-5000", county: "Suffolk", type: "Academic Medical Center", hasER: true, specialties: ["Cardiac", "Oncology"], website: "https://www.tuftsmedicalcenter.org" },
  { name: "Dana-Farber Cancer Institute", address: "450 Brookline Avenue", city: "Boston", state: "MA", zip: "02215", phone: "(617) 632-3000", county: "Suffolk", type: "Specialty Hospital", hasER: false, specialties: ["Oncology"], website: "https://www.dana-farber.org" },
  { name: "New England Baptist Hospital", address: "125 Parker Hill Avenue", city: "Boston", state: "MA", zip: "02120", phone: "(617) 754-5800", county: "Suffolk", type: "Specialty Hospital", hasER: false, specialties: ["Orthopedics"], website: "https://www.nebh.org" },
  { name: "Spaulding Rehabilitation Hospital", address: "300 First Avenue", city: "Charlestown", state: "MA", zip: "02129", phone: "(617) 573-7000", county: "Suffolk", type: "Rehabilitation", hasER: false, specialties: ["Rehabilitation"], website: "https://www.spauldingrehab.org" },
  { name: "Mount Auburn Hospital", address: "330 Mount Auburn Street", city: "Cambridge", state: "MA", zip: "02138", phone: "(617) 492-3500", county: "Middlesex", type: "Community Hospital", hasER: true, website: "https://www.mountauburnhospital.org" },
  { name: "Cambridge Health Alliance - Cambridge Hospital", address: "1493 Cambridge Street", city: "Cambridge", state: "MA", zip: "02139", phone: "(617) 665-1000", county: "Middlesex", type: "Community Hospital", hasER: true },
  { name: "Lahey Hospital & Medical Center", address: "41 Mall Road", city: "Burlington", state: "MA", zip: "01805", phone: "(781) 744-5100", county: "Middlesex", type: "Academic Medical Center", hasER: true, specialties: ["Cardiac", "Oncology"], website: "https://www.lahey.org" },
  { name: "Newton-Wellesley Hospital", address: "2014 Washington Street", city: "Newton", state: "MA", zip: "02462", phone: "(617) 243-6000", county: "Middlesex", type: "Community Hospital", hasER: true, website: "https://www.nwh.org" },
  { name: "Melrose-Wakefield Hospital", address: "585 Lebanon Street", city: "Melrose", state: "MA", zip: "02176", phone: "(781) 979-3000", county: "Middlesex", type: "Community Hospital", hasER: true },
  { name: "Lowell General Hospital", address: "295 Varnum Avenue", city: "Lowell", state: "MA", zip: "01854", phone: "(978) 937-6000", county: "Middlesex", type: "Community Hospital", hasER: true, website: "https://www.lowellgeneral.org" },
  { name: "Emerson Hospital", address: "133 Old Road to Nine Acre Corner", city: "Concord", state: "MA", zip: "01742", phone: "(978) 369-1400", county: "Middlesex", type: "Community Hospital", hasER: true, website: "https://www.emersonhospital.org" },
  { name: "MetroWest Medical Center - Framingham", address: "115 Lincoln Street", city: "Framingham", state: "MA", zip: "01702", phone: "(508) 383-1000", county: "Middlesex", type: "Community Hospital", hasER: true },
  { name: "Marlborough Hospital", address: "157 Union Street", city: "Marlborough", state: "MA", zip: "01752", phone: "(508) 481-5000", county: "Middlesex", type: "Community Hospital", hasER: true },
  { name: "UMass Memorial Medical Center - University Campus", address: "55 Lake Avenue North", city: "Worcester", state: "MA", zip: "01655", phone: "(508) 334-1000", county: "Worcester", type: "Academic Medical Center", hasER: true, specialties: ["Trauma Center", "Cardiac"], website: "https://www.umassmemorial.org" },
  { name: "UMass Memorial Medical Center - Memorial Campus", address: "119 Belmont Street", city: "Worcester", state: "MA", zip: "01605", phone: "(508) 334-1000", county: "Worcester", type: "Academic Medical Center", hasER: true },
  { name: "Saint Vincent Hospital", address: "123 Summer Street", city: "Worcester", state: "MA", zip: "01608", phone: "(508) 363-5000", county: "Worcester", type: "Community Hospital", hasER: true },
  { name: "Harrington Hospital", address: "100 South Street", city: "Southbridge", state: "MA", zip: "01550", phone: "(508) 765-9771", county: "Worcester", type: "Community Hospital", hasER: true },
  { name: "Heywood Hospital", address: "242 Green Street", city: "Gardner", state: "MA", zip: "01440", phone: "(978) 632-3420", county: "Worcester", type: "Community Hospital", hasER: true },
  { name: "HealthAlliance-Clinton Hospital", address: "60 Hospital Road", city: "Leominster", state: "MA", zip: "01453", phone: "(978) 466-2000", county: "Worcester", type: "Community Hospital", hasER: true },
  { name: "Athol Hospital", address: "2033 Main Street", city: "Athol", state: "MA", zip: "01331", phone: "(978) 249-3511", county: "Worcester", type: "Critical Access Hospital", hasER: true },
  { name: "Milford Regional Medical Center", address: "14 Prospect Street", city: "Milford", state: "MA", zip: "01757", phone: "(508) 473-1190", county: "Worcester", type: "Community Hospital", hasER: true },
  { name: "Baystate Medical Center", address: "759 Chestnut Street", city: "Springfield", state: "MA", zip: "01199", phone: "(413) 794-0000", county: "Hampden", type: "Academic Medical Center", hasER: true, specialties: ["Trauma Center", "Cardiac", "Pediatrics"], website: "https://www.baystatehealth.org" },
  { name: "Mercy Medical Center", address: "271 Carew Street", city: "Springfield", state: "MA", zip: "01104", phone: "(413) 748-9000", county: "Hampden", type: "Community Hospital", hasER: true },
  { name: "Holyoke Medical Center", address: "575 Beech Street", city: "Holyoke", state: "MA", zip: "01040", phone: "(413) 534-2500", county: "Hampden", type: "Community Hospital", hasER: true },
  { name: "Baystate Noble Hospital", address: "115 West Silver Street", city: "Westfield", state: "MA", zip: "01085", phone: "(413) 568-2811", county: "Hampden", type: "Community Hospital", hasER: true },
  { name: "Baystate Wing Hospital", address: "40 Wright Street", city: "Palmer", state: "MA", zip: "01069", phone: "(413) 283-7651", county: "Hampden", type: "Critical Access Hospital", hasER: true },
  { name: "Cooley Dickinson Hospital", address: "30 Locust Street", city: "Northampton", state: "MA", zip: "01060", phone: "(413) 582-2000", county: "Hampshire", type: "Community Hospital", hasER: true, website: "https://www.cooleydickinson.org" },
  { name: "Baystate Franklin Medical Center", address: "164 High Street", city: "Greenfield", state: "MA", zip: "01301", phone: "(413) 773-0211", county: "Franklin", type: "Community Hospital", hasER: true },
  { name: "Berkshire Medical Center", address: "725 North Street", city: "Pittsfield", state: "MA", zip: "01201", phone: "(413) 447-2000", county: "Berkshire", type: "Community Hospital", hasER: true, specialties: ["Cardiac"], website: "https://www.berkshirehealthsystems.org" },
  { name: "Fairview Hospital", address: "29 Lewis Avenue", city: "Great Barrington", state: "MA", zip: "01230", phone: "(413) 528-0790", county: "Berkshire", type: "Critical Access Hospital", hasER: true },
  { name: "North Adams Regional Hospital", address: "71 Hospital Avenue", city: "North Adams", state: "MA", zip: "01247", phone: "(413) 664-5000", county: "Berkshire", type: "Community Hospital", hasER: true },
  { name: "Anna Jaques Hospital", address: "25 Highland Avenue", city: "Newburyport", state: "MA", zip: "01950", phone: "(978) 463-1000", county: "Essex", type: "Community Hospital", hasER: true },
  { name: "Beverly Hospital", address: "85 Herrick Street", city: "Beverly", state: "MA", zip: "01915", phone: "(978) 922-3000", county: "Essex", type: "Community Hospital", hasER: true },
  { name: "Lawrence General Hospital", address: "1 General Street", city: "Lawrence", state: "MA", zip: "01842", phone: "(978) 683-4000", county: "Essex", type: "Community Hospital", hasER: true },
  { name: "Holy Family Hospital - Methuen", address: "70 East Street", city: "Methuen", state: "MA", zip: "01844", phone: "(978) 687-0151", county: "Essex", type: "Community Hospital", hasER: true },
  { name: "Holy Family Hospital - Haverhill", address: "140 Lincoln Avenue", city: "Haverhill", state: "MA", zip: "01830", phone: "(978) 374-2000", county: "Essex", type: "Community Hospital", hasER: true },
  { name: "Salem Hospital", address: "81 Highland Avenue", city: "Salem", state: "MA", zip: "01970", phone: "(978) 741-1200", county: "Essex", type: "Community Hospital", hasER: true },
  { name: "Addison Gilbert Hospital", address: "298 Washington Street", city: "Gloucester", state: "MA", zip: "01930", phone: "(978) 283-4000", county: "Essex", type: "Community Hospital", hasER: true },
  { name: "South Shore Hospital", address: "55 Fogg Road", city: "Weymouth", state: "MA", zip: "02190", phone: "(781) 624-8000", county: "Norfolk", type: "Community Hospital", hasER: true, specialties: ["Cardiac", "Women's Health"], website: "https://www.southshorehospital.org" },
  { name: "Quincy Medical Center", address: "114 Whitwell Street", city: "Quincy", state: "MA", zip: "02169", phone: "(617) 773-6100", county: "Norfolk", type: "Community Hospital", hasER: true },
  { name: "Milton Hospital", address: "199 Reedsdale Road", city: "Milton", state: "MA", zip: "02186", phone: "(617) 696-4600", county: "Norfolk", type: "Community Hospital", hasER: true },
  { name: "Norwood Hospital", address: "800 Washington Street", city: "Norwood", state: "MA", zip: "02062", phone: "(781) 769-4000", county: "Norfolk", type: "Community Hospital", hasER: true },
  { name: "Brockton Hospital", address: "680 Centre Street", city: "Brockton", state: "MA", zip: "02302", phone: "(508) 941-7000", county: "Plymouth", type: "Community Hospital", hasER: true },
  { name: "Good Samaritan Medical Center", address: "235 North Pearl Street", city: "Brockton", state: "MA", zip: "02301", phone: "(508) 427-3000", county: "Plymouth", type: "Community Hospital", hasER: true },
  { name: "Beth Israel Deaconess Hospital - Plymouth", address: "275 Sandwich Street", city: "Plymouth", state: "MA", zip: "02360", phone: "(508) 746-2000", county: "Plymouth", type: "Community Hospital", hasER: true },
  { name: "Charlton Memorial Hospital", address: "363 Highland Avenue", city: "Fall River", state: "MA", zip: "02720", phone: "(508) 679-3131", county: "Bristol", type: "Community Hospital", hasER: true },
  { name: "Saint Anne's Hospital", address: "795 Middle Street", city: "Fall River", state: "MA", zip: "02721", phone: "(508) 674-5600", county: "Bristol", type: "Community Hospital", hasER: true },
  { name: "St. Luke's Hospital", address: "101 Page Street", city: "New Bedford", state: "MA", zip: "02740", phone: "(508) 997-1515", county: "Bristol", type: "Community Hospital", hasER: true },
  { name: "Tobey Hospital", address: "43 High Street", city: "Wareham", state: "MA", zip: "02571", phone: "(508) 295-0880", county: "Plymouth", type: "Community Hospital", hasER: true },
  { name: "Morton Hospital", address: "88 Washington Street", city: "Taunton", state: "MA", zip: "02780", phone: "(508) 828-7000", county: "Bristol", type: "Community Hospital", hasER: true },
  { name: "Sturdy Memorial Hospital", address: "211 Park Street", city: "Attleboro", state: "MA", zip: "02703", phone: "(508) 222-5200", county: "Bristol", type: "Community Hospital", hasER: true },
  { name: "Cape Cod Hospital", address: "27 Park Street", city: "Hyannis", state: "MA", zip: "02601", phone: "(508) 771-1800", county: "Barnstable", type: "Community Hospital", hasER: true, website: "https://www.capecodhealth.org" },
  { name: "Falmouth Hospital", address: "100 Ter Heun Drive", city: "Falmouth", state: "MA", zip: "02540", phone: "(508) 548-5300", county: "Barnstable", type: "Community Hospital", hasER: true },
  { name: "Martha's Vineyard Hospital", address: "1 Hospital Road", city: "Oak Bluffs", state: "MA", zip: "02557", phone: "(508) 693-0410", county: "Dukes", type: "Critical Access Hospital", hasER: true },
  { name: "Nantucket Cottage Hospital", address: "57 Prospect Street", city: "Nantucket", state: "MA", zip: "02554", phone: "(508) 825-8100", county: "Nantucket", type: "Critical Access Hospital", hasER: true }
];

const counties = Array.from(new Set(hospitals.map(h => h.county))).sort();
const hospitalTypes = Array.from(new Set(hospitals.map(h => h.type))).sort();

export default function FindHospitalPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showEROnly, setShowEROnly] = useState(false);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter(hospital => {
      const matchesSearch = searchTerm === "" || 
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCounty = selectedCounty === "all" || hospital.county === selectedCounty;
      const matchesType = selectedType === "all" || hospital.type === selectedType;
      const matchesER = !showEROnly || hospital.hasER;

      return matchesSearch && matchesCounty && matchesType && matchesER;
    });
  }, [searchTerm, selectedCounty, selectedType, showEROnly]);

  const getDirectionsUrl = (hospital: Hospital) => {
    const address = encodeURIComponent(`${hospital.name}, ${hospital.address}, ${hospital.city}, ${hospital.state} ${hospital.zip}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  };

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
                      {counties.map(county => (
                        <SelectItem key={county} value={county}>{county} County</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger data-testid="select-type">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {hospitalTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
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
                  Showing {filteredHospitals.length} of {hospitals.length} hospitals
                </div>
              </div>
            </div>
          </section>

          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="grid gap-4">
                  {filteredHospitals.map((hospital, index) => (
                    <Card key={`${hospital.name}-${index}`} className="hover-elevate" data-testid={`card-hospital-${index}`}>
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg text-foreground">{hospital.name}</h3>
                              {hospital.hasER && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" /> ER
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                              <span>{hospital.address}, {hospital.city}, {hospital.state} {hospital.zip}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Building2 className="h-4 w-4 shrink-0" />
                              <span>{hospital.type} • {hospital.county} County</span>
                            </div>
                            {hospital.specialties && hospital.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {hospital.specialties.map(specialty => (
                                  <Badge key={specialty} variant="secondary" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 md:items-end">
                            <a
                              href={`tel:${hospital.phone.replace(/[^0-9]/g, '')}`}
                              className="flex items-center gap-2 text-primary font-medium hover:underline"
                              data-testid={`link-phone-${index}`}
                            >
                              <Phone className="h-4 w-4" />
                              {hospital.phone}
                            </a>
                            <div className="flex gap-2">
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
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredHospitals.length === 0 && (
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
                  {counties.map(county => {
                    const count = hospitals.filter(h => h.county === county).length;
                    return (
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
                    );
                  })}
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
                    <p className="text-muted-foreground mb-6">
                      After a hospital stay, many patients benefit from in-home care support. 
                      Our personal care assistants can help with recovery, medication reminders, 
                      and daily activities while you heal in the comfort of your home.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button asChild size="lg" data-testid="button-post-hospital">
                        <Link href="/post-hospital-care/massachusetts">Post-Hospital Care</Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" data-testid="button-consultation">
                        <Link href="/consultation">Request a Consultation</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="bg-card border-t py-10" data-testid="footer-find-hospital">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
              <p>© 2025 Private InHome CareGiver. Serving communities across Massachusetts.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <Link href="/privacy-policy" className="hover:text-primary" data-testid="link-footer-privacy">Privacy Policy</Link>
                <Link href="/terms-and-conditions" className="hover:text-primary" data-testid="link-footer-terms">Terms & Conditions</Link>
                <Link href="/consultation" className="hover:text-primary" data-testid="link-footer-contact">Contact Us</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
