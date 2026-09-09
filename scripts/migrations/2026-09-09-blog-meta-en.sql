-- 2026-09-09-blog-meta-en.sql
-- Status: NOT APPLIED — needs human to run
-- Target: 2 published posts with real content_en but missing meta_title_en, meta_description_en
-- These posts cannot be re-published via the API (required fields) without this fix
-- Guard: idempotent WHERE — only affects rows matching the condition
--
-- Already covered (do NOT re-touch):
--   27dd8051 — focus_keyword_en + seo_keywords_en covered by 2026-09-09-blog-seo-keywords-en.sql
--   625cdf1c — focus_keyword_en + seo_keywords_en covered by 2026-09-09-blog-seo-keywords-en.sql
--
-- Post 1: how-to-renovate-house-vancouver-first-timer-guide
--   title_en: "How to Renovate Your House in Vancouver: A First-Timer's Step-by-Step Guide"
UPDATE blog_posts SET
  meta_title_en       = 'How to Renovate Your House in Vancouver: First-Timer Guide',
  meta_description_en = 'Step-by-step guide for first-time Vancouver renovators: 2026 costs, BC permit rules, and the Reno Stars process from keys to keys.'
WHERE slug = 'how-to-renovate-house-vancouver-first-timer-guide'
  AND is_published = true
  AND meta_title_en IS NULL;

-- Post 2: vancouver-property-type-renovation-2026
--   title_en: "House vs Condo vs Townhouse Renovation in Vancouver: What's Different in 2026"
UPDATE blog_posts SET
  meta_title_en       = 'House vs Condo vs Townhouse Renovation in Vancouver (2026)',
  meta_description_en = 'Renovation rules differ by property type in Vancouver. This guide covers strata approvals, permit requirements, and costs for houses, condos, and townhouses.'
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND is_published = true
  AND meta_title_en IS NULL;
