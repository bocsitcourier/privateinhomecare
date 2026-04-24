import { storage } from './storage';
import OpenAI from 'openai';
import { log } from './vite';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';
import path from 'path';

const AUDIO_DIR = path.join(process.cwd(), 'attached_assets', 'podcasts');

// ─── PROMPT ──────────────────────────────────────────────────────────────────

const SCRIPT_SYSTEM = `You are writing a 15-MINUTE PODCAST SCRIPT for "Care Conversations" — a podcast by Private InHome CareGiver, Massachusetts's trusted private-pay in-home senior care agency.

HOSTS:
- SARAH: warm, empathetic, personal — the emotional anchor. She shares relatable family stories and draws out practical advice. Female voice.
- MICHAEL: analytical, reassuring, solution-focused — the knowledgeable guide. He provides expert context and actionable steps. Male voice.

OUTPUT FORMAT — every single line MUST start with either [SARAH]: or [MICHAEL]:
[SARAH]: spoken words here
[MICHAEL]: spoken words here

NO section headers, NO stage directions, NO narration — ONLY the two speakers.

TARGET: ~2,200–2,400 words total | ~15 minutes at 150 words/minute
SPEAKER BALANCE: Sarah ~50%, Michael ~50% — no monologues longer than 4 lines

EPISODE STRUCTURE:
1. COLD OPEN (45s, ~112 words): Sarah opens with a surprising or emotional hook about the topic. Michael responds, building anticipation.
2. INTRO (90s, ~225 words): Both introduce themselves and the episode topic. Explain why Massachusetts families should care right now.
3. SEGMENT A (3 min, ~450 words): First major theme — conversational deep dive. Sarah asks "why?" questions; Michael explains. Use real-sounding examples ("A family in Newton...").
4. SEGMENT B (3 min, ~450 words): Second major theme. Switch dynamic — Michael raises a concern, Sarah shares an emotional angle.
5. SEGMENT C (3 min, ~450 words): Practical tips and Massachusetts-specific resources. Both contribute equally.
6. LISTENER Q&A (2 min, ~300 words): Sarah reads a "listener question" (realistic, not fake-sounding). Michael answers. Sarah adds nuance.
7. OUTRO / CTA (1.5 min, ~225 words): Both recap 3 key takeaways. Sarah invites listeners to call (617) 686-0595 or visit privateinhomecaregiverma.com. Michael signs off warmly.

VOICE STYLE:
- Conversational — like two friends who are also experts
- Contractions always: it's, you're, we're, they've, don't
- *asterisks* for emphasis — e.g., *really* important
- [PAUSE] for natural breath moments
- Transitions: "Exactly.", "Right.", "And here's the thing—", "Which brings us to..."
- End MUST be Sarah saying: "Until next time — take care of yourself and those you love. I'm Sarah." and Michael: "And I'm Michael. From Care Conversations by Private InHome CareGiver."`;

const META_SYSTEM = `Generate podcast episode metadata. Return ONLY valid JSON with these exact keys:
- description: compelling 200-250 character episode description
- metaTitle: max 60 chars, SEO-optimized with topic and "Private InHome CareGiver Podcast"
- metaDescription: 150-160 chars for search results
- topics: array of 5 topic strings covered
- learningObjectives: array of 3 strings — what listeners will learn`;

const CONCURRENCY = 5;

// ─── MAIN GENERATOR ──────────────────────────────────────────────────────────

