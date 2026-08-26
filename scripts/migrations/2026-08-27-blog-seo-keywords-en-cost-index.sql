-- NOT APPLIED: needs human to run against production DB
-- Supplemental seo_keywords_en for metro-vancouver-renovation-cost-index posts
-- NOT covered by 2026-08-24-blog-seo-keywords-en.sql (which covers 2023 Apr, 2024 Jan-Nov, 2025 Apr+Aug, and 3 general posts)
-- This file covers: 2023 Jul+Sep+Oct, 2024 Aug-Dec, 2025 Jan-Mar+May-Jul+Sep-Nov, 2026 Jan-Jun

BEGIN;

-- 2023 posts (Jul, Sep, Oct — April 2023 already in prior migration)
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2023 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-july-2023' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2023 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-september-2023' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2023 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-october-2023' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- 2024 posts (Aug-Dec — Jan-Jul+Sep-Nov already in prior migration)
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2024 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-august-2024' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2024 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-december-2024' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- 2025 posts (Jan-Mar, May-Jul, Sep-Nov — Apr+Aug already in prior migration)
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2025 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-january-2025' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2025 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-february-2025' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2025 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-march-2025' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2025 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-may-2025' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2025 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-june-2025' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2025 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-july-2025' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2025 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-september-2025' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2025 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-october-2025' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2025 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-november-2025' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2025 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-december-2025' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- 2026 posts (Jan-Jun — all missing)
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-january-2026' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-february-2026' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-april-2026' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

COMMIT;
