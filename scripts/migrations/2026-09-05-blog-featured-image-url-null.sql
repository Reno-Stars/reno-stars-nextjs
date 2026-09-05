-- Migration: 2026-09-05-blog-featured-image-url-null.sql
-- Target: 7 published blog_posts with NULL featured_image_url
-- NOT APPLIED — needs human to run against live database
-- Uses real hero_image_url values from the projects table (confirmed via DB query this run)
-- Deduplication guard: each UPDATE targets slug AND (NULL or empty) to prevent re-application

UPDATE blog_posts
SET featured_image_url =
  CASE slug
    WHEN 'mid-century-rancher-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
    WHEN 'heritage-home-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
    WHEN 'adu-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
    WHEN 'vancouver-infill-development-cost-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    WHEN 'split-level-home-renovation-burnaby-coquitlam-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    WHEN 'heat-pump-installation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    WHEN 'how-much-does-kitchen-renovation-cost-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/custom-kitchen-renovation-black-fixtures-burnaby-5531-rmd-hero-mmwo13gi.jpg'
    ELSE featured_image_url
  END,
  updated_at = NOW()
WHERE
  is_published
  AND (featured_image_url IS NULL OR featured_image_url = '')
  AND slug IN (
    'mid-century-rancher-renovation-vancouver-2026',
    'heritage-home-renovation-vancouver-2026',
    'adu-renovation-vancouver-2026',
    'vancouver-infill-development-cost-2026',
    'split-level-home-renovation-burnaby-coquitlam-2026',
    'heat-pump-installation-vancouver-2026',
    'how-much-does-kitchen-renovation-cost-vancouver-2026'
  );
