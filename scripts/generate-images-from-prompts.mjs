import OpenAI from 'openai';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONCURRENCY = 3;
const OUTPUT_DIR = path.join(__dirname, '..', 'attached_assets');
const PROMPTS_FILE = '/tmp/final_prompts.json';
const PROGRESS_FILE = '/tmp/image_gen_progress.json';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 55);
}

function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  } catch {
    return { done: [], failed: [] };
  }
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function generateOne(entry, progress) {
  const { id, title, prompt } = entry;
  const slug = slugify(title);
  const ts = Date.now();
  const filename = `${slug}_${ts}.jpg`;
  const filePath = path.join(OUTPUT_DIR, filename);

  try {
    const resp = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
    });
    const b64 = resp.data[0]?.b64_json ?? '';
    if (!b64) throw new Error('no image data returned');

    fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
    const newUrl = `/attached_assets/${filename}`;
    await pool.query('UPDATE articles SET hero_image_url = $1 WHERE id = $2', [newUrl, id]);

    progress.done.push(id);
    saveProgress(progress);
    return { id, url: newUrl, ok: true };
  } catch (err) {
    console.error(`  FAIL [${title.slice(0, 50)}]: ${err.message?.slice(0, 100)}`);
    progress.failed.push({ id, error: err.message?.slice(0, 100) });
    saveProgress(progress);
    return { id, ok: false };
  }
}

async function runBatch(entries, progress) {
  const results = [];
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const chunk = entries.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(chunk.map(e => generateOne(e, progress)));
    results.push(...chunkResults);
    const done = results.filter(r => r.ok).length;
    const pct = Math.round(((progress.done.length) / entries.length) * 100);
    const ok = chunkResults.filter(r => r.ok).map(r => r.id.slice(0,8)).join(', ');
    console.log(`  [${i + chunk.length}/${entries.length}] done=${progress.done.length} (${pct}%) ✓ ${ok}`);
  }
  return results;
}

async function main() {
  if (!fs.existsSync(PROMPTS_FILE)) {
    console.error('ERROR: Prompts file not found at', PROMPTS_FILE);
    process.exit(1);
  }

  const allPrompts = JSON.parse(fs.readFileSync(PROMPTS_FILE, 'utf8'));
  const progress = loadProgress();

  const doneSet = new Set(progress.done);
  const todo = allPrompts.filter(e => !doneSet.has(e.id) && e.prompt);

  console.log(`\n=== Article Image Generation ===`);
  console.log(`Total prompts: ${allPrompts.length}`);
  console.log(`Already done : ${progress.done.length}`);
  console.log(`To generate  : ${todo.length}`);
  console.log(`Concurrency  : ${CONCURRENCY}`);
  console.log('================================\n');

  if (todo.length === 0) {
    console.log('All images already generated!');
    await pool.end();
    return;
  }

  const startTime = Date.now();
  await runBatch(todo, progress);
  const elapsed = Math.round((Date.now() - startTime) / 1000);

  console.log(`\n=== Complete ===`);
  console.log(`Generated : ${progress.done.length} images`);
  console.log(`Failed    : ${progress.failed.length}`);
  console.log(`Time      : ${elapsed}s`);

  if (progress.failed.length > 0) {
    console.log('\nFailed articles:');
    progress.failed.forEach(f => console.log(`  - ${f.id}: ${f.error}`));
  }

  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
