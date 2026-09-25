-- Migration: 2026-09-25-blog-reading-time-garage-vancouver.sql
-- Fix: blog_posts.reading_time_minutes NULL for garage-renovation-vancouver-2026.
-- Content: 7,716 chars EN, 2,845 chars ZH.
-- 7,716 chars / 150 ≈ 51 min raw; HTML content ≈ 5-6 min reading time.
-- Idempotent UPDATE with WHERE slug guard; only fires when NULL.
-- reading_time_minutes backlog: 2 files (langley, north-vancouver) — below cap of 3.

UPDATE blog_posts
SET reading_time_minutes = 6,
    updated_at = NOW()
WHERE slug = 'garage-renovation-vancouver-2026'
  AND reading_time_minutes IS NULL;
