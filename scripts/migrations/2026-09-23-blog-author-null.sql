-- Migration: NOT YET APPLIED — needs human run
-- Type:    UPDATE (idempotent)
-- Target:  blog_posts.is_published=true rows where author IS NULL
-- Human action required to apply.
-- Status:  NOT YET APPLIED to database.

-- Blog JSON-LD schema uses author field for schema:author.
-- 232 published posts have author=NULL, falling back to project reviewer names
-- in BlogPosting JSON-LD (e.g. "Alice L", "BGM Dance Studio") instead of "Reno Stars".
-- Sets a default author for published blog posts that have NULL author.
-- Idempotent: only updates rows WHERE author IS NULL or empty.
UPDATE blog_posts
SET author = 'Reno Stars',
    updated_at = NOW()
WHERE is_published
  AND (author IS NULL OR trim(author) = '');
