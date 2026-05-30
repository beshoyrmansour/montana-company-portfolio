/**
 * One-off: append curated Quality-Team photos to EXISTING products' galleries.
 *
 * Reads scripts/.curate-manifest.json (produced by curate-quality-photos.mjs),
 * and for each NON-new product, appends its real photos to images.gallery
 * (de-duplicated, primary left untouched). New products are skipped here —
 * they get their own JSON files. Writes JSON back with 2-space indent.
 *
 * Run: node scripts/append-quality-galleries.mjs
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(
  await fs.readFile(path.join(ROOT, 'scripts/.curate-manifest.json'), 'utf-8'),
);

let changed = 0;
for (const [slug, info] of Object.entries(manifest)) {
  if (info.isNew) continue; // new products handled by dedicated JSON files
  const file = path.join(ROOT, 'content/products', `${slug}.json`);
  const product = JSON.parse(await fs.readFile(file, 'utf-8'));
  const gallery = product.images.gallery ?? [];
  const before = gallery.length;
  for (const img of info.images) if (!gallery.includes(img)) gallery.push(img);
  product.images.gallery = gallery;
  await fs.writeFile(file, JSON.stringify(product, null, 2) + '\n', 'utf-8');
  console.log(`${slug}: gallery ${before} -> ${gallery.length}`);
  changed++;
}
console.log(`\nUpdated ${changed} product files.`);
