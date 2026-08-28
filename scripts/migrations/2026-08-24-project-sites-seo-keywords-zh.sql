-- 2026-08-24-project-sites-seo-keywords-zh.sql
-- NOT APPLIED — needs human to run against live database
-- Covers project_sites rows with NULL seo_keywords_zh discovered 2026-08-24

UPDATE project_sites
SET seo_keywords_zh = '温哥华玻璃隔断办公室, WFH办公室装修, 居家办公改造, 玻璃隔断, 列治文办公室'
WHERE id = '6d5050fa-48ec-43c4-8187-ecd814dbb947'
AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

UPDATE project_sites
SET seo_keywords_zh = '列治文全屋装修, 三间浴室翻新, 浴室改造, 全屋翻新, 列治文装修'
WHERE id = '0e6748db-5c75-4c6b-91e3-179b84ebe030'
AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
