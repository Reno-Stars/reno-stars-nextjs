-- Migration: blog_posts focus_keyword_zh — batch 3 (2026-08-23)
-- Scope: 3 published posts missing focus_keyword_zh
-- Sources: title_zh from DB rows
-- NOT APPLIED — needs human to run after PR merge
-- Run: pnpm db:query -f scripts/migrations/2026-08-23-blog-focus-keyword-zh-batch3.sql

UPDATE blog_posts
SET focus_keyword_zh = CASE slug
    WHEN 'surrey-home-renovation-guide-2026'        THEN '素里家居翻新'
    WHEN 'vancouver-home-renovation-guide-2026'    THEN '温哥华翻新'
    WHEN 'kitchen-renovation-surrey-bc-2026'         THEN '素里厨房装修'
END
WHERE slug IN (
    'surrey-home-renovation-guide-2026',
    'vancouver-home-renovation-guide-2026',
    'kitchen-renovation-surrey-bc-2026'
)
AND is_published = true
AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');
