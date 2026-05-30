import type { NextConfig } from 'next';
import path from 'node:path';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// ── Legacy URL → canonical map (Qode Superfood predecessor site) ──
const REAL_PRODUCTS = [
  'artichoke', 'broad-beans', 'broccoli', 'cabbage-leaves', 'carrots',
  'cauliflower', 'colcasia', 'green-beans', 'molokhia', 'okra',
  'peas', 'peas-and-carrots', 'spinach', 'strawberry', 'sweet-corn',
  'vine-leaves',
];

const VARIANT_REDIRECTS: Record<string, string> = {
  'broccoli-2': 'broccoli',
  'cauliflower-2': 'cauliflower',
  'green-beans-2': 'green-beans',
  'strawberry-2': 'strawberry',
  'peas-carrots': 'peas-and-carrots',
  'colocasia': 'colcasia',
  'cabbage-leaves-new': 'cabbage-leaves',
};

const FR_SLUG_MAP: Record<string, string> = {
  'artichaut': 'artichoke',
  'brocoli': 'broccoli',
  'carottes': 'carrots',
  'chou-fleur': 'cauliflower',
  'colocasia': 'colcasia',
  'epinard': 'spinach',
  'feuilles-de-chou-nouveau': 'cabbage-leaves',
  'feuilles-de-vigne': 'vine-leaves',
  'feves': 'broad-beans',
  'fraise': 'strawberry',
  'gombo': 'okra',
  'haricots-verts': 'green-beans',
  'le-mais-sucre': 'sweet-corn',
  'molokhia': 'molokhia',
  'petits-pois': 'peas',
  'pois-carottes': 'peas-and-carrots',
};

// Theme-demo URLs from the old site — no meaningful destination, redirect to homepage.
const GONE_SLUGS = [
  'a-box-of-goodness', 'awesome-tastes', 'bakery-home', 'beet',
  'best-fruit-treats', 'best-new-salads', 'blog-home-2', 'chamomile-cup',
  'coconut-scoops', 'coffee-biscuits-2', 'coffee-home',
  'coffee-slide-1', 'coffee-slide-2', 'coffee-slide-3', 'coffee-slide-4',
  'colorful-sandwich', 'coming-soon', 'cosmetic-home', 'fig', 'flower-cocktail',
  'fresh-burrito', 'frozen-fruitstick', 'fruit-hearts', 'grocery-home',
  'healthy-finger-food', 'healthy-ice-pops', 'healthy-juices', 'healthy-juices-2',
  'heartmellon', 'icecream-home', 'keep-it-safe-tasty', 'lavender-tea',
  'main-home', 'natural-products', 'new-green-tea', 'orange-tea',
  'our-fruit-mixes-2', 'our-secret-recipes', 'peach-ice-cream', 'peach',
  'portfolio-home', 'potato', 'purple-delight',
  'sandwich-1', 'sandwich-2', 'sandwich-3', 'sandwich-4',
  'sandwich-5', 'sandwich-6', 'sandwich-7',
  'shop-home', 'slider-showcase', 'snow-pea', 'taste-the-health', 'tea-home',
  'the-best-flavor', 'the-perfect-dose', 'tortilla-mixes',
  'vegetable-jar', 'yogurt-treats-3',
];

type Redirect = { source: string; destination: string; permanent: boolean };

function legacyRedirects(): Redirect[] {
  const out: Redirect[] = [];

  // Dead theme-demo URLs → homepage (most-specific first so they win over the catch-all).
  for (const slug of GONE_SLUGS) {
    out.push({ source: `/portfolio-item/${slug}`, destination: '/', permanent: true });
  }
  out.push({ source: '/fr/tea-home', destination: '/', permanent: true });

  // Duplicate slugs → canonical product.
  for (const [variant, canonical] of Object.entries(VARIANT_REDIRECTS)) {
    out.push({
      source: `/portfolio-item/${variant}`,
      destination: `/en/catalog/${canonical}`,
      permanent: true,
    });
  }

  // Real products on the old URL → new canonical EN URL.
  for (const slug of REAL_PRODUCTS) {
    out.push({
      source: `/portfolio-item/${slug}`,
      destination: `/en/catalog/${slug}`,
      permanent: true,
    });
    out.push({
      source: `/ar/portfolio-item/${slug}`,
      destination: `/ar/catalog/${slug}`,
      permanent: true,
    });
  }

  // French localized product URLs → canonical EN slug under /fr/.
  for (const [frSlug, canonical] of Object.entries(FR_SLUG_MAP)) {
    out.push({
      source: `/fr/portfolio-item/${frSlug}`,
      destination: `/fr/catalog/${canonical}`,
      permanent: true,
    });
  }

  // Static page URLs.
  const pageRedirects: Array<[string, string]> = [
    ['/about-us-2', '/en/about'],
    ['/about-us', '/en/about'],
    ['/catalog-2', '/en/catalog'],
    ['/ar/about-us', '/ar/about'],
    ['/ar/our-markets', '/ar/markets'],
    ['/fr/about-us', '/fr/about'],
    ['/fr/our-markets', '/fr/markets'],
    ['/montana-en-2/contact-2', '/en/contact'],
  ];
  for (const [source, destination] of pageRedirects) {
    out.push({ source, destination, permanent: true });
  }

  // Catch-all for unknown /portfolio-item/* URLs (runs LAST — Next.js
  // applies array order, so specific rules above win).
  out.push({ source: '/portfolio-item/:slug*', destination: '/en/catalog', permanent: true });
  out.push({ source: '/ar/portfolio-item/:slug*', destination: '/ar/catalog', permanent: true });
  out.push({ source: '/fr/portfolio-item/:slug*', destination: '/fr/catalog', permanent: true });

  return out;
}

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Pin the workspace root so Next.js doesn't infer it from a stray lockfile
  // higher up the tree (e.g. ~/package-lock.json) and mis-trace file output.
  // outputFileTracingRoot covers `next build`; turbopack.root covers `next dev --turbopack`.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1600, 2400],
    imageSizes: [320, 400, 600, 800, 1200],
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  async redirects() {
    return legacyRedirects();
  },
};

export default withNextIntl(config);
