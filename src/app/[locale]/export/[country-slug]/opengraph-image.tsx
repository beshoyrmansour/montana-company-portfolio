import { getAvailableLocales, type Locale } from '@/lib/i18n';
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE, OG_GREEN } from '@/lib/og';
import marketsData from '@/content/markets.json';

export const dynamic = 'error';
export const dynamicParams = false;
export const alt = 'Montana frozen food export';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Regions = (typeof marketsData)['regions'];

function regionsOf(): Regions {
  return (marketsData as typeof marketsData & { regions: Regions }).regions;
}

export async function generateStaticParams() {
  const locales = getAvailableLocales();
  const params: Array<{ locale: Locale; 'country-slug': string }> = [];
  for (const locale of locales) {
    for (const region of regionsOf()) {
      for (const country of region.countries) {
        params.push({ locale, 'country-slug': country.iso.toLowerCase() });
      }
    }
  }
  return params;
}

/**
 * Country export share thumbnail — the branded card with the country name as the
 * headline and the region's accent color. Latin/English text only (next/og has
 * no Arabic shaping); per-locale params keep og:image URLs aligned with hreflang.
 * Without this route, every /{locale}/export/{iso} page shipped a 404 og:image.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; 'country-slug': string }>;
}) {
  const { 'country-slug': countrySlug } = await params;

  for (const region of regionsOf()) {
    const country = region.countries.find((c) => c.iso.toLowerCase() === countrySlug);
    if (country) {
      return renderOgCard({
        eyebrow: `Export · ${region.name.en}`,
        title: `Frozen Foods to ${country.name.en}`,
        subtitle: 'Egyptian IQF vegetables, fruits & specialties — BRCGS · HACCP · ISO certified.',
        accent: region.color || OG_GREEN,
      });
    }
  }

  return new Response('Not found', { status: 404 });
}