export async function generatePodcasts(): Promise<void> {
  mkdirSync(AUDIO_DIR, { recursive: true });

  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

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
  const missing = published.filter((a: any) => !existingSlugs.has(a.slug));

  if (missing.length === 0) {
    log('[PodcastGen] All articles already have podcasts.');
    return;
  }

  log(`[PodcastGen] ${missing.length} podcasts to generate (${existingSlugs.size} exist) — ${CONCURRENCY} workers.`);

  // Atomic episode number allocator — pre-computed before workers start, no race condition
  let nextEpisode = Math.max(0, ...existingPodcasts.map((p: any) => p.episodeNumber ?? 0)) + 1;
  const allocEpisode = () => nextEpisode++;

  let success = 0;
  let failed = 0;
  let completed = 0;
  const total = missing.length;

  // Split into round-robin queues for parallel workers
  const queues: any[][] = Array.from({ length: CONCURRENCY }, () => []);
  missing.forEach((art: any, i: number) => queues[i % CONCURRENCY].push(art));

  async function generateOne(article: any, workerId: number): Promise<void> {
    let done = false;

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
                content: `Write the 15-minute duo podcast episode for this article:

TITLE: "${article.title}"
REGION: ${article.category || 'Massachusetts'}
ARTICLE CONTENT:
${bodyText}

Remember: ~2,200-2,400 words total, alternating [SARAH]: and [MICHAEL]: lines only, for "Care Conversations" by Private InHome CareGiver.`
              }
            ]
          }),
          openai.chat.completions.create({
            model: 'gpt-5-mini',
            max_completion_tokens: 500,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: META_SYSTEM },
              {
                role: 'user',
                content: `Podcast: "${article.title}" | Category: ${article.category} | Tags: ${article.keywords?.slice(0, 5).join(', ') || 'senior care Massachusetts'}`
              }
            ]
          }),
        ]);

        if (scriptResult.status === 'rejected') throw new Error(`Script: ${scriptResult.reason?.message}`);

        const scriptText = (scriptResult.value.choices[0].message.content || '').trim();
        if (scriptText.length < 500) throw new Error(`Script too short (${scriptText.length} chars)`);

        // Validate it has both speakers
        const hasSarah = scriptText.includes('[SARAH]:');
        const hasMichael = scriptText.includes('[MICHAEL]:');
        if (!hasSarah || !hasMichael) throw new Error('Missing speakers in script');

        let meta: any = {};
        if (metaResult.status === 'fulfilled') {
          try { meta = JSON.parse(metaResult.value.choices[0].message.content || '{}'); } catch { meta = {}; }
        }

        const wordCount = scriptText.split(/\s+/).length;
        const durationSeconds = Math.round((wordCount / 150) * 60);
        const episodeNumber = allocEpisode(); // pre-computed atomic counter — no race across workers

        const description = meta.description ||
          `Ep. ${episodeNumber} — Sarah and Michael discuss ${article.title}. ${article.excerpt?.substring(0, 150) || ''}`;

        // Safely parse arrays — article fields may be JSON strings from the DB
        const safeArray = (val: any): string[] => {
          if (!val) return [];
          if (Array.isArray(val)) return val.filter(Boolean).map(String);
          if (typeof val === 'string') {
            try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : []; }
            catch { return []; }
          }
          return [];
        };

        const keywords = safeArray(article.keywords);
        const topics = Array.isArray(meta.topics) ? meta.topics.filter(Boolean).map(String) : keywords.slice(0, 5);
        const learningObjectives = Array.isArray(meta.learningObjectives) ? meta.learningObjectives.filter(Boolean).map(String) : [];

        // Debug: confirm keywords is a real string[] (not JSON-stringified) before DB insert
        log(`[PG-W${workerId}] keywords type=${typeof keywords} isArray=${Array.isArray(keywords)} len=${keywords.length}`);

        await storage.createPodcast({
          title: article.title,
          slug: article.slug,
          description,
          category: mapCategory(article.category),
          audioType: 'upload' as any,
          audioUrl: null,
          thumbnailUrl: article.heroImageUrl || null,
          episodeNumber,
          seasonNumber: 1,
          duration: durationSeconds,
          showNotes: buildShowNotes(article),
          transcript: scriptText,
          hostName: 'Sarah & Michael',
          topics,
          targetAudience: 'Massachusetts families caring for aging parents, spouses, or loved ones',
          learningObjectives,
          metaTitle: (meta.metaTitle || article.title).substring(0, 60),
          metaDescription: (meta.metaDescription || description).substring(0, 160),
          keywords,
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
        log(`[PG-W${workerId}] Attempt ${attempt} failed for ${article.slug}: ${err.message?.substring(0, 80)}`);
        if (attempt < 3) await new Promise(r => setTimeout(r, attempt === 1 ? 12000 : 25000));
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
      await generateOne(article, workerId);
      await new Promise(r => setTimeout(r, 400));
    }
    log(`[PG-W${workerId}] Done`);
  }

  await Promise.all(queues.map((queue, i) => worker(i + 1, queue)));

  log(`[PodcastGen] ===== COMPLETE ===== Created:${success} Failed:${failed} Total:${(await storage.listPodcasts()).length}`);
}

// ─── ON-DEMAND DUAL-VOICE TTS ─────────────────────────────────────────────────

// Parses script into [(speaker, text)] pairs
function parseScript(transcript: string): Array<{ speaker: 'SARAH' | 'MICHAEL'; text: string }> {
  const lines = transcript.split('\n').map(l => l.trim()).filter(Boolean);
  const result: Array<{ speaker: 'SARAH' | 'MICHAEL'; text: string }> = [];

  for (const line of lines) {
    const sarahMatch = line.match(/^\[SARAH\]:\s*(.+)/);
    const michaelMatch = line.match(/^\[MICHAEL\]:\s*(.+)/);
    if (sarahMatch) result.push({ speaker: 'SARAH', text: cleanText(sarahMatch[1]) });
    else if (michaelMatch) result.push({ speaker: 'MICHAEL', text: cleanText(michaelMatch[1]) });
  }

  return result;
}

