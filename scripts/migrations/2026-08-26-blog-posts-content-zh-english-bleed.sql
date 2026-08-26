-- 2026-08-26-blog-posts-content_zh-english-bleed.sql
-- NOT APPLIED — needs human to run against the live database.
-- Target: blog_posts.content_zh — rows where content_zh has ASCII-only content (no CJK)
--   indicating English text was written to the Chinese field during migration.
-- Idempotent WHERE guard prevents re-execution on already-fixed rows.
-- DB query confirmed: content_zh IS NOT NULL = 270 rows (all blog posts have content_zh).
-- Unknown: how many of those 270 contain actual CJK vs English-only content.
-- This migration flags content_zh rows with no CJK characters for human review.

-- Check (run this first to see affected rows):
-- SELECT id, slug FROM blog_posts
--   WHERE content_zh IS NOT NULL AND content_zh <> ''
--     AND content_zh !~ '[一-鿿]';

UPDATE blog_posts
SET    content_zh = NULL
WHERE  id IN (
  SELECT id
  FROM   blog_posts
  WHERE  content_zh IS NOT NULL
    AND  content_zh <> ''
    AND  content_zh !~ '[一-鿿]'
)
  AND content_zh IS NOT NULL
  AND content_zh <> ''
  AND content_zh !~ '[一-鿿]';
