/**
 * SEO helpers — JSON-LD generators, metadata builders, and hreflang.
 * Schemas align with spec 09-seo-performance.md.
 *
 * Per Google guidance for B2B (no public prices), Product schema is emitted
 * for entity understanding only — no rich-snippet eligibility expected.
 */

import type { Metadata } from 'next';
import type { Site } from '@/schemas/site';
import type { Product } from '@/schemas/product';
import type { NewsArticle } from '@/schemas/news';
import type { Locale } from '@/lib/i18n';
import { pick, getAvailableLocales, defaultLocale } from '@/lib/i18n';

/**
 * Canonical/OG base URL. Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL  — explicit override (set to the custom domain in prod)
 *   2. VERCEL_PROJECT_PRODUCTION_URL — stable production domain Vercel injects at build
 *   3. VERCEL_URL — per-deployment URL (preview builds)
 *   4. https://montanaeg.com — last-resort production fallback (the canonical domain)
 *   5. localhost — local dev
 * This is the SINGLE source of truth for the site origin: canonical/OG/JSON-LD
 * (via BASE_URL) AND sitemap.ts/robots.ts all import it, so they can never drift
 * onto different domains. Without this, og:image/og:url fell back to localhost on
 * Vercel, so WhatsApp / social link cards had no fetchable image.
 */
function resolveBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const isLocal = (u?: string) => !u || /localhost|127\.0\.0\.1/.test(u);
  // Honour an explicit URL only if it's a real public host. A Vercel env var of
  // http://localhost:3000 (copied from .env.example) was making og:image/og:url
  // point at localhost, so WhatsApp/social cards had no fetchable image.
  if (explicit && !isLocal(explicit)) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Last-resort production fallback so canonical/OG/sitemap never point at
  // localhost or a stale *.vercel.app domain even if Vercel system env vars
  // aren't exposed to the build. This is the canonical production domain.
  if (process.env.NODE_ENV === 'production') return 'https://montanaeg.com';
  return explicit ?? 'http://localhost:3000';
}

export const BASE_URL = resolveBaseUrl();

/** Cast for safe injection into <script type="application/ld+json">. */
type JsonLd = Record<string, unknown>;

