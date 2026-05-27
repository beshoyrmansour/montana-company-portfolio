# Montana — montanaeg.com

Trilingual (AR / EN / FR) corporate marketing site for **United Co. for Food Industries — Montana**, Egyptian frozen-food exporter.

Built with **Next.js 15 (App Router)** · TypeScript · Tailwind CSS 4 · next-intl · deployed on **Vercel** (DNS + Turnstile stay on Cloudflare).

---

## I want to…

| Task | Where to go |
| --- | --- |
| Add or update a product | [docs/how-to/add-product.md](docs/how-to/add-product.md) |
| Publish a news article | [docs/how-to/publish-news-article.md](docs/how-to/publish-news-article.md) |
| Edit page content (Home, About, Contact, …) | [docs/how-to/edit-page-content.md](docs/how-to/edit-page-content.md) |
| Update legal pages (privacy / terms / cookies) | [docs/how-to/update-legal-pages.md](docs/how-to/update-legal-pages.md) |
| Update translations (EN / AR / FR strings) | [docs/how-to/update-translations.md](docs/how-to/update-translations.md) |
| Switch the seasonal theme (Ramadan / Christmas) | [docs/how-to/switch-theme.md](docs/how-to/switch-theme.md) |
| Change the logo or brand assets | [docs/how-to/update-logo-and-branding.md](docs/how-to/update-logo-and-branding.md) |
| Change an environment variable | [docs/how-to/change-environment-variable.md](docs/how-to/change-environment-variable.md) |
| Show or hide a page in nav | [docs/how-to/hide-or-show-a-page.md](docs/how-to/hide-or-show-a-page.md) |
| Deploy the site | [docs/how-to/deploy-to-vercel.md](docs/how-to/deploy-to-vercel.md) |
| Set up the contact form | [docs/how-to/set-up-contact-form.md](docs/how-to/set-up-contact-form.md) |
| Something broke — site is down, build failed, contact form not delivering | [docs/runbooks/](docs/runbooks/) |
| Look up an env var or script | [docs/reference/](docs/reference/) |

Full doc index: [`docs/README.md`](docs/README.md).

---

## Quick start (for developers)

You need **Node 20+** (see `.nvmrc`) and **npm**.

```bash
git clone <repo-url> && cd web
npm install
cp .env.example .env.local      # fill in the values you need
npm run dev                     # → http://localhost:3000
```

Other common commands:

```bash
npm run build               # production build (.next/)
npm start                   # serve the production build at :3000
npm run content:validate    # validate all JSON content against zod schemas
npm test                    # vitest unit tests
npm run test:e2e            # playwright smoke tests (needs `npm start` running)
npm run lint                # eslint
npm run typecheck           # tsc --noEmit
```

Full list: [docs/reference/npm-scripts.md](docs/reference/npm-scripts.md).

---

## Where things live

```
web/
├── content/         Editable content (JSON + Markdown) — IT-editable
├── messages/        UI translations (en / ar / fr) — IT-editable
├── public/          Static assets (images, icons, PDF catalogue)
├── scripts/         Content validation + image processing helpers
├── src/
│   ├── app/         Next.js App Router (pages + layouts + API routes)
│   │   └── api/contact/route.ts  Contact form (Vercel serverless function)
│   ├── components/  React components (layout, sections, primitives, …)
│   ├── lib/         Helpers (content loader, i18n, theme, SEO)
│   ├── schemas/     Zod schemas — source of truth for content shape
│   └── styles/      Tokens + seasonal themes
├── tests/
│   ├── unit/        Vitest (schema validation)
│   └── e2e/         Playwright (page smoke tests)
├── next.config.ts   Next.js config + URL redirects
├── vercel.json      Vercel framework + region + headers
└── docs/            Operational documentation (this folder's README)
```

Detailed tree with file-by-file purpose: [docs/reference/file-tree.md](docs/reference/file-tree.md).

---

## Environment variables

Copy `.env.example` to `.env.local` for local dev. For production, set values in **Vercel → Project Settings → Environment Variables**, not in a file.

Every variable, what it does, and which feature needs it: [docs/reference/env-vars.md](docs/reference/env-vars.md).

---

## Deployment

Hosted on **Vercel**. Pushing to `main` triggers a build; Vercel deploys both the Next.js app and the `/api/contact` serverless function. DNS stays on Cloudflare, so the domain, SSL, and Turnstile keep working as before.

Step-by-step: [docs/how-to/deploy-to-vercel.md](docs/how-to/deploy-to-vercel.md). If a deploy fails: [docs/runbooks/build-failed-on-vercel.md](docs/runbooks/build-failed-on-vercel.md).

---

## Support

- **Operational questions** (content, theme, deploys): start in [`docs/`](docs/).
- **Code / bugs**: open an issue or contact the engineering team.
- **Incident** (site down, form failing): [`docs/runbooks/`](docs/runbooks/).

## License

Proprietary — all rights reserved by United Co. for Food Industries.
