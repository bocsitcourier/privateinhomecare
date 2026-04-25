import OpenAI from 'openai';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const CONCURRENCY = 3;
const OUTPUT_DIR = path.join(process.cwd(), 'attached_assets');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function buildPrompt(title: string, category: string): string {
  const base = `Professional, warm, realistic photo for a Massachusetts in-home senior care article titled "${title}". `;

  const lc = (title + ' ' + category).toLowerCase();
  let scene = '';

  if (lc.includes('dementia') || lc.includes('alzheimer') || lc.includes('memory')) {
    scene = 'A compassionate caregiver sitting beside an elderly person with dementia in a bright, cozy home living room, gently holding their hand. Soft natural light.';
  } else if (lc.includes('hospice') || lc.includes('end-of-life') || lc.includes('grief') || lc.includes('palliative')) {
    scene = 'A caring nurse or family member sitting peacefully beside an elderly patient in a comfortable home bedroom. Warm, gentle lighting conveying compassion and dignity.';
  } else if (lc.includes('nutrition') || lc.includes('eating') || lc.includes('meal') || lc.includes('diet')) {
    scene = 'A friendly caregiver helping a smiling elderly person enjoy a healthy meal at a kitchen table. Bright, welcoming home kitchen.';
  } else if (lc.includes('exercise') || lc.includes('mobility') || lc.includes('physical therapy') || lc.includes('fall prevention') || lc.includes('balance')) {
    scene = 'A caregiver gently assisting a senior with light exercise or walking in a sunny home hallway. Encouraging, professional interaction.';
  } else if (lc.includes('bathing') || lc.includes('grooming') || lc.includes('personal care') || lc.includes('hygiene')) {
    scene = 'A professional home caregiver providing dignified personal care assistance to an elderly person. Clean, calm bathroom or bedroom setting.';
  } else if (lc.includes('medication') || lc.includes('health screening') || lc.includes('blood pressure') || lc.includes('chronic') || lc.includes('medical')) {
    scene = 'A caring home health aide helping an elderly person manage medications at a kitchen table. Professional, reassuring atmosphere in a Massachusetts home.';
  } else if (lc.includes('transport') || lc.includes('driving') || lc.includes('errand')) {
    scene = 'A caregiver helping an elderly woman get into a clean car for a medical appointment. Bright day, suburban Massachusetts neighborhood.';
  } else if (lc.includes('companionship') || lc.includes('loneliness') || lc.includes('social') || lc.includes('engagement') || lc.includes('activities')) {
    scene = 'A warm moment between an elderly person and their caregiver playing cards or doing a puzzle together in a cozy home living room.';
  } else if (lc.includes('home modification') || lc.includes('aging in place') || lc.includes('safety') || lc.includes('checklist')) {
    scene = 'A professional caregiver and elderly homeowner reviewing safety modifications in a well-lit Massachusetts home. Grab bars, clear pathways visible.';
  } else if (lc.includes('respite') || lc.includes('family caregiver') || lc.includes('burnout')) {
    scene = 'A relieved family caregiver handing off care to a professional home caregiver in a welcoming home entryway. Warm, reassuring atmosphere.';
  } else if (lc.includes('live-in') || lc.includes('24-hour') || lc.includes('overnight')) {
    scene = 'A professional live-in caregiver helping an elderly person get comfortable in their home. Warm evening lighting, dignified home setting.';
  } else if (lc.includes('parkinson') || lc.includes('ms') || lc.includes('multiple sclerosis') || lc.includes('stroke')) {
    scene = 'A skilled caregiver providing gentle, specialized assistance to a senior with a neurological condition in a comfortable Massachusetts home. Professional, compassionate.';
  } else if (lc.includes('cancer') || lc.includes('recovery') || lc.includes('post-hospital') || lc.includes('discharge')) {
    scene = 'A professional caregiver supporting an elderly person recovering at home after a hospital stay. Comfortable home bedroom, caring interaction.';
  } else if (lc.includes('pet') || lc.includes('dog') || lc.includes('animal therapy')) {
    scene = 'A joyful elderly person with a gentle dog on their lap, with a caregiver smiling nearby in a cozy home living room.';
  } else if (lc.includes('music') || lc.includes('brain') || lc.includes('cognitive') || lc.includes('mental')) {
    scene = 'An elderly person happily listening to music or doing a brain activity while a caregiver encourages them in a bright home setting.';
  } else if (lc.includes('hire') || lc.includes('agency') || lc.includes('choose') || lc.includes('find') || lc.includes('vetting')) {
    scene = 'A family meeting with a professional in-home caregiver in a welcoming Massachusetts home. Warm, trustworthy first meeting atmosphere.';
  } else if (lc.includes('conversation') || lc.includes('talking') || lc.includes('communicat')) {
    scene = 'An adult child having a caring, supportive conversation with their elderly parent and a caregiver in a warm home living room.';
  } else if (lc.includes('financial') || lc.includes('cost') || lc.includes('medicaid') || lc.includes('medicare') || lc.includes('pay')) {
    scene = 'A caring caregiver and family member reviewing care plan documents at a kitchen table in a Massachusetts home. Professional, supportive atmosphere.';
  } else if (lc.includes('hospital') || lc.includes('discharge') || lc.includes('transition')) {
    scene = 'A professional caregiver helping an elderly person settle comfortably at home after a hospital stay. Safe, welcoming home environment.';
  } else if (lc.includes('advance care') || lc.includes('planning') || lc.includes('directive')) {
    scene = 'An elderly person thoughtfully discussing advance care plans with a caring professional in a comfortable Massachusetts home.';
  } else {
    scene = 'A professional, compassionate in-home caregiver providing attentive care to a senior in a warm, well-lit Massachusetts home. Dignified, reassuring atmosphere.';
  }

  return base + scene + ' High quality, no text overlay, photorealistic, genuine warmth.';
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

async function generateAndSave(article: { id: number; title: string; category: string; heroImageUrl: string }): Promise<string | null> {
  const prompt = buildPrompt(article.title, article.category || '');
  const slug = slugify(article.title);
  const ts = Date.now();
  const filename = `${slug}_${ts}.jpg`;
  const filePath = path.join(OUTPUT_DIR, filename);

  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
    });

    const base64 = response.data[0]?.b64_json ?? '';
    if (!base64) throw new Error('No image data returned');

    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    const newUrl = `/attached_assets/${filename}`;
    console.log(`  ✓ ${article.title.slice(0, 50)} → ${newUrl}`);
    return newUrl;
  } catch (err: any) {
    console.error(`  ✗ ${article.title.slice(0, 50)}: ${err.message}`);
    return null;
  }
}

