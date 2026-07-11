---
name: seo-audit
description: Run a full SEO + AI-readiness audit of montana-web before a release — the deterministic build-time guardrails (npm run seo:validate) plus the judgment-based seo-structured-data-reviewer and i18n-parity-reviewer subagents, consolidated into one prioritized report. Trigger with /seo-audit or phrases like "audit SEO", "check structured data", "pre-release SEO check", "is the site indexable", "review JSON-LD / hreflang / llms.txt".
disable-model-invocation: true
---

# /seo-audit — pre-release SEO + AI-readiness review

Produce ONE consolidated, prioritized report combining a fast deterministic pass with two judgment-based subagent reviews. Report only — do not fix anything unless the user then asks you to.

Montana is a Next.js 16, next-intl v4, **Vercel server build** (NOT a static export — no `out/` dir; `[locale]` pages are SSG via `dynamic='error'`). Origin is `BASE_URL` in `src/lib/seo.ts`. Locales: en (default), ar (RTL), fr, de.

## Step 1 — Deterministic guardrails (fast, always run first)

Run from the repo root and capture output:

```bash
npm run seo:validate   # scripts/validate-seo.ts — OG coverage, llms-full product map, single origin, hreflang coverage
npm run routes:check   # sitemap ↔ on-disk route parity
```

`seo:validate` FAILS the build on: a page relying on a missing `opengraph-image.*` (404 share image), a product with no `PRODUCT_DESCRIPTIONS` entry in `llms-full.txt`, or a second origin resolver (`NEXT_PUBLIC_SITE_URL` outside `src/lib/seo.ts`). It WARNS (non-blocking) on per-locale hreflang content-coverage gaps. Quote any failures/warnings verbatim in the report.

## Step 2 — Judgment-based reviews (dispatch both subagents, in parallel)

These read the real code and find what a script can't (schema.org shape validity, `@id` collisions, canonical/hreflang correctness, RTL, untranslated-but-present values). Launch both with the Task/Agent tool:

- **`seo-structured-data-reviewer`** — JSON-LD/schema.org shapes from `src/lib/seo.ts`, canonical + hreflang across en/ar/fr/de + x-default, page metadata & OG images, sitemap↔route coverage, and the `robots.txt`/`llms.txt`/`llms-full.txt` AI surface. Prompt it to produce its P0/P1/P2 report with `path:line` anchors.
- **`i18n-parity-reviewer`** — translation + content parity across the four locales, untranslated (byte-identical) values, `{token}` interpolation mismatches, and Arabic RTL correctness.

Scope the prompts to what changed if the user names a target (e.g. "just the export pages"); otherwise ask for a full pre-release audit.

## Step 3 — Optional deep pass (only if the user asks to be exhaustive)

A build is heavy but is the only gate that renders JSON-LD and the `catalog`/`markets`/`news` page schemas:

```bash
npm run build && npm start   # then curl http://localhost:3000/{locale}/… , /sitemap.xml, /robots.txt, /llms.txt, /llms-full.txt
```

JSON-parse each `<script type="application/ld+json">` block to confirm it is valid and absolute-URL'd. There is **no** `out/` directory (server build) — inspect the running server or `.next/server/app/**`, never `out/`.

## Step 4 — Consolidate

Merge everything into one report ordered by severity (P0 blocking → P1 degraded → P2 polish), de-duplicating where the script and a subagent flag the same issue (note "confirmed by both"). For each finding: `path:line` — one-line problem — why it hurts SEO/AI discovery — concrete fix (described, not applied). End with:

- severity counts,
- the overall indexability verdict,
- which items are **business-gated** (real author names, Wikidata QID, per-market export content, GBP/directory listings) vs **code fixes** you can do now,
- an explicit list of any German/French/Arabic strings flagged for native-speaker review.

Then offer to fix the code-fixable findings.
