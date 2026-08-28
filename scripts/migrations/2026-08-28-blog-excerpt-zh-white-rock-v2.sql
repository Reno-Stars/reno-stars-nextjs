/**
 * Migration: Set excerpt_zh for pre-sale-renovation-white-rock-bc-2026
 * Run: pnpm db:query -f scripts/migrations/2026-08-28-blog-excerpt-zh-white-rock-v2.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-28-blog-excerpt-zh-white-rock-v2.sql
 *
 * Gap: pre-sale-renovation-white-rock-bc-2026 has focus_keyword_zh and
 * meta_description_zh set (added by prior migrations) but excerpt_zh is still NULL.
 * Content exists in content_zh; only excerpt_zh was missing.
 */

UPDATE blog_posts SET excerpt_zh = '白石海滨市场卖家必读：厨房、浴室和海岸线提升项目，回报率达销售价格的150–300%。'
WHERE slug = 'pre-sale-renovation-white-rock-bc-2026'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
