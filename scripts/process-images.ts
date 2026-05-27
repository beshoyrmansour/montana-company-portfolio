/**
 * Image pipeline for static export.
 *
 * Reads any image in _raw/ and emits AVIF + WebP + JPEG variants in public/images/.
 * Replaces Next's runtime image optimizer (disabled for output: 'export').
 *
 * Convention:
 *   _raw/products/molokhia-bowl.jpg  →  public/images/products/molokhia-bowl-{400,600,800}w.{avif,webp,jpg}
 *
 * Run: npm run content:process-images
 *
 * NOTE: This script is a stub for now — implement when raw source images arrive.
 * Currently it just logs what would be processed.
 */
import { promises as fs } from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), '_raw');
const OUT_DIR = path.join(process.cwd(), 'public', 'images');

const CONFIG: Record<string, { widths: number[]; quality: { avif: number; webp: number; jpg: number } }> = {
  products: { widths: [400, 600, 800], quality: { avif: 50, webp: 75, jpg: 78 } },
  heroes: { widths: [640, 1024, 1600, 2400], quality: { avif: 50, webp: 70, jpg: 75 } },
  facility: { widths: [768, 1280, 1600], quality: { avif: 50, webp: 75, jpg: 78 } },
  packaging: { widths: [400, 600, 800], quality: { avif: 50, webp: 75, jpg: 78 } },
};

async function main() {
  try {
    await fs.access(RAW_DIR);
  } catch {
    console.log('No _raw/ directory found — nothing to process.');
    console.log('Place source images at _raw/<category>/<name>.{jpg|png} and re-run.');
    return;
  }

  console.log('Image processing pipeline');
  console.log('=========================');
  console.log(`Source: ${RAW_DIR}`);
  console.log(`Output: ${OUT_DIR}\n`);

  // TODO: when sharp is needed:
  // import sharp from 'sharp';
  // for each file in _raw/<category>/, for each width in CONFIG[category].widths,
  // emit .avif, .webp, .jpg with the configured quality.
  //
  // Pseudo:
  //   const img = sharp(srcPath);
  //   await img.resize({ width }).avif({ quality: cfg.quality.avif }).toFile(out);
  //   await img.resize({ width }).webp({ quality: cfg.quality.webp }).toFile(out);
  //   await img.resize({ width }).jpeg({ quality: cfg.quality.jpg, mozjpeg: true }).toFile(out);

  console.log('Stub — implement sharp processing when raw images arrive.');
  console.log('Categories configured:', Object.keys(CONFIG).join(', '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
