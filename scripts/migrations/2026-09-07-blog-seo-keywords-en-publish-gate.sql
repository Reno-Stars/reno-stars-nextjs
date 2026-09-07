-- Migration: populate seo_keywords_en for two published posts where all other SEO
-- fields are covered by 1c8d4f68 but seo_keywords_en was omitted.
--
-- NOT APPLIED — run manually after review:
--   pnpm db:query -f scripts/migrations/2026-09-07-blog-seo-keywords-en-publish-gate.sql
--
-- Post 1: vancouver-property-type-renovation-2026 (625cdf1c-8733-470c-9198-f56de2a152c6)
-- Post 2: how-to-renovate-house-vancouver-first-timer-guide (27dd8051-1198-4c2f-97f2-b058b9ba7247)

UPDATE blog_posts SET
  seo_keywords_en = 'Vancouver house renovation,condo renovation Vancouver,townhouse renovation Vancouver,strata renovation Vancouver,property type renovation Metro Vancouver,2026 renovation rules Vancouver'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts SET
  seo_keywords_en = 'Vancouver home renovation,first renovation Vancouver,BC renovation permit,Vancouver contractor guide,whole house renovation Vancouver,renovation timeline Vancouver,2026 renovation costs Vancouver'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
