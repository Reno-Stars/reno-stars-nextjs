/**
 * Migration: Set excerpt_zh for pre-sale-renovation-white-rock-bc-2026
 * Run: pnpm db:query -f scripts/migrations/2026-08-27-blog-excerpt-zh-white-rock.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-27-blog-excerpt-zh-white-rock.sql
 *
 * Context: pre-sale-renovation-* series covered excerpt_en on 2026-08-24.
 * White Rock was the last remaining excerpt_zh gap (1 row).
 * Content exists in content_zh; only excerpt_zh was missing.
 */

UPDATE blog_posts SET excerpt_zh = '白石海滨市场卖家必读：厨房、浴室和海岸线提升项目，回报率达销售价格的150–300%。'
WHERE slug = 'pre-sale-renovation-white-rock-bc-2026'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
