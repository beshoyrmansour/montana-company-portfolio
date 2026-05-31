import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import { SectionDivider } from '@/components/decoration/Ornaments';
import { getActiveTheme } from '@/lib/theme';
import { getAboutPage } from '@/lib/content';
import { pick, type Locale } from '@/lib/i18n';
import { buildPageMetadata } from '@/lib/seo';
import type { AboutPage } from '@/schemas/page';

export const dynamic = 'error';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const page = await getAboutPage();
  const lead = pick(page.hero.headline.lead, locale) ?? '';
  const em = pick(page.hero.headline.em, locale) ?? '';
  const tail = pick(page.hero.headline.tail, locale) ?? '';
  const heroTitle = `${lead} ${em}${tail}`.trim();
  return buildPageMetadata({
    locale,
    path: '/about',
    title: pick(page.seo?.title, locale) ?? (heroTitle || 'About Montana'),
    description: pick(page.seo?.description, locale) ?? pick(page.hero.subtitle, locale) ?? '',
    keywords: page.seo?.keywords ?? [
      'Montana history',
      'Egyptian frozen-food family business',
      'Maamoun Brothers Group',
      'Qalyub factory',
      'HACCP ISO GMP certifications',
    ],
    ogImage: page.seo?.ogImage,
  });
}

