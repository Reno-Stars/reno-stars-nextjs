-- Unpublish test placeholder posts: title_zh = 'Test ZH' is not real Chinese content
-- NOT APPLIED — requires human to run against the live database
-- Idempotent: only affects rows where title_zh = 'Test ZH' AND slug ~ 'test|placeholder'
UPDATE blog_posts
SET is_published = false, updated_at = NOW()
WHERE title_zh = 'Test ZH'
  AND slug ~ '(^test-|test-|-test$)';
