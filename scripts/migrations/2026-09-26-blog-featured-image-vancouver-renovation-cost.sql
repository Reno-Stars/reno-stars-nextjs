-- Migration: backfill featured_image_url for vancouver-renovation-cost-2026
-- Status: STOP condition (1 post missing featuredImageUrl)
BEGIN;

UPDATE blog_posts SET
  featured_image_url = 'https://images.reno-stars.com/vancouver-whole-house-renovation-hero.jpg'
WHERE slug = 'vancouver-renovation-cost-2026'
  AND is_published = true
  AND (featured_image_url IS NULL OR featured_image_url = '');

COMMIT;
