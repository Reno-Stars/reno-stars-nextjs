-- Migration: 2026-09-30-service-areas-meta-description-en-trim.sql
-- Table: service_areas
-- Target:  richmond (163 chars) and west-vancouver (157 chars) — both exceed 155-char varchar limit
-- Fix:     trim to LEFT(meta_description_en, 155) — cuts mid-sentence but preserves readability
-- Status:  NOT APPLIED — needs human to run it before it takes effect
--
-- Verify before applying:
--   SELECT slug, name_en, CHAR_LENGTH(meta_description_en) AS len
--   FROM service_areas
--   WHERE slug IN ('richmond', 'west-vancouver')
--   ORDER BY len DESC;

UPDATE service_areas
SET meta_description_en = LEFT(meta_description_en, 155)
WHERE slug = 'richmond'
  AND CHAR_LENGTH(meta_description_en) > 155;

UPDATE service_areas
SET meta_description_en = LEFT(meta_description_en, 155)
WHERE slug = 'west-vancouver'
  AND CHAR_LENGTH(meta_description_en) > 155;

-- Verify after applying:
--   SELECT slug, name_en, CHAR_LENGTH(meta_description_en) AS len
--   FROM service_areas
--   WHERE slug IN ('richmond', 'west-vancouver')
--   ORDER BY len DESC;
