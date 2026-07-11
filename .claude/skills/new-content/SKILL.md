---
name: new-content
description: Scaffold a new product, news article, or page content JSON that matches the Zod schema in src/schemas/ across all four locales (en/ar/fr/de), wires images correctly, and passes `npm run content:validate`. Trigger with /new-content or phrases like "add a product", "new product entry", "publish a news article", "scaffold content JSON", "create a content entry".
disable-model-invocation: true
---

# /new-content — scaffold a schema-valid content entry (all locales)

You are scaffolding ONE content JSON for the Montana Frozen Foods site. The Zod schemas in `src/schemas/` are the ONLY source of truth — the human docs under `docs/` are helpful but contain known drift (see "Known doc traps" below). When in doubt, re-Read the schema, not the doc.

Work through the steps in order. Do not declare done until step 7 passes.

---

## Step 0 — Ground yourself in the live contracts (do this first, every run)

Read the schema for the type you are creating BEFORE writing any JSON. Do not rely on memory:

- product → `src/schemas/product.ts` + `src/schemas/shared.ts`; example `content/products/mango.json`
- news → `src/schemas/news.ts` + `src/schemas/shared.ts`; example `content/news/frozen-mango.json`
- page → `src/schemas/page.ts` + `src/schemas/shared.ts`; the matching existing file in `content/pages/`

The shared i18n field shape (`src/schemas/shared.ts` → `i18nString`) is:

```json
{ "en": "required, non-empty", "ar": "optional", "fr": "optional", "de": "optional" }
```

Only `en` is strictly required by Zod, but **for this project always fill en + ar + fr + de** on every i18n field (the real content files do). Never leave a translation empty or omit a locale.
**Exception — news `body`**: its schema is `{ en (required), ar?, fr? }` with **NO `de`**. Provide only `en`, `ar`, `fr` for `body`. (title/excerpt/seo on a news article still take all four locales.)

## Step 1 — Collect inputs

Take TYPE and slug/title from the user's `/new-content` args if given; otherwise ask:

1. Type: `product` | `news` | `page`
2. Slug (kebab-case, must match `^[a-z0-9-]+$`) and the English title/name.
3. Enough source copy to write real en/ar/fr/de text (do not ship lorem ipsum or placeholder "TODO" strings — a translation that is obviously a placeholder is worse than a good machine translation. Translate faithfully from the English the user provides).

## Step 2 — Determine the target path + enforce the filename↔slug rule

- product → `content/products/<slug>.json`
- news → `content/news/<slug>.json`
- page → one of the SIX existing files: `content/pages/{home,about,catalog,contact,markets,news}.json`

**CRITICAL (products & news):** the filename stem MUST equal the internal `"slug"` field. `scripts/validate-content.ts` → `assertFilenameMatchesSlug()` fails the build on any mismatch, because `generateStaticParams()` uses the filename while every `<Link>` uses `article.slug`/`product.slug`. So `content/news/foo.json` MUST contain `"slug": "foo"`.

- Repo convention for news is a clean slug with NO date prefix (e.g. `frozen-mango.json`, not `2026-05-frozen-mango.json`) — match the existing files in `content/news/`.
- Check the slug is not already taken (`ls content/products/` or `ls content/news/`).

**page type note:** all six page files already exist and each maps 1:1 to a route + a schema export + a loader in `src/lib/content.ts`. `/new-content` for a page means regenerating/replacing one of those six files against its schema — NOT inventing a brand-new page. A genuinely new page requires code changes (new schema, a `src/app/[locale]/…/page.tsx` route, a loader, `DYNAMIC_ROUTES`/sitemap) and is out of scope for content scaffolding — tell the user that and stop if that's what they want.

## Step 3 — Write the JSON: copy a real sibling, then fill EVERY required field

