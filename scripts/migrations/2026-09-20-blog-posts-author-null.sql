-- Migration: NOT APPLIED — needs human to run
-- 2026-09-20 blog_posts.author NULL fill for published posts
-- Source: DB query — 160 published posts have author = NULL
-- Existing author values: 'Reno Stars Team' (92 rows), 'Reno Stars' (123 rows)
-- idempotent WHERE guard ensures no double-write

BEGIN;

UPDATE blog_posts
SET author = 'Reno Stars Team'
WHERE is_published = true
  AND author IS NULL;

COMMIT;
