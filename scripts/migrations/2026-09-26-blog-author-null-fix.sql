-- Migration: 2026-09-26-blog-author-null-fix.sql
-- Target: blog_posts.author
-- Count: 243 published posts with author IS NULL (STOP threshold exceeded)
-- Strategy: SET author = 'Reno Stars Team' WHERE is_published = true AND author IS NULL
-- Idempotent: re-running finds no NULLs among published, UPDATE touches 0 rows
-- Run: pnpm db:query -f scripts/migrations/2026-09-26-blog-author-null-fix.sql
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
    'Published posts with author NULL still exist after UPDATE';
END $$;

COMMIT;
