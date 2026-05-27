/**
 * Validates all JSON content against the zod schemas.
 * Runs as `npm run content:validate` and as a prebuild step.
 * Exit code 1 on any failure.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { siteSchema } from '../src/schemas/site';
import { productSchema } from '../src/schemas/product';
import { newsArticleSchema } from '../src/schemas/news';
import { homePageSchema, aboutPageSchema, contactPageSchema } from '../src/schemas/page';
import { marketsSchema } from '../src/schemas/markets';
import type { z } from 'zod';

const CONTENT_DIR = path.join(process.cwd(), 'content');
let failures = 0;

async function validate<T>(file: string, schema: z.ZodType<T>): Promise<void> {
  const full = path.join(CONTENT_DIR, file);
  let raw: string;
  try {
    raw = await fs.readFile(full, 'utf-8');
  } catch (e) {
    console.error(`✗ ${file}: file not found`);
    failures++;
    return;
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    console.error(`✗ ${file}: invalid JSON — ${(e as Error).message}`);
    failures++;
    return;
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    console.error(`✗ ${file}:`);
    for (const issue of parsed.error.issues) {
      console.error(`    • ${issue.path.join('.') || '<root>'} — ${issue.message}`);
    }
    failures++;
    return;
  }
  console.log(`✓ ${file}`);
}

/**
 * For collections where the filename IS the URL slug (products, news),
 * the JSON's internal `slug` field MUST equal the filename stem.
 * Otherwise generateStaticParams() (filename-based) drifts from Link hrefs
 * (article.slug-based) and the static export build crashes.
 */
async function assertFilenameMatchesSlug(dir: string, filename: string): Promise<void> {
  const stem = filename.replace(/\.json$/, '');
  const raw = await fs.readFile(path.join(dir, filename), 'utf-8');
  const json = JSON.parse(raw) as { slug?: unknown };
  if (typeof json.slug === 'string' && json.slug !== stem) {
    console.error(
      `✗ ${path.relative(CONTENT_DIR, path.join(dir, filename))}: slug "${json.slug}" ≠ filename "${stem}". Rename the file or the slug field.`,
    );
    failures++;
  }
}

async function main() {
  console.log('Validating content against zod schemas...\n');

  await validate('site.json', siteSchema);
  await validate('markets.json', marketsSchema);
  await validate('pages/home.json', homePageSchema);
  await validate('pages/about.json', aboutPageSchema);
  await validate('pages/contact.json', contactPageSchema);

  // Products — filename stem must equal the `slug` field so generateStaticParams
  // (which uses the filename) agrees with every Link href (which uses product.slug).
  const productsDir = path.join(CONTENT_DIR, 'products');
  const productFiles = (await fs.readdir(productsDir)).filter((f) => f.endsWith('.json'));
  for (const f of productFiles) {
    await validate(`products/${f}`, productSchema);
    await assertFilenameMatchesSlug(productsDir, f);
  }

  // News — same filename↔slug rule.
  const newsDir = path.join(CONTENT_DIR, 'news');
  try {
    const newsFiles = (await fs.readdir(newsDir)).filter((f) => f.endsWith('.json'));
    for (const f of newsFiles) {
      await validate(`news/${f}`, newsArticleSchema);
      await assertFilenameMatchesSlug(newsDir, f);
    }
  } catch {
    console.log('  (no news directory yet, skipping)');
  }

  console.log();
  if (failures > 0) {
    console.error(`\n❌ ${failures} content validation failure(s)`);
    process.exit(1);
  }
  console.log('✅ All content validated');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
