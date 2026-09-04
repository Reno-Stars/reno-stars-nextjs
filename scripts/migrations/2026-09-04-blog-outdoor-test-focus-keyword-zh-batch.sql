-- Migration: 2026-09-04
-- Table: blog_posts
-- Issue: 10 outdoor-test-* posts missing focus_keyword_zh (all otherwise-complete zh posts for the same outdoor-decks-patios-permits topic)
-- Status: NOT APPLIED — needs human to run
-- idempotent WHERE guard: only updates if the field is still NULL

UPDATE blog_posts
SET focus_keyword_zh = '温哥华户外空间装修'
WHERE
  slug IN (
    'outdoor-test-mt1',
    'outdoor-test-mt2',
    'outdoor-test-mt3',
    'outdoor-test-mt4',
    'outdoor-test-fk',
    'outdoor-test-amp',
    'outdoor-test-half1',
    'outdoor-test-longexcerpt',
    'outdoor-test-md80',
    'outdoor-test-mtonly'
  )
  AND focus_keyword_zh IS NULL;
