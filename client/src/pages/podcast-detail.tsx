import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Headphones, Clock, Play, Pause, ArrowLeft, User, Calendar, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  const secs = seconds % 60;
  if (mins < 60) return `${mins}:${secs.toString().padStart(2, '0')}`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string | Date | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function PodcastDetailPage() {
  const params = useParams<{ slug: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: podcast, isLoading, error } = useQuery<Podcast>({
    queryKey: ['/api/podcasts', params.slug],
    enabled: !!params.slug,
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [podcast]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 max-w-4xl py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !podcast) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 max-w-4xl py-12 text-center">
          <Headphones className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Podcast Not Found</h1>
          <p className="text-muted-foreground mb-6">This episode may have been removed or isn't available yet.</p>
          <Button asChild>
            <Link href="/podcasts">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Podcasts
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  const hasAudio = podcast.audioUrl || podcast.embedUrl;

  return (
    <>
      <PageSEO
        pageSlug={`podcasts-${podcast.slug}`}
        fallbackTitle={`${podcast.title} | Care Podcasts | PrivateInHomeCareGiver`}
        fallbackDescription={podcast.description || `Listen to ${podcast.title} - a care podcast episode from PrivateInHomeCareGiver.`}
        canonicalPath={`/podcasts/${podcast.slug}`}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 max-w-4xl py-8">
            <Link href="/podcasts">
              <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-podcasts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                All Podcasts
              </Button>
            </Link>

            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  {podcast.thumbnailUrl ? (
                    <img
                      src={podcast.thumbnailUrl}
                      alt={`${podcast.title} - Senior Care Podcast Massachusetts`}
                      title={`${podcast.title} - Private InHome CareGiver`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Headphones className="w-20 h-20 text-white" />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="secondary" data-testid="badge-category">
                    {categoryLabels[podcast.category] || podcast.category}
                  </Badge>
                  {podcast.episodeNumber && (
                    <Badge variant="outline" data-testid="badge-episode">
                      Episode {podcast.episodeNumber}
                    </Badge>
                  )}
                  {podcast.seasonNumber && (
                    <Badge variant="outline">Season {podcast.seasonNumber}</Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-podcast-title">
                  {podcast.title}
                </h1>

                {podcast.description && (
                  <p className="text-lg text-muted-foreground mb-4" data-testid="text-podcast-description">
                    {podcast.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {podcast.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(podcast.duration)}
                    </span>
                  )}
                  {podcast.hostName && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Host: {podcast.hostName}
                    </span>
                  )}
                  {podcast.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(podcast.publishedAt)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    {podcast.playCount} plays
                  </span>
                </div>
              </div>
            </div>

            {podcast.audioUrl && (
              <Card className="mb-8" data-testid="card-audio-player">
                <CardContent className="p-6">
                  <audio ref={audioRef} src={podcast.audioUrl} preload="metadata" />
                  
                  <div className="flex items-center gap-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => skip(-15)}
                      data-testid="button-skip-back"
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>

                    <Button
                      size="icon"
                      onClick={togglePlay}
                      data-testid="button-play-pause"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6 ml-0.5" />
                      )}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => skip(30)}
                      data-testid="button-skip-forward"
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>

                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-xs text-muted-foreground min-w-[40px] text-right">
                        {formatTime(currentTime)}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={currentTime}
                        onChange={seek}
                        className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                        data-testid="input-seek"
                      />
                      <span className="text-xs text-muted-foreground min-w-[40px]">
                        {formatTime(duration)}
                      </span>
                    </div>

                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            )}

            {podcast.embedUrl && (
              <Card className="mb-8" data-testid="card-embed-player">
                <CardContent className="p-6">
                  {podcast.audioType === "spotify" ? (
                    <iframe
                      src={podcast.embedUrl}
                      width="100%"
                      height="232"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      title={`${podcast.title} on Spotify`}
                      className="rounded-lg"
                    />
                  ) : podcast.audioType === "apple" ? (
                    <iframe
                      src={podcast.embedUrl}
                      width="100%"
                      height="175"
                      frameBorder="0"
                      allow="autoplay"
                      sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                      title={`${podcast.title} on Apple Podcasts`}
                      className="rounded-lg"
                    />
                  ) : (
                    <iframe
                      src={podcast.embedUrl}
                      width="100%"
                      height="200"
                      frameBorder="0"
                      allow="autoplay"
                      title={podcast.title}
                      className="rounded-lg"
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {!hasAudio && (
              <Card className="mb-8">
                <CardContent className="p-8 text-center">
                  <Headphones className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Audio for this episode is coming soon.</p>
                </CardContent>
              </Card>
            )}

            {(podcast.guestName || podcast.guestTitle) && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Guest</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      {podcast.guestName && (
                        <p className="font-medium text-foreground">{podcast.guestName}</p>
                      )}
                      {podcast.guestTitle && (
                        <p className="text-sm text-muted-foreground">{podcast.guestTitle}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {podcast.showNotes && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Show Notes</h2>
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: podcast.showNotes }}
                  />
                </CardContent>
              </Card>
            )}

            {podcast.transcript && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Transcript</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                    {podcast.transcript}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Have questions about senior care in Massachusetts?</p>
              <Button asChild size="lg" data-testid="button-cta-consultation">
                <a href="/consultation">Schedule Free Consultation</a>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
