-- Migration: 2026-10-03-blog-featured-image-null-heritage-home.sql
-- Target: blog_posts WHERE featured_image_url IS NULL AND slug = 'heritage-home-renovation-vancouver-2026'
-- Issue: 10 published blog posts have NULL featured_image_url (ladder item 2: thin content / missing metadata)
-- This is ONE of 10 — human applies in order of priority
-- Status: NOT APPLIED — needs human to run
-- Note: agent_ro credential is SELECT-only; this is committed as a migration for human apply

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '2311bd71-d249-4143-8d7f-6dfb439c413c'
  AND featured_image_url IS NULL;
-- Idempotent: only applies if NULL, row count 0 if already fixed or deleted
