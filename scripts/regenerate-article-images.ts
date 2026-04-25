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

// Highly specific, visually creative prompts per article title keyword
const PROMPT_MAP: Array<{ match: string[]; prompt: string }> = [
  {
    match: ['10 signs', 'signs your parent'],
    prompt: 'Split-composition photo: left side shows an elderly woman struggling alone with grocery bags at a front door; right side shows her adult daughter looking worried on a phone call. Dramatic split lighting, warm tones on left, cooler blues on right. Cinematic, high contrast, emotional storytelling photograph.'
  },
  {
    match: ['activities', 'mentally sharp', 'brain games', 'cognitive'],
    prompt: 'Extreme close-up of aged hands with reading glasses resting beside them, completing a colorful crossword puzzle on a wooden kitchen table. Morning light streams through lace curtains, casting soft shadows. A half-finished cup of tea steams nearby. Bokeh background, warm amber tones, lifestyle photography.'
  },
  {
    match: ['adult day program'],
    prompt: 'Wide-angle overhead shot of a vibrant senior center activity room: a semicircle of elderly adults laughing and painting watercolors together, colorful canvases visible, activity coordinator gesturing enthusiastically. Bright, cheerful natural light, high-energy composition, documentary photography style.'
  },
  {
    match: ['advance care planning', 'advance directive', 'healthcare proxy', 'power of attorney'],
    prompt: 'An elderly couple sitting at a sunlit kitchen table, hands intertwined, looking peacefully at legal documents together. A pen rests on the paper. Warm golden afternoon light through bay windows. Shallow depth of field, intimate portrait photography, sense of peace and dignity.'
  },
  {
    match: ['aging in place', 'home modification'],
    prompt: 'Architectural detail shot: a beautifully renovated bathroom with sleek grab bars, walk-in shower, and non-slip tiles — looking modern and stylish, not medical. Morning light, magazine-quality interior photography, warm neutral tones. An elegant cane rests against the vanity.'
  },
  {
    match: ['alzheimer', "alzheimer's"],
    prompt: 'An elderly woman holding a vintage photograph of herself as a young woman, her face showing a mix of recognition and contemplation. Caregiver sits nearby, gently touching her shoulder. Warm sepia tones in background, sharp focus on the photograph, emotional and cinematic lighting.'
  },
  {
    match: ['anxiety', 'depression', 'mental health', 'loneliness', 'isolation'],
    prompt: 'A senior man sitting alone by a large window on a rainy day, looking out pensively. Soft, melancholic blue-grey light. A phone and a cup of tea sit untouched on the table beside him. Wide shot, moody but hopeful — a sliver of sunlight breaking through clouds. Documentary photograph.'
  },
  {
    match: ['aquatic therapy', 'swimming', 'water therapy'],
    prompt: 'Underwater photograph looking up at an elderly woman in a pool, arms outstretched, silhouetted against rippling turquoise light. A physical therapist's hands visible at the water's edge. Dreamy, ethereal, high-contrast blues and whites. Fine art photography aesthetic.'
  },
  {
    match: ['arthritis'],
    prompt: 'Dramatic macro close-up of two sets of hands: a young caregiver gently cradling and massaging the swollen, arthritic knuckles of an elderly person. Warm amber side-lighting reveals texture and contrast. Hands only, no faces, intimate and powerful. Medical portrait photography.'
  },
  {
    match: ['bathing', 'grooming', 'personal care', 'hygiene'],
    prompt: 'Soft-focus image of a luxurious, accessible bathroom: a steaming bubble bath, folded white towels, a rubber bath mat, a long-handled sponge, all artfully arranged. Candle warm glow, spa-like atmosphere. Product photography meets lifestyle — dignified, not clinical.'
  },
  {
    match: ['cancer'],
    prompt: 'A bald elderly woman in a floral robe sitting in a garden chair, face tilted toward the sun with eyes closed and a peaceful smile. A caregiver kneels beside her, holding a warm drink. Golden hour backlight creates a halo effect. Hopeful, emotional, fine art portrait photography.'
  },
  {
    match: ['caregiver burnout', 'burnout', 'self-care for caregiv', 'family caregiver stress'],
    prompt: 'A middle-aged woman sitting on her porch steps at dusk, head in her hands, clearly exhausted. Her shoes are still on, a caregiving tote bag beside her. Golden-pink sunset behind her. Honest, raw, unposed documentary photography. The moment before she finds help.'
  },
  {
    match: ['chair yoga', 'yoga'],
    prompt: 'A semicircle of six elderly people doing chair yoga in a sunlit community room, arms raised, faces serene. An instructor demonstrates in front. Wide shot, bright natural light, lots of green plants visible. Joyful, dynamic energy. Lifestyle photography with a sense of movement.'
  },
  {
    match: ['choose', 'hiring', 'find a caregiver', 'vetting', 'how to find'],
    prompt: 'A professional caregiver in scrubs shaking hands confidently with an elderly woman in her living room doorway. The caregiver carries a portfolio, the senior smiles with relief. Warm afternoon light fills the hallway behind them. Business-meets-warmth composition, positive and trustworthy.'
  },
  {
    match: ['chronic pain', 'pain management'],
    prompt: 'A senior man holding his lower back, grimacing slightly, while a physical therapist demonstrates a stretching technique beside him. Warm, clinical-yet-homey atmosphere. The pain is visible but so is the hope. Close-medium shot, muted warm tones with sharp clinical whites.'
  },
  {
    match: ['companion care', 'companionship', 'social connection'],
    prompt: 'Two elderly women — one Black, one White — laughing uproariously over a Scrabble board, tiles scattered, coffee cups nearby. A large sunny window behind them. Candid, joyful, unposed. Warm afternoon light. Documentary photography capturing genuine human connection.'
  },
  {
    match: ['copd', 'lung disease', 'breathing', 'respiratory'],
    prompt: 'A senior man standing near an open window in a bright bedroom, doing breathing exercises — arms out, chest expanded, face calm and focused. A small portable nebulizer sits on the nightstand. Clean, airy, wide-open composition. Hopeful blues and whites. Medical lifestyle photography.'
  },
  {
    match: ['creating a safe home', 'home safety', 'fall prevention', 'preventing falls'],
    prompt: 'Wide-angle real-estate style photo of a beautifully organized living room with subtle safety features: furniture arranged with clear walking paths, a stylish rug with non-slip backing, rounded furniture corners, motion-sensor nightlight visible. A cane leans elegantly against a chair. Modern, aspirational home design.'
  },
  {
    match: ['dementia', 'memory care', 'sundowning'],
    prompt: 'An elderly man with dementia sits in a cozy chair surrounded by dozens of framed family photos. His caregiver sits on the floor beside him, holding up a photo and pointing at it, both of them connecting over shared memories. Warm tungsten light, shallow depth, deeply emotional portrait.'
  },
  {
    match: ['diabetes', 'blood sugar'],
    prompt: 'Flat-lay overhead shot on a white marble surface: a glucose meter, insulin pen, blueberries, walnuts, a small notebook with blood sugar log, and a glass of water — artfully arranged. Clean, clinical yet beautiful. Food photography meets medical lifestyle, crisp daylight.'
  },
  {
    match: ['elder abuse', 'abuse prevention'],
    prompt: 'A powerful silhouette image: an elderly person standing tall at a window, sunlight streaming behind them, a trusted advocate standing beside them with a hand on their shoulder. Backlit, high contrast, sense of protection and strength. Fine art photography.'
  },
  {
    match: ['exercise', 'physical activity', 'healthy aging', 'staying active'],
    prompt: 'An elderly Black woman in bright athletic wear power-walking on a tree-lined suburban Massachusetts sidewalk, arms swinging, expression determined and joyful. Fall foliage in background. Motion blur on background, sharp on subject. Active, energetic, aspirational lifestyle photography.'
  },
  {
    match: ['financial', 'cost', 'paying for', 'medicaid', 'medicare', 'masshealth', 'pca program'],
    prompt: 'A family meeting at a dining table: an adult son, his elderly mother, and a care coordinator looking at a laptop together, papers spread out. Warm, collaborative atmosphere. Overhead angle showing all three faces. Documents visible but not readable. Warm wood tones, late afternoon light.'
  },
  {
    match: ['foot care'],
    prompt: 'Macro close-up of a healthcare professional carefully examining and moisturizing the foot of an elderly patient. The foot rests in the clinician\'s cupped hands. Warm, intimate, high-resolution. Medical portrait photography with a sense of dignity and attentive care.'
  },
  {
    match: ['gardening', 'garden'],
    prompt: 'An elderly Asian woman kneeling in a raised garden bed, dirt on her gardening gloves, triumphantly holding up a handful of fresh red tomatoes. Bright summer sunlight, green garden behind her. Vibrant colors, candid joy. Wide shot showing the garden in all its abundance.'
  },
  {
    match: ['grief', 'loss', 'bereavement'],
    prompt: 'A pair of aged hands gently holding a single white rose, with a worn wedding photo visible in soft focus beneath. Diffused window light. Minimalist composition, deeply emotional. Black and white with only the rose in soft color. Fine art photography.'
  },
  {
    match: ['heart failure', 'heart disease', 'cardiac', 'chf'],
    prompt: 'Medical lifestyle image: a cardiologist or nurse using a stethoscope on an elderly man\'s chest while he sits upright in a well-lit home bedroom. The patient looks relieved and calm. Medical instruments, warm home setting. Contrast between clinical precision and home comfort.'
  },
  {
    match: ['hearing loss', 'hearing'],
    prompt: 'Close-up of a caregiver leaning in to speak clearly to a senior who wears a modern, nearly-invisible hearing aid. Both are smiling — a moment of genuine communication breakthrough. Soft focus background of a cozy living room. Warm natural light, intimate portrait.'
  },
  {
    match: ['hiring', 'home care agency', 'choose the right'],
    prompt: 'A professional caregiver\'s first day: she stands at the front door with her ID badge visible, warmly shaking hands with an elderly man and his adult daughter. The house behind them is classic New England colonial style. Warm, trustworthy, documentary style.'
  },
  {
    match: ['home care vs', 'home health care vs'],
    prompt: 'Creative split-screen infographic-style photo: left side shows a warm scene of a personal care aide helping a senior with a cup of tea; right side shows a skilled nurse in clinical attire checking vital signs. Sharp dividing line in the center. Bright, clear, educational visual.'
  },
  {
    match: ['hospice', 'end-of-life', 'palliative'],
    prompt: 'Deeply moving image: an elderly man lying peacefully in his own bed, holding the hand of a family member across the white bedsheet. A hospice nurse sits quietly in the background. Soft, reverent natural light from a frosted window. Sacred, dignified, cinematic photography.'
  },
  {
    match: ['hospital to home', 'post-hospital', 'discharge', 'recovery at home'],
    prompt: 'An ambulance crew and a home caregiver carefully helping an elderly woman with a walker up the steps to her own front door. She is smiling — she\'s HOME. Warm afternoon light, classic New England home exterior. The relief and joy of returning home visible on all faces.'
  },
  {
    match: ['hydration', 'drinking water'],
    prompt: 'Beautiful still life: an elderly woman\'s hands curled around a large glass of water with lemon, on a sunny porch with flowers visible through the window. Crisp, refreshing photography. Sunlight refracts through the water glass. Clean, fresh, health-focused.'
  },
  {
    match: ['intergenerational'],
    prompt: 'A toddler and a 90-year-old sitting side by side on a porch swing, the toddler showing the elder something on a tablet. Three generations visible in background. Golden hour light. Heartwarming, candid, National Geographic-quality documentary photography.'
  },
  {
    match: ['live-in care', 'live in care', '24-hour', '24 hour', 'overnight'],
    prompt: 'A split-day lifestyle photo: top half shows a caregiver helping a senior with breakfast in morning light; bottom half shows the same caregiver gently tucking them in at night, warm lamp light. Diptych composition showing the full day of dedicated care. Warm, intimate.'
  },
  {
    match: ['managing family', 'sibling', 'family conflict'],
    prompt: 'A family meeting around a kitchen table: three adult siblings, slightly tense expressions, looking at a shared document about their elderly parent\'s care. Through the window behind them, a caregiver tends to the parent in the garden. Candid, real, emotionally complex.'
  },
  {
    match: ['medication management', 'managing medications'],
    prompt: 'Organized medication management system: a beautiful weekly pill organizer, prescription bottles neatly labeled, a medication log notebook, and reading glasses — artfully arranged on a kitchen counter. Morning light, clean composition, color-coded pills visible. Lifestyle meets health.'
  },
  {
    match: ['multiple sclerosis', 'ms care'],
    prompt: 'A woman with MS in a power wheelchair, looking confident and stylish, laughing with her caregiver who walks beside her through a park. Fall New England foliage. The wheelchair is sleek and modern. Disability pride, empowerment, joy. Wide shot, beautiful location.'
  },
  {
    match: ['music therapy', 'music'],
    prompt: 'An elderly woman with closed eyes and a peaceful smile, headphones on, hands gently tapping on her knees in rhythm. A caregiver watches with a warm smile. Warm, slightly hazy afternoon light. Emotional, intimate close-up. The power of music is visible on her face.'
  },
  {
    match: ['nutrition and meal planning', 'meal planning'],
    prompt: 'Overhead flat-lay of a vibrant, colorful meal: baked salmon, roasted sweet potatoes, steamed broccoli, and fresh berries in separate sections of a plate. A senior\'s hands are visible cutting with a fork. Clean marble surface, food photography quality, appetizing and health-focused.'
  },
  {
    match: ['occupational therapy'],
    prompt: 'An occupational therapist guiding an elderly man\'s hands as he practices buttoning a shirt — a therapy session at a home kitchen table. Adaptive tools visible nearby. Warm, clinical-meets-home atmosphere. Close-medium shot showing the therapist\'s patient guidance.'
  },
  {
    match: ['oral health', 'dental'],
    prompt: 'A smiling elderly woman holds up a toothbrush, her teeth clean and bright. A caregiver stands behind her at the bathroom mirror, both looking at the reflection together and laughing. Bright bathroom lighting, clean white tiles. Fresh, healthy, positive imagery.'
  },
  {
    match: ['osteoporosis'],
    prompt: 'A senior woman doing tai chi outdoors on a sunny Massachusetts morning, perfectly balanced on one foot, arms graceful. The posture radiates strength and balance. Motion blur on falling autumn leaves around her, sharp focus on subject. Inspiring, empowering, beautiful.'
  },
  {
    match: ['parkinson'],
    prompt: 'Powerful close-up of a trembling elderly hand being gently steadied by a younger, caring hand. Both hands are in sharp focus against a softly blurred home background. Dramatic side lighting. The contrast between trembling and steadiness tells the whole story.'
  },
  {
    match: ['paying for in-home', 'massachusetts resources', 'resources and options'],
    prompt: 'Creative financial planning visual: a mason jar labeled "Care Fund" filled with coins, surrounded by scattered insurance cards, a MassHealth brochure, a calculator, and a hopeful handwritten note "We have options." Rustic wooden surface, warm lifestyle photography.'
  },
  {
    match: ['pet therapy', 'dogs for seniors', 'animal'],
    prompt: 'A golden retriever therapy dog resting its chin on the lap of an elderly man in a wheelchair, tail mid-wag (motion blur). The man\'s face shows pure delight, eyes crinkling. A warm sunbeam crosses the room. Candid, heartwarming, documentary photography.'
  },
  {
    match: ['physical therapy'],
    prompt: 'A physical therapist and elderly woman working together on leg strengthening exercises in a bright, spacious home room. Resistance band visible, both focused. Exercise mat on hardwood floor. Natural light, active energy, clinical precision with warmth.'
  },
  {
    match: ['pressure sore', 'bedridden', 'bed sore'],
    prompt: 'A nurse carefully applying a cushioning pad to a bedridden patient, with clinical precision and extreme care. White hospital-quality bedding, clean clinical environment in a home bedroom. Latex gloves, wound care supplies visible. Professional, compassionate, detailed close-up.'
  },
  {
    match: ['preventing caregiver burnout', 'self-care for family'],
    prompt: 'A family caregiver takes a quiet moment in her parked car, head back, eyes closed, hands on the steering wheel, just breathing. Late afternoon light streams through the windshield. Raw, honest, beautifully lit. The car is her 3 minutes of solitude. Cinematic documentary.'
  },
  {
    match: ['reminiscence therapy'],
    prompt: 'An elderly man and his caregiver poring over an open scrapbook together, the man pointing excitedly at an old black-and-white photo. His face is animated with memory. Warm lamp light, the scrapbook filling the frame. Intimate portrait, emotionally rich, detailed.'
  },
  {
    match: ['respite care'],
    prompt: 'The exact moment of handoff: a relieved adult daughter embracing a professional caregiver at the front door, her overnight bag visible, finally getting a break. Her elderly mother waves from the hallway behind. Warm evening light, emotional, real, joyful relief.'
  },
  {
    match: ['skin care', 'skincare'],
    prompt: 'A close-up beauty-style photograph of a caregiver gently applying moisturizing lotion to the face of a smiling elderly woman. Soft studio-quality lighting, white linens in background. The texture of the elderly skin shown with dignity and beauty. Spa aesthetic, warm and gentle.'
  },
  {
    match: ['sleep', 'sleep problem'],
    prompt: 'Peaceful nighttime scene: an elderly woman sleeping serenely in her own bed, soft moonlight through curtains, a glass of water and nightlight visible on the nightstand. A baby monitor with caregiver connectivity blinks gently. Calm, quiet, safe. Moody blue night photography.'
  },
  {
    match: ['spirituality', 'faith', 'religion'],
    prompt: 'An elderly woman kneeling beside her bed, hands clasped in prayer, late afternoon light creating long shadows and warm golden rays through a window. A rosary and religious book on the nightstand. Reverent, quiet, deeply personal. Fine art photography, vertical composition.'
  },
  {
    match: ['stroke recovery', 'stroke'],
    prompt: 'A stroke survivor in a home therapy session — seated, working hard to write his name on a notepad with his weaker hand, guided by a therapist. Intense concentration on his face. The barely-legible letters represent enormous triumph. Close-up, gritty, inspiring, emotional.'
  },
  {
    match: ['technology for seniors', 'devices', 'tablet', 'smart home'],
    prompt: 'An elderly man laughing as he does a video call on a large tablet, waving at the screen excitedly. His grandchildren are visible on the screen waving back. Bright living room, technology bridging distance. Warm, joyful, modern. Generational connection through technology.'
  },
  {
    match: ['transportation', 'driving', 'errand'],
    prompt: 'A professional, uniformed caregiver-driver holding the door open of a clean sedan, offering a gloved hand to help an elderly woman with a walker into the car. A doctor\'s appointment folder is visible. Suburban Massachusetts neighborhood. Professional, safe, dignified transport.'
  },
  {
    match: ['understanding dementia', 'types of dementia'],
    prompt: 'A neurologist holding a glowing brain scan image up to light, standing in a warmly lit consultation room. An elderly couple sits nearby, looking at the scan together with cautious hope. Dramatic blue light from the scan contrasts with warm room tones. Medical drama, educational.'
  },
  {
    match: ['vision care', 'eye care', 'vision loss'],
    prompt: 'A senior woman trying on new glasses at an optometrist appointment, her face lighting up as she reads a chart clearly for the first time in years. The optometrist smiles warmly. Bright, clinical-meets-warm lighting. Moment of clarity and joy captured candidly.'
  },
  {
    match: ['home health aide', 'cna', 'role of home'],
    prompt: 'Two healthcare professionals side by side: one in casual caregiver scrubs holding household supplies, one in clinical nurse attire holding a blood pressure cuff. Same warm smile, different roles. Clean white background with Massachusetts home visible through a window behind them.'
  },
  {
    match: ['caregiver guide', "caregiver's guide", 'caregiver approach'],
    prompt: 'An experienced caregiver sitting at a desk writing detailed notes in a care journal, open reference books nearby, a family photo of her elderly client on the desk. Warm desk lamp, late evening, dedicated and professional. Journalism-style portrait photography.'
  },
  {
    match: ['complete guide to in-home care', 'guide to in-home care'],
    prompt: 'Aerial drone shot of a classic New England colonial home on a tree-lined street, a friendly caregiver visible through the window helping inside, warm light glowing from every room. Massachusetts autumn colors. Aspirational, comprehensive, beautiful real estate meets lifestyle.'
  },
  {
    match: ['hiring a private caregiver', 'what massachusetts families'],
    prompt: 'A background check and credential verification scene: a care coordinator reviews a caregiver\'s portfolio of certifications spread on a glass table. The caregiver sits across, professional and confident. Boston skyline subtly visible through office window. Trust and vetting made visual.'
  },
  {
    match: ['sbate'],
    prompt: ''
  }
];

