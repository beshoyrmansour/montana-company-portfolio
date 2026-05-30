/**
 * One-off: curate + optimize Montana Quality-Team product photos.
 *
 * READS the large archive under public/images/QualityTeamProductsPhotos/Photo Products/,
 * picks a few strong finished-product shots per product, resizes them with sharp,
 * and WRITES optimized JPEGs to public/images/products/real/<slug>-N.jpg.
 *
 * This script ONLY reads the archive and writes new files. It deletes nothing.
 * Run: node scripts/curate-quality-photos.mjs
 * Output manifest: scripts/.curate-manifest.json (git-ignored scratch)
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARCHIVE = path.join(ROOT, 'public/images/QualityTeamProductsPhotos/Photo Products');
const OUT_DIR = path.join(ROOT, 'public/images/products/real');

// slug -> { sources: [folders relative to ARCHIVE], n: count to ship, isNew? }
const MAP = {
  // ── existing products (photos appended to gallery) ──
  strawberry: { sources: ['فراولة/2025/2025', 'فراولة/2025'], n: 3 },
  molokhia: { sources: ['ملوخية', 'ملوخية ورق'], n: 3 },
  spinach: { sources: ['سبانخ موسم 2015'], n: 3 },
  'vine-leaves': { sources: ['ورق عنب مجمد'], n: 3 },
  artichoke: { sources: ['خرشوف'], n: 3 },
  colcasia: { sources: ['قلقاس'], n: 2 },
  'broad-beans': { sources: ['فول'], n: 3 },
  broccoli: { sources: ['بروكلى'], n: 3 },
  carrots: { sources: ['جزر مكعبات'], n: 3 },
  cauliflower: { sources: ['قرنبيط'], n: 2 },
  'green-beans': { sources: ['فاصوليا'], n: 3 },
  'mixed-vegetables': { sources: ['مشكل بطاطس', 'ميكسات مع فلفل وبصل'], n: 3 },
  okra: { sources: ['Okra/2024', 'Okra/Okra no 2'], n: 3 },
  peas: { sources: ['بسلة مصرى'], n: 3 },
  'peas-and-carrots': { sources: ['بالجزر'], n: 2 },
  'sweet-corn': { sources: ['ذرة حب/2024', 'ذرة حب'], n: 3 },
  // ── new products ──
  falafel: { sources: ['فلافل قطع'], n: 4, isNew: true },
  mango: { sources: ['مانجو'], n: 4, isNew: true },
  mushroom: { sources: ['ماشروم'], n: 3, isNew: true },
  coriander: { sources: ['كزبرة'], n: 3, isNew: true },
};

const IMG_RE = /\.jpe?g$/i;
// drop obvious raw-material / off-topic / non-final frames
const SKIP_RE =
  /(raw\s*material|rawmaterial|fresh|بركس|بيكلز|بيوريه|بالسكر|specification|مذكرة|حمص)/i;

async function walk(dir) {
  let out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(await walk(full));
    else if (IMG_RE.test(e.name)) out.push(full);
  }
  return out;
}

async function pickFor(cfg) {
  let files = [];
  for (const s of cfg.sources) files = files.concat(await walk(path.join(ARCHIVE, s)));
  // de-dup
  files = [...new Set(files)];
  let pref = files.filter((f) => !SKIP_RE.test(f));
  if (pref.length < cfg.n) pref = files;
  const withSize = await Promise.all(pref.map(async (f) => ({ f, size: (await fs.stat(f)).size })));
  withSize.sort((a, b) => b.size - a.size);
  // spread picks across the top half so we don't grab N near-identical burst frames
  const pool = withSize.slice(0, Math.max(cfg.n, Math.ceil(withSize.length / 2)));
  const step = Math.max(1, Math.floor(pool.length / cfg.n));
  const picks = [];
  for (let i = 0; i < pool.length && picks.length < cfg.n; i += step) picks.push(pool[i].f);
  for (const w of withSize) {
    if (picks.length >= cfg.n) break;
    if (!picks.includes(w.f)) picks.push(w.f);
  }
  return picks.slice(0, cfg.n);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const manifest = {};
  const report = [];
  for (const [slug, cfg] of Object.entries(MAP)) {
    const picks = await pickFor(cfg);
    const webPaths = [];
    let i = 1;
    for (const src of picks) {
      const rel = `/images/products/real/${slug}-${i}.jpg`;
      await sharp(src)
        .rotate()
        .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(path.join(ROOT, 'public', rel));
      webPaths.push(rel);
      report.push(`${rel}  <=  ${path.relative(ARCHIVE, src)}`);
      i++;
    }
    manifest[slug] = { isNew: !!cfg.isNew, images: webPaths };
  }
  await fs.writeFile(
    path.join(ROOT, 'scripts/.curate-manifest.json'),
    JSON.stringify(manifest, null, 2),
  );
  console.log(report.join('\n'));
  console.log(`\nPROCESSED ${Object.keys(manifest).length} products, ${report.length} images`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
