/**
 * One-off: give every catalog card a real FOOD cover (never a bag/packshot).
 *
 * For each product, crops the chosen real food photo to the card's 4:5 frame
 * (sharp attention-crop) into public/images/products/cards/<slug>.jpg, then sets
 * that as images.primary. The previous primary (AI packshot / bag) is preserved
 * in images.gallery so it still shows on the product detail page.
 *
 * Review thumbs: /tmp/mt/card-<slug>.jpg.  Run: node scripts/crop-product-cards.mjs
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');
const CARD_DIR = path.join(PUB, 'images/products/cards');
const THUMB = '/tmp/mt';

// slug -> source food photo (relative to /public) to crop for the card cover
const SOURCES = {
  okra: '/images/products/real/okra-4.jpg',
  artichoke: '/images/products/real/artichoke-6.jpg',
  'broad-beans': '/images/products/real/broad-beans-4.jpg',
  broccoli: '/images/products/real/broccoli-4.jpg',
  carrots: '/images/products/real/carrots-4.jpg',
  cauliflower: '/images/products/real/cauliflower-3.jpg',
  colcasia: '/images/products/real/colcasia-5.jpg',
  coriander: '/images/products/real/coriander-4.jpg',
  'green-beans': '/images/products/real/green-beans-4.jpg',
  mango: '/images/products/real/mango-5.jpg',
  'mixed-vegetables': '/images/products/real/mixed-vegetables-4.jpg',
  molokhia: '/images/products/real/molokhia-4.jpg',
  mushroom: '/images/products/real/mushroom-2.jpg',
  'peas-and-carrots': '/images/products/real/peas-and-carrots-3.jpg',
  peas: '/images/products/real/peas-4.jpg',
  spinach: '/images/products/real/spinach-4.jpg',
  strawberry: '/images/products/real/strawberry-4.jpg',
  'sweet-corn': '/images/products/real/sweet-corn-4.jpg',
  'vine-leaves': '/images/products/real/vine-leaves-5.jpg',
  falafel: '/images/products/real/falafel-5.jpg',
  pomegranate: '/images/products/real/pomegranate-1.jpg',
  potato: '/images/products/real/potato-1.jpg',
  'peeled-broad-beans': '/images/products/real/peeled-broad-beans-1.jpg',
  'whole-green-beans': '/images/products/real/whole-green-beans-1.jpg',
  'sweet-corn-cob': '/images/products/real/sweet-corn-cob-1.jpg',
  'vegetable-soup': '/images/products/real/vegetable-soup-1.jpg',
};

const W = 1000;
const H = 1250; // 4:5 portrait

// per-slug crop position override (default 'attention'); 'centre' for spreads
// that the entropy crop zooms into too tightly.
const POSITION = {
  artichoke: 'centre',
};

async function main() {
  await fs.mkdir(CARD_DIR, { recursive: true });
  await fs.mkdir(THUMB, { recursive: true });
  const report = [];
  for (const [slug, src] of Object.entries(SOURCES)) {
    const srcAbs = path.join(PUB, src);
    const cardRel = `/images/products/cards/${slug}.jpg`;
    const cardAbs = path.join(PUB, cardRel);
    try {
      await fs.access(srcAbs);
    } catch {
      report.push(`MISSING SOURCE ${slug}: ${src}`);
      continue;
    }
    await sharp(srcAbs)
      .rotate()
      .resize({ width: W, height: H, fit: 'cover', position: POSITION[slug] ?? 'attention' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(cardAbs);
    await sharp(cardAbs).resize({ width: 360 }).jpeg({ quality: 62 }).toFile(path.join(THUMB, `card-${slug}.jpg`));

    // rewire JSON: primary -> card crop; preserve old primary in gallery
    const file = path.join(ROOT, 'content/products', `${slug}.json`);
    const product = JSON.parse(await fs.readFile(file, 'utf-8'));
    const old = product.images.primary;
    if (old && old !== cardRel && !product.images.gallery.includes(old)) {
      product.images.gallery.push(old);
    }
    product.images.primary = cardRel;
    await fs.writeFile(file, JSON.stringify(product, null, 2) + '\n', 'utf-8');
    report.push(`${slug}: cover <= ${path.basename(src)}  (old primary ${path.basename(old)} kept in gallery)`);
  }
  console.log(report.join('\n'));
  console.log(`\nDONE — ${Object.keys(SOURCES).length} cards.`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
