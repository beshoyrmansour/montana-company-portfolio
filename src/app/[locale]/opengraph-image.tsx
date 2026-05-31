import { getSite } from '@/lib/content';
import { getAvailableLocales } from '@/lib/i18n';
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const dynamic = 'error';
export const dynamicParams = false;
export const alt = 'Montana — Frozen Foods';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return getAvailableLocales().map((locale) => ({ locale }));
}

/**
 * Default share thumbnail (home + any page without its own image).
 *
 * Rendered with the LATIN (en) brand text — next/og has no Arabic shaping, and
 * the image is shown to a global audience. Per-locale routing is kept so the
 * og:image URL matches the page locale for hreflang alternates.
 */
export default async function Image() {
  const site = await getSite();
  return renderOgCard({
    eyebrow: 'Since 1985 · 30 countries',
    title: site.brand.name.en,
    subtitle: site.brand.tagline.en,
  });
}
