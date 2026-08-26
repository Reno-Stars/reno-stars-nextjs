-- seo migrations: blog_posts featured_image_url for 6 published posts with NULL featured_image_url
-- NOT APPLIED — needs human review and execution

-- 1. mid-century-rancher-renovation-vancouver-2026 (whole-house Vancouver)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = 'e6257f9d-a6fe-43ce-b06f-3a7b4304877b'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 2. heritage-home-renovation-vancouver-2026 (whole-house Vancouver)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '2311bd71-d249-4143-8d7f-6dfb439c413c'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 3. adu-renovation-vancouver-2026 (ADU Vancouver — topic-matched to Vancouver whole-house project)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '48e499c1-38a7-4d00-bf54-b1cdd4568506'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 4. vancouver-infill-development-cost-2026 (infill/lot-splitting Vancouver — no direct ADU match; use whole-house Vancouver)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '17e69f50-74b9-469e-8b87-11d3a4ed74ef'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 5. split-level-home-renovation-burnaby-coquitlam-2026 (whole-house Burnaby/Coquitlam)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
WHERE id = 'ebafaebf-3060-4dea-8dc3-508be25d95d6'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- 6. how-much-does-kitchen-renovation-cost-vancouver-2026 (kitchen cost Vancouver)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/delta-kitchen-renovation-apron-sink-quartz-p01-after-v1.jpg'
WHERE id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND (featured_image_url IS NULL OR featured_image_url = '');
