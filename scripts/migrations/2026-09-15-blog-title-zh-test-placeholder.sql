-- 2026-09-15: blog_posts title_zh placeholder fix for 2 unpublished test posts
-- NOT APPLIED — needs human to run before these posts are ever published.
--
-- These posts have English-only placeholder "Test ZH" in title_zh.
-- Real Chinese titles derived from title_en:
--   ae52f455: "Test Post Full Validation" -> derive from content context
--   76e1c252: "Test Rich Formatting 2026" -> derive from content context
-- Both posts have real Chinese excerpt_zh and content_zh per prior migration 2026-09-07.
-- This migration only fills title_zh to enable eventual publish.
--
-- Also fixes outdoor-test-mtonly (247e6fde) meta_description_zh which remains NULL
-- even after focus_keyword_zh backfill (2026-09-13 migration covered focus_keyword only).

BEGIN;

-- ae52f455: townhouse-renovation-strata-rules-vancouver-2026
-- title_zh placeholder "Test ZH" -> real Chinese title
-- title_en context: Townhouse renovation strata rules Vancouver 2026
UPDATE blog_posts
SET title_zh = '温哥华联排别墅装修物业条例完全指南 2026'
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND title_zh = 'Test ZH';

-- 76e1c252: test-rich-formatting-2026
-- title_zh placeholder "Test ZH" -> real Chinese title
-- title_en context: Test Rich Formatting 2026
UPDATE blog_posts
SET title_zh = '2026年装修富文本格式测试指南'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND title_zh = 'Test ZH';

-- 247e6fde: outdoor-test-mtonly
-- meta_description_zh is NULL even after 2026-09-13 focus_keyword_zh backfill.
-- title_zh is already real Chinese (温哥华户外空间装修完整指南...).
-- meta_description_zh: derived from title_zh subject matter.
UPDATE blog_posts
SET meta_description_zh = '温哥华户外空间装修完整指南：甲板、露台、后院改造费用及大温哥华2026年许可申请要求。'
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND meta_description_zh IS NULL;

COMMIT;
