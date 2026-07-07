# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-07-07

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- [2026-07-07] No raw/amateur phone photos on public-facing surfaces (news cards etc.) — always use the curated marketing shots from `public/images/products/<slug>/`. The raw set lives in `public/images/products/real/` and should be treated as internal source material.
- [2026-07-07] User approves AI-retouching facility photos to look professional (e.g. replacing handwritten bottle labels with clean branded stickers) — brand green #147239, "MONTANA QC LAB" sticker style; retouch programmatically with sharp SVG composites so edits are reproducible.
- [2026-07-07] Mobile forms: primary submit buttons should be full width (added `.cf-foot .btn-editorial { width: 100% }` at ≤767px).
- User writes in Egyptian Arabic (sometimes mixed with English) — reply in Arabic, keep technical terms in English.

## Key Learnings

- **Project:** montana-web
- **Description:** Montana Frozen Foods — corporate trilingual marketing site. Built with Next.js 16, deployed on Vercel.
- The site is NOT a static export: `next.config.ts` has no `output: 'export'`, and there's a middleware (`src/proxy.ts`, matcher `['/']` only) plus a dynamic API route (`/api/contact`). The comment in `src/lib/i18n.ts` claiming "output:'export'" is stale — don't trust it.
- Response headers are managed in `vercel.json` (not `next.config.ts headers()`) — follow that convention when adding headers. Content-Type of extensionless `public/` files (e.g. `/.well-known/api-catalog`) can be overridden there too.
- Custom robots.txt directives (e.g. `Content-Signal`) can't be emitted by the typed `app/robots.ts` metadata API — use a route handler at `src/app/robots.txt/route.ts` with `dynamic = 'force-static'` instead (done 2026-07-07).
- Canonical origin is `BASE_URL` from `src/lib/seo.ts` (prod: https://montanaeg.com); robots/sitemap/OG all import it.
- Agent-discovery surface (Link headers, api-catalog, agent-skills, WebMCP, Content Signals) is documented in `docs/reference/agent-readiness.md`, including which isitagentready.com checks were deliberately skipped and why. Editing an agent-skills SKILL.md requires re-hashing its sha256 into `public/.well-known/agent-skills/index.json`.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->

- [2026-07-07] Content-Signal policy set to `search=yes, ai-input=yes, ai-train=no`: as a B2B marketing site Montana wants search + AI-assistant visibility but does not grant model-training rights. Change in `src/app/robots.txt/route.ts`.
- [2026-07-07] Did NOT publish OAuth/OIDC discovery, OAuth Protected Resource Metadata, auth.md, MCP Server Card, Web Bot Auth JWKS, or x402/MPP/UCP/ACP payment discovery, despite isitagentready.com flagging them: the site has no protected APIs, no MCP server, no outbound bots, and no commerce. Publishing discovery metadata for services that don't exist would mislead agents. Rationale in docs/reference/agent-readiness.md — don't "fix" these later without shipping the underlying service first.
- [2026-07-07] DNS-AID records not published: requires DNS-provider access (outside repo) and an actual agent endpoint to advertise. Instructions in docs/reference/agent-readiness.md.
