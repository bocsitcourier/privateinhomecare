import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const manifest = JSON.parse(fs.readFileSync('/home/runner/workspace/scripts/restore_manifest.json', 'utf8'));
const INDEX = parseInt(process.argv[2] || '0');
const art = manifest[INDEX];
if (!art) { console.error('No article at index', INDEX); process.exit(1); }

console.log(`Generating [${INDEX}]: ${art.title}`);

const SYSTEM = `You are a professional SEO content writer for PrivateInHomeCareGiver, a Massachusetts in-home care agency. Write in warm, authoritative, trustworthy tone. Always mention Massachusetts, real phone (617) 686-0595, and website privateinhomecaregiverma.com.

STRICT REQUIREMENTS:
- MINIMUM 2500 words of body HTML
- Start body with a strong H2 (not H1)
- Include 6-8 H2 sections, each with 3-4 paragraphs and H3 subsections
- Embed 8-12 hyperlinked long-phrase keywords naturally in text using these internal links:
  <a href="/personal-care/massachusetts">personal care services in Massachusetts</a>
  <a href="/non-medical-caregiver/massachusetts">non-medical caregiver services in Greater Boston</a>
  <a href="/live-in-care/massachusetts">live-in caregiver support in Massachusetts</a>
  <a href="/dementia-care/massachusetts">specialized dementia care in Massachusetts</a>
  <a href="/respite-care/massachusetts">respite care for family caregivers in Massachusetts</a>
  <a href="/companion-care/massachusetts">companion care services for Massachusetts seniors</a>
  <a href="/services">comprehensive in-home care services</a>
  <a href="/find-caregivers">find a trusted private caregiver near you</a>
  <a href="/contact">schedule a free in-home consultation</a>
  <a href="/errand-running/massachusetts">errand running and shopping assistance</a>
  <a href="/homemaking/massachusetts">homemaking and light housekeeping services</a>
- Include a CTA paragraph before FAQ: "Ready to get started? Call us at (617) 686-0595..."
- End with full FAQ section: <h2>Frequently Asked Questions</h2> with 7 Q&As using <h3> for each question, <p> for answers (min 2 sentences each)
- Final element: <div class="article-hashtags"><p>10 hashtags as hyperlinks</p></div> with hashtags like:
  <a href="/services">#InHomeCareMassachusetts</a> <a href="/personal-care/massachusetts">#SeniorCareBoston</a> etc.`;

const response = await openai.chat.completions.create({
  model: 'gpt-5-mini',
  max_completion_tokens: 8000,
  response_format: { type: 'json_object' },
  messages: [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Generate complete article content for:

Title: "${art.title}"
Slug: ${art.slug}
City focus: ${art.city}
Key topics: ${art.topic}
Category: ${art.category}

Return JSON with exactly these keys:
- slug: "${art.slug}"
- excerpt: string 155-200 chars
- metaTitle: string max 60 chars with city/MA
- metaDescription: string 150-160 chars
- keywords: array of exactly 10 MA-focused keyword phrases
- bodyHtml: string with the FULL 2500+ word article HTML (H2 sections, long-phrase hyperlinks, FAQ, hashtag div)`
    }
  ]
});

const result = JSON.parse(response.choices[0].message.content);
result.slug = art.slug; // ensure correct slug
result.imageFile = art.imageFile;
result.title = art.title;
result.category = art.category;

// Check quality
const wc = (result.bodyHtml || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
const links = (result.bodyHtml || '').match(/href=/g)?.length || 0;
const hasFAQ = (result.bodyHtml || '').includes('Frequently Asked');
const hasTags = (result.bodyHtml || '').includes('article-hashtags');
console.log(`  Words: ${wc} | Links: ${links} | FAQ: ${hasFAQ} | Hashtags: ${hasTags}`);

// Save to individual file
fs.writeFileSync(`/tmp/article_${INDEX}.json`, JSON.stringify(result, null, 2));
console.log(`  Saved to /tmp/article_${INDEX}.json`);
