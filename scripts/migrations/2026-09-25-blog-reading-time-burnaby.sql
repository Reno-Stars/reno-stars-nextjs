-- Migration: 2026-09-25-blog-reading-time-burnaby.sql
-- Fix blog_posts.reading_time_minutes NULL for bathroom-renovation-cost-burnaby.
-- Content: 7,716 chars EN, 2,845 chars ZH — ~5 min reading time.
-- Idempotent UPDATE with WHERE slug guard; only fires when NULL.

UPDATE blog_posts
SET reading_time_minutes = 5,
    updated_at = NOW()
WHERE slug = 'bathroom-renovation-cost-burnaby'
  AND reading_time_minutes IS NULL;
