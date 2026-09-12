-- 2026-09-12: fix featured_image_url for published + draft blog posts
-- that have NULL or empty featured_image_url
-- Source URL confirmed from projects table (kitchen renovation project):
--   slug: custom-kitchen-renovation-black-fixtures-burnaby
--   URL: https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/5531-rmd-hero-mmwo13gi.jpg
--
-- NOT applied — needs human to run:
--   psql < scripts/migrations/2026-09-12-featured-image-404s.sql

BEGIN;

-- Published posts missing hero images
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/5531-rmd-hero-mmwo13gi.jpg'
WHERE is_published
  AND (featured_image_url IS NULL OR featured_image_url = '')
  AND slug IN (
    'mid-century-rancher-renovation-vancouver-2026',
    'vancouver-townhouse-renovation-cost-2026-free-guide',
    'richmond-bc-renovation-cost-guide-2026'
  );

-- Draft posts missing hero images
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/5531-rmd-hero-mmwo13gi.jpg'
WHERE NOT is_published
  AND (featured_image_url IS NULL OR featured_image_url = '')
  AND slug IN (
    'burnaby-kitchen-renovation-cost-2026',
    'coquitlam-kitchen-renovation-cost-2026',
    'vancouver-kitchen-renovation-cost-2026',
    'new-westminster-kitchen-renovation-2026',
    'north-vancouver-kitchen-renovation-cost-2026',
    'west-vancouver-kitchen-renovation-cost-2026',
    'langley-kitchen-renovation-cost-2026',
    'delta-kitchen-renovation-cost-2026',
    'port-coquitlam-kitchen-renovation-2026'
  );

COMMIT;
