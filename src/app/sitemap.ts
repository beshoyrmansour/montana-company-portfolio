import type { MetadataRoute } from 'next';
import { getAvailableLocales } from '@/lib/i18n';
import { getAllProductSlugs, getAllNewsArticles } from '@/lib/content';
import { getHiddenPages } from '@/lib/feature-flags';
import { STATIC_ROUTES } from '@/lib/routes';
import { BASE_URL } from '@/lib/seo';
import marketsData from '@/content/markets.json';

export const dynamic = 'error';

/** Flatten all countries from the regions structure in markets.json. */
function flattenCountries() {
  const all: Array<{ iso: string; regionId: string }> = [];
  for (const region of (
    marketsData as typeof marketsData & { regions: (typeof marketsData)['regions'] }
  ).regions) {
    for (const country of region.countries) {
      all.push({ iso: country.iso, regionId: region.id });
    }
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Single source of truth for the origin — shared with canonical/OG/JSON-LD via
  // @/lib/seo, so sitemap URLs can never drift onto a different domain.
  const base = BASE_URL;
  const locales = getAvailableLocales();
  const hidden = getHiddenPages();

  // Static route list lives in @/lib/routes and is cross-checked against the
  // app/[locale] page files by scripts/check-routes.ts before every build.
  const staticPaths = STATIC_ROUTES;

  const products = await getAllProductSlugs();
  // Full articles (not just slugs) so we can emit lastModified from their dates.
  const news = await getAllNewsArticles();
  const countries = flattenCountries();
  const entries: MetadataRoute.Sitemap = [];

  // Root landing page
  entries.push({
    url: base + '/',
    changeFrequency: 'monthly',
    priority: 0.5,
  });

  for (const locale of locales) {
    for (const { path, route } of staticPaths) {
      if (route && hidden.has(route)) continue;
      entries.push({
        url: `${base}/${locale}${path}`,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1.0 : 0.7,
        alternates: {
          languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${path}`])),
        },
      });
    }
    for (const slug of products) {
      entries.push({
        url: `${base}/${locale}/catalog/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}/catalog/${slug}`])),
        },
      });
    }
    if (!hidden.has('news')) {
      for (const article of news) {
        entries.push({
          url: `${base}/${locale}/news/${article.slug}`,
          // Content-derived date (YYYY-MM-DD) — never Date.now(), so the build
          // stays deterministic under `dynamic = 'error'`.
          lastModified: article.updatedAt ?? article.publishedAt,
          changeFrequency: 'yearly',
          priority: 0.6,
          alternates: {
            languages: Object.fromEntries(
              locales.map((l) => [l, `${base}/${l}/news/${article.slug}`]),
            ),
          },
        });
      }
    }
    // Country export pages — one per country × locale.
    for (const country of countries) {
      const slug = country.iso.toLowerCase();
      entries.push({
        url: `${base}/${locale}/export/${slug}`,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}/export/${slug}`])),
        },
      });
    }
  }

  return entries;
}
