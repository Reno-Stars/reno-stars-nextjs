-- Ladder 2c: blog_posts townhouse-reno-vancouver-2026 missing seo_keywords
UPDATE blog_posts
SET seo_keywords_en = 'townhouse renovation Vancouver, Vancouver townhouse renovation cost, strata renovation rules Vancouver, townhouse renovation permit Vancouver, Metro Vancouver townhouse renovation',
    seo_keywords_zh = '温哥华城市屋装修, 温哥华城市屋装修费用, 温哥华分层物业装修规定, 城市屋装修许可温哥华, 大温城市屋翻新'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
