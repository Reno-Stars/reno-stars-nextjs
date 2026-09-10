-- 2026-09-10: populate seo_keywords_zh for published post townhouse-reno-vancouver-2026
-- NOT APPLIED — needs human to run before it auto-applies on merge
-- Coverage: 1 published post with seo_keywords_zh IS NULL
-- Already covered: id e50092a6 in seo/daily-2026-09-10 (seo_keywords_en migration unapplied)

BEGIN;

UPDATE blog_posts
SET seo_keywords_zh = '聯排別墅翻新,共管物業規定,BC共管財產法,Form B信息證書,聯排別墅裝修許可,溫哥華聯排別墅翻新,Metro Vancouver聯排別墅裝修,卑詩省聯排別墅裝修,本拿比聯排別墅裝修,列治文聯排別墅裝修,高貴林聯排別墅裝修,蘭里聯排別墅裝修,三角洲聯排別墅裝修,白石聯排別墅裝修,北溫哥華聯排別墅裝修,新西敏聯排別墅裝修'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND seo_keywords_zh IS NULL;

COMMIT;
