/**
 * One-off: process the marketing team's June 2026 image drop into
 * web-optimized assets, and emit small thumbnails for review.
 *
 * Sources (all under public/images/):
 *   heroes/Gemini_Generated_Image_*.png   -> heroes/frozen-<produce>.jpg   (2400w)
 *   website/bags/<arabic>.png             -> products/bags/<slug>.png       (1000w, keep alpha)
 *   website/Factory/*.png                 -> facility/floor/floor-NN.jpg    (1600w)
 *   website/products/<folder>/*           -> products/real/<slug>-<n>.jpg   (1400w, appended)
 *
 * TIFs and multi-MB PNGs are re-encoded to JPEG; bags keep PNG (transparency).
 * Existing products/real/<slug>-N.jpg are NEVER overwritten — new shots append
 * after the current max index. Review thumbnails are written to /tmp/mt/.
 *
 * Run: node scripts/process-marketing-images.mjs
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public', 'images');
const THUMB = '/tmp/mt';

const report = [];
const log = (s) => report.push(s);

async function ensure(dir) {
  await fs.mkdir(dir, { recursive: true });
}
async function thumb(src, name) {
  await ensure(THUMB);
  await sharp(src).rotate().resize({ width: 360 }).jpeg({ quality: 60 }).toFile(path.join(THUMB, name));
}

// ── 1. HEROES ────────────────────────────────────────────────────────────
const HEROES = {
  'Gemini_Generated_Image_bjjklybjjklybjjk.png': 'frozen-cauliflower',
  'Gemini_Generated_Image_y9zoo6y9zoo6y9zo.png': 'frozen-mango',
  'Gemini_Generated_Image_mw9ixdmw9ixdmw9i.png': 'frozen-broccoli',
  'Gemini_Generated_Image_smwldlsmwldlsmwl.png': 'frozen-strawberry',
};
async function doHeroes() {
  for (const [file, out] of Object.entries(HEROES)) {
    const src = path.join(PUB, 'heroes', file);
    const dest = path.join(PUB, 'heroes', `${out}.jpg`);
    await sharp(src).rotate().resize({ width: 2400, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true }).toFile(dest);
    log(`hero  /images/heroes/${out}.jpg`);
  }
}

// ── 2. BAGS ──────────────────────────────────────────────────────────────
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
async function doBags() {
  const outDir = path.join(PUB, 'products', 'bags');
  await ensure(outDir);
  for (const [file, slug] of Object.entries(BAGS)) {
    const src = path.join(PUB, 'website', 'bags', file);
    const dest = path.join(outDir, `${slug}.png`);
    await sharp(src).resize({ width: 1000, withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 9 }).toFile(dest);
    log(`bag   /images/products/bags/${slug}.png`);
  }
}

// ── 3. FACTORY ─────────────────────────────────────────────────────────────
async function doFactory() {
  const srcDir = path.join(PUB, 'website', 'Factory');
  const outDir = path.join(PUB, 'facility', 'floor');
  await ensure(outDir);
  const files = (await fs.readdir(srcDir)).filter((f) => /\.png$/i.test(f)).sort();
  let i = 1;
  for (const f of files) {
    const n = String(i).padStart(2, '0');
    const dest = path.join(outDir, `floor-${n}.jpg`);
    await sharp(path.join(srcDir, f)).rotate().resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true }).toFile(dest);
    await thumb(path.join(srcDir, f), `floor-${n}.jpg`);
    log(`floor /images/facility/floor/floor-${n}.jpg  <=  ${f}`);
    i++;
  }
}

// ── 4. PRODUCTS ────────────────────────────────────────────────────────────
// folder -> { slug, n }. New products start their own numbering at 1.
const PRODUCTS = [
  { dir: 'Okra', slug: 'okra', n: 3 },
  { dir: 'artichokes', slug: 'artichoke', n: 3 },
  { dir: 'broad beans', slug: 'broad-beans', n: 3 },
  { dir: 'peleed broad beans', slug: 'peeled-broad-beans', n: 3, new: true },
  { dir: 'broccoli', slug: 'broccoli', n: 3 },
  { dir: 'carrots', slug: 'carrots', n: 3 },
  { dir: 'caulif', slug: 'cauliflower', n: 2 },
  { dir: 'colcasia', slug: 'colcasia', n: 3 },
  { dir: 'coriander', slug: 'coriander', n: 2 },
  { dir: 'cut beans', slug: 'green-beans', n: 3 },
  { dir: 'whole beans', slug: 'whole-green-beans', n: 3, new: true },
  { dir: 'falafel', slug: 'falafel', n: 3 },
  { dir: 'mango', slug: 'mango', n: 3 },
  { dir: 'mixed 3 ways', slug: 'mixed-vegetables', n: 2 },
  { dir: 'mixed 4 ways', slug: 'mixed-vegetables', n: 2 },
  { dir: 'molokhia', slug: 'molokhia', n: 3 },
  { dir: 'peas & carrots', slug: 'peas-and-carrots', n: 3 },
  { dir: 'pomegranate', slug: 'pomegranate', n: 2, new: true },
  { dir: 'spinach', slug: 'spinach', n: 3 },
  { dir: 'strawberry', slug: 'strawberry', n: 3 },
  { dir: 'sweet corn kernel', slug: 'sweet-corn', n: 3 },
  { dir: 'sweet corn on cob', slug: 'sweet-corn-cob', n: 3, new: true },
  { dir: 'veg soup', slug: 'vegetable-soup', n: 3, new: true },
  { dir: 'vine leases', slug: 'vine-leaves', n: 3 },
];
// top-level loose files
const LOOSE = [
  { files: ['1بطاطس.jpg', '2بطاطس.jpg', 'بطاطس.jpg'], slug: 'potato', n: 3, new: true },
  { files: ['بسلة .jpg'], slug: 'peas', n: 1 },
];

const IMG_RE = /\.(jpe?g|tiff?|png)$/i;
const AI_RE = /chatgpt|gemini/i;

async function listImages(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.filter((e) => e.isFile() && IMG_RE.test(e.name)).map((e) => path.join(dir, e.name));
}

async function bySizeDesc(files) {
  const withSize = await Promise.all(files.map(async (f) => ({ f, size: (await fs.stat(f)).size })));
  withSize.sort((a, b) => b.size - a.size);
  return withSize.map((x) => x.f);
}

// pick: prefer real (non-AI) photos, largest first; fill with AI renders if short
function pick(files, n) {
  const real = files.filter((f) => !AI_RE.test(path.basename(f)));
  const ai = files.filter((f) => AI_RE.test(path.basename(f)));
  return [...real, ...ai].slice(0, n);
}

async function maxIndex(slug) {
  const dir = path.join(PUB, 'products', 'real');
  const files = await fs.readdir(dir).catch(() => []);
  const re = new RegExp(`^${slug}-(\\d+)\\.jpg$`);
  let max = 0;
  for (const f of files) {
    const m = f.match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max;
}

async function emitProduct(slug, srcFiles, n, startAt) {
  const outDir = path.join(PUB, 'products', 'real');
  await ensure(outDir);
  const sorted = await bySizeDesc(srcFiles);
  const picks = pick(sorted, n);
  const paths = [];
  let i = startAt;
  for (const src of picks) {
    i++;
    const rel = `/images/products/real/${slug}-${i}.jpg`;
    await sharp(src).rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(ROOT, 'public', rel));
    await thumb(src, `${slug}-${i}.jpg`);
    paths.push(rel);
    log(`prod  ${rel}  <=  ${path.basename(src)}`);
  }
  return paths;
}

async function doProducts() {
  const base = path.join(PUB, 'website', 'products');
  const manifest = {};
  // group folder configs by slug (mixed-vegetables spans two folders)
  const startIdx = {}; // running index per slug
  for (const cfg of PRODUCTS) {
    const files = await listImages(path.join(base, cfg.dir));
    if (!files.length) {
      log(`prod  (no images) ${cfg.dir} -> ${cfg.slug}`);
      continue;
    }
    if (startIdx[cfg.slug] === undefined) {
      startIdx[cfg.slug] = cfg.new ? 0 : await maxIndex(cfg.slug);
    }
    const paths = await emitProduct(cfg.slug, files, cfg.n, startIdx[cfg.slug]);
    startIdx[cfg.slug] += paths.length;
    (manifest[cfg.slug] ??= { new: !!cfg.new, images: [] }).images.push(...paths);
  }
  for (const cfg of LOOSE) {
    const files = cfg.files.map((f) => path.join(base, f));
    if (startIdx[cfg.slug] === undefined) {
      startIdx[cfg.slug] = cfg.new ? 0 : await maxIndex(cfg.slug);
    }
    const paths = await emitProduct(cfg.slug, files, cfg.n, startIdx[cfg.slug]);
    startIdx[cfg.slug] += paths.length;
    (manifest[cfg.slug] ??= { new: !!cfg.new, images: [] }).images.push(...paths);
  }
  await fs.writeFile(path.join(ROOT, 'scripts/.marketing-manifest.json'), JSON.stringify(manifest, null, 2));
}

async function main() {
  await doHeroes();
  await doBags();
  await doFactory();
  await doProducts();
  console.log(report.join('\n'));
  console.log(`\nDONE — ${report.length} assets. Manifest: scripts/.marketing-manifest.json`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
