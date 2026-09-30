-- Migration: backfill meta_title_en for 2 published posts that were missed by
-- the 2026-09-07 batch (that file covered all other SEO metadata but explicitly
-- excluded meta_title_en, leaving these two rows incomplete).
--
-- NOT APPLIED — needs a human to run it.
-- Run with: pnpm db:query -f scripts/migrations/2026-09-30-blog-meta-title-en-backfill.sql
--
-- Ids covered: 27dd8051, 625cdf1c
-- These are already handled for all other columns in 2026-09-07-blog-missing-seo-metadata.sql.
-- This file only populates meta_title_en (the one column that batch skipped).

UPDATE blog_posts SET
  meta_title_en = 'How to Renovate Your House in Vancouver: A First-Timer Guide'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (meta_title_en IS NULL OR meta_title_en = '');

UPDATE blog_posts SET
  meta_title_en = 'House vs Condo vs Townhouse Renovation in Vancouver: 2026 Guide'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (meta_title_en IS NULL OR meta_title_en = '');
