# Agent readiness

How montanaeg.com supports discovery and use by AI agents, which
[isitagentready.com](https://isitagentready.com) checks are implemented, and
which are deliberately not — with the reasoning, so a future audit doesn't
re-open them by accident.

## Implemented

| Check                   | Where                                  | Notes                                                                                                                                                                                                                                                   |
| ----------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Link headers (RFC 8288) | `vercel.json`                          | `/` and `/en\|ar\|fr\|de` respond with `Link: </.well-known/api-catalog>; rel="api-catalog", </docs/api/openapi.json>; rel="service-desc"`.                                                                                                             |
| API catalog (RFC 9727)  | `public/.well-known/api-catalog`       | Linkset (RFC 9264) describing `/api/contact`. Served as `application/linkset+json` via a `vercel.json` Content-Type override (same trick as an `apple-app-site-association` file).                                                                      |
| OpenAPI description     | `public/docs/api/openapi.json`         | OpenAPI 3.1 spec for `POST /api/contact`. Keep in sync with `src/app/api/contact/route.ts` when validation rules change.                                                                                                                                |
| Content Signals         | `src/app/robots.txt/route.ts`          | `Content-Signal: search=yes, ai-input=yes, ai-train=no`. The old `src/app/robots.ts` metadata file was replaced by this route handler because Next's typed robots API can't emit custom directives.                                                     |
| Agent skills index      | `public/.well-known/agent-skills/`     | `index.json` (Agent Skills Discovery RFC v0.2.0) + one skill, `product-inquiry/SKILL.md`. **If you edit a SKILL.md you must re-hash it:** `shasum -a 256 public/.well-known/agent-skills/product-inquiry/SKILL.md` and update `digest` in `index.json`. |
| WebMCP                  | `src/components/agent/WebMcpTools.tsx` | Registers `list_products` and `submit_business_inquiry` tools via `navigator.modelContext.provideContext()`. Feature-detected — a no-op in browsers without WebMCP. Mounted from the root layout with a build-time product list.                        |

### Content Signals policy

`search=yes, ai-input=yes, ai-train=no` is a deliberate choice for a B2B
marketing site: we _want_ search engines and AI assistants to surface Montana
products (that's the point of the site), but we don't grant model-training
rights. To change the policy, edit `src/app/robots.txt/route.ts`.

## Requires action outside this repo

### DNS for AI Discovery (DNS-AID)

DNS-AID ([draft-mozleywilliams-dnsop-dnsaid](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/))
advertises **agent endpoints** (MCP, A2A) via SVCB/HTTPS records
(RFC 9460) under `_agents.<domain>`. Two prerequisites are missing:

1. **An actual agent endpoint.** The site currently exposes no MCP or A2A
   service, so there is nothing truthful to advertise. Publishing records
   that point at a plain website would mislead resolvers and agents.
2. **DNS access.** Records are published at the DNS provider for
   `montanaeg.com`, not in this repo, and the zone should be DNSSEC-signed
   (enable DNSSEC at the registrar/DNS host; Vercel DNS does not currently
   sign zones — if DNS lives there, DNSSEC requires moving the zone, e.g. to
   Cloudflare).

If/when an MCP server is deployed (e.g. `mcp.montanaeg.com`), publish
ServiceMode records shaped like:

```
_index._agents.montanaeg.com.  3600 IN HTTPS 1 mcp.montanaeg.com. alpn="h2"
_mcp._agents.montanaeg.com.    3600 IN HTTPS 1 mcp.montanaeg.com. alpn="h2"
```

(Check the current draft for the exact SvcParam set — the endpoint-path
parameter was still evolving as of mid-2026.)

## Deliberately not implemented

| Check                                                                   | Why not                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OAuth/OIDC discovery (RFC 8414)                                         | The site has **no protected APIs** and is not an identity provider. Publishing `/.well-known/openid-configuration` with no real `authorization_endpoint`/`token_endpoint` behind it would be false advertising and an attractive nuisance. Revisit only if a protected API ships. |
| OAuth Protected Resource Metadata (RFC 9728)                            | Same reason — there is no protected resource. `/api/contact` is intentionally public.                                                                                                                                                                                             |
| auth.md (WorkOS)                                                        | Agent registration presumes accounts/credentials; the site has none.                                                                                                                                                                                                              |
| MCP Server Card (SEP-1649)                                              | There is no MCP server; a server card pointing nowhere would break agents. A future MCP server exposing the catalog + inquiry tools is the natural next step — the WebMCP component already defines what those tools would look like.                                             |
| Web Bot Auth (JWKS at `/.well-known/http-message-signatures-directory`) | That directory verifies **outbound** signed requests from _our_ bots. Montana operates no crawlers/agents, so there is no signing key to publish. Checker marks this informational.                                                                                               |
| x402 / MPP / UCP / ACP (agent payments & commerce)                      | Not a commerce site — no checkout, no paid API, no per-request monetization. Montana sells B2B via negotiated contracts, so HTTP-payment middleware has nothing to charge for. The checker itself flags these "not a commerce site".                                              |

## Maintenance

- `POST /api/contact` changes → update `public/docs/api/openapi.json` and the
  constraints listed in `public/.well-known/agent-skills/product-inquiry/SKILL.md`
  (then re-hash, see above).
- New public API endpoints → add a linkset entry to
  `public/.well-known/api-catalog`.
- Product catalog moves/renames → `WebMcpTools` gets its product list at
  build time from `getAllProducts()`, so it self-updates; the SKILL.md URL
  patterns are hardcoded and would need editing.
