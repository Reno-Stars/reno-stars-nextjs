-- Migrate: Populate NULL author on published blog posts
-- Status: NOT APPLIED — needs human to run before merge
-- Scope: 148 published posts with author IS NULL (out of 363 total)
-- Entity: Reno Stars is the authoring entity — use company name
-- Idempotent: updates only rows where author IS NULL
UPDATE blog_posts
SET
  author = 'Reno Stars',
  updated_at = NOW()
WHERE is_published
  AND author IS NULL;
