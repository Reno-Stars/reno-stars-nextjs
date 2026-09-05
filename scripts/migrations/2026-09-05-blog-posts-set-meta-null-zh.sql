-- Migration: NOT APPLIED — needs human to run
--   pnpm db:query -f scripts/migrations/2026-09-05-blog-posts-set-meta-null-zh.sql
--
-- Fixes excerpt_zh, meta_title_zh, meta_description_zh for two published blog posts
-- whose Chinese content_zh is fully populated but metadata fields are NULL.
-- Also fixes title_zh for two published test posts that hold placeholder "Test ZH".
--
-- Target rows (excerpt/meta null, Chinese content present):
--   27dd8051-1198-4c2f-97f2-b058b9ba7247 — how-to-renovate-house-vancouver-first-timer-guide
--   625cdf1c-8733-470c-9198-f56de2a152c6 — vancouver-property-type-renovation-2026
--
-- Target rows (placeholder title_zh):
--   ae52f455-64eb-40fb-8f4a-7488902c53c3 — townhouse-renovation-strata-rules-vancouver-2026
--   76e1c252-b1ed-4268-89c5-20958dbb7cbd — test-rich-formatting-2026
--
-- Status: NOT APPLIED — needs human to run against production DB

BEGIN;

-- Post 1: How to Renovate Your House in Vancouver: First-Timer Guide
-- excerpt_zh derived from content_zh (CJK truncation-safe)
UPDATE blog_posts
SET excerpt_zh = '温哥华首次装修完整步骤指南：跳过许可检查、忽略时间线、签收第一份合同？这是常见错误。本指南按顺序覆盖每个步骤，包含2026年真实成本和BC省特定规则。'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts
SET meta_title_zh = '温哥华房屋装修完整步骤指南｜首次装修必读'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (meta_title_zh IS NULL OR meta_title_zh = '');

UPDATE blog_posts
SET meta_description_zh = '温哥华首次装修完整步骤指南：涵盖许可、预算、承建商选择和时间线。Reno Stars提供2026年BC省真实成本数据和必读清单。'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');

-- Post 2: House vs Condo vs Townhouse Renovation Vancouver 2026
UPDATE blog_posts
SET excerpt_zh = '温哥华独立屋、公寓、联排别墅装修有何不同？核心差异在 governance structure。Strata 审批可阻断装修，本指南详解三种房产类型的流程与成本差异。'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts
SET meta_title_zh = '温哥华独立屋vs公寓vs联排别墅装修差异｜2026指南'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (meta_title_zh IS NULL OR meta_title_zh = '');

UPDATE blog_posts
SET meta_description_zh = '温哥华独立屋、公寓、联排别墅装修有何不同？Strata审批、许可、成本差异一文详解，帮助业主根据房产类型准确规划2026年装修预算。'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');

-- Test post 1: replace placeholder title_zh
UPDATE blog_posts
SET title_zh = '温哥华联排别墅Strata装修规定完整指南（2026）'
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND title_zh = 'Test ZH';

-- Test post 2: replace placeholder title_zh
UPDATE blog_posts
SET title_zh = '2026年装修富文本格式测试'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND title_zh = 'Test ZH';

COMMIT;
