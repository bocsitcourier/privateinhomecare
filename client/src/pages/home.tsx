import { useEffect, useMemo, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import ReviewCard from "@/components/ReviewCard";
import ContactForm from "@/components/ContactForm";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, Users, Home as HomeIcon, Brain, Phone, Mail, MapPin, ArrowRight, Clock, DollarSign } from "lucide-react";
import type { Article, Job } from "@shared/schema";
import caregiverImage from "@assets/compassionate inhome care_1760033982348.webp";
import careCoordinatorImage from "@assets/Private inhome care in MA_1760035857926.png";
import susanImage from "@assets/susan-testimonial.png";
import carlosImage from "@assets/carlos-testimonial.png";
import evelynImage from "@assets/evelyn-testimonial.png";

const DEMO_JOBS = [
  { id: 1, title: "PCA — Dementia Support (Newton)", type: "Part-time", desc: "4 hours/day, 5 days/week. Dementia experience preferred. $22/hr" },
  { id: 2, title: "Overnight Caregiver (Brookline)", type: "Overnight", desc: "Overnight shift — reliable, patient caregiver. $24/hr" },
  { id: 3, title: "Companion Care (Cambridge)", type: "Fill-in", desc: "Afternoon visits to assist with errands and companionship. $19/hr" },
];

const DEMO_REVIEWS = [
  {
    id: 1,
    name: "Susan R.",
    city: "Newton, MA",
    rating: 5,
    text: "PrivateInHomeCareGiver matched us with a caring PCA quickly. Mom is happier and safer at home — thank you!",
    image: susanImage,
  },
  {
    id: 2,
    name: "Carlos M.",
    city: "Brookline, MA",
    rating: 5,
    text: "Professional, punctual, and compassionate. We appreciate the continuity of care.",
    image: carlosImage,
  },
  {
    id: 3,
    name: "Evelyn P.",
    city: "Cambridge, MA",
    rating: 5,
    text: "Excellent caregiver — helped with daily routines and brought calm to our household.",
    image: evelynImage,
  },
];

const SERVICES = [
  { 
    key: "personal-care", 
    title: "Personal Care", 
    short: "Bathing, grooming, toileting, transfers.", 
    full: "Personal care: bathing, grooming, dressing, toileting, transfers and mobility assistance; includes medication reminders and dignity-first support.",
    icon: <Heart className="w-6 h-6 text-primary" />
  },
  { 
    key: "companionship", 
    title: "Companionship", 
    short: "Friendly visits and social support.", 
    full: "Companionship: conversation, activities, escorting to appointments, and reducing social isolation.",
    icon: <Users className="w-6 h-6 text-primary" />
  },
  { 
    key: "homemaking", 
    title: "Homemaking & Errands", 
    short: "Meal prep, light housekeeping, shopping.", 
    full: "Homemaking: meal prep, light housekeeping, laundry, grocery shopping, and transportation to appointments.",
    icon: <HomeIcon className="w-6 h-6 text-primary" />
  },
  { 
    key: "dementia-care", 
    title: "Specialized Dementia Care", 
    short: "Structured, patient-centered support.", 
    full: "Specialized dementia care with staff trained in communication, routines, and safety for loved ones living with memory loss.",
    icon: <Brain className="w-6 h-6 text-primary" />
  },
];

const CITIES = [
  "Andover","Arlington","Barnstable","Berkshires","Beverly","Boston","Brookline","Charlestown","Chatham","Falmouth","Gloucester","Haverhill","Lexington","Lowell","Marblehead","Mashpee","Melrose","Methuen","Newton","Northborough","Plymouth","Quincy","Salem","Seacoast","Somerville","Springfield","Waltham","Wellesley","Westport","Worcester"
].sort();

