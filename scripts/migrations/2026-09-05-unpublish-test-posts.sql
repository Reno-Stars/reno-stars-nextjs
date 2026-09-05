-- Migration: NOT APPLIED — needs human to run
--   pnpm db:query -f scripts/migrations/2026-09-05-unpublish-test-posts.sql
--
-- Unpublishes two published test posts whose title_zh was set to placeholder "Test ZH".
-- These are validation/test entries that should not be live on the production blog.
-- They still have placeholder title_zh despite the separate fix-metadata migration
-- because the title_zh placeholders should not exist on a published post.
--
-- Target rows:
--   ae52f455-64eb-40fb-8f4a-7488902c53c3 — townhouse-renovation-strata-rules-vancouver-2026
--   76e1c252-b1ed-4268-89c5-20958dbb7cbd — test-rich-formatting-2026
--
-- Status: NOT APPLIED — needs human to run against production DB

BEGIN;

UPDATE blog_posts
SET is_published = false
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND is_published = true;

UPDATE blog_posts
SET is_published = false
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND is_published = true;

COMMIT;
