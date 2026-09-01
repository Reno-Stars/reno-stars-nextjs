-- Migration: Set duration_en and duration_zh for richmond-whole-house-renovation-three-bathrooms
-- Source: project_sites.duration_en is NULL; comparable projects show 7-9 weeks for Richmond whole-house.
-- Comparable rows read this run:
--   richmond-whole-house-renovation-4   -> duration_en = '7-9 weeks'
--   surrey-whole-house-renovation        -> duration_en = '6-8 weeks'
--   burnaby-whole-house-renovation-3     -> duration_en = '9-11 weeks'
-- This project adds 3 bathrooms (above typical), so 8-12 weeks is a reasonable conservative estimate.
-- duration_zh is left as NULL: no verified Chinese duration text in DB or source material.
-- NOT APPLIED — needs human review and execution.
UPDATE project_sites
SET
  duration_en = '8-12 weeks',
  updated_at = NOW()
WHERE slug = 'richmond-whole-house-renovation-three-bathrooms'
  AND (duration_en IS NULL OR duration_en = '');
