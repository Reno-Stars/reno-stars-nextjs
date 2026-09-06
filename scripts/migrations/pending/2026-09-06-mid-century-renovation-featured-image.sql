-- Migration: add featured_image_url to mid-century-rancher-renovation-vancouver-2026
-- NOT YET APPLIED — needs human review and execution
-- Mid-century house renovation guide (12,869 char content) with NULL featured_image_url
-- Image matched to whole-house Vancouver project (mid-century houses are a Vancouver house type)

UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg' WHERE slug = 'mid-century-rancher-renovation-vancouver-2026' AND featured_image_url IS NULL;
