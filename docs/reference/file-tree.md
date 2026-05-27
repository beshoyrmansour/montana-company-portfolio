# File tree

What lives where. Folders that an IT person typically touches are marked **(edit me)**; everything else is engineering territory.

```
web/
├── README.md                       Project intro
├── docs/                           ← This documentation
├── package.json                    Dependencies + npm scripts
├── package-lock.json               Pinned dependency versions
├── tsconfig.json                   TypeScript config
├── next.config.ts                  Next.js config (redirects, image rules)
├── vercel.json                     Vercel project config (framework, region, headers)
├── postcss.config.mjs              PostCSS (Tailwind 4 pipeline)
├── eslint.config.mjs               ESLint rules
├── playwright.config.ts            E2E test config
├── vitest.config.ts                Unit test config
├── lychee.toml                     Docs link-checker config
├── .gitignore                      Files git ignores
├── .nvmrc                          Node version (read by nvm / .tool-versions)
├── .prettierrc                     Code formatter rules
├── .env.example                    Env-var template (in git)
├── .env.local                      Your local env values (NOT in git)
├── .vercel/                        Vercel CLI link (NOT in git)
├── .github/
│   └── workflows/
│       └── ci.yml                  GitHub Actions CI pipeline
│
├── content/                        ← Editable content (edit me)
│   ├── site.json                   Brand, contact, social, certs (edit me)
│   ├── markets.json                Regions + countries (edit me)
│   ├── pages/                      One JSON per top-level page (edit me)
│   │   ├── home.json
│   │   ├── about.json
│   │   ├── catalog.json
│   │   ├── contact.json
│   │   ├── markets.json
│   │   └── news.json
│   ├── products/                   16 product JSONs (edit me)
│   │   ├── molokhia.json
│   │   ├── …
│   ├── news/                       News articles (edit me)
│   │   └── YYYY-MM-slug.json
│   ├── legal/                      Privacy / terms / cookies (edit me)
│   │   ├── privacy.{en,ar,fr}.md
│   │   ├── terms.{en,ar,fr}.md
│   │   └── cookies.{en,ar,fr}.md
│   └── inbox/                      Contact-form fallback drop (gitignored except .gitkeep)
│
├── messages/                       ← UI translations (edit me)
│   ├── en.json                     English UI strings
│   ├── ar.json                     Arabic UI strings
│   └── fr.json                     French UI strings
│
├── public/                         ← Static assets, served as-is (edit me)
│   ├── favicon.ico
│   ├── cookie-banner.js            Vanilla JS cookie banner
│   ├── docs/Montana-Catalogue.pdf  Downloadable PDF
│   └── images/
│       ├── logo/                   Logo + brand mark
│       ├── products/               Product photography
│       ├── about/, facility/       Editorial photography
│       ├── heroes/                 Page hero images
│       ├── maps/                   World + Egypt SVGs
│       └── themes/ramadan/         Ramadan ornaments
│
├── scripts/
│   ├── validate-content.ts         npm run content:validate
│   ├── process-images.ts           npm run content:process-images
│   └── gen-world-paths.mjs         Generate SVG world-map paths (one-shot)
│
├── src/                            Application code (engineering territory)
│   ├── middleware.ts               Redirects `/` to the visitor's locale (Accept-Language → /en, /ar, /fr)
│   ├── app/                        Next.js App Router (pages + layouts + API)
│   │   ├── layout.tsx              Root layout
│   │   ├── page.tsx                Root `/` fallback (real visitors are redirected by middleware)
│   │   ├── [locale]/               Trilingual routes
│   │   │   ├── page.tsx            Home
│   │   │   ├── about/page.tsx
│   │   │   ├── catalog/
│   │   │   │   ├── page.tsx        Catalog listing
│   │   │   │   └── [slug]/page.tsx Product detail
│   │   │   ├── news/, markets/, contact/, privacy/, terms/, cookies/
│   │   │   ├── layout.tsx          Locale-aware layout (header, footer)
│   │   │   └── opengraph-image.tsx Dynamic OG image
│   │   ├── api/
│   │   │   └── contact/route.ts    Contact form (Vercel serverless function)
│   │   ├── robots.ts               /robots.txt generator
│   │   ├── sitemap.ts              /sitemap.xml generator
│   │   └── not-found.tsx           404 page
│   ├── components/                 React components
│   │   ├── layout/                 Header, Footer, Logo, Locale switcher, etc.
│   │   ├── sections/               Page-level sections (contact form, maps, …)
│   │   ├── primitives/             Button, Card, Badge
│   │   ├── catalog/, markets/, news/, product/, contact/, decoration/, seo/
│   │   └── emails/                 Transactional email templates
│   ├── lib/                        Helpers
│   │   ├── content.ts              Content loader (reads content/*.json)
│   │   ├── i18n.ts                 Locale config + RTL helper
│   │   ├── theme.ts                Active-theme resolver
│   │   ├── seo.ts                  Metadata + JSON-LD builders
│   │   ├── fonts.ts                Font setup (Poppins + Almarai)
│   │   ├── feature-flags.ts        Env-flag readers
│   │   └── cn.ts                   Tailwind class-merger
│   ├── schemas/                    ← Source of truth for content shape
│   │   ├── product.ts
│   │   ├── news.ts
│   │   ├── markets.ts
│   │   ├── page.ts                 Schemas for all 6 page content files
│   │   ├── site.ts
│   │   └── shared.ts               i18nString, slug, imagePath
│   ├── styles/                     Design tokens + themes
│   │   ├── tokens.css              CSS custom properties
│   │   ├── reset.css               Browser reset
│   │   └── themes/                 default.css / ramadan.css / christmas.css
│   ├── i18n/request.ts             next-intl runtime config (works with `middleware.ts` for root-URL locale detection)
│   └── types/                      Shared TypeScript types
│
├── tests/                          Test suites
│   ├── unit/                       Vitest
│   │   └── schemas.test.ts         Validates every content file at test time
│   └── e2e/                        Playwright
│       └── smoke.spec.ts           Page renders, language switch, contact form
│
├── node_modules/                   Installed dependencies (gitignored)
└── .next/                          Next.js build output (gitignored)
```

## What gets deployed

Vercel deploys two things on every push to `main`:

1. **The Next.js build** — pages, components, static assets, optimized images. Served from Vercel's global edge.
2. **Serverless functions** — `src/app/api/contact/route.ts` becomes a Vercel serverless function at `/api/contact`.

Everything else (`node_modules/`, `tests/`, `docs/`, `scripts/`) is build-time only — used to produce the deploy bundle, not shipped to visitors.

## "Edit me" rule of thumb

If your task is "change content the visitor sees," you'll be editing in:

- `content/` (text, structured data)
- `messages/` (UI strings)
- `public/` (images, PDFs)

If you find yourself opening anything under `src/`, `next.config.ts`, `vercel.json`, or the other root config files — pause. That's a code change, and engineering should review.
