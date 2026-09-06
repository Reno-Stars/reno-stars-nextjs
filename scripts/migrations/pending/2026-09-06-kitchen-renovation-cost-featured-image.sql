-- Migration: add featured_image_url to how-much-does-kitchen-renovation-cost-vancouver-2026
-- NOT YET APPLIED — needs human review and execution
-- This is the site's #1 kitchen cost guide (13,050 char content) but has NULL featured_image_url
-- Image matched by topic: kitchen renovation in Metro Vancouver

UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/5531-rmd-hero-mmwo13gi.jpg' WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026' AND featured_image_url IS NULL;
