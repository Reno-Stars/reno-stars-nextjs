/**
 * Migration: Set excerpt_zh for blog post pre-sale-renovation-white-rock-bc-2026.
 *
 * The post has full Chinese content and meta_description_zh, but excerpt_zh is NULL.
 * This causes the zh blog page to emit BlogPosting + Article JSON-LD with an empty
 * `description` field — a schema completeness gap for AI search engines.
 *
 * Run: pnpm db:query -f scripts/migrations/2026-09-01-blog-excerpt-zh-white-rock.sql
 *
 * NOT APPLIED — needs human to run after PR review.
 */

BEGIN;

-- Pre-Sale Renovation White Rock BC 2026: Coastal Market ROI Guide
-- ID: 34e43ef8-6fde-4ef9-ac66-3f46f99b9df6
-- Slug: pre-sale-renovation-white-rock-bc-2026
-- Existing meta_description_zh: "预售翻新 White Rock BC 2026：沿海住宅的厨房和浴室投资回报率。南素里卖家指南。防潮材料。免费报价。"
UPDATE blog_posts
SET excerpt_zh = '怀特罗克预售翻新攻略2026：Semiahmoo和Ocean Park卖家的最高回报项目。厨房、浴室和海滨外观升级，回报率达150%-300%。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND (excerpt_zh IS NULL OR char_length(excerpt_zh) = 0);

COMMIT;
