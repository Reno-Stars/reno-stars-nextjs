/**
 * Migration: Fix placeholder zh fields for test-rich-formatting-2026.
 * Run: pnpm db:query -f scripts/migrations/2026-09-10-blog-test-post-zh-placeholder-fix.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Issue: blog post 'test-rich-formatting-2026' (id: 76e1c252) has:
 *   - title_zh = "Test ZH" (placeholder, should be Chinese)
 *   - focus_keyword_zh = "test" (English in zh field)
 * Post is not published but these fields should still hold real Chinese content.
 * title_zh derived from slug + content_zh body; focus_keyword_zh from topic.
 */

BEGIN;

-- Fix title_zh: "Test Rich Formatting 2026" → Chinese equivalent
-- slug: test-rich-formatting-2026; content_zh: "<p>测试中文内容确保超过150个单词的最低发布要求。</p>"
UPDATE blog_posts
SET title_zh = '测试富文本格式与中文内容验证 2026'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND title_zh = 'Test ZH';

-- Fix focus_keyword_zh: "test" (English) → Chinese
UPDATE blog_posts
SET focus_keyword_zh = '富文本格式测试'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND focus_keyword_zh = 'test';

COMMIT;
