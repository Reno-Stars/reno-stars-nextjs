-- Migration: blog_posts focus_keyword_zh — batch 3 (2026-08-23)
-- Scope: 2 city-guide posts with Chinese titles but missing focus_keyword_zh
-- NOT APPLIED — needs human to run after PR merge
-- Run: pnpm db:query -f scripts/migrations/2026-08-23-blog-focus-keyword-zh-batch3.sql
-- IDs read this run: OFFSET 6, LIMIT 10 from query of posts with NULL focus_keyword_zh

UPDATE blog_posts
SET focus_keyword_zh = CASE slug
    WHEN 'surrey-home-renovation-guide-2026'        THEN '素里家居翻新'
    WHEN 'vancouver-home-renovation-guide-2026'    THEN '温哥华翻新'
END
WHERE slug IN (
    'surrey-home-renovation-guide-2026',
    'vancouver-home-renovation-guide-2026'
)
AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');
