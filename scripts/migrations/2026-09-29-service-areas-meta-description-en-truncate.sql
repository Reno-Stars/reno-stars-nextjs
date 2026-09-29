-- Migration: service_areas — meta_description_en truncation (richmond, west-vancouver)
-- Date: 2026-09-29
-- Status: NOT APPLIED — needs human to run against production DB
-- Topic: Ladder 1 (Content Integrity) — field length violations
-- Source: service_areas table
-- Finding: richmond meta_description_en = 163 chars (hard cap 155); west-vancouver = 157 chars (hard cap 155)
-- Fix: Trim to ≤155 chars by removing trailing phrases
--
-- VERIFICATION QUERY (run against live DB before and after):
--   SELECT slug, LENGTH(meta_description_en) as len
--   FROM service_areas
--   WHERE slug IN ('richmond','west-vancouver')
--   ORDER BY len DESC;
--
-- EXPECTED AFTER: richmond ≤155, west-vancouver ≤155

UPDATE service_areas
SET meta_description_en = CASE slug
  WHEN 'richmond'
    THEN 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Visit our showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty.'
  WHEN 'west-vancouver'
    THEN 'Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-house builds. British Properties, Ambleside. 3-yr warranty. $5M insured.'
  ELSE meta_description_en
END
WHERE slug IN ('richmond', 'west-vancouver');

-- NOT APPLIED — needs human review before execution.
