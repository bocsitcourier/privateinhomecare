import { readFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import OpenAI from 'openai';
import { storage } from './storage';
import { log } from './vite';

const NEW_MANIFEST_PATH = path.join(process.cwd(), 'scripts/new_articles_manifest.json');
const IMAGES_DIR = path.join(process.cwd(), 'attached_assets', 'ai_generated');
const STOCK_DIR = path.join(process.cwd(), 'attached_assets', 'stock_images');

// Category-to-image keyword mapping for smarter fallback image selection
const CATEGORY_IMAGE_KEYWORDS: Record<string, string[]> = {
  'Premium Care Services': ['nurse', 'caregiver_helping', 'elderly_care_caregiv'],
  'Alzheimer\'s & Dementia': ['dementia', 'alzheimer', 'memory'],
  'Health & Wellness': ['chronic_disease', 'diabetes', 'senior_wellness', 'elderly_care'],
  'Caregiver Support': ['family_caregiver', 'elderly_family', 'elderly_grandmother'],
  'Family Caregiver Resources': ['family_caregiver', 'elderly_family', 'elderly_grandmother'],
  'Senior Wellness': ['senior_wellness', 'elderly_couple', 'elderly_person_eatin', 'elderly_drinking'],
  'Safety': ['elderly_man_with_wal', 'elderly_couple_walki', 'fall_prevention'],
  'Hospice & Palliative Care': ['hospice', 'elderly_care_caregiv', 'caregiver_helping'],
  'Massachusetts Locations': ['boston_massachusetts', 'elderly_care_caregiv', 'caregiver_helping', 'elderly_couple'],
  'Legal Planning': ['family_caregiver', 'elderly_family'],
  'Care Guides': ['caregiver_helping', 'elderly_care_caregiv'],
  'default': ['elderly_care_caregiv', 'caregiver_helping_el', 'family_caregiver'],
};

// Build a pool of all available stock images, grouped by keyword prefix
let _stockImagePool: string[] | null = null;
function getStockImages(): string[] {
  if (_stockImagePool) return _stockImagePool;
  try {
    const files = readdirSync(STOCK_DIR);
    _stockImagePool = files
      .filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
      .map(f => `/attached_assets/stock_images/${f}`);
  } catch {
    _stockImagePool = ['/attached_assets/stock_images/caregiver_helping_el_833f51cf.jpg'];
  }
  return _stockImagePool;
}

function pickFallbackImage(category: string, index: number): string {
  const allImages = getStockImages();
  const keywords = CATEGORY_IMAGE_KEYWORDS[category] || CATEGORY_IMAGE_KEYWORDS['default'];

  // Find images that match the category keywords
  const matching = allImages.filter(img =>
    keywords.some(kw => img.toLowerCase().includes(kw.toLowerCase()))
  );

  const pool = matching.length > 0 ? matching : allImages;
  return pool[index % pool.length];
}

interface NewManifestItem {
  title: string;
  slug: string;
  imagePrompt: string;
  category: string;
  city: string;
  topic: string;
}

const BODY_SYSTEM = `You are a professional SEO content writer for PrivateInHomeCareGiver, a Massachusetts in-home care and nurse concierge agency. Today's date is Spring 2026.

Output ONLY raw HTML body content. NO JSON. NO markdown backticks. Just the HTML.

CRITICAL REQUIREMENTS:
- Write with warmth and empathy, as if speaking directly to a worried spouse, sibling, or adult child of a senior
- Make content practical, actionable, and emotionally resonant
- Weave in Spring 2026 seasonal context where relevant (spring activities, allergies, outdoor safety, Mother's Day, Memorial Day)
- Reference specific Massachusetts geography, county resources, nearby towns
- Minimum 2,500 words in the final output

ARTICLE STRUCTURE (follow exactly):
1. Opening paragraph: 5-7 sentences that speak directly to the reader's emotional situation (spouse/sibling/adult child of a senior in the specific city/region). Include the city name.
2. Minimum 6 H2 sections. For EACH H2 section, write:
   - H2 heading that includes the city name in 3 of the 6 headings
   - 3 to 4 paragraphs of 5-7 sentences each (100-150 words per paragraph)
   - At least 2 H3 sub-headings under the H2, each with 2-3 paragraphs of 4-6 sentences each
3. CTA paragraph (use exact template)
4. FAQ section (6 city-specific Q&As)
5. Hashtag section

HYPERLINKS — embed ALL 9 naturally within the text body (at least one per H2 section):
<a href="/personal-care/massachusetts">personal care services in Massachusetts</a>
<a href="/non-medical-caregiver/massachusetts">non-medical caregiver services in Greater Boston</a>
<a href="/live-in-care/massachusetts">live-in caregiver support in Massachusetts</a>
<a href="/dementia-care/massachusetts">specialized dementia care in Massachusetts</a>
<a href="/respite-care/massachusetts">respite care for family caregivers in Massachusetts</a>
<a href="/companion-care/massachusetts">companion care services for Massachusetts seniors</a>
<a href="/services">comprehensive in-home care services</a>
<a href="/find-caregivers">find a trusted private caregiver near you</a>
<a href="/contact">schedule a free in-home consultation</a>

CTA PARAGRAPH — copy exactly before the FAQ:
<p>If you or a loved one needs professional support, <strong>PrivateInHomeCareGiver</strong> is here to help. Call us today at <strong>(617) 686-0595</strong> or visit <a href="/contact">privateinhomecaregiverma.com</a> to <a href="/contact">schedule a free in-home consultation</a>. Our caring team serves families across Massachusetts including Boston, Worcester, Springfield, Cambridge, Lowell, and beyond.</p>

FAQ SECTION FORMAT:
<h2>Frequently Asked Questions</h2>
<h3>[City-specific question 1?]</h3>
<p>[Detailed answer with 3+ sentences referencing the city and Massachusetts.]</p>
[Repeat for 6 questions total — make them specific to the article topic and city]

HASHTAG SECTION — copy exactly as the LAST element:
<div class="article-hashtags"><p><a href="/services">#InHomeCareMassachusetts</a> <a href="/personal-care/massachusetts">#SeniorCareMA</a> <a href="/dementia-care/massachusetts">#DementiaCare</a> <a href="/respite-care/massachusetts">#RespiteCare</a> <a href="/companion-care/massachusetts">#CompanionCare</a> <a href="/find-caregivers">#FindACaregiverMA</a> <a href="/contact">#FreeConsultation</a> <a href="/live-in-care/massachusetts">#LiveInCare</a> <a href="/non-medical-caregiver/massachusetts">#NonMedicalCaregiver</a> <a href="/services">#NurseConciergeMA</a></p></div>`;

const META_SYSTEM = `Generate SEO metadata for a Massachusetts senior care article. Return ONLY valid JSON with exactly these keys:
- excerpt: compelling 155-200 character article summary that mentions the city/region and the main topic
- metaTitle: max 60 characters, natural language, must include city name and "MA"
- metaDescription: 150-160 characters for search results, mention city and main care topic
- keywords: array of exactly 10 Massachusetts-focused keyword strings, each including the city name or a related local term`;

function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = require('fs').createWriteStream(filepath);
    const request = protocol.get(url, (response: any) => {
      if (response.statusCode !== 200) {
        file.close();
        require('fs').unlink(filepath, () => {});
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', (err: Error) => {
        require('fs').unlink(filepath, () => {});
        reject(err);
      });
    });
    request.on('error', (err: Error) => {
      file.close();
      require('fs').unlink(filepath, () => {});
      reject(err);
    });
    request.setTimeout(60000, () => {
      request.destroy();
      reject(new Error('Image download timeout'));
    });
  });
}

