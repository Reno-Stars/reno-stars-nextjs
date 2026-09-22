-- Migration: blog_posts — reading_time_minutes backfill
-- Date: 2026-09-22
-- Status: NOT APPLIED — requires human run via infra pipeline
-- Detected via: SELECT id, LENGTH(content_en) FROM blog_posts WHERE reading_time_minutes IS NULL AND slug NOT LIKE 'outdoor-test%'
-- Formula: CEIL(content_en_length / 1000.0 * 2) — ~200 wpm English
-- 4 real posts need this; test slugs (outdoor-test-*) excluded.

UPDATE blog_posts SET reading_time_minutes = 12 WHERE id = '6bf210ff-9f94-4ec2-ba3e-b660555bf204' AND reading_time_minutes IS NULL;
UPDATE blog_posts SET reading_time_minutes = 3  WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247' AND reading_time_minutes IS NULL;
UPDATE blog_posts SET reading_time_minutes = 3  WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6' AND reading_time_minutes IS NULL;
UPDATE blog_posts SET reading_time_minutes = 17 WHERE id = '5cdb6396-e438-446c-8467-0a480b21472b' AND reading_time_minutes IS NULL;
