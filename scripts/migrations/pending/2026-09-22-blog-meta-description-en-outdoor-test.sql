-- Migration: pending/2026-09-22-blog-meta-description-en-outdoor-test.sql
-- Date: 2026-09-22
-- Status: NOT APPLIED — requires human run via infra pipeline
-- Scope: 10 outdoor-test-* rows with NULL meta_description_en
-- Source: excerpt_en truncated to 155 chars (idempotent UPDATE)
-- Idempotent: WHERE meta_description_en IS NULL guard on every row

UPDATE blog_posts
SET meta_description_en = SUBSTRING(excerpt_en, 1, 155)
WHERE id = '5509a194-8509-4e6d-a201-ae271ab53bde'
  AND meta_description_en IS NULL;

UPDATE blog_posts
SET meta_description_en = SUBSTRING(excerpt_en, 1, 155)
WHERE id = '6b86f73f-a05d-40a3-a456-5c7d73bf87bb'
  AND meta_description_en IS NULL;

UPDATE blog_posts
SET meta_description_en = SUBSTRING(excerpt_en, 1, 155)
WHERE id = '6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8'
  AND meta_description_en IS NULL;

UPDATE blog_posts
SET meta_description_en = SUBSTRING(excerpt_en, 1, 155)
WHERE id = '28386e2c-c726-41ce-95ac-e033e16d8027'
  AND meta_description_en IS NULL;

UPDATE blog_posts
SET meta_description_en = SUBSTRING(excerpt_en, 1, 155)
WHERE id = '48656047-631c-4d86-afc9-722f3dfdda88'
  AND meta_description_en IS NULL;

UPDATE blog_posts
SET meta_description_en = SUBSTRING(excerpt_en, 1, 155)
WHERE id = '3c0f7540-7dd4-4404-a7c5-1bd8ec3b0966'
  AND meta_description_en IS NULL;

UPDATE blog_posts
SET meta_description_en = SUBSTRING(excerpt_en, 1, 155)
WHERE id = 'dd064abc-db01-4588-a7a7-9738872b2ea7'
  AND meta_description_en IS NULL;

UPDATE blog_posts
SET meta_description_en = SUBSTRING(excerpt_en, 1, 155)
WHERE id = '081258dc-0351-4d9d-a3a0-e2cd2a424dd2'
  AND meta_description_en IS NULL;

UPDATE blog_posts
SET meta_description_en = SUBSTRING(excerpt_en, 1, 155)
WHERE id = '92ef3796-7d41-4d6c-bb09-520340f6d3b6'
  AND meta_description_en IS NULL;

UPDATE blog_posts
SET meta_description_en = SUBSTRING(excerpt_en, 1, 155)
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND meta_description_en IS NULL;
