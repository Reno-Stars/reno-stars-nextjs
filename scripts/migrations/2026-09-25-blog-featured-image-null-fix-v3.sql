-- Migration: 2026-09-25-blog-featured-image-null-fix.sql
-- Target: 8 blog_posts with NULL featured_image_url (STOP condition)
-- Images assigned from existing R2 admin uploads, already validated on other published posts.
-- Run: pnpm db:query -f scripts/migrations/2026-09-25-blog-featured-image-null-fix.sql
UPDATE blog_posts
SET featured_image_url =
  CASE slug
    WHEN 'mid-century-rancher-renovation-vancouver-2026'
      THEN 'https://images.reno-stars.com/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    WHEN 'adu-renovation-vancouver-2026'
      THEN 'https://images.reno-stars.com/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    WHEN 'split-level-home-renovation-burnaby-coquitlam-2026'
      THEN 'https://images.reno-stars.com/delta-kitchen-renovation-apron-sink-quartz-p01-after-v1.jpg'
    WHEN 'vancouver-infill-development-cost-2026'
      THEN 'https://images.reno-stars.com/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    WHEN 'heritage-home-renovation-vancouver-2026'
      THEN 'https://images.reno-stars.com/richmond-whole-home-renovation-marble-kitchen-p01-after-v1.jpg'
    WHEN 'how-much-does-kitchen-renovation-cost-vancouver-2026'
      THEN 'https://images.reno-stars.com/delta-kitchen-renovation-apron-sink-quartz-p01-after-v1.jpg'
    WHEN 'vancouver-stair-renovation-cost-2026'
      THEN 'https://images.reno-stars.com/social-ready-hero-mmv4zlks.jpg'
    WHEN 'vancouver-house-renovation-step-by-step-guide-2026'
      THEN 'https://images.reno-stars.com/social-ready-hero-mmv4zlks.jpg'
  END
WHERE slug IN (
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
