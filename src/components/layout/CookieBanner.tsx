import { getTranslations } from 'next-intl/server';
import { COOKIE_BANNER_ENABLED } from '@/lib/feature-flags';
import type { Locale } from '@/lib/i18n';

interface CookieBannerProps {
  locale: Locale;
}

/**
 * Renders an EMPTY placeholder div with data-* attrs for translation strings.
 * The actual banner is created by /cookie-banner.js (vanilla JS, ~2kB minified).
 *
 * This keeps Tier-1 pages free of React-component JS — see spec 20 § Page rendering tiers.
 *
 * GDPR/PDPL note: the always-on traffic analytics is Vercel Web Analytics
 * (cookieless, no stored IP — rendered via <Analytics/> in the root layout) and
 * is not governed by this banner. The OPTIONAL Plausible config below is handed
 * to the banner script, which injects the Plausible tag only after the visitor
 * clicks "Accept"; declining (or never choosing) loads no Plausible at all —
 * see /cookie-banner.js.
 */
export async function CookieBanner({ locale }: CookieBannerProps) {
  if (!COOKIE_BANNER_ENABLED) return null;
  const t = await getTranslations({ locale, namespace: 'cookie' });

  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? '';
  const plausibleSrc =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL ?? 'https://plausible.io/js/script.js';

  return (
    <>
      <div
        id="cookie-banner"
        data-title={t('title')}
        data-body={t('body')}
        data-accept={t('accept')}
        data-reject={t('reject')}
        data-learn-more={t('learnMore')}
        data-cookie-policy={t('cookiePolicy')}
        data-privacy-href={`/${locale}/privacy`}
        data-cookies-href={`/${locale}/cookies`}
        data-plausible-domain={plausibleDomain}
        data-plausible-src={plausibleSrc}
        hidden
      />
      <script src="/cookie-banner.js" defer />
    </>
  );
}
