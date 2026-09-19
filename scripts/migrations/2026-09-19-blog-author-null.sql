-- Migration: backfill NULL author for published blog posts
-- NOT APPLIED — needs human review
-- Target: 159 posts with author IS NULL (as of 2026-09-19)
-- Default author: 'Reno Stars Team'

UPDATE blog_posts
SET author = 'Reno Stars Team'
WHERE is_published
  AND author IS NULL;
