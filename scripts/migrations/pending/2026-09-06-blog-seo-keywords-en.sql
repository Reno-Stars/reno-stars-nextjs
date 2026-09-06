-- Migration: 2026-09-06-blog-seo-keywords-en.sql
-- NOT APPLIED — needs human to review and execute against live DB.
-- Adds seo_keywords_en to 4 published posts that lack it.
-- Uses focus_keyword_en value as seed where available, slug-derived fallback otherwise.
-- Idempotent: WHERE guard ensures no overwrite if already set.

-- how-to-renovate-house-vancouver-first-timer-guide
UPDATE blog_posts
SET seo_keywords_en = 'vancouver house renovation guide, first renovation, vancouver home renovation steps, renovation checklist vancouver'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- townhouse-reno-vancouver-2026
UPDATE blog_posts
SET seo_keywords_en = 'townhouse renovation vancouver, strata renovation rules vancouver, vancouver townhouse renovation permit, metro vancouver strata'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- vancouver-property-type-renovation-2026
UPDATE blog_posts
SET seo_keywords_en = 'vancouver house vs condo renovation, vancouver renovation property type, house condo townhouse renovation vancouver, vancouver renovation cost by property type'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- metro-vancouver-renovation-cost-index-november-2023
UPDATE blog_posts
SET seo_keywords_en = 'vancouver renovation cost 2023, metro vancouver renovation cost index, vancouver renovation cost per square foot, reno cost vancouver november 2023'
WHERE id = '55dbdb54-e9d7-405f-84f9-5e4a95d7a7bd'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
