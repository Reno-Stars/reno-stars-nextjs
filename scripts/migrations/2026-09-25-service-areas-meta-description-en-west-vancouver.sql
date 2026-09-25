---
title: "Truncate service_areas.meta_description_en for west-vancouver (157 > 155 chars)"
---
-- Fix: west-vancouver meta_description_en is 157 chars (limit 155).
-- Trim "builds" → "build" to save 1 char while preserving meaning.
UPDATE service_areas
SET meta_description_en = 'Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-house build. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.',
    updated_at = NOW()
WHERE slug = 'west-vancouver'
  AND CHAR_LENGTH(meta_description_en) > 155;
