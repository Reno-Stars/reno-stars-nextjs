-- Migration: 2026-09-25-blog-keywords-fix-townhouse.sql
-- Target: blog_posts (townhouse-reno-vancouver-2026)
-- Issue: is_published=true but seo_keywords_en AND seo_keywords_zh are NULL
-- Fix: populate from the post's own keyword content (deduplicated)
BEGIN;

-- Set seo_keywords_en from focus_keyword_en + title tokens
UPDATE blog_posts
SET seo_keywords_en = 'townhouse renovation,vancouver strata,strata approval,metro vancouver townhouse,townhouse permit bc,townhouse renovation cost,vancouver townhouse renovation',
    updated_at = NOW()
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- Set seo_keywords_zh from focus_keyword_zh + title tokens
UPDATE blog_posts
SET seo_keywords_zh = '城市屋苑装修,温哥华分层管理,分层审批流程,大温城市屋苑,城市屋苑许可证bc,城市屋苑装修费用,温哥华城市屋苑装修',
    updated_at = NOW()
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Verify
DO $$
BEGIN
    ASSERT (
        SELECT COUNT(*) FROM blog_posts
        WHERE slug = 'townhouse-reno-vancouver-2026'
          AND (seo_keywords_en IS NULL OR seo_keywords_en = ''
            OR seo_keywords_zh IS NULL OR seo_keywords_zh = '')
    ) = 0,
    'townhouse seo_keywords still NULL';
END $$;

COMMIT;
