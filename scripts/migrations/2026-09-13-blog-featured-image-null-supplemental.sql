-- Migration: 2026-09-13-blog-featured-image-null-supplemental
-- Table: blog_posts
-- Issue: 2 published posts with NULL featured_image_url missed by prior migration.
--   Supplemental to 2026-09-13-blog-featured-image-null-published which covered 7.
--
-- Status: NOT APPLIED — requires human to run
-- Run: pnpm db:query -f scripts/migrations/2026-09-13-blog-featured-image-null-supplemental.sql

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE id = '094434be-7021-470b-a0c5-13fc680bd92d'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND featured_image_url IS NULL;
