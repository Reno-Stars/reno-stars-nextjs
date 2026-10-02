-- Migration: 2026-10-02
-- Fix: blog_posts title_zh contains English-only text (4 test posts with "Test" / "Test ZH" / "English Only Test")
-- Status: NOT APPLIED — needs human to review and run
-- These are all draft posts (is_published = false), not live on the site

BEGIN;

-- Prevent re-running on the same rows (idempotent guard)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM blog_posts
        WHERE id IN (
            '5f0fb183-c4c8-410b-a8c3-9c1093d14142',
            'ae52f455-64eb-40fb-8f4a-7488902c53c3',
            '76e1c252-b1ed-4268-89c5-20958dbb7cbd',
            '835af76e-2175-4e38-b7af-b31c51cbc0ba'
        )
        AND title_zh !~ '^[一-鿿]'
    ) THEN
        RAISE NOTICE 'All 4 rows already fixed — skipping';
    END IF;
END $$;

-- Set title_zh to the English title translated to Chinese
UPDATE blog_posts SET title_zh = CASE slug
    WHEN 'test-seo-keywords-2026'                 THEN 'SEO关键词测试 2026'
    WHEN 'townhouse-renovation-strata-rules-vancouver-2026' THEN '温哥华共管物业装修规则 2026'
    WHEN 'test-rich-formatting-2026'              THEN '富文本格式测试 2026'
    WHEN 'test-english-only-db'                    THEN '仅英文数据库测试'
    ELSE title_zh
END
WHERE id IN (
    '5f0fb183-c4c8-410b-a8c3-9c1093d14142',
    'ae52f455-64eb-40fb-8f4a-7488902c53c3',
    '76e1c252-b1ed-4268-89c5-20958dbb7cbd',
    '835af76e-2175-4e38-b7af-b31c51cbc0ba'
)
AND title_zh !~ '^[一-鿿]';

COMMIT;
