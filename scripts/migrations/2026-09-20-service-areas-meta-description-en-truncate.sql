-- 2026-09-20-service-areas-meta-description-en-truncate.sql (corrected)
-- Fixes 2 service_areas rows where meta_description_en exceeds varchar 155
-- Richmond: 163 chars -> 152 chars
-- West Vancouver: 157 chars -> 136 chars
-- NOT APPLIED — needs human review before running
-- Idempotent: WHERE on id only; no stale text matching

UPDATE service_areas
SET meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Visit our showroom at 21300 Gordon Way. 3-yr warranty. Free quote.'
WHERE id = '3c5aa447-404e-4fdd-8cf9-dc4759885c1c'
  AND LENGTH(meta_description_en) > 155;

UPDATE service_areas
SET meta_description_en = 'Bathroom renovation West Vancouver from $35K–$60K+, kitchen & whole-house builds. British Properties. 3-yr warranty. $5M insured. Free quote.'
WHERE id = 'e375930b-2520-4b2d-a42b-d69336f1be30'
  AND LENGTH(meta_description_en) > 155;
