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

export const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://montanaeg.com').replace(
  /\/$/,
  '',
);

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
};

export function ogLocale(locale: Locale): string {
  return OG_LOCALE_MAP[locale] ?? 'en_US';
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
    alternateName: pick(site.parentCompany, locale),
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
        addressLocality: 'Kalioub',
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
        availableLanguage: ['en', 'ar', 'fr'],
      },
      {
        '@type': 'ContactPoint',
        telephone: site.contact.factory.phones[0],
        email: site.contact.factory.email,
        contactType: 'customer service',
        areaServed: 'Worldwide',
        availableLanguage: ['en', 'ar', 'fr'],
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
    sameAs: [
      site.social.facebook,
      site.social.instagram,
      site.social.linkedin,
      site.social.twitter,
      site.social.youtube,
    ].filter((u): u is string => Boolean(u)),
  };
}

// ────────────────────────────────────────────────────────────────────
// LocalBusiness — emitted on contact page (richer than ContactPage)
// ────────────────────────────────────────────────────────────────────

export function localBusinessJsonLd(site: Site, locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    '@id': `${BASE_URL}/#factory`,
    name: `Montana — ${pick(site.contact.factory.label, locale)}`,
    parentOrganization: { '@id': `${BASE_URL}/#organization` },
    url: `${BASE_URL}/${locale}/contact`,
    telephone: site.contact.factory.phones[0],
    email: site.contact.factory.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: pick(site.contact.factory.address, locale),
      addressLocality: 'Kalioub',
      addressCountry: 'EG',
    },
    geo: site.contact.factory.coordinates
      ? {
          '@type': 'GeoCoordinates',
          latitude: site.contact.factory.coordinates.lat,
          longitude: site.contact.factory.coordinates.lng,
        }
      : undefined,
  };
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
  const images = [
    `${BASE_URL}${product.images.primary}`,
    ...product.images.gallery.map((i) => `${BASE_URL}${i}`),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/${locale}/catalog/${product.slug}#product`,
    name: pick(product.name, locale) ?? product.slug,
    description: pick(product.description, locale) ?? pick(product.shortDescription, locale),
    image: images,
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
}

// ────────────────────────────────────────────────────────────────────
// NewsArticle — for /news/[slug]
// ────────────────────────────────────────────────────────────────────

export function newsArticleJsonLd(article: NewsArticle, locale: Locale, siteName: string): JsonLd {
  const url = `${BASE_URL}/${locale}/news/${article.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${url}#article`,
    headline: pick(article.title, locale),
    description: pick(article.excerpt, locale),
    image: [`${BASE_URL}${article.coverImage}`],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: { '@type': 'Organization', name: article.author, '@id': `${BASE_URL}/#organization` },
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
  const og = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${BASE_URL}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`
    : `${BASE_URL}/${locale}/opengraph-image`;

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
