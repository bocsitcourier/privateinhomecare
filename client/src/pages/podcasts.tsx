import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Headphones, Clock, Play, Filter, Mic } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { Podcast } from "@shared/schema";

const categoryLabels: Record<string, string> = {
  "caregiver-stories": "Caregiver Stories",
  "expert-interviews": "Expert Interviews",
  "family-conversations": "Family Conversations",
  "health-topics": "Health Topics",
  "massachusetts-care": "MA Care",
  "tips-and-advice": "Tips & Advice"
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

export default function PodcastsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const { data: podcasts = [], isLoading } = useQuery<Podcast[]>({
    queryKey: ['/api/podcasts', selectedCategory].filter(Boolean),
  });

  const filteredPodcasts = selectedCategory 
    ? podcasts.filter(p => p.category === selectedCategory)
    : podcasts;

  const featuredPodcasts = filteredPodcasts.filter(p => p.featured === "yes");
  const regularPodcasts = filteredPodcasts.filter(p => p.featured !== "yes");

  return (
    <>
      <PageSEO
        pageSlug="podcasts"
        fallbackTitle="Care Podcasts | PrivateInHomeCareGiver"
        fallbackDescription="Listen to our podcast series featuring caregiver stories, expert interviews, health topics, and caregiving tips for Massachusetts families."
        canonicalPath="/podcasts"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <Headphones className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground" data-testid="text-page-title">
                  Care Podcasts
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-3xl" data-testid="text-page-description">
                Listen to inspiring stories, expert advice, and practical tips from our podcast series dedicated to caregivers and families in Massachusetts.
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
                  All Episodes
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
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6 flex gap-4">
                        <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                          <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredPodcasts.length === 0 ? (
                <div className="text-center py-16">
                  <Mic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-foreground mb-2">Coming Soon</h2>
                  <p className="text-muted-foreground">
                    We're working on creating our podcast series. Subscribe to be notified when new episodes are available!
                  </p>
                </div>
              ) : (
                <>
                  {featuredPodcasts.length > 0 && (
                    <div className="mb-12">
                      <h2 className="text-2xl font-bold text-foreground mb-6">Featured Episodes</h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        {featuredPodcasts.map(podcast => (
                          <Link key={podcast.id} href={`/podcasts/${podcast.slug}`}>
                            <Card className="hover-elevate cursor-pointer overflow-hidden" data-testid={`card-podcast-${podcast.id}`}>
                              <CardContent className="p-6">
                                <div className="flex gap-4">
                                  <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                    {podcast.thumbnailUrl ? (
                                      <img 
                                        src={podcast.thumbnailUrl} 
                                        alt={podcast.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Headphones className="w-12 h-12 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="secondary">
                                        {categoryLabels[podcast.category] || podcast.category}
                                      </Badge>
                                      {podcast.episodeNumber && (
                                        <span className="text-xs text-muted-foreground">
                                          Ep. {podcast.episodeNumber}
                                        </span>
                                      )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground line-clamp-2 mb-2">
                                      {podcast.title}
                                    </h3>
                                    {podcast.description && (
                                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {podcast.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      {podcast.duration && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" /> {formatDuration(podcast.duration)}
                                        </span>
                                      )}
                                      {podcast.guestName && (
                                        <span>Guest: {podcast.guestName}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {regularPodcasts.length > 0 && (
                    <div>
                      {featuredPodcasts.length > 0 && (
                        <h2 className="text-2xl font-bold text-foreground mb-6">All Episodes</h2>
                      )}
                      <div className="space-y-4">
                        {regularPodcasts.map(podcast => (
                          <Link key={podcast.id} href={`/podcasts/${podcast.slug}`}>
                            <Card className="hover-elevate cursor-pointer" data-testid={`card-podcast-${podcast.id}`}>
                              <CardContent className="p-4 md:p-6">
                                <div className="flex gap-4">
                                  <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    {podcast.thumbnailUrl ? (
                                      <img 
                                        src={podcast.thumbnailUrl} 
                                        alt={podcast.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Headphones className="w-8 h-8 text-primary" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="text-xs">
                                        {categoryLabels[podcast.category] || podcast.category}
                                      </Badge>
                                      {podcast.episodeNumber && (
                                        <span className="text-xs text-muted-foreground">
                                          Ep. {podcast.episodeNumber}
                                        </span>
                                      )}
                                    </div>
                                    <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                                      {podcast.title}
                                    </h3>
                                    {podcast.description && (
                                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2 hidden md:block">
                                        {podcast.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      {podcast.duration && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" /> {formatDuration(podcast.duration)}
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1">
                                        <Play className="w-3 h-3" /> {podcast.playCount} plays
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <Button size="icon" variant="ghost" className="rounded-full">
                                      <Play className="w-5 h-5" />
                                    </Button>
                                  </div>
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
              <h2 className="text-2xl font-bold text-foreground mb-4">Have Questions About Care?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our care experts are here to help you navigate the caregiving journey for your loved one in Massachusetts.
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
