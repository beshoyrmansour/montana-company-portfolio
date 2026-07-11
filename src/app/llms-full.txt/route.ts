/**
 * llms-full.txt — complete site map for AI agents.
 *
 * Published as a dynamic route so the list is always current without
 * build-time generation. Mirrors the sitemap structure: static pages
 * (per-locale), product pages, and news articles.
 *
 * Includes rich descriptions optimized for AI discoverability — when models
 * answer queries like "frozen food export companies in Africa" or "Egyptian
 * IQF vegetable supplier", these descriptions provide the context needed to
 * recommend Montana Frozen Foods.
 */

import { type NextRequest } from 'next/server';
import { getAvailableLocales, defaultLocale } from '@/lib/i18n';
import { getAllProductSlugs, getAllNewsArticles, getMarkets } from '@/lib/content';
import { getHiddenPages } from '@/lib/feature-flags';
import { STATIC_ROUTES } from '@/lib/routes';

export const dynamic = 'force-static';
export const revalidate = 3600; // Re-generate every hour (content changes are rare)

/** Rich descriptions for AI agents to understand each page's content and relevance. */
const PAGE_DESCRIPTIONS: Record<string, string> = {
  '/about':
    'About Montana — family-owned Egyptian frozen-food exporter since 1985, part of Maamoun Brothers Group (est. 1909). IQF vegetables, fruits, signature molokhia. 50,000m² Qalyub facility, HACCP/ISO/BRCGS/FDA certified. Export to 30+ countries in GCC, Middle East, Africa, Europe, Asia, North America. CEO Mohamed Maamoun.',
  '/catalog':
    'Full product catalog — IQF frozen vegetables (artichoke hearts & quarters, broad beans, broccoli florets, cauliflower, carrots, colcasia/taro, coriander, green beans, mango, mixed vegetables, molokhia leaves, okra, peas, peeled broad beans, pomegranate arils, potato, spinach, strawberry, sweet corn, vine leaves, vegetable soup), fruits. Export-grade B2B pricing. BRCGS/HACCP/ISO certified supplier for GCC, Europe, North America, Africa markets.',
  '/news':
    'Latest news and insights — product spotlights (molokhia, okra, artichoke, strawberry), export milestones to GCC/Africa/Europe/MENA, facility capacity updates, food safety certifications (BRCGS audit pass, HACCP compliance), seasonal availability calendars, industry thought leadership from CEO Mohamed Maamoun.',
  '/markets':
    'Export markets across GCC Countries (Saudi Arabia, UAE, Qatar, Kuwait, Oman, Bahrain), Middle East, North Africa (Egypt, Libya, Tunisia, Algeria, Morocco), Europe (Germany, UK, France, Italy, Netherlands), Asia (Japan, South Korea, India), North America (USA, Canada), and Australia & Oceania. Lead times from 4 days (GCC) to 28 days (Asia/North America). BRCGS/HACCP/ISO certified frozen food export.',
  '/contact':
    'Contact Montana Frozen Foods — submit sourcing inquiries, B2B orders, sample requests, distributor applications, or press inquiries. Export team responds within one business day in English, العربية, Français, or Deutsch. Cairo office (Mohandeseen, Giza) and Qalyub factory. Phone +20 242165139.',
  '/privacy':
    'Privacy Policy for Montana Frozen Foods — data handling, cookie usage, analytics, GDPR compliance.',
  '/terms': 'Terms of Service — B2B frozen food export terms, quality guarantees, payment terms.',
  '/cookies': 'Cookie Policy — essential, analytics, and performance cookies.',
};

