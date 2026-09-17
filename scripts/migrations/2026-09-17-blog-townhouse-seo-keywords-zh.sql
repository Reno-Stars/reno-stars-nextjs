-- Migration: Populate seo_keywords_zh for townhouse-reno-vancouver-2026
-- NOT APPLIED — needs human review and execution
-- Idempotent WHERE guard ensures no double-apply if run more than once
-- Related zh migration 2026-09-17-blog-townhouse-reno-vancouver-2026-zh.sql
-- already populated title_zh, excerpt_zh, content_zh, meta_title_zh,
-- meta_description_zh, focus_keyword_zh — only seo_keywords_zh remains NULL
UPDATE blog_posts SET
  seo_keywords_zh = '联排别墅翻新,大温联排别墅翻新,共管物业规定,BC省共管物业,联排别墅装修分契批准,城市屋许可证,温哥华联排别墅翻新'
WHERE slug = 'townhouse-reno-vancouver-2026'
AND seo_keywords_zh IS NULL;
