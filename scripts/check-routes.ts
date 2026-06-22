/**
 * Cross-checks the sitemap's route tables (@/lib/routes) against the actual
 * page files under src/app/[locale]. Runs as `npm run routes:check` and as a
 * prebuild step, so the sitemap can never silently fall out of sync with the
 * real routes. Exit code 1 on any drift.
 *
 *   • a static page on disk that's missing from STATIC_ROUTES  → sitemap omits it
 *   • a STATIC_ROUTES entry with no page on disk               → sitemap lists a 404
 *   • a NEW dynamic ([slug]) route not in DYNAMIC_ROUTES       → whole URL family missing
 */
import { promises as fs } from 'fs';
import path from 'path';
import { STATIC_ROUTES, DYNAMIC_ROUTES } from '../src/lib/routes';

const LOCALE_DIR = path.join(process.cwd(), 'src', 'app', '[locale]');

/** Walk the [locale] tree and return every route path that has a page.tsx. */
async function findPageRoutes(dir: string, prefix = ''): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const routes: string[] = [];
  if (entries.some((e) => e.isFile() && /^page\.(tsx|ts|jsx|js)$/.test(e.name))) {
    routes.push(prefix);
  }
  for (const entry of entries) {
    // Route groups `(group)` don't add a URL segment; everything else does.
    if (!entry.isDirectory()) continue;
    const isGroup = entry.name.startsWith('(') && entry.name.endsWith(')');
    const childPrefix = isGroup ? prefix : `${prefix}/${entry.name}`;
    routes.push(...(await findPageRoutes(path.join(dir, entry.name), childPrefix)));
  }
  return routes;
}

async function main() {
  console.log('Checking sitemap route tables against src/app/[locale]...\n');

  const onDisk = await findPageRoutes(LOCALE_DIR);
  const isDynamic = (p: string) => p.includes('[');

  const diskStatic = new Set(onDisk.filter((p) => !isDynamic(p)));
  const diskDynamic = new Set(onDisk.filter(isDynamic));
  const tableStatic = new Set(STATIC_ROUTES.map((r) => r.path));
  const tableDynamic = new Set(DYNAMIC_ROUTES);

  const problems: string[] = [];

  for (const p of diskStatic) {
    if (!tableStatic.has(p)) {
      problems.push(
        `Missing from STATIC_ROUTES: "${p || '(home)'}" — page exists but won't be in the sitemap.`,
      );
    }
  }
  for (const p of tableStatic) {
    if (!diskStatic.has(p)) {
      problems.push(
        `Stale STATIC_ROUTES entry: "${p || '(home)'}" — listed in the sitemap but no page on disk.`,
      );
    }
  }
  for (const p of diskDynamic) {
    if (!tableDynamic.has(p)) {
      problems.push(
        `Unhandled dynamic route: "${p}" — add it to DYNAMIC_ROUTES and emit its URLs in sitemap.ts.`,
      );
    }
  }
  for (const p of tableDynamic) {
    if (!diskDynamic.has(p)) {
      problems.push(`Stale DYNAMIC_ROUTES entry: "${p}" — no matching [slug] route on disk.`);
    }
  }

  if (problems.length > 0) {
    console.error('❌ Sitemap routes are out of sync:\n');
    for (const msg of problems) console.error(`    • ${msg}`);
    console.error('\nUpdate src/lib/routes.ts (and sitemap.ts for new dynamic routes) to match.');
    process.exit(1);
  }

  console.log(
    `✅ ${diskStatic.size} static + ${diskDynamic.size} dynamic route(s) match the sitemap tables`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
