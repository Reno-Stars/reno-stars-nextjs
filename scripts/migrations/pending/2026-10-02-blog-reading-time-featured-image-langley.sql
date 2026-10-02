-- 2026-10-02-blog-reading-time-featured-image-langley.sql
-- NOT APPLIED — needs human to run after PR merge.
--
-- Two fixes for bathroom-renovation-timeline-langley-bc-2026:
--   1. reading_time_minutes: 8437 chars_en ≈ 1300 words → 10 min (130 wpm avg)
--   2. featured_image_url: backfill from related Langley project
--
-- Context: DB audit 2026-10-02 found this post missing both fields.
-- The reading_time_minutes migration (2026-10-02-blog-reading-time-minutes.sql)
-- covers the Burnaby bathroom post but NOT this one — this was missed.

BEGIN;

UPDATE blog_posts
SET reading_time_minutes = 10
WHERE slug = 'bathroom-renovation-timeline-langley-bc-2026'
  AND reading_time_minutes IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/langley-kitchen-renovation-waterfall-island-design.jpg'
WHERE slug = 'bathroom-renovation-timeline-langley-bc-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

COMMIT;
