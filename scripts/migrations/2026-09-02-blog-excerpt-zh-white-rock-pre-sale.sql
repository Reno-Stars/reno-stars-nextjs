-- Migration: Set excerpt_zh for blog post 34e43ef8
-- Pre-Sale Renovation White Rock BC 2026: Coastal Market ROI Guide
-- Row confirmed: SELECT id, slug, title_en, excerpt_en FROM blog_posts WHERE id = '34e43ef8'
-- NOT covered by 2026-08-16-blog-excerpt-zh-batch1.sql (covers 15 different posts)
-- NOT APPLIED — needs human to run
UPDATE blog_posts
SET excerpt_zh =
  '白石海滨房产预售价装修指南：如何在Semiahmoo和Ocean Park市场通过厨房、浴室和外观升级实现150–300%的投资回报率。专业装修团队，助您快速成交。'
WHERE id = '34e43ef8'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