async function runBatch(items: any[], concurrency: number): Promise<Map<number, string>> {
  const results = new Map<number, string>();
  let i = 0;

  while (i < items.length) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (article) => {
        const newUrl = await generateAndSave(article);
        return { id: article.id, newUrl };
      })
    );
    for (const { id, newUrl } of batchResults) {
      if (newUrl) results.set(id, newUrl);
    }
    i += concurrency;
    console.log(`Progress: ${Math.min(i, items.length)}/${items.length}`);
    if (i < items.length) await new Promise(r => setTimeout(r, 500));
  }

  return results;
}

async function main() {
  const { rows } = await pool.query<{ id: number; title: string; category: string; hero_image_url: string }>(
    `SELECT id, title, COALESCE(category, '') as category, hero_image_url
     FROM articles
     WHERE hero_image_url LIKE '%/stock_images/%'
     ORDER BY title`
  );

  console.log(`Found ${rows.length} articles with stock images. Generating AI images...`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');

  const articles = rows.map(r => ({ id: r.id, title: r.title, category: r.category, heroImageUrl: r.hero_image_url }));
  const results = await runBatch(articles, CONCURRENCY);

  console.log(`\nUpdating database (${results.size} images)...`);

  const updateResults: { id: number; old_url: string; new_url: string }[] = [];
  for (const [id, newUrl] of results) {
    const article = articles.find(a => a.id === id)!;
    await pool.query('UPDATE articles SET hero_image_url = $1 WHERE id = $2', [newUrl, id]);
    updateResults.push({ id, old_url: article.heroImageUrl, new_url: newUrl });
  }

  const logPath = '/tmp/image_regen_results.json';
  fs.writeFileSync(logPath, JSON.stringify(updateResults, null, 2));
  console.log(`\nDone! ${results.size}/${rows.length} images generated.`);
  console.log(`Results saved to ${logPath}`);
  console.log(`\nNext: push images to production and update prod DB.`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
