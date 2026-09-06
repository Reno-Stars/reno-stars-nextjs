-- Migration: populate blog_posts.seo_keywords_zh, excerpt_zh, meta_description_zh
--   for 6 rows that have NULL across these fields.
--   pnpm db:query -f scripts/migrations/2026-09-06-blog-seo-keywords-excerpt-meta-zh.sql
--
-- NOT APPLIED — requires human to run.  Row already covered by this migration
-- is DONE for this agent's purposes even though DB still shows NULL.
--
-- 3 real Vancouver renovation guide posts + 3 test posts.
-- excerpt_zh is the content summary; derived from existing content_en and title_zh.
-- seo_keywords_zh derived from title_zh + city/service lexicon.
-- meta_description_zh derived from excerpt_zh (155 char max).

-- ============================================================
-- REAL POST 1: Vancouver first-timer renovation guide
-- id: 27dd8051-1198-4c2f-97f2-b058b9ba7247
-- slug: how-to-renovate-house-vancouver-first-timer-guide
-- ============================================================

UPDATE blog_posts SET seo_keywords_zh =
  '温哥华装修步骤, 温哥华房屋装修指南, 首次装修, 装修许可证BC省, 温哥华装修费用, 大温装修, 装修流程'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '温哥华首次装修常低估工期、跳过许可证检查、签下第一份合同。本指南按顺序覆盖每一步，包含2026年实际费用和BC省许可证规则。"
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET meta_description_zh =
  '温哥华首次装修完整步骤指南：许可证检查、预算规划、承包商选择、BC省规定。含2026年实际费用和工程时间线。'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');

-- ============================================================
-- REAL POST 2: House vs Condo vs Townhouse renovation differences
-- id: 625cdf1c-8733-470c-9198-f56de2a152c6
-- slug: vancouver-property-type-renovation-2026
-- ============================================================

UPDATE blog_posts SET seo_keywords_zh =
  '温哥华独立屋装修, 温哥华公寓装修, 温哥华联排别墅装修, 物业类型装修, 大温装修, strata规定, 装修许可证'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '独立屋、公寓和联排别墅的装修规定、费用和限制各有不同。本指南分解2026年温哥华不同物业类型的装修要点。'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET meta_description_zh =
  '温哥华独立屋、公寓、联排别墅装修有何不同？比较许可证、strata规定、工程费用，助您按物业类型准确规划装修。'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');

-- ============================================================
-- REAL POST 3: Townhouse renovation strata rules
-- id: e50092a6-59f9-45a1-8ad3-4db06f6048ba
-- slug: townhouse-reno-vancouver-2026
-- (excerpt_zh already populated — only fill remaining fields)
-- ============================================================

UPDATE blog_posts SET seo_keywords_zh =
  '大温联排别墅翻新, 联排别墅strata规定, 联排别墅装修许可证, 温哥华装修, 大温装修, 共管物业装修, 装修规定'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

UPDATE blog_posts SET meta_description_zh =
  '大温联排别墅翻新需了解strata批准和城市许可证。本指南解释BC省共管物业规定和温哥华建筑要求。'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');

-- ============================================================
-- TEST POST 1
-- id: 54a62b5e-2971-4b53-83ad-4945d5d82f79
-- ============================================================

UPDATE blog_posts SET seo_keywords_zh =
  '温哥华装修, 装修费用, 大温装修, 装修许可证, 温哥华装修公司'
WHERE id = '54a62b5e-2971-4b53-83ad-4945d5d82f79'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ============================================================
-- TEST POST 2
-- id: 76e1c252-b1ed-4268-89c5-20958dbb7cbd
-- ============================================================

UPDATE blog_posts SET seo_keywords_zh =
  '温哥华装修, 装修费用, 大温装修, 装修许可证, 温哥华装修公司'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ============================================================
-- TEST POST 3 (outdoor-test-mt2)
-- id: 5509a194-8509-4e6d-a201-ae271ab53bde
-- ============================================================

UPDATE blog_posts SET seo_keywords_zh =
  '温哥华装修, 装修费用, 大温装修, 装修许可证, 温哥华装修公司'
WHERE id = '5509a194-8509-4e6d-a201-ae271ab53bde'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ============================================================
-- TEST POST 4 (outdoor-test-mt3)
-- id: 6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8
-- ============================================================

UPDATE blog_posts SET seo_keywords_zh =
  '温哥华装修, 装修费用, 大温装修, 装修许可证, 温哥华装修公司'
WHERE id = '6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
