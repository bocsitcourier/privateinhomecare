import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, MessageSquare, CheckCircle, Users } from "lucide-react";

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

  const stats = [
    {
      title: "Caregivers",
      value: Array.isArray(caregivers) ? caregivers.length : 0,
      published: Array.isArray(caregivers) ? caregivers.filter((c: any) => c.status === 'active').length : 0,
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Total Jobs",
      value: Array.isArray(jobs) ? jobs.length : 0,
      published: Array.isArray(jobs) ? jobs.filter((j: any) => j.status === 'published').length : 0,
      icon: Briefcase,
      color: "text-chart-1"
    },
    {
      title: "Total Articles",
      value: Array.isArray(articles) ? articles.length : 0,
      published: Array.isArray(articles) ? articles.filter((a: any) => a.status === 'published').length : 0,
      icon: FileText,
      color: "text-chart-2"
    },
    {
      title: "Inquiries",
      value: Array.isArray(inquiries) ? inquiries.length : 0,
      published: Array.isArray(inquiries) ? inquiries.filter((i: any) => i.status === 'pending').length : 0,
      icon: MessageSquare,
      color: "text-chart-3"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Monitor your site's content and activity</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <CheckCircle className="w-3 h-3 mr-1 text-chart-3" />
                {stat.published} {stat.title === "Inquiries" ? "pending" : stat.title === "Caregivers" ? "active" : "published"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            • Use the tabs above to manage jobs, articles, messages, and SEO settings
          </p>
          <p className="text-sm text-muted-foreground">
            • All forms are protected with CAPTCHA security
          </p>
          <p className="text-sm text-muted-foreground">
            • Contact form submissions appear in the Messages tab
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
