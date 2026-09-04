-- Migration: 2026-09-04
-- Table: blog_posts
-- Issue: 11 outdoor-test-* posts missing meta_description_en (excerpt_en is 193 chars; trimmed to ≤155)
-- Status: NOT APPLIED — needs human to run
-- idempotent WHERE guard: only updates if the field is still NULL

UPDATE blog_posts
SET meta_description_en = 'Vancouver homeowners transforming backyards into year-round living spaces with decks and patios. This guide covers 2026 costs and permit requirements in Metro Vancouver.'
WHERE
  slug IN (
    'outdoor-test-mt1',
    'outdoor-test-mt2',
    'outdoor-test-mt3',
    'outdoor-test-mt4',
    'outdoor-test-fk',
    'outdoor-test-fkzh',
    'outdoor-test-amp',
    'outdoor-test-half1',
    'outdoor-test-longexcerpt',
    'outdoor-test-md80',
    'outdoor-test-mtonly'
  )
  AND meta_description_en IS NULL;
