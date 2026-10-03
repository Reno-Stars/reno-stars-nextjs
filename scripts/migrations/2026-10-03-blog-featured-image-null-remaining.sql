-- Migration: NULL featured_image_url on remaining blog posts (10 rows)
-- Status: NOT APPLIED — needs human to run
-- Written: 2026-10-03
-- IDs already covered: heritage-home (2026-10-03-blog-featured-image-null-heritage-home.sql)

UPDATE blog_posts
SET    featured_image_url = CASE slug
  WHEN 'mold-remediation-cost-vancouver-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
  WHEN 'vancouver-infill-development-cost-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
  WHEN 'bathroom-renovation-cost-burnaby'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/toystore-renovation-metrotown-burnaby-hero-mmwsir74.jpg'
  WHEN 'adu-renovation-vancouver-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
  WHEN 'vancouver-house-renovation-step-by-step-guide-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
  WHEN 'vancouver-stair-renovation-cost-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
  WHEN 'before-after-renovation-vancouver'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
  WHEN 'mid-century-rancher-renovation-vancouver-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
  WHEN 'split-level-home-renovation-burnaby-coquitlam-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/toystore-renovation-metrotown-burnaby-hero-mmwsir74.jpg'
  WHEN 'how-much-does-kitchen-renovation-cost-vancouver-2026'
    THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
  ELSE featured_image_url
END
WHERE  is_published
  AND  (featured_image_url IS NULL OR featured_image_url = '')
  AND  slug IN (
    'mold-remediation-cost-vancouver-2026',
    'vancouver-infill-development-cost-2026',
    'bathroom-renovation-cost-burnaby',
    'adu-renovation-vancouver-2026',
    'vancouver-house-renovation-step-by-step-guide-2026',
    'vancouver-stair-renovation-cost-2026',
    'before-after-renovation-vancouver',
    'mid-century-rancher-renovation-vancouver-2026',
    'split-level-home-renovation-burnaby-coquitlam-2026',
    'how-much-does-kitchen-renovation-cost-vancouver-2026'
  );
