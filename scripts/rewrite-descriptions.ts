import { db } from "../server/db";
import { facilities } from "../shared/schema";
import { sql, eq, or, isNull } from "drizzle-orm";
import { writeFileSync } from "node:fs";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const RESULT_FILE = process.env.RESULT_FILE || "/tmp/fix_t104_result.json";
const PROGRESS_FILE = process.env.PROGRESS_FILE || "/tmp/fix_t104_progress.json";

type Facility = {
  id: string;
  name: string;
  facilityType: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  county: string | null;
  phone: string | null;
  website: string | null;
  totalBeds: number | null;
  services: string[] | null;
  amenities: string[] | null;
};

const SLEEP = (ms: number) => new Promise((r) => setTimeout(r, ms));

let debugLogged = 0;
async function callLLM(prompt: string, attempt = 1): Promise<string | null> {
  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 400,
      reasoning_effort: "minimal",
    } as any);
    const text = resp.choices?.[0]?.message?.content;
    if (typeof text === "string" && text.trim().length > 0) return text.trim();
    if (debugLogged < 3) {
      debugLogged++;
      console.error(`DEBUG empty response [${debugLogged}]:`, JSON.stringify(resp).substring(0, 800));
    }
    return null;
  } catch (e: any) {
    const msg = e?.message || String(e);
    const status = e?.status || 0;
    if ((status === 429 || status >= 500) && attempt <= 4) {
      const wait = Math.min(30000, 2000 * 2 ** (attempt - 1));
      await SLEEP(wait);
      return callLLM(prompt, attempt + 1);
    }
    if (debugLogged < 3) {
      debugLogged++;
      console.error(`DEBUG LLM error [${status}]: ${msg.substring(0, 400)}`);
    }
    return null;
  }
}

function buildPrompt(f: Facility): string {
  const loc = [f.address, f.city, f.state, f.zipCode].filter(Boolean).join(", ");
  const services = (f.services || []).slice(0, 6).join(", ") || "standard care";
  const beds = f.totalBeds ? `${f.totalBeds} beds` : "unknown";
  return `Write a single descriptive paragraph (3-4 sentences, 200-350 characters) about this Massachusetts care facility for a directory listing. Be factual, warm, and informative. Mention the city, the type of care offered, and 1-2 specific details. Do NOT use template phrasing like "X in [city]." Do NOT invent facts not provided. Output ONLY the paragraph, no markdown, no quotes, no labels.

Facility: ${f.name}
Type: ${f.facilityType || "care facility"}
Location: ${loc || "Massachusetts"}
County: ${f.county || "unknown"}
Phone: ${f.phone || "unlisted"}
Website: ${f.website || "none"}
Beds: ${beds}
Services: ${services}`;
}

function cleanDesc(s: string): string {
  let out = s.trim();
  out = out.replace(/^["'`]+|["'`]+$/g, "").trim();
  out = out.replace(/^(Description|Paragraph|Output)\s*:\s*/i, "").trim();
  out = out.replace(/\s+/g, " ");
  return out;
}

const MIN_DESC_LEN = parseInt(process.env.MIN_DESC_LEN || "150");
const MAX_DESC_LEN = parseInt(process.env.MAX_DESC_LEN || "600");

async function processOne(f: Facility): Promise<{ status: "success" | "skipped" | "failed"; reason?: string }> {
  const prompt = buildPrompt(f);
  // Try once, if too short retry once with stronger prompt
  let raw = await callLLM(prompt);
  if (raw) {
    const cleaned = cleanDesc(raw);
    if (cleaned.length < MIN_DESC_LEN) {
      raw = await callLLM(prompt + `\n\nIMPORTANT: The paragraph MUST be at least ${MIN_DESC_LEN} characters long. Add a second sentence with relevant detail if needed.`);
    }
  }
  if (!raw) return { status: "failed", reason: "no llm output" };
  const desc = cleanDesc(raw);
  if (desc.length < MIN_DESC_LEN) return { status: "skipped", reason: `too short (${desc.length})` };
  if (desc.length > MAX_DESC_LEN) return { status: "skipped", reason: `too long (${desc.length})` };
  await db.update(facilities).set({ description: desc, updatedAt: new Date() }).where(eq(facilities.id, f.id));
  return { status: "success" };
}

async function main() {
  console.log("Querying facilities to rewrite...");
  const rows = await db
    .select({
      id: facilities.id,
      name: facilities.name,
      facilityType: facilities.facilityType,
      address: facilities.address,
      city: facilities.city,
      state: facilities.state,
      zipCode: facilities.zipCode,
      county: facilities.county,
      phone: facilities.phone,
      website: facilities.website,
      totalBeds: facilities.totalBeds,
      services: facilities.services,
      amenities: facilities.amenities,
    })
    .from(facilities)
    .where(or(isNull(facilities.description), sql`LENGTH(${facilities.description}) < 150`));

  const LIMIT = parseInt(process.env.LIMIT || "0");
  const work = LIMIT > 0 ? rows.slice(0, LIMIT) : rows;
  console.log(`Found ${rows.length} facilities to rewrite, processing ${work.length}`);

  const stats = { processed: 0, succeeded: 0, failed: 0, skipped: 0, total: work.length };
  const failed: Array<{ id: string; name: string; reason: string }> = [];
  const skipped: Array<{ id: string; name: string; reason: string }> = [];
  const start = Date.now();

  const CONCURRENCY = parseInt(process.env.CONCURRENCY || "8");

  for (let i = 0; i < work.length; i += CONCURRENCY) {
    const slice = work.slice(i, i + CONCURRENCY);
    const results = await Promise.all(slice.map((f) => processOne(f as Facility)));
    results.forEach((r, idx) => {
      stats.processed++;
      const f = slice[idx];
      if (r.status === "success") stats.succeeded++;
      else if (r.status === "skipped") {
        stats.skipped++;
        skipped.push({ id: f.id, name: f.name, reason: r.reason || "?" });
      } else {
        stats.failed++;
        failed.push({ id: f.id, name: f.name, reason: r.reason || "?" });
      }
    });

    const elapsed = Math.max(1, (Date.now() - start) / 1000);
    process.stdout.write(`[${elapsed.toFixed(0)}s] ${stats.processed}/${work.length} | ok=${stats.succeeded} fail=${stats.failed} skip=${stats.skipped} | ${(stats.processed / elapsed).toFixed(2)}/s\n`);
    writeFileSync(PROGRESS_FILE, JSON.stringify(stats, null, 2));
  }

  writeFileSync(
    RESULT_FILE,
    JSON.stringify({ ...stats, failedDetails: failed.slice(0, 50), skippedDetails: skipped.slice(0, 50) }, null, 2)
  );
  console.log(`\nDONE. ok=${stats.succeeded} fail=${stats.failed} skip=${stats.skipped}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
