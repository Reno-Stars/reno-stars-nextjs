-- Migration: 2026-09-01-project-sites-excerpt-en-wfh-glass.sql
-- Target: project_sites.excerpt_en for vancouver-wfh-glass-partition-office
-- Status: NOT APPLIED — requires human to run
-- Gap: row has excerpt_zh set but excerpt_en NULL (zh migration covered title/description/meta; excerpt_en missed)
-- Source: title_en + description_en from same row

BEGIN;

UPDATE project_sites
SET
  excerpt_en = 'Transform your spare room into a dedicated WFH office without sacrificing natural light — custom black-frame glass partition with double swing doors, acoustic privacy, and 1-week installation.'
WHERE slug = 'vancouver-wfh-glass-partition-office'
  AND (excerpt_en IS NULL OR trim(excerpt_en) = '')
  AND id = '6d5050fa-48ec-43c4-8187-ecd814dbb947';

END;

-- Verification (run after apply):
-- SELECT slug, excerpt_en FROM project_sites WHERE slug = 'vancouver-wfh-glass-partition-office';
-- Expected: non-null English excerpt string
