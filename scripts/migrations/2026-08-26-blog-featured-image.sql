-- Migration: blog_posts featured_image_url for 6 published posts with NULL images
-- NOT APPLIED — needs human to run against the database
-- Context: images sourced from real project hero_image_url values matched by service/city
UPDATE blog_posts SET featured_image_url =
  CASE slug
    WHEN 'mid-century-rancher-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
    WHEN 'heritage-home-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
    WHEN 'adu-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
    WHEN 'vancouver-infill-development-cost-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
    WHEN 'split-level-home-renovation-burnaby-coquitlam-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    WHEN 'how-much-does-kitchen-renovation-cost-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/5531-rmd-hero-mmwo13gi.jpg'
  END
WHERE slug IN (
    'mid-century-rancher-renovation-vancouver-2026',
    'heritage-home-renovation-vancouver-2026',
    'adu-renovation-vancouver-2026',
    'vancouver-infill-development-cost-2026',
    'split-level-home-renovation-burnaby-coquitlam-2026',
    'how-much-does-kitchen-renovation-cost-vancouver-2026'
  )
  AND featured_image_url IS NULL;
