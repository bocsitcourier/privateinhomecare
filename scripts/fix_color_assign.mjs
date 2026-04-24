import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { execSync } = require('child_process');

// Load color scores
const scores = JSON.parse(fs.readFileSync('/tmp/color_scores.json'));

// Only use images with good color (score >= 15) and exclude the mask photo
const BLACKLIST = new Set([
  'home_safety_elderly__238940b5.jpg', // mask photo
]);
const GOOD_IMAGES = scores
  .filter(r => r.score >= 15 && !BLACKLIST.has(r.file))
  .map(r => r.file);

console.log(`Good colorful images available: ${GOOD_IMAGES.length}`);

// Category-keyed lists from GOOD_IMAGES only
function byPrefix(prefix) { return GOOD_IMAGES.filter(i => i.startsWith(prefix)); }

const TOPICS = [
  { match: /(dementia|alzheimer|memory.care|sundown)/i, images: [...byPrefix('dementia_alzheimer_e_'),...byPrefix('dementia_memory_care_'),...byPrefix('senior_dementia_alzh_'),...byPrefix('senior_dementia_care_'),...byPrefix('elderly_man_with_dem_')] },
  { match: /(nutrition|healthy.eating|meal.plan|eating|food|diet)/i, images: [...byPrefix('elderly_person_eatin_'),...byPrefix('senior_nutrition_hea_'),...byPrefix('senior_nutrition_mea_'),...byPrefix('elderly_woman_cookin_')] },
  { match: /(home.safety|fall.prev|preventing.falls|safe.bathroom)/i, images: [...byPrefix('home_safety_elderly__'),...byPrefix('senior_safety_home_m_')] },
  { match: /(home.modif|aging.in.place|aging.place)/i, images: [...byPrefix('home_modifications_a_'),...byPrefix('home_safety_elderly__')] },
  { match: /(caregiver.burnout|burnout|caregiver.stress|caregiver.guilt|caregiver.conflict|sibling|self.care.tip)/i, images: [...byPrefix('family_caregiver_str_'),...byPrefix('family_caregiver_wit_'),...byPrefix('respite_care_caregiv_')] },
  { match: /(hospice|end.of.life|palliative|grief|loss)/i, images: [...byPrefix('hospice_care_compass_'),...byPrefix('end_of_life_care_com_'),...byPrefix('senior_mental_health_')] },
  { match: /(medicare|medicaid|masshealth|paying.for|insurance|veterans.benefit)/i, images: [...byPrefix('medicare_medicaid_he_'),...byPrefix('legal_documents_plan_')] },
  { match: /(legal|attorney|power.of.attorney|healthcare.proxy|advance)/i, images: [...byPrefix('legal_documents_elde_'),...byPrefix('legal_documents_plan_')] },
  { match: /(medication|drug|taking.medic|pill)/i, images: [...byPrefix('senior_taking_medica_'),...byPrefix('senior_woman_taking__')] },
  { match: /(heart|cardiac|cardiovascular)/i, images: [...byPrefix('senior_heart_health__'),...byPrefix('senior_citizen_blood_')] },
  { match: /(hospital|discharge|post.hospital)/i, images: [...byPrefix('hospital_discharge_e_'),...byPrefix('nurse_caring_for_eld_')] },
  { match: /(diabetes|blood.sugar)/i, images: [...byPrefix('diabetes_blood_sugar_'),...byPrefix('senior_citizen_blood_')] },
  { match: /(technology|tablet|device|digital)/i, images: [...byPrefix('senior_using_tablet__')] },
  { match: /(veteran|military)/i, images: [...byPrefix('veteran_elderly_mili_')] },
  { match: /(companion|social|isolation|loneliness)/i, images: [...byPrefix('elderly_social_conne_'),...byPrefix('happy_senior_compani_'),...byPrefix('senior_companion_car_')] },
  { match: /(exercise|physical.therap|aquatic|chair.yoga|stretching|yoga|fitness)/i, images: [...byPrefix('senior_exercise_phys_'),...byPrefix('senior_stretching_yo_')] },
  { match: /(hearing|hearing.loss)/i, images: [...byPrefix('elderly_hearing_aid__')] },
  { match: /(vision|eye|sight)/i, images: [...byPrefix('senior_vision_eye_ca_')] },
  { match: /(transportation|driving)/i, images: [...byPrefix('elderly_couple_walki_')] },
  { match: /(sleep|insomnia|rest)/i, images: [...byPrefix('senior_sleep_peacefu_'),...byPrefix('senior_woman_sleepin_')] },
  { match: /(incontinence|bladder)/i, images: [...byPrefix('personal_care_assist_')] },
  { match: /(wound.care|pressure.sore)/i, images: [...byPrefix('wound_care_medical_n_')] },
  { match: /(brain.game|cognitive|mental.sharp|puzzle)/i, images: [...byPrefix('senior_brain_games_p_')] },
  { match: /(respite)/i, images: [...byPrefix('respite_care_break_c_'),...byPrefix('respite_care_caregiv_')] },
  { match: /(adult.day)/i, images: [...byPrefix('adult_day_program_se_')] },
  { match: /(reminiscence|memory.book|music)/i, images: [...byPrefix('reminiscence_therapy_')] },
  { match: /(garden)/i, images: [...byPrefix('senior_man_gardening_')] },
  { match: /(depression|anxiety|mental.health|spiritualit|grief)/i, images: [...byPrefix('senior_mental_health_')] },
  { match: /(oral|dental|teeth)/i, images: [...byPrefix('senior_dental_oral_h_')] },
  { match: /(holiday|christmas|seasonal)/i, images: [...byPrefix('elderly_family_holid_')] },
  { match: /(hydration|drink|water)/i, images: [...byPrefix('elderly_drinking_wat_')] },
  { match: /(emergency|disaster|scam|financial.abuse|fraud)/i, images: [...byPrefix('emergency_preparedne_'),...byPrefix('elder_protection_saf_')] },
  { match: /(copd|chronic.lung|breathing|chronic.disease)/i, images: [...byPrefix('chronic_disease_mana_')] },
  { match: /(stroke|aphasia)/i, images: [...byPrefix('hospital_discharge_e_'),...byPrefix('elderly_man_with_wal_')] },
  { match: /(cancer)/i, images: [...byPrefix('family_caregiver_wit_'),...byPrefix('nurse_caring_for_eld_')] },
  { match: /(arthritis|pain.manage|chronic.pain)/i, images: [...byPrefix('elderly_man_with_wal_'),...byPrefix('chronic_disease_mana_')] },
  { match: /(parkinson)/i, images: [...byPrefix('elderly_man_with_wal_'),...byPrefix('wheelchair_mobility__')] },
  { match: /(health.screen|blood.press|doctor.appoint|medical.appoint)/i, images: [...byPrefix('senior_citizen_blood_'),...byPrefix('senior_couple_at_doc_'),...byPrefix('senior_doctor_medica_')] },
  { match: /(hire|hiring|private.caregiver|choosing.*agency|home.care.agency)/i, images: [...byPrefix('home_health_aide_hel_'),...byPrefix('professional_home_ca_'),...byPrefix('caregiver_helping_el_')] },
  { match: /(live.in|24.hour|round.the.clock)/i, images: [...byPrefix('nurse_caring_for_eld_'),...byPrefix('caregiver_helping_el_')] },
  { match: /(pca|personal.care.assist)/i, images: [...byPrefix('personal_care_assist_'),...byPrefix('caregiver_helping_el_')] },
  { match: /(activit|meaningful|engagement|wellbeing)/i, images: [...byPrefix('happy_elderly_senior_'),...byPrefix('senior_man_gardening_')] },
  { match: /(osteoporosis|bone.health)/i, images: [...byPrefix('senior_safety_home_m_'),...byPrefix('elderly_man_with_wal_')] },
  { match: /(wheelchair|mobility.aid|walker)/i, images: [...byPrefix('wheelchair_mobility__'),...byPrefix('elderly_man_with_wal_')] },
  { match: /(occupational.therap)/i, images: [...byPrefix('senior_exercise_phys_')] },
  { match: /(kidney|renal)/i, images: [...byPrefix('senior_citizen_blood_'),...byPrefix('senior_couple_at_doc_')] },
  { match: /(foot.care|podiatr)/i, images: [...byPrefix('senior_elderly_woman_')] },
  { match: /(talk.*parent|difficult.conversation|transition.*care)/i, images: [...byPrefix('multigenerational_fa_'),...byPrefix('family_caregiver_wit_')] },
  { match: /(massachusetts|boston)/i, images: [...byPrefix('boston_massachusetts_'),...byPrefix('professional_home_ca_')] },
  { match: /(home.health.aide|home.care.vs)/i, images: [...byPrefix('home_health_aide_hel_'),...byPrefix('caregiver_helping_el_')] },
];

