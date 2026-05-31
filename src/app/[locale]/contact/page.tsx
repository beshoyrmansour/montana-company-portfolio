import fs from 'node:fs';
import path from 'node:path';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { InquiryForm } from '@/components/contact/InquiryForm';
import { FaqAccordion } from '@/components/contact/FaqAccordion';
import { JsonLd } from '@/components/seo/JsonLd';
import { getContactPage, getSite } from '@/lib/content';
import { pick, type Locale } from '@/lib/i18n';
import { isRouteHidden } from '@/lib/feature-flags';
import { buildPageMetadata, faqPageJsonLd, localBusinessJsonLd } from '@/lib/seo';
import type { ContactPage } from '@/schemas/page';

export const dynamic = 'error';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const page = await getContactPage();
  const lead = pick(page.hero.headline.lead, locale) ?? '';
  const em = pick(page.hero.headline.em, locale) ?? '';
  const heroTitle = `${lead} ${em}`.trim();
  return buildPageMetadata({
    locale,
    path: '/contact',
    title: pick(page.seo?.title, locale) ?? (heroTitle || 'Contact Montana'),
    description: pick(page.seo?.description, locale) ?? pick(page.hero.subtitle, locale) ?? '',
    keywords: page.seo?.keywords ?? [
      'contact Montana frozen foods',
      'export sales Egypt',
      'frozen food B2B inquiry',
      'Qalyub factory',
      'Cairo office',
    ],
    ogImage: page.seo?.ogImage,
  });
}

// Inline the Egypt governorate map at module load (server-side only).
// Source: public/images/maps/egypt.svg — width 548.58221, height 498.86664,
// geoViewBox "24.697924 31.667680 36.894654 21.724740" (lon/lat).
const EGYPT_SVG_INNER = fs
  .readFileSync(path.join(process.cwd(), 'public/images/maps/egypt.svg'), 'utf8')
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .replace(/<path/g, '<path class="egypt-region"');

