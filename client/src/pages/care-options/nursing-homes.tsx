import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  DollarSign, 
  Clock, 
  Heart, 
  Users, 
  Shield,
  MapPin,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Phone,
  Home,
  Stethoscope
} from "lucide-react";
import { Link } from "wouter";

const costData = {
  privateRoom: "$13,200",
  semiPrivate: "$11,500",
  national: "$9,700",
  trend: "+4.2%"
};

const topCities = [
  { name: "Boston", count: 1 },
  { name: "Worcester", count: 1 },
  { name: "Brockton", count: 1 },
  { name: "Lowell", count: 1 },
  { name: "Fall River", count: 1 },
  { name: "Quincy", count: 1 }
];

const faqs = [
  {
    question: "What is a nursing home?",
    answer: "A nursing home, also known as a skilled nursing facility (SNF), provides 24-hour medical care and supervision for seniors who need constant nursing attention. They offer both short-term rehabilitation and long-term care for those with chronic illnesses or disabilities."
  },
  {
    question: "How much do nursing homes cost in Massachusetts?",
    answer: "The median cost for a private room in a Massachusetts nursing home is approximately $13,200 per month, while a semi-private room costs around $11,500. These rates are higher than the national average due to Massachusetts' cost of living and quality standards."
  },
  {
    question: "Does Medicare cover nursing home care in MA?",
    answer: "Medicare covers up to 100 days of skilled nursing care following a qualifying hospital stay. After the first 20 days, a daily coinsurance applies. For long-term care, MassHealth (Medicaid) may cover costs for those who qualify financially."
  },
  {
    question: "What's the difference between a nursing home and assisted living?",
    answer: "Nursing homes provide 24-hour skilled medical care by licensed nurses, while assisted living focuses on help with daily activities with less intensive medical oversight. Nursing homes are appropriate for those with complex medical needs requiring constant monitoring."
  }
];

export default function NursingHomesPage() {
  return (
    <>
      <PageSEO
        pageSlug="nursing-homes-massachusetts"
        fallbackTitle="Nursing Homes in Massachusetts | PrivateInHomeCareGiver"
        fallbackDescription="Explore nursing home options in Massachusetts. Learn about costs, Medicare coverage, and how in-home care compares as an alternative for your loved one."
        canonicalPath="/nursing-homes/massachusetts"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-20">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="max-w-3xl">
                <Badge variant="secondary" className="mb-4">Massachusetts Care Options</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-page-title">
                  Nursing Homes in Massachusetts
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Massachusetts has over 400 nursing homes providing skilled nursing care. Whether you're exploring long-term care options or considering alternatives like in-home care, we're here to help you make the right decision for your family.
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
                      Private Room
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{costData.privateRoom}</p>
                    <p className="text-sm text-muted-foreground">per month in MA</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-primary" />
                      Semi-Private Room
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{costData.semiPrivate}</p>
                    <p className="text-sm text-muted-foreground">per month in MA</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                      400+ Facilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">Statewide</p>
                    <p className="text-sm text-muted-foreground">Licensed nursing homes</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">What is a Nursing Home?</h2>
                  <p className="text-muted-foreground mb-4">
                    Nursing homes, also called skilled nursing facilities (SNFs), provide round-the-clock medical care and supervision for seniors with complex health needs. They're staffed by registered nurses and licensed practical nurses who can administer medications, provide wound care, and manage chronic conditions.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    In Massachusetts, nursing homes are regulated by the Department of Public Health and must meet strict standards for staffing, safety, and quality of care.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">Services Typically Offered:</h3>
                  <ul className="space-y-2 mb-6">
                    {[
                      "24-hour skilled nursing care",
                      "Medication management",
                      "Physical, occupational, and speech therapy",
                      "Wound care and IV therapy",
                      "Assistance with daily activities",
                      "Memory care for dementia patients",
                      "Hospice and palliative care",
                      "Social activities and recreation"
                    ].map((service, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Top Cities for Nursing Homes in MA</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {topCities.map((city) => (
                      <Link key={city.name} href={`/facilities/nursing-home?city=${encodeURIComponent(city.name)}`}>
                        <Card className="hover-elevate cursor-pointer h-full">
                          <CardContent className="p-4 flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">{city.name}</p>
                              <p className="text-sm text-muted-foreground">{city.count}+ facilities</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="w-full mb-8" data-testid="button-browse-facilities">
                    <Link href="/facilities/nursing-home">
                      <Building2 className="mr-2 h-4 w-4" />
                      Browse All Nursing Home Facilities
                    </Link>
                  </Button>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        Consider In-Home Care
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Many families find that in-home care provides the support their loved ones need while allowing them to stay in familiar surroundings. Our PCAs can provide personal care, companionship, and homemaking services.
                      </p>
                      <Button asChild>
                        <Link href="/services">Explore In-Home Options</Link>
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
                Nursing Home vs. In-Home Care: Which is Right?
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Nursing Home Care
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>24/7 skilled nursing supervision</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Complex medical needs management</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>On-site rehabilitation therapy</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <span>Higher monthly cost ($11K-$13K+)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <span>Transition away from home</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Home className="h-5 w-5" />
                      In-Home Care
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Stay in familiar home environment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>One-on-one personalized attention</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Flexible scheduling options</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Often more affordable</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Family involvement in care</span>
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
                <Link href="/assisted-living/massachusetts">
                  <Card className="hover-elevate cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Building2 className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold">Assisted Living</h3>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/memory-care/massachusetts">
                  <Card className="hover-elevate cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold">Memory Care</h3>
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
                Not Sure Which Care Option is Best?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our Massachusetts care advisors can help you understand your options and find the right solution for your family—at no cost to you.
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
