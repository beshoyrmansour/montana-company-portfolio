import { getRequestConfig } from 'next-intl/server';
import { isLocaleAvailable, defaultLocale } from '@/lib/i18n';

/**
 * Per-request locale + messages resolver for next-intl.
 * Called from the root layout's call to getMessages().
 *
 * Note: This is the next-intl 3.x signature. v4 requires returning `locale` explicitly.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocaleAvailable(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
