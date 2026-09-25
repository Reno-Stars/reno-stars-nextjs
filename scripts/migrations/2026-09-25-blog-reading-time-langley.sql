-- Migration: 2026-09-25-blog-reading-time-langley.sql
-- Fix blog_posts.reading_time_minutes NULL for bathroom-renovation-timeline-langley-bc-2026.
-- Content: 8,437 chars ≈ 6 min reading time (8437/150 ≈ 6.0 wpm equivalent).
-- Idempotent UPDATE with WHERE slug guard; only fires when NULL.
-- NOT APPLIED — needs human to run against the live database.

UPDATE blog_posts
SET reading_time_minutes = 6,
    updated_at = NOW()
WHERE slug = 'bathroom-renovation-timeline-langley-bc-2026'
  AND reading_time_minutes IS NULL;
