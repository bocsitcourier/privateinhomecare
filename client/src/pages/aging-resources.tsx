import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Phone,
  Home,
  Heart,
  Users,
  DollarSign,
  Building2,
  Car,
  Utensils,
  Shield,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Clock,
  FileText,
  HelpCircle,
  Stethoscope,
  Pill,
  Scale,
  Thermometer
} from "lucide-react";
import { Link } from "wouter";

const emergencyResources = [
  {
    title: "Elder Abuse Hotline",
    phone: "1-800-922-2275",
    description: "Report suspected abuse, neglect, or financial exploitation of elders",
    available: "24/7",
    icon: Shield
  },
  {
    title: "Suicide & Crisis Lifeline",
    phone: "988",
    description: "Free, confidential support for people in distress",
    available: "24/7",
    icon: Phone
  },
  {
    title: "Poison Control Center",
    phone: "1-800-222-1222",
    description: "Immediate guidance for poisoning emergencies",
    available: "24/7",
    icon: AlertTriangle
  },
  {
    title: "Mass 211",
    phone: "211",
    description: "Connect to local health and human services programs",
    available: "24/7",
    icon: HelpCircle
  }
];

const coreServices = [
  {
    title: "Home Care Program",
    description: "In-home support services including personal care, homemaking, and companion services for eligible older adults.",
    icon: Home,
    link: "https://www.mass.gov/info-details/home-care-program",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
  },
  {
    title: "Senior Nutrition Program",
    description: "Home-delivered meals (Meals on Wheels) and congregate dining options at senior centers across Massachusetts.",
    icon: Utensils,
    link: "https://www.mass.gov/info-details/senior-nutrition-program",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
  },
  {
    title: "SHINE Program",
    description: "Free, unbiased health insurance counseling for Medicare beneficiaries and their caregivers.",
    icon: Shield,
    link: "https://www.mass.gov/info-details/serving-the-health-insurance-needs-of-everyone-shine-program",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
  },
  {
    title: "Medicare Savings Programs",
    description: "Help paying Medicare premiums, deductibles, and coinsurance for qualifying low-income seniors.",
    icon: DollarSign,
    link: "https://www.mass.gov/info-details/get-help-paying-medicare-costs",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
  },
  {
    title: "Behavioral Health Resources",
    description: "Mental health and substance use support services designed specifically for older adults.",
    icon: Heart,
    link: "https://www.mass.gov/info-details/behavioral-health-resources-for-older-adults",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
  },
  {
    title: "Options Counseling",
    description: "Person-centered planning to help older adults and caregivers understand and access long-term care options.",
    icon: Users,
    link: "https://www.mass.gov/info-details/options-counseling",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
  }
];

const housingResources = [
  {
    title: "Supportive Housing",
    description: "Assisted living-type services in a residential setting for those who need help with daily activities.",
    link: "https://www.mass.gov/info-details/supportive-housing"
  },
  {
    title: "Congregate Housing",
    description: "Apartments with shared dining and social activities for independent seniors.",
    link: "https://www.mass.gov/info-details/congregate-housing"
  },
  {
    title: "Continuing Care Retirement Communities",
    description: "Communities offering independent living, assisted living, and nursing care on one campus.",
    link: "https://www.mass.gov/lists/continuing-care-retirement-communities"
  },
  {
    title: "Public Housing Programs",
    description: "Affordable housing options for low-income seniors throughout Massachusetts.",
    link: "https://www.mass.gov/public-housing-programs"
  },
  {
    title: "Emergency Housing Assistance",
    description: "Resources for seniors facing housing emergencies or homelessness.",
    link: "https://www.mass.gov/emergency-housing-assistance"
  }
];

