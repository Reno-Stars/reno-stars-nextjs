-- Migration: scripts/migrations/2026-09-29-blog-meta-description-zh-from-en.sql
-- Author:   SEO agent (autonomous tick)
-- Date:     2026-09-29
-- Purpose:  Populate missing meta_description_zh in blog_posts from meta_description_en
-- Status:   NOT APPLIED — human must run before it takes effect
-- Scope:    2 blog_posts rows with NULL meta_description_zh
-- Note:     Uses COALESCE so existing translations are never overwritten

UPDATE blog_posts
SET
  meta_description_zh = COALESCE(NULLIF(meta_description_zh, ''), meta_description_en),
  updated_at = NOW()
WHERE
  id IN (
    '247e6fde-08dc-4285-b5c7-bbe236069047',
    '81bb89c2-07d1-4715-8c9f-57f87705831d'
  )
  AND (meta_description_zh IS NULL OR meta_description_zh = '');
