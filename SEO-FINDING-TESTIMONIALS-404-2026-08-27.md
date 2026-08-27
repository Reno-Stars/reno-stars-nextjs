# SEO FINDING: Testimonials Page 404 — No Route Exists

**Date:** 2026-08-27
**Severity:** Low (trust-signal asset missing)
**Status:** NOT FIXABLE by this agent — no route exists in codebase

## Finding

`/en/testimonials/` returns HTTP 404.

- `testimonials` table has 3 rows (all featured, verified, with text_en/text_zh/author names)
- No route found at `/app/[locale]/testimonials/`
- Sitemap does not contain `/en/testimonials/`
- No `app/testimonials` directory exists

## DB State

```sql
-- 3 testimonials, all featured and verified
SELECT id, LEFT(text_en,60), name, location, is_featured, verified
FROM testimonials LIMIT 3;
-- id | left                             | name       | location     | is_featured | verified
-- --- | ---                              | ---        | ---          | ---         | ---
-- 9ac | Reno Stars transformed our...    | Sarah M.   | Vancouver BC | true        | true
-- 133 | Professional team from...        | David L.   | Richmond BC  | true        | true
-- 2ce | Best renovation experience...    | Jennifer K | Burnaby BC   | true        | true
```

## What This Means

- The 3 testimonials exist in the DB but are NOT accessible as a standalone page
- They may be rendered inline on other pages (homepage, projects listing)
- A dedicated testimonials page would provide:
  - Thin-content SEO value (Google rewards trust signal pages)
  - Internal linking surface for project pages
  - Crawlable entry point for review schema

## Action Required

A developer needs to create `/app/[locale]/testimonials/page.tsx` to surface the 3 DB rows as a dedicated page with:
- `LocalBusinessSchema` with the testimonials as `Review` entities
- `FAQPage` schema (common questions about working with Reno Stars)
- Proper hreflang for all 14 locales
- Canonical pointing to `/en/testimonials/`

## Verified

- HTTP 404: `curl -o /dev/null -w "%{http_code}" https://www.reno-stars.com/en/testimonials/` → `404`
- Sitemap: `grep testimonials /workspace/reno-stars.com/public/sitemap.xml` → no entries
- Route check: `find /workspace/reno-stars.com/app -name '*testimonial*'` → no results
