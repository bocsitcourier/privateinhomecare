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
  Coffee,
  Bike,
  Car
} from "lucide-react";
import { Link } from "wouter";

const costData = {
  average: "$3,800",
  rangeLow: "$2,500",
  rangeHigh: "$6,000",
  national: "$2,800"
};

const topCities = [
  { name: "Boston", count: 42 },
  { name: "Cambridge", count: 25 },
  { name: "Newton", count: 18 },
  { name: "Brookline", count: 15 },
  { name: "Worcester", count: 14 },
  { name: "Lexington", count: 12 }
];

const faqs = [
  {
    question: "What is independent living?",
    answer: "Independent living communities are designed for active seniors who want a maintenance-free lifestyle with social opportunities. Residents live in apartments or cottages and have access to dining, activities, and amenities without requiring daily care assistance."
  },
  {
    question: "How much does independent living cost in Massachusetts?",
    answer: "Independent living in Massachusetts averages around $3,800 per month, ranging from $2,500 to $6,000+ depending on location, apartment size, and amenities. Some communities offer buy-in options with monthly fees."
  },
  {
    question: "What's the difference between independent and assisted living?",
    answer: "Independent living is for active seniors who don't need help with daily activities—they just want a low-maintenance lifestyle with social opportunities. Assisted living provides hands-on help with bathing, dressing, medication, and other daily tasks."
  },
  {
    question: "Can I stay in my home instead of moving to independent living?",
    answer: "Absolutely! Many seniors prefer to age in place with occasional help from a personal care assistant for tasks like light housekeeping, transportation, or companionship. This offers flexibility while maintaining your independence at home."
  }
];

export default function IndependentLivingPage() {
  return (
    <>
      <PageSEO
        pageSlug="independent-living-massachusetts"
        fallbackTitle="Independent Living in Massachusetts | Senior Communities | PrivateInHomeCareGiver"
        fallbackDescription="Explore independent living communities in Massachusetts for active seniors. Compare costs, amenities, and learn about in-home alternatives."
        canonicalPath="/independent-living/massachusetts"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-20">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="max-w-3xl">
                <Badge variant="secondary" className="mb-4">Massachusetts Care Options</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-page-title">
                  Independent Living in Massachusetts
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  For active seniors seeking a maintenance-free lifestyle with social opportunities, Massachusetts offers numerous independent living communities. Or, continue enjoying your own home with light support from a caregiver.
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
                      <Coffee className="h-5 w-5 text-primary" />
                      Lifestyle Focus
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">Active</p>
                    <p className="text-sm text-muted-foreground">Social & maintenance-free</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                      250+ Communities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">Statewide</p>
                    <p className="text-sm text-muted-foreground">Senior communities</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">What is Independent Living?</h2>
                  <p className="text-muted-foreground mb-4">
                    Independent living communities are designed for seniors who are mostly self-sufficient but want to downsize, eliminate home maintenance, and enjoy a more social lifestyle. These communities offer apartments or cottages with access to shared amenities and activities.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Unlike assisted living, independent living doesn't include personal care services—it's about lifestyle, not care. However, many communities partner with home care agencies for residents who need occasional support.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">Typical Amenities:</h3>
                  <ul className="space-y-2 mb-6">
                    {[
                      "Apartment or cottage-style living",
                      "Restaurant-style dining options",
                      "Fitness centers and pools",
                      "Social clubs and activities",
                      "Transportation services",
                      "Landscaping and maintenance",
                      "24-hour security",
                      "Common areas for socializing"
                    ].map((amenity, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Top Cities in MA</h2>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {topCities.map((city) => (
                      <Card key={city.name} className="hover-elevate">
                        <CardContent className="p-4 flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{city.name}</p>
                            <p className="text-sm text-muted-foreground">{city.count}+ communities</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        Age in Place at Home
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Prefer staying in your own home? Many seniors maintain their independence with occasional help from a caregiver for errands, light housekeeping, or companionship—without the commitment of moving.
                      </p>
                      <Button asChild>
                        <Link href="/companionship/massachusetts">Learn About Companion Care</Link>
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
                Independent Living Community vs. Aging at Home
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Independent Living Community
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>No home maintenance worries</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Built-in social community</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Dining and amenities included</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <span>Must downsize and relocate</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <span>Monthly fees ($2.5K-$6K+)</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Home className="h-5 w-5" />
                      Aging at Home with Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Stay in your own home</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Keep your independence</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Flexible care hours as needed</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Maintain neighborhood connections</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Pay only for help you need</span>
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
                <Link href="/memory-care/massachusetts">
                  <Card className="hover-elevate cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold">Memory Care</h3>
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
                Planning for Your Next Chapter?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Whether you're exploring communities or want to stay in your home with support, we can help you find the right solution.
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
