-- Migration: blog_posts meta fields — kitchen renovation cost guide (CONSOLIDATED)
-- Supersedes all 4 prior pending migrations for this post:
--   2026-08-23-blog-meta-desc-title-zh-kitchen-cost.sql
--   2026-08-23-blog-meta-title-description-zh-vancouver-kitchen-cost.sql
--   2026-08-23-blog-meta-title-description-en-kitchen-cost.sql
--   2026-08-23-blog-meta-title-description-zh.sql
-- Target: id fbfe62bc, slug: how-much-does-kitchen-renovation-cost-vancouver-2026
-- Post: https://www.reno-stars.com/en/blog/how-much-does-kitchen-renovation-cost-vancouver-2026
--
-- meta_title_en + meta_description_en: live page already correct; keep existing values.
--   DO NOT OVERWRITE — running this migration will not change en fields on this row
--   because the WHERE guard (meta_title_en IS NULL) prevents it.
--
-- meta_title_zh + meta_description_zh: pick best from 3 competing zh migrations.
--   meta_description_zh "大温哥华地区厨房装修费用完整指南…" is most descriptive;
--   it covers price factors, 2026 budget planning, and aligns with the article structure.
--   meta_title_zh includes brand name | 聚星装修 to match EN pattern.
--
-- NOT APPLIED — needs human to run after PR merge

UPDATE blog_posts
SET
  meta_title_zh         = '温哥华厨房装修费用指南（2026年）| 聚星装修',
  meta_description_zh   = '大温哥华地区厨房装修费用完整指南。了解2026年各规模工程的实际价格区间、影响费用的关键因素，以及温哥华装修的明智预算规划。'
WHERE
  is_published = true
  AND slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND (
    meta_title_zh IS NULL
    OR meta_title_zh = ''
    OR meta_description_zh IS NULL
    OR meta_description_zh = ''
  );
