-- Migration: 2026-09-25-blog-featured-image-missing-fix.sql
-- Target: blog_posts — 9 published posts with NULL featured_image_url
-- Strategy: use real hero_image_url values from project_sites
-- Source: project_sites.hero_image_url (R2 Cloudflare CDN URLs)
BEGIN;

-- mid-century-rancher-renovation-vancouver-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-media-hero-mmtznddr.jpg',
    updated_at = NOW()
WHERE slug = 'mid-century-rancher-renovation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- adu-renovation-vancouver-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/coquitlam-whole-house-renovation-hero-mmxybk0k.jpg',
    updated_at = NOW()
WHERE slug = 'adu-renovation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- split-level-home-renovation-burnaby-coquitlam-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/burnaby-whole-house-renovation-2-video-thumb.jpg',
    updated_at = NOW()
WHERE slug = 'split-level-home-renovation-burnaby-coquitlam-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- vancouver-infill-development-cost-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-media-hero-mmtznddr.jpg',
    updated_at = NOW()
WHERE slug = 'vancouver-infill-development-cost-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- heritage-home-renovation-vancouver-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmnwwgvj.jpg',
    updated_at = NOW()
WHERE slug = 'heritage-home-renovation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- how-much-does-kitchen-renovation-cost-vancouver-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mn3v6dib65ec88ce-0.jpg',
    updated_at = NOW()
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- vancouver-house-renovation-step-by-step-guide-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmnzt430.jpg',
    updated_at = NOW()
WHERE slug = 'vancouver-house-renovation-step-by-step-guide-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- before-after-renovation-vancouver
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/burnaby-whole-house-renovation-video-thumb.jpg',
    updated_at = NOW()
WHERE slug = 'before-after-renovation-vancouver'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- vancouver-stair-renovation-cost-2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmmpgysd.png',
    updated_at = NOW()
WHERE slug = 'vancouver-stair-renovation-cost-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- Verify
DO $$
BEGIN
    ASSERT (
        SELECT COUNT(*) FROM blog_posts
        WHERE is_published = true AND (featured_image_url IS NULL OR featured_image_url = '')
    ) = 0,
    'NULL featured_image_url rows remain after UPDATE';
END $$;

COMMIT;
