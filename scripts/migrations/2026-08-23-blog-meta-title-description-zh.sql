-- Migration: blog_posts meta_title_zh + meta_description_zh
-- Scope: 1 published post with Chinese content but missing zh meta
-- NOT APPLIED — needs human to run
-- Post: how-much-does-kitchen-renovation-cost-vancouver-2026
-- Source: title_zh + Chinese content already present in DB

UPDATE blog_posts
SET
  meta_title_zh = '温哥华厨房装修费用指南（2026年）| Reno Stars',
  meta_description_zh = '大温哥华地区厨房装修费用在$15,000至$72,000+。了解最新价格区间、影响因素和2026年预算规划建议。'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND is_published = true
  AND (meta_title_zh IS NULL OR meta_description_zh IS NULL);
