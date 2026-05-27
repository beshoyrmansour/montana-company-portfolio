# Update legal pages

The privacy, terms, and cookies pages are plain Markdown files — one per language. They render as-is at `/privacy`, `/terms`, and `/cookies`.

## File map

```
content/legal/
├── privacy.en.md   →  /privacy
├── privacy.ar.md   →  /ar/privacy
├── privacy.fr.md   →  /fr/privacy
├── terms.en.md     →  /terms
├── terms.ar.md     →  /ar/terms
├── terms.fr.md     →  /fr/terms
├── cookies.en.md   →  /cookies
├── cookies.ar.md   →  /ar/cookies
└── cookies.fr.md   →  /fr/cookies
```

Each pair (`privacy.en.md` / `privacy.ar.md` / `privacy.fr.md`) is an **independent file** — they're not auto-synced. If you change the English version, you must update Arabic and French separately.

## Prerequisites

- Git installed; push access to `main`.
- The updated legal text in **all three languages**. _For legally binding documents, English-only updates create a compliance gap — translate before pushing._
- Sign-off from whoever owns legal content (typically the legal/compliance team).

## Steps

1.  **Open the file** you need to change (e.g., `content/legal/privacy.en.md`).

2.  **Edit the Markdown.** Standard Markdown applies:

    ```markdown
    # Privacy Policy

    _Last updated: 15 June 2026_

    ## 1. Who we are

    United Co. for Food Industries — Montana ("Montana", "we", "us")…

    ## 2. What we collect

    - Contact form submissions (name, email, message)
    - …
    ```

    Use headings (`##`) for sections — the page renders them as a TOC if there are enough.

3.  **Update the matching translations.** Open `privacy.ar.md` and `privacy.fr.md` and apply the same change. **Do not leave them out of sync** — the Arabic version of the privacy page is what an Arabic-speaking visitor sees and what regulators will look at.

4.  **Update the "Last updated" date** at the top of all three files.

5.  **Validate.**

    ```bash
    npm run content:validate
    ```

    (Legal files are Markdown, not JSON — validation here is mostly a no-op, but running it confirms nothing else broke.)

6.  **Preview locally** _(strongly recommended for legal text):_

    ```bash
    npm run dev
    ```

    Then visit `/privacy`, `/ar/privacy`, `/fr/privacy`. Read through. Bad rendering on a legal page is a real problem.

7.  **Commit and push.**

    ```bash
    git add content/legal/
    git commit -m "legal: update privacy policy (effective 2026-06-15)"
    git push origin main
    ```

    Use a clear commit message that names which document changed and the effective date — legal teams will look at git history when answering audit questions.

## Verify

- Visit `/privacy`, `/terms`, `/cookies` and their AR/FR variants.
- Check the "Last updated" date matches what you put in.
- Click any internal links inside the documents; they should resolve.

## Rollback

```bash
git revert HEAD
git push origin main
```

Be careful: reverting a legal-text change reinstates the old policy. If the change was a corrected typo, just push another edit forward — don't revert.

## Cookie banner copy

The pop-up cookie banner is **separate** from the `/cookies` page. Its text comes from the UI translations file, not from `content/legal/`. To change banner copy: see [update-translations.md](update-translations.md), look for the `cookieBanner` section in `messages/en.json` etc.

## Troubleshooting

- **A section heading doesn't render** — Markdown headings need a blank line above them.
- **Bulleted list breaks into prose** — Lists need a blank line before the first bullet.
- **Special characters look wrong in Arabic** — Save the file as UTF-8 (most editors do this by default). Avoid Word — it inserts smart quotes and non-breaking spaces.

## Compliance notes

- These pages are linked from the **footer on every page** and from the **cookie banner**. Changing them affects the entire site.
- If the change is material (not a typo), record it in the commit message and notify legal.
- The exact contents of these pages may be subject to PDPL / GDPR-style requirements; this guide does not advise on what the policies should say — only how to update them.

## Related

- [Update translations](update-translations.md) for cookie banner copy and other UI strings.
- [Edit page content](edit-page-content.md) for non-legal copy.
