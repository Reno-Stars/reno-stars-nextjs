-- Migration: 2026-09-25-blog-featured-image-url-backfill
-- Target: 8 blog_posts published with NULL featured_image_url
-- Issue: featured_image_url NULL count = 8 >= 3 (backlog cap triggered STOP)
-- Fix: Assign thematic hero images from existing R2 admin uploads (already validated,
--       already used on other published posts -- safe, proven URLs).
-- WHERE guards ensure idempotency.

UPDATE blog_posts
SET
  featured_image_url = CASE slug
    WHEN 'mid-century-rancher-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    WHEN 'adu-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    WHEN 'split-level-home-renovation-burnaby-coquitlam-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/delta-kitchen-renovation-apron-sink-quartz-p01-after-v1.jpg'
    WHEN 'vancouver-infill-development-cost-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    WHEN 'heritage-home-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/richmond-whole-home-renovation-marble-kitchen-p01-after-v1.jpg'
    WHEN 'how-much-does-kitchen-renovation-cost-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/delta-kitchen-renovation-apron-sink-quartz-p01-after-v1.jpg'
    WHEN 'vancouver-stair-renovation-cost-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmv4zlks.jpg'
    WHEN 'vancouver-house-renovation-step-by-step-guide-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmv4zlks.jpg'
    ELSE featured_image_url
  END,
  updated_at = NOW()
WHERE
  is_published
  AND slug IN (
    'mid-century-rancher-renovation-vancouver-2026',
    'adu-renovation-vancouver-2026',
    'split-level-home-renovation-burnaby-coquitlam-2026',
    'vancouver-infill-development-cost-2026',
    'heritage-home-renovation-vancouver-2026',
    'how-much-does-kitchen-renovation-cost-vancouver-2026',
    'vancouver-stair-renovation-cost-2026',
    'vancouver-house-renovation-step-by-step-guide-2026'
  )
  AND featured_image_url IS NULL;
