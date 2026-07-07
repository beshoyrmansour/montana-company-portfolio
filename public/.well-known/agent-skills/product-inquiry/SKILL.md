---
name: montana-product-inquiry
description: Browse the Montana Frozen Foods product catalog (Egyptian IQF vegetables and fruits) and submit a trade or sales inquiry to the Montana sales team.
---

# Montana Frozen Foods — product discovery & trade inquiry

Montana Frozen Foods (montanaeg.com) is a family-owned Egyptian exporter of IQF
(individually quick frozen) vegetables and fruits, shipping to ~30 countries
since 1985. This skill explains how to find product information and how to
submit a business inquiry programmatically.

## Discover products

- The full catalog lives at `https://montanaeg.com/{locale}/catalog` where
  `{locale}` is one of `en`, `ar`, `fr`, `de`.
- Each product has a detail page at
  `https://montanaeg.com/{locale}/catalog/{slug}` (e.g.
  `/en/catalog/molokhia`, `/en/catalog/okra`, `/en/catalog/strawberry`) with
  varieties, packaging formats, seasonality, and nutrition facts, plus
  Product JSON-LD in the page head.
- `https://montanaeg.com/sitemap.xml` enumerates every page in every locale.
- A downloadable product catalogue PDF is at
  `https://montanaeg.com/docs/Montana-Catalogue.pdf`.

## Submit a trade inquiry

The site exposes one public API endpoint, described by OpenAPI at
`https://montanaeg.com/docs/api/openapi.json` (see also
`/.well-known/api-catalog`):

```
POST https://montanaeg.com/api/contact
Content-Type: application/json

{
  "name": "Jane Buyer",
  "email": "jane@importer.example",
  "company": "Importer GmbH",
  "subject": "export",
  "message": "We are interested in 20ft container pricing for IQF molokhia to Hamburg.",
  "consent": true
}
```

Rules:

- `subject` must be one of `general`, `sales`, `export`, `press`. Use
  `export` for international trade and distribution inquiries.
- `name` is 2–100 characters; `message` is 10–5000 characters; `email` must
  be a valid reply-to address (the sales team answers by email).
- `consent: true` is required and asserts the sender agrees to Montana
  processing the data to answer the inquiry
  (privacy policy: `https://montanaeg.com/en/privacy`).
- Send only the documented fields.
- A `200 {"ok": true}` response means the inquiry reached the sales team.
  On `502 {"error": "mail_failed"}`, retry later or email
  `info@montanaeg.com` directly.

## Notes for agents

- All content pages are static HTML and may be fetched without
  authentication. Respect `robots.txt`, including its `Content-Signal`
  directives.
- Only submit an inquiry on behalf of a real principal with a monitored
  email address — the sales team replies to `email`.
