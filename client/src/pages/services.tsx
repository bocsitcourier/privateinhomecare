import PageSEO from "@/components/PageSEO";
import { Heart, Users, Home as HomeIcon, Brain, Clock, Shield, Award, CheckCircle2, Phone, Mail, Hospital, ClipboardList, ArrowRight, Leaf, ChevronDown, Star, MapPin, HelpCircle, ShoppingCart, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { Link } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SERVICE_FAQS, GENERAL_HOME_CARE_FAQS } from "@/constants/serviceFaqs";

import heroImage1 from "@assets/private-in-home-care-boston-medical-center_1769694632455.png";
import heroImage2 from "@assets/private-in-home-care-after-discharge-greater-boston_1769694632456.png";
import heroImage3 from "@assets/find-trustworthy-in-home-caregiver-services-in-worcester-ma_1769694632457.png";
import personalCareImg from "@assets/non-medical-caregiver-cost-cambridge-ma_1769694632458.png";
import companionshipImg from "@assets/senior-companionship-care-service.png";
import homemakingImg from "@assets/hire-non-medical-caregiver-marlborough-ma_1769694632457.png";
import dementiaCareImg from "@assets/how-to-choose-the-right-in-home-care-after-hebrew-senior-life-_1769694632449.png";
import respiteCareImg from "@assets/concierge-care-in-massachusetts-private-inhome-caregiver_1769694567019.png";
import liveInCareImg from "@assets/Guide_to_Private_Pay_Home_Care_in_Newton,_Wellesley_&_Lexingto_1769694567038.png";
import postHospitalImg from "@assets/guide-to-in-home-support-for-seniors-discharged-from-hospital_1769694632455.png";
import hospiceImg from "@assets/home-care-faqs-greater-boston-private-inhome-caregiver_1769694632457.png";

const SERVICE_IMAGES: Record<string, string> = {
  "personal-care": personalCareImg,
  "companionship": companionshipImg,
  "homemaking": homemakingImg,
  "dementia-care": dementiaCareImg,
  "respite-care": respiteCareImg,
  "live-in-care": liveInCareImg,
  "post-hospital-care": postHospitalImg,
  "hospice-palliative-care": hospiceImg,
  "concierge-services": respiteCareImg,
  "non-medical-transportation": liveInCareImg,
};

