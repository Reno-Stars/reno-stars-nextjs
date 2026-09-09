-- 2026-09-08-blog-seo-keywords-en-backfill.sql
-- NOT APPLIED — needs human to run against production DB
-- 7 published posts have NULL seo_keywords_en; backfill from title/slug

UPDATE blog_posts
SET seo_keywords_en = 'vancouver house renovation, first time renovator, vancouver renovation guide, renovation checklist vancouver, vancouver home renovation, renovation steps vancouver'
WHERE slug = 'how-to-renovate-house-vancouver-first-timer-guide'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts
SET seo_keywords_en = 'townhouse renovation vancouver, strata renovation rules vancouver, vancouver townhouse renovation, townhouse renovation permit vancouver, strata renovation guide, townhouse renovation cost vancouver'
WHERE slug = 'townhouse-renovation-strata-rules-vancouver-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts
SET seo_keywords_en = 'townhouse renovation vancouver 2026, vancouver townhouse renovation cost, townhouse renovation permit, strata renovation vancouver, townhouse renovation checklist, vancouver strata renovation'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts
SET seo_keywords_en = 'vancouver house vs condo renovation, vancouver townhouse vs house renovation, renovation cost property type, vancouver renovation comparison, condo vs townhouse renovation cost vancouver'
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts
SET seo_keywords_en = 'metro vancouver renovation cost index, vancouver renovation cost 2023, renovation price trends vancouver, vancouver renovation cost per square foot, renovation budget vancouver 2023'
WHERE slug = 'metro-vancouver-renovation-cost-index-november-2023'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
