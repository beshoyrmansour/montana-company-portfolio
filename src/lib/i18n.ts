/**
 * Locale configuration. Source of truth for all i18n decisions.
 *
 * NOTE: This site uses output:'export' (static export). next-intl runs
 * without middleware — every page calls setRequestLocale(locale) and
 * exports generateStaticParams that enumerates locales.
 */

export const locales = ['en', 'ar', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale) ?? 'en';

export const rtlLocales: ReadonlyArray<Locale> = ['ar'];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function getDir(locale: Locale): 'rtl' | 'ltr' {
  return isRtl(locale) ? 'rtl' : 'ltr';
}

/**
 * Locale display labels for the language switcher.
 * Native script is intentional — Arabic users should see "العربية", not "Arabic".
 */
export const localeLabels: Record<Locale, { native: string; iso: string }> = {
  en: { native: 'English', iso: 'en' },
  ar: { native: 'العربية', iso: 'ar' },
  fr: { native: 'Français', iso: 'fr' },
};

/**
 * Returns the subset of locales currently exposed publicly.
 * Controlled by NEXT_PUBLIC_AVAILABLE_LOCALES (comma-separated).
 */
export function getAvailableLocales(): readonly Locale[] {
  const env = process.env.NEXT_PUBLIC_AVAILABLE_LOCALES;
  if (!env) return locales;
  const set = new Set(env.split(',').map((s) => s.trim()));
  return locales.filter((l) => set.has(l));
}

export function isLocaleAvailable(locale: string): locale is Locale {
  return (getAvailableLocales() as readonly string[]).includes(locale);
}

/**
 * Pick a translated value from an i18n object, falling back to English.
 *   pick({ en: 'Hello', ar: 'مرحبا' }, 'ar')  →  'مرحبا'
 *   pick({ en: 'Hello' }, 'fr')                →  'Hello'
 */
export function pick<T extends string | undefined>(
  field: { en: T; ar?: T; fr?: T } | undefined,
  locale: Locale,
): T | undefined {
  if (!field) return undefined;
  return (field[locale] ?? field.en) as T;
}