const SERVICES = [
  {
    key: "personal-care",
    title: "Personal Care",
    icon: <Heart className="w-8 h-8 text-primary" />,
    description: "Compassionate assistance with activities of daily living to help your loved one maintain dignity, independence, and quality of life in the comfort of their own home.",
    quizSlug: "personal-care-assessment",
    features: [
      "Bathing and grooming assistance",
      "Dressing and undressing support",
      "Toileting and incontinence care",
      "Transfer and mobility assistance",
      "Medication reminders",
      "Feeding assistance when needed"
    ]
  },
  {
    key: "companionship",
    title: "Companionship Care",
    icon: <Users className="w-8 h-8 text-primary" />,
    description: "Meaningful social engagement and emotional support to combat loneliness, reduce isolation, and enhance quality of life for seniors living at home.",
    quizSlug: "companionship-needs-quiz",
    features: [
      "Friendly conversation and active listening",
      "Shared activities and hobbies",
      "Escort to appointments and social events",
      "Reading and reminiscing together",
      "Light exercise and neighborhood walks",
      "Entertainment, games, and puzzles"
    ]
  },
  {
    key: "homemaking",
    title: "Homemaking & Errands",
    icon: <HomeIcon className="w-8 h-8 text-primary" />,
    description: "Practical household support to maintain a safe, clean, and comfortable living environment while ensuring your loved one stays well-nourished and connected.",
    quizSlug: "homemaking-care-assessment",
    features: [
      "Nutritious meal planning and preparation",
      "Light housekeeping and laundry",
      "Grocery shopping and errands",
      "Transportation to appointments",
      "Pet care assistance",
      "Home safety monitoring"
    ]
  },
  {
    key: "dementia-care",
    title: "Specialized Dementia Care",
    icon: <Brain className="w-8 h-8 text-primary" />,
    description: "Expert, compassionate care for individuals living with Alzheimer's, dementia, and memory-related conditions, delivered by specially trained caregivers.",
    quizSlug: "dementia-care-assessment",
    features: [
      "Specialized dementia training",
      "Patient, compassionate communication",
      "Structured routines and activities",
      "Safety monitoring and wandering prevention",
      "Cognitive stimulation exercises",
      "Family caregiver support and education"
    ]
  },
  {
    key: "respite-care",
    title: "Respite Care",
    icon: <Clock className="w-8 h-8 text-primary" />,
    description: "Essential temporary relief for family caregivers, giving you time to rest and recharge while your loved one receives professional, quality care.",
    quizSlug: "respite-care-assessment",
    features: [
      "Flexible hourly, daily, or weekly scheduling",
      "All personal care services included",
      "Companionship and meaningful engagement",
      "Peace of mind for family caregivers",
      "Emergency respite available",
      "Seamless transition and handoff"
    ]
  },
  {
    key: "live-in-care",
    title: "Live-In Care",
    icon: <Shield className="w-8 h-8 text-primary" />,
    description: "Around-the-clock support with a dedicated caregiver who lives in your home, providing comprehensive daily assistance and continuous peace of mind.",
    quizSlug: "live-in-care-assessment",
    features: [
      "24/7 caregiver presence in your home",
      "Continuous monitoring and support",
      "All personal care and homemaking services",
      "Overnight assistance available",
      "Consistent caregiver relationship",
      "Cost-effective alternative to facilities"
    ]
  },
  {
    key: "post-hospital-care",
    title: "Post-Hospital Transitional Care",
    icon: <Hospital className="w-8 h-8 text-primary" />,
    description: "Expert transitional care after hospital discharge to ensure a safe, smooth recovery at home and reduce the risk of hospital readmission.",
    quizSlug: "post-hospital-care-assessment",
    features: [
      "Discharge planning coordination",
      "Medication management and reminders",
      "Wound care monitoring",
      "Physical therapy exercise support",
      "Fall prevention strategies",
      "Regular health status updates to family"
    ]
  },
  {
    key: "hospice-palliative-care",
    title: "Hospice & Palliative Care Support",
    icon: <Leaf className="w-8 h-8 text-primary" />,
    description: "Compassionate, dignified support for individuals and families during end-of-life care, focusing on comfort, peace, and quality of life.",
    quizSlug: "hospice-palliative-care-assessment",
    features: [
      "Comfort-focused personal care",
      "Pain and symptom management support",
      "Emotional and spiritual support",
      "Family caregiver respite",
      "Coordination with hospice medical teams",
      "24/7 availability for families"
    ]
  },
  {
    key: "concierge-services",
    title: "Senior Concierge Services",
    icon: <ShoppingCart className="w-8 h-8 text-primary" />,
    description: "Professional non-medical lifestyle support including errand running, appointment coordination, meal planning, and organization to help seniors thrive independently.",
    quizSlug: "",
    features: [
      "Grocery shopping and errand running",
      "Appointment scheduling and coordination",
      "Medication management support",
      "Bill organization and paperwork help",
      "Meal planning and light preparation",
      "Social engagement accompaniment"
    ]
  },
  {
    key: "non-medical-transportation",
    title: "Non-Medical Transportation",
    icon: <Car className="w-8 h-8 text-primary" />,
    description: "Safe, reliable door-through-door transportation to medical appointments, dialysis, shopping, and social activities with wheelchair accessible vehicles.",
    quizSlug: "",
    features: [
      "Medical appointment transportation",
      "Dialysis and treatment rides",
      "Shopping and errand transportation",
      "Wheelchair accessible vehicles",
      "Door-through-door assistance",
      "Wait time during appointments included"
    ]
  }
];

