-- Migration: 2026-10-02
-- Fix: blog_posts meta_description_zh contains English text (3 test posts)
-- Status: NOT APPLIED — needs human to review and run
-- These are draft posts (is_published = false), not live on the site

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM blog_posts
        WHERE id IN (
            '5f0fb183-c4c8-410b-a8c3-9c1093d14142',
            '76e1c252-b1ed-4268-89c5-20958dbb7cbd',
            '835af76e-2175-4e38-b7af-b31c51cbc0ba'
        )
        AND meta_description_zh !~ '^[一-鿿]'
    ) THEN
        RAISE NOTICE 'All meta_description_zh rows already fixed — skipping';
    END IF;
END $$;

UPDATE blog_posts SET meta_description_zh = CASE slug
    WHEN 'test-seo-keywords-2026'          THEN '使用格式正确的内容测试博客API发布。'
    WHEN 'test-rich-formatting-2026'       THEN '测试富文本格式与中文内容长度验证。'
    WHEN 'test-english-only-db'             THEN '测试英文内容数据库帖子元描述。'
    ELSE meta_description_zh
END
WHERE id IN (
    '5f0fb183-c4c8-410b-a8c3-9c1093d14142',
    '76e1c252-b1ed-4268-89c5-20958dbb7cbd',
    '835af76e-2175-4e38-b7af-b31c51cbc0ba'
)
AND meta_description_zh !~ '^[一-鿿]';

COMMIT;
