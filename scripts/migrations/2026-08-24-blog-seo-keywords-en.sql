-- NOT APPLIED: needs human to run against production DB
-- Adds seo_keywords_en for 17 published blog_posts missing it

BEGIN;

-- Monthly cost index posts (14 published)
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2023 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-april-2023' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2023 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-august-2023' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2023 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-december-2023' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2024 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-february-2024' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2024 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-january-2024' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2024 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-july-2024' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2024 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-june-2024' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2024 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-march-2024' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2024 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-may-2024' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2024 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-november-2024' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2024 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-october-2024' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2024 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-september-2024' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2025 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-april-2025' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2025 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-august-2025' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- General blog posts (3 published)
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, kitchen reno budget, kitchen cost 2026, reno calculator vancouver'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'kitchen vs bathroom renovation, vancouver reno order, reno planning guide vancouver'
WHERE slug = 'kitchen-vs-bathroom-reno-vancouver-2026' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'outdoor living space renovation vancouver, deck patio permit vancouver, outdoor reno 2026'
WHERE slug = 'outdoor-living-space-renovation-vancouver-2026' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

COMMIT;
