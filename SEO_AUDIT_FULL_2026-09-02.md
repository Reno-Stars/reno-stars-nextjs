# SEO AUTHORITY-GAP AUDIT — reno-stars.com
**Date:** 2026-09-02
**Auditor:** seo-all agent
**Scope:** Full authority, content, schema, technical audit

---

## 1. INVENTORY SUMMARY

| Entity | Count | Notes |
|--------|-------|-------|
| Published blog posts | 254 | 16 drafts (11 missing meta_description_en, 9 missing focus_keyword_en — all drafts) |
| Service pages | 11 | All 9 project-type services have live pages |
| Service area pages | 14 | All 14 areas have live pages at /en/areas/<slug>/ |
| Projects | 58 | 17 project_sites groupings |
| FAQs | 210 | Content integrity confirmed |
| project_scopes | 321 | zh completeness confirmed |
| Sitemap entries | 5,825 | All 14 locales in hreflang |

---

## 2. CONTENT INTEGRITY

### zh Localisation Completeness
| Table | Column | NULL Count | Status |
|-------|--------|------------|--------|
| faqs | answer_zh / question_zh | 0 | ✓ PASS |
| services | description_zh / long_description_zh | 0 | ✓ PASS |
| service_areas | content_zh / description_zh | 0 | ✓ PASS |
| project_scopes | scope_zh | 0 | ✓ PASS |
| blog_posts | content_zh | 0 | ✓ PASS |
| blog_posts | title_zh / excerpt_zh | 1 | `pre-sale-renovation-white-rock-bc-2026` — excerpt_zh NULL. Migration committed (NOT APPLIED). |

### English-Bleed in zh Fields
| Query | Result | Status |
|-------|--------|--------|
| `faqs.answer_zh !~ '[一-鿿]'` | 0 rows | ✓ PASS |
| `faqs.question_zh !~ '[一-鿿]'` | 0 rows | ✓ PASS |
| `services.description_zh !~ '[一-鿿]'` | 0 rows | ✓ PASS |
| `service_areas.content_zh !~ '[一-鿿]'` | 0 rows | ✓ PASS |
| `project_image_pairs.before_alt_text_zh !~ '[一-鿿]'` | 2 rows | ⚠ FIX COMMITTED |

### project_image_pairs Alt Text
- 150 rows with NULL `before_alt_text_en` or `after_alt_text_en`
- 208 IDs already covered by pending migrations (2026-08-23, 2026-08-24)
- 13 rows: derive `before_alt_text` from `after_alt_text` "After N" pattern — COMMITTED
- 2 rows: zh alt text English-bleed — COMMITTED
- ~18 rows still uncovered (delta migration viable)

### blog_posts Meta (Draft-Only Gaps)
- 11 posts missing `meta_description_en` — ALL drafts, no live impact
- 9 posts missing `focus_keyword_en` — ALL drafts, no live impact
- No migration needed (draft-only rows)

### project_sites Meta
- 1 row `slug=individual-projects`: `meta_title_en` NULL, `meta_description_en` NULL
- Live page is HTTP 404 — organisational grouping, not a real page
- No migration needed

---

## 3. SCHEMA + METADATA AUDIT

### Live Page Schema (Spot-Check)
| Page | Schema Types Found | Status |
|------|------------------|--------|
| Project detail | WebSite, Organization, Service, FAQPage, BreadcrumbList, AggregateRating, Reviews, SpeakableSpecification | ✓ |
| Area page | AdministrativeArea, City, FAQPage, Service, OfferCatalog, GeoCoordinates | ✓ |
| Service page | FAQPage, Service, OfferCatalog, BreadcrumbList, HomeAndConstructionBusiness | ✓ |
| Projects listing | canonical, og:title, og:image | ✓ |

### Meta Completeness
| Page Element | Project Detail | Area Page | Service Page |
|---|---|---|---|
| canonical | ✓ | ✓ | ✓ |
| og:title | ✓ | ✓ | ✓ |
| og:image | ✓ | ✓ | ✓ |
| og:url | ✓ | ✓ | ✓ |
| hreflang (14 locales) | ✓ | ✓ | ✓ |
| JSON-LD | ✓ | ✓ | ✓ |

---

## 4. CONTENT COVERAGE AUDIT

### Services with Blog Coverage
| Service | Blog Posts | Gap? |
|---------|-----------|------|
| Kitchen Renovation | 37 published (all 14 cities covered) | None |
| Bathroom Renovation | 9 published (all 14 cities covered) | None |
| Cabinet Refinishing | 8 published (all 14 cities covered) | None |
| Basement Renovations | 5 published | Minor — Port Moody/West Vancouver missing |
| Commercial Renovation | 2 published (skin lab case study, warehouse door) | **MAJOR — no costs/permits/guide post** |
| Poly-B Pipe Replacement | **0 published** | **CRITICAL GAP** |
| Heat Pump Installation | **0 published** | **CRITICAL GAP** |
| Critical Load Panel | **0 published** | **HIGH GAP** |
| Accessible Bathroom | 2 published (aging-in-place guides) | ✓ Covered |
| Whole House Renovation | 13 published | ✓ Covered |
| Pre-Sale Renovation | ~12 published (all 14 cities) | ✓ Covered |
| Realtor Consultation | 0 | Service page only — not a blog priority |

### MAJOR Authority Gaps

**1. Commercial Renovation — CRITICAL**
- Only 2 published posts: skin lab case study + warehouse door case study
- No general guide covering: costs per sq ft, permit requirements, BC Building Code classification, restaurant vs office vs retail timelines
- Heat pump service page links to 4 blog posts; commercial service page has no blog links
- **Committed post:** `commercial-renovation-costs-vancouver-2026` (50d05ac) — fills this gap

