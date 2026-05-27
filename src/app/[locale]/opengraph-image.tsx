import { ImageResponse } from 'next/og';
import { getSite } from '@/lib/content';
import { getAvailableLocales } from '@/lib/i18n';

export const dynamic = 'error';
export const dynamicParams = false;
export const alt = 'Montana — Frozen Foods';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  return getAvailableLocales().map((locale) => ({ locale }));
}

/**
 * OG image is always rendered with the LATIN (en) brand text.
 * Reason: next/og doesn't ship Arabic font shaping; loading a custom font here
 * for AR is possible but adds ~80kB to every build. Social platforms render the
 * image to a global audience, so Latin/English is the safest default.
 *
 * Per-locale routing is still kept (en/ar/fr) so `og:image` URLs match the page
 * locale — Google + social platforms can serve the right alternate hreflang URL.
 */
export default async function Image() {
  const site = await getSite();
  const brandName = site.brand.name.en;
  const tagline = site.brand.tagline.en;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px',
          background: 'linear-gradient(135deg, #147239 0%, #0F5A2D 100%)',
          color: '#FFFFFF',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 32, fontWeight: 600, opacity: 0.85, marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Since 1985 · 70 countries
        </div>
        <div style={{ display: 'flex', fontSize: 128, fontWeight: 800, lineHeight: 1, marginBottom: 24 }}>
          {brandName}
        </div>
        <div style={{ display: 'flex', fontSize: 36, opacity: 0.9, maxWidth: 900, lineHeight: 1.3 }}>
          {tagline}
        </div>
        <div style={{ display: 'flex', position: 'absolute', bottom: 60, right: 80, fontSize: 24, opacity: 0.7 }}>
          montanaeg.com
        </div>
      </div>
    ),
    { ...size },
  );
}