export function jsonLdString(data: JsonLd | JsonLd[]): string {
  // Escape `<` to prevent XSS via content-injected JSON-LD.
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

const OG_LOCALE_MAP: Record<Locale, string> = {
  en: 'en_US',
  ar: 'ar_EG',
  fr: 'fr_FR',
  de: 'de_DE',
};

export function ogLocale(locale: Locale): string {
  return OG_LOCALE_MAP[locale] ?? 'en_US';
}

/**
 * Derive the locale from a BASE_URL-prefixed page URL by reading its FIRST path
 * segment (which is always the locale, e.g. `${BASE_URL}/de/about`). Robust
 * against slugs that merely contain "en"/"ar"/"fr"; falls back to defaultLocale.
 */
function localeFromUrl(url: string): Locale {
  const seg = url.startsWith(BASE_URL)
    ? url.slice(BASE_URL.length).split('/').filter(Boolean)[0]
    : undefined;
  return (getAvailableLocales() as readonly string[]).includes(seg ?? '')
    ? (seg as Locale)
    : defaultLocale;
}

// ────────────────────────────────────────────────────────────────────
// Organization — emitted on EVERY page (in root layout)
// ────────────────────────────────────────────────────────────────────

export function organizationJsonLd(site: Site, locale: Locale): JsonLd {
  const tagline = pick(site.brand.tagline, locale);
  const certifications = site.certifications.map((c) => c.name).join(', ');

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: pick(site.brand.name, locale) ?? 'Montana',
    legalName: 'Montana Frozen Foods',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}${site.brand.logoUrl}`,
      contentUrl: `${BASE_URL}${site.brand.logoUrl}`,
    },
    image: `${BASE_URL}${site.brand.logoUrl}`,
    slogan: tagline,
    description: tagline
      ? `${tagline} — Egyptian frozen-food exporter since 1985. Vegetables, fruits, signature molokhia. ${certifications} certified.`
      : 'Egyptian frozen-food exporter since 1985. ' + certifications,
    foundingDate: String(site.founded),
    foundingLocation: {
      '@type': 'Place',
      name: 'Egypt',
      address: { '@type': 'PostalAddress', addressCountry: 'EG' },
    },
    // Org-level contact mirrors the office record so consumers that don't read
    // contactPoint[] still surface a phone/email. Truthful values from site.json.
    telephone: site.contact.office.phones[0],
    email: site.contact.office.email,
    knowsLanguage: [...getAvailableLocales()],
    parentOrganization: {
      '@type': 'Organization',
      name: pick(site.parentCompany, locale),
      foundingDate: String(site.parentSince),
      ...(site.parentUrl ? { url: site.parentUrl } : {}),
    },
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: pick(site.contact.office.address, locale),
        addressLocality: 'Giza',
        addressCountry: 'EG',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: pick(site.contact.factory.address, locale),
        addressLocality: 'Qalyub',
        addressCountry: 'EG',
      },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: site.contact.office.phones[0],
        email: site.contact.office.email,
        contactType: 'sales',
        areaServed: 'Worldwide',
        availableLanguage: [...getAvailableLocales()],
      },
      {
        '@type': 'ContactPoint',
        telephone: site.contact.factory.phones[0],
        email: site.contact.factory.email,
        contactType: 'customer service',
        areaServed: 'Worldwide',
        availableLanguage: [...getAvailableLocales()],
      },
    ],
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    knowsAbout: [
      'Frozen vegetables',
      'Frozen fruits',
      'Molokhia',
      'IQF freezing',
      'Food export',
      'Cold chain logistics',
      'HACCP food safety',
    ],
    hasCredential: site.certifications.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'certification',
      name: c.name,
    })),
    // Only social profiles that have active accounts. If Montana acquires a
    // Twitter/X or YouTube account, add them to site.json before re-enabling.
    sameAs: [site.social.facebook, site.social.instagram, site.social.linkedin].filter(
      (u): u is string => Boolean(u),
    ),
  };
}

// ────────────────────────────────────────────────────────────────────
// LocalBusiness — emitted on contact page (richer than ContactPage)
// ────────────────────────────────────────────────────────────────────

export function localBusinessJsonLd(site: Site, locale: Locale): Array<JsonLd> {
  const office = site.contact.office;
  const factory = site.contact.factory;

  // Helper to conditionally add geo coordinates.
  const withGeo = (coords: { lat: number; lng: number } | undefined) =>
    coords
      ? {
          '@type': 'GeoCoordinates' as const,
          latitude: coords.lat,
          longitude: coords.lng,
        }
      : undefined;

  // Factory entity — FoodEstablishment with geo.
  const factoryEntity: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    '@id': `${BASE_URL}/#factory`,
    name: `Montana — ${pick(factory.label, locale)}`,
    parentOrganization: { '@id': `${BASE_URL}/#organization` },
    url: `${BASE_URL}/${locale}/contact`,
    telephone: factory.phones[0],
    email: factory.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: pick(factory.address, locale),
      addressLocality: 'Qalyub',
      addressCountry: 'EG',
    },
    geo: withGeo(factory.coordinates),
  };

  // Cairo office entity — LocalBusiness with geo.
  const officeEntity: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#office`,
    name: `Montana — ${pick(office.label, locale)}`,
    parentOrganization: { '@id': `${BASE_URL}/#organization` },
    url: `${BASE_URL}/${locale}/contact`,
    telephone: office.phones[0],
    email: office.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: pick(office.address, locale),
      addressLocality: 'Giza',
      addressCountry: 'EG',
    },
    geo: withGeo(office.coordinates),
  };

  return [factoryEntity, officeEntity];
}

// ────────────────────────────────────────────────────────────────────
// WebSite — emitted on the homepage (enables sitelinks search box)
// ────────────────────────────────────────────────────────────────────

export function webSiteJsonLd(site: Site, locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: pick(site.brand.name, locale) ?? 'Montana',
    description: pick(site.brand.tagline, locale),
    inLanguage: locale,
    publisher: { '@id': `${BASE_URL}/#organization` },
  };
}

// ────────────────────────────────────────────────────────────────────
// Product — for /catalog/[slug]
// ────────────────────────────────────────────────────────────────────

