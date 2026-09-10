-- 2026-09-10: assign featured_image_url to 9 published blog posts missing one
-- NOT APPLIED — needs human to run before it auto-applies on merge
-- Coverage: 9 posts, all is_published=true, all featured_image_url IS NULL
-- Already covered: 12 ids in 2026-09-09 migration on seo/daily-2026-09-09 (unmerged)

BEGIN;

-- mid-century-rancher-renovation-vancouver-2026 → whole-house hero
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = 'e6257f9d-a6fe-43ce-b06f-3a7b4304877b'
  AND featured_image_url IS NULL;

-- vancouver-house-renovation-step-by-step-guide-2026 → bathroom updates hero
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
WHERE id = '4915068e-8851-46f7-bfdf-628a4603d3fe'
  AND featured_image_url IS NULL;

-- adu-renovation-vancouver-2026 → Metrotown/Burnaby hero (thematic ADU/project)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/toystore-renovation-metrotown-burnaby-hero-mmwsir74.jpg'
WHERE id = '48e499c1-38a7-4d00-bf54-b1cdd4568506'
  AND featured_image_url IS NULL;

-- split-level-home-renovation-burnaby-coquitlam-2026 → custom kitchen hero
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/custom-kitchen-renovation-black-fixtures-burnaby-hero-5531-rmd-mmwo13gi.jpg'
WHERE id = 'ebafaebf-3060-4dea-8dc3-508be25d95d6'
  AND featured_image_url IS NULL;

-- vancouver-infill-development-cost-2026 → condo flooring hero (infill context)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/richmond-condo-flooring-renovation-p01-after-v1.jpg'
WHERE id = '17e69f50-74b9-469e-8b87-11d3a4ed74ef'
  AND featured_image_url IS NULL;

-- vancouver-stair-renovation-cost-2026 → whole-house bathroom hero (structural)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-bathroom-renovation-hero-mmtznddu.jpg'
WHERE id = 'a16ecf67-c4d4-4343-99a9-c982798e64c1'
  AND featured_image_url IS NULL;

-- heat-pump-installation-vancouver-2026 → three-bathroom hero (renovation+mechanical)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/three-bathroom-renovation-delta-hero-mmnqlc8.jpg'
WHERE id = '094434be-7021-470b-a0c5-13fc680bd92d'
  AND featured_image_url IS NULL;

-- heritage-home-renovation-vancouver-2026 → daughter bath hero (heritage character)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/daughter-bath-renovation-richmond-gray-tile-hero-mmnwygwq.jpg'
WHERE id = '2311bd71-d249-4143-8d7f-6dfb439c413c'
  AND featured_image_url IS NULL;

-- how-much-does-kitchen-renovation-cost-vancouver-2026 → two-bathroom hero (kitchen cost article)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmv4zlks.jpg'
WHERE id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND featured_image_url IS NULL;

COMMIT;
