/**
 * Country export page — dedicated landing pages for each export market.
 *
 * Generates one page per country from content/markets.json with:
 * - SEO metadata (title, description, keywords, canonical, hreflang)
 * - Export logistics details (lead time, shipping method, photo)
 * - Popular products in that market (based on region data)
 * - JSON-LD service schema for the export offering
 *
 * Country slugs use the ISO 3166-1 alpha-2 code (e.g. /export/sa, /export/de).
 */

import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildPageMetadata,
  organizationJsonLd,
  itemListJsonLd,
  breadcrumbJsonLd,
  exportServiceJsonLd,
} from '@/lib/seo';
import { pick, getAvailableLocales, defaultLocale, type Locale } from '@/lib/i18n';
import { getSite, getFeaturedProducts } from '@/lib/content';
import marketsData from '@/content/markets.json';
export const dynamic = 'error';
export const dynamicParams = false;

/** All countries flat-listed from the markets JSON for generateStaticParams. */
interface CountryEntry {
  iso: string;
  name: Record<Locale, string>;
  regionId: string;
}

function flattenCountries(): CountryEntry[] {
  const out: CountryEntry[] = [];
  for (const region of (
    marketsData as typeof marketsData & { regions: (typeof marketsData)['regions'] }
  ).regions) {
    for (const country of region.countries) {
      out.push({ ...country, regionId: region.id });
    }
  }
  return out;
}

export async function generateStaticParams() {
  const countries = flattenCountries();
  return getAvailableLocales().flatMap((locale) =>
    countries.map((c) => ({ locale, 'country-slug': c.iso.toLowerCase() })),
  );
}

interface PageProps {
  params: Promise<{ locale: string; 'country-slug': string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, 'country-slug': countrySlug } = await params;
  const locale = raw as Locale;
  const countries = flattenCountries();
  const countryEntry = countries.find((c) => c.iso.toLowerCase() === countrySlug);
  if (!countryEntry) return {};

  const region = (
    marketsData as typeof marketsData & { regions: (typeof marketsData)['regions'] }
  ).regions.find((r) => r.id === countryEntry.regionId)!;

  const t = await getTranslations({ locale, namespace: 'product' });
  const countryName = pick(countryEntry.name, locale) ?? countryEntry.iso;
  const regionName = pick(region.name, locale) ?? '';

  // SEO title and description are generated with buyer-intent keywords.
  const seoTitle = `Export Frozen Foods to ${countryName} — Montana Certified Supplier`;
  const seoDescription =
    `Montana exports premium IQF frozen vegetables, fruits, and specialties to ${countryName}. ` +
    `Lead time: ${region.leadTime}. BRCGS, HACCP, ISO certified. Contact our export desk for specs and pricing.`;

  // Popular products in the region (derived from region spotlight data).
  const popularProductSlugs = getRegionPopularProducts(countryEntry.regionId);

  return buildPageMetadata({
    locale,
    path: `/export/${countrySlug}`,
    title: `${countryName} — Export Frozen Foods | Montana`,
    description: seoDescription,
    keywords: [
      `frozen food exporter to ${countryName.toLowerCase()}`,
      `frozen vegetables export to ${countryName.toLowerCase()}`,
      `Montana frozen foods ${countryName.toLowerCase()}`,
      `Egyptian frozen food supplier to ${countryName.toLowerCase()}`,
      regionName,
      'IQF',
      'HACCP certified',
    ],
  });
}

/** Derive popular product slugs from the country's region. */
function getRegionPopularProducts(regionId: string): string[] {
  const regionMap: Record<string, string[]> = {
    gcc: ['molokhia', 'okra', 'vine-leaves', 'falafel'],
    'middle-east': ['molokhia', 'okra', 'spinach', 'mixed-vegetables'],
    'north-africa': ['molokhia', 'okra', 'frozen-coriander', 'spinach'],
    europe: ['broccoli', 'cauliflower', 'mango', 'strawberry', 'artichoke'],
    asia: ['mango', 'strawberry', 'mixed-vegetables', 'sweet-corn'],
    'north-america': ['mango', 'strawberry', 'artichoke', 'mixed-vegetables'],
    oceania: ['mango', 'strawberry', 'artichoke', 'pineapple'],
  };
  return regionMap[regionId] ?? [];
}

