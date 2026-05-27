import { ImageResponse } from 'next/og';
import { getAllProductSlugs, getProduct } from '@/lib/content';
import { getAvailableLocales } from '@/lib/i18n';

export const dynamic = 'error';
export const dynamicParams = false;
export const alt = 'Montana product';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  const locales = getAvailableLocales();
  const slugs = await getAllProductSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

/**
 * Product OG image — Latin/English text only (next/og has no Arabic font shaping).
 * Per-locale variants exist so og:image URLs match the page locale.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return new Response('Not found', { status: 404 });

  const name = product.name.en;
  const short = product.shortDescription.en;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '80px',
          background: 'linear-gradient(135deg, #C8202E 0%, #EF802E 100%)',
          color: '#FFFFFF',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 32, fontWeight: 600, opacity: 0.85, marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Montana · {product.category}
        </div>
        <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, lineHeight: 1, marginBottom: 24 }}>
          {name}
        </div>
        <div style={{ display: 'flex', fontSize: 30, opacity: 0.9, maxWidth: 1000, lineHeight: 1.3 }}>
          {short}
        </div>
        <div style={{ display: 'flex', position: 'absolute', top: 60, right: 80, fontSize: 22, opacity: 0.7 }}>
          montanaeg.com
        </div>
      </div>
    ),
    { ...size },
  );
}
