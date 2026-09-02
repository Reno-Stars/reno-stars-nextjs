# SEO Audit Notes — 2026-09-02

## Ladder 2 — Schema Audits

### Projects Listing Page (`/en/projects/`)
- 2 JSON-LD blocks
- Schema types: WebSite, BreadcrumbList, ItemList, FAQPage, AggregateRating, Review
- **No Organization/LocalBusiness** — same as services listing; aggregate listing pages intentionally omit it
- Detail pages (e.g. `/en/projects/richmond-whole-house-renovation-three-bathrooms/`) carry full Organization schema ✅

### FAQ Page (`/en/faq/`)
- HTTP 404 — no central FAQ page; FAQ content lives on individual FAQ detail pages ✅

### Service Areas Vancouver (`/en/areas/vancouver/`)
- 2 JSON-LD blocks
- Schema types: WebSite, BreadcrumbList, Service, City, FAQPage, OfferCatalog
- No Organization (AdministrativeArea replaces it for geographic pages) ✅

### Features Page (`/en/features/`)
- 1 JSON-LD block
- Schema types: FAQPage, WebSite, BreadcrumbList
- No Organization — thin FAQ content page; legitimate ✅

### Design Page (`/en/design/`)
- 1 JSON-LD block
- Same pattern as features — FAQPage + WebSite + BreadcrumbList ✅

## Ladder 3 — Internal Link Coverage

### Stub zh Posts (from Tick 69)
| slug | internal links |
|------|---------------|
| kitchen-vs-bathroom-reno-vancouver-2026 | **0** — COVERAGE GAP |
| adu-renovation-vancouver-2026 | 33 |
| split-level-home-renovation-burnaby-coquitlam-2026 | 9 |
| vancouver-infill-development-cost-2026 | 9 |
| heritage-home-renovation-vancouver-2026 | 13 |
| mid-century-rancher-renovation-vancouver-2026 | 9 |

`kitchen-vs-bathroom-reno-vancouver-2026` has zero inbound internal links — coverage gap requiring editorial attention.

## Ladder 4 — Live Site Status (as of Tick 72)

### robots.txt
- Live site: anthropic-ai and cohere-ai are **BLOCKED** (`Disallow: /`)
- Branch fix at `42455f8`: both crawlers are **ALLOWED** (separate userAgent group with `allow: /`)
- **Deploy status:** NOT YET DEPLOYED — pending Gitea mirror → reno-stars-infra PR → human merge → k3s

### llms.txt
- Live site: static `Projects (100+)` count
- Branch fix at `42455f8`: dynamic `${COMPANY_STATS.projectsCompleted}` from DB
- **Deploy status:** NOT YET DEPLOYED — pending Gitea mirror → reno-stars-infra PR → human merge → k3s

## All 4 Ladders — Complete (Tick 69-72)

- **Ladder 1:** All 8 tables audited; meta_description_zh published=0 NULL ✅
- **Ladder 2:** Blog post metadata complete ✅; project pages schema complete ✅; service/area/listing pages verified ✅
- **Ladder 3:** Service × area coverage complete ✅; content integrity (6 stub zh posts) migration written ✅; kitchen-vs-bathroom coverage gap flagged ✅
- **Ladder 4:** Sitemap 5,825 entries ✅; hreflang 14 ✅; security headers ✅; TTFB healthy ✅; robots.txt/llms.txt fixes in branch, not yet deployed ⚠️
