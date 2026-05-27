/**
 * Content loading layer.
 * All JSON files are read at build time and validated against zod schemas.
 * A schema failure here = build failure (intentional safety net).
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { z } from 'zod';
import { siteSchema, type Site } from '@/schemas/site';
import { productSchema, type Product } from '@/schemas/product';
import { newsArticleSchema, type NewsArticle } from '@/schemas/news';
import {
  homePageSchema,
  aboutPageSchema,
  catalogPageSchema,
  contactPageSchema,
  newsPageSchema,
  marketsPageSchema,
  type HomePage,
  type AboutPage,
  type CatalogPage,
  type ContactPage,
  type NewsPage,
  type MarketsPage,
} from '@/schemas/page';
import { marketsSchema, type Markets } from '@/schemas/markets';

const CONTENT_DIR = path.join(process.cwd(), 'content');

async function loadJson<T>(relPath: string, schema: z.ZodType<T>): Promise<T> {
  const full = path.join(CONTENT_DIR, relPath);
  const raw = await fs.readFile(full, 'utf-8');
  const json = JSON.parse(raw);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new Error(
      `Content validation failed for ${relPath}:\n${parsed.error.issues
        .map((i) => `  • ${i.path.join('.')} — ${i.message}`)
        .join('\n')}`,
    );
  }
  return parsed.data;
}

// ────────────────────────────────────────────────────────────────────
// SITE
// ────────────────────────────────────────────────────────────────────

let _site: Site | null = null;
export async function getSite(): Promise<Site> {
  if (!_site) _site = await loadJson('site.json', siteSchema);
  return _site;
}

// ────────────────────────────────────────────────────────────────────
// PRODUCTS
// ────────────────────────────────────────────────────────────────────

export async function getAllProductSlugs(): Promise<string[]> {
  const dir = path.join(CONTENT_DIR, 'products');
  const files = await fs.readdir(dir);
  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await loadJson(`products/${slug}.json`, productSchema);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const slugs = await getAllProductSlugs();
  const products = await Promise.all(slugs.map((s) => getProduct(s)));
  return products.filter((p): p is Product => p !== null);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.featured);
}

// ────────────────────────────────────────────────────────────────────
// NEWS
// ────────────────────────────────────────────────────────────────────

export async function getAllNewsSlugs(): Promise<string[]> {
  // Filename IS the slug — must match the `slug` field inside the JSON so
  // generateStaticParams() agrees with every Link href that uses article.slug.
  // Listing order doesn't matter here (the listing page sorts by publishedAt).
  const dir = path.join(CONTENT_DIR, 'news');
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))
      .sort();
  } catch {
    return [];
  }
}

export async function getNewsArticle(slug: string): Promise<NewsArticle | null> {
  try {
    return await loadJson(`news/${slug}.json`, newsArticleSchema);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

export async function getAllNewsArticles(): Promise<NewsArticle[]> {
  const slugs = await getAllNewsSlugs();
  const articles = await Promise.all(slugs.map((s) => getNewsArticle(s)));
  return articles
    .filter((a): a is NewsArticle => a !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

// ────────────────────────────────────────────────────────────────────
// PAGES
// ────────────────────────────────────────────────────────────────────

export async function getHomePage(): Promise<HomePage> {
  return loadJson('pages/home.json', homePageSchema);
}

export async function getAboutPage(): Promise<AboutPage> {
  return loadJson('pages/about.json', aboutPageSchema);
}

export async function getContactPage(): Promise<ContactPage> {
  return loadJson('pages/contact.json', contactPageSchema);
}

export async function getCatalogPage(): Promise<CatalogPage> {
  return loadJson('pages/catalog.json', catalogPageSchema);
}

export async function getNewsPage(): Promise<NewsPage> {
  return loadJson('pages/news.json', newsPageSchema);
}

export async function getMarketsPage(): Promise<MarketsPage> {
  return loadJson('pages/markets.json', marketsPageSchema);
}

// ────────────────────────────────────────────────────────────────────
// MARKETS
// ────────────────────────────────────────────────────────────────────

export async function getMarkets(): Promise<Markets> {
  return loadJson('markets.json', marketsSchema);
}

// ────────────────────────────────────────────────────────────────────
// LEGAL (markdown)
// ────────────────────────────────────────────────────────────────────

export async function getLegalPage(
  page: 'privacy' | 'terms' | 'cookies',
  locale: string,
): Promise<{ title: string; body: string; lastUpdated?: string } | null> {
  const full = path.join(CONTENT_DIR, 'legal', `${page}.${locale}.md`);
  try {
    const raw = await fs.readFile(full, 'utf-8');
    // Parse simple frontmatter
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { title: page, body: raw };
    const fm = Object.fromEntries(
      match[1]!
        .split('\n')
        .map((line) => line.split(/:\s*/))
        .filter((arr): arr is [string, string] => arr.length === 2),
    );
    return { title: fm.title ?? page, lastUpdated: fm.lastUpdated, body: match[2]! };
  } catch {
    // fallback to EN
    if (locale !== 'en') return getLegalPage(page, 'en');
    return null;
  }
}
