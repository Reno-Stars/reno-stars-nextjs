-- Migration: set author for published blog_posts where author IS NULL
-- 149 posts have NULL author (DB read 2026-09-21)
-- This sets them to 'Reno Stars Team' as the company-author default.
-- Human reviewer: confirm 'Reno Stars Team' is the correct author identity.
--
-- NOT APPLIED — needs human review before running.
-- Idempotent WHERE guard: only updates rows where author IS NULL.

BEGIN;

UPDATE blog_posts
SET
  author        = 'Reno Stars Team',
  author_en     = COALESCE(author_en, 'Reno Stars Team'),
  updated_at    = NOW()
WHERE
  is_published
  AND author IS NULL
  AND author_en IS NULL;

-- Rollback (run this instead of COMMIT if you want to undo):
-- ROLLBACK;

COMMIT;
