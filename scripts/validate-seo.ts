/**
 * validate-seo.ts — deterministic SEO / AI-readiness guardrails.
 *
 * Runs as `npm run seo:validate` and as a prebuild step (like content:validate
 * and routes:check), so the structural SEO regressions an audit found can never
 * silently come back. Exit code 1 on any FAILURE; warnings never fail the build.
 *
 * FAIL (block the build):
 *   1. OG-image coverage — every `[locale]` page that relies on the default
 *      opengraph-image route has an `opengraph-image.*` sibling. Otherwise the
 *      page ships a 404 `og:image` / `twitter:image` (broke ~128 export URLs).
 *   2. llms-full product map — every `content/products/*.json` slug has a
 *      PRODUCT_DESCRIPTIONS entry, so AI agents never get a bland generic line.
 *   3. Single origin — only `src/lib/seo.ts` may resolve the site origin
 *      (`NEXT_PUBLIC_SITE_URL`); a second resolver drifts canonical/OG/JSON-LD
 *      apart on Vercel preview builds.
 *
 * WARN (report only):
 *   4. hreflang locale coverage — content i18n fields missing an advertised
 *      locale silently fall back to English while hreflang still advertises them.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { locales, defaultLocale } from '../src/lib/i18n';

const ROOT = process.cwd();
const failures: string[] = [];
const warnings: string[] = [];

const OG_EXTS = ['tsx', 'ts', 'jsx', 'js'];

// ── 1. OG-image coverage ────────────────────────────────────────────────
async function checkOgCoverage(): Promise<void> {
  const localeDir = path.join(ROOT, 'src', 'app', '[locale]');

  async function siblingOgRoute(dir: string): Promise<boolean> {
    for (const ext of OG_EXTS) {
      try {
        await fs.access(path.join(dir, `opengraph-image.${ext}`));
        return true;
      } catch {
        /* keep looking */
      }
    }
    return false;
  }

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const page = entries.find((e) => e.isFile() && /^page\.(tsx|ts|jsx|js)$/.test(e.name));
    if (page) {
      const text = await fs.readFile(path.join(dir, page.name), 'utf8');
      if (text.includes('buildPageMetadata')) {
        const rel = path.relative(ROOT, path.join(dir, page.name)).split(path.sep).join('/');
        const hasOgProp = /\bogImage\s*:/.test(text);
        const hasOgRoute = await siblingOgRoute(dir);
        if (!hasOgProp && !hasOgRoute) {
          failures.push(
            `OG coverage — ${rel}: calls buildPageMetadata with no \`ogImage\` and has no opengraph-image.* sibling, so its default og:image URL 404s. Add an opengraph-image.tsx or pass an explicit ogImage.`,
          );
        } else if (hasOgProp && !hasOgRoute && /ogImage\s*:[^,\n]*\?\./.test(text)) {
          warnings.push(
            `OG coverage — ${rel}: passes an OPTIONAL ogImage (\`?.\`) and has no opengraph-image.* fallback; a null value would 404.`,
          );
        }
      }
    }
    for (const e of entries) {
      if (e.isDirectory()) await walk(path.join(dir, e.name));
    }
  }

  await walk(localeDir);
}

// ── 2. llms-full product map completeness ───────────────────────────────
async function checkLlmsProductMap(): Promise<void> {
  const productsDir = path.join(ROOT, 'content', 'products');
  const slugs = (await fs.readdir(productsDir))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));

  const routeText = await fs.readFile(
    path.join(ROOT, 'src', 'app', 'llms-full.txt', 'route.ts'),
    'utf8',
  );
  const block = routeText.match(/PRODUCT_DESCRIPTIONS[^{]*\{([\s\S]*?)\n\};/);
  if (!block) {
    failures.push(
      'llms-full — could not locate the PRODUCT_DESCRIPTIONS object in src/app/llms-full.txt/route.ts (did its shape change?).',
    );
    return;
  }
  const keyBlock = block[1] ?? '';
  const keys = new Set(
    [...keyBlock.matchAll(/^\s*'?([a-z0-9-]+)'?\s*:/gm)]
      .map((m) => m[1])
      .filter((k): k is string => Boolean(k)),
  );

  for (const slug of slugs) {
    if (!keys.has(slug)) {
      failures.push(
        `llms-full — product "${slug}" has no PRODUCT_DESCRIPTIONS entry, so /llms-full.txt emits a generic fallback line for a real product (weak AI discoverability).`,
      );
    }
  }
  for (const key of keys) {
    if (!slugs.includes(key)) {
      warnings.push(
        `llms-full — PRODUCT_DESCRIPTIONS key "${key}" matches no content/products/*.json (stale entry; its description is never emitted).`,
      );
    }
  }
}

