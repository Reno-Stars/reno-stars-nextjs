-- Migration: 2026-09-04
-- Table: blog_posts
-- Issue: 5 outdoor-test-* posts missing meta_title_en (title_en 77 chars; trimmed to ≤70)
-- Status: NOT APPLIED — needs human to run
-- idempotent WHERE guard: only updates if the field is still NULL

UPDATE blog_posts
SET meta_title_en = 'Outdoor Living Space Renovation: Vancouver Decks, Patios & Permits 2026'
WHERE
  slug IN (
    'outdoor-test-fk',
    'outdoor-test-fkzh',
    'outdoor-test-half1',
    'outdoor-test-md80',
    'outdoor-test-mtonly'
  )
  AND meta_title_en IS NULL;
