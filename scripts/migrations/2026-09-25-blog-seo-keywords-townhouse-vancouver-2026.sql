-- Migration: 2026-09-25-blog-seo-keywords-townhouse-vancouver-2026.sql
-- Fix: townhouse-reno-vancouver-2026 is published but seoKeywordsEn/seoKeywordsZh are NULL.
-- Inferred from similar published townhouse posts (townhouse-renovation-cost-vancouver-2026, etc.)
-- WHERE guard ensures idempotency.
-- NOT APPLIED — needs human or ops to run against the live database.

UPDATE blog_posts
SET seo_keywords_en = 'townhouse renovation strata rules, strata approval townhouse Vancouver, Metro Vancouver townhouse renovation, townhouse renovation permit Vancouver, strata bylaws renovation, Vancouver townhouse renovation guide, townhouse renovation strata BC, 2026 townhouse renovation Vancouver',
    seo_keywords_zh = '城市屋装修规定,共管物业审批,温哥华城市屋装修,城市屋装修许可,共管公寓装修规定,温哥华城市屋翻新指南,BC城市屋装修,2026城市屋翻新',
    updated_at = NOW()
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
