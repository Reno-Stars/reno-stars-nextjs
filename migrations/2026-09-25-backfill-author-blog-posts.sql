-- Migration: backfill_author_blog_posts
-- Description: Set author = 'Reno Stars Team' for all published posts where author IS NULL
-- Target: blog_posts
-- Issue: 243 published posts have NULL author; all authored posts use 'Reno Stars' or 'Reno Stars Team'

UPDATE blog_posts
SET author = 'Reno Stars Team'
WHERE is_published = true
  AND author IS NULL;

-- Verify
SELECT author, COUNT(id) AS post_count
FROM blog_posts
WHERE is_published = true
GROUP BY author
ORDER BY post_count DESC;
