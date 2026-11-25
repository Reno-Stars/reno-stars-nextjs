/**
 * Migration: Fix remaining Test ZH placeholders on unpublished test post 76e1c252.
 * File: scripts/migrations/2026-09-14-blog-title-zh-placeholders.sql
 * Run: pnpm db:query -f scripts/migrations/2026-09-14-blog-title-zh-placeholders.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Context:
 * - Row 76e1c252 ("Test Rich Formatting 2026") is unpublished — a test post.
 * - 2026-09-07 migration (blog-content-integrity) fixed excerpt_zh and seo_keywords_zh
 *   for this row but left title_zh / meta_title_zh / meta_description_zh / focus_keyword_zh
 *   as the English placeholder "Test ZH".
 * - This migration fills those four fields with proper Traditional Chinese content.
 * - 2026-09-14 DB query confirmed: SELECT id FROM blog_posts WHERE title_zh !~ '[一-鿿]'
 *   returns 2 rows (ae52f455 + 76e1c252). ae52f455 is covered by today's pending
 *   migration 2026-09-14-blog-title-zh-test-placeholder.sql.
 *
 * Idempotent WHERE guards prevent double-apply if run multiple times.
 */

BEGIN;

-- title_zh: translated from title_en "Test Rich Formatting 2026"
UPDATE blog_posts
SET title_zh = '測試富文本格式2026'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND title_zh = 'Test ZH';

-- focus_keyword_zh: derived from focus_keyword_en "test" + semantic meaning
UPDATE blog_posts
SET focus_keyword_zh = '裝修測試'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND focus_keyword_zh = 'Test ZH';

-- meta_title_zh: derived from title_zh
UPDATE blog_posts
SET meta_title_zh = '測試富文本格式2026 | 聚星裝修'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND meta_title_zh = 'Test ZH';

-- meta_description_zh: translated from meta_description_en
--   "Testing rich formatting including tables"
UPDATE blog_posts
SET meta_description_zh = '測試富文本格式，包括表格在內的各類內容元素校驗。'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND meta_description_zh = 'Test ZH';

COMMIT;
