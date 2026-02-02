import { useEffect, useMemo } from "react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { 
  Heart, Shield, Award, CheckCircle2, ArrowRight, Phone, 
  Users, Clock, MapPin, Star, Sparkles, DollarSign, 
  HelpCircle, Calendar, ShoppingCart, Utensils, Pill, 
  FileText, Building, Coffee, UserCheck, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import ConciergeRequestForm from "@/components/ConciergeRequestForm";

const CITY_DATA: Record<string, { name: string; county: string; population: string; zipCodes: string[]; neighbors: string[] }> = {
  "boston-ma": { name: "Boston", county: "Suffolk", population: "675,647", zipCodes: ["02101", "02108", "02109", "02110", "02111", "02113", "02114", "02115", "02116", "02118", "02119", "02120", "02121", "02122", "02124", "02125", "02126", "02127", "02128", "02129", "02130", "02131", "02132", "02134", "02135", "02136"], neighbors: ["Cambridge", "Brookline", "Somerville", "Quincy", "Newton"] },
  "cambridge-ma": { name: "Cambridge", county: "Middlesex", population: "118,403", zipCodes: ["02138", "02139", "02140", "02141", "02142"], neighbors: ["Boston", "Somerville", "Arlington", "Watertown", "Belmont"] },
  "worcester-ma": { name: "Worcester", county: "Worcester", population: "206,518", zipCodes: ["01601", "01602", "01603", "01604", "01605", "01606", "01607", "01608", "01609", "01610"], neighbors: ["Auburn", "Shrewsbury", "Holden", "Leicester", "Millbury"] },
  "newton-ma": { name: "Newton", county: "Middlesex", population: "88,923", zipCodes: ["02458", "02459", "02460", "02461", "02462", "02464", "02465", "02466", "02467", "02468"], neighbors: ["Boston", "Brookline", "Wellesley", "Needham", "Watertown"] },
  "brookline-ma": { name: "Brookline", county: "Norfolk", population: "63,191", zipCodes: ["02445", "02446", "02467"], neighbors: ["Boston", "Newton", "Brighton", "Jamaica Plain"] },
  "quincy-ma": { name: "Quincy", county: "Norfolk", population: "101,636", zipCodes: ["02169", "02170", "02171"], neighbors: ["Boston", "Braintree", "Milton", "Weymouth"] },
  "somerville-ma": { name: "Somerville", county: "Middlesex", population: "81,360", zipCodes: ["02143", "02144", "02145"], neighbors: ["Boston", "Cambridge", "Medford", "Arlington", "Charlestown"] },
  "springfield-ma": { name: "Springfield", county: "Hampden", population: "155,929", zipCodes: ["01101", "01102", "01103", "01104", "01105", "01107", "01108", "01109"], neighbors: ["Chicopee", "West Springfield", "Longmeadow", "Agawam", "East Longmeadow"] },
  "lowell-ma": { name: "Lowell", county: "Middlesex", population: "115,554", zipCodes: ["01850", "01851", "01852", "01853", "01854"], neighbors: ["Dracut", "Tewksbury", "Chelmsford", "Billerica"] },
  "brockton-ma": { name: "Brockton", county: "Plymouth", population: "105,643", zipCodes: ["02301", "02302", "02303", "02304", "02305"], neighbors: ["Easton", "Stoughton", "Avon", "Whitman", "West Bridgewater"] },
  "new-bedford-ma": { name: "New Bedford", county: "Bristol", population: "101,079", zipCodes: ["02740", "02744", "02745", "02746"], neighbors: ["Fairhaven", "Dartmouth", "Acushnet", "Freetown"] },
  "fall-river-ma": { name: "Fall River", county: "Bristol", population: "94,000", zipCodes: ["02720", "02721", "02722", "02723", "02724"], neighbors: ["Somerset", "Westport", "Freetown", "Swansea"] },
  "lynn-ma": { name: "Lynn", county: "Essex", population: "101,253", zipCodes: ["01901", "01902", "01903", "01904", "01905"], neighbors: ["Saugus", "Swampscott", "Nahant", "Peabody", "Revere"] },
  "framingham-ma": { name: "Framingham", county: "Middlesex", population: "72,362", zipCodes: ["01701", "01702", "01703", "01704", "01705"], neighbors: ["Natick", "Ashland", "Sudbury", "Wayland", "Southborough"] },
  "waltham-ma": { name: "Waltham", county: "Middlesex", population: "62,227", zipCodes: ["02451", "02452", "02453", "02454"], neighbors: ["Newton", "Watertown", "Lexington", "Lincoln", "Weston"] },
  "medford-ma": { name: "Medford", county: "Middlesex", population: "59,449", zipCodes: ["02155", "02156"], neighbors: ["Somerville", "Malden", "Arlington", "Winchester", "Stoneham"] },
  "malden-ma": { name: "Malden", county: "Middlesex", population: "66,263", zipCodes: ["02148"], neighbors: ["Medford", "Everett", "Revere", "Melrose", "Stoneham"] },
  "weymouth-ma": { name: "Weymouth", county: "Norfolk", population: "57,746", zipCodes: ["02188", "02189", "02190", "02191"], neighbors: ["Braintree", "Quincy", "Hingham", "Rockland", "Abington"] },
  "plymouth-ma": { name: "Plymouth", county: "Plymouth", population: "61,217", zipCodes: ["02360", "02361", "02362"], neighbors: ["Kingston", "Carver", "Wareham", "Bourne"] },
  "lexington-ma": { name: "Lexington", county: "Middlesex", population: "34,454", zipCodes: ["02420", "02421"], neighbors: ["Arlington", "Belmont", "Waltham", "Lincoln", "Burlington", "Bedford", "Concord"] },
  "wellesley-ma": { name: "Wellesley", county: "Norfolk", population: "28,747", zipCodes: ["02481", "02482"], neighbors: ["Newton", "Needham", "Natick", "Weston", "Dover"] },
  "needham-ma": { name: "Needham", county: "Norfolk", population: "31,388", zipCodes: ["02492", "02494"], neighbors: ["Newton", "Wellesley", "Dedham", "Dover", "Westwood"] },
  "natick-ma": { name: "Natick", county: "Middlesex", population: "36,050", zipCodes: ["01760", "01761"], neighbors: ["Framingham", "Wellesley", "Wayland", "Sherborn", "Dover"] },
  "hingham-ma": { name: "Hingham", county: "Plymouth", population: "24,601", zipCodes: ["02043"], neighbors: ["Weymouth", "Cohasset", "Norwell", "Rockland", "Hull"] },
};

