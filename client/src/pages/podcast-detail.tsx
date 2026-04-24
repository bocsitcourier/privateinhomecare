import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Headphones, Clock, ArrowLeft, User, Calendar, Loader2, Volume2 } from "lucide-react";
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
  if (mins < 60) return `${mins}:${secs.toString().padStart(2, "0")}`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}:${remainingMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string | Date | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

interface TranscriptLine {
  speaker: "SARAH" | "MICHAEL" | null;
  text: string;
}

function parseTranscript(transcript: string): TranscriptLine[] {
  return transcript
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const sarah = line.match(/^\[SARAH\]:\s*(.+)/);
      const michael = line.match(/^\[MICHAEL\]:\s*(.+)/);
      if (sarah) return { speaker: "SARAH" as const, text: sarah[1].replace(/\[PAUSE\]/g, "...").replace(/\*(.*?)\*/g, "$1") };
      if (michael) return { speaker: "MICHAEL" as const, text: michael[1].replace(/\[PAUSE\]/g, "...").replace(/\*(.*?)\*/g, "$1") };
      return { speaker: null, text: line };
    });
}

type AudioState = "idle" | "generating" | "ready" | "error";

function GeminiAudioPlayer({ slug }: { slug: string }) {
  const [state, setState] = useState<AudioState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsedSec, setElapsedSec] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const loadAudio = async () => {
    try {
      const resp = await fetch(`/api/podcasts/${slug}/audio`);
      if (!resp.ok) throw new Error("Audio file not available");
      const blob = await resp.blob();
      setAudioUrl(URL.createObjectURL(blob));
      setState("ready");
    } catch (e: unknown) {
      setState("error");
      setErrorMsg(e instanceof Error ? e.message : "Failed to load audio");
    }
  };

  // On mount: if audio is cached → load it; if generating → resume polling; otherwise auto-start
  useEffect(() => {
    const startPolling = () => {
      timerRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);
      pollingRef.current = setInterval(async () => {
        try {
          const sr = await fetch(`/api/podcasts/${slug}/audio/status`);
          const sd = await sr.json();
          if (sd.status === "ready") { stopPolling(); loadAudio(); }
          else if (sd.status === "error") { stopPolling(); setState("error"); setErrorMsg(sd.error || "Generation failed"); }
        } catch { /* ignore transient errors */ }
      }, 3000);
    };

    fetch(`/api/podcasts/${slug}/audio/status`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "ready") {
          loadAudio();
        } else if (data.status === "generating") {
          setState("generating");
          startPolling();
        } else {
          // Not cached yet — auto-start generation immediately
          setState("generating");
          fetch(`/api/podcasts/${slug}/audio/generate`, { method: "POST", headers: { "Content-Type": "application/json" } })
            .then((r) => r.json())
            .then((d: { status?: string }) => {
              if (d.status === "ready") { loadAudio(); }
              else { startPolling(); }
            })
            .catch(() => {
              setState("error");
              setErrorMsg("Could not start audio generation. Please try again.");
            });
        }
      })
      .catch(() => { /* stay idle on network error */ });
    return () => stopPolling();
  }, [slug]);

  const retryGeneration = () => {
    setState("generating");
    setElapsedSec(0);
    setErrorMsg("");
    const startPolling = () => {
      timerRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);
      pollingRef.current = setInterval(async () => {
        try {
          const sr = await fetch(`/api/podcasts/${slug}/audio/status`);
          const sd: { status?: string; error?: string } = await sr.json();
          if (sd.status === "ready") { stopPolling(); loadAudio(); }
          else if (sd.status === "error") { stopPolling(); setState("error"); setErrorMsg(sd.error ?? "Generation failed"); }
        } catch { /* ignore transient errors */ }
      }, 3000);
    };
    fetch(`/api/podcasts/${slug}/audio/generate`, { method: "POST" })
      .then((r) => r.json())
      .then((d: { status?: string }) => {
        if (d.status === "ready") { loadAudio(); }
        else { startPolling(); }
      })
      .catch((e: unknown) => {
        setState("error");
        setErrorMsg(e instanceof Error ? e.message : "Failed to start audio generation");
      });
  };

  if (state === "idle") {
    return (
      <Card className="mb-8" data-testid="card-audio-loading">
        <CardContent className="p-6 flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
          <span className="text-sm">Loading audio…</span>
        </CardContent>
      </Card>
    );
  }

  if (state === "generating") {
    return (
      <Card className="mb-8" data-testid="card-audio-generating">
        <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <div>
            <p className="font-semibold text-foreground mb-1">Generating audio…</p>
            <p className="text-sm text-muted-foreground">
              Sarah and Michael are being voiced by Gemini. Full episodes typically take 60–90 seconds.
            </p>
            {elapsedSec > 0 && (
              <p className="text-xs text-muted-foreground mt-2">{elapsedSec}s elapsed</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state === "error") {
    return (
      <Card className="mb-8" data-testid="card-audio-error">
        <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-destructive">{errorMsg}</p>
          <Button variant="outline" onClick={retryGeneration} data-testid="button-retry-audio">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8" data-testid="card-audio-player">
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Volume2 className="w-4 h-4 text-primary" />
          <span>Sarah &amp; Michael — AI voices by Google Gemini</span>
        </div>
        <audio
          src={audioUrl!}
          controls
          autoPlay
          className="w-full"
          data-testid="audio-player"
        />
      </CardContent>
    </Card>
  );
}

function ConversationTranscript({ transcript }: { transcript: string }) {
  const lines = parseTranscript(transcript);
  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {lines.map((line, i) => {
        if (line.speaker === "SARAH") {
          return (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary-foreground text-xs font-bold">S</span>
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Sarah</span>
                <p className="text-sm text-foreground leading-relaxed">{line.text}</p>
              </div>
            </div>
          );
        }
        if (line.speaker === "MICHAEL") {
          return (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide block mb-1">Michael</span>
                <p className="text-sm text-foreground leading-relaxed">{line.text}</p>
              </div>
            </div>
          );
        }
        return line.text ? (
          <p key={i} className="text-xs text-muted-foreground italic pl-10">{line.text}</p>
        ) : null;
      })}
    </div>
  );
}

export default function PodcastDetailPage() {
  const params = useParams<{ slug: string }>();

  const { data: podcast, isLoading, error } = useQuery<Podcast>({
    queryKey: ["/api/podcasts", params.slug],
    enabled: !!params.slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 max-w-4xl py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
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

  return (
    <>
      <PageSEO
        pageSlug={`podcasts-${podcast.slug}`}
        fallbackTitle={`${podcast.title} | Care Podcasts | Private InHome CareGiver`}
        fallbackDescription={podcast.description || `Listen to ${podcast.title} - a care podcast episode from Private InHome CareGiver.`}
        canonicalPath={`/podcasts/${podcast.slug}`}
        includeMaGeoTargeting={true}
        pageType="article"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Caregiver Resources", url: "/caregiver-resources" },
          { name: "Podcasts", url: "/podcasts" },
          { name: podcast.title, url: `/podcasts/${podcast.slug}` },
        ]}
        additionalSchemas={[
          {
            "@context": "https://schema.org",
            "@type": "PodcastEpisode",
            name: podcast.title,
            description: podcast.description || podcast.title,
            url: `https://privateinhomecaregiver.com/podcasts/${podcast.slug}`,
            datePublished: podcast.publishedAt ? new Date(podcast.publishedAt).toISOString() : new Date().toISOString(),
            duration: podcast.duration ? `PT${podcast.duration}S` : undefined,
            author: { "@type": "Organization", name: "Private InHome CareGiver", url: "https://privateinhomecaregiver.com" },
            publisher: { "@type": "Organization", name: "Private InHome CareGiver", url: "https://privateinhomecaregiver.com", logo: "https://privateinhomecaregiver.com/logo.png" },
            partOfSeries: { "@type": "PodcastSeries", name: "Private InHome CareGiver Care Podcast", url: "https://privateinhomecaregiver.com/podcasts" },
            inLanguage: "en-US",
          },
        ]}
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

            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  {podcast.thumbnailUrl ? (
                    <img
                      src={podcast.thumbnailUrl}
                      alt={`${podcast.title} - Senior Care Podcast Massachusetts`}
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
                    <Badge variant="outline" data-testid="badge-episode">Episode {podcast.episodeNumber}</Badge>
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
                </div>
              </div>
            </div>

            {/* Audio — uploaded file takes priority, then Gemini TTS, then embed */}
            {podcast.audioUrl ? (
              <Card className="mb-8" data-testid="card-audio-file-player">
                <CardContent className="p-6">
                  <audio controls src={podcast.audioUrl} className="w-full" />
                </CardContent>
              </Card>
            ) : podcast.transcript ? (
              <GeminiAudioPlayer slug={podcast.slug} />
            ) : podcast.embedUrl ? (
              <Card className="mb-8" data-testid="card-embed-player">
                <CardContent className="p-6">
                  <iframe
                    src={podcast.embedUrl}
                    width="100%"
                    height="232"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title={podcast.title}
                    className="rounded-lg"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-8">
                <CardContent className="p-8 text-center">
                  <Headphones className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Audio for this episode is coming soon.</p>
                </CardContent>
              </Card>
            )}

            {/* Guest */}
            {(podcast.guestName || podcast.guestTitle) && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Guest</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      {podcast.guestName && <p className="font-medium text-foreground">{podcast.guestName}</p>}
                      {podcast.guestTitle && <p className="text-sm text-muted-foreground">{podcast.guestTitle}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Show notes */}
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

            {/* Transcript */}
            {podcast.transcript && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Episode Transcript</h2>
                  <div className="flex gap-4 mb-5 flex-wrap">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                      <span className="font-medium text-foreground">Sarah</span>
                      <span className="text-muted-foreground">— Host</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                      <span className="font-medium text-foreground">Michael</span>
                      <span className="text-muted-foreground">— Co-Host</span>
                    </div>
                  </div>
                  <ConversationTranscript transcript={podcast.transcript} />
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