export async function generateNewArticles(): Promise<void> {
  if (!existsSync(NEW_MANIFEST_PATH)) {
    log('[NewArticleGen] No new articles manifest found, skipping.');
    return;
  }

  let manifest: NewManifestItem[];
  try {
    manifest = JSON.parse(readFileSync(NEW_MANIFEST_PATH, 'utf8'));
  } catch (e: any) {
    log(`[NewArticleGen] Failed to parse manifest: ${e.message}`);
    return;
  }

  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  mkdirSync(IMAGES_DIR, { recursive: true });

  // Find which articles are missing from DB
  const missing: NewManifestItem[] = [];
  for (const item of manifest) {
    try {
      const existing = await storage.getArticleBySlug(item.slug);
      if (!existing) missing.push(item);
    } catch {
      missing.push(item);
    }
  }

  if (missing.length === 0) {
    log('[NewArticleGen] All new articles already exist in DB. Nothing to generate.');
    return;
  }

  log(`[NewArticleGen] ${missing.length} articles to generate (${manifest.length - missing.length} already exist).`);

  let success = 0;
  let failed = 0;
  let imgFailed = 0;

  for (let i = 0; i < missing.length; i++) {
    const art = missing[i];
    log(`[NewArticleGen] [${i + 1}/${missing.length}] Generating: ${art.slug}`);

    let done = false;

    for (let attempt = 1; attempt <= 3 && !done; attempt++) {
      try {
        // Run content generation and image generation in parallel
        const [bodyResult, metaResult, imgResult] = await Promise.allSettled([
          openai.chat.completions.create({
            model: 'gpt-5-mini',
            max_completion_tokens: 25000,
            messages: [
              { role: 'system', content: BODY_SYSTEM },
              {
                role: 'user',
                content: `Write the full article body HTML for:

Title: "${art.title}"
City/Region: ${art.city}, Massachusetts
Key topics: ${art.topic}
Category: ${art.category}
Current season: Spring 2026 (April/May/June)

IMPORTANT GUIDELINES:
1. Speak warmly and directly to family members (spouses, adult children, siblings) who are worried about a senior loved one in ${art.city}
2. Reference ${art.city}'s location in Massachusetts (county, nearby cities, local resources if known)
3. Include Spring 2026 seasonal context where natural (spring activities, spring safety, Mother's Day planning, Memorial Day, spring allergies)
4. For nurse concierge articles: explain the premium service model, how RNs coordinate care, what families get vs. standard home health
5. Include all 9 required hyperlinks naturally within the body
6. Minimum 6 H2 sections with 3-4 long paragraphs each (100-150 words per paragraph) plus at least 2 H3 sub-sections per H2
7. Make the FAQ section highly specific to ${art.city} and the article topic (6 questions)
8. End with the exact hashtag div provided

Aim for 2,500-3,500 words of valuable, non-repetitive content.`
              }
            ]
          }),
          openai.chat.completions.create({
            model: 'gpt-5-mini',
            max_completion_tokens: 800,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: META_SYSTEM },
              {
                role: 'user',
                content: `Generate SEO metadata for this Massachusetts senior care article:
Title: "${art.title}"
City: ${art.city}
Topics: ${art.topic}
Category: ${art.category}

Requirements:
- metaTitle: must include "${art.city}" and "MA", max 60 chars
- metaDescription: must mention ${art.city} and the care service, 150-160 chars
- keywords: include "${art.city} MA" as one keyword, 10 total keywords`
              }
            ]
          }),
          openai.images.generate({
            model: 'dall-e-3',
            prompt: art.imagePrompt + '. No text, no signs, no words in the image. Professional photography style.',
            size: '1792x1024',
            quality: 'standard',
            n: 1,
          })
        ]);

        // Process body
        if (bodyResult.status === 'rejected') {
          throw new Error(`Body generation failed: ${bodyResult.reason?.message}`);
        }
        const bodyHtml = (bodyResult.value.choices[0].message.content || '').trim();
        if (!bodyHtml || bodyHtml.length < 500) {
          throw new Error(`Body too short (${bodyHtml.length} chars)`);
        }

        // Process metadata
        let meta: any = {};
        if (metaResult.status === 'fulfilled') {
          try {
            meta = JSON.parse(metaResult.value.choices[0].message.content || '{}');
          } catch {
            meta = {};
          }
        }

        // Process image
        let heroImageUrl = pickFallbackImage(art.category, i);
        if (imgResult.status === 'fulfilled') {
          const tempUrl = imgResult.value.data[0]?.url;
          if (tempUrl) {
            try {
              const filename = `${art.slug}.png`;
              const filepath = path.join(IMAGES_DIR, filename);
              await downloadImage(tempUrl, filepath);
              heroImageUrl = `/attached_assets/ai_generated/${filename}`;
              log(`[NewArticleGen]   Image saved: ${filename}`);
            } catch (dlErr: any) {
              log(`[NewArticleGen]   Image download failed (using fallback): ${dlErr.message?.substring(0, 60)}`);
              imgFailed++;
            }
          }
        } else {
          log(`[NewArticleGen]   DALL-E failed (using fallback): ${imgResult.reason?.message?.substring(0, 80)}`);
          imgFailed++;
        }

        // Build metadata fields
        const wordCount = bodyHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter((w: string) => w.length > 0).length;
        const hasFAQ = bodyHtml.includes('Frequently Asked');
        const hasTags = bodyHtml.includes('article-hashtags');
        const hasLinks = bodyHtml.includes('href="/contact"');

        const excerpt = meta.excerpt || `Comprehensive guide to ${art.title} for Massachusetts families. Expert advice on senior care options and resources.`;
        const metaTitle = (meta.metaTitle || art.title).substring(0, 60);
        const metaDescription = meta.metaDescription || excerpt.substring(0, 160);
        const keywords: string[] = Array.isArray(meta.keywords)
          ? meta.keywords.slice(0, 10)
          : [art.city, 'Massachusetts senior care', 'in-home caregiver', 'private caregiver MA', 'elder care Massachusetts'];

        await storage.createArticle({
          title: art.title,
          slug: art.slug,
          excerpt,
          body: bodyHtml,
          heroImageUrl,
          metaTitle,
          metaDescription,
          keywords,
          category: art.category,
          status: 'published',
          publishedAt: new Date(),
        });

        log(`[NewArticleGen]   Created | ${wordCount} words | FAQ:${hasFAQ} | Tags:${hasTags} | Links:${hasLinks} | Image:${heroImageUrl.includes('ai_generated') ? 'DALL-E' : 'fallback'}`);
        success++;
        done = true;
      } catch (err: any) {
        const msg = err.message?.substring(0, 120) || 'unknown error';
        log(`[NewArticleGen]   Attempt ${attempt} failed: ${msg}`);
        if (attempt < 3) {
          const delay = attempt === 1 ? 8000 : 15000;
          log(`[NewArticleGen]   Retrying in ${delay / 1000}s...`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

    if (!done) {
      log(`[NewArticleGen]   PERMANENT FAIL: ${art.slug}`);
      failed++;
    }

    // Brief pause between articles to avoid rate limits
    if (i < missing.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  log(`[NewArticleGen] ===== COMPLETE =====`);
  log(`[NewArticleGen] Created: ${success} | Failed: ${failed} | Fallback images: ${imgFailed}`);
  log(`[NewArticleGen] Total articles in DB now: ${(await storage.listArticles()).length}`);
}
