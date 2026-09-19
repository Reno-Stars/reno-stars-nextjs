-- Migration: blog_posts — excerpt_zh truncated content on unpublished test posts
-- Date: 2026-09-19
-- Status: NOT APPLIED — needs human to run against production DB
-- Table: blog_posts
-- Column: excerpt_zh (varchar 155 hard limit)
-- Issue: 7 unpublished test posts have very short excerpt_zh (2–19 chars).
--         These are test/draft posts not live, but the field values are
--         placeholders that should be cleaned before any future publish.
--
-- VERIFY (run against live DB):
--   SELECT id, slug, excerpt_zh, LENGTH(excerpt_zh) as len FROM blog_posts
--   WHERE id IN (
--     '42d3bcb6-a997-4259-b44d-cbcbbc214b57',
--     'ea66766b-c230-4cb4-9fd8-8fb86e7bdb2f',
--     'ae52f455-64eb-40fb-8f4a-7488902c53c3',
--     '71c9b551-2fd2-4bba-968e-3a7c9b0200f6',
--     '5d0c7200-3e8f-474a-9d80-d5fcf90a6f8b',
--     '7278c82a-85f6-460d-a2da-e8244d22ad97',
--     '011a6d63-0121-4f6b-a536-43c247e18f06'
--   );
--
-- FINDINGS (2026-09-19) — all 7 have is_published = false:
--   42d3bcb6  test-minimal-vancouver                    excerpt_zh = '测试摘要'       (4 chars)
--   ea66766b  vancouver-reno-kitchen-bathroom-2026-final  excerpt_zh = '测试'          (2 chars)
--   ae52f455  townhouse-renovation-strata-rules-...       excerpt_zh = '使用格式正确的内容测试博客API发布。' (19 chars)
--   71c9b551  vancouver-reno-kitchen-or-bathroom-2026-test2 excerpt_zh = '温哥华装修对比' (7 chars)
--   5d0c7200  adu-vancouver-2026-cost-guide              excerpt_zh = '温哥华ADU成本2026' (12 chars)
--   7278c82a  test-simple-post-2026                      excerpt_zh = '测试摘要。'      (5 chars)
--   011a6d63  vancouver-reno-kitchen-or-bathroom-2026-test excerpt_zh = '温哥华装修对比' (7 chars)
--
-- FIX — Idempotent WHERE guards prevent double-write if re-run after human applies:
UPDATE blog_posts
SET excerpt_zh = CASE id
  WHEN '42d3bcb6-a997-4259-b44d-cbcbbc214b57'
    THEN '温哥华装修测试项目，验证内容发布流程。'
  WHEN 'ea66766b-c230-4cb4-9fd8-8fb86e7bdb2f'
    THEN '温哥华装修测试项目，验证内容发布流程。'
  WHEN 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
    THEN '温哥华联排别墅物业规定装修完全指南：共管规则、许可申请、费用估算与施工注意事项。'
  WHEN '71c9b551-2fd2-4bba-968e-3a7c9b0200f6'
    THEN '温哥华厨房与浴室装修对比：费用、工期、注意事项全面分析。'
  WHEN '5d0c7200-3e8f-474a-9d80-d5fcf90a6f8b'
    THEN '温哥华ADU成本指南2026：独立住宅单元装修费用、许可与价值分析。'
  WHEN '7278c82a-85f6-460d-a2da-e8244d22ad97'
    THEN '温哥华装修测试项目，验证内容发布流程。'
  WHEN '011a6d63-0121-4f6b-a536-43c247e18f06'
    THEN '温哥华厨房与浴室装修对比：费用、工期、注意事项全面分析。'
  ELSE excerpt_zh
END
WHERE id IN (
  '42d3bcb6-a997-4259-b44d-cbcbbc214b57',
  'ea66766b-c230-4cb4-9fd8-8fb86e7bdb2f',
  'ae52f455-64eb-40fb-8f4a-7488902c53c3',
  '71c9b551-2fd2-4bba-968e-3a7c9b0200f6',
  '5d0c7200-3e8f-474a-9d80-d5fcf90a6f8b',
  '7278c82a-85f6-460d-a2da-e8244d22ad97',
  '011a6d63-0121-4f6b-a536-43c247e18f06'
)
  AND LENGTH(excerpt_zh) < 20;
--
-- NOT APPLIED — needs human review before execution.
