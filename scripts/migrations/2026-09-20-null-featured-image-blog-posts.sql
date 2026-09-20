-- Migration: add featured_image_url to 10 published blog posts that have no hero image.
--   pnpm db:query -f scripts/migrations/2026-09-20-null-featured-image-blog-posts.sql
--
-- These 10 published posts have NULL featured_image_url (confirmed via live DB query
-- 2026-09-20). Images are drawn from the projects table (hero_image_url) where
-- service_type matches the post topic.
--
-- NOT covered (2 posts, different causes -- need human review):
--   bathroom-renovation-maple-ridge-2026            object missing from R2 entirely
--   whole-house-renovation-process-steps-vancouver  points at reno-stars-cdn.example.com
--
-- NOT covered here: the 73-path-prefix 404s already handled in
--   2026-09-11-featured-image-404s.sql

UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
 WHERE slug = 'heat-pump-installation-vancouver-2026' AND featured_image_url IS NULL;

UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
 WHERE slug = 'vancouver-infill-development-cost-2026' AND featured_image_url IS NULL;

UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
 WHERE slug = 'heritage-home-renovation-vancouver-2026' AND featured_image_url IS NULL;

UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
 WHERE slug = 'adu-renovation-vancouver-2026' AND featured_image_url IS NULL;

UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
 WHERE slug = 'vancouver-house-renovation-step-by-step-guide-2026' AND featured_image_url IS NULL;

UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
 WHERE slug = 'vancouver-stair-renovation-cost-2026' AND featured_image_url IS NULL;

UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-white-shaker-kitchen-renovation-hero-mmtznef3.jpg'
 WHERE slug = 'before-after-renovation-vancouver' AND featured_image_url IS NULL;

UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
 WHERE slug = 'mid-century-rancher-renovation-vancouver-2026' AND featured_image_url IS NULL;

UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/5531-rmd-hero-mmwo14jn.jpg'
 WHERE slug = 'split-level-home-renovation-burnaby-coquitlam-2026' AND featured_image_url IS NULL;

UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-media-hero-mmtznef3.jpg'
 WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026' AND featured_image_url IS NULL;
