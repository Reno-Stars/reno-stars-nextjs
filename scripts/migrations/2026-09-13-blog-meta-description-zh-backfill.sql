-- Migration: 2026-09-13-blog-meta-description-zh-backfill
-- Table: blog_posts
-- Issue: meta_description_zh and meta_description_en are NULL for slug 'outdoor-test-mtonly'
-- Status: NOT APPLIED — requires human to run
-- Blog post is draft (is_published=false), excerpt_zh exists and is complete.
-- meta_description_zh is used for the Chinese SERP snippet and social sharing.
UPDATE blog_posts
SET
  meta_description_zh = excerpt_zh,
  meta_description_en = excerpt_en
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND meta_description_zh IS NULL;
