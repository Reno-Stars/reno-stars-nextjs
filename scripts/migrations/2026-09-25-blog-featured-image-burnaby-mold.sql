-- Migration: 2026-09-25-blog-featured-image-burnaby-mold.sql
-- Fix featured_image_url NULL for 2 published blog_posts not covered by prior backfill.
--
-- bathroom-renovation-cost-burnaby:
--   Topic-matched to burnaby-whole-house-renovation hero image (Burnaby whole-house context).
--   burnaby-whole-house-renovation hero:
--   https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmv4zlkh.jpg
--
-- mold-remediation-cost-vancouver-2026:
--   No mold-specific project exists. Uses hero from burnaby split-level project
--   (split-level-home-renovation-burnaby-coquitlam-2026) which is close context.
--   https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/coquitlam-kitchen-renovation-quartz-island-p01-after-v1.jpg
--
-- Idempotent UPDATE with WHERE slug guard; only fires when NULL.
-- NOT APPLIED — needs human to run against the live database.

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmv4zlkh.jpg',
    updated_at = NOW()
WHERE slug = 'bathroom-renovation-cost-burnaby'
  AND is_published = true
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/coquitlam-kitchen-renovation-quartz-island-p01-after-v1.jpg',
    updated_at = NOW()
WHERE slug = 'mold-remediation-cost-vancouver-2026'
  AND is_published = true
  AND (featured_image_url IS NULL OR featured_image_url = '');
