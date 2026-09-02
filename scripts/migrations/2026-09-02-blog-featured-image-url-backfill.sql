-- Migration: 2026-09-02-blog-featured-image-url-backfill.sql
-- Target: 6 published blog_posts with NULL featured_image_url
-- All other SEO fields (focus_keyword, meta_description, excerpt) are populated.
-- Uses hero_image_url from project_sites as fallback (same CDN: pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev)
-- NOT APPLIED — needs human to review and run.
-- Idempotent: UPDATE if featured_image_url is still NULL.

-- 1. mid-century-rancher-renovation-vancouver-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmnwwgvj.jpg'
WHERE slug = 'mid-century-rancher-renovation-vancouver-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- 2. heritage-home-renovation-vancouver-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmnzt430.jpg'
WHERE slug = 'heritage-home-renovation-vancouver-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- 3. adu-renovation-vancouver-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mn3v6dib65ec88ce-0.jpg'
WHERE slug = 'adu-renovation-vancouver-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- 4. vancouver-infill-development-cost-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmtkud18.jpg'
WHERE slug = 'vancouver-infill-development-cost-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- 5. split-level-home-renovation-burnaby-coquitlam-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/coquitlam-whole-house-renovation-hero-mmxybk0k.jpg'
WHERE slug = 'split-level-home-renovation-burnaby-coquitlam-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- 6. how-much-does-kitchen-renovation-cost-vancouver-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmnwwgvj.jpg'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND is_published = true
  AND featured_image_url IS NULL;
