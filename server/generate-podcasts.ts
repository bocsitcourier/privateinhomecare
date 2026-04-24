import { storage } from './storage';
import OpenAI from 'openai';
import { log } from './vite';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import path from 'path';

const AUDIO_DIR = path.join(process.cwd(), 'attached_assets', 'podcasts');

const SCRIPT_SYSTEM = `You are Sarah, the warm and knowledgeable host of "Care Conversations", a podcast by Private InHome CareGiver — Massachusetts's trusted private-pay in-home senior care agency.

Generate a 15-MINUTE SOLO PODCAST SCRIPT (~2,200-2,400 words) based on the article content provided.

FORMAT — every line must start with [SARAH]:
[SARAH]: [spoken words]

STRUCTURE (15 minutes total at ~150 words/min):
1. INTRO (1 min, ~150 words): Warm greeting, introduce yourself as Sarah from Care Conversations by Private InHome CareGiver, hook the listener with the topic
2. WHY IT MATTERS (2 min, ~300 words): Why this topic is urgent for Massachusetts families right now, Spring 2026 context
3. MAIN SECTION A (3 min, ~450 words): First major theme from the article — practical, specific, relatable
4. MAIN SECTION B (3 min, ~450 words): Second major theme — go deeper, use examples a worried family member would understand
5. MAIN SECTION C (2.5 min, ~375 words): Third theme — tips, tools, or resources specific to Massachusetts
6. PRACTICAL TAKEAWAYS (2 min, ~300 words): Three concrete action steps families can take this week
7. OUTRO/CTA (1.5 min, ~225 words): Recap the key message, invite listeners to call (617) 686-0595 or visit privateinhomecaregiverma.com, warm sign-off as Sarah

VOICE STYLE RULES:
- Conversational and warm — like a trusted expert friend
- Always use contractions (it's, you're, we're, don't)
- No bullet points — all natural flowing speech
- Use [PAUSE] for natural breath moments between thoughts
- Use *word* to indicate vocal emphasis
- Reference Massachusetts, specific cities, and local context
- Include real-sounding examples ("I spoke with a family in Newton last month who...")
- Final line MUST be: "Until next time, take care of yourself and those you love. I'm Sarah, from Care Conversations by Private InHome CareGiver."

OUTPUT ONLY THE SCRIPT — no preamble, no section headers, just [SARAH]: lines.`;

const META_SYSTEM = `Generate podcast episode metadata. Return ONLY valid JSON with exactly these keys:
- description: compelling 200-300 character episode description for the podcast listing page
- metaTitle: max 60 chars, include city/topic and "Private InHome CareGiver Podcast"  
- metaDescription: 150-160 chars for search results
- topics: array of 5 topic strings covered in this episode
- learningObjectives: array of 3 strings — what listeners will learn`;

const CONCURRENCY = 5;

