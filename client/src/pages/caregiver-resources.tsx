import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Heart, 
  DollarSign, 
  Search, 
  Brain, 
  Users,
  Video,
  Headphones,
  FileText,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Home,
  Stethoscope,
  Scale,
  Shield,
  MapPin
} from "lucide-react";
import { Link } from "wouter";
import type { Article } from "@shared/schema";

const resourceCategories = [
  {
    id: "signs-for-care",
    title: "Signs Your Loved One Needs Care",
    description: "Recognizing when it's time to seek help for aging parents or loved ones",
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    articles: [
      { title: "10 Warning Signs Your Parent Needs Help at Home", slug: "warning-signs-parent-needs-help" },
      { title: "When Is It Time for In-Home Care?", slug: "when-time-for-home-care" },
      { title: "Understanding Cognitive Decline in Seniors", slug: "understanding-cognitive-decline" },
      { title: "Physical Changes That Indicate Care Needs", slug: "physical-changes-care-needs" }
    ]
  },
  {
    id: "making-decisions",
    title: "Making Care Decisions",
    description: "Navigate the emotional and practical aspects of choosing care",
    icon: HelpCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    articles: [
      { title: "Complete Guide to Choosing In-Home Care", slug: "complete-guide-choosing-in-home-care" },
      { title: "Home Care vs Assisted Living: Which Is Right?", slug: "home-care-vs-assisted-living" },
      { title: "Questions to Ask When Hiring a Caregiver", slug: "questions-ask-hiring-caregiver" },
      { title: "Involving Your Loved One in Care Decisions", slug: "involving-loved-one-care-decisions" }
    ]
  },
  {
    id: "costs-payment",
    title: "Costs & Payment Options",
    description: "Understanding care costs and financial assistance in Massachusetts",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
    articles: [
      { title: "How Much Does In-Home Care Cost in MA?", slug: "home-care-cost-massachusetts" },
      { title: "Private Pay vs Insurance: Payment Options Guide", slug: "private-pay-insurance-payment-guide" },
      { title: "Veterans Benefits for Home Care", slug: "veterans-benefits-home-care" },
      { title: "Long-Term Care Insurance Guide", slug: "long-term-care-insurance-guide" }
    ]
  },
  {
    id: "finding-care",
    title: "Finding Quality Care",
    description: "Tips and resources for finding the right caregiver in Massachusetts",
    icon: Search,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    articles: [
      { title: "How to Find a Qualified PCA in Massachusetts", slug: "find-qualified-pca-massachusetts" },
      { title: "Background Check Essentials for Caregivers", slug: "background-check-essentials-caregivers" },
      { title: "What to Look for in a Home Care Agency", slug: "what-look-for-home-care-agency" },
      { title: "Understanding Different Types of In-Home Care", slug: "types-in-home-care" }
    ]
  },
  {
    id: "diseases-conditions",
    title: "Health Conditions & Care",
    description: "Specialized care guidance for specific health conditions",
    icon: Brain,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950",
    articles: [
      { title: "Dementia Care at Home: A Complete Guide", slug: "dementia-care-home-guide" },
      { title: "Caring for Someone with Alzheimer's Disease", slug: "caring-alzheimers-disease" },
      { title: "Parkinson's Disease Home Care Tips", slug: "parkinsons-home-care-tips" },
      { title: "Post-Stroke Home Care Essentials", slug: "post-stroke-home-care" },
      { title: "Managing Diabetes Care at Home", slug: "managing-diabetes-care-home" }
    ]
  },
  {
    id: "caregiver-self-care",
    title: "Caregiver Self-Care",
    description: "Resources to help family caregivers take care of themselves",
    icon: Heart,
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950",
    articles: [
      { title: "Preventing Caregiver Burnout", slug: "preventing-caregiver-burnout" },
      { title: "Self-Care Strategies for Family Caregivers", slug: "self-care-strategies-caregivers" },
      { title: "Finding Respite Care in Massachusetts", slug: "respite-care-massachusetts" },
      { title: "Caregiver Support Groups in MA", slug: "caregiver-support-groups-ma" }
    ]
  }
];

