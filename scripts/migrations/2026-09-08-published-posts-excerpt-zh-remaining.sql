-- Migration: populate excerpt_zh for 2 published posts that have zh content/title
-- but are missing excerpt_zh, and populate remaining English SEO metadata for
-- vancouver-property-type-renovation (625cdf1c).
--
-- Extends: 2026-09-07-blog-missing-seo-metadata.sql
--   That migration's guards pass but the DB still shows NULL, so this file
--   re-targets the same rows with more specific WHERE guards to ensure the
--   updates apply. It does NOT duplicate — the 09-07 file also covers
--   meta_description_en for 625cdf1c and focus/seo_keywords for both.
--
-- NOT APPLIED — needs human run:
--   pnpm db:query -f scripts/migrations/2026-09-08-published-posts-excerpt-zh-remaining.sql
--
-- Post 1: how-to-renovate-house-vancouver-first-timer-guide (27dd8051)
--   excerpt_zh NULL  ← only remaining gap; en fields already in 09-07 migration
--
-- Post 2: vancouver-property-type-renovation-2026 (625cdf1c)
--   excerpt_en  NULL ← remaining gap
--   All en SEO meta still NULL (meta_description, focus_keyword, seo_keywords)
--   (zh fields already in 09-07 migration)

-- ── Post 1: excerpt_zh from title + content context ─────────────────────────
UPDATE blog_posts SET
  excerpt_zh = '本文涵蓋溫哥華裝修的每一步流程，包含2026年真實成本、BC省許可規則，以及首次裝修業主必讀的完整清單。'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND excerpt_zh IS NULL;

-- ── Post 2: excerpt_en + remaining English SEO metadata ──────────────────────
UPDATE blog_posts SET
  excerpt_en = 'Detached house, condo, or townhouse in Metro Vancouver — each renovation type has different rules, costs, and strata requirements in 2026.',
  meta_description_en = 'Metro Vancouver homeowners in 2026 face different renovation rules for houses, condos, and townhouses. This guide breaks down the differences and costs.',
  focus_keyword_en = 'Vancouver property type renovation',
  seo_keywords_en = 'Vancouver house renovation,condo renovation Vancouver,townhouse renovation Vancouver,strata renovation Vancouver,property type renovation Metro Vancouver,2026 renovation rules Vancouver'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (excerpt_en IS NULL OR meta_description_en IS NULL);
