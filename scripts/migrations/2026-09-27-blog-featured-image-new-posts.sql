-- Migration: backfill featured_image_url for 2 new posts missing images (2026-09-27 tick)
-- Status: STOP condition (featured_image_url NULL on 2 new posts)
BEGIN;

-- mold-remediation-cost-vancouver-2026
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
WHERE slug = 'mold-remediation-cost-vancouver-2026' AND (featured_image_url IS NULL OR featured_image_url = '');

-- bathroom-renovation-cost-burnaby
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
WHERE slug = 'bathroom-renovation-cost-burnaby' AND (featured_image_url IS NULL OR featured_image_url = '');

COMMIT;
