-- Migration: blog_posts focus_keyword_zh — batch 3 (2026-08-24)
-- Status: NOT APPLIED — needs human to run
-- Scope: published posts with focus_keyword_zh IS NULL not covered by batch2
-- Batch2 URL list: https://github.com/Reno-Stars/reno-stars-nextjs/commit/… (2026-08-23 focus_keyword_zh batch2)
-- NOT covered by batch2 (confirmed by DB query 2026-08-24):
--   bathroom-renovation-coquitlam-bc-2026     (id: 3eb481fc-b867-4f6a-a1f2-a093ed048908)
--   kitchen-layout-planning-vancouver-2026      (id: 79dc1aa5-4fb6-4524-b78a-3eea035a7cd1)
--   kitchen-renovation-maple-ridge-bc-2026    (id: 66dbb605-dee3-42f0-99bb-20960a7185fd)
--   kitchen-renovation-port-coquitlam-bc-2026 (id: a117c618-208e-4c0c-a9cb-8754521e664e)
--   pre-sale-renovation-maple-ridge-bc-2026   (id: 6567c57b-8813-4894-b5b7-b69a51295d1a)
--   kitchen-lighting-design-vancouver-2026     (id: 8ca7f563-7ff3-4f3d-b9ae-8f9f38dc05b1)
--   delta-home-renovation-guide-2026         (id: fe6c5026-02df-4dd5-b21f-01ae46358656)
-- Run: pnpm db:query -f scripts/migrations/2026-08-24-blog-focus-keyword-zh-batch3.sql

UPDATE blog_posts
SET focus_keyword_zh = CASE slug
  WHEN 'bathroom-renovation-coquitlam-bc-2026'
    THEN '高贵林浴室装修'
  WHEN 'kitchen-layout-planning-vancouver-2026'
    THEN '温哥华厨房布局规划'
  WHEN 'kitchen-renovation-maple-ridge-bc-2026'
    THEN '枫树岭厨房装修'
  WHEN 'kitchen-renovation-port-coquitlam-bc-2026'
    THEN '高贵林港厨房装修'
  WHEN 'pre-sale-renovation-maple-ridge-bc-2026'
    THEN '枫树岭预售房屋装修 ROI'
  WHEN 'kitchen-lighting-design-vancouver-2026'
    THEN '温哥华厨房照明设计'
  WHEN 'delta-home-renovation-guide-2026'
    THEN 'Delta 房屋装修指南'
  ELSE focus_keyword_zh
END
WHERE
  is_published = true
  AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '')
  AND slug IN (
    'bathroom-renovation-coquitlam-bc-2026',
    'kitchen-layout-planning-vancouver-2026',
    'kitchen-renovation-maple-ridge-bc-2026',
    'kitchen-renovation-port-coquitlam-bc-2026',
    'pre-sale-renovation-maple-ridge-bc-2026',
    'kitchen-lighting-design-vancouver-2026',
    'delta-home-renovation-guide-2026'
  );
