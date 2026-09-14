-- 2026-09-13: blog_posts focus_keyword_zh backfill for outdoor-test-* posts
-- NOT APPLIED — needs human to run before insert/unpublish
-- These unpublished test posts have real Chinese content (title_zh, excerpt_zh) but
-- focus_keyword_zh was never set. The Chinese title is:
-- "温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)"
-- Pattern from existing focus_keyword_zh: "城市 英文名 年份" e.g. "温哥华公寓楼翻新"

UPDATE blog_posts
SET focus_keyword_zh = '温哥华户外空间装修露台甲板后院2026'
WHERE id = '48656047-631c-4d86-afc9-722f3dfdda88'
  AND focus_keyword_zh IS NULL  -- idempotent guard
;

UPDATE blog_posts
SET focus_keyword_zh = '温哥华户外空间装修露台甲板后院2026'
WHERE id = '28386e2c-c726-41ce-95ac-e033e16d8027'
  AND focus_keyword_zh IS NULL
;

UPDATE blog_posts
SET focus_keyword_zh = '温哥华户外空间装修露台甲板后院2026'
WHERE id = '3c0f7540-7dd4-4404-a7c5-1bd8ec3b0966'
  AND focus_keyword_zh IS NULL
;

UPDATE blog_posts
SET focus_keyword_zh = '温哥华户外空间装修露台甲板后院2026'
WHERE id = 'dd064abc-db01-4588-a7a7-9738872b2ea7'
  AND focus_keyword_zh IS NULL
;

UPDATE blog_posts
SET focus_keyword_zh = '温哥华户外空间装修露台甲板后院2026'
WHERE id = '081258dc-0351-4d9d-a3a0-e2cd2a424dd2'
  AND focus_keyword_zh IS NULL
;

UPDATE blog_posts
SET focus_keyword_zh = '温哥华户外空间装修露台甲板后院2026'
WHERE id = 'fd509df0-d641-4154-96e2-345e7cc71add'
  AND focus_keyword_zh IS NULL
;

UPDATE blog_posts
SET focus_keyword_zh = '温哥华户外空间装修露台甲板后院2026'
WHERE id = '6b86f73f-a05d-40a3-a456-5c7d73bf87bb'
  AND focus_keyword_zh IS NULL
;

UPDATE blog_posts
SET focus_keyword_zh = '温哥华户外空间装修露台甲板后院2026'
WHERE id = '5509a194-8509-4e6d-a201-ae271ab53bde'
  AND focus_keyword_zh IS NULL
;

UPDATE blog_posts
SET focus_keyword_zh = '温哥华户外空间装修露台甲板后院2026'
WHERE id = '6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8'
  AND focus_keyword_zh IS NULL
;

UPDATE blog_posts
SET focus_keyword_zh = '温哥华户外空间装修露台甲板后院2026'
WHERE id = '92ef3796-7d41-4d6c-bb09-520340f6d3b6'
  AND focus_keyword_zh IS NULL
;

UPDATE blog_posts
SET focus_keyword_zh = '温哥华户外空间装修露台甲板后院2026'
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND focus_keyword_zh IS NULL
;
