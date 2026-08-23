-- Migration: blog_posts focus_keyword_zh — batch 2 (2026-08-23)
-- Scope: 2 city-guide posts with Chinese titles but missing focus_keyword_zh
-- NOT APPLIED — needs human to run after PR merge
-- Run: pnpm db:query -f scripts/migrations/2026-08-23-blog-focus-keyword-zh-batch2.sql
-- IDs read this run from DB query (offset 0, limit 10)

UPDATE blog_posts
SET focus_keyword_zh = CASE slug
    WHEN 'kitchen-layout-planning-vancouver-2026'      THEN '温哥华厨房布局'
    WHEN 'north-vancouver-home-renovation-guide-2026'  THEN '北温哥华家居翻新'
END
WHERE slug IN (
    'kitchen-layout-planning-vancouver-2026',
    'north-vancouver-home-renovation-guide-2026'
)
AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');
