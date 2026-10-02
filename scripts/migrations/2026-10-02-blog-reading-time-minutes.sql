/**
 * Migration: Set reading_time_minutes for two blog posts missing the field.
 * Run: pnpm db:query -f scripts/migrations/2026-10-02-blog-reading-time-minutes.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Context: DB audit 2026-10-02 found 2 published posts with reading_time_minutes IS NULL.
 * Estimated from content_en word count (avg 130 wpm English).
 *
 * bathroom-renovation-cost-burnaby:       ~5107 chars_en → ~700 words → 8 min
 * bathroom-renovation-timeline-langley-bc-2026: ~8437 chars_en → ~1300 words → 10 min
 */

BEGIN;

UPDATE blog_posts
SET reading_time_minutes = 8
WHERE slug = 'bathroom-renovation-cost-burnaby'
  AND reading_time_minutes IS NULL;

UPDATE blog_posts
SET reading_time_minutes = 10
WHERE slug = 'bathroom-renovation-timeline-langley-bc-2026'
  AND reading_time_minutes IS NULL;

COMMIT;
