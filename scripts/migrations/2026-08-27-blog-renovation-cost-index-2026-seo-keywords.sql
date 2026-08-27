-- 2026-08-27: populate seo_keywords_en for published Metro Vancouver Renovation Cost Index posts (2026)
-- Pattern from existing cost-index migrations (2023/2024): "vancouver renovation cost, metro vancouver reno prices, {YEAR} cost index"
-- NOT YET APPLIED — requires human to run before main branch deploy
-- Affected posts (all is_published=true):
--   metro-vancouver-renovation-cost-index-january-2026
--   metro-vancouver-renovation-cost-index-february-2026
--   metro-vancouver-renovation-cost-index-march-2026
--   metro-vancouver-renovation-cost-index-april-2026
--   metro-vancouver-renovation-cost-index-may-2026
--   metro-vancouver-renovation-cost-index-june-2026

UPDATE blog_posts
SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index',
    updated_at = NOW()
WHERE slug = 'metro-vancouver-renovation-cost-index-january-2026'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts
SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index',
    updated_at = NOW()
WHERE slug = 'metro-vancouver-renovation-cost-index-february-2026'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts
SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index',
    updated_at = NOW()
WHERE slug = 'metro-vancouver-renovation-cost-index-march-2026'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts
SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index',
    updated_at = NOW()
WHERE slug = 'metro-vancouver-renovation-cost-index-april-2026'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts
SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index',
    updated_at = NOW()
WHERE slug = 'metro-vancouver-renovation-cost-index-may-2026'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts
SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index',
    updated_at = NOW()
WHERE slug = 'metro-vancouver-renovation-cost-index-june-2026'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
