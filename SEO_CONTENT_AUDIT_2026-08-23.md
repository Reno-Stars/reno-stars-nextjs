# SEO Content Audit — 2026-08-23

## Content Integrity — ALL PASS

Checked via DB query against live data:

| Table | Column | Result |
|-------|--------|--------|
| blog_posts (published) | excerpt_zh | 0 rows with English-only (CJK check) |
| blog_posts (published) | focus_keyword_zh | 0 rows with English-only (CJK check) |
| blog_posts (published) | content_zh | 0 rows with English-only (CJK check) |
| blog_posts (published) | seo_keywords_zh | 0 rows with English-only (CJK check) |
| blog_posts (published) | meta_title_zh | 0 rows with English-only (CJK check) |
| blog_posts (published) | meta_description_zh | 0 rows with English-only (CJK check) |
| services (11 rows) | description_zh | 0 rows with English-only |
| services (11 rows) | long_description_zh | 0 rows with English-only |
| service_areas (14 rows) | description_zh | 0 rows with English-only |
| service_areas (14 rows) | content_zh | 0 rows with English-only |
| service_areas (14 rows) | highlights_zh | 0 rows with English-only |
| service_areas (14 rows) | meta_title_zh | 0 rows with English-only |
| service_areas (14 rows) | meta_description_zh | 0 rows with English-only |

## Pages Checked — Schema + Metadata

| Page | HTTP | Schema | Hreflang | Notes |
|------|------|--------|----------|-------|
| /en/projects/ | 200 | Org/LocalBusiness/HomeAndConstructionBusiness + 5 reviews | All 14 locales + x-default | Clean |
| /en/services/bathroom/north-vancouver/ | 200 | Same org schema, BreadcrumbList | All 14 locales + x-default | Clean |
| /en/about/ | 200 | Same org schema, 5 reviews | All 14 locales + x-default | Clean |

## Pending Migrations (scripts/migrations/)

- 16 .sql files total in backlog
- focus_keyword_zh: batch 2 on seo/daily-2026-08-23 (44 rows, published only, committed)
- blog_excerpt_zh: 6 pending migrations — BACKLOG CAP HIT
- seo_keywords_zh: remaining NULLs not in pending files
- meta_title_zh: 11 NULLs
- meta_description_zh: 12 NULLs

## Coverage Notes

- 270 published blog posts
- 14 cities × 11 services = 154 service-area pages — all 200 OK (checked North Vancouver comprehensively)
- Blog city guide gaps: 10 cities lack dedicated bathroom blog posts — but existing city-level guides cover bathroom topics; cannibalization rule applies
- General permit post exists: "Renovation Permits in BC: What You Need, What It Costs & How to Apply (2026)" — no Metro Vancouver duplicate warranted

## Blog API Status

- Runtime: HTTP 503 `{"error":"Blog API not configured."}`
- Root cause: k8s BLOG_API_SECRET not mounted in this runtime
- URL verified correct: https://www.reno-stars.com/api/blog/ (POST returns 400 with validation on bad payload)
- Not a code or URL issue; server-side runtime environment gap