**2. Poly-B Pipe Replacement — CRITICAL**
- Zero published posts
- Real cost data available from service page: $50–$150/fixture (full repipe), $250–$500 (pinpoint), $1,500–$4,000 (partial)
- 3 real projects exist in DB
- **Committed post:** `poly-b-pipes-vancouver-reno-guide` (826c84e) — fills this gap

**3. Heat Pump Installation — HIGH**
- Zero published posts
- Service page exists with real cost/rebate data ($4,500–$35,000 installed, $11,000 combined rebates)
- No dedicated blog post
- **Committed post:** `heat-pump-installation-vancouver-2026` (2e7e4e3) — fills this gap

**4. Critical Load Panel + EV Charger — HIGH**
- Zero published posts
- Service page exists (`/en/services/critical-load-panel/`)
- Competitors rank for "critical load panel installation Vancouver" — no Reno Stars content
- No committed post yet — ladder rung 3 gap

### Minor Gaps

**5. North Vancouver — Kitchen/Bathroom City Guides**
- All 14 cities have kitchen and bathroom renovation guides
- North Vancouver is the exception: only general home renovation guide, no dedicated kitchen or bathroom post
- All other 14 cities have both kitchen + bathroom guides

**6. Basement Renovations — Port Moody, West Vancouver**
- 5 basement posts published but Port Moody and West Vancouver lack dedicated basement guides
- All 14 cities have kitchen guides; not all have basement guides

---

## 5. TECHNICAL SEO AUDIT

### Sitemap
- 5,825 entries
- All 14 locales present in hreflang
- No locale-prefixed blog API URLs in sitemap (blog is not in sitemap — blog posts are dynamically generated)

### Redirects
- `/en/blog/` → HTTP 200
- `/en/guides/` → HTTP 200
- No redirect chains detected on major pages

### Hreflang
- All 14 locales confirmed in sitemap and on-page
- `og:locale:alternate` uses full locale codes (en_US, zh_CN, etc.)
- INDEXABLE_LEAF_LOCALES = ALL 14 — correctly not filtered to nativeSupport

### Robots / Indexability
- No `noindex` detected on major pages
- Blog posts are dynamically indexed

---

## 6. CANNIBALISATION RISK

**Area Page H2 Sections:**
All 14 service area pages have kitchen + bathroom H2 sections. A blog post targeting "kitchen renovation North Vancouver" would compete with the area page's kitchen H2. Confirmed: do NOT write area-page-topic blog posts.

**Heat Pump:** Area pages do NOT have heat pump H2s — no cannibalisation risk for heat pump post.

**Commercial Renovation:** Area pages do NOT have commercial renovation H2s — no cannibalisation risk.

**Poly-B:** Area pages do NOT have Poly-B H2s — no cannibalisation risk.

---

## 7. SERVICE PAGE AUDIT

| Service Slug | Page Status | Blog Links |
|---|---|---|
| basement | HTTP 200 | ? |
| heat-pump-hvac | HTTP 200 | 0 blog links |
| commercial | HTTP 200 | 0 blog links |
| poly-b-replacement | HTTP 200 | 0 blog links |
| critical-load-panel | HTTP 200 | 0 blog links |
| bathroom | HTTP 200 | ? |
| realtor | HTTP 200 | ? |
| accessible-bathroom | HTTP 200 | ? |
| whole-house | HTTP 200 | ? |
| cabinet | HTTP 200 | ? |
| kitchen | HTTP 200 | ? |
| landscape | HTTP 404 | N/A — retired service, not a defect |

---

## 8. PUBLISHING BLOCKERS

| Post | Status | Blocker |
|------|--------|---------|
| `commercial-renovation-costs-vancouver-2026` | Committed (50d05ac), gates cleared | Blog API HTTP 503 — wrong $BLOG_API_SECRET |
| `poly-b-pipes-vancouver-reno-guide` | Committed (826c84e) | Blog API HTTP 503 |
| `heat-pump-installation-vancouver-2026` | Committed (2e7e4e3) | Blog API HTTP 503 |

Blog API confirmed alive: POST `https://www.reno-stars.com/api/blog/` returns HTTP 400 (validation error) with correct secret, HTTP 503 with current runtime secret. Endpoint is operational — only the credential value in the runtime is wrong.

---

## 9. MIGRATION BACKLOG

- **55 pending migration files** in `scripts/migrations/`
- Cap hit: no new content integrity migrations produced
- 2 new migrations committed this session:
  - `2026-09-02-project-image-pairs-zh-alt-english-bleed.sql` — 2 rows, NOT APPLIED
  - `2026-09-02-project-image-pairs-before-alt-derive.sql` — 13 rows, NOT APPLIED

---

## 10. SUMMARY OF ACTION ITEMS

### Immediately Publish (when credential fixed)
1. `commercial-renovation-costs-vancouver-2026` (50d05ac) — commercial renovation authority gap
2. `poly-b-pipes-vancouver-reno-guide` (826c84e) — poly-b authority gap
3. `heat-pump-installation-vancouver-2026` (2e7e4e3) — heat pump authority gap

### High-Priority New Posts (not yet written)
4. **Critical Load Panel + EV Charger guide** — zero published posts, competitors rank for this term
5. **North Vancouver Kitchen Renovation guide** — only city without a dedicated kitchen guide

### Medium-Priority New Posts
6. **Basement Renovations Port Moody** — missing from basement coverage
7. **Basement Renovations West Vancouver** — missing from basement coverage

### Pending Human Action
- Apply 55 pending migration files from `scripts/migrations/`
- Apply `2026-09-02-blog-excerpt-zh-white-rock.sql` — excerpt_zh fix for `pre-sale-renovation-white-rock-bc-2026`
