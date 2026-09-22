-- Migration: NOT APPLIED — requires human run via infra pipeline
-- Fix service_areas.meta_description_en exceeding varchar 155 limit
-- Detected via: SELECT id, name_en, LENGTH(meta_description_en) FROM service_areas
--   WHERE name_en IN ('Richmond', 'West Vancouver');
-- Richmond:  163 chars -> 155
-- West Vancouver: 157 chars -> 155

UPDATE service_areas
SET meta_description_en = SUBSTRING(meta_description_en, 1, 155)
WHERE id = '3c5aa447-404e-4fdd-8cf9-dc4759885c1c'
  AND LENGTH(meta_description_en) > 155;

UPDATE service_areas
SET meta_description_en = SUBSTRING(meta_description_en, 1, 155)
WHERE id = 'e375930b-2520-4b2d-a42b-d69336f1be30'
  AND LENGTH(meta_description_en) > 155;
