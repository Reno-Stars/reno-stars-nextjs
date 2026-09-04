-- Migration: 2026-09-04-blog-posts-outdoor-test-meta-en-null.sql
-- Target: blog_posts.id = '247e6fde-08dc-4285-b5c7-bbe236069047' (slug: outdoor-test-mtonly)
-- Gap: meta_description_en, meta_title_en, focus_keyword_en are all NULL
-- Status: NOT APPLIED — needs human to run against production DB
-- Author: SEO Agent 2026-09-04

BEGIN;

-- Idempotent guard: only update if English meta fields are still NULL
UPDATE blog_posts
SET
  meta_title_en       = 'Vancouver Outdoor Renovation Guide 2026 — Decks, Patios & Permits',
  meta_description_en = 'Outdoor renovation guide for Vancouver homeowners: decks, patios, backyard改造. 2026 permit requirements, average costs, and top contractors.',
  focus_keyword_en    = 'vancouver outdoor renovation'
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND meta_description_en IS NULL
  AND meta_title_en IS NULL
  AND focus_keyword_en IS NULL;

COMMIT;
