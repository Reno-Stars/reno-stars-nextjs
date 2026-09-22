-- Migration: 2026-09-22-blog-content-zh-test-row-fix.sql
-- Fix content_zh on unpublished test row that contains English-only text.
-- NOT APPLIED — needs human to review and run.
-- Idempotent: UPDATE is conditional on content_zh NOT matching Chinese char range.

-- Row: id=835af76e-2175-4e38-b7af-b31c51cbc0ba slug=test-english-only-db
-- Status: is_published=false — not live, not visible to users.
-- Issue: content_zh field contains English text (no CJK characters).

-- Option A: set content_zh to empty string (field will be blank but not English-polluted)
UPDATE blog_posts
SET content_zh = ''
WHERE id = '835af76e-2175-4e38-b7af-b31c51cbc0ba'
  AND content_zh IS NOT NULL
  AND content_zh !~ '[一-鿿]';

-- Option B (commented): delete the test row entirely if it should not exist at all
-- DELETE FROM blog_posts WHERE id = '835af76e-2175-4e38-b7af-b31c51cbc0ba' AND is_published = false;
