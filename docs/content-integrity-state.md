# Content Integrity Audit State — 2026-09-20

## Audit complete: all non-en locales are clean
The following tables and columns were audited and contain no English-only content
(no CJK chars detected in zh columns, no Roman script in other non-en locales):

| Table | Column | Result |
|-------|---------|--------|
| blog_posts | content_zh | ✅ clean (270 rows) |
| blog_posts | title_zh | ✅ clean |
| blog_posts | excerpt_zh | ✅ clean |
| blog_posts | meta_title_zh | ✅ clean |
| blog_posts | meta_description_zh | ✅ clean |
| blog_posts | focus_keyword_zh | ✅ clean |
| service_areas | name_zh | ✅ clean |
| service_areas | description_zh | ✅ clean |
| service_areas | content_zh | ✅ clean |
| service_areas | highlights_zh | ✅ clean |
| service_areas | meta_description_zh | ✅ clean |
| project_sites | title_zh | ✅ clean |
| project_sites | description_zh | ✅ clean |
| project_sites | excerpt_zh | ✅ clean |
| project_sites | meta_title_zh | ✅ clean |
| project_sites | meta_description_zh | ✅ clean |
| project_sites | duration_zh | ✅ clean |
| project_sites | space_type_zh | ✅ clean |
| project_sites | badge_zh | ✅ clean |
| services | long_description_zh | ✅ clean |
| services | title_zh | ✅ clean |
| services | description_zh | ✅ clean |

## Known truncation issues (pending human apply)
| Table | Column | Rows | Issue | Migration |
|-------|---------|------|-------|-----------|
| service_areas | meta_description_en | 2 | richmond (163 chars), west-vancouver (157 chars) — max 155 | scripts/migrations/ (pending, 2026-09-20 date) |

## Featured image 404s (pending human apply)
`scripts/migrations/2026-09-11-featured-image-404s.sql` — 73 posts with duplicated `/reno-stars` path segment.
NOT covered here (need human): `bathroom-renovation-maple-ridge-2026` (object missing from R2),
`whole-house-renovation-process-steps-vancouver` (points at wrong domain).

## Posts with NULL featured_image_url (needs human assignment)
10 published blog posts have no featured image set:
```
SELECT slug FROM blog_posts WHERE is_published AND (featured_image_url IS NULL OR featured_image_url = '');
```
Assign a real hero_image_url from the projects table or upload a featured image.

## Backlog cap
87 unapplied migrations in scripts/migrations/. Backlog cap is 3 per column.
No new content-integrity migrations should be generated until the backlog drops.

## Last full audit
This file — 2026-09-20. Agent: seo/daily-2026-09-20.
