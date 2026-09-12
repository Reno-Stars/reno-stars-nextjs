-- Migration: populate blog_posts.seo_keywords_zh for townhouse-reno-vancouver-2026.
--   pnpm db:query -f scripts/migrations/2026-09-12-townhouse-seo-keywords-zh.sql
--
-- Row is published (is_published=true) but seo_keywords_zh is NULL.
-- NOT covered by 2026-09-03-blog-seo-keywords-zh-remaining.sql — that file
-- predates this post's creation.
--
-- Keywords derived from: title_zh, focus_keyword_zh, focus_keyword_en, title_en.
-- Guard on the column it writes; re-running is a no-op.

UPDATE blog_posts
   SET seo_keywords_zh = '大温联排别墅翻新2026, 联排别墅翻新, 联排别墅装修, 大温共管物业规定, 温哥华联排别墅翻新, 大温装修, 装修许可证'
 WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
   AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
