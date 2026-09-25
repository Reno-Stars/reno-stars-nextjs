-- Migration: 2026-09-25-blog-reading-time-burnaby-bathroom-cost.sql
-- Fix: blog_posts.reading_time_minutes NULL for bathroom-renovation-cost-burnaby.
-- This is a NEW finding — this post published today (2026-09-25) and was not
-- covered by existing reading_time migrations (garage, north-vancouver, langley).
-- Content: 8,097 chars EN + 5,092 chars ZH.
-- 8,097 chars / 150 ≈ 54 min raw; HTML content ≈ 5-6 min reading time.
-- Inferred from same content scope as other bathroom cost guides (~5-6 min).
-- WHERE guard ensures idempotency.

UPDATE blog_posts
SET reading_time_minutes = 6,
    updated_at = NOW()
WHERE slug = 'bathroom-renovation-cost-burnaby'
  AND reading_time_minutes IS NULL;