const FALLBACK = [
  ...byPrefix('elderly_care_caregiv_'),
  ...byPrefix('caregiver_helping_el_'),
  ...byPrefix('nurse_caring_for_eld_'),
  ...byPrefix('happy_elderly_senior_'),
  ...byPrefix('family_caregiver_wit_'),
  ...byPrefix('multigenerational_fa_'),
  ...byPrefix('elderly_senior_care__'),
  ...byPrefix('home_health_aide_hel_'),
  ...byPrefix('professional_home_ca_'),
  ...byPrefix('elderly_grandmother__'),
  ...byPrefix('elderly_couple_walki_'),
  ...byPrefix('elderly_social_conne_'),
  ...byPrefix('senior_elderly_woman_'),
  ...byPrefix('elderly_man_with_wal_'),
  ...byPrefix('adult_day_program_se_'),
  ...byPrefix('senior_man_gardening_'),
];

// Get all published articles from dev DB
const raw = execSync(`psql "${process.env.DATABASE_URL}" -t -c "SELECT id, slug FROM articles WHERE status='published' ORDER BY created_at DESC;"`).toString().trim();
const articles = raw.split('\n').map(l => l.split('|').map(s => s.trim())).filter(r => r.length === 2 && r[0]).map(([id, slug]) => ({id, slug}));
console.log(`Articles to assign: ${articles.length}`);