const additionalResources = [
  {
    title: "Senior Parking Pass",
    description: "Free parking at state-owned facilities for Massachusetts residents 62 and older.",
    link: "https://www.mass.gov/how-to/get-a-senior-parking-pass",
    icon: Car
  },
  {
    title: "Senior Tax Information",
    description: "Tax credits, exemptions, and tips specifically for Massachusetts seniors and retirees.",
    link: "https://www.mass.gov/info-details/massachusetts-tax-information-for-seniors-and-retirees",
    icon: FileText
  },
  {
    title: "SNAP Benefits",
    description: "Supplemental Nutrition Assistance Program (formerly food stamps) for eligible seniors.",
    link: "https://www.mass.gov/snap-benefits-formerly-food-stamps",
    icon: Utensils
  },
  {
    title: "Grandparents Raising Grandchildren",
    description: "Support services and resources for grandparents who are primary caregivers.",
    link: "https://www.mass.gov/info-details/grandparents-raising-grandchildren",
    icon: Users
  },
  {
    title: "Reverse Mortgage Counselors",
    description: "HUD-approved counselors to help seniors understand reverse mortgage options.",
    link: "https://www.mass.gov/info-details/reverse-mortgage-counselors",
    icon: DollarSign
  },
  {
    title: "Accessible Transportation",
    description: "Transportation options and services for seniors and people with disabilities.",
    link: "https://www.mass.gov/topics/accessible-transportation",
    icon: Car
  },
  {
    title: "Extreme Heat Preparation",
    description: "Safety tips and cooling center locations for seniors during heat emergencies.",
    link: "https://www.mass.gov/info-details/preparing-for-extreme-heat",
    icon: Thermometer
  },
  {
    title: "Nursing Home Discharge Help",
    description: "Community Transition Liaison Program helps residents transition from nursing homes to community living.",
    link: "https://www.mass.gov/info-details/community-transition-liaison-program-ctlp",
    icon: Building2
  }
];

const faqs = [
  {
    question: "How do I find my local Aging Services Access Point (ASAP)?",
    answer: "Massachusetts has 25 regional Aging Services Access Points that help older adults access services. Visit mass.gov/info-details/find-your-regional-aging-services-access-point-asap or call the Elder Affairs main line at (617) 727-7750 to find your local ASAP."
  },
  {
    question: "What is the Home Care Program and who qualifies?",
    answer: "The Home Care Program provides in-home services to help older adults (60+) remain living independently. Services include personal care, homemaking, companion services, and more. Eligibility is based on age, functional need, and income. Contact your local ASAP for a free assessment."
  },
  {
    question: "How do I apply for Meals on Wheels?",
    answer: "Contact your local Aging Services Access Point (ASAP) or Council on Aging. They will assess your eligibility based on age (60+), ability to prepare meals, and nutritional needs. Most programs have a suggested donation but no one is denied meals due to inability to pay."
  },
  {
    question: "What is SHINE and how can it help me?",
    answer: "SHINE (Serving the Health Insurance Needs of Everyone) provides free, unbiased health insurance counseling. SHINE counselors help with Medicare enrollment, plan comparisons, prescription drug coverage, and applications for programs that help pay Medicare costs. Call 1-800-243-4636 to schedule an appointment."
  },
  {
    question: "How do I report elder abuse or neglect?",
    answer: "Call the Elder Abuse Hotline at 1-800-922-2275. This line is available 24/7 and all reports are confidential. Signs of abuse include unexplained injuries, sudden changes in finances, poor hygiene, or fearful behavior around certain people."
  },
  {
    question: "What programs help pay for Medicare costs?",
    answer: "Several programs help with Medicare costs: Medicare Savings Programs pay premiums and may cover deductibles. MassHealth (Medicaid) may cover what Medicare doesn't. The Extra Help program reduces prescription drug costs. Contact SHINE at 1-800-243-4636 for personalized help."
  },
  {
    question: "How do I find my local Senior Center?",
    answer: "Visit mass.gov/info-details/find-your-local-council-on-aging to find your local Council on Aging/Senior Center. These centers offer social activities, meals, health programs, transportation, and connections to services. Most are free and open to adults 60+."
  },
  {
    question: "What is the difference between a Senior Center and ASAP?",
    answer: "Senior Centers (run by Councils on Aging) offer activities, meals, and local programs at a physical location. ASAPs are regional agencies that assess needs, coordinate services, and connect older adults to programs like home care. Both work together to support seniors."
  },
  {
    question: "Are there programs to help grandparents raising grandchildren?",
    answer: "Yes, Massachusetts offers support including respite care, support groups, legal assistance, and financial help. Contact your local ASAP or visit mass.gov/info-details/grandparents-raising-grandchildren for resources specific to kinship caregivers."
  },
  {
    question: "How can I get help transitioning from a nursing home back home?",
    answer: "The Community Transition Liaison Program (CTLP) helps nursing home residents move back to community living. They assist with housing, setting up home care, and connecting to resources. Contact your ASAP or ask the nursing home social worker about CTLP."
  }
];

