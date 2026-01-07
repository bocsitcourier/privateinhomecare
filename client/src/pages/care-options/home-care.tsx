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
  Phone,
  Home,
  Clock,
  Shield,
  Star
} from "lucide-react";
import { Link } from "wouter";

const costData = {
  hourly: "$30-$35",
  daily: "$250-$350",
  liveIn: "$350-$450",
  national: "$27"
};

const services = [
  { name: "Personal Care", slug: "personal-care", desc: "Bathing, dressing, grooming assistance" },
  { name: "Companionship", slug: "companionship", desc: "Social interaction and emotional support" },
  { name: "Homemaking", slug: "homemaking", desc: "Light housekeeping, laundry, meal prep" },
  { name: "Dementia Care", slug: "dementia-care", desc: "Specialized memory care support" },
  { name: "Respite Care", slug: "respite-care", desc: "Temporary relief for family caregivers" },
  { name: "Live-In Care", slug: "live-in-care", desc: "24-hour caregiver presence" },
  { name: "Post-Hospital Care", slug: "post-hospital-care", desc: "Recovery support after discharge" }
];

const topCities = [
  { name: "Boston", slug: "boston-ma" },
  { name: "Worcester", slug: "worcester-ma" },
  { name: "Springfield", slug: "springfield-ma" },
  { name: "Cambridge", slug: "cambridge-ma" },
  { name: "Lowell", slug: "lowell-ma" },
  { name: "Brockton", slug: "brockton-ma" }
];

const faqs = [
  {
    question: "What is in-home care?",
    answer: "In-home care provides non-medical assistance to seniors and individuals with disabilities in their own homes. Services include help with daily activities like bathing, dressing, meal preparation, medication reminders, companionship, and light housekeeping."
  },
  {
    question: "How much does home care cost in Massachusetts?",
    answer: "Home care in Massachusetts typically costs $30-$35 per hour, with daily rates around $250-$350. Live-in care ranges from $350-$450 per day. Costs vary based on the level of care needed and location within the state."
  },
  {
    question: "Does MassHealth cover home care?",
    answer: "Yes, MassHealth offers several programs that cover home care services, including the PCA (Personal Care Attendant) Program, PACE, and various home and community-based waivers. Eligibility depends on income, assets, and care needs."
  },
  {
    question: "What's the difference between home care and home health care?",
    answer: "Home care (non-medical) provides assistance with daily activities and companionship. Home health care is medical care provided by licensed nurses and therapists, such as wound care, physical therapy, or medication administration. Both can be provided at home."
  }
];

export default function HomeCareOverviewPage() {
  return (
    <>
      <PageSEO
        pageSlug="home-care-massachusetts"
        fallbackTitle="Home Care in Massachusetts | In-Home Care Services | PrivateInHomeCareGiver"
        fallbackDescription="Find quality in-home care services in Massachusetts. Personal care, companionship, dementia care, and more. Get a free consultation today."
        canonicalPath="/home-care/massachusetts"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-20">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="max-w-3xl">
                <Badge variant="secondary" className="mb-4">Massachusetts In-Home Care</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-page-title">
                  Home Care Services in Massachusetts
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Keep your loved one safe, comfortable, and cared for at home. PrivateInHomeCareGiver connects Massachusetts families with compassionate Personal Care Assistants who provide personalized in-home support.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" data-testid="button-cta-consultation">
                    <Link href="/consultation">
                      Get Free Care Consultation
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
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Hourly Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">{costData.hourly}</p>
                    <p className="text-sm text-muted-foreground">per hour</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-primary" />
                      Daily Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">{costData.daily}</p>
                    <p className="text-sm text-muted-foreground">8-12 hours</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Home className="h-5 w-5 text-primary" />
                      Live-In Care
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">{costData.liveIn}</p>
                    <p className="text-sm text-muted-foreground">per day</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5 text-primary" />
                      Background Checked
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">100%</p>
                    <p className="text-sm text-muted-foreground">All caregivers</p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-4">Our In-Home Care Services</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                  We offer a full range of non-medical home care services to help seniors and individuals with disabilities live independently at home.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {services.map((service) => (
                  <Link key={service.slug} href={`/${service.slug}/massachusetts`}>
                    <Card className="hover-elevate cursor-pointer h-full">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.desc}</p>
                        <span className="inline-flex items-center text-primary text-sm mt-3">
                          Learn more <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Why Choose In-Home Care?
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Home className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Stay at Home</h3>
                    <p className="text-muted-foreground">
                      Remain in the comfort and familiarity of your own home, surrounded by memories and personal belongings.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">One-on-One Care</h3>
                    <p className="text-muted-foreground">
                      Receive personalized attention from a dedicated caregiver who gets to know your unique needs and preferences.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Flexible Hours</h3>
                    <p className="text-muted-foreground">
                      Get care when you need it—a few hours a week, daily visits, or 24/7 live-in support.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-2xl font-bold text-foreground mb-8">Home Care in Massachusetts Cities</h2>
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {topCities.map((city) => (
                  <Link key={city.slug} href={`/personal-care/massachusetts/${city.slug}`}>
                    <Card className="hover-elevate cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <MapPin className="h-5 w-5 text-primary mx-auto mb-2" />
                        <p className="font-medium text-foreground">{city.name}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="text-center">
                <Button asChild variant="outline">
                  <Link href="/directory">View All Massachusetts Locations</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted/30">
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

          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Compare Care Options
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
                <Link href="/independent-living/massachusetts">
                  <Card className="hover-elevate cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Building2 className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold">Independent Living</h3>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </section>

          <section className="py-16 bg-primary/5">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Find the Right Caregiver?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Schedule a free consultation with our care advisors. We'll help you understand your options and find a caregiver who's perfect for your family.
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
