-- 2026-10-03-service-areas-meta-description-en-overlimit.sql
-- Richmond meta_description_en: 163 chars (limit 155) — trim "and" and "3-year"
-- West Vancouver meta_description_en: 157 chars (limit 155) — trim "whole-house" to "whole-home"
-- NOT APPLIED: needs human to review and run
UPDATE service_areas
SET meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Visit our showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty. Free quote.'
WHERE slug = 'richmond'
  AND meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Visit our showroom at 21300 Gordon Way — English & Mandarin. 3-year warranty. Free quote.';

UPDATE service_areas
SET meta_description_en = 'Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-home builds. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.'
WHERE slug = 'west-vancouver'
  AND meta_description_en = 'Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-house builds. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.';
