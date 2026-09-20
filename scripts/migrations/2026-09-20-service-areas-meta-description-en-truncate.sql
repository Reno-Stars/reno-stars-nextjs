-- Migration: service_areas — truncate meta_description_en to 155 chars
-- Date: 2026-09-20
-- Status: NOT APPLIED — needs human to run
-- Target: richmond (163 chars → 155), west-vancouver (157 chars → 155)
-- Hard limit: varchar 155 on meta_description_en

BEGIN;

UPDATE service_areas
SET meta_description_en = LEFT(meta_description_en, 155)
WHERE id = '3c5aa447-404e-4fdd-8cf9-dc4759885c1c'
  AND LENGTH(meta_description_en) > 155;

UPDATE service_areas
SET meta_description_en = LEFT(meta_description_en, 155)
WHERE id = 'e375930b-2520-4b2d-a42b-d69336f1be30'
  AND LENGTH(meta_description_en) > 155;

COMMIT;
