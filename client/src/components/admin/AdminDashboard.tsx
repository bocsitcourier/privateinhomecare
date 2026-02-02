import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, MessageSquare, CheckCircle, Users, HelpCircle, ClipboardList, Gift, FileCheck, Eye, TrendingUp, Video, Headphones, Sparkles, Car } from "lucide-react";
import { Link } from "wouter";

interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  topPages: { slug: string; views: number }[];
  dailyTraffic: { day: string; views: number }[];
  mediaPlays: { type: string; count: number }[];
}

export default function AdminDashboard() {
  const { data: caregivers } = useQuery({ 
    queryKey: ["/api/admin/caregivers"],
    refetchInterval: 30000
  });
  const { data: jobs } = useQuery({ 
    queryKey: ["/api/admin/jobs"],
    refetchInterval: 30000
  });
  const { data: articles } = useQuery({ 
    queryKey: ["/api/admin/articles"],
    refetchInterval: 30000
  });
  const { data: inquiries } = useQuery({ 
    queryKey: ["/api/admin/inquiries"],
    refetchInterval: 30000
  });
  const { data: quizLeads } = useQuery({ 
    queryKey: ["/api/admin/quiz-leads"],
    refetchInterval: 30000
  });
  const { data: intakeForms } = useQuery({ 
    queryKey: ["/api/admin/intake-forms"],
    refetchInterval: 30000
  });
  const { data: referrals } = useQuery({ 
    queryKey: ["/api/admin/referrals"],
    refetchInterval: 30000
  });
  const { data: conciergeRequests } = useQuery({ 
    queryKey: ["/api/admin/concierge-requests"],
    refetchInterval: 30000
  });
  const { data: transportationRequests } = useQuery({ 
    queryKey: ["/api/admin/transportation-requests"],
    refetchInterval: 30000
  });
  const { data: applications } = useQuery({ 
    queryKey: ["/api/admin/applications"],
    refetchInterval: 30000
  });
  const { data: videos } = useQuery({ 
    queryKey: ["/api/videos"],
    refetchInterval: 30000
  });
  const { data: podcasts } = useQuery({ 
    queryKey: ["/api/podcasts"],
    refetchInterval: 30000
  });
  const { data: analytics } = useQuery<AnalyticsSummary>({ 
    queryKey: ["/api/admin/analytics/summary"],
    refetchInterval: 30000
  });

  const leadStats = [
    {
      title: "Inquiries",
      value: Array.isArray(inquiries) ? inquiries.length : 0,
      pending: Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'pending').length : 0,
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      href: "/admin/inquiries"
    },
    {
      title: "Quiz Leads",
      value: Array.isArray(quizLeads) ? quizLeads.length : 0,
      pending: Array.isArray(quizLeads) ? quizLeads.filter((q: any) => q.status === 'new').length : 0,
      icon: HelpCircle,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      href: "/admin/quiz-leads"
    },
    {
      title: "Intake Forms",
      value: Array.isArray(intakeForms) ? intakeForms.length : 0,
      pending: Array.isArray(intakeForms) ? intakeForms.filter((i: any) => i.status === 'pending').length : 0,
      icon: ClipboardList,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
      href: "/admin/intake-forms"
    },
    {
      title: "Referrals",
      value: Array.isArray(referrals) ? referrals.length : 0,
      pending: Array.isArray(referrals) ? referrals.filter((r: any) => r.status === 'pending').length : 0,
      icon: Gift,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      href: "/admin/referrals"
    },
    {
      title: "Concierge",
      value: Array.isArray(conciergeRequests) ? conciergeRequests.length : 0,
      pending: Array.isArray(conciergeRequests) ? conciergeRequests.filter((c: any) => c.status === 'pending').length : 0,
      icon: Sparkles,
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-950",
      href: "/admin/concierge"
    },
    {
      title: "Transport",
      value: Array.isArray(transportationRequests) ? transportationRequests.length : 0,
      pending: Array.isArray(transportationRequests) ? transportationRequests.filter((t: any) => t.status === 'pending').length : 0,
      icon: Car,
      color: "text-teal-500",
      bgColor: "bg-teal-50 dark:bg-teal-950",
      href: "/admin/transportation"
    },
  ];

  const teamStats = [
    {
      title: "Applications",
      value: Array.isArray(applications) ? applications.length : 0,
      pending: Array.isArray(applications) ? applications.filter((a: any) => a.status === 'pending').length : 0,
      icon: FileCheck,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
      href: "/admin/applications"
    },
    {
      title: "Caregivers",
      value: Array.isArray(caregivers) ? caregivers.length : 0,
      active: Array.isArray(caregivers) ? caregivers.filter((c: any) => c.status === 'active').length : 0,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/admin/caregivers"
    },
    {
      title: "Job Listings",
      value: Array.isArray(jobs) ? jobs.length : 0,
      published: Array.isArray(jobs) ? jobs.filter((j: any) => j.status === 'published').length : 0,
      icon: Briefcase,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950",
      href: "/admin/jobs"
    },
  ];

  const contentStats = [
    {
      title: "Articles",
      value: Array.isArray(articles) ? articles.length : 0,
      published: Array.isArray(articles) ? articles.filter((a: any) => a.status === 'published').length : 0,
      icon: FileText,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
      href: "/admin/articles"
    },
    {
      title: "Videos",
      value: Array.isArray(videos) ? videos.length : 0,
      published: Array.isArray(videos) ? videos.filter((v: any) => v.status === 'published').length : 0,
      icon: Video,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950",
      href: "/admin/videos"
    },
    {
      title: "Podcasts",
      value: Array.isArray(podcasts) ? podcasts.length : 0,
      published: Array.isArray(podcasts) ? podcasts.filter((p: any) => p.status === 'published').length : 0,
      icon: Headphones,
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-950",
      href: "/admin/podcasts"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">Dashboard Overview</h2>
        <p className="text-muted-foreground">Monitor your site's content, leads, and activity</p>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium opacity-90">Page Views</CardTitle>
              <Eye className="w-4 h-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-page-views">{analytics.totalPageViews || 0}</div>
              <p className="text-xs opacity-80 mt-1">Total page views tracked</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium opacity-90">Unique Visitors</CardTitle>
              <Users className="w-4 h-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-unique-visitors">{analytics.uniqueVisitors || 0}</div>
              <p className="text-xs opacity-80 mt-1">Distinct visitors</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium opacity-90">Media Plays</CardTitle>
              <TrendingUp className="w-4 h-4 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-media-plays">
                {analytics.mediaPlays?.reduce((acc: number, m: any) => acc + m.count, 0) || 0}
              </div>
              <p className="text-xs opacity-80 mt-1">Video & podcast plays</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lead Management Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
          Lead Management
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leadStats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className={`${stat.bgColor} cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid={`text-${stat.title.toLowerCase().replace(' ', '-')}-count`}>{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <CheckCircle className="w-3 h-3 mr-1 text-yellow-500" />
                    {stat.pending} pending
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Team Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          Team & Recruitment
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {teamStats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className={`${stat.bgColor} cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                    {'pending' in stat ? `${stat.pending} pending` : 
                     'active' in stat ? `${stat.active} active` : 
                     `${stat.published} published`}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Content Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-muted-foreground" />
          Content
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {contentStats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className={`${stat.bgColor} cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                    {stat.published} published
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Pages */}
      {analytics?.topPages && analytics.topPages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topPages.slice(0, 5).map((page: { slug: string; views: number }, index: number) => (
                <div key={page.slug} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-sm flex items-center gap-2">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    {page.slug}
                  </span>
                  <span className="font-semibold">{page.views} views</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Use the sidebar navigation to manage leads, content, team, and settings
          </p>
          <p className="text-sm text-muted-foreground">
            All public forms are protected with CAPTCHA security
          </p>
          <p className="text-sm text-muted-foreground">
            Analytics tracking is automatic for all page views and media plays
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
