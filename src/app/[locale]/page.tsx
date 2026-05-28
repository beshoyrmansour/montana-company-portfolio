import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { ProductCard } from '@/components/product/ProductCard';
import { getHomePage, getSite, getFeaturedProducts, getAllNewsArticles } from '@/lib/content';
import { pick, type Locale } from '@/lib/i18n';
import { getActiveTheme } from '@/lib/theme';
import { JsonLd } from '@/components/seo/JsonLd';
import { webSiteJsonLd, buildPageMetadata } from '@/lib/seo';
import {
  SectionDivider,
  TitleAccent,
  HeroOrnaments,
  WorldMap,
} from '@/components/decoration/Ornaments';
import type { HomePage } from '@/schemas/page';
import type { Site } from '@/schemas/site';

export const dynamic = 'error';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const [home, site] = await Promise.all([getHomePage(), getSite()]);
  const brand = pick(site.brand.name, locale) ?? 'Montana';
  const tagline = pick(site.brand.tagline, locale) ?? '';
  const headline = pick(home.hero.headline, locale) ?? '';
  const subheadline = pick(home.hero.subheadline, locale) ?? tagline;
  return buildPageMetadata({
    locale,
    path: '',
    title: pick(home.seo?.title, locale) ?? `${brand} — ${headline}`,
    description: pick(home.seo?.description, locale) ?? subheadline,
    keywords: home.seo?.keywords,
    ogImage: home.seo?.ogImage,
  });
}

/* ─────────────────────────────────────────────────────────────────
 * Local helpers — render JSON-driven editorial primitives.
 *  Title split:    { lead, em }       → "{lead} <em>{em}</em>"
 *  Heritage stats: { num: "40+" }     → "40<sup>+</sup>"
 * ───────────────────────────────────────────────────────────────── */

