-- Migration: 2026-09-23
-- Type:    UPDATE (idempotent)
-- Target:  service_areas.meta_description_en exceeding varchar(155)
-- Human action required to apply.
-- Status:  NOT YET APPLIED to database.

-- 1. Richmond (3c5aa447): char_length(meta_description_en) = 163
--    Trimmed to ≤155 chars.
UPDATE service_areas
SET meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty. Free quote.'
WHERE id = '3c5aa447-404e-4fdd-8cf9-dc4759885c1c'
  AND char_length(meta_description_en) > 155;

-- 2. West Vancouver (e375930b): char_length(meta_description_en) = 157
--    Trimmed to ≤155 chars.
UPDATE service_areas
SET meta_description_en = 'Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-house builds. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.'
WHERE id = 'e375930b-2520-4b2d-a42b-d69336f1be30'
  AND char_length(meta_description_en) > 155;
