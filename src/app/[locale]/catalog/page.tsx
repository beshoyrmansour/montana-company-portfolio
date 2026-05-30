import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Download } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { CategoryFilter } from '@/components/sections/CategoryFilter';
import { SectionDivider } from '@/components/decoration/Ornaments';
import { HarvestCalendar } from '@/components/catalog/HarvestCalendar';
import { ProductCard } from '@/components/product/ProductCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { getAllProducts, getCatalogPage } from '@/lib/content';
import { pick, type Locale } from '@/lib/i18n';
import { getActiveTheme } from '@/lib/theme';
import { buildPageMetadata, itemListJsonLd, BASE_URL } from '@/lib/seo';
import type { CatalogPage } from '@/schemas/page';

export const dynamic = 'error';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const page = await getCatalogPage();
  const titleLead = pick(page.hero.title, locale) ?? '';
  const titleEm = pick(page.hero.titleEm, locale) ?? '';
  const heroTitle = `${titleLead} ${titleEm}`.trim();
  return buildPageMetadata({
    locale,
    path: '/catalog',
    title: pick(page.seo?.title, locale) ?? (heroTitle || 'Catalog'),
    description: pick(page.seo?.description, locale) ?? pick(page.hero.subtitle, locale) ?? '',
    keywords: page.seo?.keywords ?? [
      'frozen vegetable catalog',
      'frozen fruit catalog',
      'IQF molokhia',
      'frozen okra',
      'frozen artichoke',
      'frozen strawberry',
      'frozen mixed vegetables',
      'B2B export catalog',
    ],
    ogImage: page.seo?.ogImage,
  });
}

/**
 * Catalog index — fully JSON-driven from content/pages/catalog.json.
 *
 * Sections (each toggleable via JSON `enabled` flag):
 *   1. Hero        — eyebrow + split title + subtitle + 2 CTAs
 *   2. Signatures  — N hand-picked products (slugs in JSON)
 *   3. Catalogue   — filter pills + full product grid
 *   4. Calendar    — 12-month × N-product peak-season grid
 *   5. CTA band    — export desk + PDF
 */
