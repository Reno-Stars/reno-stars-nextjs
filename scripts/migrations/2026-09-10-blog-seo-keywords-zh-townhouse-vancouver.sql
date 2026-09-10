-- Migration: populate seo_keywords_zh for published post
-- townhouse-reno-vancouver-2026 (e50092a6-59f9-45a1-8ad3-4db06f6048ba)
-- NOT APPLIED — run manually after review:
--
UPDATE blog_posts SET
  seo_keywords_zh = '溫哥華城市屋裝修,城市屋strata批准裝修,Metro Vancouver城市屋裝修,城市屋裝修許可證BC省,城市屋裝修規定溫哥華,2026城市屋裝修溫哥華'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
