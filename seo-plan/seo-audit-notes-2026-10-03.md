# SEO Audit Notes — 2026-10-03

## Aggregate Rating Discrepancy (ORGANIZATION schema)

**File:** `src/app/[locale]/layout.tsx` (or wherever Organization JSON-LD is assembled)

**Finding:** Organization JSON-LD contains hardcoded `aggregateRating.ratingCount: 86` and `reviewCount: 86`.
DB `project_reviews` table has **35 rows**.

**Impact:** Google sees stale aggregate rating count on every page that publishes the Organization schema.

**Fix:** Replace hardcoded `86` with a dynamic count from DB:
```tsx
// Before (hardcoded):
"ratingCount": 86,
"reviewCount": 86,

// After (dynamic — requires DB query or props):
"ratingCount": reviewCountFromDb,
"reviewCount": reviewCountFromDb,
```

**Owner:** Code change needed — not a DB migration.

---

## Project Page WebPage Schema — reviewCount: 0

**URL sampled:** `/en/projects/coquitlam-condo-kitchen-renovation/`

**Finding:** The `WebPage` JSON-LD has:
```json
"aggregateRating": {"@type":"AggregateRating","ratingValue":"5","reviewCount":0}
```

**Impact:** Explicit `reviewCount: 0` on project pages may suppress stars in SERP for individual projects, even when those projects have reviews.

**Fix:** Either remove the `aggregateRating` from `WebPage` schema entirely (since project-specific reviews are already in the page), or populate it with the actual per-project review count.

**Owner:** Code change needed.

---

## Verified OK

- `services.description_zh`: 0 violations
- `services.long_description_zh`: 0 violations
- `services.title_zh`: 0 violations
- `service_areas.description_zh`: 0 violations
- `service_areas.meta_description_zh`: 0 violations
- `service_areas.name_zh`: 0 violations
- `service_areas.content_zh`: 0 violations
- `service_areas.highlights_zh`: 0 violations
- `service_areas.meta_title_zh`: 0 violations
- hreflang: 14 locales correctly present
- og:locale:alternate: 14 locales correctly present
- canonical: correct
- meta description: present and appropriate length
- JSON-LD: Organization + WebPage + BreadcrumbList + Service present

## Pending Human-Applied Migrations

- `2026-10-01-blog-meta-description-en-fix.sql` — covers 4 blog post meta_description_en violations
