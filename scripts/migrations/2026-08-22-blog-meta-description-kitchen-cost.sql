-- Migration: Set meta_description for blog post "How Much Does a Kitchen Renovation Cost in Vancouver (2026)"
-- Both meta_description_en and meta_description_zh are NULL in the DB.
-- NOT APPLIED — needs human to run:
--   pnpm db:query -f scripts/migrations/2026-08-22-blog-meta-description-kitchen-cost.sql
-- AFTER the infra PR gate clears and the migration is reviewed.

BEGIN;

-- Idempotent guard: only update if still NULL
UPDATE blog_posts
SET
  meta_description_en = 'Get accurate kitchen renovation costs in Vancouver for 2026. Learn about expenses, permits, and budgeting for your kitchen remodel project.',
  meta_description_zh = '获取温哥华2026年最新厨房装修费用信息。了解装修预算、施工费用及许可证申请要点。'
WHERE id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND (meta_description_en IS NULL OR meta_description_zh IS NULL);

COMMIT;
