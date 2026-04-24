import fs from "fs";
import path from "path";

const CACHE_DIR = "attached_assets/podcasts";
const SAMPLE_RATE = 24000;
const CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

const SARAH_VOICE = "Kore";
const MICHAEL_VOICE = "Charon";

interface SpeakerLine {
  speaker: "Sarah" | "Michael";
  text: string;
}

type JobStatus = "pending" | "generating" | "ready" | "error";
interface Job {
  status: JobStatus;
  error?: string;
  startedAt: number;
}

// In-memory job tracker: slug → job state
const jobs = new Map<string, Job>();

export function getJobStatus(slug: string): Job | null {
  return jobs.get(slug) || null;
}

export function isAudioCached(slug: string): boolean {
  const cacheFile = path.join(CACHE_DIR, `${slug}.wav`);
  return fs.existsSync(cacheFile);
}

function parseTranscript(transcript: string): SpeakerLine[] {
  return transcript
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const sarah = line.match(/^\[SARAH\]:\s*(.+)/);
      const michael = line.match(/^\[MICHAEL\]:\s*(.+)/);
      if (sarah) {
        const text = sarah[1]
          .replace(/\[PAUSE\]/g, " ")
          .replace(/\*(.*?)\*/g, "$1")
          .trim();
        return text ? [{ speaker: "Sarah" as const, text }] : [];
      }
      if (michael) {
        const text = michael[1]
          .replace(/\[PAUSE\]/g, " ")
          .replace(/\*(.*?)\*/g, "$1")
          .trim();
        return text ? [{ speaker: "Michael" as const, text }] : [];
      }
      return [];
    });
}

function pcmToWav(pcmBuffer: Buffer): Buffer {
  const dataLength = pcmBuffer.length;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(CHANNELS, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE((SAMPLE_RATE * CHANNELS * BITS_PER_SAMPLE) / 8, 28);
  header.writeUInt16LE((CHANNELS * BITS_PER_SAMPLE) / 8, 32);
  header.writeUInt16LE(BITS_PER_SAMPLE, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);
  return Buffer.concat([header, pcmBuffer]);
}

async function callGeminiChunk(lines: SpeakerLine[]): Promise<Buffer> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const text = lines.map((l) => `${l.speaker}: ${l.text}`).join("\n");

  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: "Sarah",
              voiceConfig: { prebuiltVoiceConfig: { voiceName: SARAH_VOICE } },
            },
            {
              speaker: "Michael",
              voiceConfig: { prebuiltVoiceConfig: { voiceName: MICHAEL_VOICE } },
            },
          ],
        },
      },
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini TTS ${resp.status}: ${errText.substring(0, 300)}`);
  }

  interface GeminiTTSResponse {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { data?: string };
        }>;
      };
    }>;
  }
  const json: GeminiTTSResponse = await resp.json();
  const b64 = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) throw new Error("No audio data returned from Gemini TTS");

  return Buffer.from(b64, "base64");
}

async function runGeneration(slug: string, transcript: string): Promise<void> {
  jobs.set(slug, { status: "generating", startedAt: Date.now() });
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  try {
    const lines = parseTranscript(transcript);
    if (lines.length === 0) throw new Error("No speaker lines found in transcript");

    // Chunk into groups of 20 lines (each ~25s of API time)
    const CHUNK_SIZE = 20;
    const chunks: SpeakerLine[][] = [];
    for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
      chunks.push(lines.slice(i, i + CHUNK_SIZE));
    }

    const pcmParts: Buffer[] = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`[GeminiTTS] ${slug} — chunk ${i + 1}/${chunks.length} (${chunks[i].length} lines)`);
      const pcm = await callGeminiChunk(chunks[i]);
      pcmParts.push(pcm);
    }

    const wavBuffer = pcmToWav(Buffer.concat(pcmParts));
    const cacheFile = path.join(CACHE_DIR, `${slug}.wav`);
    fs.writeFileSync(cacheFile, wavBuffer);

    jobs.set(slug, { status: "ready", startedAt: jobs.get(slug)!.startedAt });
    console.log(`[GeminiTTS] ${slug} — done, ${wavBuffer.length} bytes`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[GeminiTTS] ${slug} — error:`, msg);
    jobs.set(slug, { status: "error", error: msg, startedAt: jobs.get(slug)!.startedAt });
  }
}

/**
 * Start background audio generation. Returns immediately.
 * Returns false if already generating or cached.
 */
export function startAudioGeneration(slug: string, transcript: string): boolean {
  if (isAudioCached(slug)) return false;
  const existing = jobs.get(slug);
  if (existing && (existing.status === "pending" || existing.status === "generating")) return false;
  // Fire and forget
  runGeneration(slug, transcript);
  return true;
}

/**
 * Awaitable audio generation — resolves when the WAV file is written (or throws on error).
 * Returns false if already cached, true if newly generated.
 */
export async function generateAndCacheAudio(slug: string, transcript: string): Promise<boolean> {
  if (isAudioCached(slug)) return false;
  const existing = jobs.get(slug);
  if (existing && (existing.status === "pending" || existing.status === "generating")) return false;
  await runGeneration(slug, transcript);
  const job = jobs.get(slug);
  if (job?.status === "error") throw new Error(job.error || "Unknown TTS error");
  return true;
}

/**
 * Get cached audio buffer (only if already generated).
 */
export function getCachedAudio(slug: string): Buffer | null {
  const cacheFile = path.join(CACHE_DIR, `${slug}.wav`);
  if (!fs.existsSync(cacheFile)) return null;
  return fs.readFileSync(cacheFile);
}
