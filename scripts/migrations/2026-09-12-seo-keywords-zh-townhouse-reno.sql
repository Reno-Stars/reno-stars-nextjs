-- Migration: backfill seo_keywords_zh for published townhouse-reno-vancouver-2026
--   pnpm db:query -f scripts/migrations/2026-09-12-seo-keywords-zh-townhouse-reno.sql
--
-- NOT APPLIED — needs human to run after review.
-- Context: townhouse-reno-vancouver-2026 (e50092a6) is published and has all other
-- Chinese fields populated, but seo_keywords_zh is NULL. Derived from content.

UPDATE blog_posts
SET seo_keywords_zh = '聯排別墅翻新,大溫哥華翻新,共管物業批准,BC省 strata 規定,聯排別墅裝修,物業表B,城市建築許可證,共管公寓翻新,大溫哥華裝修公司,聯排別墅裝修費用'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '')
  AND slug = 'townhouse-reno-vancouver-2026';
