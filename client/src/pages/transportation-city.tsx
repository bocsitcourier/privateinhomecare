import { useEffect, useMemo } from "react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { 
  Car, Shield, CheckCircle2, ArrowRight, Phone, Clock, MapPin, 
  Star, DollarSign, HelpCircle, Calendar, Stethoscope, ShoppingCart,
  Building, Heart, Accessibility, Navigation, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Header from "@/components/Header";
import TransportationRequestForm from "@/components/TransportationRequestForm";

const CITY_DATA: Record<string, { name: string; county: string; population: string; zipCodes: string[]; neighbors: string[]; hospitals: string[] }> = {
  "boston-ma": { name: "Boston", county: "Suffolk", population: "675,647", zipCodes: ["02101", "02108", "02109", "02110", "02111", "02113", "02114", "02115", "02116", "02118", "02119", "02120", "02121", "02122", "02124", "02125", "02126", "02127", "02128", "02129", "02130", "02131", "02132", "02134", "02135", "02136"], neighbors: ["Cambridge", "Brookline", "Somerville", "Quincy", "Newton"], hospitals: ["Mass General Hospital", "Brigham and Women's", "Beth Israel Deaconess", "Boston Medical Center", "Dana-Farber Cancer Institute"] },
  "cambridge-ma": { name: "Cambridge", county: "Middlesex", population: "118,403", zipCodes: ["02138", "02139", "02140", "02141", "02142"], neighbors: ["Boston", "Somerville", "Arlington", "Watertown", "Belmont"], hospitals: ["Mount Auburn Hospital", "Cambridge Health Alliance", "Massachusetts General Hospital"] },
  "worcester-ma": { name: "Worcester", county: "Worcester", population: "206,518", zipCodes: ["01601", "01602", "01603", "01604", "01605", "01606", "01607", "01608", "01609", "01610"], neighbors: ["Auburn", "Shrewsbury", "Holden", "Leicester", "Millbury"], hospitals: ["UMass Memorial Medical Center", "Saint Vincent Hospital", "Reliant Medical Group"] },
  "newton-ma": { name: "Newton", county: "Middlesex", population: "88,923", zipCodes: ["02458", "02459", "02460", "02461", "02462", "02464", "02465", "02466", "02467", "02468"], neighbors: ["Boston", "Brookline", "Wellesley", "Needham", "Watertown"], hospitals: ["Newton-Wellesley Hospital", "Beth Israel Deaconess", "Brigham and Women's"] },
  "brookline-ma": { name: "Brookline", county: "Norfolk", population: "63,191", zipCodes: ["02445", "02446", "02467"], neighbors: ["Boston", "Newton", "Brighton", "Jamaica Plain"], hospitals: ["Beth Israel Deaconess", "Brigham and Women's", "Boston Children's Hospital"] },
  "quincy-ma": { name: "Quincy", county: "Norfolk", population: "101,636", zipCodes: ["02169", "02170", "02171"], neighbors: ["Boston", "Braintree", "Milton", "Weymouth"], hospitals: ["South Shore Hospital", "Boston Medical Center", "Beth Israel Deaconess Milton"] },
  "somerville-ma": { name: "Somerville", county: "Middlesex", population: "81,360", zipCodes: ["02143", "02144", "02145"], neighbors: ["Boston", "Cambridge", "Medford", "Arlington", "Charlestown"], hospitals: ["Cambridge Health Alliance", "Mass General Hospital", "Mount Auburn Hospital"] },
  "springfield-ma": { name: "Springfield", county: "Hampden", population: "155,929", zipCodes: ["01101", "01102", "01103", "01104", "01105", "01107", "01108", "01109"], neighbors: ["Chicopee", "West Springfield", "Longmeadow", "Agawam", "East Longmeadow"], hospitals: ["Baystate Medical Center", "Mercy Medical Center", "Shriners Hospital for Children"] },
  "lowell-ma": { name: "Lowell", county: "Middlesex", population: "115,554", zipCodes: ["01850", "01851", "01852", "01853", "01854"], neighbors: ["Dracut", "Tewksbury", "Chelmsford", "Billerica"], hospitals: ["Lowell General Hospital", "Saints Medical Center", "Tufts Medical Center"] },
  "brockton-ma": { name: "Brockton", county: "Plymouth", population: "105,643", zipCodes: ["02301", "02302", "02303", "02304", "02305"], neighbors: ["Easton", "Stoughton", "Avon", "Whitman", "West Bridgewater"], hospitals: ["Good Samaritan Medical Center", "Signature Healthcare Brockton Hospital", "South Shore Hospital"] },
  "new-bedford-ma": { name: "New Bedford", county: "Bristol", population: "101,079", zipCodes: ["02740", "02744", "02745", "02746"], neighbors: ["Fairhaven", "Dartmouth", "Acushnet", "Freetown"], hospitals: ["St. Luke's Hospital", "Southcoast Hospitals Group", "Charlton Memorial Hospital"] },
  "fall-river-ma": { name: "Fall River", county: "Bristol", population: "94,000", zipCodes: ["02720", "02721", "02722", "02723", "02724"], neighbors: ["Somerset", "Westport", "Freetown", "Swansea"], hospitals: ["Charlton Memorial Hospital", "Saint Anne's Hospital", "Southcoast Health System"] },
  "lynn-ma": { name: "Lynn", county: "Essex", population: "101,253", zipCodes: ["01901", "01902", "01903", "01904", "01905"], neighbors: ["Saugus", "Swampscott", "Nahant", "Peabody", "Revere"], hospitals: ["North Shore Medical Center", "Salem Hospital", "Mass General Hospital"] },
  "framingham-ma": { name: "Framingham", county: "Middlesex", population: "72,362", zipCodes: ["01701", "01702", "01703", "01704", "01705"], neighbors: ["Natick", "Ashland", "Sudbury", "Wayland", "Southborough"], hospitals: ["MetroWest Medical Center", "Newton-Wellesley Hospital", "Brigham and Women's Faulkner"] },
  "waltham-ma": { name: "Waltham", county: "Middlesex", population: "62,227", zipCodes: ["02451", "02452", "02453", "02454"], neighbors: ["Newton", "Watertown", "Lexington", "Lincoln", "Weston"], hospitals: ["Newton-Wellesley Hospital", "Mount Auburn Hospital", "Mass General Hospital"] },
  "medford-ma": { name: "Medford", county: "Middlesex", population: "59,449", zipCodes: ["02155", "02156"], neighbors: ["Somerville", "Malden", "Arlington", "Winchester", "Stoneham"], hospitals: ["Lawrence Memorial Hospital", "Hallmark Health", "Mass General Hospital"] },
  "malden-ma": { name: "Malden", county: "Middlesex", population: "66,263", zipCodes: ["02148"], neighbors: ["Medford", "Everett", "Revere", "Melrose", "Stoneham"], hospitals: ["CHA Everett Hospital", "MelroseWakefield Hospital", "Mass General Hospital"] },
  "weymouth-ma": { name: "Weymouth", county: "Norfolk", population: "57,746", zipCodes: ["02188", "02189", "02190", "02191"], neighbors: ["Braintree", "Quincy", "Hingham", "Rockland", "Abington"], hospitals: ["South Shore Hospital", "Beth Israel Deaconess Milton", "Boston Medical Center"] },
  "plymouth-ma": { name: "Plymouth", county: "Plymouth", population: "61,217", zipCodes: ["02360", "02361", "02362"], neighbors: ["Kingston", "Carver", "Wareham", "Bourne"], hospitals: ["Beth Israel Deaconess Plymouth", "South Shore Hospital", "Cape Cod Hospital"] },
  "lexington-ma": { name: "Lexington", county: "Middlesex", population: "34,454", zipCodes: ["02420", "02421"], neighbors: ["Arlington", "Belmont", "Waltham", "Lincoln", "Burlington", "Bedford", "Concord"], hospitals: ["Lahey Hospital Burlington", "Mount Auburn Hospital", "Mass General Hospital"] },
  "wellesley-ma": { name: "Wellesley", county: "Norfolk", population: "28,747", zipCodes: ["02481", "02482"], neighbors: ["Newton", "Needham", "Natick", "Weston", "Dover"], hospitals: ["Newton-Wellesley Hospital", "Brigham and Women's", "Dana-Farber Cancer Institute"] },
  "needham-ma": { name: "Needham", county: "Norfolk", population: "31,388", zipCodes: ["02492", "02494"], neighbors: ["Newton", "Wellesley", "Dedham", "Dover", "Westwood"], hospitals: ["Newton-Wellesley Hospital", "Beth Israel Deaconess", "Brigham and Women's Faulkner"] },
  "natick-ma": { name: "Natick", county: "Middlesex", population: "36,050", zipCodes: ["01760", "01761"], neighbors: ["Framingham", "Wellesley", "Wayland", "Sherborn", "Dover"], hospitals: ["MetroWest Medical Center", "Newton-Wellesley Hospital", "UMass Memorial Marlborough"] },
  "hingham-ma": { name: "Hingham", county: "Plymouth", population: "24,601", zipCodes: ["02043"], neighbors: ["Weymouth", "Cohasset", "Norwell", "Rockland", "Hull"], hospitals: ["South Shore Hospital", "Beth Israel Deaconess Plymouth", "Boston Medical Center"] },
};

