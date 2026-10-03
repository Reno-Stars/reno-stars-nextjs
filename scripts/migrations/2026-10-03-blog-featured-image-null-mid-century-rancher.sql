-- 2026-10-03-blog-featured-image-null-mid-century-rancher.sql
-- Fixes NULL featured_image_url for published post:
--   id: e6257f9d-a6fe-43ce-b06f-3a7b4304877b
--   slug: mid-century-rancher-renovation-vancouver-2026
--   title: Mid-Century Rancher Renovation Vancouver — 2026 Cost & Character Guide
--
-- This is NOT YET APPLIED to the database. Human must run this file.
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
WHERE id = 'e6257f9d-a6fe-43ce-b06f-3a7b4304877b'
  AND (featured_image_url IS NULL OR featured_image_url = '');
