import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  MessageCircle,
  Music2,
} from 'lucide-react';
import { Container } from './Container';
import { Logo } from './Logo';
import { getSite, getAllProducts } from '@/lib/content';
import { pick, type Locale } from '@/lib/i18n';
import { isRouteHidden } from '@/lib/feature-flags';

const SOCIAL_ICONS = {
  facebook: { Icon: Facebook, label: 'Facebook' },
  instagram: { Icon: Instagram, label: 'Instagram' },
  linkedin: { Icon: Linkedin, label: 'LinkedIn' },
  twitter: { Icon: Twitter, label: 'Twitter / X' },
  youtube: { Icon: Youtube, label: 'YouTube' },
  whatsapp: { Icon: MessageCircle, label: 'WhatsApp' },
  tiktok: { Icon: Music2, label: 'TikTok' },
} as const;

interface FooterProps {
  locale: Locale;
}

/**
 * Editorial footer (v2 — Claude Design handoff).
 *
 * Composition: 4-column grid on desktop (brand 1.4fr · 3 link columns ·);
 * brand block sits the logo in a soft cream pill so it reads on the
 * deep surface. Column headings paint in the active theme's ornament
 * color (terracotta default · gold ramadan · ribbon-gold christmas).
 */
export async function Footer({ locale }: FooterProps) {
  const [site, products, t] = await Promise.all([
    getSite(),
    getAllProducts(),
    getTranslations({ locale, namespace: 'footer' }),
  ]);
  const tnav = await getTranslations({ locale, namespace: 'nav' });

  const founded = site.founded;
  const brandTagline =
    locale === 'ar'
      ? 'تأسست في 1985. تصدّر إلى 30 دولة على خمس قارات.'
      : locale === 'fr'
        ? `Fondée en ${founded}. Exporte vers 30 pays sur cinq continents.`
        : `Family-founded in ${founded}. Qalyub, Egypt. Exporting to 30 countries on five continents.`;

  return (
    <footer
      role="contentinfo"
      style={{
        background: 'var(--color-surface)',
        color: 'var(--color-text-muted)',
        paddingBottom: 'var(--space-8)',
      }}
    >
      {/* ── Brand band — sits across the top, divided from the nav by a hairline ── */}
      <div
        style={{
          color: 'var(--color-text-muted)',
          paddingBlock: 'var(--space-12)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Container>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-10)',
            }}
          >
            {/* Montana + tagline */}
            <div style={{ maxWidth: '40ch' }}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <Logo className="h-14 w-auto" decorative />
              </div>
              <p
                style={{
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 'var(--leading-relaxed)',
                  margin: 0,
                }}
              >
                {brandTagline}
              </p>
            </div>

            {/* Part of — parent group logo */}
            {site.parentUrl && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--text-eyebrow)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-caps)',
                    color: 'var(--color-text-subtle)',
                  }}
                >
                  {t('partOf')}
                </span>
                <a
                  href={site.parentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={pick(site.parentCompany, locale)}
                  className="transition-opacity hover:!opacity-80"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logo/MaamounGroupLogo.png"
                    alt={pick(site.parentCompany, locale)}
                    width={650}
                    height={460}
                    className="h-20 w-auto"
                    decoding="async"
                    loading="lazy"
                  />
                  <span
                    style={{
                      fontSize: 'var(--text-body)',
                      fontWeight: 600,
                      lineHeight: 'var(--leading-tight)',
                      color: 'var(--color-text)',
                      maxWidth: '16ch',
                    }}
                  >
                    {pick(site.parentCompany, locale)}
                  </span>
                </a>
              </div>
            )}

            {/* Socials */}
            {Object.keys(SOCIAL_ICONS).some((k) => site.social[k as keyof typeof SOCIAL_ICONS]) && (
              <div className="flex gap-2">
                {(
                  Object.entries(SOCIAL_ICONS) as [
                    keyof typeof SOCIAL_ICONS,
                    (typeof SOCIAL_ICONS)[keyof typeof SOCIAL_ICONS],
                  ][]
                ).map(([key, { Icon, label }]) => {
                  const url = site.social[key];
                  if (!url) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-primary-fg flex h-9 w-9 items-center justify-center rounded-full transition-all hover:!border-current"
                      style={{
                        color: 'var(--color-text-muted)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </Container>
      </div>

      <Container>
        <div
          style={{
            display: 'grid',
            gap: 'var(--space-12)',
            gridTemplateColumns: '1fr',
            paddingTop: 'var(--space-16)',
          }}
          className="md:!grid-cols-3"
        >
          {/* Catalogue column — small selection of products */}
          <FooterCol heading={t('products')}>
            {products.slice(0, 6).map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/${locale}/catalog/${product.slug}`}
                  className="hover:!text-brand-primary transition-colors"
                  style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}
                >
                  {pick(product.name, locale)}
                </Link>
              </li>
            ))}
          </FooterCol>

          {/* Company column */}
          <FooterCol heading={t('company')}>
            {!isRouteHidden('about') && (
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="hover:!text-brand-primary transition-colors"
                  style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}
                >
                  {tnav('about')}
                </Link>
              </li>
            )}
            {!isRouteHidden('markets') && (
              <li>
                <Link
                  href={`/${locale}/markets`}
                  className="hover:!text-brand-primary transition-colors"
                  style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}
                >
                  {tnav('markets')}
                </Link>
              </li>
            )}
            {!isRouteHidden('news') && (
              <li>
                <Link
                  href={`/${locale}/news`}
                  className="hover:!text-brand-primary transition-colors"
                  style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}
                >
                  {tnav('news')}
                </Link>
              </li>
            )}
            <li>
              <a
                href="/docs/Montana-Catalogue.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:!text-brand-primary transition-colors"
                style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}
              >
                {locale === 'ar'
                  ? 'تحميل الكتالوج'
                  : locale === 'fr'
                    ? 'Catalogue PDF'
                    : 'Download catalogue'}
              </a>
            </li>
          </FooterCol>

          {/* Contact column */}
          <FooterCol heading={t('connect')}>
            {!isRouteHidden('contact') && (
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="hover:!text-brand-primary transition-colors"
                  style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}
                >
                  {tnav('contact')}
                </Link>
              </li>
            )}
            <li>
              <a
                href={`mailto:${site.contact.factory.email}`}
                className="hover:!text-brand-primary transition-colors"
                style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}
              >
                {site.contact.factory.email}
              </a>
            </li>
            {site.contact.factory.phones[0] && (
              <li>
                <a
                  href={`tel:${site.contact.factory.phones[0]}`}
                  dir="ltr"
                  className="hover:!text-brand-primary transition-colors"
                  style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}
                >
                  {site.contact.factory.phones[0]}
                </a>
              </li>
            )}
            <li>
              <Link
                href={`/${locale}/privacy`}
                className="hover:!text-brand-primary transition-colors"
                style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}
              >
                {t('privacy')}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/terms`}
                className="hover:!text-brand-primary transition-colors"
                style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}
              >
                {t('terms')}
              </Link>
            </li>
          </FooterCol>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 'var(--space-16)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-text-subtle)',
            flexWrap: 'wrap',
          }}
        >
          <span>
            © {new Date().getFullYear()} {pick(site.brand.name, locale)} — {t('rights')}
          </span>
          <span>
            <Link
              href={`/${locale}/privacy`}
              className="hover:!text-brand-primary"
              style={{ color: 'inherit' }}
            >
              {t('privacy')}
            </Link>{' '}
            ·{' '}
            <Link
              href={`/${locale}/cookies`}
              className="hover:!text-brand-primary"
              style={{ color: 'inherit' }}
            >
              {t('cookies')}
            </Link>{' '}
            ·{' '}
            <Link
              href={`/${locale}/terms`}
              className="hover:!text-brand-primary"
              style={{ color: 'inherit' }}
            >
              {t('terms')}
            </Link>{' '}
            ·{' '}
            {/* Withdraw/change cookie consent — re-opens the banner via /cookie-banner.js.
                Rendered as a real link (href to the cookie policy) so it still works
                with JS disabled; cookie-banner.js intercepts the click to open the UI. */}
            <a
              href={`/${locale}/cookies`}
              data-cookie-settings
              className="hover:!text-brand-primary"
              style={{ color: 'inherit' }}
            >
              {t('cookieSettings')}
            </a>
          </span>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h4
        style={{
          fontSize: 'var(--text-eyebrow)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-caps)',
          color: 'var(--ornament-color)',
          marginBottom: 'var(--space-5)',
        }}
      >
        {heading}
      </h4>
      <ul
        style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)' }}
      >
        {children}
      </ul>
    </div>
  );
}
