/**
 * Migration: Set seo_keywords_zh for 9 blog posts — batch 8.
 * Run: pnpm db:query -f scripts/migrations/2026-08-17-blog-seo-keywords-zh-batch8.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-17-blog-seo-keywords-zh-batch8.sql
 */

/* Batch 8: Metro Vancouver Renovation Cost Index monthly posts
   (Jul 2023–Jan 2024, Mar–Apr 2024 — 9 posts total).
   Feb 2024 (id 65648229) is in batch 7. */

UPDATE blog_posts SET seo_keywords_zh =
  '大温装修成本指数,温哥华装修价格,大温地区装修费用,2023温哥华装修成本,装修预算指南,Metro Vancouver renovation cost index,Vancouver renovation price,cost index 2023'
WHERE id = 'f1b954ac-113c-4822-9339-c3e73d7f6bb2'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '大温装修成本指数,温哥华装修价格,大温地区装修费用,2023温哥华装修成本,装修预算指南,Metro Vancouver renovation cost index,Vancouver renovation price,cost index August 2023'
WHERE id = '40e10be5-1568-4a56-ae7d-d3777fbd23ec'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '大温装修成本指数,温哥华装修价格,大温地区装修费用,2023温哥华装修成本,装修预算指南,Metro Vancouver renovation cost index,Vancouver renovation price,cost index September 2023'
WHERE id = '723a3acf-c8fc-47e1-9ca3-39c2ee2ac27b'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '大温装修成本指数,温哥华装修价格,大温地区装修费用,2023温哥华装修成本,装修预算指南,Metro Vancouver renovation cost index,Vancouver renovation price,cost index October 2023'
WHERE id = '38607570-c195-4733-a854-5fcfb9d6690e'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '大温装修成本指数,温哥华装修价格,大温地区装修费用,2023温哥华装修成本,装修预算指南,Metro Vancouver renovation cost index,Vancouver renovation price,cost index November 2023'
WHERE id = '55dbdb54-e9d7-405f-84f9-5e4a95d7a7bd'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '大温装修成本指数,温哥华装修价格,大温地区装修费用,2023温哥华装修成本,装修预算指南,Metro Vancouver renovation cost index,Vancouver renovation price,cost index December 2023'
WHERE id = '1a8fe47a-279c-4220-8578-fba56d2197ce'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '大温装修成本指数,温哥华装修价格,大温地区装修费用,2024温哥华装修成本,装修预算指南,Metro Vancouver renovation cost index,Vancouver renovation price,cost index January 2024'
WHERE id = '57676bbc-c454-41b3-89dd-d919eb611be7'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '大温装修成本指数,温哥华装修价格,大温地区装修费用,2024温哥华装修成本,装修预算指南,Metro Vancouver renovation cost index,Vancouver renovation price,cost index March 2024'
WHERE id = '18aaeeb9-d7c3-4959-9346-78da6ff19223'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '大温装修成本指数,温哥华装修价格,大温地区装修费用,2024温哥华装修成本,装修预算指南,Metro Vancouver renovation cost index,Vancouver renovation price,cost index April 2024'
WHERE id = '961d69a3-4b7b-488a-98a7-063e90b7e5a8'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);
