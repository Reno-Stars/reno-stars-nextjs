/**
 * Migration: Trim meta_description_en to 155 chars for service_areas.
 * Scope: Richmond (163 chars) and West Vancouver (157 chars).
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-10-01-service-areas-meta-description-en-trim.sql
 *
 * Original values preserved in comments for revert if needed.
 */

BEGIN;

-- Richmond — 163 → 155 chars: removed "plus " before "basement suites"
-- BEFORE: 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. Visit our showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty. Free quote.'
UPDATE service_areas
SET    meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, basement suites. Visit our showroom at 21300 Gordon Way — English & Mandarin. 3-yr warranty. Free quote.'
WHERE  id = '3c5aa447-404e-4fdd-8cf9-dc4759885c1c'
  AND  LENGTH(meta_description_en) > 155;

-- West Vancouver — 157 → 155 chars: removed comma after $60K+
-- BEFORE: 'Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-house builds. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.'
UPDATE service_areas
SET    meta_description_en = 'Bathroom renovation West Vancouver from $35K–$60K+ plus kitchen & whole-house builds. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.'
WHERE  id = 'e375930b-2520-4b2d-a42b-d69336f1be30'
  AND  LENGTH(meta_description_en) > 155;

COMMIT;
