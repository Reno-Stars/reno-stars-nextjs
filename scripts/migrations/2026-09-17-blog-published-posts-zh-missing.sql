-- Migration: populate blog_posts seo_keywords_zh and meta_description_zh for two published posts
-- found by content integrity scan 2026-09-17.
--
-- NOT APPLIED — needs human to run before publish or PR merge.
-- Run: pnpm db:query -f scripts/migrations/2026-09-17-blog-published-posts-zh-missing.sql
--
-- Both posts are is_published=true and are currently LIVE with missing zh SEO metadata.
-- Each UPDATE is guarded on its target column being NULL so re-running is a no-op.
-- townhouse-reno-vancouver-2026: seo_keywords_zh was listed in the 2026-09-03 batch
--   (2026-09-03-blog-seo-keywords-zh-remaining.sql) but that batch was never applied.
-- outdoor-test-mtonly: meta_description_zh was never set; meta_description_en is also NULL.

BEGIN;

-- ==============================================================================
-- 1. townhouse-reno-vancouver-2026  (e50092a6-59f9-45a1-8ad3-4db06f6048ba)
-- title_zh: 大温联排别墅翻新共管物业规定2026
-- focus_keyword_zh: 联排别墅翻新
-- excerpt_zh: 大温联排别墅翻新需要了解物业批准和城市许可证。本指南涵盖可以更改和不能更改的内容。
-- seo_keywords_zh derived from title_zh + focus_keyword_zh + city/service lexicon.
-- ==============================================================================
UPDATE blog_posts
SET seo_keywords_zh = '大温联排别墅翻新, 联排别墅翻新, 联排别墅装修, 大温装修, 共管物业规定, 装修许可证, 温哥华装修, 装修费用'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND seo_keywords_zh IS NULL;

-- ==============================================================================
-- 2. outdoor-test-mtonly  (247e6fde-08dc-4285-b5c7-bbe236069047)
-- title_zh: 温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
-- excerpt_zh: 温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。
-- meta_description_en: NULL (also missing — derive from excerpt_en)
-- meta_description_zh: NULL (derive from excerpt_zh)
-- ==============================================================================
UPDATE blog_posts
SET meta_description_en = 'Vancouver homeowners are transforming backyards into year-round living spaces with decks, patios, and covered outdoor areas. This guide covers 2026 costs and permit requirements across Metro Vancouver cities.'
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND meta_description_en IS NULL;

UPDATE blog_posts
SET meta_description_zh = '温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。'
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND meta_description_zh IS NULL;

COMMIT;
