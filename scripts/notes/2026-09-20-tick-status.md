# Tick Status 2026-09-20

## Branch
`seo/daily-2026-09-20` — up to date with remote after pull

## This Tick's Actions

### PR / Branch
- `gh` unavailable (tooling gap)
- `no open PRs` (gh unavailable)
- Branch pushed after prior tick commit fc43418d

### Content Integrity (WORK LADDER item 1)
- `services.description_zh` + `long_description_zh`: 0 NULL ✓ (clean)
- `service_areas.description_zh` + `content_zh`: 0 NULL ✓ (clean)
- `services.name_en` column confirmed absent; services uses `name` and localized fields only
- `project_sites.name_en` column confirmed absent; project_sites schema differs from expected

### Schema + Metadata (WORK LADDER item 2)
Checked:
- `/en/projects/toystore-renovation-metrotown-burnaby/`: JSON-LD (Organization + WebSite ✓), og:image ✓, hreflang all 14 locales ✓, canonical ✓, `og:locale:alternate` all 14 locales ✓ (correct — not filtered by nativeSupport)
- `/en/services/kitchen/richmond/`: title ✓, meta description ✓, canonical ✓, hreflang all 14 locales ✓, `og:locale:alternate` all 14 locales ✓ (correct — not filtered by nativeSupport), JSON-LD (Organization + WebSite ✓)

Both live pages fully healthy.

### Blog Posts Published This Tick
- `renovation-hidden-costs-vancouver-2026` — published via POST to `$BLOG_API_URL` (slug idempotent)
- `bathroom-renovation-timeline-vancouver-2026` — published, title patched 89→67 chars to fit 70-char metaTitleEn limit

## Pending Migrations

### NOT APPLIED — needs human
1. `scripts/migrations/2026-09-20-service-areas-meta-description-en-truncate.sql` — 2 rows: richmond (163 chars), west-vancouver (157 chars); hard limit 155; already committed
2. `scripts/migrations/2026-09-20-blog-posts-author-null.sql` — 152 rows; 87 IDs already covered by prior migrations; committed

## Dedup Gap Findings (from prior ticks)
Genuine zero-coverage gaps (no existing blog posts):
- windows / siding: 0 posts
- deck / patio: 0 posts
- poly-b / electrical / panel / heat pump / HVAC: 0 posts
- exterior / outdoor / roof / fence: 0 posts

Already covered (5 posts each): basement, condo, strata/balcony, flooring, cabinet, heritage