function buildPrompt(title: string): string {
  const lc = title.toLowerCase();
  for (const entry of PROMPT_MAP) {
    if (entry.match.some(m => lc.includes(m.toLowerCase()))) {
      return entry.prompt;
    }
  }
  // Unique fallback using the actual title
  const styles = [
    `Wide-angle documentary photograph in a warm Massachusetts home setting: ${title}. Natural window light, candid moment, real people, emotional authenticity. High-quality lifestyle photography.`,
    `Cinematic portrait photograph illustrating "${title}" — elderly person and caregiver in a genuine, unposed moment. Golden hour side-lighting, shallow depth of field, New England home interior.`,
    `Editorial-style photography for "${title}": close-up detail shot that tells the story without words. Dramatic lighting, rich textures, emotionally resonant composition. No faces — just telling details.`,
    `Fine art lifestyle photograph for "${title}": wide shot of a Massachusetts home, warm amber interior light glowing through windows at dusk, the sense of care and safety palpable. Architectural photography meets human story.`,
  ];
  const idx = Math.abs(title.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % styles.length;
  return styles[idx];
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);
}

async function generateOne(art: { id: string; title: string }): Promise<string | null> {
  const prompt = buildPrompt(art.title);
  if (!prompt) return null;
  const slug = slugify(art.title);
  const ts = Date.now();
  const filename = `${slug}_${ts}.jpg`;
  const filePath = path.join(OUTPUT_DIR, filename);
  try {
    const resp = await openai.images.generate({ model: 'gpt-image-1', prompt, size: '1024x1024' });
    const b64 = resp.data[0]?.b64_json ?? '';
    if (!b64) throw new Error('no image data');
    fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
    const newUrl = `/attached_assets/${filename}`;
    // Immediately update DB so progress is saved even if script is interrupted
    await pool.query('UPDATE articles SET hero_image_url = $1 WHERE id = $2', [newUrl, art.id]);
    console.log(`  ✓ ${art.title.slice(0, 60)}`);
    return newUrl;
  } catch (err: any) {
    console.error(`  ✗ ${art.title.slice(0, 60)}: ${err.message?.slice(0, 80)}`);
    return null;
  }
}

async function main() {
  const { rows } = await pool.query<{ id: string; title: string }>(
    `SELECT id, title FROM articles WHERE hero_image_url LIKE '%/stock_images/%' ORDER BY title`
  );
  console.log(`\nGenerating creative AI images for ${rows.length} articles...\n`);

  let done = 0;
  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const batch = rows.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(a => generateOne(a)));
    done += results.filter(Boolean).length;
    console.log(`  Progress: ${Math.min(i + CONCURRENCY, rows.length)}/${rows.length} (${done} generated)\n`);
    if (i + CONCURRENCY < rows.length) await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n✓ Complete: ${done}/${rows.length} images generated and saved to DB.`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