const TRANSPORTATION_SERVICES = [
  { icon: <Stethoscope className="w-6 h-6" />, title: "Medical Appointments", description: "Doctor visits, specialist appointments, physical therapy, lab work" },
  { icon: <Building className="w-6 h-6" />, title: "Dialysis & Treatment", description: "Recurring dialysis, chemotherapy, radiation, wound care" },
  { icon: <ShoppingCart className="w-6 h-6" />, title: "Shopping & Errands", description: "Grocery stores, pharmacy, banking, post office" },
  { icon: <Heart className="w-6 h-6" />, title: "Social & Religious", description: "Church services, senior centers, family events" },
  { icon: <Star className="w-6 h-6" />, title: "Recreational", description: "Restaurants, museums, parks, entertainment" },
  { icon: <Accessibility className="w-6 h-6" />, title: "Wheelchair Transport", description: "Accessible vehicles for wheelchairs and mobility devices" },
];

export default function TransportationCityPage() {
  const [, params] = useRoute("/non-medical-transportation/massachusetts/:citySlug");
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
  const hospitals = cityData?.hospitals || [];

  const cityFaqs = useMemo(() => [
    {
      question: `What senior transportation services are available in ${cityName}, Massachusetts?`,
      answer: `Private InHome CareGiver offers comprehensive non-medical transportation in ${cityName} including rides to medical appointments, dialysis, shopping, religious services, and social activities. Our ${cityName} drivers provide door-through-door service with wheelchair accessibility. We serve all ${cityName} neighborhoods and regularly transport seniors to ${hospitals.slice(0, 2).join(" and ")} and other ${county} County medical facilities.`
    },
    {
      question: `How much does private pay senior transportation cost in ${cityName}?`,
      answer: `Senior transportation in ${cityName} typically costs $35-$75 per one-way trip depending on distance. Local trips under 10 miles within ${cityName} are $35-$50 including wait time. Round-trip packages and recurring ride discounts are available for ${cityName} seniors with regular appointments like dialysis.`
    },
    {
      question: `Do you provide wheelchair accessible transportation in ${cityName}?`,
      answer: `Yes! Our ${cityName} fleet includes wheelchair-accessible vehicles with ramps and secure tie-downs at no extra charge. We accommodate standard wheelchairs, electric wheelchairs, mobility scooters, walkers, and canes. Just let us know your needs when booking.`
    },
    {
      question: `Can you transport seniors from ${cityName} to Boston hospitals?`,
      answer: `Absolutely. We regularly provide transportation from ${cityName} to major Boston medical centers including ${hospitals.slice(0, 3).join(", ")}. Our drivers are familiar with Boston hospital parking, entrance locations, and navigation. We offer flat-rate packages for ${cityName} to Boston medical trips.`
    },
    {
      question: `How far in advance should I book senior transportation in ${cityName}?`,
      answer: `For best availability in ${cityName}, book 48-72 hours ahead. Same-day booking is often available for urgent medical appointments. For recurring trips like dialysis from ${cityName}, we set up standing reservations so you don't need to call each time.`
    },
    {
      question: `Will the driver wait during my appointment in ${cityName}?`,
      answer: `Yes, our standard ${cityName} service includes wait time during appointments. For trips under 2 hours total (including travel and appointment), wait time is included in your quoted rate. Drivers remain on-site or nearby and are ready when you finish.`
    },
  ], [cityName, county, hospitals]);

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
    "name": `Non-Medical Senior Transportation ${cityName} Massachusetts`,
    "description": `Private pay non-medical transportation for seniors in ${cityName}, MA. Medical appointments, dialysis, shopping, and social activities. Door-through-door service in ${county} County.`,
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
      { "@type": "ListItem", "position": 2, "name": "Transportation", "item": "https://privateinhomecaregiver.com/non-medical-transportation/massachusetts" },
      { "@type": "ListItem", "position": 3, "name": cityName, "item": `https://privateinhomecaregiver.com/non-medical-transportation/massachusetts/${citySlug}` }
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Private InHome CareGiver - Transportation ${cityName}`,
    "description": `Private pay senior transportation in ${cityName}, ${county} County, Massachusetts`,
    "image": "https://privateinhomecaregiver.com/images/transportation-services-og.jpg",
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
    "url": `https://privateinhomecaregiver.com/non-medical-transportation/massachusetts/${citySlug}`,
    "sameAs": ["https://privateinhomecaregiver.com"]
  };

  return (
    <>
      <Helmet>
        <title>Senior Transportation {cityName} MA | Private Pay Non-Medical Rides | {county} County</title>
        <meta name="description" content={`Private pay senior transportation in ${cityName}, Massachusetts. Medical appointments, dialysis, shopping, wheelchair accessible vehicles. Door-through-door service in ${county} County. Free quote.`} />
        <meta name="keywords" content={`senior transportation ${cityName}, private pay elderly rides ${cityName} MA, wheelchair transport ${county} County, medical appointment rides ${cityName}, dialysis transportation ${cityName}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content={`Senior Transportation ${cityName} MA | Private InHome CareGiver`} />
        <meta property="og:description" content={`Private pay non-medical transportation for seniors in ${cityName}, Massachusetts. Medical appointments, dialysis, shopping in ${county} County.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://privateinhomecaregiver.com/non-medical-transportation/massachusetts/${citySlug}`} />
        <meta property="og:image" content="https://privateinhomecaregiver.com/images/transportation-services-og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`Senior transportation services in ${cityName} Massachusetts - Wheelchair accessible rides`} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="Private InHome CareGiver" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Senior Transportation ${cityName} MA | Private Pay Rides`} />
        <meta name="twitter:description" content={`Private pay transportation for ${cityName} seniors. Medical appointments, dialysis, wheelchair accessible in ${county} County.`} />
        <meta name="twitter:image" content="https://privateinhomecaregiver.com/images/transportation-services-og.jpg" />
        <meta name="twitter:image:alt" content={`Senior transportation ${cityName} Massachusetts`} />
        
        {/* Geo-targeting */}
        <meta name="geo.region" content="US-MA" />
        <meta name="geo.placename" content={cityName} />
        
        {/* AI Search / GEO Optimization */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large" />
        <meta name="author" content="Private InHome CareGiver" />
        <meta name="topic" content={`Senior Transportation ${cityName}, Non-Medical Rides, Elder Care ${county} County`} />
        <meta name="summary" content={`Private pay senior transportation in ${cityName}, ${county} County, Massachusetts. Door-through-door service for medical appointments, dialysis, shopping, and social activities.`} />
        <meta name="classification" content="Healthcare Services, Senior Transportation, Non-Medical Rides" />
        <meta name="category" content="Senior Transportation" />
        <meta name="coverage" content={`${cityName}, ${county} County, Massachusetts`} />
        
        <link rel="canonical" href={`https://privateinhomecaregiver.com/non-medical-transportation/massachusetts/${citySlug}`} />
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
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=80&auto=format&fit=crop"
              alt={`Senior transportation ${cityName} Massachusetts - Private pay non-medical rides for elderly in ${county} County`}
              title={`Senior Transportation ${cityName} - Private InHome CareGiver`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
            <div className="max-w-2xl">
              <nav className="flex items-center gap-2 text-white/80 text-sm mb-6">
                <Link href="/" className="hover:text-white">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/non-medical-transportation/massachusetts" className="hover:text-white">Transportation</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{cityName}</span>
              </nav>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
                <Car className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">{cityName}, {county} County, MA</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                Senior Transportation in {cityName}
                <span className="block text-2xl md:text-3xl font-normal text-white/80 mt-4">
                  Private Pay Non-Medical Rides for {county} County
                </span>
              </h1>
              
              <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-xl">
                Door-through-door transportation to medical appointments, dialysis, shopping, 
                and social activities throughout {cityName} and surrounding communities.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/consultation">
                    <Phone className="w-5 h-5" />
                    Get Free Quote
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
                  <h3 className="font-semibold text-lg mb-2">Available 7 Days</h3>
                  <p className="text-muted-foreground text-sm">
                    Same-day booking available. Wait time included.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Transparent Pricing</h3>
                  <p className="text-muted-foreground text-sm">
                    $35-$75/trip with recurring discounts
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Transportation Services in {cityName}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our trained {cityName} drivers provide safe, reliable transportation with 
                door-through-door assistance for seniors throughout {county} County.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRANSPORTATION_SERVICES.map((service, index) => (
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

        {hospitals.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Regular Transportation to {county} County Hospitals
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {hospitals.map((hospital) => (
                  <Badge key={hospital} variant="secondary" className="text-sm py-2 px-4">
                    <Building className="w-3 h-3 mr-1" />
                    {hospital}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {neighbors.length > 0 && (
          <section className="py-12 bg-background">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Also Serving Nearby Communities
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {neighbors.map((neighbor) => (
                  <Badge key={neighbor} variant="outline" className="text-sm py-2 px-4">
                    <MapPin className="w-3 h-3 mr-1" />
                    {neighbor}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4">
                <HelpCircle className="w-4 h-4 mr-1" />
                Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl font-bold text-foreground">
                Transportation FAQ for {cityName}
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {cityFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-6 bg-background">
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
                  Request Transportation in {cityName}
                </h2>
                <p className="text-muted-foreground text-lg">
                  Fill out the form below and our {cityName} transportation team will contact you within 24 hours
                </p>
              </div>
              <TransportationRequestForm city={cityName} />
            </div>
          </div>
        </section>

        <section className="py-12 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready for Senior Transportation in {cityName}?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Contact us today for a free quote and experience our safe, reliable 
              transportation service for {cityName} seniors.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/consultation">
                  <Car className="w-5 h-5 mr-2" />
                  Get Free Quote
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/non-medical-transportation/massachusetts">
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
