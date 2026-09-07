-- Migration: scripts/migrations/2026-09-07-blog-featured-image-url.sql
-- Purpose: Populate featured_image_url for 11 published posts that have no hero image
-- NOT APPLIED — needs human to run against live database
-- These are real project hero_image_url values from the database.

BEGIN;

-- 1. heat-pump-installation-vancouver-2026 → Custom Kitchen Renovation with Wood Veins Cabinets (Burnaby)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/5531-rmd-hero-mmwo13gi.jpg'
WHERE slug = 'heat-pump-installation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 2. vancouver-stair-renovation-cost-2026 → Custom Kitchen Renovation (Burnaby)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/5531-rmd-hero-mmwo13gi.jpg'
WHERE slug = 'vancouver-stair-renovation-cost-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 3. vancouver-property-type-renovation-2026 → Custom Whole House Renovation (Vancouver)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 4. vancouver-house-renovation-step-by-step-guide-2026 → Custom Whole House Renovation (Vancouver)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE slug = 'vancouver-house-renovation-step-by-step-guide-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 5. how-to-renovate-house-vancouver-first-timer-guide → Custom Whole House Renovation (Vancouver)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE slug = 'how-to-renovate-house-vancouver-first-timer-guide'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 6. how-much-does-kitchen-renovation-cost-vancouver-2026 → Custom Kitchen Renovation (Burnaby)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/5531-rmd-hero-mmwo13gi.jpg'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 7. mid-century-rancher-renovation-vancouver-2026 → Custom Whole House Renovation (Vancouver)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE slug = 'mid-century-rancher-renovation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 8. split-level-home-renovation-burnaby-coquitlam-2026 → Two Bathroom Renovation (Burnaby)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmv4zlks.jpg'
WHERE slug = 'split-level-home-renovation-burnaby-coquitlam-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 9. vancouver-infill-development-cost-2026 → Custom Whole House Renovation (Vancouver)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE slug = 'vancouver-infill-development-cost-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 10. heritage-home-renovation-vancouver-2026 → Whole House Renovation with Bathroom Updates (Vancouver)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
WHERE slug = 'heritage-home-renovation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 11. adu-renovation-vancouver-2026 → Custom Whole House Renovation (Vancouver)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE slug = 'adu-renovation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

COMMIT;
