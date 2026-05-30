import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGallery } from '@/components/product/ProductGallery';
import { SeasonalCalendar } from '@/components/product/SeasonalCalendar';
import { VarietyCards } from '@/components/product/VarietyCards';
import { PackagingTable } from '@/components/product/PackagingTable';
import { JsonLd } from '@/components/seo/JsonLd';
import { productJsonLd, breadcrumbJsonLd, buildPageMetadata } from '@/lib/seo';
import { getAvailableLocales, pick, type Locale } from '@/lib/i18n';
import { getAllProductSlugs, getProduct, getAllProducts, getSite } from '@/lib/content';

export const dynamic = 'error';
export const dynamicParams = false;

export async function generateStaticParams() {
  const locales = getAvailableLocales();
  const slugs = await getAllProductSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  const product = await getProduct(slug);
  if (!product) return {};
  const name = pick(product.name, locale) ?? product.slug;
  const seoTitle = pick(product.seo?.title, locale) ?? `${name} — Frozen, IQF`;
  const seoDescription =
    pick(product.seo?.description, locale) ??
    pick(product.shortDescription, locale) ??
    pick(product.description, locale) ??
    '';
  return buildPageMetadata({
    locale,
    path: `/catalog/${product.slug}`,
    title: seoTitle,
    description: seoDescription,
    keywords: product.seo?.keywords ?? [
      `frozen ${name.toLowerCase()}`,
      `${name.toLowerCase()} IQF`,
      `${name.toLowerCase()} exporter Egypt`,
      'Montana frozen foods',
      product.category,
    ],
    ogImage: product.images.primary,
    ogType: 'website',
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProduct(slug);
  if (!product) notFound();

  const [allProducts, site, tProduct, tCommon] = await Promise.all([
    getAllProducts(),
    getSite(),
    getTranslations({ locale, namespace: 'product' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);
  const related = product.relatedSlugs
    .map((s) => allProducts.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  const productName = pick(product.name, locale as Locale) ?? product.slug;
  const salesEmail = site.contact.office.email;
  const mailtoSubject = encodeURIComponent(`Product inquiry: ${productName}`);
  const mailtoBody = encodeURIComponent(
    `Hello Montana,\n\nI'd like to know more about ${productName}.\n\n` +
      `Please share available varieties / sizes, packaging options, ` +
      `minimum order quantity, and lead time to my market.\n\n` +
      `My market / country:\n\n— Best,\n`,
  );

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product, locale as Locale),
          breadcrumbJsonLd([
            { name: tProduct('breadcrumb.home'), href: `/${locale}` },
            { name: tProduct('breadcrumb.catalog'), href: `/${locale}/catalog` },
            { name: productName, href: `/${locale}/catalog/${product.slug}` },
          ]),
        ]}
      />

      {/* ─── HEAD: image + meta (Superfood Grocery style) ─── */}
      <Section spacing="lg" background="muted">
        <Container>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-body-sm mb-8 flex items-center gap-1">
            <Link
              href={`/${locale}`}
              className="text-text-muted hover:text-brand-primary hover:underline"
            >
              {tProduct('breadcrumb.home')}
            </Link>
            <ChevronRight className="text-text-subtle h-4 w-4 rtl:rotate-180" aria-hidden />
            <Link
              href={`/${locale}/catalog`}
              className="text-text-muted hover:text-brand-primary hover:underline"
            >
              {tProduct('breadcrumb.catalog')}
            </Link>
            <ChevronRight className="text-text-subtle h-4 w-4 rtl:rotate-180" aria-hidden />
            <span className="text-text font-semibold">{productName}</span>
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-16">
            {/* IMAGE — 3/5 cols */}
            <div className="lg:col-span-3">
              <ProductGallery
                images={[product.images.primary, ...product.images.gallery].filter(
                  (src, i, arr) => arr.indexOf(src) === i,
                )}
                alt={`${productName} — Montana frozen`}
              />
            </div>

            {/* META — 2/5 cols */}
            <div className="lg:col-span-2">
              {/* Category eyebrow */}
              <span className="eyebrow mb-4 block">{product.category}</span>

              {/* Editorial title */}
              <h1 className="display text-display-lg lg:text-display-xl mb-4 leading-[1.0]">
                {productName}
              </h1>

              {/* Badges */}
              {product.badges.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {product.badges.map((b) => (
                    <Badge key={b} variant={b}>
                      {b}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Short description */}
              <p className="text-body-lg text-text-muted mb-8 leading-relaxed">
                {pick(product.shortDescription, locale as Locale)}
              </p>

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                <Link href={`/${locale}/contact?product=${product.slug}`}>
                  <Button variant="primary" size="lg" fullWidth>
                    {tProduct('inquire')}
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <a href={`mailto:${salesEmail}?subject=${mailtoSubject}&body=${mailtoBody}`}>
                    <Button variant="secondary" size="md" fullWidth>
                      {tProduct('emailDirectly')}
                    </Button>
                  </a>
                  <a
                    href="/docs/Montana-Catalogue.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Button variant="ghost" size="md" fullWidth>
                      PDF
                    </Button>
                  </a>
                </div>
              </div>

              <p className="text-body-sm text-text-muted mt-6">{tCommon('replyAssurance')}</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ─── DESCRIPTION ─── */}
      {pick(product.description, locale as Locale) && (
        <Section spacing="md">
          <Container width="narrow">
            <div className="prose">
              <p>{pick(product.description, locale as Locale)}</p>
            </div>
          </Container>
        </Section>
      )}

      {/* ─── VARIETIES ─── */}
      {product.varieties.length > 0 && (
        <Section spacing="md" background="cream">
          <Container>
            <VarietyCards
              varieties={product.varieties}
              locale={locale as Locale}
              title={tProduct('varieties')}
            />
          </Container>
        </Section>
      )}

      {/* ─── PACKAGING ─── */}
      {product.packaging.length > 0 && (
        <Section spacing="md">
          <Container width="narrow">
            <PackagingTable
              packaging={product.packaging}
              title={tProduct('packaging')}
              labels={{
                type: tProduct('packagingType'),
                weight: tProduct('packagingWeight'),
                perCarton: tProduct('packagingPerCarton'),
              }}
            />
          </Container>
        </Section>
      )}

      {/* ─── SEASONALITY ─── */}
      <Section spacing="md" background="muted">
        <Container width="narrow">
          <SeasonalCalendar
            months={product.seasonality}
            locale={locale as Locale}
            title={tProduct('seasonality')}
          />
        </Container>
      </Section>

      {/* ─── RELATED ─── */}
      {related.length > 0 && (
        <Section spacing="lg">
          <Container>
            <h2 className="text-display mb-8 font-bold">{tProduct('related')}</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} locale={locale as Locale} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
