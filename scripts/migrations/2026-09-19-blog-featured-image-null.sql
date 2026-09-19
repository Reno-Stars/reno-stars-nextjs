-- NOT APPLIED. Needs human to run.
-- Assign featured_image_url to 9 published blog posts that have no image.
-- Strategy: join to projects table by service_type, pick one with a hero_image_url.
-- Verify images are appropriate before applying.

WITH target_posts AS (
  SELECT id, slug, project_id
  FROM blog_posts
  WHERE is_published
    AND (featured_image_url IS NULL OR featured_image_url = '')
),
project_images AS (
  SELECT
    p.id AS project_id,
    p.slug AS project_slug,
    p.hero_image_url,
    p.service_type,
    ROW_NUMBER() OVER (PARTITION BY p.service_type ORDER BY p.id DESC) AS rn
  FROM projects p
  WHERE p.is_published
    AND p.hero_image_url IS NOT NULL
    AND p.hero_image_url != ''
)
UPDATE blog_posts bp
SET featured_image_url = pi.hero_image_url
FROM target_posts tp
JOIN project_images pi ON pi.rn = 1
WHERE bp.id = tp.id;
