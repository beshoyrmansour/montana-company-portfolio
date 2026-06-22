import type { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/seo';

export const dynamic = 'error';

export default function robots(): MetadataRoute.Robots {
  // Single source of truth for the origin — shared with canonical/OG/JSON-LD and
  // sitemap.ts via @/lib/seo, so the sitemap URL and host can never disagree.
  const base = BASE_URL;
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
