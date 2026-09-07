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
