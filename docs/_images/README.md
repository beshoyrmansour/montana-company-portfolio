# Diagrams and screenshots

This folder holds the visuals referenced from the docs. Two kinds of file live here:

- **`*.svg` illustrations** — diagrams of the relevant dashboard panels. Each one labels the key UI elements an IT person needs to interact with, so the doc reader can orient themselves without a live login. These ship with the repo today.
- **`*.png` real screenshots** — optional. When you next perform the task documented in a how-to or runbook, replace the matching SVG with a real screenshot at the same filename _(with `.png` instead of `.svg`)_ — the markdown img tag references will pick it up.

## Files currently in this folder

| File | What it depicts | Referenced from |
| --- | --- | --- |
| [`vercel-env-vars.svg`](vercel-env-vars.svg) | Vercel → Settings → Environment variables, Production tab | [`how-to/change-environment-variable.md`](../how-to/change-environment-variable.md), [`how-to/switch-theme.md`](../how-to/switch-theme.md) |
| [`vercel-deployments.svg`](vercel-deployments.svg) | Vercel → Deployments tab with Ready / Error / Production badges | [`how-to/deploy-to-vercel.md`](../how-to/deploy-to-vercel.md), [`runbooks/build-failed-on-vercel.md`](../runbooks/build-failed-on-vercel.md), [`runbooks/site-down.md`](../runbooks/site-down.md) |
| [`vercel-build-log.svg`](vercel-build-log.svg) | Vercel build log with a content-validation error highlighted | [`runbooks/build-failed-on-vercel.md`](../runbooks/build-failed-on-vercel.md) |
| [`vercel-functions-log.svg`](vercel-functions-log.svg) | Vercel → Logs → Real-time Logs with status codes | [`runbooks/contact-form-not-delivering.md`](../runbooks/contact-form-not-delivering.md) |
| [`resend-api-keys.svg`](resend-api-keys.svg) | Resend dashboard → API Keys table with Create button | [`how-to/set-up-contact-form.md`](../how-to/set-up-contact-form.md) |
| [`turnstile-keys.svg`](turnstile-keys.svg) | Cloudflare Turnstile site config with Site Key and Secret Key panels | [`how-to/set-up-contact-form.md`](../how-to/set-up-contact-form.md) |
| [`product-anatomy.svg`](product-anatomy.svg) | Product JSON → rendered product page (fields mapped to elements) | [`how-to/add-product.md`](../how-to/add-product.md) |
| [`news-anatomy.svg`](news-anatomy.svg) | News article JSON → rendered article page | [`how-to/publish-news-article.md`](../how-to/publish-news-article.md) |
| [`home-page-map.svg`](home-page-map.svg) | Homepage wireframe with each section labeled by its `content/pages/home.json` key | [`how-to/edit-page-content.md`](../how-to/edit-page-content.md) |
| [`theme-palettes.svg`](theme-palettes.svg) | Side-by-side comparison of the default / ramadan / christmas themes | [`how-to/switch-theme.md`](../how-to/switch-theme.md) |

## Replacing an illustration with a real screenshot

1.  Capture the screen using your OS tool (macOS: `Cmd-Shift-4`, then drag the area).
2.  **Mask any secret values** in an image editor — API keys, tokens, customer emails, billing info. Paint over them with a solid block.
3.  Save as PNG. Use the **same base filename as the existing SVG** (e.g., `vercel-env-vars.png`).
4.  Update the matching `.svg` reference in the docs to `.png`. Search the docs for the old filename:
    ```bash
    grep -rn 'vercel-env-vars\.svg' docs/ README.md
    ```
5.  Commit:
    ```bash
    git add docs/_images/vercel-env-vars.png docs/how-to/*.md docs/runbooks/*.md
    git commit -m "docs: replace vercel-env-vars illustration with real screenshot"
    ```

You can also keep both — the docs just have to reference one of them. SVGs scale better; PNGs match the real UI exactly. Use what's clearer.

## Why illustrations and not just screenshots?

Real screenshots go stale every time the vendor redesigns their dashboard. Stale screenshots in docs is the #1 cited documentation anti-pattern ([Write the Docs](https://www.writethedocs.org/guide/writing/docs-principles/)).

Illustrations show the **structure** of the panel — what tabs exist, what columns are in the table, where the critical button lives — without depending on the vendor's exact pixel layout. They're version-controlled text (you can `git diff` them), accessible (the label text is real text, not pixels), and they highlight the relevant action with a callout.

When the dashboard does change, the illustration is easier to update than re-shooting and re-cropping a PNG.

## CI

The docs link checker (`lychee`, run in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)) requires every referenced file to exist. SVGs in this folder are checked normally. PNG placeholders are excluded via [`lychee.toml`](../../lychee.toml) so future additions don't break the build.
