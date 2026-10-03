-- Migration: NOT APPLIED — needs human to run
-- Table: blog_posts
-- Issue: 2 test rows have non-Chinese text in content_zh (English placeholder content)
-- Fix: clear content_zh to NULL so the field is genuinely empty rather than misleading
UPDATE blog_posts
SET content_zh = NULL
WHERE id IN (
  '5f0fb183-c4c8-410b-a8c3-9c1093d14142',
  '835af76e-2175-4e38-b7af-b31c51cbc0ba'
)
AND content_zh IS NOT NULL
AND content_zh !~ '[一-鿿]';