export default function AgingResourcesPage() {
  return (
    <>
      <PageSEO
        pageSlug="aging-resources"
        fallbackTitle="Massachusetts Aging Resources | Senior Services & Support | PrivateInHomeCareGiver"
        fallbackDescription="Comprehensive guide to Massachusetts aging resources including home care, meals on wheels, Medicare help, housing options, and emergency services for older adults."
        canonicalPath="/aging-resources"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <Badge variant="secondary" className="mb-4" data-testid="badge-page-type">
                  Official Mass.gov Resources
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6" data-testid="text-page-title">
                  Massachusetts Aging Resources
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Comprehensive guide to services and support for older adults in Massachusetts. 
                  Access programs for home care, nutrition, housing, healthcare, and more.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" data-testid="button-find-asap">
                    <a href="https://www.mass.gov/info-details/find-your-regional-aging-services-access-point-asap" target="_blank" rel="noopener noreferrer">
                      Find Your ASAP <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" data-testid="button-find-senior-center">
                    <a href="https://www.mass.gov/info-details/find-your-local-council-on-aging" target="_blank" rel="noopener noreferrer">
                      Find Your Senior Center <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-12 bg-destructive/10">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                  <h2 className="text-2xl font-bold text-foreground" data-testid="text-emergency-title">
                    Emergency Resources
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {emergencyResources.map((resource) => (
                    <Card key={resource.title} className="border-destructive/30" data-testid={`card-emergency-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-destructive/10">
                            <resource.icon className="h-5 w-5 text-destructive" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground text-sm">{resource.title}</h3>
                            <a 
                              href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`}
                              className="text-lg font-bold text-destructive hover:underline"
                              data-testid={`link-phone-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              {resource.phone}
                            </a>
                            <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              <Clock className="h-3 w-3 mr-1" /> {resource.available}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground mb-2 text-center" data-testid="text-core-services-title">
                  Core Services & Programs
                </h2>
                <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
                  Essential programs offered by the Massachusetts Executive Office of Aging & Independence
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coreServices.map((service) => (
                    <Card key={service.title} className="hover-elevate" data-testid={`card-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <CardHeader className="pb-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${service.color} mb-3`}>
                          <service.icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <a href={service.link} target="_blank" rel="noopener noreferrer">
                            Learn More <ExternalLink className="ml-2 h-3 w-3" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground mb-2 text-center">
                  Housing Resources
                </h2>
                <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
                  Housing options and assistance programs for Massachusetts seniors
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {housingResources.map((resource) => (
                    <a
                      key={resource.title}
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      data-testid={`link-housing-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Card className="hover-elevate h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Building2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div>
                              <h3 className="font-semibold text-foreground mb-1">{resource.title}</h3>
                              <p className="text-sm text-muted-foreground">{resource.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground mb-2 text-center">
                  Additional Resources
                </h2>
                <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
                  More programs and services to support Massachusetts seniors
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {additionalResources.map((resource) => (
                    <a
                      key={resource.title}
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      data-testid={`link-resource-${resource.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Card className="hover-elevate h-full">
                        <CardContent className="p-4 text-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            <resource.icon className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground text-sm mb-1">{resource.title}</h3>
                          <p className="text-xs text-muted-foreground">{resource.description}</p>
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-foreground mb-2 text-center" data-testid="text-faq-title">
                  Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground text-center mb-10">
                  Common questions about Massachusetts aging services and programs
                </p>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`} data-testid={`accordion-faq-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>

          <section className="py-16 bg-primary/5">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Prefer In-Home Care?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Many older adults prefer to age in place with support. Our personal care assistants provide 
                  compassionate in-home care throughout Massachusetts, helping seniors maintain independence 
                  in the comfort of their own homes.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" data-testid="button-learn-more-services">
                    <Link href="/services">Our Services</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" data-testid="button-request-consultation">
                    <Link href="/consultation">Request a Consultation</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="bg-card border-t py-10" data-testid="footer-aging-resources">
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
