-- Migration: 2026-09-23-blog-featured-image-null
-- Target: 9 published blog_posts with NULL/empty featured_image_url
-- Source images: hero_image_url from live projects table
-- NOT APPLIED — needs human to run before merge
-- Status as of: 2026-09-23

BEGIN;

-- 1. before-after-renovation-vancouver
--    Vancouver whole-house kitchen + bathrooms renovation
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg'
WHERE id = 'a5f45c93-4b94-4292-afeb-b0cb19908fe6'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 2. vancouver-stair-renovation-cost-2026
--    Vancouver whole-house renovation (no dedicated stair project; use same hero)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg'
WHERE id = 'a16ecf67-c4d4-4343-99a9-c982798e64c1'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 3. vancouver-house-renovation-step-by-step-guide-2026
--    Vancouver whole-house renovation
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg'
WHERE id = '4915068e-8851-46f7-bfdf-628a4603d3fe'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 4. how-much-does-kitchen-renovation-cost-vancouver-2026
--    Coquitlam kitchen with quartz waterfall island
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/coquitlam-kitchen-renovation-quartz-island-p01-after-v1.jpg'
WHERE id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 5. mid-century-rancher-renovation-vancouver-2026
--    Richmond whole-home with marble-look kitchen
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/richmond-whole-home-renovation-marble-kitchen-p01-after-v1.jpg'
WHERE id = 'e6257f9d-a6fe-43ce-b06f-3a7b4304877b'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 6. split-level-home-renovation-burnaby-coquitlam-2026
--    Delta whole-house with apron sink + quartz (proxy for split-level scale)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/delta-kitchen-renovation-apron-sink-quartz-p01-after-v1.jpg'
WHERE id = 'ebafaebf-3060-4dea-8dc3-508be25d95d6'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 7. vancouver-infill-development-cost-2026
--    Vancouver WFH office glass partition (residential renovation = infill context)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/po12051-glass-office-img_3171-g3ob4999.jpg'
WHERE id = '17e69f50-74b9-469e-8b87-11d3a4ed74ef'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 8. heritage-home-renovation-vancouver-2026
--    Vancouver house renovation (heritage = residential character)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg'
WHERE id = '2311bd71-d249-4143-8d7f-6dfb439c413c'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 9. adu-renovation-vancouver-2026
--    Vancouver WFH office conversion (ADU = secondary suite renovation context)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/po12051-glass-office-img_3171-g3ob4999.jpg'
WHERE id = '48e499c1-38a7-4d00-bf54-b1cdd4568506'
  AND (featured_image_url IS NULL OR featured_image_url = '');

COMMIT;
