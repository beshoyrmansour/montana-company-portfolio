import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Globe, Phone, Mail } from 'lucide-react';
import { LocaleSwitcher } from './LocaleSwitcher';
import { CloseMenusOnNavigate } from './CloseMenusOnNavigate';
import { Container } from './Container';
import { Logo } from './Logo';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n';
import { isRouteHidden, type RouteId } from '@/lib/feature-flags';
import { getSite } from '@/lib/content';

interface NavItem {
  route: RouteId;
  href: string;
  labelKey: string;
}

const NAV_ITEMS: NavItem[] = [
  { route: 'catalog', href: '/catalog', labelKey: 'catalog' },
  { route: 'about', href: '/about', labelKey: 'about' },
  { route: 'markets', href: '/markets', labelKey: 'markets' },
  { route: 'news', href: '/news', labelKey: 'news' },
  { route: 'contact', href: '/contact', labelKey: 'contact' },
];

interface HeaderProps {
  locale: Locale;
  pathname?: string;
}

/**
 * Editorial site header — sticky, surface-tinted glass, animated nav underlines.
 *
 * Layout: logo (left) · primary nav (center, lg+) · language pill + hamburger (right)
 * The mobile nav opens via pure-CSS <details> to keep this a server component.
 */
export async function Header({ locale, pathname = '' }: HeaderProps) {
  const [t, site] = await Promise.all([getTranslations({ locale, namespace: 'nav' }), getSite()]);
  const visibleNav = NAV_ITEMS.filter((item) => !isRouteHidden(item.route));

  // Primary sales-facing contact: office line.
  const phone: string | undefined = site.contact.office.phones[0];
  const email = site.contact.office.email;
  const phoneHref = phone ? phone.replace(/[^\d+]/g, '') : undefined;

  return (
    <header
      className="sticky top-0 z-20 backdrop-blur-xl"
      style={{
        // Bump opacity from 92% → 96% so snowflakes/stars behind don't bleed through
        // the header band on themed pages.
        background: 'color-mix(in srgb, var(--color-surface) 96%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--color-border) 50%, transparent)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.1)',
        backdropFilter: 'blur(20px) saturate(1.1)',
      }}
    >
      {/* Closes the <details> menus after a client-side route change */}
      <CloseMenusOnNavigate />

      {/* Skip link */}
      <a
        href="#main"
        className="focus:bg-brand-primary focus:text-brand-primary-fg absolute -translate-y-full p-2 focus:relative focus:translate-y-0"
      >
        {t('skipToContent')}
      </a>

      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20 lg:gap-8">
          <Link href={`/${locale}`} aria-label={t('homeAriaLabel')} className="shrink-0">
            <Logo className="h-10 w-auto lg:h-14" decorative />
          </Link>

          {/* Primary nav (desktop) — animated underline matches the design */}
          <nav
            aria-label="Primary"
            className="hidden flex-1 items-center justify-center gap-8 lg:flex"
          >
            {visibleNav.map((item) => (
              <Link
                key={item.route}
                href={`/${locale}${item.href}`}
                className={cn(
                  'text-body-sm text-text relative py-2 font-medium tracking-[0.02em]',
                  'hover:text-brand-primary transition-colors',
                  // animated underline
                  'after:absolute after:start-0 after:bottom-0 after:h-px after:w-full',
                  'after:bg-brand-primary after:origin-[left] after:scale-x-0',
                  'after:transition-transform after:duration-[var(--duration-base)] after:ease-[var(--ease-smooth)]',
                  'hover:after:scale-x-100',
                )}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-3">
            {/* Contact pills — phone + email. Hidden on small screens (mobile sheet
                shows full text); icon-only on md, icon + label on xl+. */}
            {phoneHref && (
              <a
                href={`tel:${phoneHref}`}
                aria-label={t('callUs')}
                title={t('callUs')}
                className="border-border bg-surface-elevated hover:border-brand-primary text-text-muted hover:text-text hidden h-10 items-center gap-2 rounded-full border px-3 transition-colors md:flex"
              >
                <Phone className="h-4 w-4 opacity-70" aria-hidden />
                <span className="text-body-sm hidden xl:inline" dir="ltr">
                  {phone}
                </span>
              </a>
            )}
            <a
              href={`mailto:${email}`}
              aria-label={t('emailUs')}
              title={t('emailUs')}
              className="border-border bg-surface-elevated hover:border-brand-primary text-text-muted hover:text-text hidden h-10 items-center gap-2 rounded-full border px-3 transition-colors md:flex"
            >
              <Mail className="h-4 w-4 opacity-70" aria-hidden />
              <span className="text-body-sm hidden xl:inline" dir="ltr">
                {email}
              </span>
            </a>

            {/* Language pill — surface-elevated with the active locale highlighted in brand green.
                Pure-CSS <details> trigger so this stays a server component. */}
            <details className="group relative">
              <summary
                aria-label={t('language')}
                className="border-border bg-surface-elevated hover:border-brand-primary flex h-10 cursor-pointer list-none items-center gap-2 rounded-full border px-4 transition-colors [&::-webkit-details-marker]:hidden"
              >
                <Globe className="h-4 w-4 opacity-70" aria-hidden />
                <span className="text-eyebrow text-text-muted font-semibold tracking-[var(--tracking-caps)] uppercase">
                  {locale}
                </span>
              </summary>
              <div className="border-border bg-surface-elevated absolute end-0 top-full z-30 mt-2 w-44 rounded-lg border p-2 shadow-lg">
                <LocaleSwitcher currentLocale={locale} pathname={pathname} />
              </div>
            </details>

            {/* Hamburger — mobile only */}
            <details className="group relative lg:hidden">
              <summary
                aria-label={t('openMenu')}
                className="border-border bg-surface-elevated hover:border-brand-primary flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border [&::-webkit-details-marker]:hidden"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
                  <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
                  <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
                </svg>
              </summary>
              <div className="border-border bg-surface-elevated absolute end-0 top-full z-30 mt-2 w-72 rounded-lg border p-3 shadow-lg">
                <nav aria-label="Mobile" className="flex flex-col gap-1">
                  {visibleNav.map((item) => (
                    <Link
                      key={item.route}
                      href={`/${locale}${item.href}`}
                      className="text-body text-text hover:bg-surface-muted rounded-md px-3 py-2.5 font-medium"
                    >
                      {t(item.labelKey)}
                    </Link>
                  ))}
                  <div className="border-border mt-2 flex flex-col gap-1 border-t pt-2">
                    {phoneHref && (
                      <a
                        href={`tel:${phoneHref}`}
                        className="text-body-sm text-text-muted hover:bg-surface-muted flex items-center gap-3 rounded-md px-3 py-2"
                      >
                        <Phone className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                        <span dir="ltr">{phone}</span>
                      </a>
                    )}
                    <a
                      href={`mailto:${email}`}
                      className="text-body-sm text-text-muted hover:bg-surface-muted flex items-center gap-3 rounded-md px-3 py-2"
                    >
                      <Mail className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                      <span dir="ltr" className="break-all">
                        {email}
                      </span>
                    </a>
                  </div>
                </nav>
              </div>
            </details>
          </div>
        </div>
      </Container>
    </header>
  );
}
