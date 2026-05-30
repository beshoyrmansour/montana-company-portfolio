import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getAvailableLocales, getDir, isLocaleAvailable, type Locale } from '@/lib/i18n';
import { HtmlLangDir } from '@/components/layout/HtmlLangDir';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { ThemeGreeting } from '@/components/layout/ThemeGreeting';
import { HeaderGarland, CornerOrnament, ThemeAtmosphere } from '@/components/decoration/Ornaments';
import { JsonLd } from '@/components/seo/JsonLd';
import { getSite } from '@/lib/content';
import { getActiveTheme } from '@/lib/theme';
import { organizationJsonLd } from '@/lib/seo';

export const dynamic = 'error';
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAvailableLocales().map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocaleAvailable(locale)) notFound();

  setRequestLocale(locale);
  const [messages, site] = await Promise.all([getMessages(), getSite()]);
  const dir = getDir(locale as Locale);
  const theme = getActiveTheme();

  return (
    <>
      {/* Inline script — sets html lang+dir before React hydrates.
          Runs synchronously while initial HTML is still parsing. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var d=document.documentElement;d.lang='${locale}';d.dir='${dir}';})();`,
        }}
      />
      {/* Organization JSON-LD — emitted on every page */}
      <JsonLd data={organizationJsonLd(site, locale as Locale)} />
      <NextIntlClientProvider messages={messages} locale={locale}>
        <HtmlLangDir locale={locale as Locale} />
        <ThemeAtmosphere theme={theme} />
        <CornerOrnament theme={theme} />
        <ThemeGreeting locale={locale as Locale} />
        <Header locale={locale as Locale} />
        <HeaderGarland theme={theme} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale as Locale} />
        <CookieBanner locale={locale as Locale} />
      </NextIntlClientProvider>
    </>
  );
}
