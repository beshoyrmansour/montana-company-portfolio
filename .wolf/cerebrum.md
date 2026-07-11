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
- **Content validation gap:** `scripts/validate-content.ts` (`npm run content:validate`) only validates `site.json`, top-level `markets.json`, products, news, and the `home`/`about`/`contact` **page** files. The other three page files — `content/pages/{catalog,markets,news}.json` — are NOT covered by `content:validate` NOR by the vitest suite (`tests/unit/schemas.test.ts` doesn't import `catalogPageSchema`/`marketsPageSchema`/`newsPageSchema`). Their only enforcement is at render time during `next build`. So a green content:validate + green `npm test` does NOT prove those three are schema-valid.
- **i18n field shape:** `i18nString` (`src/schemas/shared.ts`) is `{ en (required), ar?, fr?, de? }` — all four locales. EXCEPTION: the news article `body` object (`src/schemas/news.ts`) is `{ en, ar?, fr? }` with **no `de`**; Zod strips a stray `body.de` (e.g. `content/news/frozen-mango.json` has one) on parse.
- **Claude Code automations** live under `.claude/` and are kept separate from OpenWolf's `.wolf/` context hooks: hooks `.claude/hooks/{validate-content,format-file}.js` (wired into `.claude/settings.json` PostToolUse alongside `.wolf/hooks/post-write.js`), subagents `.claude/agents/{i18n-parity-reviewer,seo-structured-data-reviewer}.md`, skills `.claude/skills/{new-content,preflight}/`, MCP servers in `.mcp.json` (context7 + Vercel). Hook scripts are CommonJS (repo root package.json is not ESM) and fail-open (exit 0) except content/i18n violations which exit 2.
- **SEO/AI-readiness guardrails:** `scripts/validate-seo.ts` (`npm run seo:validate`, wired into the `build` chain + CI) enforces three invariants: (1) every `[locale]` page relying on the default OG route has an `opengraph-image.*` sibling — else it ships a 404 `og:image`; (2) every `content/products/*.json` slug has a `PRODUCT_DESCRIPTIONS` entry in `src/app/llms-full.txt/route.ts`; (3) the site origin is resolved ONLY via `BASE_URL` in `src/lib/seo.ts` — a second `NEXT_PUBLIC_SITE_URL` resolver drifts canonical/OG/JSON-LD apart on Vercel previews. It WARNS (non-blocking) on hreflang locale-coverage gaps. Judgment-based review lives in the `/seo-audit` skill + the `seo-structured-data-reviewer` / `i18n-parity-reviewer` subagents.
- **Structured-data `@id` discipline:** one `#organization` node (root layout only) and one `#website` node (home only) site-wide; each page's page-entity uses `<url>#webpage` and its list uses `<url>#collection` — never collide these. `itemListPageJsonLd` emits `CollectionPage` (NOT the invalid `ItemListPage`). Locale-variant JSON-LD (FAQ, etc.) must use `pick(field, locale)`, not `.en`, so schema matches the visible localized text.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

- [2026-07-11] Do NOT infer "static export" from the `src/lib/i18n.ts` header comment — it's stale. Reality: `next.config.ts` has no `output:'export'`; it's a Vercel server build (`.next/`, no `out/` dir) whose `[locale]` pages are SSG via `dynamic = 'error'` + `dynamicParams = false`, plus a `src/proxy.ts` middleware (Next 16's renamed `middleware`) that Accept-Language-redirects `/`. A fresh agent repeated this exact mistake — always verify rendering mode against `next.config.ts`, never the i18n.ts comment.
- [2026-07-11] Generated shell in skills/scripts must be zsh-safe — this repo's default shell (and the Bash tool's) is **zsh 5.9**. Bash-only `${!arr[@]}` index expansion and 0-based indexed arrays fail with `bad substitution`/silent-wrong-output under zsh. Use a string accumulator + helper function (or wrap in an explicit `bash`), not indexed arrays.

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->

- [2026-07-07] Content-Signal policy set to `search=yes, ai-input=yes, ai-train=no`: as a B2B marketing site Montana wants search + AI-assistant visibility but does not grant model-training rights. Change in `src/app/robots.txt/route.ts`.
- [2026-07-07] Did NOT publish OAuth/OIDC discovery, OAuth Protected Resource Metadata, auth.md, MCP Server Card, Web Bot Auth JWKS, or x402/MPP/UCP/ACP payment discovery, despite isitagentready.com flagging them: the site has no protected APIs, no MCP server, no outbound bots, and no commerce. Publishing discovery metadata for services that don't exist would mislead agents. Rationale in docs/reference/agent-readiness.md — don't "fix" these later without shipping the underlying service first.
- [2026-07-07] DNS-AID records not published: requires DNS-provider access (outside repo) and an actual agent endpoint to advertise. Instructions in docs/reference/agent-readiness.md.
- [2026-07-11] Added Claude Code automations tailored to the content-driven + trilingual nature of the site: PostToolUse hooks that run Zod content validation on `content/**` edits and i18n key-parity on `messages/**` edits (exit 2 to feed the error back), a Prettier-on-edit hook, `i18n-parity` and `seo-structured-data` review subagents, `/new-content` + `/preflight` skills, and context7 + Vercel MCP servers. Chose `.claude/` (separate from `.wolf/`) and self-contained CommonJS hooks so they coexist with OpenWolf without collision. Built + adversarially verified via a Workflow; verification caught a missing file, a stale static-export premise, a zsh-incompat script, and a false test-coverage claim before shipping.
- [2026-07-11] Hardened SEO/structured-data from a full audit: created the export-page OG image (was a 404 og:image on ~128 indexable URLs), removed a second origin resolver in the news page, deduped the Organization node + absolutized URLs on export pages, resolved `#webpage` @id collisions on home/about, fixed invalid `ItemListPage`→`CollectionPage`, made the home FAQ JSON-LD locale-aware, excluded noindex legal pages from the sitemap, dropped the redirecting root `/`, and repaired the drifted `llms-full.txt` product map (all 25 products covered). Filled German content gaps (news page, 4 author bios ×ar/fr/de, addresses) — de content coverage 90%→98%. Shipped `scripts/validate-seo.ts` + `/seo-audit` so these regressions fail the build going forward; the validator immediately caught a news-origin fix I'd missed. Deferred as business-gated: real author names, Wikidata QID, per-market export content, GBP/directory listings.
