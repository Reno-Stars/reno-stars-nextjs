# SEO Technical Findings — project_sites Content Integrity Gap
**Date:** 2026-08-27
**Branch:** seo/daily-2026-08-27
**Status:** Confirmed — requires content migration

## Finding

Table `project_sites` row with slug `individual-projects` has null English content fields:

| Column | Value |
|--------|-------|
| title_en | **NULL** |
| description_en | **NULL** ("Container for standalone renovation projects.") — only English in this field |
| excerpt_en | **NULL** |
| meta_description_en | **NULL** |
| meta_title_en | **NULL** |
| focus_keyword_en | **NULL** |
| seo_keywords_en | **NULL** |

Corresponding Chinese fields are populated:
- `title_zh`: "独立项目"
- `description_zh`: "独立装修项目的容器。"
- `excerpt_zh`: "浏览聚星装修在大温哥华地区完成的独立装修项目案例。"
- `meta_title_zh`: "独立项目 | 聚星装修"
- `meta_description_zh`: "查看聚星装修在大温哥华地区完成的独立装修项目案例..."
- `focus_keyword_zh`: "温哥华独立装修项目"

## Context

`project_sites` is distinct from `projects`. The `projects` table has 58 rows with full hero images. `project_sites` appears to be a content-structure table (17 rows total, per inventory). The `individual-projects` slug is a container/bucket page.

The English nulls here mean the English version of this page has no title, no meta description, no content — a thin/empty page for English visitors.

## Action Required

Content team to provide:
- English title for the "Individual Projects" page
- English meta title and meta description
- English page excerpt
- English description copy

Migration to be written to `scripts/migrations/2026-08-27-project-sites-individual-projects-en.sql` — NOT APPLIED, needs human to run.

## Schema (project_sites columns)

id, slug, title_en, title_zh, description_en, description_zh, location_city, hero_image_url, badge_en, badge_zh, show_as_project, featured, is_published, created_at, updated_at, published_at, excerpt_en, excerpt_zh, meta_title_en, meta_title_zh, meta_description_en, meta_description_zh, focus_keyword_en, focus_keyword_zh, seo_keywords_en, seo_keywords_zh, po_number, budget_range, duration_en, duration_zh, space_type_en, space_type_zh, hero_video_url, localizations, dynamic_blocks
