-- Migration: service_areas — meta_description_en truncation fix
-- Date: 2026-09-19
-- Status: NOT APPLIED — needs human to run against production DB
-- Table: service_areas
-- Column: meta_description_en (varchar 155 hard limit)
-- Issue: Two rows exceed the 155-char limit — Postgres will reject INSERT if this
--         column is ever used in an UPDATE/INSERT without truncation.
--
-- VERIFY (run against live DB):
--   SELECT slug, LENGTH(meta_description_en) AS len FROM service_areas
--   WHERE slug IN ('richmond','west-vancouver');
--
-- FINDINGS (2026-09-19):
--   richmond         : 163 chars (limit 155) — exceeds by 8
--   west-vancouver   : 157 chars (limit 155) — exceeds by 2
--
-- FIX:
UPDATE service_areas
SET meta_description_en = CASE slug
  WHEN 'richmond'       THEN 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty. Free quote.'
  WHEN 'west-vancouver' THEN 'Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-house builds. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.'
  ELSE meta_description_en
END
WHERE slug IN ('richmond', 'west-vancouver');
--
-- NOT APPLIED — needs human review before execution.