function cleanText(text: string): string {
  return text
    .replace(/\[PAUSE\]/g, '...')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/[*_]/g, '')
    .trim();
}

// Split long text into chunks ≤ 4000 chars at sentence boundaries
function chunkText(text: string, maxLen = 4000): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) { chunks.push(remaining); break; }
    let cut = remaining.lastIndexOf('.', maxLen);
    if (cut < maxLen * 0.5) cut = remaining.lastIndexOf('?', maxLen);
    if (cut < maxLen * 0.5) cut = remaining.lastIndexOf('!', maxLen);
    if (cut < maxLen * 0.5) cut = maxLen;
    chunks.push(remaining.substring(0, cut + 1).trim());
    remaining = remaining.substring(cut + 1).trim();
  }
  return chunks;
}

export async function generatePodcastAudio(slug: string): Promise<Buffer | null> {
  try {
    const audioPath = path.join(AUDIO_DIR, `${slug}.mp3`);
    if (existsSync(audioPath)) return readFileSync(audioPath);

    const podcast = await storage.getPodcastBySlug(slug);
    if (!podcast?.transcript) return null;

    const openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });

    // OpenAI TTS voices: nova = warm female, onyx = deep male
    const VOICES = { SARAH: 'nova' as const, MICHAEL: 'onyx' as const };

    const lines = parseScript(podcast.transcript);
    if (lines.length === 0) return null;

    log(`[PodcastTTS] Generating dual-voice audio for ${slug} (${lines.length} lines, nova/onyx)`);

    const audioChunks: Buffer[] = [];

    for (const line of lines) {
      const textChunks = chunkText(line.text, 4000);
      for (const chunk of textChunks) {
        if (!chunk.trim()) continue;
        const response = await openai.audio.speech.create({
          model: 'tts-1',
          voice: VOICES[line.speaker],
          input: chunk,
          response_format: 'mp3',
        });
        audioChunks.push(Buffer.from(await response.arrayBuffer()));
      }

      // Short silence (~300ms) between speakers — 128kbps MP3 silence frame
      // Raw silence bytes for MP3 at 128kbps: approximately 6KB for 300ms
      const silenceFrames = Buffer.alloc(4800, 0);
      audioChunks.push(silenceFrames);
    }

    const combined = Buffer.concat(audioChunks);
    mkdirSync(AUDIO_DIR, { recursive: true });
    writeFileSync(audioPath, combined);

    // Update DB with the cached audio URL
    const cleanWordCount = podcast.transcript.split(/\s+/).length;
    await storage.updatePodcast(podcast.id, {
      audioUrl: `/attached_assets/podcasts/${slug}.mp3`,
      duration: Math.round((cleanWordCount / 150) * 60),
    });

    log(`[PodcastTTS] Done: ${slug}.mp3 (${(combined.length / 1024 / 1024).toFixed(1)}MB)`);
    return combined;

  } catch (err: any) {
    log(`[PodcastTTS] Error for ${slug}: ${err.message}`);
    return null;
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function buildShowNotes(article: any): string {
  const excerpt = article.excerpt || '';
  return `In this episode of Care Conversations, hosts Sarah and Michael explore: ${article.title}.

${excerpt}

📞 Contact Private InHome CareGiver: (617) 686-0595
🌐 Website: privateinhomecaregiverma.com
📧 Free Consultation: privateinhomecaregiverma.com/contact

Topics covered: ${(article.keywords || []).slice(0, 6).join(', ')}`;
}

function mapCategory(articleCategory: string): any {
  const map: Record<string, string> = {
    'Premium Care Services': 'massachusetts-care',
    'Alzheimer\'s & Dementia': 'health-topics',
    'Health & Wellness': 'health-topics',
    'Caregiver Support': 'caregiver-stories',
    'Family Caregiver Resources': 'family-conversations',
    'Senior Wellness': 'health-topics',
    'Safety': 'tips-and-advice',
    'Hospice & Palliative Care': 'health-topics',
    'Massachusetts Locations': 'massachusetts-care',
    'Legal Planning': 'tips-and-advice',
    'Care Guides': 'tips-and-advice',
  };
  return map[articleCategory] || 'tips-and-advice';
}
