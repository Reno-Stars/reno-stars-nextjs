-- Migration: scripts/migrations/2026-09-15-blog-seo-keywords-townhouse.sql
-- Target:  blog_posts.id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
--           slug: townhouse-reno-vancouver-2026
-- Issue:    seo_keywords_en AND seo_keywords_zh are NULL for this published blog post
-- Status:   NOT APPLIED — needs human to run against live DB
--
-- Run: psql $DATABASE_URL -f scripts/migrations/2026-09-15-blog-seo-keywords-townhouse.sql

UPDATE blog_posts
SET
  seo_keywords_en = 'townhouse renovation vancouver, strata renovation rules bc, vancouver townhouse permit, metro vancouver townhouse renovation, townhouse renovation cost 2026, strata approval process bc',
  seo_keywords_zh = '溫哥華城市屋裝修, BC分層裝修規定, 溫哥華城市屋裝修許可, 大溫哥華城市屋翻新, 城市屋裝修費用2026'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '')
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
