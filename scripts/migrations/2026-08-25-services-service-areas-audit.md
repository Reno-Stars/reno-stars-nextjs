# Content Integrity Audit — 2026-08-25

## Status: CLEAN

No NULL/untranslated rows found in the following tables/columns:

### services (11 rows)
- `title_zh` — 0 NULL
- `description_zh` — 0 NULL
- `long_description_zh` — 0 NULL

Note: `seo_keywords_zh` and `focus_keyword_*` do NOT exist in this table.
Column `name_en` does NOT exist in this table (title_en is the name field).

### service_areas (14 rows)
- `name_zh` — 0 NULL
- `description_zh` — 0 NULL
- `content_zh` — 0 NULL
- `highlights_zh` — 0 NULL
- `meta_title_zh` — 0 NULL
- `meta_description_zh` — 0 NULL

Note: `seo_keywords_zh` does NOT exist in this table.

### project_scopes (321 rows)
- `scope_zh` — 0 NULL

## Skipped / Over Cap
- `excerpt_zh` in blog_posts: 5 pending migration files exist (2026-08-22 ×3, 2026-08-23 ×2). Over the 3-file backlog cap. Not re-audited.
- `focus_keyword_zh` in blog_posts: at/over backlog cap. Not re-audited.
- `seo_keywords_zh` in blog_posts, projects, project_sites: at/over backlog cap. Not re-audited.

## Blog API
- Status: 503 (BLOG_API_SECRET missing from k8s namespace — not a URL issue)
- URL confirmed correct: `https://www.reno-stars.com/api/blog/` (no locale prefix, trailing slash)
- No retry until secret is restored.
