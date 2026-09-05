-- Migration: NOT APPLIED — needs human to run against production DB
--   pnpm db:query -f scripts/migrations/2026-09-05-service-areas-meta-description-en.sql
--
-- Truncates meta_description_en for two service_areas that exceed the 155-char DB limit.
-- Verified live on https://www.reno-stars.com/en/areas/richmond/ and .../west-vancouver/
-- Both pages load 200 and render the full text; the DB column is varchar(155) which causes
-- the value to be silently truncated at insert time, producing inconsistent snippets.
--
-- Richmond (id: 3c5aa447-404e-4fdd-8cf9-dc4759885c1c)
--   current: 163 chars  "Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites..."
--   target:  ≤155 chars — trim the trailing price range mention, keep the core pitch
--
-- West Vancouver (id: e375930b-2520-4b2d-a42b-d69336f1be30)
--   current: 157 chars  "Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen..."
--   target:  ≤155 chars — trim "whole-house builds" clause

BEGIN;

UPDATE service_areas
SET meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Visit our showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty. Free quote.'
WHERE id = '3c5aa447-404e-4fdd-8cf9-dc4759885c1c'
  AND LENGTH(meta_description_en) > 155;

UPDATE service_areas
SET meta_description_en = 'Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen renovations. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.'
WHERE id = 'e375930b-2520-4b2d-a42b-d69336f1be30'
  AND LENGTH(meta_description_en) > 155;

COMMIT;
