-- Migration: backfill featured_image_url for 9 published posts with NULL
-- Ticket: 9 blog posts confirmed NULL via DB query 2026-09-21
-- Reason: 98%% of posts have a hero image; these posts are missing theirs
-- Status: NOT APPLIED — needs human to run
UPDATE blog_posts
SET featured_image_url = CASE slug
  -- 1. heat-pump-installation-vancouver-2026
  WHEN 'heat-pump-installation-vancouver-2026'    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/toystore-renovation-metrotown-burnaby-hero-mmwsir74.jpg'
  -- 2. mid-century-rancher-renovation-vancouver-2026
  WHEN 'mid-century-rancher-renovation-vancouver-2026' THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
  -- 3. vancouver-house-renovation-step-by-step-guide-2026
  WHEN 'vancouver-house-renovation-step-by-step-guide-2026' THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/richmond-condo-flooring-renovation-p01-after-v1.jpg'
  -- 4. adu-renovation-vancouver-2026
  WHEN 'adu-renovation-vancouver-2026'             THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmv4zlks.jpg'
  -- 5. split-level-home-renovation-burnaby-coquitlam-2026
  WHEN 'split-level-home-renovation-burnaby-coquitlam-2026' THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-media-hero-mmtznddu.jpg'
  -- 6. vancouver-infill-development-cost-2026
  WHEN 'vancouver-infill-development-cost-2026'  THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/5531-rmd-hero-mmwo13gi.jpg'
  -- 7. vancouver-stair-renovation-cost-2026
  WHEN 'vancouver-stair-renovation-cost-2026'   THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/daughter-bath-renovation-richmond-gray-tile-hero-mmnwygwq.jpg'
  -- 8. heritage-home-renovation-vancouver-2026
  WHEN 'heritage-home-renovation-vancouver-2026'  THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmmnqlc8.jpg'
  -- 9. how-much-does-kitchen-renovation-cost-vancouver-2026
  WHEN 'how-much-does-kitchen-renovation-cost-vancouver-2026' THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
END
WHERE slug IN (
  'heat-pump-installation-vancouver-2026',
  'mid-century-rancher-renovation-vancouver-2026',
  'vancouver-house-renovation-step-by-step-guide-2026',
  'adu-renovation-vancouver-2026',
  'split-level-home-renovation-burnaby-coquitlam-2026',
  'vancouver-infill-development-cost-2026',
  'vancouver-stair-renovation-cost-2026',
  'heritage-home-renovation-vancouver-2026',
  'how-much-does-kitchen-renovation-cost-vancouver-2026'
)
  AND featured_image_url IS NULL;
