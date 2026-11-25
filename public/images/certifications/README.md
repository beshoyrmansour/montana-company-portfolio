# Certification logos

Drop the official certification logo files here, then map them in
`src/lib/certs.ts` → `CERT_LOGOS` (one line per cert).

Format: **PNG or SVG, transparent or white background**, roughly 2:1–3:1
landscape, ~600 px wide min. They render on a white tile, so colour logos work.

Expected filenames (match the `CERT_LOGOS` map):

| Cert          | File            |
| ------------- | --------------- |
| BRCGS         | `brcgs.png`     |
| ISO 22000     | `iso-22000.png` |
| Halal         | `halal.png`     |
| FDA           | `fda.png`       |

Until a logo is added, that cert shows a brand icon placeholder automatically.
