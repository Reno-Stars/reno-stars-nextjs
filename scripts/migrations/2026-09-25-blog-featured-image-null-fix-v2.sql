-- Migration: 2026-09-25-blog-featured-image-null-fix-v2.sql
-- Fix 8 blog_posts rows with NULL featured_image_url.
-- Idempotent UPDATE with WHERE slug guard; only fires when NULL.
-- NOT APPLIED — needs human to run against the live database.
--
-- Image sources: verified project hero_image_url rows from the projects table
-- (same R2/cloudflare domain used by the live site for all project images).

-- mid-century-rancher → general Vancouver whole-house hero
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'mid-century-rancher-renovation-vancouver-2026'
  AND featured_image_url IS NULL;

-- adu-renovation → general Vancouver whole-house hero
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'adu-renovation-vancouver-2026'
  AND featured_image_url IS NULL;

-- split-level-home → Coquitlam condo kitchen (Burnaby/Coquitlam area)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/coquitlam-condo-kitchen-renovation-p01-after-v1.jpg',
    updated_at = NOW()
WHERE slug = 'split-level-home-renovation-burnaby-coquitlam-2026'
  AND featured_image_url IS NULL;

-- vancouver-infill → general Vancouver whole-house hero
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'vancouver-infill-development-cost-2026'
  AND featured_image_url IS NULL;

-- heritage-home-renovation → general Vancouver whole-house hero
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'heritage-home-renovation-vancouver-2026'
  AND featured_image_url IS NULL;

-- how-much-does-kitchen-renovation-cost → kitchen hero image
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/5531-rmd-hero-mmwo13gi.jpg',
    updated_at = NOW()
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND featured_image_url IS NULL;

-- vancouver-stair-renovation → general Vancouver whole-house hero
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'vancouver-stair-renovation-cost-2026'
  AND featured_image_url IS NULL;

-- vancouver-house-renovation-step-by-step-guide → general Vancouver whole-house hero
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'vancouver-house-renovation-step-by-step-guide-2026'
  AND featured_image_url IS NULL;
