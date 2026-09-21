-- Migration: NOT YET APPLIED — requires human to run
-- Fix service_areas meta_description_en exceeding varchar 155
-- Richmond (3c5aa44): 163 chars → truncate to 155
-- West Vancouver (e375930b): 157 chars → truncate to 155
-- Idempotent: UPDATE only if current value still exceeds 155

UPDATE service_areas
SET meta_description_en = SUBSTRING(
    'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. '
    '21300 Gordon Way. English & Mandarin. 3-yr warranty. Free quote.',
    1, 155
)
WHERE id = '3c5aa447-404e-4fdd-8cf9-dc4759885c1c'
  AND LENGTH(meta_description_en) > 155;

UPDATE service_areas
SET meta_description_en = SUBSTRING(
    'Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-house builds. '
    'British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.',
    1, 155
)
WHERE id = 'e375930b-2520-4b2d-a42b-d69336f1be30'
  AND LENGTH(meta_description_en) > 155;
