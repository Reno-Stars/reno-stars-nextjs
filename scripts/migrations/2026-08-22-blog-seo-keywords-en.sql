-- Migration: populate blog_posts.seo_keywords_en for 40 rows with NULL values
-- Status: NOT APPLIED — needs human to run
-- Date: 2026-08-22
-- Rows covered: 40 (38 metro-vancouver-renovation-cost-index monthly posts + 2 unique)
-- Excludes: 15 test/outdoor-test slugs (slug LIKE 'test-%' OR slug LIKE 'outdoor-test-%')

BEGIN;

-- Kitchen renovation cost guide (unique post)
UPDATE blog_posts
SET seo_keywords_en = 'kitchen renovation cost vancouver,kitchen renovation price vancouver bc,kitchen remodel cost estimate,vancouver kitchen renovation budget,2026 kitchen renovation guide'
WHERE id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND seo_keywords_en IS NULL;

-- Kitchen vs bathroom comparison (unique post)
UPDATE blog_posts
SET seo_keywords_en = 'kitchen vs bathroom renovation vancouver,renovation project order vancouver,kitchen renovation vancouver,bathroom renovation vancouver,which room to renovate first vancouver'
WHERE id = 'c88b22eb-13c7-45f6-9597-4a6852742c54'
  AND seo_keywords_en IS NULL;

-- Outdoor living space (unique post)
UPDATE blog_posts
SET seo_keywords_en = 'outdoor living space renovation vancouver,deck renovation vancouver bc,patio renovation permit vancouver,backyard renovation vancouver,outdoor renovation permits bc 2026'
WHERE id = 'c7eabaf3-4afb-4cfa-980a-f416d450d0d3'
  AND seo_keywords_en IS NULL;

-- Metro Vancouver Renovation Cost Index series (38 monthly posts, same keywords)
-- Derived from slug pattern: metro-vancouver-renovation-cost-index-<month>-<year>
UPDATE blog_posts
SET seo_keywords_en = 'metro vancouver renovation cost index,vancouver renovation cost guide,renovation cost tracker bc,vancouver construction costs,reno cost per square foot vancouver,bc renovation pricing'
WHERE seo_keywords_en IS NULL
  AND slug ILIKE 'metro-vancouver-renovation-cost-index%';

COMMIT;
