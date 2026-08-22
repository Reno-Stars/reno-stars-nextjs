-- 2026-08-22-project-sites-excerpt-null.sql
-- project_sites: published project site 'vancouver-wfh-glass-partition-office' has
-- both excerpt_en and excerpt_zh NULL. Derive from description_en/space_type_en.
-- NOT APPLIED — needs human review before running.

BEGIN;

-- Derive excerpt_en from space_type + title where both excerpt fields are NULL
UPDATE project_sites
SET excerpt_en = INITCAP(space_type_en) || ': ' || title_en || ' — view the full project, budget, and timeline.'
WHERE (excerpt_en IS NULL OR excerpt_en = '')
  AND (excerpt_zh IS NULL OR excerpt_zh = '')
  AND is_published = true
  AND space_type_en IS NOT NULL
  AND space_type_en != ''
  AND title_en IS NOT NULL
  AND title_en != ''
  AND id = '6d5050fa-48ec-43c4-8187-ecd814dbb947';

-- Set excerpt_zh to excerpt_en as a fallback so the field is not blank
-- (human translator should replace with proper zh)
UPDATE project_sites
SET excerpt_zh = excerpt_en
WHERE (excerpt_zh IS NULL OR excerpt_zh = '')
  AND excerpt_en IS NOT NULL
  AND excerpt_en != ''
  AND id = '6d5050fa-48ec-43c4-8187-ecd814dbb947';

COMMIT;
