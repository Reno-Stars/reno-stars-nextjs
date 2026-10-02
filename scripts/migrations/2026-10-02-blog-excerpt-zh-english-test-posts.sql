-- Migration: 2026-10-02
-- Fix: blog_posts excerpt_zh contains English text (2 test posts)
-- Status: NOT APPLIED — needs human to review and run
-- These are draft posts (is_published = false), not live on the site

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM blog_posts
        WHERE id IN ('5f0fb183-c4c8-410b-a8c3-9c1093d14142', '835af76e-2175-4e38-b7af-b31c51cbc0ba')
        AND excerpt_zh !~ '^[一-鿿]'
    ) THEN
        RAISE NOTICE 'All excerpt_zh rows already fixed — skipping';
    END IF;
END $$;

UPDATE blog_posts SET excerpt_zh = CASE slug
    WHEN 'test-seo-keywords-2026'  THEN '使用格式正确的内容测试博客API发布。'
    WHEN 'test-english-only-db'     THEN '测试英文内容数据库帖子。'
    ELSE excerpt_zh
END
WHERE id IN ('5f0fb183-c4c8-410b-a8c3-9c1093d14142', '835af76e-2175-4e38-b7af-b31c51cbc0ba')
AND excerpt_zh !~ '^[一-鿿]';

COMMIT;
