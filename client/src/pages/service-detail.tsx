import { useEffect } from "react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { 
  Heart, Shield, Award, CheckCircle2, ArrowRight, Phone, 
  Users, Clock, Home, Star, Sparkles, ChevronDown,
  UserCheck, MapPin, DollarSign, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getServiceContent, type ServiceContent } from "@/constants/serviceContent";
import Header from "@/components/Header";
import { Link } from "wouter";

const iconMap: Record<string, React.ReactNode> = {
  "home": <Home className="w-6 h-6" />,
  "user": <Users className="w-6 h-6" />,
  "award": <Award className="w-6 h-6" />,
  "clock": <Clock className="w-6 h-6" />,
  "heart": <Heart className="w-6 h-6" />,
  "brain": <Sparkles className="w-6 h-6" />,
  "shield": <Shield className="w-6 h-6" />,
  "calendar": <Clock className="w-6 h-6" />,
  "graduation-cap": <Award className="w-6 h-6" />,
  "star": <Star className="w-6 h-6" />,
  "battery": <Clock className="w-6 h-6" />,
  "check-circle": <CheckCircle2 className="w-6 h-6" />,
  "dollar-sign": <DollarSign className="w-6 h-6" />,
  "moon": <Clock className="w-6 h-6" />,
  "sun": <Sparkles className="w-6 h-6" />,
  "activity": <Heart className="w-6 h-6" />,
  "trending-down": <Shield className="w-6 h-6" />,
  "utensils": <Home className="w-6 h-6" />,
  "smile": <Heart className="w-6 h-6" />,
};

// Premium hero images for each service type - seniors only, unique per service
const serviceHeroImages: Record<string, string> = {
  // Personal Care: Caregiver helping elderly person with daily activities
  "personal-care": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80&auto=format&fit=crop",
  // Companionship: Senior enjoying conversation/social engagement
  "companionship": "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1600&q=80&auto=format&fit=crop",
  // Homemaking: Clean, welcoming home environment
  "homemaking": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80&auto=format&fit=crop",
  // Dementia Care: Supportive memory care interaction
  "dementia-care": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1600&q=80&auto=format&fit=crop",
  // Respite Care: Family caregiver getting relief/rest
  "respite-care": "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1600&q=80&auto=format&fit=crop",
  // Live-In Care: 24/7 presence in home setting
  "live-in-care": "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=1600&q=80&auto=format&fit=crop",
  // Overnight Care: Peaceful nighttime/bedroom setting
  "overnight-care": "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1600&q=80&auto=format&fit=crop",
  // Post-Hospital Care: Recovery/rehabilitation support
  "post-hospital-care": "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=1600&q=80&auto=format&fit=crop",
};

function getServiceHeroImage(serviceKey: string): string {
  return serviceHeroImages[serviceKey] || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80";
}

export default function ServiceDetailPage() {
  const [, params] = useRoute("/:serviceKey/massachusetts");
  const serviceKey = params?.serviceKey || "";
  const service = getServiceContent(serviceKey);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [serviceKey]);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
          <Button asChild>
            <a href="/services">View All Services</a>
          </Button>
        </div>
      </div>
    );
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": service.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.heroDescription,
    "provider": {
      "@type": "Organization",
      "name": "Private InHome Caregiver",
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "Massachusetts",
        "addressCountry": "US"
      }
    },
    "areaServed": {
      "@type": "State",
      "name": "Massachusetts"
    },
    "serviceType": service.title
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://privateinhomecaregiver.com" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://privateinhomecaregiver.com/services" },
      { "@type": "ListItem", "position": 3, "name": service.title, "item": `https://privateinhomecaregiver.com/${serviceKey}/massachusetts` }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{service.title} in Massachusetts | Private InHome Caregiver</title>
        <meta name="description" content={service.heroDescription} />
        <meta property="og:title" content={`${service.title} in Massachusetts`} />
        <meta property="og:description" content={service.heroDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`https://privateinhomecaregiver.com/${serviceKey}/massachusetts`} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <Header />

      <main>
        {/* Premium Hero Section with Real Images */}
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={getServiceHeroImage(serviceKey)}
              alt={service.title}
              className="w-full h-full object-cover"
              data-testid="img-service-hero"
            />
            {/* Lighter gradient overlay - 50% opacity for better visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
            <div className="max-w-2xl animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Private Care Throughout Massachusetts</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                {service.title}
                <span className="block text-2xl md:text-3xl font-normal text-white/80 mt-4">
                  {service.tagline}
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed drop-shadow">
                {service.heroDescription}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="text-base px-8 shadow-xl" asChild>
                  <a href="#contact" data-testid="button-get-started">
                    Get Free Consultation
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-base px-8 border-white/20 text-white bg-white/5" asChild>
                  <a href="tel:+16176860595" data-testid="button-call">
                    <Phone className="w-5 h-5 mr-2" />
                    (617) 686-0595
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Benefits Grid */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {service.benefits.map((benefit, idx) => (
                <Card key={idx} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-border/50 hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      {iconMap[benefit.icon] || <Heart className="w-6 h-6" />}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  About Our {service.title}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {service.overview}
                </p>
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Questions? Call us today</p>
                    <a href="tel:+16176860595" className="text-lg font-bold text-primary hover:underline">
                      (617) 686-0595
                    </a>
                  </div>
                </div>
              </div>
              
              <div>
                <Card className="border-2 border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Users className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-bold">Who Benefits</h3>
                    </div>
                    <ul className="space-y-3">
                      {service.whoItHelps.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Services Included */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Services Included</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive care tailored to your needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.servicesIncluded.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Caregiver Standards */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                  <UserCheck className="w-4 h-4" />
                  Our Standards
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Caregiver Qualifications
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Every caregiver we hire meets rigorous standards to ensure your loved one receives the highest quality care.
                </p>
                <Button size="lg" asChild>
                  <a href="#contact">
                    Meet Our Caregivers
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              </div>
              
              <div className="space-y-4">
                {service.caregiverStandards.map((standard, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-foreground">{standard}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing & Coverage */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pricing Card */}
              <Card className="border-2 border-border/50 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Pricing Information</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {service.pricingInfo}
                  </p>
                  <Button className="w-full" asChild>
                    <a href="#contact">Get Free Quote</a>
                  </Button>
                </CardContent>
              </Card>

              {/* Coverage Card */}
              <Card className="border-2 border-border/50 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Coverage Areas</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {service.coverageAreas.map((area, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-muted rounded-full text-sm font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30" id="faq">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                <HelpCircle className="w-4 h-4" />
                Common Questions
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about our {service.title.toLowerCase()}
              </p>
            </div>
            
            <Card className="border-2 border-border/50">
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {service.faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`} className="border-border/50">
                      <AccordionTrigger className="text-left hover:no-underline hover:text-primary py-4" data-testid={`faq-trigger-${idx}`}>
                        <span className="font-semibold pr-4">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80" id="contact">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Schedule your free care consultation today and discover how our {service.title.toLowerCase()} can help your family.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="text-base px-8" asChild>
                <a href="/consultation" data-testid="button-schedule-consultation">
                  Schedule Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 border-white/30 text-white bg-white/10" asChild>
                <a href="tel:+16176860595">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
