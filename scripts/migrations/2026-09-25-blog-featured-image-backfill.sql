-- Ladder 3b: Backfill featured_image_url for 9 published blog_posts missing images
-- Scan 2026-09-25: 9 published blog_posts with NULL featured_image_url
-- Assigned relevant project hero images by topic match
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg'
WHERE slug = 'mid-century-rancher-renovation-vancouver-2026'
  AND is_published = true
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/teabydo-bubble-tea-shop-renovation-richmond-p01-after-v1.jpg'
WHERE slug = 'adu-renovation-vancouver-2026'
  AND is_published = true
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/coquitlam-kitchen-renovation-quartz-island-p01-after-v1.jpg'
WHERE slug = 'split-level-home-renovation-burnaby-coquitlam-2026'
  AND is_published = true
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-condo-renovation-kitchen-two-bathrooms-p02-after-v1.jpg'
WHERE slug = 'vancouver-infill-development-cost-2026'
  AND is_published = true
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg'
WHERE slug = 'heritage-home-renovation-vancouver-2026'
  AND is_published = true
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/richmond-house-renovation-kitchen-bathrooms-flooring-p01-after-v1.jpg'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND is_published = true
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/master-bathroom-renovation-vancouver-hero-mo23b6nd.jpeg'
WHERE slug = 'vancouver-stair-renovation-cost-2026'
  AND is_published = true
  AND (featured_image_url IS NULL OR featured_image_url = '');

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg'
WHERE slug = 'vancouver-house-renovation-step-by-step-guide-2026'
  AND is_published = true
  AND (featured_image_url IS NULL OR featured_image_url = '');
