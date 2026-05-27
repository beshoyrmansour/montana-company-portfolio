# Documentation

This folder is the **operational manual** for the Montana website. It assumes you know how to use git, edit a text file, and click around the Vercel dashboard. It does **not** assume you know Next.js or React.

The structure follows the [Diátaxis](https://diataxis.fr/) framework:

- **How-to guides** — task-oriented. "I want to do X. Give me the steps." Use these first.
- **Reference** — lookup tables. "What does this env var do?"
- **Runbooks** — incident response. "Something is broken right now." Used when the site is down or a deploy failed.

If you can't find what you need, see [Add a missing guide](#adding-a-new-guide) below.

---

## How-to guides

Step-by-step procedures for routine work.

### Content

- [Add or update a product](how-to/add-product.md)
- [Publish a news article](how-to/publish-news-article.md)
- [Edit page content (Home, About, Catalog, Contact, Markets, News)](how-to/edit-page-content.md)
- [Update legal pages (privacy / terms / cookies)](how-to/update-legal-pages.md)
- [Update translations (UI strings in EN / AR / FR)](how-to/update-translations.md)

### Branding & theme

- [Switch the seasonal theme (default / Ramadan / Christmas)](how-to/switch-theme.md)
- [Update the logo and brand assets](how-to/update-logo-and-branding.md)

### Configuration

- [Change an environment variable](how-to/change-environment-variable.md)
- [Show or hide a page in the nav and sitemap](how-to/hide-or-show-a-page.md)
- [Set up the contact form (Resend + Turnstile)](how-to/set-up-contact-form.md)

### Deployment

- [Deploy to Vercel](how-to/deploy-to-vercel.md)

---

## Reference

Lookup tables. Skim, don't read end-to-end.

- [Environment variables](reference/env-vars.md) — every var, what it controls, default, who needs it.
- [npm scripts](reference/npm-scripts.md) — every command in `package.json`.
- [Content schemas](reference/content-schemas.md) — the shape of each JSON file under `content/`.
- [File tree](reference/file-tree.md) — what lives where in the repo.

---

## Runbooks

Open these only when something is **on fire**.

- [Site is down](runbooks/site-down.md)
- [A Vercel build failed](runbooks/build-failed-on-vercel.md)
- [Contact form is not delivering email](runbooks/contact-form-not-delivering.md)

---

## Conventions used across these docs

- Code blocks are exact — you can copy-paste.
- File paths are relative to the `web/` folder unless an absolute path is shown.
- A leading `$` in a code block means "run this in a terminal." Don't copy the `$`.
- "The dashboard" always means the Vercel dashboard at <https://vercel.com>.
- "Push to main triggers a build" is true; you don't need to click anything to deploy.

## Adding a new guide

If you find yourself doing a procedure twice and there's no doc for it, add one:

1. Drop a new markdown file in `docs/how-to/`, `docs/reference/`, or `docs/runbooks/` as appropriate.
2. Use one of the existing files as a template — the format is consistent on purpose.
3. Link it from this index.
4. Commit with a message like `docs: add how-to for X`.