// ── 3. Single origin resolver ───────────────────────────────────────────
async function checkSingleOrigin(): Promise<void> {
  const roots = ['src/app', 'src/lib', 'src/components'];

  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!/\.(ts|tsx|js|jsx)$/.test(e.name)) continue;
      const rel = path.relative(ROOT, full).split(path.sep).join('/');
      if (rel === 'src/lib/seo.ts') continue; // the ONE sanctioned origin resolver
      const text = await fs.readFile(full, 'utf8');
      if (text.includes('NEXT_PUBLIC_SITE_URL')) {
        failures.push(
          `Single origin — ${rel}: references NEXT_PUBLIC_SITE_URL. Resolve the site origin only via BASE_URL in src/lib/seo.ts; a second resolver makes canonical/OG/JSON-LD drift onto a different host on Vercel previews.`,
        );
      }
    }
  }

  for (const r of roots) await walk(path.join(ROOT, r));
}

// ── 4. hreflang locale coverage (WARN) ──────────────────────────────────
function isI18n(o: unknown): o is Record<string, unknown> {
  return (
    typeof o === 'object' &&
    o !== null &&
    !Array.isArray(o) &&
    typeof (o as Record<string, unknown>).en === 'string'
  );
}

async function checkI18nCoverage(): Promise<void> {
  const files: string[] = [];
  for (const sub of ['pages', 'news', 'products']) {
    const d = path.join(ROOT, 'content', sub);
    try {
      for (const f of await fs.readdir(d)) if (f.endsWith('.json')) files.push(path.join(d, f));
    } catch {
      /* dir may not exist */
    }
  }
  for (const f of ['site.json', 'markets.json']) files.push(path.join(ROOT, 'content', f));

  const nonDefault = locales.filter((l) => l !== defaultLocale);
  const totals: Record<string, { present: number; total: number }> = {};
  for (const l of nonDefault) totals[l] = { present: 0, total: 0 };
  const fileGaps: Record<string, number> = {};

  function walk(node: unknown, file: string): void {
    if (Array.isArray(node)) {
      for (const it of node) walk(it, file);
      return;
    }
    if (typeof node === 'object' && node !== null) {
      if (isI18n(node)) {
        for (const l of nonDefault) {
          const t = totals[l];
          if (!t) continue;
          t.total++;
          const v = (node as Record<string, unknown>)[l];
          if (typeof v === 'string' && v.length > 0) t.present++;
          else fileGaps[file] = (fileGaps[file] ?? 0) + 1;
        }
      }
      for (const k of Object.keys(node)) walk((node as Record<string, unknown>)[k], file);
    }
  }

  for (const f of files) {
    try {
      walk(
        JSON.parse(await fs.readFile(f, 'utf8')),
        path.relative(ROOT, f).split(path.sep).join('/'),
      );
    } catch {
      /* skip unreadable/invalid */
    }
  }

  for (const l of nonDefault) {
    const t = totals[l];
    if (!t) continue;
    const { present, total } = t;
    if (total > 0 && present < total) {
      const pct = Math.round((present / total) * 100);
      warnings.push(
        `hreflang coverage — "${l}" translates ${present}/${total} content i18n fields (${pct}%); ${total - present} fall back to "${defaultLocale}" while hreflang still advertises /${l}/.`,
      );
    }
  }
  const top = Object.entries(fileGaps)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  if (top.length > 0) {
    warnings.push(
      'hreflang coverage — most locale gaps by file: ' +
        top.map(([f, n]) => `${f} (${n})`).join(', '),
    );
  }
}

async function main(): Promise<void> {
  console.log('Validating SEO / AI-readiness invariants...\n');

  await checkOgCoverage();
  await checkLlmsProductMap();
  await checkSingleOrigin();
  await checkI18nCoverage();

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`    • ${w}`);
    console.log();
  }

  if (failures.length > 0) {
    console.error(`❌ ${failures.length} SEO validation failure(s):\n`);
    for (const f of failures) console.error(`    • ${f}`);
    console.error(
      '\nFix the above (or run /seo-audit for the full judgment-based review). These are hard SEO defects: 404 share images, weak AI discoverability, or origin drift.',
    );
    process.exit(1);
  }

  console.log('✅ SEO invariants hold (OG coverage, llms product map, single origin).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
