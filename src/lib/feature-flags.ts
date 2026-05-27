/**
 * Feature flags resolved at build time from ENV.
 * Pages hidden via NEXT_PUBLIC_HIDDEN_PAGES return 404 + are dropped from sitemap + nav.
 */

export type RouteId = 'home' | 'about' | 'catalog' | 'news' | 'markets' | 'contact';

export function getHiddenPages(): ReadonlySet<RouteId> {
  const env = process.env.NEXT_PUBLIC_HIDDEN_PAGES ?? '';
  return new Set(env.split(',').map((s) => s.trim()).filter(Boolean) as RouteId[]);
}

export function isRouteHidden(route: RouteId): boolean {
  return getHiddenPages().has(route);
}

/** Opt-in flags (default OFF). */
export const SEARCH_ENABLED = process.env.NEXT_PUBLIC_SEARCH_ENABLED === 'true';
export const NEWSLETTER_ENABLED = process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED === 'true';

/** Opt-out flag (default ON for PDPL transparency — only off if explicitly disabled). */
export const COOKIE_BANNER_ENABLED = process.env.NEXT_PUBLIC_COOKIE_BANNER_ENABLED !== 'false';
