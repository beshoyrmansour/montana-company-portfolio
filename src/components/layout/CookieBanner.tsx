import { getTranslations } from 'next-intl/server';
import { COOKIE_BANNER_ENABLED } from '@/lib/feature-flags';
import type { Locale } from '@/lib/i18n';

interface CookieBannerProps {
  locale: Locale;
}

/**
 * Renders an EMPTY placeholder div with data-* attrs for translation strings.
 * The actual banner is created by /cookie-banner.js (vanilla JS, 1.5kB minified).
 *
 * This keeps Tier-1 pages free of React-component JS — see spec 20 § Page rendering tiers.
 */
export async function CookieBanner({ locale }: CookieBannerProps) {
  if (!COOKIE_BANNER_ENABLED) return null;
  const t = await getTranslations({ locale, namespace: 'cookie' });

  return (
    <>
      <div
        id="cookie-banner"
        data-title={t('title')}
        data-body={t('body')}
        data-accept={t('accept')}
        data-reject={t('reject')}
        data-learn-more={t('learnMore')}
        data-privacy-href={`/${locale}/privacy`}
        hidden
      />
      <script src="/cookie-banner.js" defer />
    </>
  );
}
