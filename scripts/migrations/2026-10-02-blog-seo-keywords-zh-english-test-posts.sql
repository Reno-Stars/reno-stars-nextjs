-- Migration: 2026-10-02
-- Fix: blog_posts seo_keywords_zh contains English text "test keyword" (8 test posts, all drafts)
-- Status: NOT APPLIED — needs human to review and run
-- These are draft posts (is_published = false), not live on the site

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM blog_posts
        WHERE id IN (
            '835af76e-2175-4e38-b7af-b31c51cbc0ba',
            '65f51389-8a65-470d-952a-e94340654713',
            '5c25e198-4c2b-41d1-8ae4-d56d69c2d957',
            'fb2f167b-87a5-4a89-a834-73703efb9810',
            'b5c81f80-8055-4cce-aefc-536d8fe02682',
            '5d24186c-3b36-4ba0-b292-cd49deee9ba9',
            '2c3cd08f-0df9-4f89-850d-9324fb3ae735',
            '5895f02a-7d95-4747-a3e9-553b71fb75fd'
        )
        AND seo_keywords_zh IS NOT NULL
        AND seo_keywords_zh !~ '^[一-鿿]'
    ) THEN
        RAISE NOTICE 'All seo_keywords_zh rows already fixed — skipping';
    END IF;
END $$;

UPDATE blog_posts SET seo_keywords_zh = CASE slug
    WHEN 'test-english-only-db'  THEN '测试,英文内容,数据库'
    WHEN 'test-size-500'         THEN '测试,SEO关键词,500字'
    WHEN 'test-size-2000'        THEN '测试,SEO关键词,2000字'
    WHEN 'test-size-3000'        THEN '测试,SEO关键词,3000字'
    WHEN 'test-size-4000'        THEN '测试,SEO关键词,4000字'
    WHEN 'test-size-1000'        THEN '测试,SEO关键词,1000字'
    WHEN 'test-size-5000'        THEN '测试,SEO关键词,5000字'
    WHEN 'test-full-zh-content'  THEN '测试,全中文内容,装修'
    ELSE seo_keywords_zh
END
WHERE id IN (
    '835af76e-2175-4e38-b7af-b31c51cbc0ba',
    '65f51389-8a65-470d-952a-e94340654713',
    '5c25e198-4c2b-41d1-8ae4-d56d69c2d957',
    'fb2f167b-87a5-4a89-a834-73703efb9810',
    'b5c81f80-8055-4cce-aefc-536d8fe02682',
    '5d24186c-3b36-4ba0-b292-cd49deee9ba9',
    '2c3cd08f-0df9-4f89-850d-9324fb3ae735',
    '5895f02a-7d95-4747-a3e9-553b71fb75fd'
)
AND seo_keywords_zh IS NOT NULL
AND seo_keywords_zh !~ '^[一-鿿]';

COMMIT;
