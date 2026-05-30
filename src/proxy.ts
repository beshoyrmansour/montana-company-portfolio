import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, getAvailableLocales, type Locale } from '@/lib/i18n';

/**
 * Resolve the visitor's preferred locale from the Accept-Language header,
 * limited to locales we actually publish. Falls back to defaultLocale.
 *
 * Parses quality values so e.g. "fr-CA,fr;q=0.9,en;q=0.7" prefers fr.
 */
function resolvePreferredLocale(req: NextRequest): Locale {
  const available = getAvailableLocales();
  const header = req.headers.get('accept-language');
  if (!header) return defaultLocale;

  const ranked = header
    .split(',')
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(';');
      const tag = (rawTag ?? '').trim().toLowerCase();
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? parseFloat(qParam.split('=')[1] ?? '1') : 1;
      return { tag, q: Number.isFinite(q) ? q : 0 };
    })
    .filter((e) => e.tag && e.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const primary = tag.split('-')[0];
    const match = available.find((l) => l === primary);
    if (match) return match;
  }
  return defaultLocale;
}

export function proxy(req: NextRequest) {
  const locale = resolvePreferredLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ['/'],
};
