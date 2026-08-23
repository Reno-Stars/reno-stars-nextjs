-- Migration: blog_posts meta_title_zh + meta_description_zh for how-much-does-kitchen-renovation-cost-vancouver-2026
-- Post: https://www.reno-stars.com/en/blog/how-much-does-kitchen-renovation-cost-vancouver-2026
-- Title: "温哥华厨房装修费用指南（2026年）" (already has title_zh and content_zh — this fills the missing meta fields)
-- NOT APPLIED — needs human to run

UPDATE blog_posts
SET
  meta_title_zh = '温哥华厨房装修费用指南（2026年）| 聚星装修',
  meta_description_zh = '大温哥华地区厨房装修费用完整指南。了解2026年各规模工程的实际价格区间、影响费用的关键因素，以及温哥华装修的明智预算规划。'
WHERE
  is_published = true
  AND slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND (
    meta_title_zh IS NULL
    OR meta_title_zh = ''
    OR meta_description_zh IS NULL
    OR meta_description_zh = ''
  );
