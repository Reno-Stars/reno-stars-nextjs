-- 2026-09-03: backfill focus_keyword_en + seo_keywords_en for outdoor-test blog posts
-- NOT APPLIED — run manually: psql $DATABASE_URL -f scripts/migrations/2026-09-03-outdoor-test-focus-en.sql
-- These are test/hatch posts with NULL focus_keyword_en AND seo_keywords_en
-- Idempotent: only touches rows where both are still NULL

UPDATE blog_posts
SET
  focus_keyword_en = 'outdoor living space renovation vancouver',
  seo_keywords_en  = 'outdoor living space renovation vancouver, deck renovation vancouver, patio construction vancouver, backyard renovation permit vancouver, vancouver outdoor permit 2026, decks patios permits metro vancouver 2026'
WHERE id IN (
  'dd064abc-db01-4588-a7a7-9738872b2ea7',
  '247e6fde-08dc-4285-b5c7-bbe236069047',
  'fd509df0-d641-4154-96e2-345e7cc71add',
  '48656047-631c-4d86-afc9-722f3dfdda88',
  '6b86f73f-a05d-40a3-a456-5c7d73bf87bb',
  '5509a194-8509-4e6d-a201-ae271ab53bde',
  '6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8',
  '92ef3796-7d41-4d6c-bb09-520340f6d3b6',
  '081258dc-0351-4d9d-a3a0-e2cd2a424dd2'
)
AND focus_keyword_en IS NULL
AND seo_keywords_en IS NULL;