const BENEFITS = [
  {
    icon: <Clock className="w-10 h-10 text-primary" />,
    title: "Flexible Scheduling",
    description: "Care tailored to your schedule, from a few hours a week to comprehensive 24/7 live-in support."
  },
  {
    icon: <Shield className="w-10 h-10 text-primary" />,
    title: "Vetted Caregivers",
    description: "All caregivers undergo rigorous CORI background checks, reference verification, and comprehensive training."
  },
  {
    icon: <Award className="w-10 h-10 text-primary" />,
    title: "Personalized Care Plans",
    description: "Customized care strategies developed in collaboration with your family and healthcare providers."
  },
  {
    icon: <Star className="w-10 h-10 text-primary" />,
    title: "Platinum Standard Quality",
    description: "Award-winning care that exceeds industry standards with continuous quality monitoring and improvement."
  }
];

const PROCESS_STEPS = [
  {
    number: "1",
    title: "Free Consultation",
    description: "We begin with a comprehensive, no-obligation assessment to understand your loved one's unique needs, preferences, and care goals."
  },
  {
    number: "2",
    title: "Care Plan Development",
    description: "Together, we create a personalized Platinum Standard care plan addressing physical, emotional, social, and safety needs."
  },
  {
    number: "3",
    title: "Caregiver Matching",
    description: "We carefully match your family with a trained, compassionate caregiver based on skills, personality, and cultural fit."
  },
  {
    number: "4",
    title: "Ongoing Excellence",
    description: "We provide continuous monitoring, regular check-ins, quality assurance, and care plan adjustments as needs evolve."
  }
];

