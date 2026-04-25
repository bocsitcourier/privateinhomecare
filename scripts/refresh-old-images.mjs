import OpenAI from 'openai';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONCURRENCY = 3;
const OUTPUT_DIR = path.join(__dirname, '..', 'attached_assets');
const PROGRESS_FILE = path.join(__dirname, '..', '.refresh-progress.json');
// Articles with images generated before April 2026 need refreshing
const FRESH_THRESHOLD = 1777000000000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Specific prompts per article topic keyword
const PROMPT_MAP = [
  { match: ['10 signs', 'signs your parent'], prompt: 'Split-composition photo: left side shows an elderly woman struggling alone with grocery bags at a front door; right side shows her adult daughter looking worried on a phone call. Dramatic split lighting, cinematic high contrast. Photorealistic documentary.' },
  { match: ['activities', 'mentally sharp', 'brain games', 'cognitive'], prompt: 'Extreme close-up of aged hands with reading glasses resting beside them, completing a colorful crossword puzzle on a wooden kitchen table. Morning light, warm amber tones, bokeh background. Editorial lifestyle.' },
  { match: ['adult day program'], prompt: 'Wide-angle overhead shot of a vibrant senior center: elderly adults laughing and painting watercolors together, colorful canvases visible, natural light, high-energy. Documentary photography.' },
  { match: ['advance care', 'advance directive', 'healthcare proxy', 'power of attorney'], prompt: 'An elderly couple at a sunlit kitchen table, hands intertwined, looking peacefully at legal documents. A pen rests on the paper. Warm golden afternoon light. Shallow depth of field, intimate portrait.' },
  { match: ['aging in place', 'home modification', 'home safety', 'fall prevention'], prompt: 'Architectural detail: a beautifully renovated bathroom with sleek grab bars, walk-in shower, non-slip tiles — modern and stylish, not clinical. Morning light, magazine-quality interior photography, warm neutral tones.' },
  { match: ['als ', 'amyotrophic'], prompt: 'A person in a power wheelchair with a tablet mounted on an arm, face showing concentration and determination as they communicate. Modern assistive technology, warm home environment. Fine art portrait.' },
  { match: ['alzheimer', "alzheimer's"], prompt: 'An elderly woman holding a vintage photograph of herself as a young woman, her face showing contemplation. Warm sepia tones in background, sharp focus on the photograph, deeply emotional cinematic lighting. Fine art portrait.' },
  { match: ['anxiety', 'depression', 'mental health', 'loneliness', 'isolation'], prompt: 'A senior man sitting alone by a large window on a rainy day, looking out pensively. Soft melancholic blue-grey light. A phone and cup of tea sit untouched beside him. Moody but hopeful, sliver of sunlight breaking through clouds. Documentary.' },
  { match: ['aquatic', 'swimming', 'water therapy'], prompt: 'Underwater photograph looking up at an elderly woman in a pool, arms outstretched, silhouetted against rippling turquoise light. Dreamy, ethereal, high-contrast blues and whites. Fine art photography.' },
  { match: ['arthritis'], prompt: 'Dramatic macro close-up of two sets of hands: a young caregiver gently cradling the swollen, arthritic knuckles of an elderly person. Warm amber side-lighting reveals texture. Hands only, no faces. Medical portrait photography.' },
  { match: ['bathing', 'grooming', 'personal care', 'hygiene'], prompt: 'Soft-focus image of an accessible bathroom: steaming bubble bath, folded white towels, a rubber bath mat, long-handled sponge, artfully arranged. Candle warm glow, spa-like atmosphere. Product photography meets lifestyle.' },
  { match: ['cancer'], prompt: 'A bald elderly woman in a floral robe sitting in a garden chair, face tilted toward the sun with eyes closed and a peaceful smile. Golden hour backlight creates a halo effect. Hopeful, emotional. Fine art portrait.' },
  { match: ['caregiver burnout', 'burnout', 'self-care for caregiv'], prompt: 'A middle-aged woman sitting on porch steps at dusk, head in her hands, exhausted. Her caregiving tote bag beside her. Golden-pink sunset behind her. Honest, raw, unposed. Documentary photography.' },
  { match: ['chair yoga', 'yoga'], prompt: 'A semicircle of elderly people doing chair yoga in a sunlit community room, arms raised, faces serene. An instructor demonstrates in front. Wide shot, bright natural light, green plants visible. Joyful lifestyle photography.' },
  { match: ['choosing', 'hiring a', 'find a caregiver', 'how to find'], prompt: 'A professional caregiver shaking hands confidently with an elderly woman in her living room doorway, carrying a portfolio, the senior smiling with relief. Warm afternoon light, business-meets-warmth.' },
  { match: ['chronic pain', 'pain management'], prompt: 'A senior man holding his lower back while a physical therapist demonstrates a stretching technique beside him. Close-medium shot, muted warm tones with sharp clinical whites, hopeful despite the pain.' },
  { match: ['companion care', 'companionship', 'social connection'], prompt: 'Two elderly women laughing uproariously over a Scrabble board, tiles scattered, coffee cups nearby. Large sunny window behind them. Candid, joyful, unposed. Warm afternoon light. Documentary photography.' },
  { match: ['copd', 'lung disease', 'breathing', 'respiratory'], prompt: 'A senior man near an open window in a bright bedroom doing breathing exercises, arms out, face calm and focused. A small portable nebulizer on the nightstand. Clean, airy, wide-open composition. Medical lifestyle photography.' },
  { match: ['dementia', 'memory care', 'sundowning'], prompt: 'An elderly man surrounded by dozens of framed family photos, his caregiver sitting on the floor beside him pointing at a photo, both connecting over memories. Warm tungsten light, shallow depth, deeply emotional portrait.' },
  { match: ['diabetes', 'blood sugar'], prompt: 'Flat-lay overhead on white marble: a glucose meter, insulin pen, blueberries, walnuts, a blood sugar log notebook, and a glass of water — artfully arranged. Clean, clinical yet beautiful. Food photography meets medical lifestyle.' },
  { match: ['elder abuse'], prompt: 'A powerful silhouette: an elderly person standing tall at a window, sunlight streaming behind them, an advocate standing beside with a hand on their shoulder. Backlit, high contrast, sense of protection. Fine art photography.' },
  { match: ['exercise', 'physical activity', 'staying active'], prompt: 'An elderly Black woman in bright athletic wear power-walking on a tree-lined Massachusetts sidewalk, arms swinging, determined and joyful. Fall foliage background, motion blur on surroundings. Active, aspirational lifestyle photography.' },
  { match: ['financial', 'cost of', 'paying for', 'medicaid', 'masshealth', 'pca program', 'pca benefit'], prompt: 'A family meeting at a dining table: adult son, elderly mother, care coordinator looking at a laptop together, papers spread. Warm collaborative atmosphere. Overhead angle, warm wood tones, late afternoon light.' },
  { match: ['foot care'], prompt: 'Macro close-up of a healthcare professional carefully examining and moisturizing the foot of an elderly patient. The foot rests in the clinician\'s cupped hands. Warm, intimate, high-resolution. Medical portrait.' },
  { match: ['gardening', 'garden'], prompt: 'An elderly Asian woman kneeling in a raised garden bed, dirt on her gloves, holding up fresh red tomatoes triumphantly. Bright summer sunlight. Vibrant colors, candid joy, wide shot showing the garden.' },
  { match: ['grief', 'loss', 'bereavement'], prompt: 'Aged hands gently holding a single white rose, a worn wedding photo in soft focus beneath. Diffused window light. Minimalist composition, deeply emotional. Black and white with only the rose in color. Fine art photography.' },
  { match: ['heart failure', 'heart disease', 'cardiac', 'chf'], prompt: 'A nurse using a stethoscope on an elderly man\'s chest while he sits upright in a well-lit home bedroom. Medical instruments, warm home setting. Contrast between clinical precision and home comfort.' },
  { match: ['hearing loss'], prompt: 'Close-up of a caregiver leaning in to speak clearly to a senior wearing a modern hearing aid, both smiling — a moment of genuine communication. Soft focus background of a cozy living room. Warm natural light, intimate portrait.' },
  { match: ['home care vs', 'home health vs'], prompt: 'Creative split-screen: left side shows a personal care aide helping a senior with tea; right side shows a skilled nurse checking vital signs. Sharp dividing line. Bright, clear, educational visual. Split-screen photography.' },
  { match: ['hospice', 'end-of-life', 'palliative'], prompt: 'An elderly man lying peacefully in his own bed, holding the hand of a family member across white bedsheets. A hospice nurse sits quietly in background. Soft reverent natural light from frosted window. Sacred, dignified, cinematic.' },
  { match: ['hospital to home', 'post-hospital', 'discharge', 'recovery at home', 'stroke recovery'], prompt: 'A caregiver carefully helping an elderly woman with a walker up the front steps to her own home. She is smiling — she\'s HOME. Warm afternoon light, classic New England home exterior. Relief and joy visible on all faces.' },
  { match: ['hydration', 'drinking water'], prompt: 'An elderly woman\'s hands curled around a large glass of water with lemon on a sunny porch, flowers visible through the window. Crisp, refreshing. Sunlight refracts through the water glass. Clean, fresh, health-focused.' },
  { match: ['intergenerational', 'grandchildren', 'grandchild'], prompt: 'A toddler and a 90-year-old sitting side by side on a porch swing, the toddler showing the elder something on a tablet. Golden hour light. Heartwarming, candid. Documentary photography.' },
  { match: ['kidney disease', 'renal'], prompt: 'Overhead flat-lay on a white marble surface: a blood pressure cuff, a kidney-friendly meal of salmon and vegetables, a pill organizer, a hydration tracking chart. Medical lifestyle photography.' },
  { match: ['live-in care', 'live in care', '24-hour', '24 hour', 'overnight', 'around-the-clock'], prompt: 'Diptych: top half shows a caregiver helping a senior with breakfast in morning light; bottom half shows the same caregiver gently helping them into bed at night, warm lamp light. Full day of care. Warm, intimate.' },
  { match: ['long-term care insurance', 'insurance'], prompt: 'A financial advisor and adult couple reviewing insurance documents at a dining table, calm and purposeful. A binder of policy documents open. Late afternoon light, reassuring atmosphere. Editorial lifestyle.' },
  { match: ['managing family', 'sibling', 'family conflict', 'family caregiver'], prompt: 'A family meeting: three adult siblings, slightly tense, looking at a shared document about their parent\'s care. Through the window, a caregiver tends to the parent in the garden. Candid, emotionally complex.' },
  { match: ['masshealth', 'medicare', 'medicaid', 'aid and attendance', 'veterans benefit'], prompt: 'A family caregiver at a laptop researching benefit programs, official-looking documents beside her, reading glasses on. Warm home office setting. Purposeful concentration. Editorial lifestyle photography.' },
  { match: ['medication', 'managing medic'], prompt: 'A beautiful weekly pill organizer, prescription bottles neatly labeled, a medication log notebook and reading glasses — artfully arranged on a kitchen counter. Morning light, clean composition. Lifestyle meets health.' },
  { match: ['mobility', 'walker', 'wheelchair', 'fall prevention'], prompt: 'An elderly man practicing walking with a sleek modern walker in a bright hallway, a physical therapist nearby offering encouragement. Clean, well-lit home environment. Determination and progress visible.' },
  { match: ['multiple sclerosis', 'ms care'], prompt: 'A woman in a power wheelchair, confident and stylish, laughing with her caregiver through a park. Fall New England foliage. The wheelchair is sleek and modern. Disability pride, empowerment, joy. Wide shot.' },
  { match: ['music therapy', 'music'], prompt: 'An elderly woman with closed eyes and a peaceful smile, headphones on, hands gently tapping her knees in rhythm. A caregiver watches with a warm smile. Warm hazy afternoon light. The power of music visible on her face.' },
  { match: ['non-medical transport', 'transportation', 'driving'], prompt: 'A professional uniformed caregiver holding a car door open, offering a hand to help an elderly woman with a walker into a clean sedan. A doctor\'s appointment folder visible. Suburban Massachusetts neighborhood.' },
  { match: ['nutrition', 'meal plan', 'diet', 'food for seniors'], prompt: 'Overhead flat-lay of a vibrant colorful meal: baked salmon, roasted sweet potatoes, steamed broccoli, fresh berries in separate sections. An elderly person\'s hands visible. Clean marble surface, food photography quality.' },
  { match: ['occupational therapy'], prompt: 'An occupational therapist guiding an elderly man\'s hands as he practices buttoning a shirt at a kitchen table. Adaptive tools nearby. Warm, clinical-meets-home atmosphere. Close-medium shot.' },
  { match: ['oral health', 'dental'], prompt: 'A smiling elderly woman holds up a toothbrush, her teeth clean and bright. A caregiver stands behind at the bathroom mirror, both looking at the reflection and laughing. Bright bathroom lighting. Fresh and positive.' },
  { match: ['osteoporosis'], prompt: 'A senior woman doing tai chi outdoors on a sunny Massachusetts morning, perfectly balanced on one foot, arms graceful. Motion blur on falling autumn leaves around her. Inspiring, empowering, beautiful.' },
  { match: ['parkinson'], prompt: 'Close-up of a trembling elderly hand being gently steadied by a younger caring hand. Both hands in sharp focus against a softly blurred home background. Dramatic side lighting. Fine art portrait.' },
  { match: ['pet therapy', 'dogs for seniors', 'animal'], prompt: 'A golden retriever therapy dog resting its chin on the lap of an elderly man, tail mid-wag. The man\'s face shows pure delight. A warm sunbeam crosses the room. Candid, heartwarming. Documentary photography.' },
  { match: ['physical therapy', 'rehabilitation'], prompt: 'A physical therapist and elderly woman working together on leg strengthening exercises in a bright home room. Resistance band visible, both focused. Exercise mat on hardwood floor. Natural light, active energy.' },
  { match: ['pca', 'personal care assistant', 'personal care aide'], prompt: 'A professional PCA in casual scrubs helping an elderly woman select clothes from an organized closet, both smiling. Warm morning light through curtains. Dignified, collaborative, bright home environment.' },
  { match: ['private caregiver', 'private pay', 'private in-home', 'in-home care in', 'senior care in'], prompt: 'A professional caregiver in business-casual attire warmly greeted at the door of a classic New England colonial home by an elderly woman and her adult daughter. Warm afternoon light, trustworthy, documentary style.' },
  { match: ['respite care'], prompt: 'The exact moment of handoff: a relieved adult daughter embracing a professional caregiver at the front door, overnight bag visible, finally getting a break. Her elderly mother waves from the hallway. Warm evening light, joyful relief.' },
  { match: ['self-care', 'caregiver support', 'caregiver wellness'], prompt: 'A family caregiver in her parked car, head back, eyes closed, hands on the steering wheel, breathing. Late afternoon light through the windshield. Raw, honest, beautifully lit. The car as a refuge. Cinematic documentary.' },
  { match: ['skin care', 'wound care', 'pressure sore'], prompt: 'A nurse carefully applying cream to an elderly patient\'s arm with clinical precision and extreme care. White hospital-quality bedding, clean clinical-meets-home environment. Professional, compassionate, detailed.' },
  { match: ['sleep'], prompt: 'Peaceful nighttime scene: an elderly woman sleeping serenely in her own bed, soft moonlight through curtains, a glass of water and nightlight on the nightstand. Calm, quiet, safe. Moody blue night photography.' },
  { match: ['spirituality', 'faith', 'religion'], prompt: 'An elderly woman with hands clasped in prayer, late afternoon light creating long shadows and golden rays through a window. A rosary and religious book on the nightstand. Reverent, quiet. Fine art photography.' },
  { match: ['technology', 'tablet', 'smart home', 'devices for seniors', 'medical alert'], prompt: 'An elderly man laughing as he does a video call on a large tablet, waving at the screen excitedly. Grandchildren visible on the screen waving back. Bright living room, warm and joyful, technology bridging distance.' },
  { match: ['vision', 'eye care', 'blindness', 'low vision'], prompt: 'A senior woman trying on new glasses at an optometrist, her face lighting up as she reads clearly for the first time. The optometrist smiles warmly. Bright clinical-meets-warm lighting. Moment of clarity and joy.' },
  { match: ['veterans', 'aid and attendance'], prompt: 'An elderly veteran holding a framed military photo, his adult child beside him reviewing VA benefit documents. American flag subtly visible in background. Proud, dignified, purposeful. Fine art portrait.' },
];

