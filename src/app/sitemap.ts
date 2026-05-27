import type { MetadataRoute } from 'next';
import { getAvailableLocales } from '@/lib/i18n';
import { getAllProductSlugs, getAllNewsSlugs } from '@/lib/content';
import { getHiddenPages, type RouteId } from '@/lib/feature-flags';

export const dynamic = 'error';

interface StaticPath {
  path: string;
  route?: RouteId;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://montanaeg.com').replace(/\/$/, '');
  const locales = getAvailableLocales();
  const hidden = getHiddenPages();

  const staticPaths: StaticPath[] = [
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

  const products = await getAllProductSlugs();
  const news = await getAllNewsSlugs();
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
      for (const slug of news) {
        entries.push({
          url: `${base}/${locale}/news/${slug}`,
          changeFrequency: 'yearly',
          priority: 0.6,
          alternates: {
            languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}/news/${slug}`])),
          },
        });
      }
    }
  }

  return entries;
}
