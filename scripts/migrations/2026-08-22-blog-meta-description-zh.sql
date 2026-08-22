/**
 * Migration: Set meta_description_zh for the one real blog post missing it.
 * ID: fbfe62bc-8887-44a0-a6a0-eef892a1e986
 * Slug: how-much-does-kitchen-renovation-cost-vancouver-2026
 *
 * The 11 outdoor-test-* slugs (dd064abc, 247e6fde, 28386e2c, 3c0f7540,
 * 48656047, 5509a194, 6b86f73f, 6cdfba34, 92ef3796, fbfe62bc, fd509df0)
 * appear to be abandoned test posts — 10 of the 11 have no excerpt_zh either.
 * A separate task should decide whether to publish-fill or unpublish those rows.
 * This migration covers only the one real, indexable post.
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-22-blog-meta-description-zh.sql
 */

-- Kitchen Renovation Cost Vancouver 2026 (real post, indexed)
UPDATE blog_posts
SET meta_description_zh = '温哥华厨房翻新费用2026：预算级$1.5万–$2.7万，中档$2.8万–$3.8万，高端$4万以上。真实项目数据，免费报价。'
WHERE id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');