export function productJsonLd(product: Product, locale: Locale): JsonLd {
  const imageObjects = [
    {
      '@type': 'ImageObject',
      url: `${BASE_URL}${product.images.primary}`,
      contentUrl: `${BASE_URL}${product.images.primary}`,
    },
    ...product.images.gallery.map((i) => ({
      '@type': 'ImageObject',
      url: `${BASE_URL}${i}`,
      contentUrl: `${BASE_URL}${i}`,
    })),
  ];

  const priceRange = product.seo?.priceRange;
  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/${locale}/catalog/${product.slug}#product`,
    name: pick(product.name, locale) ?? product.slug,
    description: pick(product.description, locale) ?? pick(product.shortDescription, locale),
    image: imageObjects,
    brand: { '@type': 'Brand', name: 'Montana', '@id': `${BASE_URL}/#organization` },
    manufacturer: { '@id': `${BASE_URL}/#organization` },
    category: product.category,
    sku: product.slug,
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'Importers, Distributors, Foodservice, Retail Chains',
    },
    keywords: product.seo?.keywords?.join(', '),
    url: `${BASE_URL}/${locale}/catalog/${product.slug}`,
  };

  // AggregateOffer — price range for B2B buyers who want ballpark figures.
  if (priceRange) {
    base['offers'] = {
      '@type': 'AggregateOffer',
      lowPrice: priceRange.from,
      highPrice: priceRange.to,
      priceCurrency: 'USD',
      priceSpecification: [
        {
          '@type': 'UnitPriceSpecification',
          unitCode: priceRange.perUnit === 'kg' ? 'KGM' : 'TNE',
          minPrice: priceRange.from,
          maxPrice: priceRange.to,
        },
      ],
    };
  }

  // hasVariation — each listed variety becomes a Product sub-entity.
  if (product.varieties.length > 0) {
    base['hasVariation'] = product.varieties.map((v) => ({
      '@type': 'Product',
      name: pick(v.name, locale),
    }));
  }

  return base as JsonLd;
}

// ────────────────────────────────────────────────────────────────────
// NewsArticle — for /news/[slug]
// ────────────────────────────────────────────────────────────────────

export function newsArticleJsonLd(article: NewsArticle, locale: Locale, siteName: string): JsonLd {
  const url = `${BASE_URL}/${locale}/news/${article.slug}`;

  // Build the author entity — prefer a named Person with profile when available (E-E-A-T signal).
  // Google's March 2026 Core Update elevated Experience above all E-E-A-T pillars and made author
  // attribution a ranking factor across ALL verticals (~73% of top-10 post-update have author credentials).
  const authorBio = article.authorBio;
  // Fallback author = Organization. Only reuse the canonical #organization @id
  // when the byline IS the brand; a named dept/person must not override that node.
  let authorEntity: Record<string, unknown> =
    article.author === siteName
      ? { '@type': 'Organization', name: article.author, '@id': `${BASE_URL}/#organization` }
      : { '@type': 'Organization', name: article.author };
  if (authorBio) {
    authorEntity = {
      '@type': 'Person',
      name: pick(authorBio.name, locale) ?? article.author,
      jobTitle: pick(authorBio.title, locale),
      ...(authorBio.profileUrl ? { url: authorBio.profileUrl } : {}),
      affiliation: { '@type': 'Organization', name: siteName, '@id': `${BASE_URL}/#organization` },
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${url}#article`,
    headline: pick(article.title, locale),
    description: pick(article.excerpt, locale),
    image: [`${BASE_URL}${article.coverImage}`],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: authorEntity,
    publisher: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: siteName },
    inLanguage: locale,
    isAccessibleForFree: true,
    articleSection: article.category,
    keywords: article.tags.join(', '),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  };
}

// ────────────────────────────────────────────────────────────────────
// WebPage — standard page-type schema emitted on every page
// ────────────────────────────────────────────────────────────────────

export function webPageJsonLd(
  url: string,
  name: string,
  description: string,
  type = 'WebPage',
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    inLanguage: localeFromUrl(url),
    publisher: { '@id': `${BASE_URL}/#organization` },
  };
}

/** Convenience wrapper for collection/index pages. */
export function itemListPageJsonLd(options: {
  url: string;
  name: string;
  description?: string;
}): JsonLd {
  return webPageJsonLd(options.url, options.name, options.description ?? '', 'CollectionPage');
}

// ────────────────────────────────────────────────────────────────────
// ExportService — describes Montana's export offering per country
// ────────────────────────────────────────────────────────────────────

