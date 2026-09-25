-- Migration: 2026-09-25-blog-posts-author-null.sql
-- Target: blog_posts.author
-- Count: 237 published posts with author IS NULL
-- Strategy: SET author = 'Reno Stars Team' WHERE is_published = true AND author IS NULL
-- Idempotent: re-running finds no NULLs, UPDATE touches 0 rows
-- Source: DB query 2026-09-25 (237 rows returned)

BEGIN;

UPDATE blog_posts
SET author = 'Reno Stars Team',
    updated_at = NOW()
WHERE is_published = true
  AND author IS NULL;

-- Verify
DO $$
BEGIN
    ASSERT (
        SELECT COUNT(*) FROM blog_posts
        WHERE is_published = true AND author IS NULL
    ) = 0,
    'Author NULL rows remain after UPDATE';
END $$;

COMMIT;
