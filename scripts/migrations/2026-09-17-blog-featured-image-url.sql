-- Migration: Populate featured_image_url for blog_posts missing images
-- NOT APPLIED — needs human review and execution
-- Uses real hero_image_url values from the projects table
-- Idempotent WHERE guard ensures no double-apply if run more than once
UPDATE blog_posts SET
  featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mn562i9n41fd7014-f.jpg'
WHERE slug = 'townhouse-reno-vancouver-2026'
AND featured_image_url IS NULL;
