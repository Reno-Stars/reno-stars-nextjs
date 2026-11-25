-- Migration: 2026-09-30-blog-seo-keywords-zh-townhouse-reno.sql
-- Table: blog_posts
-- Column: seo_keywords_zh
-- Condition: is_published = true AND id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '')
-- Status: NOT APPLIED — human run needed
UPDATE blog_posts
SET
  seo_keywords_zh = '联排别墅翻新, 大温哥华共管物业, 物业批准流程, 城市许可证, 物业翻新规定, BC省建筑规范, 温哥华翻新'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND is_published = true
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
