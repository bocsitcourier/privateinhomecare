import { readFileSync, existsSync } from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { storage } from './storage';
import { log } from './vite';

const MANIFEST_PATH = path.join(process.cwd(), 'scripts/restore_manifest.json');

interface ManifestItem {
  title: string;
  slug: string;
  imageFile: string;
  category: string;
  city: string;
  topic: string;
}

const BODY_SYSTEM = `You are a professional SEO content writer for PrivateInHomeCareGiver, a Massachusetts in-home care agency.

Output ONLY raw HTML body content. NO JSON. NO markdown backticks. Just the HTML.

ARTICLE STRUCTURE (follow exactly):
1. Opening paragraph: 5-7 sentences introducing the topic and its importance for Massachusetts families
2. Minimum 6 H2 sections. For EACH H2 section, write:
   - H2 heading
   - 3 to 4 paragraphs of 5-7 sentences each (100-150 words per paragraph)
   - At least 2 H3 sub-headings under the H2, each with 2-3 paragraphs of 4-6 sentences each
3. CTA paragraph before FAQ
4. FAQ section
5. Hashtag section

HYPERLINKS (embed EXACTLY these 9 hyperlinks naturally within the text - at least one per H2 section):
<a href="/personal-care/massachusetts">personal care services in Massachusetts</a>
<a href="/non-medical-caregiver/massachusetts">non-medical caregiver services in Greater Boston</a>
<a href="/live-in-care/massachusetts">live-in caregiver support in Massachusetts</a>
<a href="/dementia-care/massachusetts">specialized dementia care in Massachusetts</a>
<a href="/respite-care/massachusetts">respite care for family caregivers in Massachusetts</a>
<a href="/companion-care/massachusetts">companion care services for Massachusetts seniors</a>
<a href="/services">comprehensive in-home care services</a>
<a href="/find-caregivers">find a trusted private caregiver near you</a>
<a href="/contact">schedule a free in-home consultation</a>

CTA PARAGRAPH (write exactly this before the FAQ section):
<p>If you or a loved one needs professional support, <strong>PrivateInHomeCareGiver</strong> is here to help. Call us today at <strong>(617) 686-0595</strong> or visit <a href="/contact">privateinhomecaregiverma.com</a> to <a href="/contact">schedule a free in-home consultation</a>. Our caring team serves families across Massachusetts including Boston, Worcester, Springfield, Cambridge, Lowell, and beyond.</p>

FAQ SECTION FORMAT:
<h2>Frequently Asked Questions</h2>
<h3>Question one?</h3>
<p>Detailed answer with at least 3 sentences. Include specific Massachusetts context.</p>
[repeat for 6 questions]

HASHTAG SECTION (copy exactly as the LAST element):
<div class="article-hashtags"><p><a href="/services">#InHomeCareMassachusetts</a> <a href="/personal-care/massachusetts">#SeniorCareBoston</a> <a href="/dementia-care/massachusetts">#DementiaCare</a> <a href="/respite-care/massachusetts">#RespiteCare</a> <a href="/companion-care/massachusetts">#CompanionCare</a> <a href="/homemaking/massachusetts">#HomemakingServices</a> <a href="/find-caregivers">#FindACaregiverMA</a> <a href="/contact">#FreeConsultation</a> <a href="/live-in-care/massachusetts">#LiveInCare</a> <a href="/non-medical-caregiver/massachusetts">#NonMedicalCaregiver</a></p></div>`;

const META_SYSTEM = `Generate SEO metadata. Return ONLY valid JSON with these keys:
- excerpt: compelling 155-200 character article summary
- metaTitle: max 60 chars including city/MA, natural language
- metaDescription: 150-160 chars for search results
- keywords: array of exactly 10 MA-focused keyword strings`;

export async function generateMissingArticles(): Promise<void> {
  if (!existsSync(MANIFEST_PATH)) {
    log('[ArticleGen] No manifest found, skipping.');
    return;
  }

  const manifest: ManifestItem[] = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  // Find missing articles
  const missing: ManifestItem[] = [];
  for (const item of manifest) {
    const existing = await storage.getArticleBySlug(item.slug);
    if (!existing) {
      missing.push(item);
    }
  }

  if (missing.length === 0) {
    log('[ArticleGen] All manifest articles already exist in DB.');
    return;
  }

  log(`[ArticleGen] Generating ${missing.length} missing articles...`);
  let success = 0, failed = 0;

  for (let i = 0; i < missing.length; i++) {
    const art = missing[i];
    log(`[ArticleGen] [${i + 1}/${missing.length}] ${art.slug}`);

    let done = false;
    for (let attempt = 1; attempt <= 3 && !done; attempt++) {
      try {
        // Generate body and metadata in parallel using gpt-5-mini for long-form content
        const [bodyResp, metaResp] = await Promise.all([
          openai.chat.completions.create({
            model: 'gpt-5-mini',
            max_completion_tokens: 25000,
            messages: [
              { role: 'system', content: BODY_SYSTEM },
              {
                role: 'user',
                content: `Write the full article body HTML for:
Title: "${art.title}"
City focus: ${art.city}
Key topics: ${art.topic}
Category: ${art.category}

Remember: minimum 6 H2 sections with 3-4 long paragraphs (100-150 words each) plus H3 subsections. Include all 9 hyperlinks, CTA, FAQ (6 Q&As), and hashtag div.`
              }
            ]
          }),
          openai.chat.completions.create({
            model: 'gpt-5-mini',
            max_completion_tokens: 5000,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: META_SYSTEM },
              {
                role: 'user',
                content: `Generate SEO metadata for: "${art.title}" about ${art.topic} in ${art.city}, Massachusetts.`
              }
            ]
          })
        ]);

        const bodyHtml = (bodyResp.choices[0].message.content || '').trim();
        if (!bodyHtml || bodyHtml.length < 500) {
          throw new Error(`Body too short: ${bodyHtml.length} chars (finish: ${bodyResp.choices[0].finish_reason})`);
        }

        const meta = JSON.parse(metaResp.choices[0].message.content || '{}');
        const wc = bodyHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter((w: string) => w.length > 0).length;
        const links = (bodyHtml.match(/href=/g) || []).length;
        const hasFAQ = bodyHtml.includes('Frequently Asked');
        const hasTags = bodyHtml.includes('article-hashtags');

        await storage.createArticle({
          title: art.title,
          slug: art.slug,
          excerpt: meta.excerpt || '',
          body: bodyHtml,
          heroImageUrl: `/attached_assets/${art.imageFile}`,
          metaTitle: (meta.metaTitle || art.title).substring(0, 60),
          metaDescription: meta.metaDescription || meta.excerpt || '',
          keywords: meta.keywords || [],
          category: art.category,
          status: 'published',
          publishedAt: new Date(),
        });

        log(`[ArticleGen]   ✓ created | ${wc} words | ${links} links | FAQ:${hasFAQ} | Tags:${hasTags}`);
        success++;
        done = true;
      } catch (err: any) {
        log(`[ArticleGen]   ✗ attempt ${attempt}: ${err.message?.substring(0, 100)}`);
        if (attempt < 3) await new Promise(r => setTimeout(r, 5000));
      }
    }

    if (!done) {
      log(`[ArticleGen]   FAILED: ${art.slug}`);
      failed++;
    }
  }

  log(`[ArticleGen] === Complete: ${success} created, ${failed} failed out of ${missing.length} missing ===`);
}