const quickLinks = [
  { title: "Free Care Consultation", href: "/consultation", icon: CheckCircle, description: "Speak with our care advisors" },
  { title: "Find a Caregiver", href: "/caregivers", icon: Users, description: "Browse our qualified PCAs" },
  { title: "Care Videos", href: "/videos", icon: Video, description: "Watch educational content" },
  { title: "Care Podcasts", href: "/podcasts", icon: Headphones, description: "Listen to expert advice" },
  { title: "Service Areas", href: "/directory", icon: MapPin, description: "MA communities we serve" },
  { title: "Our Services", href: "/services", icon: Home, description: "Learn about our care types" }
];

export default function CaregiverResourcesPage() {
  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  const featuredArticles = articles.filter(a => a.status === "published").slice(0, 4);

  return (
    <>
      <PageSEO
        pageSlug="caregiver-resources"
        fallbackTitle="Caregiver Resources | In-Home Care Guide | PrivateInHomeCareGiver"
        fallbackDescription="Comprehensive caregiver resources for Massachusetts families. Find guides on choosing care, costs, health conditions, and self-care for family caregivers."
        canonicalPath="/caregiver-resources"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-16 md:py-20">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="max-w-3xl">
                <Badge variant="secondary" className="mb-4">Caregiver Resources</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-page-title">
                  Your Complete Guide to In-Home Care in Massachusetts
                </h1>
                <p className="text-lg text-muted-foreground mb-8" data-testid="text-page-description">
                  Whether you're exploring care options, managing costs, or supporting a loved one with a specific condition, our expert resources are here to help you every step of the way.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" data-testid="button-cta-consultation">
                    <Link href="/consultation">
                      Get Free Care Advice
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" data-testid="button-browse-articles">
                    <Link href="/articles">Browse All Articles</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-12 border-b">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-quicklink-${link.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <CardContent className="p-4 text-center">
                        <link.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <h3 className="font-medium text-sm text-foreground">{link.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 hidden md:block">{link.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Explore Our Resource Library
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Find in-depth guides, practical tips, and expert advice organized by topic to help you navigate the caregiving journey.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resourceCategories.map((category) => (
                  <Card key={category.id} className="hover-elevate" data-testid={`card-category-${category.id}`}>
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-3`}>
                        <category.icon className={`h-6 w-6 ${category.color}`} />
                      </div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.articles.slice(0, 3).map((article, index) => (
                          <li key={index}>
                            <Link href={`/articles/${article.slug}`}>
                              <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer flex items-start gap-2">
                                <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">{article.title}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link href={`/articles?category=${category.id}`}>
                        <Button variant="ghost" size="sm" className="mt-4 w-full">
                          View All <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Videos</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Watch educational videos covering caregiving tips, health conditions, and family support resources.
                  </p>
                  <Button asChild variant="outline" data-testid="button-view-videos">
                    <Link href="/videos">
                      Watch Videos <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Headphones className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Podcasts</h2>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Listen to caregiver stories, expert interviews, and practical tips from our podcast series.
                  </p>
                  <Button asChild variant="outline" data-testid="button-view-podcasts">
                    <Link href="/podcasts">
                      Listen to Podcasts <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {featuredArticles.length > 0 && (
            <section className="py-16">
              <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-foreground">Featured Articles</h2>
                  <Button asChild variant="ghost">
                    <Link href="/articles">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredArticles.map((article) => (
                    <Link key={article.id} href={`/articles/${article.slug}`}>
                      <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-article-${article.id}`}>
                        {article.heroImageUrl && (
                          <div className="aspect-video overflow-hidden rounded-t-lg">
                            <img 
                              src={article.heroImageUrl} 
                              alt={`${article.title} - Caregiver Resources Massachusetts`}
                              title={`${article.title} - Private InHome CareGiver`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.excerpt}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-card">
                  <CardContent className="p-6 text-center">
                    <Stethoscope className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Health & Medical</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Specialized care guides for dementia, Alzheimer's, Parkinson's, and other conditions.
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/articles?category=health">Explore Guides</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-6 text-center">
                    <Scale className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Legal & Financial</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Power of attorney, healthcare proxy, advance directives, and financial planning.
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/articles?category=legal">Learn More</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-6 text-center">
                    <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Safety & Home</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Fall prevention, home safety checklists, and emergency planning for seniors.
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/articles?category=safety">View Resources</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="py-16 bg-primary/5">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Need Personalized Care Guidance?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our Massachusetts care advisors are ready to help you find the perfect care solution for your family. Schedule a free consultation today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" data-testid="button-cta-bottom-consultation">
                  <Link href="/consultation">
                    Schedule Free Consultation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="tel:+1-508-123-4567">Call (508) 123-4567</a>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
