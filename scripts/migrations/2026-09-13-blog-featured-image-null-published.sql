-- Migration: 2026-09-13-blog-featured-image-null-published
-- Table: blog_posts
-- Issue: 8 published posts have NULL featured_image_url — broken social cards.
--   Source of truth for working image: vancouver-home-renovation-guide-2026
--   (same city-guide post type, same R2 image confirmed 200).
--
-- NOT covered here (already addressed by 2026-09-11-featured-image-404s):
--   how-much-does-kitchen-renovation-cost-vancouver-2026
--   vancouver-property-type-renovation-2026
--
-- Status: NOT APPLIED — requires human to run
-- Run: pnpm db:query -f scripts/migrations/2026-09-13-blog-featured-image-null-published.sql

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE id = 'e6257f9d-a6fe-43ce-b06f-3a7b4304877b'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE id = '4915068e-8851-46f7-bfdf-628a4603d3fe'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE id = '48e499c1-38a7-4d00-bf54-b1cdd4568506'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE id = 'ebafaebf-3060-4dea-8dc3-508be25d95d6'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE id = '17e69f50-74b9-469e-8b87-11d3a4ed74ef'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE id = 'a16ecf67-c4d4-4343-99a9-c982798e64c1'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE id = '2311bd71-d249-4143-8d7f-6dfb439c413c'
  AND featured_image_url IS NULL;
