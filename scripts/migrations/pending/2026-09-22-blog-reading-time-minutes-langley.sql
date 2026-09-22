-- 2026-09-22: blog_posts reading_time_minutes backfill for 1 published post
-- NOT APPLIED — needs human to run before insert/unpublish
-- Post: bathroom-renovation-timeline-langley-bc-2026 (id: 5cdb6396-e438-446c-8467-0a480b21472b)
-- Content length: 8437 chars ≈ 1,687 words → 7 min reading time
-- Migration 2026-09-22-blog-reading-time-minutes.sql covers 4 other posts; this is an additional row found
-- by cross-reference against the reading_time NULL set (the prior migration missed this id).

UPDATE blog_posts
SET reading_time_minutes = 7
WHERE id = '5cdb6396-e438-446c-8467-0a480b21472b'
  AND reading_time_minutes IS NULL  -- idempotent guard
;
