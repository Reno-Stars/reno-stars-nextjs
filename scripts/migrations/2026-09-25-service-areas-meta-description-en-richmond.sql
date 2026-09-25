---
title: "Truncate service_areas.meta_description_en for richmond (163 > 155 chars)"
---
-- Fix: richmond meta_description_en is 163 chars (limit 155).
-- Trim to fit within Google's SERP truncation threshold.
UPDATE service_areas
SET meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty. Free quote.',
    updated_at = NOW()
WHERE slug = 'richmond'
  AND CHAR_LENGTH(meta_description_en) > 155;
