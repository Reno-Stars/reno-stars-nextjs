-- 2026-09-13: blog_posts cleanup - test posts with placeholder "Test ZH" in zh fields
-- NOT APPLIED — needs human to run before insert/unpublish
-- These are test/draft posts with placeholder English strings in localized Chinese fields

UPDATE blog_posts
SET
  title_zh       = NULL,
  excerpt_zh     = NULL,
  content_zh     = NULL,
  meta_title_zh     = NULL,
  meta_description_zh = NULL
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND title_zh = 'Test ZH'  -- idempotent guard
;

UPDATE blog_posts
SET
  title_zh       = NULL,
  excerpt_zh     = NULL,
  content_zh     = NULL,
  meta_title_zh     = NULL,
  meta_description_zh = NULL
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND title_zh = 'Test ZH'  -- idempotent guard
;
