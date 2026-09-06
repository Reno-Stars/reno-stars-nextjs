-- Migration: NOT APPLIED — needs human to run
-- Backfills missing meta_title_en and meta_description_en for 2 published blog posts.
-- Idempotent: WHERE guard ensures re-running skips already-updated rows.
UPDATE blog_posts
SET
  meta_title_en = "How to Renovate Your House in Vancouver: A First-Timer's Guide",
  meta_description_en = "First-timer's step-by-step Vancouver renovation guide covering costs, permits, and timelines. Reno Stars walks you through every stage."
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (meta_title_en IS NULL OR meta_title_en = '');

UPDATE blog_posts
SET
  meta_title_en = 'House vs Condo vs Townhouse Renovation in Vancouver: 2026 Guide',
  meta_description_en = 'Renovation differences for detached houses, strata condos, and townhouses in Metro Vancouver. Permits, costs, and strata approval explained.'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (meta_title_en IS NULL OR meta_title_en = '');
