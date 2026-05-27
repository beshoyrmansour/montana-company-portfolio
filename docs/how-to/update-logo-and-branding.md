# Update the logo and brand assets

The brand mark, full logo, and other site-wide assets are static files under `public/images/`. Replacing a file with the same name automatically updates the site at the next build.

## Brand asset map

```
public/images/
├── logo/
│   ├── montana-logo.png      Full logo (header on desktop)
│   └── montana-mark.svg      Mark only (header on mobile, favicon source)
├── about/                    Chairman portrait, facility hero
├── facility/                 Cold-store, greenhouse, QA bench shots
├── heroes/                   Homepage and section hero images
└── products/                 Product photography (separate guide)
public/favicon.ico            Browser-tab icon
public/docs/Montana-Catalogue.pdf  Downloadable PDF catalogue
```

## Prerequisites

- Git installed; push access to `main`.
- The replacement asset, exported at the correct dimensions and format _(see below)_.
- If changing the **brand mark** (logo) — sign-off from whoever owns brand identity.

## Recommended dimensions

| Asset | Format | Dimensions | Max file size |
| --- | --- | --- | --- |
| Full logo (`montana-logo.png`) | PNG (transparent BG) | 480 × 120 px @2x | 50 KB |
| Brand mark (`montana-mark.svg`) | SVG | viewBox 0 0 64 64 | 10 KB |
| Favicon | ICO multi-size | 16, 32, 48 px | 30 KB |
| Hero photos | JPG | 2400 × 1200 px | 350 KB |
| About / facility photos | JPG | 1600 × 1200 px | 250 KB |
| PDF catalogue | PDF | 10–15 MB max | — |

Use [`squoosh.app`](https://squoosh.app) or `npm run content:process-images` to compress JPGs without quality loss.

## Steps — swap a logo

1.  **Export the new file** with the exact same filename as the existing one. The path must stay `public/images/logo/montana-logo.png` (or `.svg`).

2.  **Replace the file** on disk (drag and drop in Finder, or `cp` in the terminal).

3.  **Confirm the file actually replaced** (not duplicated with a `(1)` suffix):

    ```bash
    ls -lh public/images/logo/
    ```

4.  **Preview locally** _(strongly recommended for brand changes):_

    ```bash
    npm run dev
    ```

    Open <http://localhost:3000> and check the logo at all viewport sizes (desktop, tablet, mobile). Especially check the header on a dark background — transparent PNG edges can show artifacts.

5.  **Commit and push.**

    ```bash
    git add public/images/logo/
    git commit -m "brand: update Montana logo"
    git push origin main
    ```

6.  **Wait 2–4 minutes** for the rebuild.

## Steps — swap a different asset (about photo, facility, hero, etc.)

The procedure is the same as for the logo, but with two extra considerations:

1.  **Check what references the file** before replacing — search for the filename in the codebase:

    ```bash
    grep -r "your-old-filename" content/ src/
    ```

    If a `content/*.json` file references the path, you can either:
    - Keep the same filename (easiest), or
    - Rename and update every reference. Don't half-do this — you'll get broken images.

2.  **Image dimensions matter** for layout. If you swap a portrait shot with a landscape one, the page may shift. Match the aspect ratio of the old image when possible.

## Steps — change the favicon

The favicon is **separate** from the brand mark and lives at `public/favicon.ico`.

1. Generate an ICO file from the new mark. Free tools: <https://realfavicongenerator.net/>.
2. Replace `public/favicon.ico`.
3. Commit and push.
4. After deploy, hard-refresh the live site (browsers cache favicons aggressively — sometimes for hours).

## Steps — update the PDF catalogue

1. Replace `public/docs/Montana-Catalogue.pdf` with the new file. Keep the filename exactly.
2. Confirm the file size is < 15 MB. If it's larger, compress it (Preview on macOS → Export → Reduce File Size).
3. Commit, push, wait for the build.

The "Download catalogue" buttons link to this exact path; no other change is required.

## Verify

- The new asset shows on the live site (hard-refresh if it doesn't update immediately).
- Logo looks crisp on Retina displays (check Settings → Display on macOS, switch resolution if testing).
- Image dimensions didn't break the layout — scroll through the page that uses the asset.

## Rollback

```bash
git revert HEAD
git push origin main
```

The old asset comes back at the next build.

## Troubleshooting

- **New logo doesn't show after deploy** — Almost always browser cache for images. Open in a private/incognito window. If it still doesn't show there, check the file was actually committed: `git log -- public/images/logo/`.
- **Logo looks blurry on mobile** — PNG was exported at 1x. Re-export at 2x or 3x and keep CSS sizing the same.
- **SVG renders as a broken icon** — The SVG file may have invalid XML or a missing `viewBox`. Open in a browser directly (`http://localhost:3000/images/logo/montana-mark.svg`) to see the error.
- **Image is huge — site feels slow** — Run `npm run content:process-images` (or use squoosh.app) to compress.

## Related

- [Edit page content](edit-page-content.md) for changing brand name text or tagline (those live in `content/site.json`, not as an image).
- [npm scripts reference](../reference/npm-scripts.md) — `content:process-images` details.
