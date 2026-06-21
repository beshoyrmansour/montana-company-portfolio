/**
 * Regenerate the branded retail-bag packshots straight from
 * public/images/website/bags/ into each product folder as
 * public/images/products/<slug>/montana-frozen-<slug>-pack.png (1000px wide).
 *
 * Run: node scripts/bags-from-website.mjs
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public/images/website/bags');
const PRODUCTS = path.join(ROOT, 'public/images/products');

const BAGS = {
  '4فراوله.png': 'strawberry',
  'desk 18 ok.png': 'molokhia',
  'بامية-01.png': 'okra',
  'بركولي.png': 'broccoli',
  'بسلة خضراء.png': 'peas',
  'حبوب ذرة.png': 'sweet-corn',
  'خرشوف.png': 'artichoke',
  'خضار مشكل .png': 'mixed-vegetables',
  'سبانخ.png': 'spinach',
  'فاصوليا خصراء.png': 'green-beans',
  'فول اخضر.png': 'broad-beans',
  'قرنيط.png': 'cauliflower',
};

const report = [];
for (const [file, slug] of Object.entries(BAGS)) {
  const src = path.join(SRC, file);
  const destDir = path.join(PRODUCTS, slug);
  await fs.mkdir(destDir, { recursive: true });
  const dest = path.join(destDir, `montana-frozen-${slug}-pack.png`);
  await sharp(src)
    .resize({ width: 1000, withoutEnlargement: true })
    .png({ quality: 80, compressionLevel: 9 })
    .toFile(dest);
  report.push(`${slug}: montana-frozen-${slug}-pack.png  <=  ${file}`);
}
console.log(report.join('\n'));
console.log(`\nRegenerated ${report.length} bag packshots from public/images/website/bags.`);
