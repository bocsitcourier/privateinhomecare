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
  Utensils,
  Activity
} from "lucide-react";
import { Link } from "wouter";

const costData = {
  average: "$6,500",
  rangeLow: "$4,500",
  rangeHigh: "$9,000",
  national: "$4,500"
};

const topCities = [
  { name: "Boston", count: 38 },
  { name: "Cambridge", count: 22 },
  { name: "Worcester", count: 18 },
  { name: "Newton", count: 15 },
  { name: "Brookline", count: 12 },
  { name: "Wellesley", count: 10 }
];

const faqs = [
  {
    question: "What is assisted living?",
    answer: "Assisted living is a residential option for seniors who need help with daily activities like bathing, dressing, and medication management, but don't require 24-hour skilled nursing care. Residents live in private or semi-private apartments and receive personalized support."
  },
  {
    question: "How much does assisted living cost in Massachusetts?",
    answer: "The average cost of assisted living in Massachusetts is approximately $6,500 per month, though prices range from $4,500 to over $9,000 depending on location, amenities, and level of care needed. This is higher than the national average of about $4,500."
  },
  {
    question: "What's included in assisted living?",
    answer: "Most assisted living communities include housing, meals, housekeeping, laundry, social activities, transportation, and assistance with daily activities. Some also offer medication management and basic health monitoring."
  },
  {
    question: "How is assisted living different from a nursing home?",
    answer: "Assisted living focuses on helping with daily activities and providing a social community, while nursing homes offer 24-hour medical care. Assisted living is for more independent seniors, while nursing homes serve those with complex medical needs."
  }
];

export default function AssistedLivingPage() {
  return (
    <>
      <PageSEO
        pageSlug="assisted-living-massachusetts"
        fallbackTitle="Assisted Living in Massachusetts | PrivateInHomeCareGiver"
        fallbackDescription="Explore assisted living options in Massachusetts. Learn about costs, services, and how in-home care compares as an alternative for your loved one."
        canonicalPath="/assisted-living/massachusetts"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-20">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="max-w-3xl">
                <Badge variant="secondary" className="mb-4">Massachusetts Care Options</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-page-title">
                  Assisted Living in Massachusetts
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Massachusetts offers hundreds of assisted living communities for seniors who need daily support while maintaining independence. Compare your options or explore in-home alternatives that may better fit your family's needs.
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
                      <Activity className="h-5 w-5 text-primary" />
                      Cost Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{costData.rangeLow} - {costData.rangeHigh}</p>
                    <p className="text-sm text-muted-foreground">depending on location</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                      300+ Communities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">Statewide</p>
                    <p className="text-sm text-muted-foreground">Licensed facilities</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">What is Assisted Living?</h2>
                  <p className="text-muted-foreground mb-4">
                    Assisted living communities provide housing and support services for seniors who need help with activities of daily living (ADLs) but don't require the intensive medical care of a nursing home. Residents typically live in private apartments and receive personalized assistance.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    In Massachusetts, assisted living residences are licensed by the Executive Office of Elder Affairs and must meet specific standards for safety, staffing, and services.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">Typical Services Include:</h3>
                  <ul className="space-y-2 mb-6">
                    {[
                      "Private or semi-private apartments",
                      "Three meals daily plus snacks",
                      "Assistance with bathing and dressing",
                      "Medication reminders and management",
                      "Housekeeping and laundry",
                      "Transportation services",
                      "Social activities and events",
                      "24-hour staff availability"
                    ].map((service, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Top Cities for Assisted Living in MA</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {topCities.map((city) => (
                      <Link key={city.name} href={`/facilities/assisted-living?city=${encodeURIComponent(city.name)}`}>
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
                    <Link href="/facilities/assisted-living">
                      <Building2 className="mr-2 h-4 w-4" />
                      Browse All Assisted Living Facilities
                    </Link>
                  </Button>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        Stay Home with In-Home Care
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Many seniors prefer to age in place with the help of a personal care assistant. Our caregivers provide the same daily living support as assisted living—in the comfort of your own home.
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
                Assisted Living vs. In-Home Care: Compare Your Options
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Assisted Living
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Built-in social community</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Meals and housekeeping included</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Organized activities and outings</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <span>Must leave your home</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <span>Higher monthly cost ($6K-$9K+)</span>
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
                      <span>Stay in your own home</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>One-on-one personalized care</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Flexible hours to match your needs</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Often more cost-effective</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Keep your pets and routines</span>
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
                Need Help Choosing the Right Care?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our care advisors can help you compare options and find the best solution for your family—completely free.
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
