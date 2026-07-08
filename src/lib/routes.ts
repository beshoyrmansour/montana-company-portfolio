/**
 * Single source of truth for the site's localized routes.
 *
 * `sitemap.ts` builds its <url> entries from these tables, and
 * `scripts/check-routes.ts` (a prebuild step) cross-checks them against the
 * actual `src/app/[locale]` page files — so adding or removing a page without
 * updating the sitemap fails the build instead of silently shipping a stale map.
 *
 * Paths are relative to `/{locale}` and start with `/` (the locale home is '').
 */
import type { RouteId } from '@/lib/feature-flags';

export interface StaticRoute {
  /** Path under `/{locale}` — '' is the locale home, others start with '/'. */
  path: string;
  /** Feature-flag id, when the page can be hidden via NEXT_PUBLIC_HIDDEN_PAGES. */
  route?: RouteId;
}

/** Every static (non-parameterized) page that should appear in the sitemap. */
export const STATIC_ROUTES: readonly StaticRoute[] = [
  { path: '' },
  { path: '/about', route: 'about' },
  { path: '/catalog', route: 'catalog' },
  { path: '/news', route: 'news' },
  { path: '/markets', route: 'markets' },
  { path: '/contact', route: 'contact' },
  { path: '/privacy' },
  { path: '/terms' },
  { path: '/cookies' },
];

/**
 * Dynamic ([slug]) routes whose URLs the sitemap enumerates from content.
 * Listed here so the route check knows they're handled — a NEW dynamic route
 * not in this set means the sitemap is missing a whole URL family.
 */
export const DYNAMIC_ROUTES: readonly string[] = [
  '/catalog/[slug]',
  '/news/[slug]',
  '/export/[country-slug]',
];
