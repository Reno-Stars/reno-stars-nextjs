-- Clear test-placeholder title_zh from townhouse-renovation-strata-rules-vancouver-2026
-- Row has title_zh = 'Test ZH' — a test placeholder, not a real translation.
-- Idempotent: only updates if title_zh still equals 'Test ZH'.
UPDATE blog_posts
SET title_zh = NULL
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND title_zh = 'Test ZH';
