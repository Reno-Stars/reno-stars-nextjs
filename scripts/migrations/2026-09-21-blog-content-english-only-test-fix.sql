-- Migration: blog_posts — content_zh integrity fix for test row
-- Date: 2026-09-21
-- Status: NOT APPLIED — needs human to run against production DB
-- Topic: One blog_posts row has English-only placeholder text in content_zh
-- Source: blog_posts table full scan for content_zh not matching Chinese character class
--
-- Row: id 835af76e-2175-4e38-b7af-b31c51cbc0ba, slug test-english-only-db
-- Problem: content_zh = "<p>English content only for this test.</p>" (English placeholder)
--         This row is is_published=false so not live-harmful, but the field
--         should contain real Chinese content or be NULL for a valid state.
--
-- QUERY TO VERIFY CURRENT STATE:
--   SELECT id, slug, is_published, content_zh
--   FROM blog_posts
--   WHERE id = '835af76e-2175-4e38-b7af-b31c51cbc0ba';
--
-- MIGRATION — Option A: clear content_zh to NULL (row is a test fixture, not published)
UPDATE blog_posts
SET content_zh = NULL
WHERE id = '835af76e-2175-4e38-b7af-b31c51cbc0ba'
  AND content_zh = '<p>English content only for this test.</p>';
--
-- MIGRATION — Option B: write real Chinese translation
-- If the row is intended to become a real post, content_zh should be translated from content_en.
-- The English content covers plumbing during Vancouver renovations (licensed plumber requirements,
-- BC codes, costs 2026, Poly-B pipe, FAQ section). A human translator should produce the zh
-- equivalent. Below is a placeholder to make the field non-English — replace with real translation:
--
-- UPDATE blog_posts
-- SET content_zh = '<p>在温哥华进行装修时...（real translation of the English plumbing article)</p>'
-- WHERE id = '835af76e-2175-4e38-b7af-b31c51cbc0ba'
--   AND (content_zh IS NULL OR content_zh !~ '[一-鿿]');
--
-- NOT APPLIED — needs human review before execution.
