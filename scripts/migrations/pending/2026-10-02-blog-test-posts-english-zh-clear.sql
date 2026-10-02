-- Clear English-only zh fields from two unpublished test blog posts.
-- These posts contain no Chinese content; their _zh fields are placeholder English text.
-- NOT APPLIED — needs human to run.
-- 2026-10-02

UPDATE blog_posts SET
  content_zh       = NULL,
  excerpt_zh       = NULL,
  focus_keyword_zh = NULL,
  meta_description_zh = NULL,
  meta_title_zh    = NULL
WHERE id IN ('5f0fb183-c4c8-410b-a8c3-9c1093d14142', '835af76e-2175-4e38-b7af-b31c51cbc0ba')
  AND is_published = false
  -- Idempotent guard: only apply if all target fields still contain English
  AND (content_zh IS NOT NULL AND content_zh !~ '[一-鿿]');
