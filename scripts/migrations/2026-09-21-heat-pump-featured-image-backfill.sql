-- Migration: backfill featured_image_url for heat-pump post
-- Ticket: https://reno-stars.com/en/blog/heat-pump-installation-vancouver-2026/
-- Reason: 98%% of posts have a hero image; this post has NULL
-- Status: NOT APPLIED — needs human to run
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/toystore-renovation-metrotown-burnaby-hero-mmwsir74.jpg'
WHERE slug = 'heat-pump-installation-vancouver-2026'
  AND featured_image_url IS NULL;
