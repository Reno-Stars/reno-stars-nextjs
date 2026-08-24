-- Migration: blog_posts — fix meta_description_en for kitchen renovation cost guide
-- Date: 2026-08-24
-- Status: NOT APPLIED — needs human to run against production DB
-- Target: id fbfe62bc, slug: how-much-does-kitchen-renovation-cost-vancouver-2026
-- Post URL: https://www.reno-stars.com/en/blog/how-much-does-kitchen-renovation-cost-vancouver-2026/
--
-- The front-end generates og:description from content when meta_description_en is NULL.
-- The rendered page is correct, but the DB field should be populated for completeness.
-- The og:description value rendered at time of audit:
--   "A typical full kitchen renovation in Metro Vancouver costs $30,000 to $72,000+.
--    This guide covers all cost factors, price tiers, and budgeting tips for..."
--
-- Rule: meta_description_en must contain NO question marks (blog API validation).
-- The rendered og:description contains a question mark ("...budgeting tips for?") — encode as
-- a statement instead for DB storage.
--
-- NOT APPLIED — needs human to run

UPDATE blog_posts
SET
  meta_description_en = 'A full kitchen renovation in Metro Vancouver costs $30,000 to $72,000+. This guide covers cost factors, price tiers, and budgeting tips for homeowners.'
WHERE
  id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND is_published = true
  AND (
    meta_description_en IS NULL
    OR meta_description_en = ''
  );
