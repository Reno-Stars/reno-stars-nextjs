-- Migration: 2026-09-02-blog-meta-title-description-zh-outdoor-test-posts.sql
-- Target: 10 blog_posts rows with NULL meta_title_zh, meta_description_zh, and/or focus_keyword_zh
-- These are all "outdoor-test-*" draft posts; populating their zh meta fields.
-- NOT APPLIED — needs human to run.
-- Idempotent: WHERE id IN (...) AND existing value IS NULL

-- meta_title_zh for posts missing it
UPDATE blog_posts
SET meta_title_zh = '溫哥華戶外生活空間裝修：露台、甲板和2026年許可完整指南'
WHERE id IN (
  'dd064abc-db01-4588-a7a7-9738872b2ea7',
  'fd509df0-d641-4154-96e2-345e7cc71add',
  '28386e2c-c726-41ce-95ac-e033e16d8027',
  '3c0f7540-7dd4-4404-a7c5-1bd8ec3b0966',
  '48656047-631c-4d86-afc9-722f3dfdda88',
  '6b86f73f-a05d-40a3-a456-5c7d73bf87bb',
  '5509a194-8509-4e6d-a201-ae271ab53bde',
  '6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8',
  '92ef3796-7d41-4d6c-bb09-520340f6d3b6',
  '081258dc-0351-4d9d-a3a0-e2cd2a424dd2'
)
AND nullif(trim(meta_title_zh), NULL) IS NULL;

-- meta_description_zh for posts missing it
UPDATE blog_posts
SET meta_description_zh = '探索溫哥華露台、甲板和戶外生活空間裝修的完整成本指南。了解2026年許可要求、材質選擇以及如何規劃您的戶外裝修項目。'
WHERE id IN (
  'dd064abc-db01-4588-a7a7-9738872b2ea7',
  '247e6fde-08dc-4285-b5c7-bbe236069047',
  'fd509df0-d641-4154-96e2-345e7cc71add',
  '28386e2c-c726-41ce-95ac-e033e16d8027',
  '3c0f7540-7dd4-4404-a7c5-1bd8ec3b0966',
  '48656047-631c-4d86-afc9-722f3dfdda88',
  '6b86f73f-a05d-40a3-a456-5c7d73bf87bb',
  '5509a194-8509-4e6d-a201-ae271ab53bde',
  '6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8',
  '92ef3796-7d41-4d6c-bb09-520340f6d3b6',
  '081258dc-0351-4d9d-a3a0-e2cd2a424dd2'
)
AND nullif(trim(meta_description_zh), NULL) IS NULL;

-- focus_keyword_zh for posts missing it (only those with an English focus_keyword already set)
UPDATE blog_posts
SET focus_keyword_zh = '溫哥華戶外生活空間裝修'
WHERE id IN (
  'dd064abc-db01-4588-a7a7-9738872b2ea7',
  'fd509df0-d641-4154-96e2-345e7cc71add',
  '28386e2c-c726-41ce-95ac-e033e16d8027',
  '3c0f7540-7dd4-4404-a7c5-1bd8ec3b0966',
  '48656047-631c-4d86-afc9-722f3dfdda88',
  '6b86f73f-a05d-40a3-a456-5c7d73bf87bb',
  '5509a194-8509-4e6d-a201-ae271ab53bde',
  '6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8',
  '92ef3796-7d41-4d6c-bb09-520340f6d3b6',
  '081258dc-0351-4d9d-a3a0-e2cd2a424dd2'
)
AND nullif(trim(focus_keyword_zh), NULL) IS NULL;