Start from an existing sibling of the same type (products: `content/products/mango.json`; news: `content/news/frozen-mango.json`; page: the same page's current file) so you inherit the exact shape. Then replace values. Fill every REQUIRED field — the checklists below are the authoritative required set (re-verify against the schema you read in step 0).

### PRODUCT — required fields (`productSchema`)

- `slug` (kebab; == filename stem)
- `name`, `shortDescription`, `description` — i18n (en+ar+fr+de)
- `category` — exactly one of: `vegetable` | `fruit` | `leaf` | `specialty`
- `featured` — boolean
- `badges` — array; `[]` allowed; each ∈ `popular` | `seasonal` | `new` | `signature` | `export-only` | `organic`
- `varieties` — array; `[]` allowed; each `{ name: i18n, sizes?: [{ label: i18n, spec: i18n }] }`
- `packaging` — array; each `{ sku?: string, type: retail|foodservice|bulk, weight: string, perCarton: string }`
- `seasonality` — array; `[]` allowed; each a 3-letter month ∈ `jan`..`dec`
- `images` — object with all three keys REQUIRED: `{ primary: string, gallery: string[], packaging: string[] }` (gallery/packaging may be `[]`)
- `relatedSlugs` — array of existing product slugs; `[]` allowed
- Optional: `nutrition` (i18n), `preparation` (i18n), `seo` `{ title?, description? (i18n), keywords?: string[], aiSummary?: string, moq?: string, priceRange?: { from: +number, to: +number, perUnit?: string } }`

### NEWS — required fields (`newsArticleSchema`)

- `slug` (kebab; == filename stem)
- `publishedAt` — `YYYY-MM-DD` (regex-enforced; NOT `MM/DD/YYYY`)
- `category` — exactly one of: `corporate` | `product` | `market` | `sustainability` | `press` ← **NOT** `company` (the how-to doc example is wrong)
- `featured` — boolean
- `title`, `excerpt` — i18n (en+ar+fr+de)
- `body` — `{ en (required), ar?, fr? }` — **en+ar+fr only, no `de`** (the `newsArticleSchema` `body` object has no `de`; `title`/`excerpt`/`seo` still take all four). ⚠️ The sibling `frozen-mango.json` you copy in Step 3 contains a **stray `body.de`** — Zod silently strips it (so it still validates), but **delete the `body.de` key** when you copy, so you don't carry dead data.
- `author` — plain string (e.g. `"Montana Product Development Team"`)
- `coverImage` — string image path
- `tags` — string array; `[]` allowed
- Optional: `updatedAt` (`YYYY-MM-DD`), `homepage` (boolean), `authorBio` `{ name?: i18n, title?: i18n, profileUrl?: valid URL }`, `seo` `{ title?, description? (i18n) }`

### PAGE — use the right schema export (`src/schemas/page.ts`)

`home.json`→`homePageSchema`, `about.json`→`aboutPageSchema`, `catalog.json`→`catalogPageSchema`, `contact.json`→`contactPageSchema`, `markets.json`→`marketsPageSchema`, `news.json`→`newsPageSchema`. Most sections carry an `enabled: boolean` toggle. Recurring shapes: `splitTitle {lead, em}`, `splitHeadline {lead, em, tail?}`, `ctaLink {label, href, variant?, icon?, external?}`, `statItem {num, sup?, label}`. Read the specific export before filling — several sections have exact-length arrays (e.g. home `process.steps` must be `.length(5)`).

## Step 4 — Wire images correctly

Image fields are typed as plain `z.string()` in the schemas, so Zod will NOT catch a wrong path — but a wrong path renders a broken image in production. Paths must be root-relative under `public/`, start with `/`, and end in `.png|.jpg|.jpeg|.webp|.avif|.svg`.

- **Products** store images in a per-slug folder: `public/images/products/<slug>/…`. Follow the mango pattern:
  - `images.primary` → `/images/products/<slug>/<file>.jpg` (main pack/product shot)
  - `images.gallery` → `["/images/products/<slug>/<file>-1.jpg", …]` (lifestyle/in-bowl shots; `[]` allowed)
  - `images.packaging` → pack photos; `[]` allowed
- **News** `coverImage` → put the file in `public/images/news/<slug>/` (create the folder) **or** reuse an existing product image (frozen-mango.json reuses `/images/products/mango/montana-frozen-mango.jpg`). The path just has to resolve at build.
- If the real image files don't exist on disk yet, tell the user exactly which filenames to drop where (the JSON can reference them before the binaries land; the broken-image only shows at runtime). Do not invent stock paths that don't follow the `<slug>` folder convention.

## Step 5 — Update the listing/cross-link touchpoints (there is NO manual index)

Products and news are discovered by directory glob in `src/lib/content.ts` (`fs.readdir` → filter `.json`), so a new file appears automatically — there is no index array to append to. But wire these real touchpoints as relevant:

- **product**: set `featured: true` only if it should be eligible for the home "Featured products" section; add its slug to sibling products' `relatedSlugs` (and theirs to yours) for cross-linking; to feature it as a catalog "signature", add the slug to `content/pages/catalog.json` → `signatures.slugs`.
- **news**: `featured: true` promotes it into the `/news` featured slideshow; `homepage: true` opts it into the home "From the newsroom" section (which shows the newest opted-in up to `content/pages/home.json` → `latestNews.count`). Both are optional and independent.

## Step 6 — Routes are filename-derived; run the guardrail

New products and news reuse the EXISTING dynamic routes `/catalog/[slug]` and `/news/[slug]` (already in `DYNAMIC_ROUTES`, folders `src/app/[locale]/catalog/[slug]/` and `.../news/[slug]/`), so adding a content file does NOT create a new route and `routes:check` should already pass. Run it anyway as a cheap guardrail; it only flags drift if a brand-new page route folder was added.

## Step 7 — Validate (fix everything before declaring done)

Run from the repo root and read the output:

```bash
npm run content:validate
```

Expect it to end with `✅ All content validated`. On failure it prints the exact JSON path, e.g. `• name.ar — Required` or `• slug "x" ≠ filename "y"` — go fix that field/filename and re-run. Do not stop on the first green line; the script lists every file.

Then the route guardrail:

```bash
npm run routes:check
```

Extra check **for a `page` scaffold**: `scripts/validate-content.ts` only validates `home`, `about`, and `contact` page files (plus `site.json`, top-level `content/markets.json`, products, and news). The other three page files — `content/pages/catalog.json`, `content/pages/markets.json`, and `content/pages/news.json` — have **NO standalone validation**: `content:validate` skips them **and** the vitest suite (`tests/unit/schemas.test.ts`) does not import `catalogPageSchema`/`marketsPageSchema`/`newsPageSchema`. Their schema is only enforced at render time during `next build` (via `src/lib/content.ts` → `loadJson`). So a green `content:validate` **and** a green `npm test` do **not** prove one of those three is valid — you must build:

```bash
npm run build   # the only gate that parses catalog/markets(page)/news(page) against their schema
```

(Heavier than the others, but it is the authoritative check for those three page types.)

If any command fails, iterate until all pass. Then run `npm run format` on the new file so it matches Prettier.

## Step 8 — Hand off to the human docs

Point the user to the matching how-to for the manual follow-up (real image assets, translation sign-off, commit/push, Vercel deploy):

- product → `docs/how-to/add-product.md`
- news → `docs/how-to/publish-news-article.md`
- fields reference → `docs/reference/content-schemas.md`

Summarize what you created: the file path, the type, and any images the user still needs to drop in.

---

## Known doc traps (schema wins over docs)

- `docs/how-to/publish-news-article.md` example uses `"category": "company"` and a `YYYY-MM-slug.json` filename. Both are WRONG for the current code: valid news categories are `corporate|product|market|sustainability|press`, and the filename stem MUST equal the `slug` field (repo convention = clean slug, no date prefix).
- `add-product.md` / `content-schemas.md` show i18n as `{en, ar, fr}` — the real schema also supports `de`; fill it.
- News `body` does NOT support `de` even though title/excerpt do.
- Do NOT touch anything under `.wolf/` while doing this task.