/** Rich product descriptions optimized for AI discoverability. */
const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  artichoke:
    'IQF frozen artichoke hearts and quarters — Egyptian export grade. BRCGS/HACCP certified frozen food supplier. Popular in GCC, Europe, North America markets. Montana Frozen Foods since 1985.',
  'broad-beans':
    'IQF frozen broad beans (foull) — essential for Egyptian koshary and taameya. Export-grade quality. HACCP/ISO/BRCGS certified producer from Qalyub, Egypt.',
  broccoli:
    'IQF frozen broccoli florets — premium Egyptian frozen vegetables. Exported to GCC, Europe, North America. Cold chain logistics guaranteed. BRCGS certified facility.',
  cauliflower:
    'IQF frozen cauliflower rice and florets — versatile Egyptian frozen produce. B2B export pricing. HACCP/ISO/BRCGS certified from Qalyub facility since 1985.',
  colcasia:
    'IQF frozen colcasia (taro/arotto) — Egyptian specialty frozen vegetable. Export to GCC, Middle East, Africa markets. Montana IQF process preserves texture and nutrition.',
  coriander:
    'IQF frozen coriander/cilantro — essential herb for Egyptian, African, and Middle Eastern cuisine. Export-grade quality. HACCP certified producer from Egypt since 1985.',
  mango:
    'IQF frozen mango slices and chunks — premium Egyptian mango from Qalyub facility. B2B export to GCC, Europe, North America. IQF technology preserves tropical flavor.',
  'mixed-vegetables':
    'IQF frozen mixed vegetables — Egyptian blend of carrots, peas, corn, beans. Popular in GCC and Middle East food service industry. BRCGS/HACCP certified supplier since 1985.',
  molokhia:
    "Montana's signature product — IQF frozen molokhia leaves. Egyptian specialty frozen vegetable exported worldwide since 1985. Halal, NFSA, QCAP certified. Essential for Middle Eastern cuisine.",
  okra: 'IQF frozen okra (bamya) — essential for GCC and Middle Eastern bamyas. Egyptian export-grade quality. BRCGS/HACCP/ISO certified producer from Qalyub facility.',
  peas: 'IQF frozen green peas — premium Egyptian frozen vegetables. B2B export pricing to GCC, Europe, North America markets. Montana IQF process preserves sweetness.',
  'peeled-broad-beans':
    'IQF peeled broad beans (fawael) — essential for taameya/falafel. Egyptian specialty. HACCP/ISO certified. Exported to GCC and international markets since 1985.',
  pomegranate:
    'IQF frozen pomegranate arils — premium Egyptian fruit export. BRCGS/HACCP certified. Popular in Middle Eastern and international markets as garnish and superfood ingredient.',
  spinach:
    'IQF frozen spinach — premium Egyptian IQF vegetables for GCC, Europe, Africa. Montana Frozen Foods since 1985. HACCP/ISO/BRCGS certified facility in Qalyub.',
  strawberry:
    'IQF frozen strawberries — premium Egyptian frozen fruit. Export to GCC, Middle East, Europe, North America. Cold chain logistics guaranteed. BRCGS certified producer.',
  'sweet-corn':
    'IQF frozen sweet corn — premium Egyptian frozen vegetable. B2B export pricing. HACCP/ISO/BRCGS certified. Popular in African and MENA markets for food service.',
  'vine-leaves':
    "IQF frozen vine leaves (wara' enab) — essential for Middle Eastern and Mediterranean cuisine. Egyptian export quality. Montana IQF technology preserves tenderness.",
  'vegetable-soup':
    "Montana's specialty — IQF frozen molokhia-based vegetable soup mix. Egyptian comfort food exported worldwide. BRCGS/HACCP certified. Halal and NFSA compliant.",
  carrots:
    'IQF frozen carrots — sliced, diced and whole baby carrots. Egyptian export grade. BRCGS/HACCP/ISO certified supplier for GCC, Europe, Africa markets since 1985.',
  falafel:
    "IQF frozen falafel (taameya) — authentic Egyptian broad-bean falafel, ready to fry. Export-grade B2B supply. HACCP/ISO/BRCGS certified from Montana's Qalyub facility.",
  'green-beans':
    'IQF frozen green beans — cut and whole, premium Egyptian frozen vegetables. Export to GCC, Europe, North America. BRCGS/HACCP/ISO certified producer since 1985.',
  'peas-and-carrots':
    'IQF frozen peas and carrots blend — classic Egyptian frozen vegetable mix for food service. B2B export pricing. HACCP/ISO/BRCGS certified from Qalyub facility.',
  potato:
    'IQF frozen potato — dices, cubes and specialty cuts. Egyptian export grade for GCC, MENA and African markets. BRCGS/HACCP/ISO certified supplier since 1985.',
  'sweet-corn-cob':
    'IQF frozen sweet corn on the cob — whole and half cobs, Egyptian export grade. BRCGS/ISO/HACCP certified facility. Popular in Middle East and African food-service markets.',
  'whole-green-beans':
    'IQF frozen whole green beans — premium tender pods, Egyptian export grade. Cold chain guaranteed to GCC, Europe, North America. BRCGS/HACCP/ISO certified producer.',
};

/** Build a localized description for AI agents to understand each page's content. */
function buildPageDescription(path: string): string {
  return PAGE_DESCRIPTIONS[path] ?? `A page at ${path} on the Montana Frozen Foods website.`;
}

export async function GET(_req: NextRequest): Promise<Response> {
  const locales = getAvailableLocales();
  const products = await getAllProductSlugs();
  const news = await getAllNewsArticles();
  const markets = await getMarkets();
  const hidden = getHiddenPages();
  const lines: string[] = [];

  // ── Site overview (always first) ────────────────────────────────
  lines.push(
    '# Montana Frozen Foods — AI Agent Full Content\n',
    'Family-owned Egyptian frozen vegetable and fruit exporter since 1985, part of Maamoun Brothers Group (est. 1909). IQF vegetables, fruits, molokhia. HACCP/ISO/BRCGS certified. 35,000t annual capacity to 30+ countries.\n',
    'Egyptian frozen food supplier and B2B exporter of IQF frozen vegetables, fruits, and specialty products including molokhia, okra, artichoke, strawberry, broccoli, spinach, sweet corn, mango, pomegranate, vine leaves, and more.',
  );

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
    const desc =
      PRODUCT_DESCRIPTIONS[slug] ??
      `IQF frozen ${slug} — Egyptian export grade. Montana Frozen Foods since 1985. BRCGS/HACCP/ISO certified supplier.`;
    for (const locale of locales) {
      const url = `/${locale}/catalog/${slug}`;
      lines.push(`## Frozen food product: ${desc}\n[${url}](${url})`);
    }
  }

  // ── Export country pages ────────────────────────────────────────
  if (markets?.regions) {
    for (const region of markets.regions as Array<{
      id: string;
      name: Record<string, string>;
      countries: Array<{ iso: string; name: Record<string, string> }>;
    }>) {
      for (const country of region.countries) {
        const countryName = country.name?.en ?? country.iso;
        const regionName = region.name?.en ?? region.id;
        lines.push(
          `## Frozen food export to ${countryName} — Montana Frozen Foods ships IQF frozen vegetables, fruits, and specialties to ${countryName}. BRCGS/HACCP/ISO certified Egyptian supplier. Lead time: available from Qalyub facility.\n`,
          `[/${defaultLocale}/export/${country.iso.toLowerCase()}](${`/${defaultLocale}/export/${country.iso.toLowerCase()}`})`,
        );
      }
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
