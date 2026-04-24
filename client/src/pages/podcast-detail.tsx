import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/Header";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Headphones, Clock, Play, Pause, ArrowLeft, User, Calendar, Square, Volume2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
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

interface TranscriptLine {
  speaker: 'SARAH' | 'MICHAEL' | null;
  text: string;
}

function parseTranscript(transcript: string): TranscriptLine[] {
  return transcript
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const sarah = line.match(/^\[SARAH\]:\s*(.+)/);
      const michael = line.match(/^\[MICHAEL\]:\s*(.+)/);
      if (sarah) return { speaker: 'SARAH' as const, text: sarah[1].replace(/\[PAUSE\]/g, '').replace(/\*(.*?)\*/g, '$1').trim() };
      if (michael) return { speaker: 'MICHAEL' as const, text: michael[1].replace(/\[PAUSE\]/g, '').replace(/\*(.*?)\*/g, '$1').trim() };
      return { speaker: null, text: line };
    });
}

// Pick the best available voice for a gender preference
function pickVoice(voices: SpeechSynthesisVoice[], prefer: 'female' | 'male'): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const femaleNames = ['samantha', 'victoria', 'karen', 'moira', 'fiona', 'tessa', 'allison', 'susan', 'zira', 'female'];
  const maleNames = ['alex', 'daniel', 'tom', 'fred', 'ralph', 'lee', 'male', 'reed'];

  const keywords = prefer === 'female' ? femaleNames : maleNames;
  const englishVoices = voices.filter(v => v.lang.startsWith('en'));

  for (const kw of keywords) {
    const match = englishVoices.find(v => v.name.toLowerCase().includes(kw));
    if (match) return match;
  }

  // Fallback: just pick any English voice
  return englishVoices[prefer === 'female' ? 0 : Math.min(1, englishVoices.length - 1)] || voices[0];
}

