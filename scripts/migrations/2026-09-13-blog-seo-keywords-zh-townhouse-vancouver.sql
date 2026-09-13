-- NOT APPLIED — needs human to run
-- 2026-09-13 blog seo_keywords_zh for townhouse-reno-vancouver-2026
UPDATE blog_posts
SET seo_keywords_zh = '聯排別墅翻新,共管物業,溫哥華,2026,裝修許可證,物業績效,BC省建築'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND is_published
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '')
  AND NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'townhouse-reno-vancouver-2026' AND seo_keywords_zh IS NOT NULL AND seo_keywords_zh <> '');
