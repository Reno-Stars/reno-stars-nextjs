---
title: "Truncate service_areas.meta_description_en for port-coquitlam (153 > 155 chars)"
---
-- Fix: port-coquitlam meta_description_en is 153 chars (limit 155).
-- Trim to fit within Google's SERP truncation threshold.
UPDATE service_areas
SET meta_description_en = 'Home renovation contractor Port Coquitlam: kitchen $25K-$45K, bathroom $15K-$30K. Citadel Heights, Oxford Heights, Lincoln Park. $5M insured. Free quote.',
    updated_at = NOW()
WHERE slug = 'port-coquitlam'
  AND CHAR_LENGTH(meta_description_en) > 155;
