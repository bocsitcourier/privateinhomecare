import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
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
  Stethoscope,
  HandHeart,
  Building2
} from "lucide-react";
import { Link } from "wouter";

const costData = {
  hospiceMedicare: "Covered",
  privatePay: "$150-$500",
  palliative: "$75-$250",
  trend: "Medicare covers most hospice"
};

const topCities = [
  { name: "Boston", count: 3 },
  { name: "Worcester", count: 3 },
  { name: "Fairhaven", count: 3 },
  { name: "Pittsfield", count: 2 },
  { name: "Northampton", count: 2 },
  { name: "Brockton", count: 2 }
];

const faqs = [
  {
    question: "What is the difference between hospice and palliative care?",
    answer: "Palliative care focuses on providing relief from symptoms and improving quality of life at any stage of a serious illness, often alongside curative treatments. Hospice care is a type of palliative care for those with a terminal illness and a life expectancy of six months or less, focusing entirely on comfort rather than cure."
  },
  {
    question: "Does Medicare cover hospice care in Massachusetts?",
    answer: "Yes, Medicare covers hospice care 100% for eligible patients with a terminal illness and a life expectancy of six months or less. This includes doctor services, nursing care, medical equipment, supplies, medications for symptom control, and short-term inpatient care."
  },
  {
    question: "Can hospice care be provided at home?",
    answer: "Yes, most hospice care in Massachusetts is provided in the patient's home. Hospice teams visit regularly to provide medical care, pain management, emotional support, and help with daily activities. This allows patients to spend their final months in comfortable, familiar surroundings."
  },
  {
    question: "How do I know when it's time for hospice care?",
    answer: "Signs that hospice may be appropriate include: frequent hospitalizations, progressive decline despite treatment, desire to focus on comfort over cure, difficulty with daily activities, significant weight loss, or when a physician estimates life expectancy of six months or less."
  },
  {
    question: "What support is available for family caregivers during hospice?",
    answer: "Hospice programs provide comprehensive family support including respite care (temporary relief for caregivers), grief counseling, spiritual support, education on caregiving, and bereavement services for up to 13 months after the patient's passing."
  }
];

const hospiceServices = [
  "Pain and symptom management",
  "Nursing care and medical visits",
  "Medical equipment and supplies",
  "Medications for comfort",
  "Spiritual and emotional counseling",
  "Social work services",
  "Bereavement support for families",
  "24/7 on-call nurse availability"
];

const palliativeServices = [
  "Expert symptom management",
  "Care coordination",
  "Advance care planning",
  "Emotional and psychological support",
  "Family meetings and communication",
  "Goals of care discussions",
  "Connection to community resources",
  "Support alongside curative treatment"
];

