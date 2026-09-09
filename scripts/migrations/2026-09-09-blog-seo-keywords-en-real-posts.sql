-- 2026-09-09-blog-seo-keywords-en-real-posts.sql
-- Status: NOT APPLIED — needs human to run
-- Target: 5 published posts with real focus_keyword_en but missing seo_keywords_en
-- Guard: idempotent WHERE — only affects rows matching the condition
--
-- Post 1: how-to-renovate-house-vancouver-first-timer-guide
--   title_en: "How to Renovate Your House in Vancouver: A First-Timer's Step-by-Step Guide"
--   focus_keyword_en: NULL (derive from title)
UPDATE blog_posts SET
  focus_keyword_en = 'how to renovate house vancouver first timer guide',
  seo_keywords_en  = 'vancouver house renovation guide,how to renovate house vancouver,first home renovation guide vancouver,vancouver renovation step by step,vancouver renovation permits,vancouver renovation contractor'
WHERE slug = 'how-to-renovate-house-vancouver-first-timer-guide'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- Post 2: vancouver-property-type-renovation-2026
--   title_en: "House vs Condo vs Townhouse Renovation in Vancouver: What's Different in 2026"
--   focus_keyword_en: NULL (derive from title)
UPDATE blog_posts SET
  focus_keyword_en = 'vancouver property type renovation 2026',
  seo_keywords_en  = 'vancouver house renovation vs condo vs townhouse,house vs condo renovation vancouver,vancouver property type renovation guide,vancouver renovation permits by property type,different renovation rules vancouver condo,vancouver strata renovation'
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- Post 3: townhouse-reno-vancouver-2026
--   focus_keyword_en: already set (townhouse renovation strata rules Vancouver)
UPDATE blog_posts SET
  seo_keywords_en = 'vancouver townhouse renovation strata rules,metro vancouver townhouse renovation,strata renovation permits bc,townhouse renovation 2026 vancouver,vancouver strata approval process,townhouse renovation cost bc'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- Post 4: metro-vancouver-renovation-cost-index-november-2023
--   focus_keyword_en: already set (vancouver renovation cost november 2023)
UPDATE blog_posts SET
  seo_keywords_en = 'vancouver renovation cost index,metro vancouver reno cost tracker,november 2023 renovation prices vancouver,vancouver remodeling cost per square foot,vancouver construction cost 2023,vancouver renovation budget guide'
WHERE slug = 'metro-vancouver-renovation-cost-index-november-2023'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
