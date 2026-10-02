/**
 * Migration: Trim meta_description_en to ≤155 chars for richmond and west-vancouver.
 * Run: pnpm db:query -f scripts/migrations/2026-10-02-service-areas-meta-description-en-trim.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Context: DB audit 2026-10-02 found 2 service_areas with meta_description_en > 155 chars.
 *   richmond:        163 chars → trimmed to 151
 *   west-vancouver:  157 chars → trimmed to 150
 */

BEGIN;

UPDATE service_areas
SET meta_description_en = 'Kitchen & bathroom renovation Richmond BC: $12K–$45K, plus basement suites. 21300 Gordon Way showroom — English & Mandarin. 3-yr warranty. Free quote.'
WHERE slug = 'richmond'
  AND LENGTH(meta_description_en) > 155;

UPDATE service_areas
SET meta_description_en = 'Bathroom renovation West Vancouver from $35K–$60K+, plus kitchen & whole-home. British Properties, Ambleside. 3-yr warranty. $5M insured. Free quote.'
WHERE slug = 'west-vancouver'
  AND LENGTH(meta_description_en) > 155;

COMMIT;
