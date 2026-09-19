-- 2026-09-19: service_areas meta_description_en exceeds 155-char hard limit
-- NOT APPLIED — requires human to run before it takes effect
-- Richmond: 163 chars -> 153 chars
-- West Vancouver: 157 chars -> 155 chars

UPDATE service_areas
SET meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Showroom at 21300 Gordon Way. English & Mandarin. 3-yr warranty. Free quote.'
WHERE slug = 'richmond'
  AND id = '3c5aa447-404e-4fdd-8cf9-dc4759885c1c'
  AND meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Visit our showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty. Free quote.';

UPDATE service_areas
SET meta_description_en = 'Bathroom renovation West Vancouver $35K–$60K+, plus kitchen & whole-house builds. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.'
WHERE slug = 'west-vancouver'
  AND id = 'e375930b-2520-4b2d-a42b-d69336f1be30'
  AND meta_description_en = 'Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-house builds. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.';
