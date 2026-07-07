/**
 * robots.txt — custom route handler (replaces the app/robots.ts metadata
 * convention, which cannot emit non-standard directives).
 *
 * Adds Content-Signal directives (https://contentsignals.org/,
 * draft-romm-aipref-contentsignals) declaring AI-usage preferences:
 *   search=yes    — indexing for search results is welcome
 *   ai-input=yes  — AI assistants may ground answers in this content
 *                   (deliberate: Montana wants agents to surface its products)
 *   ai-train=no   — content may not be used to train AI models
 *
 * Same origin source of truth as before: BASE_URL from @/lib/seo, shared
 * with canonical/OG/JSON-LD and sitemap.ts, so they can never disagree.
 */

import { BASE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

export function GET(): Response {
  const body = `# Content Signals let site owners express how automated systems may use
# this site's content after access; see https://contentsignals.org/ for the
# meaning of each signal.
#   search   = building a search index and showing links/snippets in results
#   ai-input = using content as grounded input to an AI answer (e.g. RAG)
#   ai-train = training or fine-tuning AI models

User-Agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /
Disallow: /api/

Sitemap: ${BASE_URL}/sitemap.xml
Host: ${BASE_URL}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
