import { getRequestConfig } from 'next-intl/server';
import { isLocaleAvailable, defaultLocale } from '@/lib/i18n';

/**
 * Per-request locale + messages resolver for next-intl (v4).
 * Called from the locale layout's call to getMessages().
 *
 * v4 requires returning `locale` explicitly, which we do below.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocaleAvailable(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
