-- Migration: NOT APPLIED — needs human to run
-- 2026-09-20 blog_posts.seo_keywords fill for townhouse-reno-vancouver-2026
-- Source: DB query — 1 published post has NULL seo_keywords_en and seo_keywords_zh
-- id: slug = 'townhouse-reno-vancouver-2026'
-- Derived from post title + topic: "Townhouse Renovation in Metro Vancouver Strata Rules and Permits 2026"
-- idempotent WHERE guard ensures no double-write

BEGIN;

UPDATE blog_posts
SET
  seo_keywords_en = 'townhouse renovation Vancouver, strata renovation rules, townhouse renovation permit Vancouver, Metro Vancouver townhouse renovation, strata approval renovation Vancouver',
  seo_keywords_zh = '温哥华镇屋装修, 温哥华镇屋装修规定, 镇屋装修许可, Metro Vancouver镇屋装修, 分层审批装修'
WHERE is_published = true
  AND slug = 'townhouse-reno-vancouver-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

COMMIT;
