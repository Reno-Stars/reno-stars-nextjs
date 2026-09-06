-- Migration: add missing meta_description_en to two published blog posts
-- NOT YET APPLIED — needs human review and execution
-- These posts have content_en but no meta_description_en, hurting SEO

UPDATE blog_posts
SET meta_description_en = 'Step-by-step guide to renovating your Vancouver house in 2026. Real costs, BC permit rules, and the exact timeline from first meeting to keys.'
WHERE slug = 'how-to-renovate-house-vancouver-first-timer-guide'
  AND meta_description_en IS NULL
  AND is_published;

UPDATE blog_posts
SET meta_description_en = 'House vs condo vs townhouse renovation in Metro Vancouver 2026: strata rules, costs and permissions for each property type.'
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND meta_description_en IS NULL
  AND is_published;
