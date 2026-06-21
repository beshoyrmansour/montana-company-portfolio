/**
 * One-off: regroup product images into per-product folders with SEO-semantic
 * names, using ONLY assets from the June 2026 marketing "website" drop.
 *
 * Target layout (per product):
 *   public/images/products/<slug>/montana-frozen-<slug>.jpg        (cover, 4:5 crop)
 *   public/images/products/<slug>/montana-frozen-<slug>-1..N.jpg   (gallery, drop photos)
 *   public/images/products/<slug>/montana-frozen-<slug>-pack.png   (branded bag, if any)
 *
 * Moves (not copies) the drop assets out of cards/ , bags/ and the June real/
 * frames, then rewrites each product JSON. Legacy stock/ , lifestyle/ , official/
 * and the May real/*-1..3 frames are left on disk (still referenced by news/about)
 * but are no longer used by any product. Run: node scripts/group-product-images.mjs
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');
const manifest = JSON.parse(
  await fs.readFile(path.join(ROOT, 'scripts/.marketing-manifest.json'), 'utf-8'),
);

// mushroom had no folder in the drop; group its existing real photo so the
// catalog stays consistent (flagged separately — not a drop asset).
const PLAN = { ...manifest, mushroom: { images: ['/images/products/real/mushroom-2.jpg'] } };

async function pathExists(abs) {
  try {
    await fs.access(abs);
    return true;
  } catch {
    return false;
  }
}

/** Move srcRel (/-rooted public path) to destAbs. Idempotent-ish: if the source
 *  is gone but the destination already exists, treat as already-done. */
async function move(srcRel, destAbs) {
  const srcAbs = path.join(PUB, srcRel);
  if (await pathExists(srcAbs)) {
    await fs.rename(srcAbs, destAbs);
    return true;
  }
  return pathExists(destAbs);
}

const report = [];
for (const [slug, info] of Object.entries(PLAN)) {
  const dirRel = `/images/products/${slug}`;
  const dirAbs = path.join(PUB, dirRel);
  await fs.mkdir(dirAbs, { recursive: true });
  const base = `montana-frozen-${slug}`;

  // cover (from cards/<slug>.jpg)
  const coverRel = `${dirRel}/${base}.jpg`;
  await move(`/images/products/cards/${slug}.jpg`, path.join(dirAbs, `${base}.jpg`));

  // gallery (the drop's real photos)
  const galleryRel = [];
  let i = 1;
  for (const img of info.images) {
    const name = `${base}-${i}.jpg`;
    const ok = await move(img, path.join(dirAbs, name));
    if (ok) galleryRel.push(`${dirRel}/${name}`);
    i++;
  }

  // branded bag (from bags/<slug>.png)
  let bagRel = null;
  const bagName = `${base}-pack.png`;
  if (await move(`/images/products/bags/${slug}.png`, path.join(dirAbs, bagName))) {
    bagRel = `${dirRel}/${bagName}`;
  }

  // rewrite JSON
  const file = path.join(ROOT, 'content/products', `${slug}.json`);
  const product = JSON.parse(await fs.readFile(file, 'utf-8'));
  product.images.primary = coverRel;
  product.images.gallery = [...galleryRel, ...(bagRel ? [bagRel] : [])];
  product.images.packaging = bagRel ? [bagRel] : [];
  await fs.writeFile(file, JSON.stringify(product, null, 2) + '\n', 'utf-8');

  report.push(`${slug}/ : cover + ${galleryRel.length} gallery${bagRel ? ' + pack' : ''}`);
}

// remove now-empty staging dirs
for (const d of ['cards', 'bags']) {
  const abs = path.join(PUB, 'images/products', d);
  const left = await fs.readdir(abs).catch(() => null);
  if (left && left.length === 0) {
    await fs.rmdir(abs);
    report.push(`removed empty dir products/${d}/`);
  } else if (left) {
    report.push(`KEPT products/${d}/ — still has: ${left.join(', ')}`);
  }
}

console.log(report.join('\n'));
console.log(`\nGrouped ${Object.keys(PLAN).length} products into per-product folders.`);
