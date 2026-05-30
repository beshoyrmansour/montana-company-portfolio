import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { SectionDivider } from '@/components/decoration/Ornaments';
import { TradeAtlasLazy } from '@/components/markets/TradeAtlasLazy';
import { getMarkets, getMarketsPage } from '@/lib/content';
import { pick, getDir, type Locale } from '@/lib/i18n';
import { getActiveTheme } from '@/lib/theme';
import { isRouteHidden } from '@/lib/feature-flags';
import { REGION_META, COUNTRY_META, regionColor } from '@/lib/markets-meta';
import { buildPageMetadata } from '@/lib/seo';
import type { MarketsPage } from '@/schemas/page';

export const dynamic = 'error';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const [page, markets] = await Promise.all([getMarketsPage(), getMarkets()]);
  const total = markets.regions.reduce((s, r) => s + r.countries.length, 0);
  const lead = pick(page.hero.headline.lead, locale) ?? '';
  const em = pick(page.hero.headline.em, locale) ?? '';
  const tail = pick(page.hero.headline.tail, locale) ?? '';
  const heroTitle = `${lead} ${em}${tail}`.trim();
  const body = (pick(page.hero.body, locale) ?? '').replace(/\$\{count\}/g, String(total));
  return buildPageMetadata({
    locale,
    path: '/markets',
    title: pick(page.seo?.title, locale) ?? (heroTitle || 'Global Markets'),
    description: pick(page.seo?.description, locale) ?? body,
    keywords: page.seo?.keywords ?? [
      'frozen food markets',
      'frozen vegetables export',
      'global export reach',
      'Middle East frozen food',
      'European frozen food import',
      'Africa frozen food',
      'Asia frozen food export',
    ],
    ogImage: page.seo?.ogImage,
  });
}

/**
 * Markets — fully JSON-driven from content/pages/markets.json (page copy)
 * and content/markets.json (regions + countries + region meta).
 *
 * Region metadata (color, lede, photo, leadTime) preferred from markets.json;
 * markets-meta.ts (REGION_META) is the fallback for any region missing fields.
 */
