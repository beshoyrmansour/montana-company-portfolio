import { getAvailableLocales } from '@/lib/i18n';
import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const dynamic = 'error';
export const dynamicParams = false;
export const alt = 'Contact Montana';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return getAvailableLocales().map((locale) => ({ locale }));
}

export default async function Image() {
  return renderOgCard({
    eyebrow: 'Get in touch',
    title: 'Request a quote',
    subtitle: 'Talk to our export team about products, packaging and lead times.',
  });
}
