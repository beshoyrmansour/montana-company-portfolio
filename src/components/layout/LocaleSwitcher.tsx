import Link from 'next/link';
import { getAvailableLocales, localeLabels, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/cn';

interface LocaleSwitcherProps {
  currentLocale: Locale;
  /** The current pathname WITHOUT the locale prefix (e.g. '/catalog/molokhia'). */
  pathname?: string;
  className?: string;
}

/**
 * Vertical list of language links. Used inside a Globe dropdown (desktop) and
 * inside the mobile menu sheet — both contexts want a stacked menu, not pills.
 * No JS — switches via URL; soft-nav via Next.js Link prefetch.
 */
export function LocaleSwitcher({ currentLocale, pathname = '', className }: LocaleSwitcherProps) {
  const available = getAvailableLocales();
  if (available.length < 2) return null;

  return (
    <nav aria-label="Language" className={cn('flex flex-col gap-0.5', className)}>
      {available.map((locale) => {
        const isActive = locale === currentLocale;
        const label = localeLabels[locale];
        return (
          <Link
            key={locale}
            href={`/${locale}${pathname}`}
            hrefLang={locale}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'text-body-sm flex items-center justify-between rounded-md px-3 py-2 font-medium transition-colors duration-150',
              isActive
                ? 'bg-brand-primary-subtle text-brand-primary'
                : 'text-text-muted hover:bg-surface-muted hover:text-text',
            )}
          >
            <span>{label.native}</span>
            {isActive && (
              <span aria-hidden className="text-brand-primary text-xs">
                ✓
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
