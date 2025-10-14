import PageSEO from "@/components/PageSEO";
import { Heart, Users, Home as HomeIcon, Brain, Clock, Shield, Award, CheckCircle2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";

const SERVICES = [
  {
    key: "personal-care",
    title: "Personal Care",
    icon: <Heart className="w-12 h-12 text-primary" />,
    description: "Compassionate assistance with activities of daily living to help your loved one maintain dignity and independence.",
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
    title: "Companionship",
    icon: <Users className="w-12 h-12 text-primary" />,
    description: "Meaningful social engagement and emotional support to combat loneliness and enhance quality of life.",
    features: [
      "Friendly conversation and active listening",
      "Shared activities and hobbies",
      "Escort to appointments and social events",
      "Reading and reminiscing",
      "Light exercise and walks",
      "Entertainment and games"
    ]
  },
  {
    key: "homemaking",
    title: "Homemaking & Errands",
    icon: <HomeIcon className="w-12 h-12 text-primary" />,
    description: "Practical household support to maintain a safe, clean, and comfortable living environment.",
    features: [
      "Meal planning and preparation",
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
    icon: <Brain className="w-12 h-12 text-primary" />,
    description: "Expert care for individuals living with Alzheimer's, dementia, and memory-related conditions.",
    features: [
      "Specialized dementia training",
      "Patient, compassionate communication",
      "Structured routines and activities",
      "Safety monitoring and wandering prevention",
      "Cognitive stimulation exercises",
      "Family caregiver support and education"
    ]
  }
];

const BENEFITS = [
  {
    icon: <Clock className="w-10 h-10 text-primary" />,
    title: "Flexible Scheduling",
    description: "Care tailored to your schedule, from a few hours a week to 24/7 live-in support."
  },
  {
    icon: <Shield className="w-10 h-10 text-primary" />,
    title: "Vetted Caregivers",
    description: "All caregivers undergo rigorous background checks, reference verification, and comprehensive training."
  },
  {
    icon: <Award className="w-10 h-10 text-primary" />,
    title: "Personalized Care Plans",
    description: "Customized care strategies developed in collaboration with your family and healthcare providers."
  }
];

const PROCESS_STEPS = [
  {
    number: "1",
    title: "Free Consultation",
    description: "We begin with a no-obligation assessment to understand your loved one's needs, preferences, and goals."
  },
  {
    number: "2",
    title: "Care Plan Development",
    description: "Together, we create a personalized care plan that addresses physical, emotional, and social needs."
  },
  {
    number: "3",
    title: "Caregiver Matching",
    description: "We carefully match your family with a trained, compassionate caregiver who fits your unique situation."
  },
  {
    number: "4",
    title: "Ongoing Support",
    description: "We provide continuous monitoring, regular check-ins, and care plan adjustments as needs evolve."
  }
];

export default function ServicesPage() {
  return (
    <>
      <PageSEO 
        pageSlug="services"
        fallbackTitle="Home Care Services in Massachusetts | PrivateInHomeCareGiver"
        fallbackDescription="Comprehensive in-home care services including personal care, companionship, homemaking, and specialized dementia support. Serving families throughout Massachusetts with compassionate, professional caregivers."
      />
      <Header />

      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Compassionate Home Care Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Professional, personalized in-home care designed to help your loved ones live safely, 
              comfortably, and independently in the place they love most—home.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild data-testid="button-contact">
                <a href="/consultation">Request a Free Consultation</a>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-caregivers">
                <a href="/caregivers">Meet Our Caregivers</a>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide a full range of in-home care services tailored to your family's unique needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {SERVICES.map((service) => (
              <Card key={service.key} className="hover-elevate" data-testid={`card-service-${service.key}`}>
                <CardContent className="p-8">
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3" data-testid={`feature-${service.key}-${index}`}>
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Private InHome CareGiver</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your peace of mind is our priority
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {BENEFITS.map((benefit, index) => (
                <div key={index} className="text-center" data-testid={`benefit-${index}`}>
                  <div className="inline-flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started with professional home care is simple
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((step, index) => (
              <div key={index} className="text-center" data-testid={`step-${index}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contact us today for a free, no-obligation consultation. Let us help you create 
              a personalized care plan that brings peace of mind to your entire family.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a 
                href="tel:+16176860595" 
                className="flex items-center gap-2 text-primary hover:underline text-lg"
                data-testid="link-phone"
              >
                <Phone className="w-5 h-5" />
                +1 (617) 686-0595
              </a>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <a 
                href="mailto:info@privateinhomecaregiver.com" 
                className="flex items-center gap-2 text-primary hover:underline text-lg"
                data-testid="link-email"
              >
                <Mail className="w-5 h-5" />
                info@privateinhomecaregiver.com
              </a>
            </div>
            <Button size="lg" asChild data-testid="button-request-consultation">
              <a href="/consultation">Request Free Consultation</a>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
