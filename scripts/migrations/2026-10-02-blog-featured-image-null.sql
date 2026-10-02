-- 2026-10-02-blog-featured-image-null.sql
-- NOT APPLIED — needs human to run
-- Backfills featured_image_url for 11 published posts that have null/empty image.
-- Uses real project R2 URLs verified from the projects table.
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
WHERE slug = 'adu-renovation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/toystore-renovation-metrotown-burnaby-hero-mmwsir74.jpg'
WHERE slug = 'bathroom-renovation-cost-burnaby'
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/richmond-condo-flooring-renovation-p01-after-v1.jpg'
WHERE slug = 'before-after-renovation-vancouver'
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-bathroom-renovation.jpg'
WHERE slug = 'heritage-home-renovation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/custom-kitchen-renovation-black-fixtures-burnaby.jpg'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/daughter-bath-renovation-richmond-gray-tile-hero-mmnwygwq.jpg'
WHERE slug = 'mid-century-rancher-renovation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmmnqlc8.jpg'
WHERE slug = 'mold-remediation-cost-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE slug = 'split-level-home-renovation-burnaby-coquitlam-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/minimalist-kitchen-renovation-richmond.jpg'
WHERE slug = 'vancouver-house-renovation-step-by-step-guide-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mn3v6dib65ec88ce-8.jpg'
WHERE slug = 'vancouver-infill-development-cost-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-media-hero-mmtznddu.jpg'
WHERE slug = 'vancouver-stair-renovation-cost-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');
