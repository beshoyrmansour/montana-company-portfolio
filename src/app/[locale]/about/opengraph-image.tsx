import { getAvailableLocales } from '@/lib/i18n';
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const dynamic = 'error';
export const dynamicParams = false;
export const alt = 'About Montana';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return getAvailableLocales().map((locale) => ({ locale }));
}

export default async function Image() {
  return renderOgCard({
    eyebrow: 'About · Since 1985',
    title: 'A family frozen-food legacy',
    subtitle: 'Egyptian vegetables, fruits & signature molokhia, exported to 30 countries.',
  });
}
