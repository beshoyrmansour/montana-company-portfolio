import { getAllProductSlugs, getProduct } from '@/lib/content';
import { getAvailableLocales } from '@/lib/i18n';
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE, OG_GREEN } from '@/lib/og';

export const dynamic = 'error';
export const dynamicParams = false;
export const alt = 'Montana product';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  const locales = getAvailableLocales();
  const slugs = await getAllProductSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

/**
 * Product share thumbnail — same branded card as the rest of the site, with the
 * product name as the headline. Latin/English text only (next/og has no Arabic
 * shaping); per-locale variants keep og:image URLs aligned with hreflang.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return new Response('Not found', { status: 404 });

  return renderOgCard({
    eyebrow: `Montana · ${product.category}`,
    title: product.name.en,
    subtitle: product.shortDescription.en,
    accent: OG_GREEN,
  });
}
