/**
 * Migration: Set excerpt_zh for pre-sale-renovation-white-rock blog post.
 * Run: pnpm db:query -f scripts/migrations/2026-08-28-blog-excerpt-zh-white-rock-pre-sale.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-28-blog-excerpt-zh-white-rock-pre-sale.sql
 */

-- Pre-Sale Renovation White Rock BC 2026
UPDATE blog_posts SET excerpt_zh = '怀特罗克预售翻新投资回报指南2026：面向Semiahmoo和Ocean Park卖家的顶级装修项目。厨房、浴室和海滨路缘吸引力升级，在白石海滩市场的销售中可带来150%至300%的成本回报。' WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6' AND (excerpt_zh IS NULL OR excerpt_zh = '');