export default async function MarketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (isRouteHidden('markets')) notFound();
  const locale = raw as Locale;
  setRequestLocale(locale);
  const theme = getActiveTheme();
  const dir = getDir(locale);

  const [markets, page] = await Promise.all([getMarkets(), getMarketsPage()]);
  const totalCountries = markets.regions.reduce((sum, r) => sum + r.countries.length, 0);

  /** Fill in any missing region meta from the markets-meta fallback. */
  const regionMeta = (id: string) => {
    const fromJson = markets.regions.find((r) => r.id === id);
    const fromMeta = REGION_META[id];
    return {
      color: fromJson?.color ?? fromMeta?.color ?? '#147239',
      leadTime: fromJson?.leadTime ?? fromMeta?.leadTime ?? '',
      lede: fromJson?.lede ?? fromMeta?.lede,
      photo: fromJson?.photo ?? fromMeta?.photo ?? '',
    };
  };

  const atlasLabels = {
    allMarkets: pick(page.atlas.labels.allMarkets, locale) ?? '',
    hoverHint: pick(page.atlas.labels.hoverHint, locale) ?? '',
    egyptLabel: pick(page.atlas.labels.egyptLabel, locale) ?? '',
    portLabel: pick(page.atlas.labels.portLabel, locale) ?? '',
  };

  const interpolate = (template: string | undefined, vars: Record<string, string>) =>
    (template ?? '').replace(/\$\{(\w+)\}/g, (_m, k) => vars[k] ?? '');

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
              <p className="markets-hero-sub">
                {interpolate(pick(page.hero.body, locale), { count: String(totalCountries) })}
              </p>
              <div className="markets-hero-stats">
                {page.hero.stats.map((s, i) => {
                  const num = s.num.replace('${countriesCount}', String(totalCountries));
                  return (
                    <div key={i} className="hs-stat">
                      <span className="hs-num">
                        {num}
                        {s.sup && <sup>{s.sup}</sup>}
                      </span>
                      <span className="hs-lbl">{pick(s.label, locale)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ ATLAS */}
      {page.atlas.enabled && (
        <section className="section-editorial trade-atlas-section">
          <Container>
            <div
              className="section-head"
              style={{
                marginInline: 'auto',
                textAlign: 'center',
                maxWidth: '64ch',
                marginBottom: 'var(--space-12)',
              }}
            >
              <span className="eyebrow no-rule" style={{ justifyContent: 'center' }}>
                {pick(page.atlas.eyebrow, locale)}
              </span>
              <h2 style={{ textAlign: 'center' }}>
                <SplitTitle title={page.atlas.title} locale={locale} />
              </h2>
              <p style={{ textAlign: 'center', marginInline: 'auto' }}>
                {pick(page.atlas.hint, locale)}
              </p>
            </div>
            <TradeAtlasLazy regions={markets.regions} locale={locale} labels={atlasLabels} dir={dir} />
          </Container>
        </section>
      )}

      <SectionDivider theme={theme} />

      {/* ════════════════════════════════════════════════════════ REGION SPOTLIGHTS */}
      {page.regionSpotlights.enabled && (
        <section className="region-spotlights">
          <Container>
            <div
              className="section-head"
              style={{
                marginInline: 'auto',
                textAlign: 'center',
                maxWidth: '60ch',
                marginBottom: 'var(--space-16)',
              }}
            >
              <span className="eyebrow no-rule" style={{ justifyContent: 'center' }}>
                {pick(page.regionSpotlights.eyebrow, locale)}
              </span>
              <h2 style={{ textAlign: 'center' }}>
                <SplitTitle title={page.regionSpotlights.title} locale={locale} />
              </h2>
            </div>
            <div className="spotlights-grid">
              {markets.regions.map((region, i) => {
                const meta = regionMeta(region.id);
                return (
                  <article
                    key={region.id}
                    id={`region-${region.id}`}
                    className={`region-card ${i === 0 ? 'region-card-large' : ''}`}
                    style={{ ['--region-color' as string]: meta.color } as React.CSSProperties}
                  >
                    <div className="region-image">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={meta.photo}
                        alt={`Montana frozen-food exports to ${pick(region.name, locale) ?? region.id}`}
                        width={1200}
                        height={800}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="region-image-overlay" />
                      <div className="region-image-meta">
                        <span className="region-count">
                          {region.countries.length}{' '}
                          {pick(page.regionSpotlights.countriesLabel, locale)}
                        </span>
                        <span className="region-lead-pill">{meta.leadTime}</span>
                      </div>
                    </div>
                    <div className="region-body">
                      <span className="region-eyebrow">
                        <span className="dot" /> {pick(region.name, locale)}
                      </span>
                      {meta.lede && <p className="region-lede">{pick(meta.lede, locale)}</p>}
                      <div className="region-flags">
                        {region.countries.slice(0, 8).map((c) => {
                          const cMeta = COUNTRY_META[c.iso];
                          return (
                            <span
                              key={c.iso}
                              className="region-flag"
                              title={pick(c.name, locale) ?? c.iso}
                            >
                              {cMeta?.flag ?? c.iso}
                            </span>
                          );
                        })}
                        {region.countries.length > 8 && (
                          <span className="region-flag-more">+{region.countries.length - 8}</span>
                        )}
                      </div>
                      <a href={`#country-${region.id}`} className="region-cta">
                        {interpolate(pick(page.regionSpotlights.focusLabelTemplate, locale), {
                          region: pick(region.name, locale) ?? '',
                        })}
                        <ArrowRight size={14} className="rtl:rotate-180" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ COUNTRY DIRECTORY */}
      {page.directory.enabled && (
        <section className="country-grid-section">
          <Container>
            <div className="section-head-row" style={{ marginBottom: 'var(--space-12)' }}>
              <div className="section-head" style={{ marginBottom: 0 }}>
                <span className="eyebrow">{pick(page.directory.eyebrow, locale)}</span>
                <h2>
                  {pick(page.directory.title.lead, locale)}{' '}
                  <em>{pick(page.directory.title.em, locale)}</em>
                  {page.directory.title.tail && pick(page.directory.title.tail, locale)}
                </h2>
              </div>
              <p className="country-grid-note">
                {interpolate(pick(page.directory.note, locale), {
                  count: String(totalCountries),
                })}
              </p>
            </div>
            <div className="country-grid">
              {markets.regions.map((region) => {
                const meta = regionMeta(region.id);
                return (
                  <div
                    key={region.id}
                    id={`country-${region.id}`}
                    className="country-region"
                    style={
                      {
                        ['--region-color' as string]: meta.color ?? regionColor(region.id),
                      } as React.CSSProperties
                    }
                  >
                    <div className="country-region-head">
                      <span className="cr-dot" />
                      <h3>{pick(region.name, locale)}</h3>
                      <span className="cr-count">{region.countries.length}</span>
                      {meta.leadTime && <span className="cr-lead">{meta.leadTime}</span>}
                    </div>
                    <div className="country-chips">
                      {region.countries.map((c) => {
                        const cMeta = COUNTRY_META[c.iso];
                        return (
                          <div key={c.iso} className={`country-chip ${cMeta?.hub ? 'hub' : ''}`}>
                            <span className="cc-flag">{cMeta?.flag ?? c.iso}</span>
                            <div className="cc-text">
                              <span className="cc-name">
                                {pick(c.name, locale)}
                                {cMeta?.hub && <span className="cc-hub"> · HQ</span>}
                              </span>
                              {cMeta?.port && <span className="cc-port">{cMeta.port}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ LOGISTICS */}
      {page.logistics.enabled && (
        <section className="section-editorial logistics-band on-dark">
          <Container>
            <div
              className="section-head"
              style={{ marginInline: 'auto', textAlign: 'center', maxWidth: '56ch' }}
            >
              <span className="eyebrow no-rule" style={{ justifyContent: 'center' }}>
                {pick(page.logistics.eyebrow, locale)}
              </span>
              <h2 style={{ textAlign: 'center' }}>
                {pick(page.logistics.title.lead, locale)}{' '}
                <em>{pick(page.logistics.title.em, locale)}</em>
              </h2>
              <p style={{ textAlign: 'center', marginInline: 'auto' }}>
                {pick(page.logistics.body, locale)}
              </p>
            </div>
            <ol className="logistics-steps">
              {page.logistics.steps.map((s) => (
                <li key={s.num} className="ls-step">
                  <div className="ls-num">{s.num}</div>
                  <div className="ls-card">
                    <span className="ls-label">{pick(s.label, locale)}</span>
                    <span className="ls-desc">{pick(s.description, locale)}</span>
                    <span className="ls-sub">{pick(s.sub, locale)}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ CTA BAND */}
      {page.ctaBand?.enabled && (
        <section className="section-editorial markets-cta on-dark">
          <Container>
            <div className="markets-cta-inner">
              <div>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {pick(page.ctaBand.eyebrow, locale)}
                </span>
                <h2 className="mc-title">
                  <SplitTitle title={page.ctaBand.title} locale={locale} />
                </h2>
              </div>
              <div>
                <p className="mc-sub">{pick(page.ctaBand.body, locale)}</p>
                <div className="mc-buttons">
                  {page.ctaBand.ctas.map((cta, i) => {
                    const label = pick(cta.label, locale);
                    const cls =
                      cta.variant === 'primary'
                        ? 'btn-editorial primary'
                        : cta.variant === 'on-dark-ghost'
                          ? 'btn-editorial on-dark ghost'
                          : 'btn-editorial ghost';
                    if (cta.external) {
                      return (
                        <a
                          key={i}
                          href={cta.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cls}
                        >
                          {label}
                        </a>
                      );
                    }
                    return (
                      <Link key={i} href={`/${locale}${cta.href}`} className={cls}>
                        {label}
                        <ArrowRight size={16} className="rtl:rotate-180" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

function SplitTitle({ title, locale }: { title: MarketsPage['atlas']['title']; locale: Locale }) {
  return (
    <>
      {pick(title.lead, locale)} <em>{pick(title.em, locale)}</em>
    </>
  );
}