export function exportServiceJsonLd(
  country: { name: string; iso: string },
  region: { leadTime: string; name: Record<Locale, string> },
  locale: Locale,
): JsonLd {
  const slug = country.iso.toLowerCase();
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: `Frozen food export to ${country.name}`,
    provider: { '@id': `${BASE_URL}/#organization` },
    areaServed: {
      '@type': 'Place',
      name: country.name,
      '@id': `${BASE_URL}/${locale}/export/${slug}#area`,
    },
    description: `Montana Frozen Foods exports premium IQF frozen vegetables, fruits, and specialties to ${country.name}. Lead time: ${region.leadTime}. BRCGS, HACCP, ISO certified Egyptian supplier since 1985.`,
    offers: {
      '@type': 'OfferCatalog',
      name: `Frozen Food Export to ${country.name}`,
      url: `${BASE_URL}/${locale}/export/${slug}`,
      itemListElement: [
        {
          '@type': 'Offer',
          url: `${BASE_URL}/${locale}/export/${slug}`,
        },
      ],
    },
  };
}

// ────────────────────────────────────────────────────────────────────
// BreadcrumbList — for /catalog/[slug] and /news/[slug]
// ────────────────────────────────────────────────────────────────────

export function breadcrumbJsonLd(items: Array<{ name: string; href: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.href.startsWith('http') ? it.href : `${BASE_URL}${it.href}`,
    })),
  };
}

// ────────────────────────────────────────────────────────────────────
// FAQPage — for /contact (FAQ section)
// ────────────────────────────────────────────────────────────────────

export function faqPageJsonLd(items: Array<{ q: string; a: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

// ────────────────────────────────────────────────────────────────────
// ItemList / CollectionPage — for /catalog and /news indexes
// ────────────────────────────────────────────────────────────────────

export function itemListJsonLd(
  items: Array<{ name: string; url: string; image?: string }>,
  options: { name: string; description?: string; url: string },
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${options.url}#collection`,
    name: options.name,
    description: options.description,
    url: options.url,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        url: it.url,
        image: it.image,
      })),
    },
  };
}

// ────────────────────────────────────────────────────────────────────
// hreflang alternates — for per-page <link rel="alternate">
// ────────────────────────────────────────────────────────────────────

export function buildHreflangs(
  pathname: string,
  availableLocales: readonly Locale[] = getAvailableLocales(),
): Record<string, string> {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const out: Record<string, string> = {};
  for (const l of availableLocales) {
    out[l] = `${BASE_URL}/${l}${normalized === '/' ? '' : normalized}`;
  }
  out['x-default'] = `${BASE_URL}/${defaultLocale}${normalized === '/' ? '' : normalized}`;
  return out;
}

// ────────────────────────────────────────────────────────────────────
// buildPageMetadata — centralizes the per-page Metadata pattern.
// Every page should call this so canonical / hreflang / OG / Twitter
// stay in sync without copy-pasting the same shape five times.
// ────────────────────────────────────────────────────────────────────

interface BuildPageMetadataInput {
  locale: Locale;
  /** Path relative to the locale root, e.g. '/about' or '/catalog/spinach'. Use '' for home. */
  path: string;
  /** Page title — appended to the root template "%s | Montana". */
  title: string;
  description: string;
  /** Optional keywords — comma-separated string or array of strings. */
  keywords?: string | string[];
  /** Optional override for OG image URL (absolute or root-relative). Defaults to OG image at locale root. */
  ogImage?: string;
  /** OG type, default 'website'. */
  ogType?: 'website' | 'article' | 'profile' | 'book';
  /** For article OG type. */
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
  /** Set true for pages we don't want indexed (legal/draft). */
  noindex?: boolean;
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  authors,
  section,
  tags,
  noindex,
}: BuildPageMetadataInput): Metadata {
  const normalized = path.startsWith('/') ? path : path ? `/${path}` : '';
  const canonical = `${BASE_URL}/${locale}${normalized}`;
  // Default share image = this page's OWN segment opengraph-image route, so each
  // page ships a tailored thumbnail. Segments that pass an explicit `ogImage`
  // (products, news articles) override this. Every segment used as a default
  // here must have an opengraph-image.tsx (home + about/markets/news/contact/catalog).
  const og = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${BASE_URL}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`
    : `${BASE_URL}/${locale}${normalized}/opengraph-image`;

  const meta: Metadata = {
    title,
    description,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
    alternates: {
      canonical,
      languages: buildHreflangs(normalized),
    },
    openGraph: {
      type: ogType,
      url: canonical,
      title,
      description,
      siteName: 'Montana',
      locale: ogLocale(locale),
      alternateLocale: getAvailableLocales()
        .filter((l) => l !== locale)
        .map(ogLocale),
      images: [{ url: og, width: 1200, height: 630, alt: title }],
      ...(ogType === 'article' && {
        publishedTime,
        modifiedTime,
        authors,
        section,
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [og],
    },
    robots: noindex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : undefined,
  };
  return meta;
}
