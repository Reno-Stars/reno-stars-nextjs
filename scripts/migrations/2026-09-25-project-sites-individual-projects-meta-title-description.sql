-- Migration: 2026-09-25-project-sites-individual-projects-meta-title-description.sql
-- Fix: project_sites row 'individual-projects' (id=64f0f111-4920-434f-ab7e-0c2c411e6633)
--   has NULL meta_title_en AND NULL meta_description_en.
-- This is a NEW finding not covered by existing migrations on branch
-- (existing migrations cover focus_keyword, seo_keywords, duration but NOT meta).
-- Inferred from: title_en='Individual Projects', focus_keyword_en='Vancouver renovation projects',
-- and pattern from other project_sites rows.
-- WHERE guards ensure idempotency.
-- NOT YET APPLIED — pending ops run.

UPDATE project_sites
SET meta_title_en = 'Individual Renovation Projects Vancouver | Reno Stars',
    updated_at = NOW()
WHERE slug = 'individual-projects'
  AND meta_title_en IS NULL;

UPDATE project_sites
SET meta_description_en = 'Browse portfolio of individual renovation projects across Metro Vancouver. Kitchen, bathroom, whole-home renovations by Reno Stars — view our completed work.',
    updated_at = NOW()
WHERE slug = 'individual-projects'
  AND meta_description_en IS NULL;
