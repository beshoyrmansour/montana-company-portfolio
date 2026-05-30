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
    'Montana Frozen Foods, Egypt. Available in English, العربية, and Français.',
  alternates: {
    languages: {
      en: '/en',
      ar: '/ar',
      fr: '/fr',
      'x-default': `/${defaultLocale}`,
    },
  },
};

export default function RootLandingPage() {
  const available = getAvailableLocales();

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-8">
      <main className="max-w-2xl text-center">
        <h1 className="mb-2 text-display-xl font-bold text-brand-primary">Montana</h1>
        <p className="mb-6 text-body-lg text-text-muted">Redirecting to your language…</p>
        <nav aria-label="Choose language" className="flex flex-wrap items-center justify-center gap-4">
          {available.map((l) => (
            <Link
              key={l}
              href={`/${l}`}
              hrefLang={l}
              className="rounded-lg border border-border-default px-4 py-2 text-body-md font-medium text-text-default transition-colors hover:bg-surface-muted"
            >
              {localeLabels[l].native}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
