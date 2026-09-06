-- Migration: NOT APPLIED — needs human to run
-- Consolidated backfill for 2 published blog posts missing ALL English SEO fields.
-- Replaces: 2026-09-07-blog-meta-en-two-posts.sql
-- Idempotent: each UPDATE has a WHERE guard on the null column.

-- ============================================================
-- POST 27dd8051: how-to-renovate-house-vancouver-first-timer-guide
-- ============================================================
UPDATE blog_posts
SET focus_keyword_en = 'vancouver house renovation guide'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND focus_keyword_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'vancouver house renovation,vancouver home renovation costs,first time renovator vancouver,vancouver renovation permit,reno stars vancouver'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET meta_title_en = 'How to Renovate Your House in Vancouver: A First-Timer Guide'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND meta_title_en IS NULL;

UPDATE blog_posts
SET meta_description_en = 'First-timers step-by-step Vancouver renovation guide covering costs, permits, and timelines. Reno Stars walks you through every stage.'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND meta_description_en IS NULL;

-- ============================================================
-- POST 625cdf1c: vancouver-property-type-renovation-2026
-- Missing: excerpt_en, focus_keyword_en, seo_keywords_en,
--           meta_title_en, meta_description_en
-- ============================================================
UPDATE blog_posts
SET excerpt_en = 'Metro Vancouver homeowners in 2026 face different renovation rules depending on property type. Detached houses, strata condos, and townhouses each have distinct permit requirements, costs, and strata council approval processes.'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND excerpt_en IS NULL;

UPDATE blog_posts
SET focus_keyword_en = 'vancouver property type renovation'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND focus_keyword_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'vancouver condo renovation,vancouver townhouse renovation,house vs condo renovation vancouver,strata renovation vancouver,vancouver renovation rules 2026'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET meta_title_en = 'House vs Condo vs Townhouse Renovation in Vancouver: 2026 Guide'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND meta_title_en IS NULL;

UPDATE blog_posts
SET meta_description_en = 'Renovation differences for detached houses, strata condos, and townhouses in Metro Vancouver. Permits, costs, and strata approval explained.'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND meta_description_en IS NULL;
