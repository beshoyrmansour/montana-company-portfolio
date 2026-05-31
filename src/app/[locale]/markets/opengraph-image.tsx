import { getAvailableLocales } from '@/lib/i18n';
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const dynamic = 'error';
export const dynamicParams = false;
export const alt = 'Montana global markets';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return getAvailableLocales().map((locale) => ({ locale }));
}

export default async function Image() {
  return renderOgCard({
    eyebrow: 'Markets · 5 continents',
    title: 'Exporting to 30 countries',
    subtitle: 'Cold-chain frozen food from Qalyub, Egypt to your market.',
  });
}
