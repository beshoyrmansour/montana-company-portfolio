import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { NewsGrid, NewsletterForm } from '@/components/news/NewsGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { getAllNewsArticles, getNewsPage } from '@/lib/content';
import { pick, type Locale } from '@/lib/i18n';
import { isRouteHidden } from '@/lib/feature-flags';
import { buildPageMetadata, itemListJsonLd, BASE_URL } from '@/lib/seo';

export const dynamic = 'error';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const page = await getNewsPage();
  const lead = pick(page.hero.headline.lead, locale) ?? '';
  const em = pick(page.hero.headline.em, locale) ?? '';
  const heroTitle = `${lead} ${em}`.trim();
  return buildPageMetadata({
    locale,
    path: '/news',
    title: pick(page.seo?.title, locale) ?? (heroTitle || 'News'),
    description: pick(page.seo?.description, locale) ?? pick(page.hero.subtitle, locale) ?? '',
    keywords: page.seo?.keywords ?? [
      'Montana news',
      'frozen food industry news',
      'Egyptian food export news',
      'HACCP certification news',
      'molokhia export',
    ],
    ogImage: page.seo?.ogImage,
  });
}

/**
 * News index — fully JSON-driven from content/pages/news.json.
 * Sections: hero, featured + filter + grid, newsletter CTA.
 */
export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (isRouteHidden('news')) notFound();
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [articles, page] = await Promise.all([getAllNewsArticles(), getNewsPage()]);

  const listLabels = {
    all: pick(page.list.allLabel, locale) ?? '',
    featured: pick(page.list.featuredLabel, locale) ?? '',
    readMinSuffix: pick(page.list.readMinSuffix, locale) ?? '',
    readMore: pick(page.list.readMoreLabel, locale) ?? '',
    empty: pick(page.list.emptyMessage, locale) ?? '',
    categories: page.list.categories.map((c) => ({
      id: c.id,
      label: pick(c.label, locale) ?? c.id,
    })),
  };

  const newsListTitle =
    `${pick(page.hero.headline.lead, locale) ?? ''} ${
      pick(page.hero.headline.em, locale) ?? ''
    }`.trim() || 'News';
  const itemList =
    articles.length > 0
      ? itemListJsonLd(
          articles.map((a) => ({
            name: pick(a.title, locale) ?? a.slug,
            url: `${BASE_URL}/${locale}/news/${a.slug}`,
            image: `${BASE_URL}${a.coverImage}`,
          })),
          {
            name: newsListTitle,
            description: pick(page.hero.subtitle, locale),
            url: `${BASE_URL}/${locale}/news`,
          },
        )
      : null;

  return (
    <>
      {itemList && <JsonLd data={itemList} />}
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

      {/* ════════════════════════════════════════════════════════ LIST */}
      {page.list.enabled && (
        <section className="section-editorial" style={{ paddingTop: 'var(--space-8)' }}>
          <Container>
            {articles.length === 0 ? (
              <p
                className="text-body-lg text-text-muted text-center"
                style={{ paddingBlock: 'var(--space-12)' }}
              >
                {listLabels.empty}
              </p>
            ) : (
              <NewsGrid articles={articles} locale={locale} labels={listLabels} />
            )}
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ NEWSLETTER */}
      {page.newsletter?.enabled && (
        <section className="section-editorial markets-cta on-dark">
          <Container>
            <div className="markets-cta-inner">
              <div>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {pick(page.newsletter.eyebrow, locale)}
                </span>
                <h2 className="mc-title">
                  {pick(page.newsletter.title.lead, locale)}{' '}
                  <em>{pick(page.newsletter.title.em, locale)}</em>
                </h2>
              </div>
              <div>
                <p className="mc-sub">{pick(page.newsletter.body, locale)}</p>
                <NewsletterForm
                  locale={locale}
                  labels={{
                    placeholder: page.newsletter.placeholder,
                    submit: pick(page.newsletter.submitLabel, locale) ?? '',
                    success: pick(page.newsletter.successMessage, locale) ?? '',
                  }}
                />
              </div>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
