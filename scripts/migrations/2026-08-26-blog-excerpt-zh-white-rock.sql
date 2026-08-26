/**
 * Migration: Set excerpt_zh for blog post pre-sale-renovation-white-rock-bc-2026.
 * Run: pnpm db:query -f scripts/migrations/2026-08-26-blog-excerpt-zh-white-rock.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-26-blog-excerpt-zh-white-rock.sql
 *
 * Row already covered: none (grep confirmed no prior migration targets this id).
 */

UPDATE blog_posts
SET excerpt_zh = '2026年怀特罗克White Rock预售房屋翻新完全指南。涵盖海滨市场ROI分析、装修前估值提升策略、白石及南素里预售房翻新成本预算，帮助业主和投资者在上市前最大化房产价值。'
WHERE slug = 'pre-sale-renovation-white-rock-bc-2026'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
