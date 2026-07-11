/**
 * Root landing page at /
 *
 * Real visitors never see this — `src/proxy.ts` redirects `/` to the
 * locale matching the Accept-Language header (or `defaultLocale` as fallback).
 * This page exists only as a graceful fallback for clients that bypass
 * the proxy (some crawlers, misconfigured runtimes). It carries hreflang
 * metadata so search engines can still discover each localized variant.
 */
import Link from 'next/link';
import { defaultLocale, getAvailableLocales, localeLabels } from '@/lib/i18n';

export const dynamic = 'error';

export const metadata = {
  title: 'Montana — Frozen Foods',
  description:
    'Montana Frozen Foods, Egypt — Egyptian IQF frozen vegetables, fruits and signature molokhia. Available in English, العربية, Français and Deutsch.',
  alternates: {
    languages: {
      ...Object.fromEntries(getAvailableLocales().map((l) => [l, `/${l}`])),
      'x-default': `/${defaultLocale}`,
    },
  },
};

export default function RootLandingPage() {
  const available = getAvailableLocales();

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-8">
      <main className="max-w-2xl text-center">
        <h1 className="text-display-xl text-brand-primary mb-2 font-bold">Montana</h1>
        <p className="text-body-lg text-text-muted mb-6">Redirecting to your language…</p>
        <nav
          aria-label="Choose language"
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {available.map((l) => (
            <Link
              key={l}
              href={`/${l}`}
              hrefLang={l}
              className="border-border-default text-body-md text-text-default hover:bg-surface-muted rounded-lg border px-4 py-2 font-medium transition-colors"
            >
              {localeLabels[l].native}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
