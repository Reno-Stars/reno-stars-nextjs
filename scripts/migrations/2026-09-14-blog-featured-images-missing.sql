-- 2026-09-14-blog-featured-images-missing.sql
-- NOT APPLIED — needs human to run
-- Populate featured_image_url for 9 published posts that have no hero image.
-- Idempotent: WHERE slug IN (...) prevents re-application.
UPDATE blog_posts
SET featured_image_url = CASE slug
  -- Mid-century rancher: whole-house feel
  WHEN 'mid-century-rancher-renovation-vancouver-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/richmond-house-renovation-kitchen-bathrooms-flooring-p01-after-v1.jpg'
  -- House renovation step-by-step: whole-house project
  WHEN 'vancouver-house-renovation-step-by-step-guide-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/delta-kitchen-renovation-apron-sink-quartz-p01-after-v1.jpg'
  -- ADU: small home addition context
  WHEN 'adu-renovation-vancouver-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/townhouse-kitchen-renovation-burnaby-social-ready-hero-mn562i9n41fd7014-f.jpg'
  -- Split-level renovation: modern kitchen
  WHEN 'split-level-home-renovation-burnaby-coquitlam-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmo1xa2q.jpeg'
  -- Infill development: modern kitchen renovation
  WHEN 'vancouver-infill-development-cost-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmnzas1t.jpg'
  -- Stair renovation: interior detail
  WHEN 'vancouver-stair-renovation-cost-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/north-vancouver-bathroom-renovation-herringbone-tile-p01-after-v1.jpg'
  -- Heat pump: mechanical/utility (using clean bathroom hero)
  WHEN 'heat-pump-installation-vancouver-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmn562i9n41fd7014-5.png'
  -- Heritage home: elegant kitchen
  WHEN 'heritage-home-renovation-vancouver-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpdnxit.jpg'
  -- Kitchen cost: premium kitchen
  WHEN 'how-much-does-kitchen-renovation-cost-vancouver-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/coquitlam-kitchen-renovation-quartz-island-p01-after-v1.jpg'
END
WHERE slug IN (
  'mid-century-rancher-renovation-vancouver-2026',
  'vancouver-house-renovation-step-by-step-guide-2026',
  'adu-renovation-vancouver-2026',
  'split-level-home-renovation-burnaby-coquitlam-2026',
  'vancouver-infill-development-cost-2026',
  'vancouver-stair-renovation-cost-2026',
  'heat-pump-installation-vancouver-2026',
  'heritage-home-renovation-vancouver-2026',
  'how-much-does-kitchen-renovation-cost-vancouver-2026'
)
AND featured_image_url IS NULL
AND is_published;
