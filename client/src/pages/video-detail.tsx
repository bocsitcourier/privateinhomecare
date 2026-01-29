import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Eye, User, Target, BookOpen } from "lucide-react";
import type { Video } from "@shared/schema";

const categoryLabels: Record<string, string> = {
  "care-tips": "Care Tips",
  "caregiver-training": "Caregiver Training",
  "family-support": "Family Support",
  "health-conditions": "Health Conditions",
  "massachusetts-resources": "MA Resources",
  "testimonials": "Testimonials",
  "company-news": "Company News",
  "services": "Services",
  "dementia-care": "Dementia Care",
  "cost-analysis": "Cost Analysis",
  "guides": "Guides",
  "companionship": "Companionship",
  "local-guides": "Local Guides",
  "lifestyle": "Lifestyle"
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function VideoDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: video, isLoading, error } = useQuery<Video>({
    queryKey: ['/api/videos', slug],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${slug}`);
      if (!res.ok) throw new Error('Video not found');
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: relatedVideos = [] } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  const related = relatedVideos
    .filter(v => v.slug !== slug && v.status === 'published')
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
            <Link href="/videos">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Videos
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <PageSEO
        pageSlug={`video-${slug}`}
        fallbackTitle={video.metaTitle || `${video.title} | PrivateInHomeCareGiver`}
        fallbackDescription={video.metaDescription || video.description || "Watch this educational video from PrivateInHomeCareGiver."}
        canonicalPath={`/videos/${slug}`}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Link href="/videos">
              <Button variant="ghost" className="mb-6" data-testid="button-back-to-videos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Videos
              </Button>
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                  {video.videoType === 'upload' && video.videoUrl ? (
                    <video 
                      controls 
                      className="w-full h-full"
                      poster={video.thumbnailUrl || undefined}
                      data-testid="video-player"
                    >
                      <source src={video.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : video.embedUrl ? (
                    <iframe
                      src={video.embedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      data-testid="video-embed"
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      Video unavailable
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" data-testid="badge-category">
                      {categoryLabels[video.category] || video.category}
                    </Badge>
                    {video.duration && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(video.duration)}
                      </Badge>
                    )}
                    {video.viewCount > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Eye className="h-3 w-3" />
                        {video.viewCount.toLocaleString()} views
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold mb-4" data-testid="text-video-title">
                    {video.title}
                  </h1>
                  
                  {video.description && (
                    <p className="text-muted-foreground text-lg mb-6" data-testid="text-video-description">
                      {video.description}
                    </p>
                  )}

                  {(video.speakerName || video.speakerTitle) && (
                    <Card className="mb-6">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          {video.speakerName && (
                            <p className="font-semibold" data-testid="text-speaker-name">{video.speakerName}</p>
                          )}
                          {video.speakerTitle && (
                            <p className="text-sm text-muted-foreground">{video.speakerTitle}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {video.topics && video.topics.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <Target className="h-4 w-4" />
                        Topics Covered
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {video.topics.map((topic, i) => (
                          <Badge key={i} variant="outline">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {video.learningObjectives && video.learningObjectives.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <BookOpen className="h-4 w-4" />
                        What You'll Learn
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {video.learningObjectives.map((objective, i) => (
                          <li key={i}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-1">
                <h3 className="font-semibold mb-4">More Videos</h3>
                <div className="space-y-4">
                  {related.map((relatedVideo) => (
                    <Link key={relatedVideo.id} href={`/videos/${relatedVideo.slug}`}>
                      <Card className="hover-elevate cursor-pointer" data-testid={`card-related-${relatedVideo.id}`}>
                        <div className="aspect-video bg-muted relative">
                          {relatedVideo.thumbnailUrl && (
                            <img 
                              src={relatedVideo.thumbnailUrl} 
                              alt={`${relatedVideo.title} - Senior Care Video Massachusetts`}
                              title={`${relatedVideo.title} - Private InHome CareGiver`}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {relatedVideo.duration && (
                            <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs">
                              {formatDuration(relatedVideo.duration)}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <p className="font-medium text-sm line-clamp-2">{relatedVideo.title}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <div className="mt-8">
                  <Link href="/consultation">
                    <Button className="w-full" size="lg" data-testid="button-schedule-consultation">
                      Schedule a Free Consultation
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
