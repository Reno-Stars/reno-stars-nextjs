-- Migration: 2026-09-23
-- Table: service_areas
-- Column: meta_description_en
-- Issue: Richmond (163) and West Vancouver (157) exceed varchar 155
-- Action: truncate to 155 chars
-- Status: NOT APPLIED — needs human to run

-- Richmond: id 3c5aa447-404e-4fdd-8cf9-dc4759885c1c (163 chars → 155)
UPDATE service_areas
SET meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K–$45K. Showroom at 21300 Gordon Way. 3yr warranty. Free quote.'
WHERE id = '3c5aa447-404e-4fdd-8cf9-dc4759885c1c'
  AND LENGTH(meta_description_en) > 155;

-- West Vancouver: id e375930b-2520-4b2d-a42b-d69336f1be30 (157 chars → 155)
UPDATE service_areas
SET meta_description_en = 'Bathroom renovation West Vancouver from $35K–$60K+. Kitchen & whole-house builds. British Properties, Ambleside. 3yr warranty, $5M insured. Free quote.'
WHERE id = 'e375930b-2520-4b2d-a42b-d69336f1be30'
  AND LENGTH(meta_description_en) > 155;
