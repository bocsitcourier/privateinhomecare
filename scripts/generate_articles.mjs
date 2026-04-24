import { execSync } from 'child_process';
import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const manifest = JSON.parse(fs.readFileSync('/home/runner/workspace/scripts/restore_manifest.json', 'utf8'));

const BATCH_SIZE = 5;
const results = [];

async function generateBatch(articles) {
  const articleList = articles.map((a, i) => 
    `${i+1}. Title: "${a.title}" | slug: "${a.slug}" | City: ${a.city} | Topic: ${a.topic} | Category: ${a.category}`
  ).join('\n\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    temperature: 0.7,
    max_tokens: 16000,
    response_format: { type: 'json_object' },
    messages: [{
      role: 'system',
      content: `You are a professional content writer for PrivateInHomeCareGiver, a Massachusetts in-home care agency serving Greater Boston and all of MA. Write warm, authoritative, SEO-optimized articles about in-home care. Always reference Massachusetts, specific MA cities when relevant, and practical real-life care scenarios. Use proper HTML for the body (p, h2, h3, ul, li tags only - no divs). Always end with a call to action to call (617) 686-0595 or visit privateinhomecaregiverma.com. Return valid JSON only.`
    }, {
      role: 'user',
      content: `Generate complete article content for these ${articles.length} articles. Return a JSON object with key "articles" containing an array of objects with these exact keys:
- slug (string, exact slug provided)
- excerpt (string, 150-200 chars, compelling summary)
- metaTitle (string, max 60 chars, include "Massachusetts" or city name)
- metaDescription (string, 150-160 chars, natural language)
- keywords (array of 8-10 strings, specific MA-focused keywords)
- bodyHtml (string, 1800-2200 words of clean HTML with h2 sections, p tags, ul/li lists, practical advice, MA-specific details)

Articles to generate:
${articleList}`
    }]
  });

  const data = JSON.parse(response.choices[0].message.content);
  return data.articles || data;
}

// Process in batches
const batches = [];
for (let i = 0; i < manifest.length; i += BATCH_SIZE) {
  batches.push(manifest.slice(i, i + BATCH_SIZE));
}

console.log(`Processing ${batches.length} batches of up to ${BATCH_SIZE} articles each...`);

for (let i = 0; i < batches.length; i++) {
  console.log(`\nBatch ${i+1}/${batches.length}: generating ${batches[i].length} articles...`);
  try {
    const batchResults = await generateBatch(batches[i]);
    results.push(...batchResults);
    console.log(`  ✓ Generated ${batchResults.length} articles`);
    // Brief pause between batches
    if (i < batches.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (err) {
    console.error(`  ✗ Batch ${i+1} failed:`, err.message);
    process.exit(1);
  }
}

// Merge manifest data with generated content
const finalArticles = manifest.map(m => {
  const generated = results.find(r => r.slug === m.slug);
  if (!generated) {
    console.error(`WARNING: No generated content for slug: ${m.slug}`);
    return null;
  }
  return {
    title: m.title,
    slug: m.slug,
    excerpt: generated.excerpt,
    body: generated.bodyHtml,
    hero_image_url: `/attached_assets/${m.imageFile}`,
    meta_title: generated.metaTitle,
    meta_description: generated.metaDescription,
    keywords: JSON.stringify(generated.keywords || []),
    category: m.category,
    status: 'published',
    published_at: new Date().toISOString(),
  };
}).filter(Boolean);

fs.writeFileSync('/tmp/generated_articles.json', JSON.stringify(finalArticles, null, 2));
console.log(`\n✓ Done! ${finalArticles.length} articles saved to /tmp/generated_articles.json`);
