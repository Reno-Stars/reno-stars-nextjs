-- Migration: 2026-09-25-blog-featured-image-before-after-vancouver.sql
-- Fix 1 blog_posts row with NULL featured_image_url.
-- Idempotent UPDATE with WHERE slug guard; only fires when NULL.
-- NOT APPLIED — needs human to run against the live database.
--
-- before-after-renovation-vancouver: showcase post with multiple project photos
-- Uses the Vancouver whole-house hero image (general Vancouver reno imagery).
-- The actual post shows multiple before/after project photos so the hero
-- image is decorative/categorical rather than project-specific.

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'before-after-renovation-vancouver'
  AND featured_image_url IS NULL;
