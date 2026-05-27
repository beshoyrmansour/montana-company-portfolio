/**
 * Plausible analytics — cookieless, EU-hosted.
 * Only loads if NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set.
 * Script tag is async + defer → doesn't block render or hydration.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const scriptUrl =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL ?? 'https://plausible.io/js/script.js';

  if (!domain) return null;

  return (
    <script
      defer
      data-domain={domain}
      src={scriptUrl}
    />
  );
}
