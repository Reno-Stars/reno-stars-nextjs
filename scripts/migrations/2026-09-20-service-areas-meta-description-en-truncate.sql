-- Migration: NOT APPLIED — needs human to run
-- 2026-09-20 service_areas.meta_description_en truncation fix
-- Source: DB query — 2 rows exceed varchar 155
-- idempotent WHERE guard ensures no double-write
--
-- Truncated values:
--   richmond (id: 3c5aa447-404e-4fdd-8cf9-dc4759885c1c):
--     OLD len=163: "Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Visit our showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty. Free quote."
--     NEW len=155: "Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Visit our showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty."
--   west-vancouver (id: e375930b-2520-4b2d-a42b-d69336f1be30):
--     OLD len=157: "Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-house builds. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote."
--     NEW len=151: "Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-house builds. British Properties, Ambleside. 3-yr warranty. $5M insured."

BEGIN;

UPDATE service_areas
SET meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Visit our showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty.'
WHERE id = '3c5aa447-404e-4fdd-8cf9-dc4759885c1c'
  AND char_length(meta_description_en) > 155;

UPDATE service_areas
SET meta_description_en = 'Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-house builds. British Properties, Ambleside. 3-yr warranty. $5M insured.'
WHERE id = 'e375930b-2520-4b2d-a42b-d69336f1be30'
  AND char_length(meta_description_en) > 155;

COMMIT;
