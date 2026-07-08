/**
 * llms-full.txt — complete site map for AI agents.
 *
 * Published as a dynamic route so the list is always current without
 * build-time generation. Mirrors the sitemap structure: static pages
 * (per-locale), product pages, and news articles.
 *
 * See https://llmstxt.org/ for the llms.txt specification.
 */

import { type NextRequest } from 'next/server';
import { getAvailableLocales, defaultLocale } from '@/lib/i18n';
import { getAllProductSlugs, getAllNewsArticles } from '@/lib/content';
import { getHiddenPages } from '@/lib/feature-flags';
import { STATIC_ROUTES } from '@/lib/routes';

export const dynamic = 'force-static';
export const revalidate = 3600; // Re-generate every hour (content changes are rare)

const PAGE_DESCRIPTIONS: Record<string, string> = {
  '/about':
    'About Montana — family history, facility details, team, certifications, export statistics.',
  '/catalog':
    'Full product catalog — IQF frozen vegetables, fruits, leafy greens, and specialties.',
  '/news': 'Latest news and insights — product spotlights, export milestones, facility updates.',
  '/markets':
    'Export markets across GCC, Middle East, North Africa, Europe, Asia, North America, and Oceania.',
  '/contact':
    'Contact info — submit sourcing inquiries, order requests, sample orders, or press inquiries.',
  '/privacy': 'Privacy Policy.',
  '/terms': 'Terms of Service.',
  '/cookies': 'Cookie Policy.',
};

/** Build a localized description for AI agents to understand each page's content. */
function buildPageDescription(path: string): string {
  return PAGE_DESCRIPTIONS[path] ?? `A page at ${path} on the Montana Frozen Foods website.`;
}

export async function GET(_req: NextRequest): Promise<Response> {
  const locales = getAvailableLocales();
  const products = await getAllProductSlugs();
  const news = await getAllNewsArticles();
  const hidden = getHiddenPages();
  const lines: string[] = [];

  // ── Static pages (one per locale) ────────────────────────────────
  for (const { path: rp, route } of STATIC_ROUTES) {
    if (route && hidden.has(route)) continue;
    for (const locale of locales) {
      const url = `/${locale}${rp === '' ? '' : rp}`;
      const desc = buildPageDescription(rp);
      lines.push(`## ${desc}\n[${url}](${url})`);
    }
  }

  // ── Product detail pages (one per locale × product) ───────────────
  for (const slug of products) {
    for (const locale of locales) {
      const url = `/${locale}/catalog/${slug}`;
      lines.push(`## Frozen food product catalog entry: ${slug}\n[${url}](${url})`);
    }
  }

  // ── News article pages (one per locale × article) ─────────────────
  for (const article of news) {
    const slug = article.slug;
    for (const locale of locales) {
      const url = `/${locale}/news/${slug}`;
      lines.push(`## ${article.title.en} — published ${article.publishedAt}\n[${url}](${url})`);
    }
  }

  return new Response(lines.join('\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
