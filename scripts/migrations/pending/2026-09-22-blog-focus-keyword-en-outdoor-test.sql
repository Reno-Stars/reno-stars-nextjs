-- Migration: pending/2026-09-22-blog-focus-keyword-en-outdoor-test.sql
-- Date: 2026-09-22
-- Status: NOT APPLIED — requires human run via infra pipeline
-- Scope: 9 outdoor-test-* rows with NULL focus_keyword_en
-- Value: 'outdoor renovation Vancouver 2026' — all rows have same title

UPDATE blog_posts
SET focus_keyword_en = 'outdoor renovation Vancouver 2026'
WHERE id = '5509a194-8509-4e6d-a201-ae271ab53bde'
  AND focus_keyword_en IS NULL;

UPDATE blog_posts
SET focus_keyword_en = 'outdoor renovation Vancouver 2026'
WHERE id = '6b86f73f-a05d-40a3-a456-5c7d73bf87bb'
  AND focus_keyword_en IS NULL;

UPDATE blog_posts
SET focus_keyword_en = 'outdoor renovation Vancouver 2026'
WHERE id = '6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8'
  AND focus_keyword_en IS NULL;

UPDATE blog_posts
SET focus_keyword_en = 'outdoor renovation Vancouver 2026'
WHERE id = '48656047-631c-4d86-afc9-722f3dfdda88'
  AND focus_keyword_en IS NULL;

UPDATE blog_posts
SET focus_keyword_en = 'outdoor renovation Vancouver 2026'
WHERE id = 'dd064abc-db01-4588-a7a7-9738872b2ea7'
  AND focus_keyword_en IS NULL;

UPDATE blog_posts
SET focus_keyword_en = 'outdoor renovation Vancouver 2026'
WHERE id = '081258dc-0351-4d9d-a3a0-e2cd2a424dd2'
  AND focus_keyword_en IS NULL;

UPDATE blog_posts
SET focus_keyword_en = 'outdoor renovation Vancouver 2026'
WHERE id = 'fd509df0-d641-4154-96e2-345e7cc71add'
  AND focus_keyword_en IS NULL;

UPDATE blog_posts
SET focus_keyword_en = 'outdoor renovation Vancouver 2026'
WHERE id = '92ef3796-7d41-4d6c-bb09-520340f6d3b6'
  AND focus_keyword_en IS NULL;

UPDATE blog_posts
SET focus_keyword_en = 'outdoor renovation Vancouver 2026'
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND focus_keyword_en IS NULL;
