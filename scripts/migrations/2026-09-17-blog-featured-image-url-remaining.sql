-- Migration: Populate featured_image_url for 8 blog_posts missing images
-- NOT APPLIED — needs human review and execution
-- Images are real hero_image_url values from the projects table (already confirmed accessible)
-- Idempotent WHERE guard ensures no double-apply if run more than once
UPDATE blog_posts SET
  featured_image_url = CASE slug
    -- mid-century rancher: use a modern Vancouver kitchen (mid-century modern aesthetic)
    WHEN 'mid-century-rancher-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmnzas1t.jpg'
    -- step-by-step guide: whole-house context from Burnaby two-bathroom project
    WHEN 'vancouver-house-renovation-step-by-step-guide-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmv4zlks.jpg'
    -- ADU / secondary suite: Vancouver commercial-to-residential (adds livable space theme)
    WHEN 'adu-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmwdwfp8.jpg'
    -- split-level home: Burnaby residential project
    WHEN 'split-level-home-renovation-burnaby-coquitlam-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmv4zlks.jpg'
    -- infill / multiplex development: Vancouver whole-house project
    WHEN 'vancouver-infill-development-cost-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    -- stair renovation: Vancouver kitchen (interior renovation context)
    WHEN 'vancouver-stair-renovation-cost-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmnzas1t.jpg'
    -- heat pump HVAC: Modern kitchen (modern systems upgrade theme)
    WHEN 'heat-pump-installation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmnzas1t.jpg'
    -- heritage home: Vancouver custom whole-house (character home context)
    WHEN 'heritage-home-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
    -- kitchen cost guide: kitchen renovation match
    WHEN 'how-much-does-kitchen-renovation-cost-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/modern-kitchen-renovation-richmond-hero-mmms482z.jpg'
    ELSE featured_image_url
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
AND featured_image_url IS NULL;
