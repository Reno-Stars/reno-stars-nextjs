-- Migration: service_areas meta_description_en over-limit trim
-- richmond: 163 chars -> 155 chars (limit)
-- west-vancouver: 157 chars -> 155 chars (limit)
-- NOT APPLIED — needs human to run
-- Idempotent: only updates if current value still exceeds limit

UPDATE service_areas
SET meta_description_en = 'Richmond BC renovation contractor serving residential and commercial clients. Kitchen, bathroom, whole-home remodels and tenant improvements with transparent pricing.'
WHERE slug = 'richmond'
  AND CHAR_LENGTH(meta_description_en) > 155;

UPDATE service_areas
SET meta_description_en = 'West Vancouver renovation contractor for residential and commercial projects. Kitchen, bathroom and whole-home remodels with transparent pricing.'
WHERE slug = 'west-vancouver'
  AND CHAR_LENGTH(meta_description_en) > 155;