function ServiceFAQAccordion({ serviceKey }: { serviceKey: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = SERVICE_FAQS[serviceKey] || [];

  if (faqs.length === 0) return null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `#${serviceKey}-faq`,
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="mt-8" data-testid={`faq-section-${serviceKey}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-primary" />
        Frequently Asked Questions
      </h4>
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-4 py-3 flex items-center justify-between text-left bg-muted/30 hover:bg-muted/50 transition-colors"
              aria-expanded={openIndex === index}
              data-testid={`faq-toggle-${serviceKey}-${index}`}
            >
              <span className="font-medium text-sm text-foreground pr-4">{faq.question}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200",
                  openIndex === index && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                openIndex === index ? "max-h-96" : "max-h-0"
              )}
            >
              <div className="px-4 py-3 text-sm text-muted-foreground leading-relaxed bg-background">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GeneralFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "#general-home-care-faq",
    "mainEntity": GENERAL_HOME_CARE_FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="py-16 bg-muted/20" data-testid="general-faq-section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Common Questions About Home Care
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get answers to frequently asked questions about in-home care services in Massachusetts
          </p>
        </div>

        <div className="space-y-3">
          {GENERAL_HOME_CARE_FAQS.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "bg-card border border-border rounded-xl overflow-hidden transition-all duration-300",
                openIndex === index ? "shadow-lg" : "shadow-sm hover:shadow-md"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
                aria-expanded={openIndex === index}
                data-testid={`general-faq-toggle-${index}`}
              >
                <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openIndex === index ? "max-h-64" : "max-h-0"
                )}
              >
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageSEO 
        pageSlug="services"
        fallbackTitle="Private Pay Senior Care Services | Personal Care, Dementia Care | Massachusetts"
        fallbackDescription="Premium private pay in-home senior care services in Massachusetts. Personal care, companionship, homemaking, and specialized dementia care. 24/7 availability, background-checked caregivers."
        canonicalPath="/services"
        includeMaGeoTargeting={true}
        pageType="service"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Our Services", url: "/services" }
        ]}
      />
      <Header />

      <main className="min-h-screen bg-background">
        <section className="relative bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Platinum Standard Care</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Compassionate Home Care 
                  <span className="text-primary block">Services</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Professional, personalized in-home care designed to help your loved ones live safely, 
                  comfortably, and independently in the place they love most—home.
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="group" asChild data-testid="button-hero-consultation">
                    <Link href="/consultation">
                      Request Free Consultation
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild data-testid="button-hero-caregivers">
                    <Link href="/caregivers">Meet Our Caregivers</Link>
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-6 mt-8 justify-center lg:justify-start">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Licensed & Insured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Background Checked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Serving All Massachusetts</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2 relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <img
                      src={heroImage1}
                      alt="Private pay caregiver providing compassionate senior care in Boston, Massachusetts"
                      title="Premium In-Home Senior Care - Boston MA"
                      className="rounded-2xl shadow-xl w-full h-48 object-cover"
                    />
                    <img
                      src={heroImage2}
                      alt="Professional in-home care assistance for elderly patients in Greater Boston area"
                      title="Private Pay Home Care Services - Greater Boston"
                      className="rounded-2xl shadow-xl w-full h-32 object-cover"
                    />
                  </div>
                  <div className="pt-8">
                    <img
                      src={heroImage3}
                      alt="Trusted private home care services for seniors in Worcester County, Massachusetts"
                      title="Professional Senior Care - Worcester MA"
                      className="rounded-2xl shadow-xl w-full h-64 object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-card p-4 rounded-xl shadow-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">5.0</div>
                    </div>
                    <div>
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Trusted by 500+ families</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Services</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Care Solutions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide a complete range of Platinum Standard in-home care services tailored to your family's unique needs
            </p>
          </div>

          <div className="space-y-8">
            {SERVICES.map((service, idx) => {
              const serviceImage = SERVICE_IMAGES[service.key];
              const isReversed = idx % 2 === 1;
              
              return (
                <Card 
                  key={service.key} 
                  className="overflow-hidden border-2 hover:border-primary/20 transition-colors duration-300" 
                  data-testid={`card-service-${service.key}`}
                >
                  <div className={cn(
                    "flex flex-col lg:flex-row",
                    isReversed && "lg:flex-row-reverse"
                  )}>
                    <div className="lg:w-2/5 relative group overflow-hidden">
                      <img 
                        src={serviceImage}
                        alt={`${service.title} - Private pay in-home care services for seniors in Massachusetts`}
                        title={`${service.title} - Premium Senior Care MA`}
                        className="w-full h-64 lg:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        data-testid={`img-service-${service.key}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 left-4 p-3 bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-lg backdrop-blur-sm">
                        {service.icon}
                      </div>
                    </div>
                    
                    <CardContent className="lg:w-3/5 p-8">
                      <h3 className="text-2xl lg:text-3xl font-bold mb-3">{service.title}</h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                      
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2" data-testid={`feature-${service.key}-${index}`}>
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-foreground/80 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="flex flex-wrap gap-3 mb-4">
                        <Button asChild data-testid={`button-consultation-${service.key}`}>
                          <Link href="/consultation">
                            Get Free Consultation
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                        {service.quizSlug ? (
                          <Button asChild variant="outline" data-testid={`button-assessment-${service.key}`}>
                            <Link href={`/quiz/${service.quizSlug}`}>
                              <ClipboardList className="w-4 h-4 mr-2" />
                              Take Assessment
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild variant="outline" data-testid={`button-learn-more-${service.key}`}>
                            <Link href={`/${service.key}/massachusetts`}>
                              Learn More
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        )}
                      </div>
                      
                      <ServiceFAQAccordion serviceKey={service.key} />
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Why Choose Us</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The Platinum Standard Difference</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience award-winning care that puts your family first
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {BENEFITS.map((benefit, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
                  data-testid={`benefit-${index}`}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <ClipboardList className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started with professional Platinum Standard home care is simple
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((step, index) => (
              <div key={index} className="relative" data-testid={`step-${index}`}>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
                {index < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/30 mx-auto -translate-x-1/2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <GeneralFAQSection />

        <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience Platinum Standard Care?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Contact us today for a free, no-obligation consultation. Let us help you create 
              a personalized care plan that brings peace of mind to your entire family.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a 
                href="tel:+16176860595" 
                className="flex items-center gap-2 text-primary-foreground hover:underline text-lg"
                data-testid="link-phone"
              >
                <Phone className="w-5 h-5" />
                +1 (617) 686-0595
              </a>
              <span className="hidden sm:inline opacity-50">|</span>
              <a 
                href="mailto:info@privateinhomecaregiver.com" 
                className="flex items-center gap-2 text-primary-foreground hover:underline text-lg"
                data-testid="link-email"
              >
                <Mail className="w-5 h-5" />
                info@privateinhomecaregiver.com
              </a>
            </div>
            <Button size="lg" variant="secondary" className="group" asChild data-testid="button-request-consultation">
              <Link href="/consultation">
                Request Free Consultation
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