/**
 * About page — fully JSON-driven from content/pages/about.json.
 * Sections: hero, timeline, chairman quote, values, certifications.
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const theme = getActiveTheme();
  const page = await getAboutPage();

  return (
    <>
      {/* ════════════════════════════════════════════════════════ HERO */}
      {page.hero.enabled && (
        <section className="markets-hero">
          <Container>
            <div className="markets-hero-inner">
              <span className="eyebrow">{pick(page.hero.eyebrow, locale)}</span>
              <h1 className="markets-hero-title">
                <span className="muted">{pick(page.hero.headline.lead, locale)}</span>
                <br />
                <em>{pick(page.hero.headline.em, locale)}</em>
                {page.hero.headline.tail && (
                  <span className="muted">{pick(page.hero.headline.tail, locale)}</span>
                )}
              </h1>
              <p className="markets-hero-sub">{pick(page.hero.subtitle, locale)}</p>
              <div className="markets-hero-stats">
                {page.hero.stats.map((s, i) => (
                  <div key={i} className="hs-stat">
                    <span className="hs-num">
                      {s.num}
                      {s.sup && <sup>{s.sup}</sup>}
                    </span>
                    <span className="hs-lbl">{pick(s.label, locale)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ TIMELINE */}
      {page.timeline.enabled && (
        <section className="about-timeline">
          <Container>
            <div
              className="section-head"
              style={{
                marginInline: 'auto',
                textAlign: 'center',
                maxWidth: '52ch',
                marginBottom: 'var(--space-16)',
              }}
            >
              <span className="eyebrow no-rule" style={{ justifyContent: 'center' }}>
                {pick(page.timeline.eyebrow, locale)}
              </span>
              <h2 style={{ textAlign: 'center' }}>
                <SplitTitle title={page.timeline.title} locale={locale} />
              </h2>
            </div>
            <ol className="timeline">
              {page.timeline.items
                .filter((item) => item.visible !== false)
                .map((t) => (
                  <li key={t.year} className="tl-item">
                    <div className="tl-year">{t.year}</div>
                    <div className="tl-spine">
                      <span className="tl-dot" />
                    </div>
                    <div className="tl-card">
                      {t.image && (
                        <div className="tl-img">
                          <Image
                            src={t.image}
                            alt={`${t.year} — ${pick(t.title, locale) ?? ''}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      )}
                      <h3 className="tl-title">{pick(t.title, locale)}</h3>
                      <p className="tl-desc">{pick(t.description, locale)}</p>
                    </div>
                  </li>
                ))}
            </ol>
          </Container>
        </section>
      )}

      <SectionDivider theme={theme} />

      {/* ════════════════════════════════════════════════════════ CHAIRMAN QUOTE */}
      {page.chairmanQuote?.enabled && (
        <section className="section-editorial quote-section on-dark">
          <Container>
            <div className="quote-inner">
              <div className="quote-portrait">
                {page.chairmanQuote.image && (
                  <Image
                    src={page.chairmanQuote.image}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    style={{ objectFit: 'cover' }}
                  />
                )}
                {page.chairmanQuote.cornerMark && (
                  <span className="corner-mark">{pick(page.chairmanQuote.cornerMark, locale)}</span>
                )}
              </div>
              <div className="quote-body">
                <span className="eyebrow">{pick(page.chairmanQuote.eyebrow, locale)}</span>
                <p className="quote-text">
                  &ldquo;{pick(page.chairmanQuote.quote.before, locale)}{' '}
                  <em>{pick(page.chairmanQuote.quote.strong, locale)}</em>
                  {pick(page.chairmanQuote.quote.after, locale)}&rdquo;
                </p>
                <div className="quote-attr">
                  <div>
                    <div className="name">{pick(page.chairmanQuote.attribution.name, locale)}</div>
                    <div className="role">{pick(page.chairmanQuote.attribution.role, locale)}</div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ VALUES */}
      {page.values.enabled && (
        <section className="section-editorial">
          <Container>
            <div
              className="section-head"
              style={{
                marginInline: 'auto',
                textAlign: 'center',
                maxWidth: '52ch',
                marginBottom: 'var(--space-16)',
              }}
            >
              <span className="eyebrow no-rule" style={{ justifyContent: 'center' }}>
                {pick(page.values.eyebrow, locale)}
              </span>
              <h2 style={{ textAlign: 'center' }}>
                <SplitTitle title={page.values.title} locale={locale} />
              </h2>
            </div>
            <div className="process-grid">
              {page.values.items.map((v) => (
                <div key={v.num} className="process-step">
                  <span className="process-num">{v.num}</span>
                  <h3>{pick(v.title, locale)}</h3>
                  <p>{pick(v.description, locale)}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ PARENT GROUP */}
      {page.parentGroup?.enabled && (
        <section className="section-editorial">
          <Container>
            <div
              style={{
                display: 'grid',
                gap: 'var(--space-12)',
                alignItems: 'center',
                gridTemplateColumns: '1fr',
              }}
              className="md:!grid-cols-[0.9fr_1.1fr]"
            >
              {/* Group logo on a warm card */}
              <div
                style={{
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-md, 0 8px 24px rgba(0,0,0,0.08))',
                  padding: 'var(--space-12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                }}
              >
                <Image
                  src={page.parentGroup.logo}
                  alt={pick(page.parentGroup.title.em, locale) ?? 'Maamoun Brothers Group'}
                  width={650}
                  height={460}
                  style={{ width: '100%', maxWidth: '280px', height: 'auto' }}
                />
                {page.parentGroup.since && (
                  <span
                    style={{
                      fontSize: 'var(--text-eyebrow)',
                      textTransform: 'uppercase',
                      letterSpacing: 'var(--tracking-caps)',
                      color: 'var(--color-text-subtle)',
                    }}
                  >
                    {locale === 'ar'
                      ? `منذ ${page.parentGroup.since}`
                      : locale === 'fr'
                        ? `Depuis ${page.parentGroup.since}`
                        : `Since ${page.parentGroup.since}`}
                  </span>
                )}
              </div>

              {/* Copy */}
              <div>
                <span className="eyebrow no-rule">{pick(page.parentGroup.eyebrow, locale)}</span>
                <h2 style={{ marginBottom: 'var(--space-5)' }}>
                  <SplitTitle title={page.parentGroup.title} locale={locale} />
                </h2>
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    maxWidth: '52ch',
                    lineHeight: 'var(--leading-relaxed)',
                  }}
                >
                  {pick(page.parentGroup.body, locale)}
                </p>
                {page.parentGroup.cta && (
                  <a
                    href={page.parentGroup.cta.href}
                    target={page.parentGroup.cta.external ? '_blank' : undefined}
                    rel={page.parentGroup.cta.external ? 'noopener noreferrer' : undefined}
                    className="btn-editorial ghost"
                    style={{ marginTop: 'var(--space-6)' }}
                  >
                    {pick(page.parentGroup.cta.label, locale)}
                  </a>
                )}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ CERTIFICATIONS */}
      {page.certifications.enabled && (
        <section className="section-editorial logistics-band on-dark">
          <Container>
            <div
              className="section-head"
              style={{ marginInline: 'auto', textAlign: 'center', maxWidth: '56ch' }}
            >
              <span className="eyebrow no-rule" style={{ justifyContent: 'center' }}>
                {pick(page.certifications.eyebrow, locale)}
              </span>
              <h2 style={{ textAlign: 'center' }}>
                <SplitTitle title={page.certifications.title} locale={locale} />
              </h2>
            </div>
            <div className="cert-grid">
              {page.certifications.items.map((c) => (
                <div key={c.name} className="cert-card">
                  <div className="cert-shield">
                    <CertShield />
                  </div>
                  <h3 className="cert-name">{c.name}</h3>
                  <p className="cert-desc">{pick(c.description, locale)}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

function SplitTitle({ title, locale }: { title: AboutPage['timeline']['title']; locale: Locale }) {
  return (
    <>
      {pick(title.lead, locale)} <em>{pick(title.em, locale)}</em>
    </>
  );
}

function CertShield() {
  return (
    <svg width="40" height="48" viewBox="0 0 40 48" fill="none" aria-hidden>
      <path
        d="M 20 2 L 38 8 L 38 26 Q 38 38 20 46 Q 2 38 2 26 L 2 8 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M 14 24 L 18 28 L 26 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
