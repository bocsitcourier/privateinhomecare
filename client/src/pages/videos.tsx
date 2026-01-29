import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Eye, Filter } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { Video } from "@shared/schema";

const categoryLabels: Record<string, string> = {
  "care-tips": "Care Tips",
  "caregiver-training": "Caregiver Training",
  "family-support": "Family Support",
  "health-conditions": "Health Conditions",
  "massachusetts-resources": "MA Resources",
  "testimonials": "Testimonials",
  "company-news": "Company News"
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function VideosPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos', selectedCategory].filter(Boolean),
  });

  const filteredVideos = selectedCategory 
    ? videos.filter(v => v.category === selectedCategory)
    : videos;

  const featuredVideos = filteredVideos.filter(v => v.featured === "yes");
  const regularVideos = filteredVideos.filter(v => v.featured !== "yes");

  return (
    <>
      <PageSEO
        pageSlug="videos"
        fallbackTitle="Care Videos | PrivateInHomeCareGiver"
        fallbackDescription="Watch educational videos about in-home care, caregiver training, health conditions, and family support resources in Massachusetts."
        canonicalPath="/videos"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-page-title">
                Care Videos
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl" data-testid="text-page-description">
                Watch our educational videos covering caregiving tips, health conditions, family support, and Massachusetts care resources.
              </p>
            </div>
          </section>

          <section className="py-8 border-b">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Button
                  variant={selectedCategory === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("")}
                  data-testid="button-filter-all"
                >
                  All Videos
                </Button>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                    data-testid={`button-filter-${key}`}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="aspect-video bg-muted"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="text-center py-16">
                  <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-foreground mb-2">No Videos Yet</h2>
                  <p className="text-muted-foreground">
                    We're working on creating helpful video content. Check back soon!
                  </p>
                </div>
              ) : (
                <>
                  {featuredVideos.length > 0 && (
                    <div className="mb-12">
                      <h2 className="text-2xl font-bold text-foreground mb-6">Featured Videos</h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        {featuredVideos.map(video => (
                          <Link key={video.id} href={`/videos/${video.slug}`}>
                            <Card className="hover-elevate cursor-pointer overflow-hidden group" data-testid={`card-video-${video.id}`}>
                              <div className="relative aspect-video bg-muted">
                                {video.thumbnailUrl ? (
                                  <img 
                                    src={video.thumbnailUrl} 
                                    alt={`${video.title} - Senior Care Video Massachusetts`}
                                    title={`${video.title} - Private InHome CareGiver`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                    <Play className="w-16 h-16 text-primary" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="bg-white rounded-full p-4">
                                    <Play className="w-8 h-8 text-primary fill-primary" />
                                  </div>
                                </div>
                                {video.duration && (
                                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                                    {formatDuration(video.duration)}
                                  </div>
                                )}
                              </div>
                              <CardContent className="p-4">
                                <Badge variant="secondary" className="mb-2">
                                  {categoryLabels[video.category] || video.category}
                                </Badge>
                                <h3 className="text-lg font-semibold text-foreground line-clamp-2 mb-2">
                                  {video.title}
                                </h3>
                                {video.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> {video.viewCount} views
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {regularVideos.length > 0 && (
                    <div>
                      {featuredVideos.length > 0 && (
                        <h2 className="text-2xl font-bold text-foreground mb-6">All Videos</h2>
                      )}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regularVideos.map(video => (
                          <Link key={video.id} href={`/videos/${video.slug}`}>
                            <Card className="hover-elevate cursor-pointer overflow-hidden group" data-testid={`card-video-${video.id}`}>
                              <div className="relative aspect-video bg-muted">
                                {video.thumbnailUrl ? (
                                  <img 
                                    src={video.thumbnailUrl} 
                                    alt={`${video.title} - Senior Care Video Massachusetts`}
                                    title={`${video.title} - Private InHome CareGiver`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                                    <Play className="w-12 h-12 text-primary" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="bg-white rounded-full p-3">
                                    <Play className="w-6 h-6 text-primary fill-primary" />
                                  </div>
                                </div>
                                {video.duration && (
                                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {formatDuration(video.duration)}
                                  </div>
                                )}
                              </div>
                              <CardContent className="p-4">
                                <Badge variant="outline" className="mb-2 text-xs">
                                  {categoryLabels[video.category] || video.category}
                                </Badge>
                                <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                                  {video.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> {video.viewCount}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-6xl text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Need Help with In-Home Care?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our care experts are ready to help you find the perfect care solution for your loved one in Massachusetts.
              </p>
              <Button asChild size="lg" data-testid="button-cta-consultation">
                <a href="/consultation">Schedule Free Consultation</a>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
