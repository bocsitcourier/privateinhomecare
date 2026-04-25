import OpenAI from 'openai';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONCURRENCY = 2;
const OUTPUT_DIR = path.join(__dirname, '..', 'attached_assets');

const sliceIndex = parseInt(process.argv[2] ?? '0', 10);
const SLICE_FILE = `/tmp/slice_${sliceIndex}.json`;
const PROGRESS_FILE = `/tmp/slice_progress_${sliceIndex}.json`;
const LOG_FILE = `/tmp/slice_log_${sliceIndex}.txt`;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 55);
}

function log(msg) {
  const line = `[${new Date().toISOString().slice(11,19)}] ${msg}\n`;
  process.stdout.write(line);
  fs.appendFileSync(LOG_FILE, line);
}

function loadProgress() {
  try { return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')); }
  catch { return { done: [], failed: [] }; }
}

function saveProgress(p) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

async function generateOne(entry, progress) {
  const { id, title, prompt } = entry;
  const slug = slugify(title);
  const ts = Date.now();
  const filename = `${slug}_${ts}.jpg`;
  const filePath = path.join(OUTPUT_DIR, filename);
  try {
    const resp = await openai.images.generate({ model: 'gpt-image-1', prompt, size: '1024x1024' });
    const b64 = resp.data[0]?.b64_json ?? '';
    if (!b64) throw new Error('no image data');
    fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
    const newUrl = `/attached_assets/${filename}`;
    await pool.query('UPDATE articles SET hero_image_url = $1 WHERE id = $2', [newUrl, id]);
    progress.done.push(id);
    saveProgress(progress);
    log(`✓ [${progress.done.length}] ${title.slice(0, 55)}`);
    return true;
  } catch (err) {
    log(`✗ ${title.slice(0, 45)}: ${err.message?.slice(0, 80)}`);
    progress.failed.push({ id, error: err.message?.slice(0, 80) });
    saveProgress(progress);
    return false;
  }
}

async function main() {
  const articles = JSON.parse(fs.readFileSync(SLICE_FILE, 'utf8'));
  const progress = loadProgress();
  const doneSet = new Set(progress.done.map(d => typeof d === 'string' ? d : d.id));
  const todo = articles.filter(e => !doneSet.has(e.id) && e.prompt);

  log(`=== Slice ${sliceIndex}: ${todo.length}/${articles.length} remaining ===`);

  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const chunk = todo.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(e => generateOne(e, progress)));
  }

  log(`=== Slice ${sliceIndex} complete: ${progress.done.length} done, ${progress.failed.length} failed ===`);
  await pool.end();
}

main().catch(err => { log(`FATAL: ${err.message}`); process.exit(1); });
