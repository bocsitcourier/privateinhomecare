import { storage } from "./storage";
import { isAudioCached, generateAndCacheAudio } from "./tts-gemini";
import { log } from "./vite";

const CONCURRENCY = 3;
const RETRY_DELAY_MS = 15000;
const MAX_RETRIES = 2;

export async function preGenerateAllPodcastAudio(): Promise<void> {
  let podcasts: any[];
  try {
    podcasts = await storage.listPodcasts();
  } catch (err: any) {
    log(`[AudioGen] Failed to load podcasts: ${err.message}`);
    return;
  }

  const total = podcasts.length;

  // Podcasts with no transcript at all — nothing to synthesise
  const noTranscript = podcasts.filter((p) => !p.transcript || !p.transcript.trim());

  // Podcasts that already have a cached .wav file
  const alreadyCached = podcasts.filter(
    (p) => p.transcript && p.transcript.trim() && isAudioCached(p.slug)
  );

  // Episodes that need to be generated
  const needsAudio = podcasts.filter(
    (p) => p.transcript && p.transcript.trim() && !isAudioCached(p.slug)
  );

  log(
    `[AudioGen] Total:${total} | Cached:${alreadyCached.length} | No-transcript:${noTranscript.length} | To generate:${needsAudio.length}`
  );

  if (needsAudio.length === 0) {
    log("[AudioGen] All eligible podcast episodes already have audio cached.");
    return;
  }

  log(`[AudioGen] Starting ${CONCURRENCY} workers...`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let completed = 0;
  const eligibleCount = needsAudio.length;

  const queues: any[][] = Array.from({ length: CONCURRENCY }, () => []);
  needsAudio.forEach((p: any, i: number) => queues[i % CONCURRENCY].push(p));

  async function processOne(podcast: any, workerId: number): Promise<void> {
    const { slug, transcript } = podcast;

    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
      try {
        const wasGenerated = await generateAndCacheAudio(slug, transcript);
        completed++;
        if (wasGenerated) {
          generated++;
          log(`[AudioGen-W${workerId}] ✓ [${completed}/${eligibleCount}] ${slug}`);
        } else {
          // Race: another process cached it between our check and now
          skipped++;
          log(`[AudioGen-W${workerId}] skip/race [${completed}/${eligibleCount}] ${slug}`);
        }
        return;
      } catch (err: any) {
        const msg = (err?.message || String(err)).substring(0, 120);
        log(`[AudioGen-W${workerId}] Attempt ${attempt} failed for ${slug}: ${msg}`);
        if (attempt <= MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
        }
      }
    }

    log(`[AudioGen-W${workerId}] PERMANENT FAIL: ${slug}`);
    failed++;
    completed++;
  }

  async function worker(workerId: number, queue: any[]): Promise<void> {
    log(`[AudioGen-W${workerId}] Starting — ${queue.length} episodes assigned`);
    for (const podcast of queue) {
      await processOne(podcast, workerId);
      // Small pause between episodes to reduce burst pressure on the Gemini API
      await new Promise((r) => setTimeout(r, 500));
    }
    log(`[AudioGen-W${workerId}] Done`);
  }

  await Promise.all(queues.map((queue, i) => worker(i + 1, queue)));

  const nowCached = alreadyCached.length + generated + skipped;
  log(
    `[AudioGen] ===== COMPLETE ===== Generated:${generated} Skipped/race:${skipped} Failed:${failed} | Total cached:${nowCached}/${total}`
  );
}
