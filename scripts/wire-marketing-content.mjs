/**
 * One-off: wire the June 2026 marketing image drop into EXISTING product JSONs.
 *
 * Reads scripts/.marketing-manifest.json (from process-marketing-images.mjs) and,
 * for each NON-new product, appends the freshly-processed real photos to
 * images.gallery (deduped, primary untouched). Also appends the real branded
 * retail bag to images.packaging + images.gallery where one exists.
 *
 * New products (manifest.<slug>.new === true) are skipped — they get their own
 * hand-authored JSON files. Run: node scripts/wire-marketing-content.mjs
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(
  await fs.readFile(path.join(ROOT, 'scripts/.marketing-manifest.json'), 'utf-8'),
);

// products that have a real branded retail bag render
const BAG_SLUGS = new Set([
  'strawberry', 'molokhia', 'okra', 'broccoli', 'peas', 'sweet-corn',
  'artichoke', 'mixed-vegetables', 'spinach', 'green-beans', 'broad-beans', 'cauliflower',
]);

const push = (arr, v) => {
  if (!arr.includes(v)) arr.push(v);
};

let changed = 0;
const slugs = new Set([...Object.keys(manifest), ...BAG_SLUGS]);
for (const slug of slugs) {
  if (manifest[slug]?.new) continue; // new products handled separately
  const file = path.join(ROOT, 'content/products', `${slug}.json`);
  let product;
  try {
    product = JSON.parse(await fs.readFile(file, 'utf-8'));
  } catch {
    console.log(`skip ${slug} (no existing JSON)`);
    continue;
  }
  product.images.gallery ??= [];
  product.images.packaging ??= [];
  const beforeG = product.images.gallery.length;
  const beforeP = product.images.packaging.length;

  for (const img of manifest[slug]?.images ?? []) push(product.images.gallery, img);

  if (BAG_SLUGS.has(slug)) {
    const bag = `/images/products/bags/${slug}.png`;
    push(product.images.packaging, bag);
    push(product.images.gallery, bag);
  }

  await fs.writeFile(file, JSON.stringify(product, null, 2) + '\n', 'utf-8');
  console.log(
    `${slug}: gallery ${beforeG}->${product.images.gallery.length}, packaging ${beforeP}->${product.images.packaging.length}`,
  );
  changed++;
}
console.log(`\nUpdated ${changed} existing product files.`);
