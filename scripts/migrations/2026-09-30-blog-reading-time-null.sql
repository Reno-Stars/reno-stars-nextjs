-- Migration: 2026-09-30-blog-reading-time-null.sql
-- Table: blog_posts
-- Column: reading_time_minutes
-- Condition: is_published = true AND id IN ('1e30a9cb-5550-4ea5-8421-6e6f5dd176a5', '5cdb6396-e438-446c-8467-0a480b21472b') AND reading_time_minutes IS NULL
-- Status: NOT APPLIED — human run needed
UPDATE blog_posts
SET reading_time_minutes = 5
WHERE id = '1e30a9cb-5550-4ea5-8421-6e6f5dd176a5'
  AND is_published = true
  AND reading_time_minutes IS NULL;

UPDATE blog_posts
SET reading_time_minutes = 8
WHERE id = '5cdb6396-e438-446c-8467-0a480b21472b'
  AND is_published = true
  AND reading_time_minutes IS NULL;