export async function generatePodcasts(): Promise<void> {
  mkdirSync(AUDIO_DIR, { recursive: true });

  // Get all published articles
  const articles = await storage.listArticles();
  const published = articles.filter((a: any) => a.status === 'published');

  if (published.length === 0) {
    log('[PodcastGen] No published articles found, skipping.');
    return;
  }

  // Get existing podcast slugs
  const existingPodcasts = await storage.listPodcasts();
  const existingSlugs = new Set(existingPodcasts.map((p: any) => p.slug));

  // Find articles that don't have a matching podcast yet
  const missing = published.filter((a: any) => !existingSlugs.has(a.slug));

  if (missing.length === 0) {
    log('[PodcastGen] All articles already have podcasts. Nothing to generate.');
    return;
  }

  log(`[PodcastGen] ${missing.length} podcasts to generate (${existingSlugs.size} already exist) — running ${CONCURRENCY} parallel workers.`);

  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  let success = 0;
  let failed = 0;
  let completed = 0;
  const total = missing.length;

  // Split into round-robin queues
  const queues: any[][] = Array.from({ length: CONCURRENCY }, () => []);
  missing.forEach((art: any, i: number) => queues[i % CONCURRENCY].push(art));

  async function generateOnePodcast(article: any, workerId: number): Promise<void> {
    let done = false;

    // Build a concise article summary for the prompt (keep prompt manageable)
    const bodyText = (article.body || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 6000);

    for (let attempt = 1; attempt <= 3 && !done; attempt++) {
      try {
        const [scriptResult, metaResult] = await Promise.allSettled([
          openai.chat.completions.create({
            model: 'gpt-5-mini',
            max_completion_tokens: 6000,
            messages: [
              { role: 'system', content: SCRIPT_SYSTEM },
              {
                role: 'user',
                content: `Create the podcast script for this article:

ARTICLE TITLE: "${article.title}"
CITY/REGION: ${article.category || 'Massachusetts'}
ARTICLE CONTENT:
${bodyText}

Remember: ~2,200-2,400 words total, all [SARAH]: lines, 15-minute episode for Private InHome CareGiver's "Care Conversations" podcast.`
              }
            ]
          }),
          openai.chat.completions.create({
            model: 'gpt-5-mini',
            max_completion_tokens: 600,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: META_SYSTEM },
              {
                role: 'user',
                content: `Generate podcast metadata for:
Title: "${article.title}"
Category: ${article.category}
Topics: ${article.keywords?.slice(0, 5).join(', ') || 'Massachusetts senior care'}`
              }
            ]
          }),
        ]);

        if (scriptResult.status === 'rejected') {
          throw new Error(`Script generation failed: ${scriptResult.reason?.message}`);
        }

        const scriptText = (scriptResult.value.choices[0].message.content || '').trim();
        if (!scriptText || scriptText.length < 500) {
          throw new Error(`Script too short (${scriptText.length} chars)`);
        }

        let meta: any = {};
        if (metaResult.status === 'fulfilled') {
          try { meta = JSON.parse(metaResult.value.choices[0].message.content || '{}'); } catch { meta = {}; }
        }

        // Word count estimate
        const wordCount = scriptText.split(/\s+/).length;
        const durationSeconds = Math.round((wordCount / 150) * 60);

        // Use the article's hero image as the podcast thumbnail
        const thumbnailUrl = article.heroImageUrl || null;

        // Generate episode number (sequential from existing + position)
        const episodeNumber = existingSlugs.size + success + 1;

        const description = meta.description ||
          `Episode ${episodeNumber} of Care Conversations by Private InHome CareGiver. ${article.excerpt?.substring(0, 200) || ''}`;

        await storage.createPodcast({
          title: article.title,
          slug: article.slug,
          description,
          category: mapCategory(article.category),
          audioType: 'upload' as any,
          audioUrl: null,
          thumbnailUrl,
          episodeNumber,
          seasonNumber: 1,
          duration: durationSeconds,
          showNotes: article.excerpt || '',
          transcript: scriptText,
          hostName: 'Sarah',
          topics: Array.isArray(meta.topics) ? meta.topics : (article.keywords?.slice(0, 5) || []),
          targetAudience: 'Massachusetts families caring for aging parents, spouses, or loved ones',
          learningObjectives: Array.isArray(meta.learningObjectives) ? meta.learningObjectives : [],
          metaTitle: (meta.metaTitle || article.metaTitle || article.title).substring(0, 60),
          metaDescription: meta.metaDescription || description.substring(0, 160),
          keywords: article.keywords || [],
          status: 'published',
          publishedAt: new Date(),
          sortOrder: episodeNumber,
        });

        completed++;
        success++;
        done = true;
        const mins = Math.round(durationSeconds / 60);
        log(`[PG-W${workerId}] ✓ [${completed}/${total}] Ep.${episodeNumber} "${article.slug}" ~${mins}min (${wordCount}w)`);

      } catch (err: any) {
        const msg = err.message?.substring(0, 100) || 'unknown';
        log(`[PG-W${workerId}] Attempt ${attempt} failed for ${article.slug}: ${msg}`);
        if (attempt < 3) await new Promise(r => setTimeout(r, attempt === 1 ? 10000 : 20000));
      }
    }

    if (!done) {
      log(`[PG-W${workerId}] PERMANENT FAIL: ${article.slug}`);
      failed++;
      completed++;
    }
  }

  async function worker(workerId: number, queue: any[]): Promise<void> {
    log(`[PG-W${workerId}] Starting — ${queue.length} podcasts assigned`);
    for (const article of queue) {
      await generateOnePodcast(article, workerId);
      await new Promise(r => setTimeout(r, 500));
    }
    log(`[PG-W${workerId}] Done`);
  }

  await Promise.all(queues.map((queue, i) => worker(i + 1, queue)));

  log(`[PodcastGen] ===== COMPLETE ===== Created: ${success} | Failed: ${failed}`);
  log(`[PodcastGen] Total podcasts in DB: ${(await storage.listPodcasts()).length}`);
}

