-- Migration: 2026-09-06-blog-excerpt-zh-backfill
-- Target: blog_posts rows missing excerpt_zh
-- Status: NOT APPLIED — needs human to run
-- Rows covered by this migration:
--   27dd8051-1198-4c2f-97f2-b058b9ba7247 (how-to-renovate-house-vancouver-first-timer-guide)
--   625cdf1c-8733-470c-9198-f56de2a152c6 (vancouver-property-type-renovation-2026)

UPDATE blog_posts
SET excerpt_zh = '温哥华首次装修者常常低估工期、跳过许可证核查、签下第一份合同。本指南覆盖每个步骤。'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts
SET excerpt_zh = '温哥华2026年独立屋、公寓和联排别墅装修完整对比：许可证流程、物业管理规定、装修成本和施工时间的差异。'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
