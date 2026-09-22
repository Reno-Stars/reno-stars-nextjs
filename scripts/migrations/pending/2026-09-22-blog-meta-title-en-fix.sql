-- Migration: pending/2026-09-22-blog-meta-title-en-fix.sql
-- Date: 2026-09-22
-- Status: NOT APPLIED — requires human run via infra pipeline
-- Scope: 7 rows with NULL meta_title_en; 2 real posts + 5 outdoor-test-*
-- Outdoor-test-* slugs: use title_en truncated to 70
-- Real posts: use title_en truncated to 70 (suffix: 2026 where it fits)

UPDATE blog_posts
SET meta_title_en = SUBSTRING(title_en, 1, 70)
WHERE id = '28386e2c-c726-41ce-95ac-e033e16d8027'
  AND meta_title_en IS NULL;

UPDATE blog_posts
SET meta_title_en = SUBSTRING(title_en, 1, 70)
WHERE id = '3c0f7540-7dd4-4404-a7c5-1bd8ec3b0966'
  AND meta_title_en IS NULL;

UPDATE blog_posts
SET meta_title_en = SUBSTRING(title_en, 1, 70)
WHERE id = 'dd064abc-db01-4588-a7a7-9738872b2ea7'
  AND meta_title_en IS NULL;

UPDATE blog_posts
SET meta_title_en = SUBSTRING(title_en, 1, 70)
WHERE id = 'fd509df0-d641-4154-96e2-345e7cc71add'
  AND meta_title_en IS NULL;

UPDATE blog_posts
SET meta_title_en = SUBSTRING(title_en, 1, 70)
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND meta_title_en IS NULL;

-- Real post: title_en 75 chars -> truncate
UPDATE blog_posts
SET meta_title_en = 'How to Renovate Your House in Vancouver: First-Timer Guide 2026'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND meta_title_en IS NULL;

-- Real post: title_en 77 chars -> truncate
UPDATE blog_posts
SET meta_title_en = 'House vs Condo vs Townhouse Renovation in Vancouver: What Differs'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND meta_title_en IS NULL;