function buildPrompt(title, category) {
  const lc = title.toLowerCase() + ' ' + (category || '').toLowerCase();
  for (const entry of PROMPT_MAP) {
    if (entry.match.some(m => lc.includes(m.toLowerCase()))) {
      return entry.prompt;
    }
  }
  // Location-specific fallback
  const maMatch = title.match(/in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+MA/);
  if (maMatch) {
    const city = maMatch[1];
    return `Aerial drone photography at golden hour over the charming town center of ${city}, Massachusetts — a classic New England church steeple, tree-lined streets with fall foliage, warm residential rooftops visible below. Peaceful, aspirational, community-focused. Photorealistic documentary.`;
  }
  // Generic quality fallback
  return `A warm, intimate editorial photograph illustrating "${title}": close-up detail shot that tells the story — specific objects, rich textures, dramatic lighting, no faces. Massachusetts home environment implied. Fine art portrait photography, emotional authenticity.`;
}

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 55);
}

function loadProgress() {
  try { return new Set(JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'))); }
  catch { return new Set(); }
}

function saveProgress(done) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify([...done], null, 2));
}

async function generateOne(art, done) {
  const prompt = buildPrompt(art.title, art.category);
  const slug = slugify(art.title);
  const filename = `${slug}_${Date.now()}.jpg`;
  const filePath = path.join(OUTPUT_DIR, filename);
  try {
    const resp = await openai.images.generate({ model: 'gpt-image-1', prompt, size: '1024x1024' });
    const b64 = resp.data[0]?.b64_json ?? '';
    if (!b64) throw new Error('no image data');
    fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
    const newUrl = `/attached_assets/${filename}`;
    await pool.query('UPDATE articles SET hero_image_url = $1 WHERE id = $2', [newUrl, art.id]);
    done.add(art.id);
    saveProgress(done);
    return true;
  } catch (err) {
    console.error(`  FAIL [${art.title.slice(0, 50)}]: ${err.message?.slice(0, 80)}`);
    return false;
  }
}

async function main() {
  const done = loadProgress();
  const { rows } = await pool.query(
    `SELECT id, title, category FROM articles WHERE hero_image_url !~ '_177[0-9]{10}\\.jpg$' OR hero_image_url IS NULL ORDER BY title`
  );
  const todo = rows.filter(r => !done.has(r.id));

  console.log(`\n=== Refresh Old Article Images ===`);
  console.log(`Needs fresh image: ${rows.length} | Remaining: ${todo.length} | Already done this run: ${done.size}`);
  console.log('==================================\n');

  let count = 0;
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const chunk = todo.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map(a => generateOne(a, done)));
    count += results.filter(Boolean).length;
    const pct = Math.round(((done.size) / rows.length) * 100);
    console.log(`  [${Math.min(i + CONCURRENCY, todo.length)}/${todo.length}] session total: ${count} | overall: ${done.size}/${rows.length} (${pct}%)`);
  }

  console.log(`\nDone. Generated ${count} images this run. Total progress: ${done.size}/${rows.length}`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
