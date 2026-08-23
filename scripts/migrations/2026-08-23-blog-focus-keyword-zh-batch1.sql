-- Migration: blog_posts focus_keyword_zh — batch 1 (2026-08-23)
-- Scope: 4 published city+topic blog posts with Chinese title but missing focus_keyword_zh
-- NOT APPLIED — needs human to run after PR merge
-- Run: pnpm db:query -f scripts/migrations/2026-08-23-blog-focus-keyword-zh-batch1.sql

UPDATE blog_posts
SET focus_keyword_zh = CASE slug
    WHEN 'bathroom-renovation-coquitlam-bc-2026' THEN '科奎特兰浴室翻新'
    WHEN 'burnaby-home-renovation-guide-2026'     THEN '本拿比家居翻新'
    WHEN 'kitchen-renovation-maple-ridge-bc-2026' THEN '枫树岭厨房翻新'
    WHEN 'coquitlam-home-renovation-guide-2026'  THEN '高贵林家居翻新'
END
WHERE slug IN (
    'bathroom-renovation-coquitlam-bc-2026',
    'burnaby-home-renovation-guide-2026',
    'kitchen-renovation-maple-ridge-bc-2026',
    'coquitlam-home-renovation-guide-2026'
)
AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');
