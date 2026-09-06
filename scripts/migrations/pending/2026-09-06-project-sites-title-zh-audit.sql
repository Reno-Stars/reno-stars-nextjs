-- 2026-09-06-project-sites-title-zh-audit.sql
-- Audit: project_sites rows where title_zh is NULL or empty
-- NOT APPLIED — needs human to run against live DB
-- Scope: 17 project_sites rows, fields title_zh description_zh excerpt_zh meta_title_zh meta_description_zh focus_keyword_zh seo_keywords_zh duration_zh space_type_zh

SELECT id, title_en, title_zh,
       description_en, description_zh,
       excerpt_en, excerpt_zh,
       meta_title_en, meta_title_zh,
       meta_description_en, meta_description_zh,
       focus_keyword_en, focus_keyword_zh,
       seo_keywords_en, seo_keywords_zh,
       duration_en, duration_zh,
       space_type_en, space_type_zh
FROM project_sites
WHERE title_zh IS NULL OR title_zh = '';
