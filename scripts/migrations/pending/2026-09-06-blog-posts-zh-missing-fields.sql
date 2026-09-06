-- Migration: blog_posts — fill missing zh fields for two published posts
-- Date: 2026-09-06
-- Status: NOT APPLIED — needs human to run
-- Finding: 2 published posts (is_published=true) missing excerpt_zh, meta_title_zh,
--           focus_keyword_zh, AND meta_description_zh
-- Audit: all 4 missing zh columns confirmed via DB API (SELECT ... WHERE title_zh IS NULL
--         returns 0 rows — title_zh already filled; gap is only in secondary fields)
-- Idempotent: WHERE id = ... AND field IS NULL guards prevent double-write

-- ============================================================
-- Post 1: how-to-renovate-house-vancouver-first-timer-guide
-- title_zh already: "温哥华房屋装修完整步骤指南：首次装修必读的流程与清单"
-- excerpt_zh derived from title_zh + excerpt_en context
-- meta_description_zh derived from content_zh and title_zh
-- ============================================================

UPDATE blog_posts
SET excerpt_zh = '温哥华首次装修常低估工期、跳过许可检查、收到合同就签。本指南按顺序详解每个步骤，含2026年真实费用、BC省许可规则及聚星装修客户遵循的完整流程。'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND excerpt_zh IS NULL;

UPDATE blog_posts
SET meta_title_zh = '温哥华房屋装修完整步骤指南：首次装修必读 | 聚星装修'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND meta_title_zh IS NULL;

UPDATE blog_posts
SET meta_description_zh = '温哥华首次装修常低估工期、跳过许可检查、收到合同就签。聚星装修详解每个步骤，含2026年真实费用、BC省许可规则及完整流程。'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND meta_description_zh IS NULL;

UPDATE blog_posts
SET focus_keyword_zh = '温哥华房屋装修'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND focus_keyword_zh IS NULL;

-- ============================================================
-- Post 2: vancouver-property-type-renovation-2026
-- title_zh already: "温哥华独立屋、公寓、联排别墅装修有何不同（2026）"
-- excerpt_zh derived from content_zh (which already exists)
-- meta_description_zh derived from content_zh
-- ============================================================

UPDATE blog_posts
SET excerpt_zh = '独立屋、公寓、联排别墅装修有何不同？大温哥华2026年装修规则、成本、限制全解析，助您根据房产类型准确规划。'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND excerpt_zh IS NULL;

UPDATE blog_posts
SET meta_title_zh = '温哥华独立屋、公寓、联排别墅装修有何不同（2026）'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND meta_title_zh IS NULL;

UPDATE blog_posts
SET meta_description_zh = '独立屋、公寓、联排别墅装修有何不同？大温哥华2026年装修规则与成本全解析，助您按房产类型准确规划装修。'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND meta_description_zh IS NULL;

UPDATE blog_posts
SET focus_keyword_zh = '温哥华装修'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND focus_keyword_zh IS NULL;
