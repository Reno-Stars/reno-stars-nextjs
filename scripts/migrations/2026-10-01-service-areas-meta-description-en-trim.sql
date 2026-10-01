-- 2026-10-01-service-areas-meta-description-en-trim.sql
-- Trim meta_description_en on service_areas to <= 155 chars.
-- NOT APPLIED -- needs human to run before it takes effect.
UPDATE service_areas
SET meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K-$45K, plus basement suites. Visit our showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty. Free quote.'
WHERE id = '3c5aa447-404e-4fdd-8cf9-dc4759885c1c'
  AND LENGTH(meta_description_en) > 155;

UPDATE service_areas
SET meta_description_en = 'Bathroom renovation West Vancouver from $35K-$60K+, plus kitchen & whole-house builds. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.'
WHERE id = 'e375930b-2520-4b2d-a42b-d69336f1be30'
  AND LENGTH(meta_description_en) > 155;
