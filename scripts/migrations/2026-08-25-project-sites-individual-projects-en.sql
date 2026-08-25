-- Migration: 2026-08-25-project-sites-individual-projects-en.sql
-- Target: project_sites row id=64f0f111-4920-434f-ab7e-0c2c411e6633 (slug=individual-projects)
-- Fields missing: excerpt_en, focus_keyword_en, meta_title_en, meta_description_en
--
-- NOT APPLIED — needs a human to run this file against the production database.
-- DO NOT run this migration more than once on the same database.
-- Run with: psql $DATABASE_URL -f scripts/migrations/2026-08-25-project-sites-individual-projects-en.sql

-- Verify row still needs migration (idempotent guard)
UPDATE project_sites
SET
  excerpt_en = 'Browse standalone renovation project case studies completed by Reno Stars across Metro Vancouver — kitchens, bathrooms, whole-home, and commercial spaces.',
  focus_keyword_en = 'renovation projects Vancouver Metro',
  meta_title_en = 'Renovation Project Case Studies | Reno Stars',
  meta_description_en = 'Browse Reno Stars renovation project case studies across Metro Vancouver — kitchens, bathrooms, whole-home, and commercial spaces.'
WHERE id = '64f0f111-4920-434f-ab7e-0c2c411e6633'
  AND (
    excerpt_en IS NULL
    OR focus_keyword_en IS NULL
    OR meta_title_en IS NULL
    OR meta_description_en IS NULL
  );
