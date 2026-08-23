-- Migration: NOT APPLIED — needs human to run
-- Adds meta_description_zh and meta_title_zh to the kitchen renovation cost guide
-- which already has genuine title_zh and content_zh (Chinese content confirmed this run)
UPDATE blog_posts
SET
  meta_title_zh   = '温哥华厨房装修费用指南（2026年）',
  meta_description_zh = '大温哥华地区全屋厨房装修费用 $15,000 至 $72,000+，局部翻新起价 $10,000，豪华定制可达 $150,000+。含2026年最新价格区间、许可要求及预算规划建议。'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');
