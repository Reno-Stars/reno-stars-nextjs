-- Migration: 2026-09-04-blog-posts-focus-keyword-null.sql
-- Target: 10 blog_posts rows with focus_keyword_en AND/OR focus_keyword_zh NULL
--   247e6fde  outdoor-test-mtonly
--   5509a194  outdoor-test-mt2
--   6b86f73f  outdoor-test-mt1
--   6cdfba34  outdoor-test-mt3
--   48656047  outdoor-test-amp
--   dd064abc   outdoor-test-half1
--   081258dc   outdoor-test-longexcerpt
--   fd509df0   outdoor-test-md80
--   92ef3796   outdoor-test-mt4
--   (note: 247e6fde already covered by meta_en migration; included here for completeness)
-- Topic: Vancouver outdoor renovation (decks, patios, backyard renovation)
-- Status: NOT APPLIED — needs human to run against production DB
-- Author: SEO Agent 2026-09-04

BEGIN;

-- Idempotent guard: only update rows where focus_keyword fields are still NULL
UPDATE blog_posts
SET
  focus_keyword_en = 'vancouver outdoor renovation',
  focus_keyword_zh = '温哥华户外装修'
WHERE slug IN (
    'outdoor-test-mtonly',
    'outdoor-test-mt2',
    'outdoor-test-mt1',
    'outdoor-test-mt3',
    'outdoor-test-amp',
    'outdoor-test-half1',
    'outdoor-test-longexcerpt',
    'outdoor-test-md80',
    'outdoor-test-mt4'
  )
  AND (focus_keyword_en IS NULL OR focus_keyword_zh IS NULL);

COMMIT;