export default function Home() {
  const [selectedService, setSelectedService] = useState("");
  const [showFullAbout, setShowFullAbout] = useState(false);
  const contactRef = useRef<HTMLElement>(null);

  const { data: articles } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const publishedArticles = Array.isArray(articles) 
    ? articles.filter(a => a.status === 'published')
    : [];

  const publishedJobs = Array.isArray(jobs)
    ? jobs.filter(j => j.status === 'published').slice(0, 3)
    : [];

  const categories = ["All", "Care Tips", "Health & Wellness", "Family Resources"];

  const getArticlesByCategory = (category: string) => {
    if (category === "All") {
      return publishedArticles.slice(0, 6);
    }
    
    const filtered = publishedArticles.filter(article => article.category === category);
    return filtered.slice(0, 6);
  };


  const schemaJson = useMemo(() => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://privateinhomecaregiver.com';
      
      const businessSchema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "PrivateInHomeCareGiver",
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: "Private in-home personal care, companionship, homemaking and dementia care across Massachusetts.",
        telephone: "+1-617-686-0595",
        address: {
          "@type": "PostalAddress",
          streetAddress: "3 Cabot Place, Ste. 10A",
          addressLocality: "Stoughton",
          addressRegion: "MA",
          postalCode: "02072",
          addressCountry: "US"
        },
        service: SERVICES.map((s) => ({ "@type": "Service", name: s.title, description: s.full })),
        review: DEMO_REVIEWS.map((r) => ({ 
          "@type": "Review", 
          reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5" }, 
          author: { "@type": "Person", name: r.name }, 
          reviewBody: r.text 
        })),
        areaServed: CITIES.map(city => ({
          "@type": "City",
          name: city,
          "@id": `https://www.wikidata.org/wiki/${city.replace(/\s+/g, '_')}`
        })),
      };

      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "PrivateInHomeCareGiver",
        url: baseUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/articles?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      };

      const navigationSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Site Navigation",
        itemListElement: [
          { "@type": "SiteNavigationElement", position: 1, name: "About", url: `${baseUrl}/#about` },
          { "@type": "SiteNavigationElement", position: 2, name: "Services", url: `${baseUrl}/services` },
          { "@type": "SiteNavigationElement", position: 3, name: "Locations", url: `${baseUrl}/#areas` },
          { "@type": "SiteNavigationElement", position: 4, name: "Articles", url: `${baseUrl}/articles` },
          { "@type": "SiteNavigationElement", position: 5, name: "Find Caregivers", url: `${baseUrl}/caregivers` },
          { "@type": "SiteNavigationElement", position: 6, name: "Careers", url: `${baseUrl}/careers` },
          { "@type": "SiteNavigationElement", position: 7, name: "Contact Us", url: `${baseUrl}/consultation` }
        ]
      };

      return JSON.stringify([businessSchema, websiteSchema, navigationSchema]);
    } catch (err) {
      console.error("Error building schema JSON", err);
      return "[]";
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof document !== "undefined") {
        const existing = document.getElementById("pi-schema-json");
        if (existing) existing.remove();
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.id = "pi-schema-json";
        s.text = schemaJson;
        document.head.appendChild(s);
      }
    } catch (e) {
      // ignore
    }
  }, [schemaJson]);

  const handleRequestService = (title: string) => {
    setSelectedService(title);
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSEO 
        pageSlug="home"
        fallbackTitle="PrivateInHomeCareGiver — In-Home Care in Massachusetts"
        fallbackDescription="Private in-home personal care, companionship, homemaking and dementia care across Massachusetts. Professional, compassionate caregivers serving families throughout the state."
      />
      <Header />
      
      <main>
        <Hero />

        <section id="about" className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <Card>
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-center text-primary mb-8">
                About Us: Your Peace, Our Compassion
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <img 
                    src={caregiverImage} 
                    alt="Compassionate caregiver with elderly client in a warm, comfortable home setting"
                    className="rounded-lg shadow-lg w-full h-auto object-cover"
                    data-testid="img-about-caregiver"
                  />
                </div>
                
                <div className="space-y-6 text-foreground/80 leading-relaxed order-1 md:order-2">
                  <p>
                    The journey of caring for a loved one is filled with deep love, but it often carries a heavy, isolating burden—the exhaustion, the constant worry, and the guilt that surfaces when you feel you cannot do it all. Choosing to invite professional support into your home is one of the most critical and heartfelt decisions a family will ever make. At Private InHome CareGiver, our mission is anchored in eliminating that anxiety by becoming your trusted partner, providing profound peace of mind. We understand that you do not want to stop caring; you simply need support. Our service allows you to step back from the taxing day-to-day duties and return to the vital, loving role of the daughter, son, or spouse.
                  </p>
                  {showFullAbout && (
                    <>
                      <p>
                        Our approach is built on a foundation of professional rigor and unwavering compassion. We begin with a comprehensive, no-obligation assessment, working collaboratively with your family to co-create a personalized care plan—a dynamic blueprint tailored to your loved one's unique preferences, daily routines, and goals. Our premium services are designed to provide dignity and support in every facet of life: from heartfelt Companionship and emotional support to combat isolation and enhance well-being, to respectful Assistance with Activities of Daily Living (ADLs) like bathing and dressing, always prioritizing preserved independence. We also handle essential life management tasks, including Shopping Assistance and errands, and crucial Medication Assistance, where our vigilance ensures prescriptions are managed safely and coordinated with healthcare providers.
                      </p>
                      <p>
                        The quality of our people is the cornerstone of our promise. We recruit caregivers who embody our core values of passion, integrity, and excellence. Every professional undergoes a rigorous, multi-level vetting process, including thorough background checks and confirmation of qualifications, to ensure only the most trusted and competent individuals enter your home. Crucially, our staff receives continuous, specialized training focused on cultivating deep empathy, active listening, and adaptability, ensuring care is delivered with the highest honor and respect for your loved one's dignity. We strive for our professionals to be more than just staff; they become an extended, respected member of your family. We are here to bring professional excellence home.
                      </p>
                    </>
                  )}
                  <div className="text-center md:text-left">
                    <Button
                      variant="outline"
                      onClick={() => setShowFullAbout(!showFullAbout)}
                      data-testid="button-toggle-about"
                    >
                      {showFullAbout ? "Show Less" : "Continue Reading"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="services" className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-primary mb-8">
            Our Services
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service) => (
              <ServiceCard
                key={service.key}
                title={service.title}
                short={service.short}
                full={service.full}
                icon={service.icon}
                onRequestService={handleRequestService}
              />
            ))}
          </div>
        </section>

        <section id="reviews" className="bg-primary/10 py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-2xl md:text-3xl font-bold text-center text-primary mb-4">
              What Families Say
            </h3>
            <p className="text-center text-muted-foreground mb-16">
              Hear from the families we've had the privilege to serve
            </p>
            <div className="grid md:grid-cols-3 gap-8 md:gap-10">
              {DEMO_REVIEWS.map((review) => (
                <ReviewCard
                  key={review.id}
                  name={review.name}
                  city={review.city}
                  rating={review.rating}
                  text={review.text}
                  image={review.image}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="areas" className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-primary mb-4">
            Communities We Serve
          </h3>
          <p className="text-center text-muted-foreground mb-8">
            Serving communities across Massachusetts
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {CITIES.map((city) => {
              const citySlug = city.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={city}
                  href={`/locations/${citySlug}`}
                  data-testid={`city-${citySlug}`}
                >
                  <div className="py-3 px-4 rounded-lg bg-card text-center hover-elevate cursor-pointer transition">
                    <span className="text-sm font-medium">{city}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="text-center text-muted-foreground mt-8">
            Don't see your city?{" "}
            <a 
              href="#contact" 
              className="text-primary font-medium hover:underline"
              data-testid="link-contact-from-cities"
            >
              Please contact us
            </a>
          </p>
        </section>

        <section id="caregivers" className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="bg-primary/5 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-center text-primary mb-4">
              Caregiver Careers
            </h3>
            <p className="text-center text-foreground/80 mb-8">
              Flexible schedules, competitive pay, and meaningful work
            </p>
            {publishedJobs.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {publishedJobs.map((job) => (
                    <Card key={job.id} data-testid={`card-job-${job.id}`}>
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-lg text-primary mb-3">{job.title}</h4>
                        
                        <div className="space-y-2 mb-4">
                          {job.type && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{job.type}</span>
                            </div>
                          )}
                          {job.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                          )}
                          {job.payRange && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <DollarSign className="w-4 h-4" />
                              <span>{job.payRange}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-foreground/80 mb-4 line-clamp-3">{job.description}</p>
                        
                        <Link href="/careers">
                          <button 
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover-elevate active-elevate-2 transition font-medium w-full"
                            data-testid={`button-apply-${job.id}`}
                          >
                            Apply Now
                          </button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Link href="/careers">
                    <Button 
                      size="lg" 
                      className="group"
                      data-testid="button-view-all-jobs"
                    >
                      View All Opportunities
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-6">
                  No open positions at the moment. Please check back soon!
                </p>
                <Link href="/careers">
                  <Button variant="outline" data-testid="button-check-careers">
                    Visit Careers Page
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        <section id="articles" className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-3">
              Latest Articles & Resources
            </h3>
            <p className="text-muted-foreground">
              Expert advice and helpful information about in-home care
            </p>
          </div>

          <Tabs defaultValue="All" className="w-full">
            <TabsList className="w-full justify-start mb-8 flex-wrap h-auto" data-testid="tabs-blog-categories">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  data-testid={`tab-${category.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => {
              const categoryArticles = getArticlesByCategory(category);
              return (
                <TabsContent key={category} value={category}>
                  {publishedArticles.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">
                          No articles available yet. Check back soon for helpful resources.
                        </p>
                      </CardContent>
                    </Card>
                  ) : categoryArticles.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">
                          No articles in this category yet. Check back soon or browse other categories.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {categoryArticles.map((article) => (
                          <Link key={article.id} href={`/articles/${article.slug}`}>
                            <Card 
                              className="hover-elevate cursor-pointer h-full transition-all"
                              data-testid={`card-article-${article.id}`}
                            >
                              {article.heroImageUrl && (
                                <img 
                                  src={article.heroImageUrl} 
                                  alt={article.title}
                                  className="w-full h-48 object-cover rounded-t-lg"
                                  data-testid={`img-article-${article.id}`}
                                />
                              )}
                              <CardHeader>
                                <CardTitle className="line-clamp-2 text-lg" data-testid={`text-article-title-${article.id}`}>
                                  {article.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {article.excerpt && (
                                  <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-article-excerpt-${article.id}`}>
                                    {article.excerpt}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                      <div className="text-center">
                        <Link href="/articles">
                          <Button variant="outline" size="lg" data-testid="button-view-all-articles">
                            View All Articles
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </section>

        <section id="contact" ref={contactRef} className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-primary mb-4">
            Contact Our Care Coordinator Team
          </h3>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Private In-Home Caregiver: Compassionate, Personalized Support Where It's Needed Most
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-start mb-16">
            <div className="flex flex-col items-center gap-6">
              <img 
                src={careCoordinatorImage}
                alt="Private in-home caregiver providing compassionate care to elderly client at home"
                className="w-full max-w-md h-auto rounded-lg shadow-lg"
                data-testid="img-care-coordinator"
              />
              <Button 
                size="lg" 
                onClick={() => {
                  const getInTouch = document.querySelector('#contact .border-t');
                  getInTouch?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                data-testid="button-contact-us"
              >
                Contact Us
              </Button>
            </div>

            <div className="space-y-5">
              <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                Trust your loved one's well-being to a dedicated private in-home caregiver who tailors support to their unique needs—all from the comfort and safety of home.
              </p>

              <div className="space-y-3">
                <h4 className="font-semibold text-base md:text-lg text-primary">What to Expect:</h4>
                <ul className="space-y-2 text-sm md:text-base text-foreground/80">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Customized care plans adapting to health, routines, and preferences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Consistent companion focused on safety and well-being</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Ongoing communication keeping families informed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Professional service from bonded, insured caregivers</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-base md:text-lg text-primary">Why Choose Private Care?</h4>
                <ul className="space-y-2 text-sm md:text-base text-foreground/80">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                    <span>Individual attention ensures highest comfort and security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                    <span>Flexible schedules for part-time, full-time, or respite care</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                    <span>Greater continuity building enduring, respectful relationships</span>
                  </li>
                </ul>
              </div>

              <p className="text-foreground/80 leading-relaxed text-sm md:text-base font-medium pt-2">
                Let a private caregiver deliver the compassionate care your family deserves—making every day safer, happier, and more connected.
              </p>
            </div>
          </div>

          <div className="border-t pt-12">
            <h4 className="text-xl md:text-2xl font-bold text-center text-primary mb-8">
              Get in Touch
            </h4>
            
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <Card>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold mb-1">Phone</div>
                      <a href="tel:+16176860595" className="text-primary hover:underline" data-testid="link-contact-phone">
                        +1 (617) 686-0595
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold mb-1">Email</div>
                      <a href="mailto:info@privateinhomecaregiver.com" className="text-primary hover:underline" data-testid="link-contact-email">
                        info@privateinhomecaregiver.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold mb-1">Office</div>
                      <p className="text-foreground/80">
                        3 Cabot Place, Ste. 10A<br />
                        Stoughton, MA 02072
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="font-semibold mb-2">Office Hours</div>
                    <p className="text-sm text-foreground/80">
                      Monday - Friday: 9:00 AM - 5:00 PM<br />
                      Saturday: 10:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </CardContent>
              </Card>

              <ContactForm preselectedService={selectedService} />
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 bg-card border-t py-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-semibold text-primary mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="text-foreground/70 hover:text-primary">About</a></li>
              <li><a href="#services" className="text-foreground/70 hover:text-primary">Services</a></li>
              <li><a href="#areas" className="text-foreground/70 hover:text-primary">Areas</a></li>
              <li><a href="#caregivers" className="text-foreground/70 hover:text-primary">Caregiver Careers</a></li>
              <li><Link href="/refer-a-friend" className="text-foreground/70 hover:text-primary" data-testid="link-refer-friend-footer">Refer a Friend</Link></li>
              <li><a href="#contact" className="text-foreground/70 hover:text-primary">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-3">Contact</h4>
            <p className="text-sm text-foreground/70">
              3 Cabot Place, Ste. 10A<br />
              Stoughton, MA 02072
            </p>
            <p className="mt-2 text-sm">
              Phone: <a href="tel:+16176860595" className="text-primary hover:underline" data-testid="link-footer-phone">+1 (617) 686-0595</a>
            </p>
            <p className="mt-1 text-sm">
              Email: <a href="mailto:info@privateinhomecaregiver.com" className="text-primary hover:underline" data-testid="link-footer-email">info@privateinhomecaregiver.com</a>
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/intake" className="text-chart-2 hover:underline" data-testid="link-intake-form">Client intake form</Link></li>
              <li><Link href="/hipaa-acknowledgment" className="text-chart-2 hover:underline" data-testid="link-hipaa-form">HIPAA privacy acknowledgment</Link></li>
              <li><Link href="/caregiver-log" className="text-chart-2 hover:underline" data-testid="link-caregiver-log">Caregiver daily log</Link></li>
              <li><Link href="/privacy-policy" className="text-chart-2 hover:underline" data-testid="link-privacy-policy">Privacy policy</Link></li>
              <li><Link href="/terms-and-conditions" className="text-chart-2 hover:underline" data-testid="link-terms-conditions">Terms and conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Private InHome CareGiver. Serving communities across Massachusetts.</p>
        </div>
      </footer>
    </div>
  );
}