function mapCategory(articleCategory: string): any {
  const map: Record<string, string> = {
    'nurse-concierge': 'massachusetts-care',
    'seasonal': 'tips-and-advice',
    'family-caregiver': 'family-conversations',
    'location': 'massachusetts-care',
    'health-condition': 'health-topics',
    'caregiver': 'caregiver-stories',
  };
  return map[articleCategory] || 'tips-and-advice';
}

// Generate audio for a single podcast episode using OpenAI TTS
export async function generatePodcastAudio(slug: string): Promise<Buffer | null> {
  try {
    const podcast = await storage.getPodcastBySlug(slug);
    if (!podcast?.transcript) return null;

    const audioPath = path.join(AUDIO_DIR, `${slug}.mp3`);
    if (existsSync(audioPath)) {
      const { readFileSync } = await import('fs');
      return readFileSync(audioPath);
    }

    const openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });

    // Clean transcript — remove stage directions, keep only speech
    const cleanScript = podcast.transcript
      .replace(/\[SARAH\]:\s*/g, '')
      .replace(/\[PAUSE\]/g, '...')
      .replace(/\*(.*?)\*/g, '$1')
      .trim();

    // Split into chunks of ~4000 chars at sentence boundaries
    const chunks: string[] = [];
    let remaining = cleanScript;
    while (remaining.length > 0) {
      if (remaining.length <= 4000) {
        chunks.push(remaining);
        break;
      }
      let splitAt = remaining.lastIndexOf('.', 4000);
      if (splitAt < 2000) splitAt = remaining.lastIndexOf('?', 4000);
      if (splitAt < 2000) splitAt = remaining.lastIndexOf('!', 4000);
      if (splitAt < 2000) splitAt = 4000;
      chunks.push(remaining.substring(0, splitAt + 1).trim());
      remaining = remaining.substring(splitAt + 1).trim();
    }

    log(`[PodcastTTS] Generating audio for ${slug} (${chunks.length} chunks, voice: nova)`);

    const audioChunks: Buffer[] = [];
    for (const chunk of chunks) {
      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: chunk,
        response_format: 'mp3',
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      audioChunks.push(buffer);
    }

    const combined = Buffer.concat(audioChunks);
    writeFileSync(audioPath, combined);

    // Update the podcast record with the audio URL
    await storage.updatePodcast(podcast.id, {
      audioUrl: `/attached_assets/podcasts/${slug}.mp3`,
      duration: Math.round(cleanScript.split(/\s+/).length / 2.5), // ~150wpm → seconds
    });

    log(`[PodcastTTS] Audio saved: ${slug}.mp3 (${(combined.length / 1024 / 1024).toFixed(1)}MB)`);
    return combined;
  } catch (err: any) {
    log(`[PodcastTTS] Error generating audio for ${slug}: ${err.message}`);
    return null;
  }
}
