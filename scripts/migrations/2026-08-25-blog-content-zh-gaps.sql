/**
 * Migration: Fill remaining Chinese translation gaps for 2 published blog posts.
 * Run: pnpm db:query -f scripts/migrations/2026-08-25-blog-content-zh-gaps.sql
 *
 * NOT APPLIED — needs human to run after PR review.
 *
 * Rows covered:
 *   1. pre-sale-renovation-white-rock-bc-2026  (excerpt_zh, seo_keywords_zh)
 *   2. outdoor-test-fkzh                      (meta_title_zh — draft, low priority)
 *
 * All UPDATEs are idempotent: guarded by IS NULL.
 */

BEGIN;

-- 1. Pre-Sale Renovation White Rock BC 2026: Coastal Market ROI Guide
--    excerpt_zh: translated from excerpt_en
UPDATE blog_posts
SET excerpt_zh = 'White Rock预售翻新ROI指南2026：Semiahmoo和Ocean Park卖家的首选项目。厨房、浴室和海岸线外观升级，在White Rock海滨市场上销售回报可达成本的150%-300%。'
WHERE slug = 'pre-sale-renovation-white-rock-bc-2026'
  AND excerpt_zh IS NULL;

--    seo_keywords_zh: translated from seo_keywords_en
UPDATE blog_posts
SET seo_keywords_zh = 'White Rock预售翻新,Home Staging翻新White Rock,预售前翻新White Rock,售前翻新White Rock,房地产翻新White Rock,房产价值翻新White Rock'
WHERE slug = 'pre-sale-renovation-white-rock-bc-2026'
  AND seo_keywords_zh IS NULL;

-- 2. outdoor-test-fkzh (draft post — low priority)
--    meta_title_zh: derived from title_zh
UPDATE blog_posts
SET meta_title_zh = '温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)'
WHERE slug = 'outdoor-test-fkzh'
  AND meta_title_zh IS NULL;

COMMIT;
