-- Migration: 2026-09-30-blog-meta-title-en-published.sql
-- Target:  blog_posts.is_published=true, meta_title_en IS NULL
-- Fix:     derive meta_title_en from title_en with hard truncation (≤70 chars varchar)
-- Status:  NOT APPLIED — needs human to run before it takes effect
--
-- Verify before applying:
--   SELECT id, slug, title_en, meta_title_en
--   FROM blog_posts
--   WHERE id IN (
--     '27dd8051-1198-4c2f-97f2-b058b9ba7247',
--     '625cdf1c-8733-470c-9198-f56de2a152c6'
--   );

UPDATE blog_posts
SET meta_title_en = LEFT(title_en, 70)
WHERE id IN (
  '27dd8051-1198-4c2f-97f2-b058b9ba7247',
  '625cdf1c-8733-470c-9198-f56de2a152c6'
)
AND is_published = true
AND (meta_title_en IS NULL OR meta_title_en = '');

-- Verify after applying:
--   SELECT id, slug, title_en, meta_title_en, CHAR_LENGTH(meta_title_en) AS len
--   FROM blog_posts
--   WHERE id IN (
--     '27dd8051-1198-4c2f-97f2-b058b9ba7247',
--     '625cdf1c-8733-470c-9198-f56de2a152c6'
--   );
