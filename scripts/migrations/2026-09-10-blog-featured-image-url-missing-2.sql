-- 2026-09-10: assign featured_image_url to 3 published blog posts missing one
-- NOT APPLIED — needs human to run before it auto-applies on merge
-- Coverage: 3 posts, all is_published=true
-- Already covered: 9 ids in 2026-09-10-blog-featured-image-url-missing.sql on seo/daily-2026-09-10 (same tick)
BEGIN;

-- vancouver-stair-renovation-guide-2026 → whole-house bathroom hero (structural/renovation theme)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-bathroom-renovation-hero-mmtznddu.jpg'
WHERE id = 'c5153108-ee6e-4e75-99a9-5f79d02567a8'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- how-to-renovate-house-vancouver-first-timer-guide → whole-house kitchen+bathrooms hero (first-timer whole-house context)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND featured_image_url IS NULL;

-- vancouver-property-type-renovation-2026 → delta kitchen hero (Delta = property type diversity, thematic match)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/delta-kitchen-renovation-apron-sink-quartz-p01-after-v1.jpg'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND featured_image_url IS NULL;

COMMIT;
