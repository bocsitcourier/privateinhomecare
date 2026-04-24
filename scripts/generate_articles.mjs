import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const manifest = JSON.parse(fs.readFileSync('/home/runner/workspace/scripts/restore_manifest.json', 'utf8'));

// Internal site link map for hyperlinked long-phrase keywords
const INTERNAL_LINKS = {
  'personal care': '/personal-care/massachusetts',
  'personal care services': '/personal-care/massachusetts',
  'in-home care': '/services',
  'in-home care services': '/services',
  'non-medical caregiver': '/non-medical-caregiver/massachusetts',
  'non-medical home care': '/non-medical-caregiver/massachusetts',
  'live-in care': '/live-in-care/massachusetts',
  'live-in caregiver': '/live-in-care/massachusetts',
  'dementia care': '/dementia-care/massachusetts',
  'Alzheimer\'s care': '/dementia-care/massachusetts',
  'respite care': '/respite-care/massachusetts',
  'companion care': '/companion-care/massachusetts',
  'companionship care': '/companion-care/massachusetts',
  'homemaking services': '/homemaking/massachusetts',
  'errand running': '/errand-running/massachusetts',
  'senior transportation': '/transportation/massachusetts',
  'hospice care': '/hospice-care/massachusetts',
  'caregiver services': '/services',
  'private caregiver': '/find-caregivers',
  'free consultation': '/contact',
  'contact us': '/contact',
};

const SYSTEM_PROMPT = `You are a professional SEO content writer for PrivateInHomeCareGiver, a Massachusetts in-home care agency. 

ARTICLE FORMAT REQUIREMENTS:
1. MINIMUM 2500 words of rich HTML content
2. H1 title at top, then 6-8 H2 sections with 2-3 paragraphs each + H3 subsections
3. HYPERLINKED LONG-PHRASE KEYWORDS: Embed 8-12 anchor links to internal pages within the text using descriptive, multi-word anchor text phrases (e.g., <a href="/personal-care/massachusetts">personal care services in Massachusetts</a>)
4. FAQ SECTION: A full "Frequently Asked Questions" H2 section at the end with 6-8 Q&A pairs using H3 for questions and <p> for answers
5. HASHTAG SECTION: After the FAQ, include a <div class="article-hashtags"> section with 8-12 hyperlinked hashtags that link to relevant internal pages or article categories (e.g., <a href="/services">#InHomeCareMassachusetts</a>)
6. Always reference Massachusetts cities, local resources, real phone (617) 686-0595, and website privateinhomecaregiverma.com
7. Warm, authoritative, trustworthy tone. End FAQ section with CTA to call (617) 686-0595

INTERNAL LINKS TO USE (use descriptive long anchor text):
- /personal-care/massachusetts → "personal care services in Massachusetts"
- /non-medical-caregiver/massachusetts → "non-medical caregiver services in Greater Boston"  
- /live-in-care/massachusetts → "live-in caregiver services in Massachusetts"
- /dementia-care/massachusetts → "specialized dementia care in Massachusetts"
- /respite-care/massachusetts → "respite care for family caregivers"
- /companion-care/massachusetts → "companion care services for Massachusetts seniors"
- /services → "comprehensive in-home care services"
- /find-caregivers → "find a trusted private caregiver"
- /contact → "schedule a free in-home consultation"
- /errand-running/massachusetts → "errand running and transportation services"
- /homemaking/massachusetts → "homemaking and housekeeping services"

Return JSON only with keys: slug, excerpt, metaTitle, metaDescription, keywords, bodyHtml`;

async function generateBatch(articles) {
  const articleList = articles.map((a, i) =>
    `${i+1}. Title: "${a.title}" | slug: "${a.slug}" | City focus: ${a.city} | Key topics: ${a.topic} | Category: ${a.category}`
  ).join('\n\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    max_completion_tokens: 16000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Generate complete article content for these ${articles.length} articles. Return a JSON object with key "articles" (array). Each item must have:
- slug: exact slug as given
- excerpt: 155-200 chars compelling summary  
- metaTitle: max 60 chars including city/MA focus
- metaDescription: 150-160 chars natural language with keyword
- keywords: array of 10 MA-focused keyword strings
- bodyHtml: FULL 2500+ word HTML article with H1, 6-8 H2 sections, H3 subsections, internal hyperlinked long-phrase keywords, FAQ section with 6-8 Q&As, and hashtag div at bottom

Articles:
${articleList}`
      }
    ]
  });

  const data = JSON.parse(response.choices[0].message.content);
  return Array.isArray(data) ? data : (data.articles || [data]);
}

const BATCH_SIZE = 3;
const results = [];
const batches = [];
for (let i = 0; i < manifest.length; i += BATCH_SIZE) {
  batches.push(manifest.slice(i, i + BATCH_SIZE));
}

console.log(`Generating ${manifest.length} articles in ${batches.length} batches of ${BATCH_SIZE}...`);

for (let i = 0; i < batches.length; i++) {
  const batch = batches[i];
  console.log(`\nBatch ${i+1}/${batches.length}: ${batch.map(a => a.title.substring(0, 40)).join(', ')}`);
  
  let attempts = 0;
  while (attempts < 3) {
    try {
      const batchResults = await generateBatch(batch);
      results.push(...batchResults);
      console.log(`  ✓ ${batchResults.length} articles generated`);
      break;
    } catch (err) {
      attempts++;
      console.error(`  Attempt ${attempts} failed: ${err.message}`);
      if (attempts < 3) await new Promise(r => setTimeout(r, 3000));
      else { console.error('  GIVING UP on batch'); process.exit(1); }
    }
  }
  
  if (i < batches.length - 1) await new Promise(r => setTimeout(r, 1500));
}

// Merge with manifest
const finalArticles = manifest.map(m => {
  const gen = results.find(r => r.slug === m.slug);
  if (!gen) {
    console.warn(`WARNING: No content generated for: ${m.slug}`);
    return null;
  }
  return {
    title: m.title,
    slug: m.slug,
    excerpt: gen.excerpt || '',
    body: gen.bodyHtml || gen.body || '',
    hero_image_url: `/attached_assets/${m.imageFile}`,
    meta_title: gen.metaTitle || m.title.substring(0, 60),
    meta_description: gen.metaDescription || gen.excerpt || '',
    keywords: JSON.stringify(gen.keywords || []),
    category: m.category,
    status: 'published',
    published_at: new Date().toISOString(),
  };
}).filter(Boolean);

fs.writeFileSync('/tmp/generated_articles.json', JSON.stringify(finalArticles, null, 2));
console.log(`\n✓ Complete! ${finalArticles.length}/${manifest.length} articles saved to /tmp/generated_articles.json`);

// Word count check
for (const a of finalArticles) {
  const wordCount = a.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
  const hasFAQ = a.body.includes('Frequently Asked Questions') || a.body.includes('FAQ');
  const hasHashtags = a.body.includes('article-hashtags') || a.body.includes('#');
  const hasLinks = (a.body.match(/href=/g) || []).length;
  console.log(`${a.slug.substring(0,45).padEnd(46)} | ${String(wordCount).padStart(5)} words | FAQ:${hasFAQ?'✓':'✗'} | Tags:${hasHashtags?'✓':'✗'} | Links:${hasLinks}`);
}
