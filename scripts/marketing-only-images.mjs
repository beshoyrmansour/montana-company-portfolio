/**
 * One-off: make every product's images use ONLY assets from the June 2026
 * marketing "website" drop — purge stock/, lifestyle/, official/ (AI packshots)
 * and legacy *-pack.png from galleries/packaging.
 *
 * For each product in scripts/.marketing-manifest.json:
 *   primary   -> /images/products/cards/<slug>.jpg   (already a crop of a drop photo; left as-is)
 *   gallery   -> the drop's real photos (manifest) + the real branded bag, if one exists
 *   packaging -> the real branded bag, if one exists, else []
 *
 * mushroom has no folder in the drop, so it is left untouched and reported.
 * Run: node scripts/marketing-only-images.mjs
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');
const manifest = JSON.parse(
  await fs.readFile(path.join(ROOT, 'scripts/.marketing-manifest.json'), 'utf-8'),
);

async function exists(rel) {
  try {
    await fs.access(path.join(PUB, rel));
    return true;
  } catch {
    return false;
  }
}

let changed = 0;
const report = [];
for (const [slug, info] of Object.entries(manifest)) {
  const file = path.join(ROOT, 'content/products', `${slug}.json`);
  const product = JSON.parse(await fs.readFile(file, 'utf-8'));

  const cardRel = `/images/products/cards/${slug}.jpg`;
  const bagRel = `/images/products/bags/${slug}.png`;
  const hasCard = await exists(cardRel);
  const hasBag = await exists(bagRel);

  const gallery = [...info.images];
  if (hasBag) gallery.push(bagRel);

  product.images.primary = hasCard ? cardRel : info.images[0];
  product.images.gallery = gallery;
  product.images.packaging = hasBag ? [bagRel] : [];

  await fs.writeFile(file, JSON.stringify(product, null, 2) + '\n', 'utf-8');
  report.push(`${slug}: primary=${path.basename(product.images.primary)} gallery=${gallery.length} bag=${hasBag ? 'yes' : 'no'}`);
  changed++;
}

report.push('');
report.push('SKIPPED (no marketing-drop folder): mushroom — left untouched.');
console.log(report.join('\n'));
console.log(`\nRebuilt ${changed} product image sets to marketing-only.`);