const CONCIERGE_SERVICES = [
  { icon: <ShoppingCart className="w-6 h-6" />, title: "Errand Running & Shopping", description: "Grocery shopping, pharmacy pickups, dry cleaning, and essential errands" },
  { icon: <Calendar className="w-6 h-6" />, title: "Appointment Coordination", description: "Medical appointment scheduling, coordination, and reminder services" },
  { icon: <Utensils className="w-6 h-6" />, title: "Meal Planning", description: "Nutritious meal planning, grocery lists, and light meal preparation" },
  { icon: <Pill className="w-6 h-6" />, title: "Medication Management", description: "Pill organizer setup, refill reminders, and pharmacy coordination" },
  { icon: <FileText className="w-6 h-6" />, title: "Paperwork Assistance", description: "Bill organization, mail sorting, and correspondence help" },
  { icon: <Coffee className="w-6 h-6" />, title: "Social Engagement", description: "Accompanying to events, religious services, and community activities" },
];

export default function ConciergeCityPage() {
  const [, params] = useRoute("/concierge-services/massachusetts/:citySlug");
  const citySlug = params?.citySlug || "";
  const cityData = CITY_DATA[citySlug];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [citySlug]);

  const cityName = cityData?.name || citySlug.split("-")[0].charAt(0).toUpperCase() + citySlug.split("-")[0].slice(1);
  const county = cityData?.county || "Massachusetts";
  const population = cityData?.population || "";
  const zipCodes = cityData?.zipCodes || [];
  const neighbors = cityData?.neighbors || [];

  const cityFaqs = useMemo(() => [
    {
      question: `What senior concierge services are available in ${cityName}, Massachusetts?`,
      answer: `Private InHome CareGiver offers comprehensive concierge services in ${cityName} including errand running, grocery shopping, appointment coordination, medication management support, bill organization, meal planning, and social engagement accompaniment. Our ${cityName} concierge staff are familiar with local businesses, pharmacies, grocery stores, and community resources in ${county} County to provide efficient, personalized service.`
    },
    {
      question: `How much do private pay concierge services cost in ${cityName}?`,
      answer: `Private pay concierge services in ${cityName} typically range from $25-$40 per hour depending on the services needed. We offer flexible packages starting at 4 hours per week, with discounts for bundled services. Many ${cityName} families combine weekly shopping, bi-weekly organization, and monthly appointment coordination for comprehensive support.`
    },
    {
      question: `Can concierge staff help my parent in ${cityName} with technology?`,
      answer: `Yes! Our ${cityName} concierge services include patient technology assistance including smartphone help, video calling with family, email management, online shopping, and smart device setup. We help ${cityName} seniors stay connected with family throughout Massachusetts and beyond.`
    },
    {
      question: `Do you serve all neighborhoods in ${cityName}?`,
      answer: `We provide concierge services throughout all ${cityName} neighborhoods and surrounding ${county} County communities including ${neighbors.slice(0, 3).join(", ")}${neighbors.length > 3 ? ", and more" : ""}. Whether your loved one lives in downtown ${cityName} or a quieter neighborhood, our local staff can reach them.`
    },
    {
      question: `How quickly can concierge services start in ${cityName}?`,
      answer: `Most concierge services in ${cityName} can begin within 48-72 hours of your initial consultation. For urgent needs, we can often accommodate same-day or next-day service starts. We carefully match each ${cityName} client with a concierge professional based on personality, needs, and scheduling preferences.`
    },
    {
      question: `Can the same person provide concierge services each week in ${cityName}?`,
      answer: `Consistency is very important for building trust. We prioritize assigning a primary concierge professional to each ${cityName} client for most visits. Your regular concierge learns your loved one's preferences, favorite ${cityName} stores, and specific needs over time.`
    },
  ], [cityName, county, neighbors]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": cityFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
    }))
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Senior Concierge Services ${cityName} Massachusetts`,
    "description": `Premium private pay concierge services for seniors in ${cityName}, MA. Errand running, appointment coordination, meal planning, and lifestyle assistance in ${county} County.`,
    "provider": {
      "@type": "Organization",
      "name": "Private InHome Caregiver",
      "address": { "@type": "PostalAddress", "addressLocality": cityName, "addressRegion": "MA", "addressCountry": "US" }
    },
    "areaServed": { "@type": "City", "name": cityName, "containedInPlace": { "@type": "State", "name": "Massachusetts" } }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://privateinhomecaregiver.com" },
      { "@type": "ListItem", "position": 2, "name": "Concierge Services", "item": "https://privateinhomecaregiver.com/concierge-services/massachusetts" },
      { "@type": "ListItem", "position": 3, "name": cityName, "item": `https://privateinhomecaregiver.com/concierge-services/massachusetts/${citySlug}` }
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Private InHome CareGiver - Concierge Services ${cityName}`,
    "description": `Private pay senior concierge services in ${cityName}, ${county} County, Massachusetts`,
    "image": "https://privateinhomecaregiver.com/images/concierge-services-og.jpg",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": cityName,
      "addressRegion": "MA",
      "addressCountry": "US"
    },
    "areaServed": {
      "@type": "City",
      "name": cityName,
      "containedInPlace": { "@type": "State", "name": "Massachusetts" }
    },
    "priceRange": "$$",
    "telephone": "(617) 686-0595",
    "url": `https://privateinhomecaregiver.com/concierge-services/massachusetts/${citySlug}`,
    "sameAs": ["https://privateinhomecaregiver.com"]
  };

  return (
    <>
      <Helmet>
        <title>Senior Concierge Services {cityName} MA | Private Pay Errands & Appointments | {county} County</title>
        <meta name="description" content={`Private pay senior concierge services in ${cityName}, Massachusetts. Errand running, appointment coordination, medication management, shopping assistance for elderly in ${county} County. Local ${cityName} staff. Free consultation.`} />
        <meta name="keywords" content={`senior concierge ${cityName}, private pay errands ${cityName} MA, elderly shopping assistance ${county} County, appointment coordination ${cityName}, medication management ${cityName}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content={`Senior Concierge Services ${cityName} MA | Private InHome CareGiver`} />
        <meta property="og:description" content={`Premium private pay concierge services for seniors in ${cityName}, Massachusetts. Errands, appointments, meal planning & lifestyle support in ${county} County.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://privateinhomecaregiver.com/concierge-services/massachusetts/${citySlug}`} />
        <meta property="og:image" content="https://privateinhomecaregiver.com/images/concierge-services-og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`Senior concierge services in ${cityName} Massachusetts - Professional elderly assistance`} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="Private InHome CareGiver" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Senior Concierge Services ${cityName} MA | Private Pay Care`} />
        <meta name="twitter:description" content={`Private pay concierge services for ${cityName} seniors. Errands, appointments, meal planning in ${county} County.`} />
        <meta name="twitter:image" content="https://privateinhomecaregiver.com/images/concierge-services-og.jpg" />
        <meta name="twitter:image:alt" content={`Senior concierge services ${cityName} Massachusetts`} />
        
        {/* Geo-targeting */}
        <meta name="geo.region" content="US-MA" />
        <meta name="geo.placename" content={cityName} />
        
        {/* AI Search / GEO Optimization */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large" />
        <meta name="author" content="Private InHome CareGiver" />
        <meta name="topic" content={`Senior Care Services, Concierge Services ${cityName}, Elder Care ${county} County`} />
        <meta name="summary" content={`Private pay senior concierge services in ${cityName}, ${county} County, Massachusetts. Errand running, appointment coordination, meal planning, medication management support for elderly.`} />
        <meta name="classification" content="Healthcare Services, Senior Care, Concierge Services" />
        <meta name="category" content="Senior Care" />
        <meta name="coverage" content={`${cityName}, ${county} County, Massachusetts`} />
        
        <link rel="canonical" href={`https://privateinhomecaregiver.com/concierge-services/massachusetts/${citySlug}`} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      </Helmet>

      <Header />

      <main>
        <section className="relative min-h-[50vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80&auto=format&fit=crop"
              alt={`Senior concierge services ${cityName} Massachusetts - Private pay non-medical care for elderly in ${county} County`}
              title={`Concierge Services ${cityName} - Private InHome CareGiver`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
            <div className="max-w-2xl">
              <nav className="flex items-center gap-2 text-white/80 text-sm mb-6">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/concierge-services/massachusetts" className="hover:text-white">Concierge Services</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{cityName}</span>
              </nav>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
                <MapPin className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">{cityName}, {county} County, MA</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                Senior Concierge Services in {cityName}
                <span className="block text-2xl md:text-3xl font-normal text-white/80 mt-4">
                  Private Pay Non-Medical Care for {county} County Seniors
                </span>
              </h1>
              
              <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-xl">
                Professional errand running, appointment coordination, and lifestyle assistance 
                for seniors throughout {cityName} and surrounding {county} County communities.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/consultation">
                    <Phone className="w-5 h-5" />
                    Free Consultation
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

        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Serving {cityName}</h3>
                  <p className="text-muted-foreground text-sm">
                    {county} County{population && ` • Pop. ${population}`}
                  </p>
                  {zipCodes.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ZIP Codes: {zipCodes.slice(0, 5).join(", ")}{zipCodes.length > 5 && "..."}
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Flexible Hours</h3>
                  <p className="text-muted-foreground text-sm">
                    Services available 7 days/week. Starting at 4 hours weekly.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Private Pay Rates</h3>
                  <p className="text-muted-foreground text-sm">
                    $25-$40/hour with package discounts available
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Concierge Services Available in {cityName}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our local {cityName} concierge professionals provide comprehensive non-medical 
                support to help seniors maintain independence and quality of life.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CONCIERGE_SERVICES.map((service, index) => (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                      {service.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {neighbors.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Also Serving Nearby {county} County Communities
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {neighbors.map((neighbor) => (
                  <Badge key={neighbor} variant="secondary" className="text-sm py-2 px-4">
                    <MapPin className="w-3 h-3 mr-1" />
                    {neighbor}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-12 bg-background">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4">
                <HelpCircle className="w-4 h-4 mr-1" />
                Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl font-bold text-foreground">
                Concierge Services FAQ for {cityName}
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {cityFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-6">
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

        <section id="request-form" className="py-16 bg-gradient-to-b from-primary/10 to-primary/5">
          <div className="max-w-4xl mx-auto px-4">
            <div className="p-8 bg-background rounded-2xl border-2 border-primary/30 shadow-xl">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-primary text-primary-foreground text-sm px-4 py-1">Get Started Today</Badge>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Request Concierge Services in {cityName}
                </h2>
                <p className="text-muted-foreground text-lg">
                  Fill out the form below and our {cityName} care team will contact you within 24 hours
                </p>
              </div>
              <ConciergeRequestForm city={cityName} />
            </div>
          </div>
        </section>

        <section className="py-12 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready for Concierge Services in {cityName}?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Contact us today for a free consultation and learn how our {cityName} 
              concierge team can support your family.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/consultation">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Consultation
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/concierge-services/massachusetts">
                  View All Locations
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
