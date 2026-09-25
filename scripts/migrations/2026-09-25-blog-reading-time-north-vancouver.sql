-- Migration: 2026-09-25-blog-reading-time-north-vancouver.sql
-- Fix 1 blog_posts row with NULL reading_time_minutes.
-- Idempotent UPDATE with WHERE slug guard; only fires when NULL.
-- NOT APPLIED — needs human to run against the live database.
--
-- Content length: 7,416 chars ≈ 5 min reading time (7416/150 ≈ 5 wpm equivalent).
-- Same scope/tier as the Langley bathroom timeline post (also ~5-6 min).

UPDATE blog_posts
SET reading_time_minutes = 5,
    updated_at = NOW()
WHERE slug = 'bathroom-renovation-timeline-north-vancouver-2026'
  AND reading_time_minutes IS NULL;
