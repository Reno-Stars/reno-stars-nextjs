/*
 * Migration: Deduplicate focus_keyword_en for Coquitlam condo renovation cluster.
 * Run: pnpm db:query -f scripts/migrations/2026-09-29-focus-keyword-en-dedup-coquitlam-condo.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Context: DB audit 2026-09-29 found 3 published posts sharing "Coquitlam condo renovation".
 * Dedup strategy: keep the most general post's keyword; give others distinct angles.
 *
 * - coquitlam-condo-renovation-case-study        → stays: "Coquitlam condo renovation"
 * - coquitlam-condo-renovation-case-study-2     → "Coquitlam condo renovation for resale"
 * - coquitlam-condo-whole-house-renovation-case-study → "Coquitlam whole-house condo renovation"
 */

BEGIN;

-- Case study 2: distinct angle = "for resale"
UPDATE blog_posts
SET focus_keyword_en = 'Coquitlam condo renovation for resale'
WHERE slug = 'coquitlam-condo-renovation-case-study-2'
  AND focus_keyword_en = 'Coquitlam condo renovation';

-- Whole-house case study: distinct angle = "whole-house"
UPDATE blog_posts
SET focus_keyword_en = 'Coquitlam whole-house condo renovation'
WHERE slug = 'coquitlam-condo-whole-house-renovation-case-study'
  AND focus_keyword_en = 'Coquitlam condo renovation';

COMMIT;
