-- Migration: blog_posts meta_title + meta_description (EN + ZH)
-- Post: how-much-does-kitchen-renovation-cost-vancouver-2026
-- All four meta fields were NULL (confirmed via DB query 2026-08-23)
-- Supersedes: 2026-08-23-blog-meta-title-description-zh.sql (incomplete — EN fields also NULL)
-- NOT APPLIED — needs human to run
-- Source: title + excerpt from live DB query 2026-08-23

UPDATE blog_posts
SET
  meta_title_en = 'How Much Does a Kitchen Renovation Cost in Vancouver (2026) | Reno Stars',
  meta_title_zh = '温哥华厨房装修费用指南（2026年）| Reno Stars',
  meta_description_en = 'A typical full kitchen renovation in Metro Vancouver costs $30,000 to $72,000+. This guide covers all cost factors, price tiers, and budgeting tips for 2026.',
  meta_description_zh = '大温哥华地区典型全屋厨房装修费用在$30,000至$72,000+。本指南涵盖所有费用影响因素、价格区间和2026年预算规划建议。'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND is_published = true
  AND (
    meta_title_en IS NULL
    OR meta_title_zh IS NULL
    OR meta_description_en IS NULL
    OR meta_description_zh IS NULL
  );
