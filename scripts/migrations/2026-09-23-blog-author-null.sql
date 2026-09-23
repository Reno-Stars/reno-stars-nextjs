-- Migration: NOT YET APPLIED — needs human run
-- Sets a default author for published blog posts that have NULL author.
-- The site UI already uses "Reno Stars" as the author when author is blank.
-- This migration is idempotent: only updates rows WHERE author IS NULL.

UPDATE blog_posts
SET author = 'Reno Stars'
WHERE is_published
  AND (author IS NULL OR trim(author) = '');
