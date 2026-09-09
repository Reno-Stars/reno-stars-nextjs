-- 2026-09-09-blog-seo-keywords-en.sql
-- Status: NOT APPLIED — needs human to run
-- Target: 2 published posts with real content_en but missing focus_keyword_en + seo_keywords_en
-- These posts cannot be re-published via the API (required field) without this fix
-- Guard: idempotent WHERE — only affects rows matching the condition
-- Already covered (do NOT re-touch):
--   27dd8051 — seo_keywords_zh covered by 2026-09-09-blog-seo-keywords-zh-real-posts.sql
--   625cdf1c — seo_keywords_zh covered by 2026-09-09-blog-seo-keywords-zh-real-posts.sql

-- Post 1: how-to-renovate-house-vancouver-first-timer-guide
--   title_en: "How to Renovate Your House in Vancouver: A First-Timer's Step-by-Step Guide"
--   focus_keyword_en derived from slug: how-to-renovate-house-vancouver-first-timer-guide
UPDATE blog_posts SET
  focus_keyword_en = 'how to renovate house vancouver first timer guide',
  seo_keywords_en  = 'vancouver house renovation guide,how to renovate house vancouver,first home renovation guide vancouver,vancouver renovation step by step,vancouver renovation permits,vancouver renovation contractor'
WHERE slug = 'how-to-renovate-house-vancouver-first-timer-guide'
  AND is_published = true
  AND focus_keyword_en IS NULL;

-- Post 2: vancouver-property-type-renovation-2026
--   title_en: "House vs Condo vs Townhouse Renovation in Vancouver: What's Different in 2026"
--   focus_keyword_en derived from slug: vancouver-property-type-renovation-2026
UPDATE blog_posts SET
  focus_keyword_en = 'vancouver property type renovation 2026',
  seo_keywords_en  = 'vancouver house vs condo vs townhouse renovation,condo renovation vancouver strata rules,vancouver townhouse renovation permits,vancouver property type renovation guide,vancouver strata approval process,renovation rules by property type vancouver'
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND is_published = true
  AND focus_keyword_en IS NULL;
