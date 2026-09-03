/**
 * Migration: Populate meta_description_zh, meta_title_zh, and focus_keyword_zh for 1 blog post.
 * Run: pnpm db:query -f scripts/migrations/2026-08-17-blog-meta-zh-vancouver-kitchen-cost.sql
 *
 * Row: how-much-does-kitchen-renovation-cost-vancouver-2026 (id: fbfe62bc-8887-44a0-a6a0-eef892a1e986)
 *   - meta_description_zh: derived from excerpt_zh (102 chars, within SEO 160-char limit)
 *   - meta_title_zh: derived from title_zh
 *   - focus_keyword_zh: translated from focus_keyword_en "kitchen renovation cost Vancouver"
 *
 * NOT APPLIED — needs human to run: pnpm db:query -f scripts/migrations/2026-08-17-blog-meta-zh-vancouver-kitchen-cost.sql
 */

UPDATE blog_posts
SET
  meta_description_zh = '大温哥华地区厨房装修费用指南（2026年）——典型全屋厨房装修 $30,000-$72,000，含价格区间、费用影响因素和预算规划建议。',
  meta_title_zh = '温哥华厨房装修费用指南（2026年）——典型费用 $30,000-$72,000',
  focus_keyword_zh = '温哥华厨房装修费用'
WHERE id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND (
    meta_description_zh IS NULL
    OR char_length(meta_description_zh) = 0
    OR meta_title_zh IS NULL
    OR char_length(meta_title_zh) = 0
    OR focus_keyword_zh IS NULL
    OR char_length(focus_keyword_zh) = 0
  );
