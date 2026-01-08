import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  DollarSign, 
  Heart, 
  Users, 
  MapPin,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Phone,
  Home,
  Brain,
  Shield,
  Clock
} from "lucide-react";
import { Link } from "wouter";

const costData = {
  average: "$7,800",
  rangeLow: "$5,500",
  rangeHigh: "$10,000",
  national: "$5,300"
};

const topCities = [
  { name: "Boston", count: 1 },
  { name: "Concord", count: 1 },
  { name: "Haverhill", count: 1 },
  { name: "Northampton", count: 1 },
  { name: "Milton", count: 1 },
  { name: "Leominster", count: 1 }
];

const faqs = [
  {
    question: "What is memory care?",
    answer: "Memory care is specialized care for seniors with Alzheimer's disease, dementia, or other memory impairments. These communities provide a secure environment with structured activities, specialized staff training, and programs designed to reduce confusion and enhance quality of life."
  },
  {
    question: "How much does memory care cost in Massachusetts?",
    answer: "Memory care in Massachusetts averages around $7,800 per month, with costs ranging from $5,500 to over $10,000 depending on location and level of care. This is higher than the national average due to Massachusetts' stringent care standards."
  },
  {
    question: "When should someone move to memory care?",
    answer: "Consider memory care when safety becomes a concern—such as wandering, leaving the stove on, or getting lost. Other signs include aggressive behavior, severe confusion, or when caregiving needs exceed what family can provide."
  },
  {
    question: "Can someone with dementia receive care at home?",
    answer: "Yes, many families choose in-home dementia care, especially in early to moderate stages. Trained caregivers can provide supervision, companionship, and assistance with daily activities while allowing your loved one to stay in familiar surroundings."
  }
];

export default function MemoryCarePage() {
  return (
    <>
      <PageSEO
        pageSlug="memory-care-massachusetts"
        fallbackTitle="Memory Care in Massachusetts | Alzheimer's & Dementia Care | PrivateInHomeCareGiver"
        fallbackDescription="Explore memory care options for Alzheimer's and dementia in Massachusetts. Learn about costs, when to consider memory care, and in-home dementia care alternatives."
        canonicalPath="/memory-care/massachusetts"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-20">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="max-w-3xl">
                <Badge variant="secondary" className="mb-4">Massachusetts Care Options</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-page-title">
                  Memory Care in Massachusetts
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  If your loved one has Alzheimer's or dementia, you're not alone. Massachusetts offers specialized memory care communities, and many families also choose in-home dementia care. Let us help you find the right solution.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" data-testid="button-cta-consultation">
                    <Link href="/consultation">
                      Get Free Care Advice
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="tel:+16176860595">
                      <Phone className="mr-2 h-4 w-4" />
                      Call (617) 686-0595
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Average Cost
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{costData.average}</p>
                    <p className="text-sm text-muted-foreground">per month in MA</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-primary" />
                      Specialized Care
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">24/7</p>
                    <p className="text-sm text-muted-foreground">Trained dementia staff</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5 text-primary" />
                      Secure Environment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">200+</p>
                    <p className="text-sm text-muted-foreground">MA memory care communities</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Understanding Memory Care</h2>
                  <p className="text-muted-foreground mb-4">
                    Memory care communities are designed specifically for seniors with Alzheimer's disease, dementia, and other cognitive impairments. They provide a secure, structured environment with specially trained staff who understand the unique challenges of memory loss.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    These communities often feature secured perimeters to prevent wandering, sensory programs, and activities designed to engage residents at their cognitive level while reducing anxiety and confusion.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">Memory Care Services:</h3>
                  <ul className="space-y-2 mb-6">
                    {[
                      "24-hour supervision and security",
                      "Staff trained in dementia care",
                      "Structured daily routines",
                      "Cognitive stimulation activities",
                      "Assistance with all daily activities",
                      "Medication management",
                      "Wandering prevention systems",
                      "Family support and education"
                    ].map((service, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Top Cities for Memory Care in MA</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {topCities.map((city) => (
                      <Link key={city.name} href={`/facilities/memory-care?city=${encodeURIComponent(city.name)}`}>
                        <Card className="hover-elevate cursor-pointer h-full">
                          <CardContent className="p-4 flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">{city.name}</p>
                              <p className="text-sm text-muted-foreground">{city.count}+ communities</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="w-full mb-8" data-testid="button-browse-facilities">
                    <Link href="/facilities/memory-care">
                      <Building2 className="mr-2 h-4 w-4" />
                      Browse All Memory Care Facilities
                    </Link>
                  </Button>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        In-Home Dementia Care
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        For many families, in-home dementia care allows loved ones to stay in familiar surroundings. Our trained caregivers provide supervision, companionship, and specialized support for those with memory challenges.
                      </p>
                      <Button asChild>
                        <Link href="/dementia-care/massachusetts">Learn About Home Dementia Care</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Memory Care Community vs. In-Home Dementia Care
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Memory Care Community
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Secure, wander-proof environment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Staff available 24/7</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Structured activities program</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <span>Unfamiliar environment may increase confusion</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <span>Higher monthly cost ($7K-$10K+)</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Home className="h-5 w-5" />
                      In-Home Dementia Care
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Familiar home reduces confusion</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>One-on-one dedicated attention</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Maintain established routines</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Family can stay closely involved</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Flexible scheduling and costs</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-2xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Explore Other Care Options
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/nursing-homes/massachusetts">
                  <Card className="hover-elevate cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Building2 className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold">Nursing Homes</h3>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/assisted-living/massachusetts">
                  <Card className="hover-elevate cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold">Assisted Living</h3>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/independent-living/massachusetts">
                  <Card className="hover-elevate cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold">Independent Living</h3>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/home-care/massachusetts">
                  <Card className="hover-elevate cursor-pointer h-full border-primary/30">
                    <CardContent className="p-6 text-center">
                      <Home className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold text-primary">Home Care</h3>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </section>

          <section className="py-16 bg-primary/5">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Caring for Someone with Memory Loss?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We understand how challenging this journey can be. Our care advisors can help you explore all your options and find the support your family needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/consultation">
                    Schedule Free Consultation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="tel:+16176860595">Call (617) 686-0595</a>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
