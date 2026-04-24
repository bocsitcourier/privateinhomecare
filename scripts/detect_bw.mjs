import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const IMG_DIR = path.join(__dirname, '..', 'attached_assets', 'stock_images');
const images = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.jpg') && !f.startsWith('_'));
console.log(`Analyzing ${images.length} images for color content...`);

const results = [];
const BATCH = 15;

for (let i = 0; i < images.length; i += BATCH) {
  const batch = images.slice(i, i + BATCH);
  await Promise.all(batch.map(async (filename) => {
    try {
      const { data, info } = await sharp(path.join(IMG_DIR, filename))
        .resize(60, 60, { fit: 'cover' })
        .raw().toBuffer({ resolveWithObject: true });
      
      let totalColorVariance = 0;
      const pixels = data.length / info.channels;
      const ch = info.channels;
      for (let p = 0; p < data.length; p += ch) {
        const r = data[p], g = data[p+1], b = data[p+2];
        const avg = (r + g + b) / 3;
        totalColorVariance += Math.abs(r - avg) + Math.abs(g - avg) + Math.abs(b - avg);
      }
      results.push({ file: filename, score: totalColorVariance / pixels });
    } catch(err) {
      results.push({ file: filename, score: -1 });
    }
  }));
}

results.sort((a, b) => a.score - b.score);

const bw = results.filter(r => r.score < 8);
console.log(`\nB&W / near-grayscale images (${bw.length}):`);
bw.forEach(r => console.log(`  ${r.score.toFixed(1).padStart(5)}  ${r.file}`));

const lowColor = results.filter(r => r.score >= 8 && r.score < 15);
console.log(`\nLow-color images (${lowColor.length}):`);
lowColor.forEach(r => console.log(`  ${r.score.toFixed(1).padStart(5)}  ${r.file}`));

fs.writeFileSync('/tmp/color_scores.json', JSON.stringify(results));
console.log('\nSaved scores to /tmp/color_scores.json');
