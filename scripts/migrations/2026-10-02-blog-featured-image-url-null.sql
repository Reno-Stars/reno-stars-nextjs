-- Migration: 2026-10-02-blog-featured-image-url-null.sql
-- Target:   blog_posts.is_published=true with NULL or empty featured_image_url
-- Source:   a valid R2 image URL confirmed present in other published posts
-- Status:   NOT APPLIED — needs human to run
UPDATE blog_posts
SET    featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmzmw022.jpg',
       updated_at = NOW()
WHERE  is_published = true
  AND  (featured_image_url IS NULL OR featured_image_url = '');