/**
 * Contact — fully JSON-driven from content/pages/contact.json.
 * Sections: hero, inquiry form, offices, map card, FAQ.
 */
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (isRouteHidden('contact')) notFound();
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [page, site] = await Promise.all([getContactPage(), getSite()]);

  const faqItems = page.faq.enabled
    ? page.faq.items
        .filter((item) => item.visible !== false)
        .map((item) => ({
          q: pick(item.q, locale) ?? '',
          a: pick(item.a, locale) ?? '',
        }))
        .filter((it) => it.q && it.a)
    : [];

  const formLabels = {
    reasonQ: pick(page.form.reasonLabel, locale) ?? '',
    reasons: page.form.reasons.map((r) => ({
      id: r.id,
      label: pick(r.label, locale) ?? r.id,
    })),
    name: {
      label: pick(page.form.fields.name.label, locale) ?? '',
      placeholder: pick(page.form.fields.name.placeholder, locale) ?? '',
    },
    company: {
      label: pick(page.form.fields.company.label, locale) ?? '',
      placeholder: pick(page.form.fields.company.placeholder, locale) ?? '',
    },
    email: {
      label: pick(page.form.fields.email.label, locale) ?? '',
      placeholder: page.form.fields.email.placeholder,
    },
    country: {
      label: pick(page.form.fields.country.label, locale) ?? '',
      placeholder: pick(page.form.fields.country.placeholder, locale) ?? '',
    },
    message: {
      label: pick(page.form.fields.message.label, locale) ?? '',
      placeholder: pick(page.form.fields.message.placeholder, locale) ?? '',
    },
    note: pick(page.form.note, locale) ?? '',
    submit: pick(page.form.submit, locale) ?? '',
    successTitle: pick(page.form.successTitle, locale) ?? '',
    successBody: pick(page.form.successBody, locale) ?? '',
    sendAnother: pick(page.form.sendAnother, locale) ?? '',
  };

  return (
    <>
      <JsonLd
        data={[
          localBusinessJsonLd(site, locale),
          ...(faqItems.length > 0 ? [faqPageJsonLd(faqItems)] : []),
        ]}
      />

      {/* ════════════════════════════════════════════════════════ HERO */}
      {page.hero.enabled && (
        <section className="markets-hero">
          <Container>
            <div className="markets-hero-inner">
              <span className="eyebrow">{pick(page.hero.eyebrow, locale)}</span>
              <h1 className="markets-hero-title">
                <span className="muted">{pick(page.hero.headline.lead, locale)}</span>{' '}
                <em>{pick(page.hero.headline.em, locale)}</em>
              </h1>
              <p className="markets-hero-sub">{pick(page.hero.subtitle, locale)}</p>
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ FORM */}
      {page.form.enabled && (
        <section className="section-editorial" style={{ paddingTop: 0 }}>
          <Container>
            <InquiryForm locale={locale} labels={formLabels} />
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ OFFICES */}
      {page.offices.enabled && (
        <section className="offices-section">
          <Container>
            <div
              className="section-head"
              style={{
                marginInline: 'auto',
                textAlign: 'center',
                maxWidth: '52ch',
                marginBottom: 'var(--space-12)',
              }}
            >
              <span className="eyebrow no-rule" style={{ justifyContent: 'center' }}>
                {pick(page.offices.eyebrow, locale)}
              </span>
              <h2 style={{ textAlign: 'center' }}>
                <SplitTitle title={page.offices.title} locale={locale} />
              </h2>
            </div>
            <div className="offices-grid">
              {page.offices.items
                .filter((o) => o.visible !== false)
                .map((o) => {
                  const telHref = o.tel.replace(/[^\d+]/g, '');
                  return (
                    <article key={o.email} className="office-card">
                      <span className="office-eyebrow">{pick(o.role, locale)}</span>
                      <h3 className="office-title">
                        {pick(o.city, locale)}
                        <span className="office-country">{pick(o.country, locale)}</span>
                      </h3>
                      <p className="office-address">{pick(o.address, locale)}</p>
                      <dl className="office-meta">
                        <div>
                          <dt>{pick(page.form.telLabel, locale)}</dt>
                          <dd>
                            <a href={`tel:${telHref}`} dir="ltr">
                              {o.tel}
                            </a>
                          </dd>
                        </div>
                        <div>
                          <dt>{pick(page.form.emailLabel, locale)}</dt>
                          <dd>
                            <a href={`mailto:${o.email}`}>{o.email}</a>
                          </dd>
                        </div>
                        <div>
                          <dt>{pick(page.form.hoursLabel, locale)}</dt>
                          <dd>{pick(o.hours, locale)}</dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ MAP CARD */}
      {page.map.enabled && (
        <section className="section-editorial contact-map-section">
          <Container>
            <div className="contact-map-card">
              <div className="contact-map-info">
                <span className="eyebrow">{pick(page.map.eyebrow, locale)}</span>
                <h2>
                  <SplitTitle title={page.map.title} locale={locale} />
                </h2>
                <p>{pick(page.map.body, locale)}</p>
                <div className="contact-map-actions">
                  {page.map.actions.map((a, i) => {
                    const label = pick(a.label, locale);
                    if (a.external) {
                      return (
                        <a
                          key={i}
                          className="btn-editorial ghost sm"
                          href={a.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {label}
                        </a>
                      );
                    }
                    return (
                      <a key={i} className="btn-editorial ghost sm" href={a.href}>
                        {label}
                      </a>
                    );
                  })}
                </div>
              </div>
              <div className="contact-map-svg">
                <svg viewBox="0 0 548.58 498.87" aria-hidden="true">
                  {/* Egypt governorate outlines, inlined from public/images/maps/egypt.svg */}
                  <g
                    className="egypt-shape"
                    dangerouslySetInnerHTML={{ __html: EGYPT_SVG_INNER }}
                  />
                  {/* Nile + delta — schematic blue path overlaying the country */}
                  <path
                    d="M 255 12 Q 268 35 285 60 L 294 81 Q 285 150 290 220 Q 305 260 325 295 L 370 380 L 370 478"
                    fill="none"
                    stroke="#4F8EC0"
                    strokeWidth="3"
                    opacity="0.55"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 320 12 Q 308 38 295 60"
                    fill="none"
                    stroke="#4F8EC0"
                    strokeWidth="2.5"
                    opacity="0.5"
                    strokeLinecap="round"
                  />
                  {/* Qalyub marker — lon 31.21391, lat 30.22929 → x≈293, y≈72 */}
                  <g>
                    <circle
                      cx="293"
                      cy="72"
                      r="22"
                      fill="var(--color-brand-primary)"
                      opacity="0.18"
                    >
                      <animate
                        attributeName="r"
                        values="18;32;18"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.3;0;0.3"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle
                      cx="293"
                      cy="72"
                      r="8"
                      fill="var(--color-brand-primary)"
                      stroke="white"
                      strokeWidth="2.5"
                    />
                  </g>
                  <text
                    className="egypt-map-label egypt-map-label--hq"
                    x="308"
                    y="68"
                    fontFamily="var(--font-display)"
                    fontStyle="italic"
                    fontSize="18"
                    fill="currentColor"
                  >
                    {pick(page.map.svgLabels.hq, locale)}
                  </text>
                  <text
                    className="egypt-map-label egypt-map-label--hq"
                    x="308"
                    y="86"
                    fontSize="12"
                    fill="currentColor"
                    opacity="0.6"
                  >
                    {pick(page.map.svgLabels.hqSub, locale)}
                  </text>
                  {/* Cairo — lon 31.23571, lat 30.04442 → x≈294, y≈81 */}
                  <circle cx="294" cy="86" r="3" fill="currentColor" opacity="0.55" />
                  <text
                    className="egypt-map-label egypt-map-label--city"
                    x="302"
                    y="100"
                    fontSize="11"
                    fill="currentColor"
                    opacity="0.55"
                  >
                    {pick(page.map.svgLabels.cairo, locale)}
                  </text>
                  {/* Alexandria — lon 29.91874, lat 31.20009 → x≈235, y≈23 */}
                  <circle cx="235" cy="23" r="3" fill="currentColor" opacity="0.55" />
                  <text
                    className="egypt-map-label egypt-map-label--city"
                    x="243"
                    y="27"
                    fontSize="11"
                    fill="currentColor"
                    opacity="0.55"
                  >
                    {pick(page.map.svgLabels.alexandria, locale)}
                  </text>
                </svg>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ FAQ */}
      {page.faq.enabled && (
        <section className="section-editorial">
          <Container>
            <div className="section-head-row" style={{ marginBottom: 'var(--space-12)' }}>
              <div className="section-head" style={{ marginBottom: 0 }}>
                <span className="eyebrow">{pick(page.faq.eyebrow, locale)}</span>
                <h2>
                  <SplitTitle title={page.faq.title} locale={locale} />
                </h2>
              </div>
            </div>
            <FaqAccordion items={faqItems} />
          </Container>
        </section>
      )}
    </>
  );
}

function SplitTitle({ title, locale }: { title: ContactPage['offices']['title']; locale: Locale }) {
  return (
    <>
      {pick(title.lead, locale)} <em>{pick(title.em, locale)}</em>
    </>
  );
}