export default async function CatalogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const theme = getActiveTheme();

  const [products, page] = await Promise.all([getAllProducts(), getCatalogPage()]);

  const signatures = page.signatures.slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const totalCount = products.length;
  const catalogTitle =
    pick(page.catalog.titleTemplate, locale)?.replace('${count}', String(totalCount)) ?? '';

  const catalogTitleLead = pick(page.hero.title, locale) ?? '';
  const catalogTitleEm = pick(page.hero.titleEm, locale) ?? '';
  const itemList = itemListJsonLd(
    products.map((p) => ({
      name: pick(p.name, locale) ?? p.slug,
      url: `${BASE_URL}/${locale}/catalog/${p.slug}`,
      image: `${BASE_URL}${p.images.primary}`,
    })),
    {
      name: `${catalogTitleLead} ${catalogTitleEm}`.trim() || 'Montana Catalog',
      description: pick(page.hero.subtitle, locale),
      url: `${BASE_URL}/${locale}/catalog`,
    },
  );

  return (
    <>
      <JsonLd data={itemList} />
      {/* ════════════════════════════════════════════════════════ HERO */}
      {page.hero.enabled && (
        <section className="section-editorial">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <span
                className="eyebrow no-rule mb-6 inline-flex"
                style={{ justifyContent: 'center' }}
              >
                {pick(page.hero.eyebrow, locale)}
              </span>
              <h1
                className="display mb-6"
                style={{
                  fontSize: 'clamp(2.5rem, 5vw + 1rem, 5rem)',
                  lineHeight: 1.05,
                  letterSpacing: 'var(--tracking-display)',
                  color: 'var(--color-text)',
                }}
              >
                {pick(page.hero.title, locale)}, <em>{pick(page.hero.titleEm, locale)}</em>
              </h1>
              <p className="text-body-lg text-text-muted mx-auto mb-10 max-w-2xl leading-relaxed">
                {pick(page.hero.subtitle, locale)}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={page.hero.catalogueHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="btn-editorial primary"
                >
                  <Download size={16} />
                  {page.hero.ctaDownloadLabel ? pick(page.hero.ctaDownloadLabel, locale) : null}
                </a>
                <Link
                  href={`/${locale}${page.hero.ctaContactHref}`}
                  className="btn-editorial ghost"
                >
                  {pick(page.hero.ctaContactLabel, locale)}
                  <ArrowRight size={16} className="rtl:rotate-180" />
                </Link>
              </div>
            </div>
            {/* Product-family showcase — Montana's actual retail range */}
            <div className="mt-12 lg:mt-16">
              <Image
                src="/images/products/7-Packs-link.png"
                alt="The Montana frozen range — Green Beans, Vegetable Soup, Molokheya, Artichoke Bottoms, Peas &amp; Carrots, Okra and Vine Leaves in a basket"
                width={2105}
                height={1897}
                priority
                sizes="(max-width: 768px) 100vw, 860px"
                className="mx-auto h-auto w-full max-w-4xl"
              />
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ SIGNATURES */}
      {page.signatures.enabled && signatures.length > 0 && (
        <section className="section-editorial section-tinted" style={{ paddingTop: 0 }}>
          <Container>
            <SectionDivider theme={theme} />
            <div
              className="section-head"
              style={{ marginInline: 'auto', textAlign: 'center', maxWidth: '52ch' }}
            >
              <span className="eyebrow no-rule" style={{ justifyContent: 'center' }}>
                {pick(page.signatures.eyebrow, locale)}
              </span>
              <h2 style={{ textAlign: 'center' }}>
                <SplitTitle title={page.signatures.title} locale={locale} />
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {signatures.map((product, idx) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  locale={locale}
                  priority={idx < 3}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ CATALOGUE */}
      {page.catalog.enabled && (
        <section className="section-editorial">
          <Container>
            <div className="section-head-row" style={{ marginBottom: 'var(--space-12)' }}>
              <div className="section-head" style={{ marginBottom: 0 }}>
                <span className="eyebrow">{pick(page.catalog.eyebrow, locale)}</span>
                <h2>
                  {catalogTitle} <em>{pick(page.catalog.titleEm, locale)}</em>
                </h2>
              </div>
            </div>
            <CategoryFilter
              products={products}
              locale={locale}
              labels={{
                all: pick(page.catalog.filters.all, locale) ?? '',
                vegetable: pick(page.catalog.filters.vegetable, locale) ?? '',
                fruit: pick(page.catalog.filters.fruit, locale) ?? '',
                leaf: pick(page.catalog.filters.leaf, locale) ?? '',
                specialty: pick(page.catalog.filters.specialty, locale) ?? '',
              }}
            />
          </Container>
        </section>
      )}

      <SectionDivider theme={theme} />

      {/* ════════════════════════════════════════════════════════ HARVEST CALENDAR */}
      {page.harvestCalendar.enabled && (
        <section className="section-editorial section-tinted">
          <Container>
            <HarvestCalendar
              products={products}
              locale={locale}
              labels={{
                eyebrow: pick(page.harvestCalendar.eyebrow, locale) ?? '',
                title: <SplitTitle title={page.harvestCalendar.title} locale={locale} />,
                intro: pick(page.harvestCalendar.intro, locale) ?? '',
              }}
            />
          </Container>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════ CTA BAND */}
      {page.ctaBand?.enabled && (
        <section className="section-editorial cta-strip-editorial on-dark">
          <Container>
            <div className="cta-inner-editorial">
              <div>
                <span
                  className="eyebrow"
                  style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 'var(--space-4)' }}
                >
                  {pick(page.ctaBand.eyebrow, locale)}
                </span>
                <h2 style={{ marginTop: 'var(--space-2)' }}>
                  {pick(page.ctaBand.title.lead, locale)}{' '}
                  <em>{pick(page.ctaBand.title.em, locale)}</em>
                </h2>
              </div>
              <div>
                <p>{pick(page.ctaBand.body, locale)}</p>
                <div className="cta-buttons-editorial" style={{ marginTop: 'var(--space-8)' }}>
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
                          {cta.icon === 'Download' && <Download size={16} />}
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

function SplitTitle({
  title,
  locale,
}: {
  title: CatalogPage['signatures']['title'];
  locale: Locale;
}) {
  return (
    <>
      {pick(title.lead, locale)} <em>{pick(title.em, locale)}</em>
    </>
  );
}