export default function HospicePalliativeCarePage() {
  return (
    <>
      <PageSEO
        pageSlug="hospice-palliative-care-massachusetts"
        fallbackTitle="Hospice & Palliative Care in Massachusetts | PrivateInHomeCareGiver"
        fallbackDescription="Find hospice and palliative care providers in Massachusetts. Learn about end-of-life care options, Medicare coverage, and in-home support for families."
        canonicalPath="/hospice-palliative-care/massachusetts"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-20">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="max-w-3xl">
                <Badge variant="secondary" className="mb-4">Massachusetts Care Options</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-page-title">
                  Hospice & Palliative Care in Massachusetts
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Massachusetts has over 80 hospice providers offering compassionate end-of-life care. Whether you're exploring options for yourself or a loved one, we're here to help you understand your choices and find the support your family needs.
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
                      <Shield className="h-5 w-5 text-primary" />
                      Medicare Coverage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{costData.hospiceMedicare}</p>
                    <p className="text-sm text-muted-foreground">100% for eligible patients</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Private Pay Visits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">{costData.privatePay}</p>
                    <p className="text-sm text-muted-foreground">per visit for additional care</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Leaf className="h-5 w-5 text-primary" />
                      80+ Providers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-foreground">Statewide</p>
                    <p className="text-sm text-muted-foreground">Licensed hospice programs</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Understanding Hospice Care</h2>
                  <p className="text-muted-foreground mb-4">
                    Hospice care is a specialized form of healthcare that focuses on providing comfort, dignity, and quality of life for individuals facing a life-limiting illness. Rather than pursuing aggressive treatments aimed at cure, hospice emphasizes pain management, symptom control, and emotional support.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    In Massachusetts, hospice programs are licensed by the Department of Public Health and typically provide care in the patient's home, though some facilities offer inpatient hospice units for those who need more intensive symptom management.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">Hospice Services Include:</h3>
                  <ul className="space-y-2 mb-6">
                    {hospiceServices.map((service, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{service}</span>
                      </li>
                    ))}
                  </ul>

                  <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">Understanding Palliative Care</h2>
                  <p className="text-muted-foreground mb-4">
                    Palliative care is appropriate at any stage of a serious illness and can be provided alongside curative treatment. It focuses on improving quality of life by addressing physical symptoms, emotional distress, and practical concerns.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">Palliative Care Services:</h3>
                  <ul className="space-y-2 mb-6">
                    {palliativeServices.map((service, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Find Hospice Providers by City</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {topCities.map((city) => (
                      <Link key={city.name} href={`/facilities/hospice?city=${encodeURIComponent(city.name)}`}>
                        <Card className="hover-elevate cursor-pointer h-full">
                          <CardContent className="p-4 flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">{city.name}</p>
                              <p className="text-sm text-muted-foreground">{city.count}+ providers</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="w-full mb-8" data-testid="button-browse-facilities">
                    <Link href="/facilities/hospice">
                      <Building2 className="mr-2 h-4 w-4" />
                      Browse All Hospice Providers
                    </Link>
                  </Button>

                  <Card className="bg-primary/5 border-primary/20 mb-6">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        In-Home Hospice Support
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Our personal care assistants can provide supplemental support alongside hospice care, helping with daily activities, companionship, and giving family caregivers much-needed respite.
                      </p>
                      <Button asChild>
                        <Link href="/quiz/hospice-palliative-care-assessment">
                          Take Care Assessment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <HandHeart className="h-5 w-5 text-amber-600" />
                        Signs It May Be Time for Hospice
                      </h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>Frequent hospitalizations or ER visits</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>Declining function despite treatment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>Desire to focus on comfort and quality of life</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>Physician estimates 6 months or less</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Hospice vs. Palliative Care: Key Differences
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5" />
                      Hospice Care
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>For terminal illness (6 months or less)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Focus on comfort, not cure</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Medicare covers 100%</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Includes bereavement support</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>24/7 on-call support</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Heart className="h-5 w-5" />
                      Palliative Care
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Any stage of serious illness</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Can be used with curative treatment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Insurance coverage varies</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Focus on quality of life</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Care coordination services</span>
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Link href="/nursing-homes/massachusetts">
                  <Card className="hover-elevate cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Building2 className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold text-sm">Nursing Homes</h3>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/assisted-living/massachusetts">
                  <Card className="hover-elevate cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold text-sm">Assisted Living</h3>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/memory-care/massachusetts">
                  <Card className="hover-elevate cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold text-sm">Memory Care</h3>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/independent-living/massachusetts">
                  <Card className="hover-elevate cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <Home className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold text-sm">Independent Living</h3>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/services">
                  <Card className="hover-elevate cursor-pointer h-full border-primary/30">
                    <CardContent className="p-6 text-center">
                      <HandHeart className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold text-sm text-primary">In-Home Care</h3>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </section>

          <section className="py-16 bg-primary/5">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Need Help Finding Hospice Care?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our compassionate care advisors can help you understand hospice and palliative care options, navigate Medicare coverage, and find the right support for your family—at no cost to you.
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
