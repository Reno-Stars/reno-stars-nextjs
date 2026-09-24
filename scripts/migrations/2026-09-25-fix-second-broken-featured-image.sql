-- Migration: 2026-09-25-fix-second-broken-featured-image.sql
-- Target: blog_posts.featured_image_url = broken placeholder URLs
-- Rows fixed: 1 (whole-house-renovation-process-steps-vancouver-2026)
-- Status: NOT APPLIED — needs human to run

-- Fix 1: whole-house-renovation-process-steps-vancouver-2026
--   Old (broken): https://reno-stars-cdn.example.com/uploads/projects/vancouver-custom-whole-house-renovation/hero.jpg
--   New (real):   https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg
--   Source: projects.slug = 'vancouver-custom-whole-house-renovation' hero_image_url
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg',
    updated_at = NOW()
WHERE slug = 'whole-house-renovation-process-steps-vancouver-2026'
  AND featured_image_url = 'https://reno-stars-cdn.example.com/uploads/projects/vancouver-custom-whole-house-renovation/hero.jpg';
