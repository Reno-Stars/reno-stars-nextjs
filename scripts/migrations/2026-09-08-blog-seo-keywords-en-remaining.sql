-- Migration: populate seo_keywords_en for two published posts that pre-date the
-- seo_keywords_en gate (#361) and were never covered by a prior migration.
--
-- Post 1: townhouse-reno-vancouver-2026 (e50092a6-59f9-45a1-8ad3-4db06f6048ba)
--   Focus: BC strata rules, strata approval process, townhouse renovation permits
--   Cities: Burnaby, Richmond, Langley, Coquitlam, Delta, Surrey, Vancouver
--
-- Post 2: metro-vancouver-renovation-cost-index-november-2023 (55dbdb54-e9d7-405f-84f9-5e4a95d7a7bd)
--   Focus: Metro Vancouver renovation cost data, cost index, contractor quotes
--
-- NOT APPLIED — run manually after review:
--   pnpm db:query -f scripts/migrations/2026-09-08-blog-seo-keywords-en-remaining.sql
--
UPDATE blog_posts SET
  seo_keywords_en = 'townhouse renovation Metro Vancouver,BC strata renovation permit,strata approval Vancouver,strata Form B,townhouse renovation costs Vancouver,strata property act BC,renovating townhouse in BC'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts SET
  seo_keywords_en = 'Metro Vancouver renovation cost,renovation cost index Vancouver,Vancouver renovation price,renovation quote Vancouver,renovation budget Vancouver,BC renovation cost 2023'
WHERE id = '55dbdb54-e9d7-405f-84f9-5e4a95d7a7bd'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- 3 remaining real posts (test posts 54a62b5e and 76e1c252 have been excluded)
-- Post: how-to-renovatehouse-vancouver-first-timer-guide (27dd8051)
--   Focus: first house renovation in Vancouver, step-by-step, contractor, permits, budget
UPDATE blog_posts SET
  seo_keywords_en = 'how to renovate house Vancouver,first home renovation Vancouver,renovation step by step Vancouver,renovation guide Vancouver,renovation contractor Vancouver,Vancouver renovation permit'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- Post: townhouse-renovation-strata-rules-vancouver-2026 (ae52f455) — also needs zh
--   Focus: BC strata renovation rules, strata approval, Form B, renovation permits
UPDATE blog_posts SET
  seo_keywords_en = 'BC strata renovation rules Vancouver,townhouse renovation strata approval,strata Form B Vancouver,townhouse renovation permit BC,Vancouver strata property act',
  seo_keywords_zh = 'BC 分层装修规定温哥华,城市屋装修分层审批,温哥华分层表格B,城市屋装修许可证BC,温哥华分层物业法'
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- Post: vancouver-property-type-renovation-2026 (625cdf1c) — also needs zh
--   Focus: house vs condo vs townhouse renovation differences, costs, permits
UPDATE blog_posts SET
  seo_keywords_en = 'house vs condo renovation Vancouver,townhouse renovation cost Vancouver,renovation differences house condo townhouse Vancouver,property type renovation Vancouver 2026,Vancouver house renovation vs condo',
  seo_keywords_zh = '温哥华房屋vs公寓装修,城市屋装修费用温哥华,房屋公寓城市屋装修差异温哥华,2026温哥华物业类型装修,Vancouver房屋装修与公寓装修对比'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
