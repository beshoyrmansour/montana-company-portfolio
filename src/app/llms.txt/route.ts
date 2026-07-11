/**
 * llms.txt — compact AI agent site overview (llmstxt.org convention).
 *
 * Published as a dynamic route so it stays in sync with the live
 * deployment and always links to the latest /llms-full.txt.
 */

import { getAvailableLocales } from '@/lib/i18n';
import { getAllProductSlugs } from '@/lib/content';
import { STATIC_ROUTES } from '@/lib/routes';

export const dynamic = 'force-static';
export const revalidate = 3600;

const SITE_SUMMARY = [
  '# Montana Frozen Foods — AI Agent Overview',
  '',
  'Family-owned Egyptian frozen vegetable and fruit exporter since 1985, part of Maamoun Brothers Group (est. 1909). IQF vegetables, fruits, molokhia. HACCP/ISO/BRCGS certified. 35,000t annual capacity to 30+ countries.',
].join('\n');

export async function GET(): Promise<Response> {
  const locales = getAvailableLocales();
  const lines: string[] = [SITE_SUMMARY];

  // Routes — link to full-content endpoint
  lines.push('\n## Routes');
  lines.push('Read all pages and products for full content: [llms-full.txt](/llms-full.txt)');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
