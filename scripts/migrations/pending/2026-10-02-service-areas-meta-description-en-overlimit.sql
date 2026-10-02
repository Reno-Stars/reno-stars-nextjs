-- Migration: NOT APPLIED — needs human run
-- Deduces richmond and west-vancouver meta_description_en overruns
-- (163 and 157 chars respectively; hard limit is 155)
-- idempotent WHERE guard prevents double-update

BEGIN;

UPDATE service_areas
SET meta_description_en = CASE(slug)
    WHEN 'richmond'
    THEN 'Expert renovation services in Richmond BC — kitchen, bathroom, whole-home & commercial projects by 聚星装修. Free consultations available.'
    WHEN 'west-vancouver'
    THEN 'West Vancouver renovation contractor — kitchen, bathroom, whole-home & commercial builds by 聚星装修. Free consultations.'
    ELSE meta_description_en
END
WHERE slug IN ('richmond', 'west-vancouver')
  AND char_length(meta_description_en) > 155;

COMMIT;
