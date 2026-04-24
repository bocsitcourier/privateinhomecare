const { execSync } = require('child_process');
const fs = require('fs');

// All original image files from production attached_assets (not stock_images, not screenshots)
const PROD_FILES = [
  'A_Comprehensive_Guide_on_How_to_Find_a_Reliable_Private_Pay_PC_1767894946697.png',
  'Advanced_Dementia_Behavioral_Management,_Get_a_Serene_In-Home__1767894946697.png',
  'bathing_and_grooming_assistance_in_in-home_senior_care_1767894946697.png',
  'best-15-dogs-for-seniors-living-at-home_1769694567019.png',
  'Comfort_and_Independence_Aging_in_Place_in_Massachusetts_1767894946697.png',
  'Compassionate_Hospice_PCA_in_Greater_Boston,_End-of-Life_Care__1767894946697.png',
  'concierge-care-in-massachusetts-private-inhome-caregiver_1767894946695.png',
  'concierge-care-in-massachusetts-private-inhome-caregiver_1769694567019.png',
  'cost-private-caregivers-salem-ma_1767894946697.png',
  'Dedicated_private_in-home_caregiver_providing_support_for_seni_1767894946697.png',
  'errand-running-services-in-ma-private-inhome-caregiver_1767894946697.png',
  'errand-running-services-in-ma-private-inhome-caregiver_1769694567019.png',
  'expert-private-inhome-caregivers-lexington-ma_1767894946697.png',
  'Falmouth:Hyannis_In-Home_Private_Senior_Care,_Maintaining_Inde_1767894946697.png',
  'Find_the_best_private_caregiver_near_Andover,_MA_1767894946697.png',
  'find-trustworthy-in-home-caregiver-services-in-worcester-ma_1769694632457.png',
  'greater-boston-dedicated-courier-services-key-benefits-bocsit_1767895133875.png',
  'greater-boston-dedicated-courier-services-key-benefits-bocsit_1769694632457.png',
  'guide-to-in-home-support-for-seniors-discharged-from-hospital_1769694632455.png',
  'Guide_to_Private_Pay_Home_Care_in_Newton,_Wellesley_&_Lexingto_1769694567038.png',
  'hire-non-medical-caregiver-marlborough-ma_1767895133875.png',
  'hire-non-medical-caregiver-marlborough-ma_1769694632457.png',
  'home-care-faqs-greater-boston-private-inhome-caregiver_1769694632457.png',
  'how-to-choose-the-right-in-home-care-after-hebrew-senior-life-_1769694632449.png',
  'in-home-care-02115-mass-general-hospital-private-inhome-caregi_1769694632453.png',
  'in-home-care-after-brigham-discharge-boston_1769694632453.png',
  'in-home-care-bidmc-discharge-boston_1769694632453.png',
  '_in-home_caregiver_costs_in_Newton_&_Wellesley,_MA_1769694567040.png',
  'in-home-help-after-hospital-discharge-boston_1769694632453.png',
  'in-home-help-costs-mass-general-boston_1769694632454.png',
  'Local_In-Home_Care_Options_for_Seniors_in_Burlington,_MA_1769694567040.png',
  'Long-Term_Care_Planning_with_a_private_caregiver_Sudbury_MA_1769694567039.png',
  'non-medical-caregiver-cost-cambridge-ma_1767895133875.png',
  'non-medical-caregiver-cost-cambridge-ma_1769694632458.png',
  'non-medical-caregiver-cost-in-newton-ma-2026_1767895133875.png',
  'non-medical-caregiver-cost-in-newton-ma-2026_1769694632458.png',
  'non-medical-caregiver-options-in-greater-boston-ma_1767895133875.png',
  'non-medical-caregiver-options-wellesley-ma_1767895133875.png',
  'non-medical-caregiver-providers-plymouth-ma_1767895133875.png',
  'private-in-home-care-after-discharge-greater-boston_1769694632456.png',
  'private-in-home-care-boston-medical-center_1769554180599.png',
  'private-in-home-care-boston-medical-center_1769694632455.png',
  'private_in-home_caregiver_assisting_an_elderly_person_in_a_hom_1769694567035.png',
  'private-inhome-caregiver-non-medical-caregiver-services-cape-c_1767895133875.png',
  'private-in-home-caregivers-senior-lives-massachusetts_1767894946697.png',
  'private-in-home-caregivers-senior-lives-massachusetts_1769694567019.png',
  'Private_Live_in_Care_Sudbury_MA,_Is_It_Right_for_You_1769694567042.png',
  'proven-strategies-for-compassionate-communication-with-aging-p_1767894946697.png',
  'proven-strategies-for-compassionate-communication-with-aging-p_1769694567019.png',
  'vetting-trusted-in-home-caregivers-agencies-massachusetts-priv_1767894946697.png',
  'vetting-trusted-in-home-caregivers-agencies-massachusetts-priv_1769694567018.png',
  'vitality-for-seniors-and-caregivers-this-winter-in-boston_1769694567018.png',
  'Wellness-First_Private_Caregiving_for_the_holidays_1769694567036.png',
  'Why_Private_Caregivers_Are_the_Top_Choice_for_Wellesley,_MA_Fa_1769694567041.png',
];

// Get all published articles from dev DB
const raw = execSync(`psql "${process.env.DATABASE_URL}" -t -c "SELECT id, slug FROM articles WHERE status='published';"`).toString().trim();
const articles = raw.split('\n').map(l => l.split('|').map(s => s.trim())).filter(r => r.length === 2 && r[0]).map(([id, slug]) => ({id, slug}));

// Normalize filename for matching: remove timestamp, lowercase, replace _ with -
function normalizeFile(f) {
  return f.replace(/_\d+\.png$/, '').toLowerCase().replace(/_/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Group files by normalized name, pick newest (highest timestamp)
const fileMap = {};
for (const f of PROD_FILES) {
  const norm = normalizeFile(f);
  const ts = parseInt(f.match(/_(\d+)\.png$/)?.[1] || '0');
  if (!fileMap[norm] || ts > fileMap[norm].ts) {
    fileMap[norm] = { file: f, ts, norm };
  }
}

console.log(`Unique normalized image keys: ${Object.keys(fileMap).length}`);

const sql = [];
const matched = [];

for (const art of articles) {
  const slug = art.slug;
  const slugNorm = slug.replace(/[^a-z0-9-]/g, '');
  
  // Try to match: file norm starts with slug prefix, or slug starts with file norm prefix
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [norm, info] of Object.entries(fileMap)) {
    // Calculate longest common prefix length
    let matchLen = 0;
    for (let i = 0; i < Math.min(norm.length, slugNorm.length); i++) {
      if (norm[i] === slugNorm[i]) matchLen++;
      else break;
    }
    if (matchLen > bestScore && matchLen >= 20) { // must match at least 20 chars
      bestScore = matchLen;
      bestMatch = info;
    }
  }
  
  if (bestMatch) {
    sql.push(`UPDATE articles SET hero_image_url = '/attached_assets/${bestMatch.file}', updated_at = NOW() WHERE id = '${art.id}';`);
    matched.push({ slug, file: bestMatch.file, score: bestScore });
  }
}

console.log(`\nMatched ${matched.length} articles to original images:\n`);
matched.forEach(m => console.log(` [${m.score}] ${m.slug.padEnd(60)} → ${m.file}`));

fs.writeFileSync('/tmp/restore_originals.sql', sql.join('\n'));
console.log(`\nSQL written: ${sql.length} updates`);
