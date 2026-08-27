# SEO Technical Findings — 2026-08-27

## 1. Sitemap / URL Disagreement — Two Issues

### A: `/en/services/kitchen-renovation/` — 404 but in sitemap
- **Sitemap URL:** `https://www.reno-stars.com/en/services/kitchen-renovation/`
- **Live HTTP:** `404 Not Found`
- **Actual page:** `/en/services/kitchen/` (HTTP 200, JSON-LD ✓, no noindex)
- **Action needed:** Remove `/kitchen-renovation/` from sitemap.xml, or add a redirect to `/kitchen/`

### B: `/en/services/wholehouse/` — 404 but in sitemap
- **Sitemap URL:** `https://www.reno-stars.com/en/services/wholehouse/` (no hyphen)
- **Live HTTP:** `404 Not Found`
- **Actual page:** `/en/services/whole-house/` (HTTP 200, no noindex ✓)
- **Root cause:** Slug in sitemap uses `wholehouse` instead of `whole-house`
- **Action needed:** Fix sitemap entry from `wholehouse` → `whole-house`

## 2. Services Table Schema (confirmed)
Real columns: `id, slug, title_en, title_zh, description_en, description_zh, long_description_en, long_description_zh, icon_name, image_url, display_order, created_at, updated_at, icon_url, show_on_services_page, is_project_type, localizations, dynamic_blocks`
Note: no `focus_keyword_en` column — does not exist in this table.

## 3. Heat Pump Service Page
- `/en/services/heat-pump-hvac/` — HTTP 200, no noindex ✓
- `/en/services/heat-pump-hvac/vancouver/` — HTTP 200 ✓

## 4. Critical Load Panel Service Page
- `/en/services/critical-load-panel/` — HTTP 200, no noindex ✓
- `/en/services/critical-load-panel/vancouver/` — HTTP 200 ✓

## 5. Electrical Panel / Wiring — No Service Page
- No electrical service page exists at `/en/services/electrical/` or similar
- No blog post on electrical panel exists (DEDUP: 0 results for "electrical" query)
- No projects with `service_type ILIKE '%electrical%'` in DB