const usedImages = new Set();
const assignments = [];

for (const article of articles) {
  const slug = article.slug;
  let candidates = [];
  
  for (const topic of TOPICS) {
    if (topic.match.test(slug)) {
      candidates = [...topic.images];
      break;
    }
  }
  
  // Filter out empty candidates, add fallbacks
  if (candidates.length === 0) candidates = [...FALLBACK];
  candidates = [...candidates.filter(Boolean), ...FALLBACK, ...GOOD_IMAGES].filter(Boolean);
  
  let assigned = null;
  for (const img of candidates) {
    if (img && !usedImages.has(img)) {
      assigned = img;
      break;
    }
  }
  
  if (assigned) {
    usedImages.add(assigned);
    assignments.push({ id: article.id, slug, image: assigned });
  }
}

const colorsUsed = assignments.map(a => {
  const score = scores.find(s => s.file === a.image);
  return score ? score.score : 0;
});
const minColor = Math.min(...colorsUsed).toFixed(1);
const avgColor = (colorsUsed.reduce((a,b) => a+b, 0)/colorsUsed.length).toFixed(1);
console.log(`Assigned: ${assignments.length}/${articles.length}, min color score: ${minColor}, avg: ${avgColor}`);

const sql = assignments.map(a => 
  `UPDATE articles SET hero_image_url = '/attached_assets/stock_images/${a.image}', updated_at = NOW() WHERE id = '${a.id}';`
).join('\n');

fs.writeFileSync('/tmp/fix_color_images.sql', sql);
console.log('SQL written to /tmp/fix_color_images.sql');
console.log('\nSample assignments:');
assignments.slice(0, 12).forEach(a => {
  const sc = scores.find(s => s.file === a.image);
  console.log(` [${(sc?.score||0).toFixed(0).padStart(3)}] ${a.slug.padEnd(55)} → ${a.image}`);
});