export default async function CountryExportPage({ params }: PageProps) {
  const { locale: raw, 'country-slug': countrySlug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const countries = flattenCountries();
  const countryEntry = countries.find((c) => c.iso.toLowerCase() === countrySlug);
  if (!countryEntry) notFound();

  const region = (
    marketsData as typeof marketsData & { regions: (typeof marketsData)['regions'] }
  ).regions.find((r) => r.id === countryEntry.regionId)!;

  const tCommon = await getTranslations({ locale, namespace: 'common' });

  // Popular products for this market.
  const popularSlugs = getRegionPopularProducts(countryEntry.regionId);
  const [site, products] = await Promise.all([getSite(), getFeaturedProducts()]);

  // Load featured products and check which match our popular slugs.
  const popularProducts = products.filter((p) => popularSlugs.includes(p.slug)).slice(0, 6);

  // Build breadcrumb items.
  const countryNameEn = pick(countryEntry.name, 'en') ?? countryEntry.iso;
  const breadcrumbs = [
    { name: tCommon('breadcrumb.home'), href: `/${locale}` },
    { name: 'Export Markets', href: `/${locale}/markets` },
    { name: countryNameEn, href: `/${locale}/export/${countrySlug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(site, locale),
          exportServiceJsonLd(
            { name: countryNameEn, iso: countryEntry.iso },
            { leadTime: region.leadTime, name: region.name },
            locale as Locale,
          ),
          breadcrumbJsonLd(breadcrumbs),
          itemListJsonLd(
            popularProducts.map((p) => ({
              name: p.name.en,
              url: `/${locale}/catalog/${p.slug}`,
              image: `${site.brand.logoUrl}`, // placeholder — product-specific images in real implementation
            })),
            {
              name: `Montana Export to ${countryNameEn}`,
              description: `Frozen food export offerings for ${countryNameEn} — IQF vegetables, fruits and specialties.`,
              url: `/${locale}/export/${countrySlug}`,
            },
          ),
        ]}
      />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <Section spacing="lg" background="muted">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            {region.color && (
              <span
                className="eyebrow mb-4 inline-block rounded-full px-3 py-1 text-sm font-medium"
                style={{ background: `${region.color}18`, color: region.color }}
              >
                {pick(region.name, locale)} · {region.leadTime}
              </span>
            )}
            <h1 className="text-display-xl text-brand-primary mb-4 font-bold">
              Export Frozen Foods to{' '}
              <span className="text-brand-accent">{pick(countryEntry.name, locale)}</span>
            </h1>
            <p className="text-body-lg text-text-muted mx-auto max-w-prose">
              {pick(region.lede, locale)} — from our certified facility in Qalyub, Egypt.
            </p>
          </div>
        </Container>
      </Section>

      {/* ─── EXPORT DETAILS ───────────────────────────────────── */}
      <Section>
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 grid gap-6 md:grid-cols-3">
              <div className="export-detail-card bg-surface-muted rounded-xl p-4">
                <dt className="text-body-sm text-text-subtle mb-1 font-medium">Lead Time</dt>
                <dd className="text-display-md text-brand-primary font-semibold">
                  {region.leadTime}
                </dd>
              </div>
              <div className="export-detail-card bg-surface-muted rounded-xl p-4">
                <dt className="text-body-sm text-text-subtle mb-1 font-medium">Shipping Route</dt>
                <dd className="text-body-lg font-semibold">
                  {pick(region.lede, locale)?.split('.')[0] ?? 'Egypt'}
                </dd>
              </div>
              <div className="export-detail-card bg-surface-muted rounded-xl p-4">
                <dt className="text-body-sm text-text-subtle mb-1 font-medium">Certifications</dt>
                <dd className="text-body-md font-semibold">BRCGS · IFS · ISO 22000 · HACCP</dd>
              </div>
            </div>

            {/* Popular Products in this Market */}
            {popularProducts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-body-xl mb-6 font-semibold">
                  Popular products in {pick(countryEntry.name, locale)}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {popularProducts.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/${locale}/catalog/${product.slug}`}
                      className="group border-border-default hover:border-brand-primary block rounded-xl border p-4 transition-colors"
                    >
                      <div className="relative mb-3 aspect-video">
                        <Image
                          src={product.images.primary}
                          alt={pick(product.name, locale) ?? ''}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <h3 className="text-body-md group-hover:text-brand-primary font-semibold">
                        {pick(product.name, locale)}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="cta-strip-editorial on-dark mx-auto max-w-2xl rounded-2xl p-8 text-center">
              <h3 className="text-display-md mb-2 font-bold">
                Ready to export to {pick(countryEntry.name, locale)}?
              </h3>
              <p className="text-body-md mb-6 text-white/70">
                Our export team will provide specs, MOQ, pricing and lead time for your market.
              </p>
              <Link href={`/${locale}/contact`} className="btn-editorial primary inline-block">
                Request a Quote for {pick(countryEntry.name, locale)}
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

// ─── DYNAMIC ROUTE REGISTRATION (for lib/routes.ts) ──────────────────
// This page is a dynamic route registered in DYNAMIC_ROUTES of src/lib/routes.ts.
// It should NOT be listed in STATIC_ROUTES. The sitemap will need to be updated
// to include /export/[country-slug] entries from markets.json.
