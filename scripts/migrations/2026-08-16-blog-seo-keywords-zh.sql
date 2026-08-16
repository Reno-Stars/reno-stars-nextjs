/**
 * Migration: Set seo_keywords_zh for top 10 blog posts (city guide + renovation guide pages).
 * Run: pnpm db:query -f scripts/migrations/2026-08-16-blog-seo-keywords-zh.sql
 *
 * 142 published blog posts are missing seo_keywords_zh.
 * This migration addresses the 10 highest-priority city/neighbourhood guide posts.
 * All UPDATEs are idempotent: guarded by WHERE seo_keywords_zh IS NULL OR seo_keywords_zh = ''.
 *
 * NOTE: This migration is NOT YET APPLIED. Human must run it after reviewing.
 */

BEGIN;

-- 1. Renovate vs Move Vancouver 2026
UPDATE blog_posts
SET seo_keywords_zh = '温哥华装修还是搬家,温哥华2026房市,温哥华装修费用,温哥华买房vs装修,房屋翻新成本温哥华,温哥华房产市场'
WHERE slug = 'renovate-vs-move-vancouver-2026'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- 2. How Much Does a Kitchen Renovation Cost Vancouver 2026
UPDATE blog_posts
SET seo_keywords_zh = '温哥华厨房装修费用,温哥华厨房翻新价格,温哥华厨房装修多少钱,温哥华厨房改造费用,温哥华橱柜更换价格'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- 3. Kitchen Refresh Without Full Renovation Vancouver 2026
UPDATE blog_posts
SET seo_keywords_zh = '温哥华厨房局部翻新,温哥华厨房改造,温哥华厨房升级,温哥华厨房刷新费用,温哥华小厨房装修'
WHERE slug = 'kitchen-refresh-without-full-renovation-vancouver-2026'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- 4. Burnaby Home Renovation Guide 2026
UPDATE blog_posts
SET seo_keywords_zh = '本拿比装修,本拿比翻新费用,本拿比厨房装修,本拿比浴室翻新,本拿比地下室装修,本拿比装修许可证,本拿比社区指南,Metrotown装修'
WHERE slug = 'burnaby-home-renovation-guide-2026'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- 5. Bathroom Renovation Coquitlam 2026
UPDATE blog_posts
SET seo_keywords_zh = '高贵林浴室装修,高贵林浴室翻新费用,高贵林卫生间改造,高贵林浴室翻新价格,Coquitlam浴室装修'
WHERE slug = 'bathroom-renovation-coquitlam-bc-2026'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- 6. Kitchen Layout Planning Vancouver 2026
UPDATE blog_posts
SET seo_keywords_zh = '温哥华厨房布局,温哥华厨房设计,温哥华厨房规划,厨房布局类型费用,温哥华厨房岛台费用'
WHERE slug = 'kitchen-layout-planning-vancouver-2026'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- 7. North Vancouver Home Renovation Guide 2026
UPDATE blog_posts
SET seo_keywords_zh = '北温哥华装修,北温翻新费用,北温厨房装修,北温浴室翻新,北温地下室装修,北温许可证,北温社区指南,北岸装修'
WHERE slug = 'north-vancouver-home-renovation-guide-2026'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- 8. Kitchen Renovation Maple Ridge 2026
UPDATE blog_posts
SET seo_keywords_zh = '枫树岭厨房装修,枫树岭厨房翻新费用,Maple Ridge厨房改造,枫树岭厨房价格'
WHERE slug = 'kitchen-renovation-maple-ridge-bc-2026'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- 9. Coquitlam Home Renovation Guide 2026
UPDATE blog_posts
SET seo_keywords_zh = '高贵林装修,高贵林翻新费用,高贵林厨房装修,高贵林浴室翻新,高贵林地下室装修,高贵林许可证,高贵林社区,伯克山装修'
WHERE slug = 'coquitlam-home-renovation-guide-2026'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- 10. Bathroom Renovation Cost Richmond BC 2026
UPDATE blog_posts
SET seo_keywords_zh = '列治文浴室装修费用,列治文浴室翻新价格,列治文卫生间改造成本,列治文浴室装修多少钱,列治文浴室翻新报价'
WHERE slug = 'bathroom-renovation-cost-richmond-bc-2026'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

COMMIT;
