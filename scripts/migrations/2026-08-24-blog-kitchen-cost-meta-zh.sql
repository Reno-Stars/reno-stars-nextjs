/**
 * Migration: Set meta_title_zh and meta_description_zh for
 *   blog post: how-much-does-kitchen-renovation-cost-vancouver-2026
 * The only published post missing both zh meta fields.
 * NOT APPLIED — needs human to run:
 *   pnpm db:query -f scripts/migrations/2026-08-24-blog-kitchen-cost-meta-zh.sql
 */

UPDATE blog_posts
SET
  meta_title_zh   = '温哥华厨房装修费用指南（2026年）| 聚星装修',
  meta_description_zh = '温哥华厨房装修费用指南。了解2026年Metro Vancouver各档次厨房翻新实际成本，含设计费、许可证、材料和人工明细。'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND (meta_title_zh IS NULL OR meta_description_zh IS NULL);