function TranscriptPlayer({ transcript }: { transcript: string }) {
  const lines = parseTranscript(transcript).filter(l => l.speaker !== null && l.text.length > 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported] = useState(() => 'speechSynthesis' in window);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentLineRef = useRef(-1);
  const playingRef = useRef(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [supported]);

  // Scroll active line into view
  useEffect(() => {
    if (currentLine >= 0 && lineRefs.current[currentLine]) {
      lineRefs.current[currentLine]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentLine]);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    playingRef.current = false;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentLine(-1);
    currentLineRef.current = -1;
  }, []);

  const speakFrom = useCallback((startIndex: number) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    cancelledRef.current = false;
    playingRef.current = true;
    setIsPlaying(true);

    const sarahVoice = pickVoice(voices, 'female');
    const michaelVoice = pickVoice(voices, 'male');

    const speakLine = (idx: number) => {
      if (cancelledRef.current || idx >= lines.length) {
        if (!cancelledRef.current) {
          setIsPlaying(false);
          setCurrentLine(-1);
          currentLineRef.current = -1;
          playingRef.current = false;
        }
        return;
      }

      const line = lines[idx];
      if (!line.text) { speakLine(idx + 1); return; }

      currentLineRef.current = idx;
      setCurrentLine(idx);

      const utter = new SpeechSynthesisUtterance(line.text);
      utter.rate = 0.95;
      utter.pitch = line.speaker === 'SARAH' ? 1.1 : 0.9;
      utter.volume = 1;

      if (line.speaker === 'SARAH' && sarahVoice) utter.voice = sarahVoice;
      if (line.speaker === 'MICHAEL' && michaelVoice) utter.voice = michaelVoice;

      utter.onend = () => {
        if (!cancelledRef.current) speakLine(idx + 1);
      };
      utter.onerror = () => {
        if (!cancelledRef.current) speakLine(idx + 1);
      };

      window.speechSynthesis.speak(utter);
    };

    speakLine(startIndex);
  }, [supported, voices, lines]);

  const togglePlay = () => {
    if (!supported) return;
    if (isPlaying) {
      cancelledRef.current = true;
      playingRef.current = false;
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const resumeFrom = currentLine >= 0 ? currentLine : 0;
      speakFrom(resumeFrom);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const progress = currentLine >= 0 ? Math.round(((currentLine + 1) / lines.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Player controls */}
      <Card data-testid="card-audio-player">
        <CardContent className="p-6">
          {!supported ? (
            <p className="text-sm text-muted-foreground text-center">
              Your browser doesn't support audio playback. Read the transcript below.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button size="icon" onClick={togglePlay} data-testid="button-play-pause">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={stop} disabled={!isPlaying && currentLine < 0} data-testid="button-stop">
                  <Square className="w-4 h-4" />
                </Button>
                <div className="flex-1 flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground min-w-[60px] text-right">
                    {currentLine >= 0 ? `${currentLine + 1} / ${lines.length}` : `${lines.length} lines`}
                  </span>
                </div>
              </div>
              {isPlaying && currentLine >= 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Now reading: <span className={`font-semibold ${lines[currentLine]?.speaker === 'SARAH' ? 'text-primary' : 'text-blue-500'}`}>
                    {lines[currentLine]?.speaker === 'SARAH' ? 'Sarah' : 'Michael'}
                  </span>
                </p>
              )}
              {!isPlaying && currentLine < 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Press play to listen — Sarah &amp; Michael will read this episode aloud
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcript with highlighted active line */}
      <Card>
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
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {lines.map((line, i) => {
              const isActive = i === currentLine;
              if (line.speaker === 'SARAH') {
                return (
                  <div
                    key={i}
                    ref={el => { lineRefs.current[i] = el; }}
                    className={`flex gap-3 items-start rounded-md p-2 transition-colors ${isActive ? 'bg-primary/10' : ''}`}
                    onClick={() => speakFrom(i)}
                    style={{ cursor: supported ? 'pointer' : 'default' }}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isActive ? 'bg-primary' : 'bg-primary/20'}`}>
                      <span className={`text-xs font-bold ${isActive ? 'text-primary-foreground' : 'text-primary'}`}>S</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Sarah</span>
                      <p className={`text-sm leading-relaxed ${isActive ? 'text-foreground font-medium' : 'text-foreground'}`}>{line.text}</p>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  ref={el => { lineRefs.current[i] = el; }}
                  className={`flex gap-3 items-start rounded-md p-2 transition-colors ${isActive ? 'bg-blue-500/10' : ''}`}
                  onClick={() => speakFrom(i)}
                  style={{ cursor: supported ? 'pointer' : 'default' }}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isActive ? 'bg-blue-500' : 'bg-blue-100 dark:bg-blue-900'}`}>
                    <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-300'}`}>M</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide block mb-1">Michael</span>
                    <p className={`text-sm leading-relaxed ${isActive ? 'text-foreground font-medium' : 'text-foreground'}`}>{line.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PodcastDetailPage() {
  const params = useParams<{ slug: string }>();

  const { data: podcast, isLoading, error } = useQuery<Podcast>({
    queryKey: ['/api/podcasts', params.slug],
    enabled: !!params.slug,
  });

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

  const audioSrc = podcast.audioUrl || null;

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
          { name: podcast.title, url: `/podcasts/${podcast.slug}` }
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
            author: {
              "@type": "Organization",
              name: "Private InHome CareGiver",
              url: "https://privateinhomecaregiver.com"
            },
            publisher: {
              "@type": "Organization",
              name: "Private InHome CareGiver",
              url: "https://privateinhomecaregiver.com",
              logo: "https://privateinhomecaregiver.com/logo.png"
            },
            partOfSeries: {
              "@type": "PodcastSeries",
              name: "Private InHome CareGiver Care Podcast",
              url: "https://privateinhomecaregiver.com/podcasts"
            },
            inLanguage: "en-US"
          }
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

            {/* Real audio file player if available */}
            {audioSrc && (
              <Card className="mb-8" data-testid="card-audio-file-player">
                <CardContent className="p-6">
                  <audio controls src={audioSrc} className="w-full" />
                </CardContent>
              </Card>
            )}

            {/* Embed player (Spotify, Apple, etc.) */}
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

            {/* Browser speech synthesis player + transcript */}
            {!audioSrc && !podcast.embedUrl && podcast.transcript && (
              <div className="mb-8">
                <TranscriptPlayer transcript={podcast.transcript} />
              </div>
            )}

            {/* Nothing at all */}
            {!audioSrc && !podcast.embedUrl && !podcast.transcript && (
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
