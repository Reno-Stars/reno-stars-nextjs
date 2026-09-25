-- Migration: 2026-09-25-blog-featured-image-null-fix.sql
-- Fix 10 blog_posts rows with NULL featured_image_url.
-- Idempotent UPDATE with WHERE slug guard; only fires when NULL.
-- NOT APPLIED — needs human to run against the live database.
--
-- Image sources: verified project hero_image_url rows from the projects table
-- (same R2/cloudflare domain used by the live site for all project images).
-- These are the canonical URLs the application already uses for project pages.

-- Mapping rationale:
-- mid-century-rancher         → vancouver-whole-house-renovation-bathroom-updates  (general Vancouver whole-house)
-- adu-renovation             → vancouver-whole-house-renovation-bathroom-updates  (ADU/general Vancouver reno)
-- split-level-home          → coquitlam-condo-kitchen-renovation                  (Burnaby/Coquitlam area)
-- vancouver-infill          → vancouver-whole-house-renovation-bathroom-updates  (infill/whole-house Vancouver)
-- heritage-home-renovation  → vancouver-whole-house-renovation-bathroom-updates  (heritage Vancouver)
-- kitchen-renovation-cost   → custom-kitchen-renovation-black-fixtures-burnaby   (kitchen cost post)
-- vancouver-stair-renovation → vancouver-whole-house-renovation-bathroom-updates (general Vancouver reno)
-- how-to-renovate-house      → vancouver-whole-house-renovation-bathroom-updates  (general how-to guide)
-- vancouver-property-type   → coquitlam-condo-kitchen-renovation               (property type comparison)
-- vancouver-house-renovation-step-by-step → vancouver-whole-house-renovation-bathroom-updates (general guide)

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'mid-century-rancher-renovation-vancouver-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'adu-renovation-vancouver-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/coquitlam-condo-kitchen-renovation-p01-after-v1.jpg',
    updated_at = NOW()
WHERE slug = 'split-level-home-renovation-burnaby-coquitlam-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'vancouver-infill-development-cost-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'heritage-home-renovation-vancouver-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/5531-rmd-hero-mmwo13gi.jpg',
    updated_at = NOW()
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'vancouver-stair-renovation-cost-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'how-to-renovate-house-vancouver-first-timer-guide'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/coquitlam-condo-kitchen-renovation-p01-after-v1.jpg',
    updated_at = NOW()
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg',
    updated_at = NOW()
WHERE slug = 'vancouver-house-renovation-step-by-step-guide-2026'
  AND featured_image_url IS NULL;
