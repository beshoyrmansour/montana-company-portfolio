import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
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
      ? 'تأسست في 1985. تصدّر إلى 70 دولة على ستة قارات.'
      : locale === 'fr'
        ? `Fondée en ${founded}. Exporte vers 70 pays sur six continents.`
        : `Family-founded in ${founded}. Kalioub, Egypt. Exporting to 70 countries on six continents.`;

  return (
    <footer
      role="contentinfo"
      style={{
        background: 'var(--color-surface-deeper)',
        color: 'rgba(255, 255, 255, 0.7)',
        paddingBlock: 'var(--space-24) var(--space-8)',
      }}
    >
      <Container>
        <div
          style={{
            display: 'grid',
            gap: 'var(--space-12)',
            gridTemplateColumns: '1fr',
          }}
          className="md:!grid-cols-[1.4fr_1fr_1fr_1fr]"
        >
          {/* Brand block — logo pill + tagline + socials */}
          <div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.96)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                width: 'max-content',
                maxWidth: '100%',
                marginBottom: 'var(--space-5)',
              }}
            >
              <Logo className="h-12 w-auto" decorative />
            </div>
            <p
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'rgba(255,255,255,0.6)',
                maxWidth: '32ch',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              {brandTagline}
            </p>
            {(site.social.facebook ||
              site.social.instagram ||
              site.social.linkedin ||
              site.social.twitter ||
              site.social.youtube) && (
              <div className="mt-6 flex gap-2">
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
                      className="text-text-inverse hover:text-brand-primary-fg flex h-9 w-9 items-center justify-center rounded-full border border-white/20 transition-all"
                      style={{ backdropFilter: 'blur(4px)' }}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Catalogue column — small selection of products */}
          <FooterCol heading={t('products')}>
            {products.slice(0, 6).map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/${locale}/catalog/${product.slug}`}
                  className="transition-colors hover:!text-white"
                  style={{ fontSize: 'var(--text-body-sm)', color: 'rgba(255,255,255,0.78)' }}
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
                  className="transition-colors hover:!text-white"
                  style={{ fontSize: 'var(--text-body-sm)', color: 'rgba(255,255,255,0.78)' }}
                >
                  {tnav('about')}
                </Link>
              </li>
            )}
            {!isRouteHidden('markets') && (
              <li>
                <Link
                  href={`/${locale}/markets`}
                  className="transition-colors hover:!text-white"
                  style={{ fontSize: 'var(--text-body-sm)', color: 'rgba(255,255,255,0.78)' }}
                >
                  {tnav('markets')}
                </Link>
              </li>
            )}
            {!isRouteHidden('news') && (
              <li>
                <Link
                  href={`/${locale}/news`}
                  className="transition-colors hover:!text-white"
                  style={{ fontSize: 'var(--text-body-sm)', color: 'rgba(255,255,255,0.78)' }}
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
                className="transition-colors hover:!text-white"
                style={{ fontSize: 'var(--text-body-sm)', color: 'rgba(255,255,255,0.78)' }}
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
                  className="transition-colors hover:!text-white"
                  style={{ fontSize: 'var(--text-body-sm)', color: 'rgba(255,255,255,0.78)' }}
                >
                  {tnav('contact')}
                </Link>
              </li>
            )}
            <li>
              <a
                href={`mailto:${site.contact.factory.email}`}
                className="transition-colors hover:!text-white"
                style={{ fontSize: 'var(--text-body-sm)', color: 'rgba(255,255,255,0.78)' }}
              >
                {site.contact.factory.email}
              </a>
            </li>
            {site.contact.factory.phones[0] && (
              <li>
                <a
                  href={`tel:${site.contact.factory.phones[0]}`}
                  dir="ltr"
                  className="transition-colors hover:!text-white"
                  style={{ fontSize: 'var(--text-body-sm)', color: 'rgba(255,255,255,0.78)' }}
                >
                  {site.contact.factory.phones[0]}
                </a>
              </li>
            )}
            <li>
              <Link
                href={`/${locale}/privacy`}
                className="transition-colors hover:!text-white"
                style={{ fontSize: 'var(--text-body-sm)', color: 'rgba(255,255,255,0.78)' }}
              >
                {t('privacy')}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/terms`}
                className="transition-colors hover:!text-white"
                style={{ fontSize: 'var(--text-body-sm)', color: 'rgba(255,255,255,0.78)' }}
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
            borderTop: '1px solid rgba(255,255,255,0.10)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            fontSize: 'var(--text-body-sm)',
            color: 'rgba(255,255,255,0.5)',
            flexWrap: 'wrap',
          }}
        >
          <span>
            © {new Date().getFullYear()} {pick(site.brand.name, locale)} — {t('rights')}
          </span>
          <span>
            <Link
              href={`/${locale}/privacy`}
              className="hover:!text-white"
              style={{ color: 'inherit' }}
            >
              {t('privacy')}
            </Link>{' '}
            ·{' '}
            <Link
              href={`/${locale}/cookies`}
              className="hover:!text-white"
              style={{ color: 'inherit' }}
            >
              {t('cookies')}
            </Link>{' '}
            ·{' '}
            <Link
              href={`/${locale}/terms`}
              className="hover:!text-white"
              style={{ color: 'inherit' }}
            >
              {t('terms')}
            </Link>
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
