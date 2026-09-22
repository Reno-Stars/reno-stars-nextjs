-- Migration: pending/2026-09-22-blog-reading-time-minutes-outdoor-test.sql
-- Date: 2026-09-22
-- Status: NOT APPLIED — requires human run via infra pipeline
-- Scope: 11 outdoor-test-* slug rows with NULL reading_time_minutes
--         excluded from main 2026-09-22-blog-reading-time-minutes.sql
--         which only covered non-test slugs
-- Formula: CEIL(content_en_length / 1000.0 * 2) — ~200 wpm English

UPDATE blog_posts SET reading_time_minutes = 12 WHERE id = '6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8' AND reading_time_minutes IS NULL;
UPDATE blog_posts SET reading_time_minutes = 12 WHERE id = '28386e2c-c726-41ce-95ac-e033e16d8027' AND reading_time_minutes IS NULL;
UPDATE blog_posts SET reading_time_minutes = 12 WHERE id = '48656047-631c-4d86-afc9-722f3dfdda88' AND reading_time_minutes IS NULL;
UPDATE blog_posts SET reading_time_minutes = 12 WHERE id = '3c0f7540-7dd4-4404-a7c5-1bd8ec3b0966' AND reading_time_minutes IS NULL;
UPDATE blog_posts SET reading_time_minutes = 12 WHERE id = '5509a194-8509-4e6d-a201-ae271ab53bde' AND reading_time_minutes IS NULL;
UPDATE blog_posts SET reading_time_minutes = 12 WHERE id = '081258dc-0351-4d9d-a3a0-e2cd2a424dd2' AND reading_time_minutes IS NULL;
UPDATE blog_posts SET reading_time_minutes = 12 WHERE id = 'fd509df0-d641-4154-96e2-345e7cc71add' AND reading_time_minutes IS NULL;
UPDATE blog_posts SET reading_time_minutes = 12 WHERE id = '92ef3796-7d41-4d6c-bb09-520340f6d3b6' AND reading_time_minutes IS NULL;
UPDATE blog_posts SET reading_time_minutes = 12 WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047' AND reading_time_minutes IS NULL;
UPDATE blog_posts SET reading_time_minutes = 12 WHERE id = 'dd064abc-db01-4588-a7a7-9738872b2ea7' AND reading_time_minutes IS NULL;
UPDATE blog_posts SET reading_time_minutes = 12 WHERE id = '6b86f73f-a05d-40a3-a456-5c7d73bf87bb' AND reading_time_minutes IS NULL;
