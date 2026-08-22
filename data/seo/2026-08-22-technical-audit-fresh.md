# Technical SEO Audit — 2026-08-22 Tick

## HTTP Status Checks

| URL | Status | Notes |
|-----|--------|-------|
| `/` | 308 → `/en/` | Single redirect ✅ |
| `/en` | 308 → `/en/` | Single redirect ✅ |
| `/api/blog` | 308 → `/api/blog/` | Single redirect ✅ |
| `/en/` | 200 | ✅ |
| `/en/about/` | 200 | ✅ |
| `/en/projects/` | 200 | ✅ |
| `/en/blog/` | 200 | ✅ |
| `/en/services/kitchen/burnaby/` | 200 | ✅ |
| `/en/services/bathroom/surrey/` | 200 | ✅ |
| `/en/areas/surrey/` | 200 | ✅ |
| `/zh/` | 200 | ✅ |
| `/zh/services/` | 200 | ✅ |
| `/zh/projects/` | 200 | ✅ |

## Schema Confirmed

### FAQPage
- `/en/services/kitchen/burnaby/` — FAQPage with 14 Question entities ✅
- Confirmed via grep: `FAQPage`, `mainEntity`, `Question`, `answerText`

### ContactPage + Organization
- `/en/contact/` — ContactPage schema with:
  - `PostalAddress` ✅
  - `telephone` ✅
  - `email` ✅
  - `openingHoursSpecification` ✅

### Blog Schema
- `/en/blog/` — Blog schema (listing page, not BlogPosting) ✅

### Article Schema (prior tick)
- `/en/blog/duplex-renovation-vancouver-costs-permits-2026/` — Article + FAQPage + BreadcrumbList + WebSite + Organization + LocalBusiness + HomeAndConstructionBusiness ✅

### Area Pages (prior tick)
- `/en/areas/surrey/` — 10 JSON-LD scripts ✅

### Generic Service Pages (prior tick)
- `/en/services/kitchen/` — 3 JSON-LD scripts with 10 schema types ✅

## Redirect Chain Verification
All major routes redirect with single HTTP 308 → target. No redirect chains.

## Hreflang (prior tick — confirmed stable)
- Real blog post slug `duplex-renovation-vancouver-costs-permits-2026`:
  - All 14 locale hreflangs + `x-default` ✅
  - Canonical self-referencing ✅

## Site Verification (prior tick)
- `https://www.reno-stars.com/robots.txt` — `Allow: /` for all crawlers including AI bots ✅
- Sitemap has 5,657 total URLs, 53,721 blog post URLs ✅
- No `service-areas/` URLs in sitemap ✅

## Coverage Status (this tick)

| Cluster | Cities | Status |
|---------|--------|--------|
| Kitchen × 9 cities | All 9 | ✅ COMPLETE |
| Bathroom × 9 cities | All 9 | ✅ COMPLETE |
| Basement × 9 cities | All 9 | ✅ COMPLETE |
| Whole-house × 9 cities | Vancouver, Surrey, Delta, West Vancouver | ✅ FILLED |
| Whole-house × 9 cities | North Vancouver | ❌ DATA-BOUND — no `projects` rows with whole-house type in North Vancouver (only 2 bathroom projects exist) |
| Whole-house × 9 cities | Langley | ❌ DATA-BOUND — no projects at all |
| Whole-house × 9 cities | New Westminster | ❌ DATA-BOUND — no projects at all |

## Blockers
- Blog API: `POST https://www.reno-stars.com/api/blog/` → **HTTP/2 503** — `BLOG_API_SECRET` not mounted in k3s pod
- 12 blog post JSONs committed to branch, pending k8s fix
- excerpt_zh migration backlog: 24 files pending human apply (cap: 3)