function HeritageStats({ stats, locale }: { stats: Site['stats']; locale: Locale }) {
  return (
    <div className="heritage-stats">
      {stats.slice(0, 4).map((s) => {
        const m = s.value.match(/^([\d.]+)(\D*)$/);
        return (
          <div key={s.value} className="heritage-stat">
            <span className="num">
              {m ? m[1] : s.value}
              {m && m[2] ? <sup>{m[2]}</sup> : null}
            </span>
            <span className="label">{pick(s.label, locale)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * HOME PAGE
 * ═══════════════════════════════════════════════════════════════ */

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const theme = getActiveTheme();

  const [home, site, featured, news] = await Promise.all([
    getHomePage(),
    getSite(),
    getFeaturedProducts(),
    getAllNewsArticles(),
  ]);

  return (
    <>
      <JsonLd data={webSiteJsonLd(site, locale)} />

      {/* ════════════════════════════════════════════════════════
       * HERO — editorial split (text left, image right on desktop)
       * ════════════════════════════════════════════════════════ */}
      <section className="hero-editorial">
        <div className="hero-editorial-content">
          {home.hero.eyebrow && (
            <span className="hero-eyebrow reveal">
              <span className="dot" />
              {pick(home.hero.eyebrow, locale)}
            </span>
          )}
          {home.hero.pre && (
            <span className="hero-pre reveal reveal-1">{pick(home.hero.pre, locale)}</span>
          )}
          <h1 className="hero-title reveal reveal-2">
            <HeroHeadline headline={pick(home.hero.headline, locale) ?? ''} />
          </h1>
          {home.hero.subheadline && (
            <p className="hero-subtitle reveal reveal-3">{pick(home.hero.subheadline, locale)}</p>
          )}
          <div className="hero-ctas reveal reveal-4">
            <Cta cta={home.hero.ctaPrimary} locale={locale} className="btn-editorial primary" />
            {home.hero.ctaSecondary && (
              <Cta cta={home.hero.ctaSecondary} locale={locale} className="btn-editorial ghost" />
            )}
          </div>
          {home.hero.meta?.enabled && (
            <div className="hero-meta">
              <div className="hero-meta-row">
                {home.hero.meta.items.map((item) => (
                  <div key={item.num} className="hero-meta-item">
                    <span className="num">{item.num}</span>
                    <span>{pick(item.label, locale)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="hero-editorial-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.hero.image} alt="" fetchPriority="high" decoding="async" aria-hidden />
          <HeroOrnaments theme={theme} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
       * HERITAGE STRIP — italic lede + 4 stats from site.json
       * ════════════════════════════════════════════════════════ */}
      {home.heritage?.enabled && (
        <section className="heritage">
          <Container>
            <div className="heritage-inner">
              <p className="heritage-lede">
                {pick(home.heritage.lede.before, locale)}{' '}
                <strong>{pick(home.heritage.lede.strong, locale)}</strong>{' '}
                {pick(home.heritage.lede.after, locale)}
              </p>
              <HeritageStats stats={site.stats} locale={locale} />
            </div>
          </Container>
        </section>
      )}

      <SectionDivider theme={theme} />

      {/* ════════════════════════════════════════════════════════
       * FEATURED PRODUCTS — tinted section w/ editorial cards
       * ════════════════════════════════════════════════════════ */}
      {home.featuredProducts.enabled && featured.length > 0 && (
        <section className="section-editorial section-tinted">
          <Container>
            <div className="section-head-row">
              <div className="section-head">
                {home.featuredProducts.eyebrow && (
                  <span className="eyebrow">{pick(home.featuredProducts.eyebrow, locale)}</span>
                )}
                <h2>
                  <TitleAccent theme={theme} side="start" />
                  <SplitTitle title={home.featuredProducts.title} locale={locale} />
                </h2>
              </div>
              {home.featuredProducts.viewAllLabel && (
                <Link href={`/${locale}/catalog`} className="link">
                  {pick(home.featuredProducts.viewAllLabel, locale)}
                  <ArrowRight size={14} className="rtl:rotate-180" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-5 md:gap-6 lg:grid-cols-4">
              {featured.slice(0, home.featuredProducts.count ?? 8).map((product, idx) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  locale={locale}
                  priority={idx < 4}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
       * CHAIRMAN PULL-QUOTE — dark editorial pause
       * ════════════════════════════════════════════════════════ */}
      {home.chairmanQuote?.enabled && (
        <section className="section-editorial quote-section on-dark">
          <Container>
            <div className="quote-inner">
              <div
                className="quote-portrait"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-surface-deeper) 0%, var(--color-surface-deep) 60%, color-mix(in srgb, var(--ornament-color) 25%, var(--color-surface-deep)) 100%)',
                }}
              >
                {home.chairmanQuote.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={home.chairmanQuote.image}
                    alt=""
                    aria-hidden
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    loading="lazy"
                  />
                )}
                {home.chairmanQuote.cornerMark && (
                  <span className="corner-mark">{pick(home.chairmanQuote.cornerMark, locale)}</span>
                )}
              </div>
              <div className="quote-body">
                <span className="eyebrow">{pick(home.chairmanQuote.eyebrow, locale)}</span>
                <p className="quote-text">
                  &ldquo;{pick(home.chairmanQuote.quote.before, locale)}{' '}
                  <em>{pick(home.chairmanQuote.quote.strong, locale)}</em>{' '}
                  {pick(home.chairmanQuote.quote.after, locale)}&rdquo;
                </p>
                <div className="quote-attr">
                  <div>
                    <div className="name">{pick(home.chairmanQuote.attribution.name, locale)}</div>
                    <div className="role">{pick(home.chairmanQuote.attribution.role, locale)}</div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
       * PROCESS STRIP — 5 steps, field to freezer
       * ════════════════════════════════════════════════════════ */}
      {home.process.enabled && (
        <section className="section-editorial">
          <Container>
            <div
              className="section-head"
              style={{ marginInline: 'auto', textAlign: 'center', maxWidth: '52ch' }}
            >
              {home.process.eyebrow && (
                <span className="eyebrow no-rule" style={{ justifyContent: 'center' }}>
                  {pick(home.process.eyebrow, locale)}
                </span>
              )}
              <h2 style={{ textAlign: 'center' }}>
                <SplitTitle title={home.process.title} locale={locale} />
              </h2>
            </div>
            <div className="process-grid">
              {home.process.steps.map((step, idx) => {
                const roman = ['i', 'ii', 'iii', 'iv', 'v'][idx] ?? String(idx + 1);
                return (
                  <div key={idx} className="process-step">
                    <span className="process-num">{roman}</span>
                    <h3>{pick(step.label, locale)}</h3>
                    <p>{pick(step.description, locale)}</p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      <SectionDivider theme={theme} />

      {/* ════════════════════════════════════════════════════════
       * MARKETS — global reach, dark with animated map
       * ════════════════════════════════════════════════════════ */}
      {home.marketsTeaser.enabled && (
        <section className="section-editorial markets on-dark">
          <div className="markets-bg" />
          <Container>
            <div className="markets-inner">
              <div className="markets-copy">
                {home.marketsTeaser.eyebrow && (
                  <span className="eyebrow" style={{ color: 'var(--ornament-color)' }}>
                    {pick(home.marketsTeaser.eyebrow, locale)}
                  </span>
                )}
                <h2>
                  {home.marketsTeaser.bigNum && (
                    <span className="big-num">{home.marketsTeaser.bigNum}</span>
                  )}
                  {pick(home.marketsTeaser.title, locale)}
                </h2>
                <p>{pick(home.marketsTeaser.body, locale)}</p>
                {home.marketsTeaser.chips && home.marketsTeaser.chips.length > 0 && (
                  <div className="markets-chips">
                    {home.marketsTeaser.chips.map((c) => (
                      <span className="markets-chip" key={c}>
                        {c}
                      </span>
                    ))}
                    {home.marketsTeaser.chipsMoreLabel && (
                      <span className="markets-chip" style={{ opacity: 0.7 }}>
                        {pick(home.marketsTeaser.chipsMoreLabel, locale)}
                      </span>
                    )}
                  </div>
                )}
                {home.marketsTeaser.ctaLabel && (
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <Link href={`/${locale}/markets`} className="btn-editorial on-dark ghost sm">
                      {pick(home.marketsTeaser.ctaLabel, locale)}
                      <ArrowRight size={14} className="rtl:rotate-180" />
                    </Link>
                  </div>
                )}
              </div>
              <div className="markets-map">
                <WorldMap />
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
       * LATEST NEWS — editorial card grid
       * ════════════════════════════════════════════════════════ */}
      {home.latestNews.enabled && news.length > 0 && (
        <section className="section-editorial">
          <Container>
            <div className="section-head-row">
              <div className="section-head">
                {home.latestNews.eyebrow && (
                  <span className="eyebrow">{pick(home.latestNews.eyebrow, locale)}</span>
                )}
                <h2>
                  <SplitTitle title={home.latestNews.title} locale={locale} />
                </h2>
              </div>
              {home.latestNews.viewAllLabel && (
                <Link href={`/${locale}/news`} className="link">
                  {pick(home.latestNews.viewAllLabel, locale)}
                  <ArrowRight size={14} className="rtl:rotate-180" />
                </Link>
              )}
            </div>
            <div className="news-grid">
              {news.slice(0, home.latestNews.count).map((article) => (
                <Link
                  key={article.slug}
                  href={`/${locale}/news/${article.slug}`}
                  className="news-card-editorial"
                >
                  <div className="news-image-editorial">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.coverImage}
                      alt={pick(article.title, locale) ?? ''}
                      width={800}
                      height={500}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="news-meta-editorial">
                    <span>{article.category}</span>
                    <span className="dot" />
                    <time className="date" dateTime={article.publishedAt}>
                      {article.publishedAt}
                    </time>
                  </div>
                  <h3>{pick(article.title, locale)}</h3>
                  <p>{pick(article.excerpt, locale)}</p>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
       * CTA STRIP — brand green band
       * ════════════════════════════════════════════════════════ */}
      {home.ctaBand?.enabled && (
        <section className="section-editorial cta-strip-editorial on-dark">
          <Container>
            <div className="cta-inner-editorial">
              <div>
                <span
                  className="eyebrow"
                  style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '1rem' }}
                >
                  {pick(home.ctaBand.eyebrow, locale)}
                </span>
                <h2 style={{ marginTop: '0.5rem' }}>
                  <SplitTitle title={home.ctaBand.title} locale={locale} />
                </h2>
              </div>
              <div>
                <p>{pick(home.ctaBand.body, locale)}</p>
              </div>
            </div>
            <div className="cta-buttons-editorial">
              {home.ctaBand.ctas.map((cta, i) => (
                <Cta key={i} cta={cta} locale={locale} className={ctaClassName(cta)} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
 * Reusable JSX bits — kept local; the JSON shape dictates rendering.
 * ───────────────────────────────────────────────────────────────── */

function HeroHeadline({ headline }: { headline: string }) {
  const i = headline.lastIndexOf(',');
  if (i === -1 || i === headline.length - 1) return <>{headline}</>;
  return (
    <>
      {headline.slice(0, i + 1)} <em>{headline.slice(i + 1).trim()}</em>
    </>
  );
}

function SplitTitle({
  title,
  locale,
}: {
  title: HomePage['featuredProducts']['title'];
  locale: Locale;
}) {
  return (
    <>
      {pick(title.lead, locale)} <em>{pick(title.em, locale)}</em>
    </>
  );
}

type LocalCta = NonNullable<HomePage['hero']['ctaSecondary']>;

function Cta({ cta, locale, className }: { cta: LocalCta; locale: Locale; className: string }) {
  const label = pick(cta.label, locale);
  const href = cta.external ? cta.href : `/${locale}${cta.href}`;
  if (cta.external) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
        <ArrowRight className="rtl:rotate-180" size={16} />
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
      <ArrowRight className="rtl:rotate-180" size={16} />
    </Link>
  );
}

function ctaClassName(cta: LocalCta): string {
  switch (cta.variant) {
    case 'primary':
      return 'btn-editorial primary';
    case 'on-dark-ghost':
      return 'btn-editorial on-dark ghost';
    case 'ghost':
    default:
      return 'btn-editorial ghost';
  }
}
