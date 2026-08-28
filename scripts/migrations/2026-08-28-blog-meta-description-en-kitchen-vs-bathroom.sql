-- NOT APPLIED: needs human to run against production DB
-- Fixes truncated meta_description_en for published blog post
-- kitchen-vs-bathroom-reno-vancouver-2026 (id: c88b22eb-13c7-45f6-9597-4a6852742c54)
-- The field was set to the 29-char excerpt instead of a proper 155-char description.
-- Source: page content (costs, timelines, comparison table, real projects) and focus_keyword_en.
-- Idempotent: only applies if current value is the truncated string.

BEGIN;

UPDATE blog_posts
SET meta_description_en = 'Kitchen vs bathroom renovation in Vancouver: compare costs, timelines, and ROI. Reno Stars shares real project examples and a decision framework.'
WHERE id = 'c88b22eb-13c7-45f6-9597-4a6852742c54'
  AND meta_description_en = 'Kitchen vs bathroom Vancouver';

COMMIT;
