import { getAvailableLocales } from '@/lib/i18n';
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE, OG_GREEN } from '@/lib/og';

export const dynamic = 'error';
export const dynamicParams = false;
export const alt = 'Montana product catalog';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return getAvailableLocales().map((locale) => ({ locale }));
}

export default async function Image() {
  return renderOgCard({
    eyebrow: 'Catalog · IQF frozen',
    title: 'Frozen vegetables & fruits',
    subtitle: 'Vegetables, fruits, leaves & specialties — processed within hours of harvest.',
    accent: OG_GREEN,
  });
}
