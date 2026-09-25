-- Migration: 2026-09-25-focus-keyword-en-dedup-coquitlam-condo.sql
-- Target: blog_posts.focus_keyword_en
-- Issue: 3 published posts share focus_keyword_en = 'Coquitlam condo renovation'.
--   This dilutes SEO authority — each post should have a distinct keyword.
--   The most general post keeps the broad keyword; case studies get specific angles.
-- Idempotent: WHERE slug + old keyword guard ensures re-run is safe.
-- NOT APPLIED — needs human to run against the live database.
--
-- Keep:  coquitlam-condo-renovation-case-study         (general condo renovation — keeps broad keyword)
-- Angle: coquitlam-condo-whole-house-renovation-case-study → 'Coquitlam condo whole-house renovation'
-- Angle: coquitlam-condo-renovation-case-study-2        → 'Coquitlam condo renovation cost'

UPDATE blog_posts
SET focus_keyword_en = 'Coquitlam condo whole-house renovation',
    updated_at = NOW()
WHERE slug = 'coquitlam-condo-whole-house-renovation-case-study'
  AND focus_keyword_en = 'Coquitlam condo renovation';

UPDATE blog_posts
SET focus_keyword_en = 'Coquitlam condo renovation cost',
    updated_at = NOW()
WHERE slug = 'coquitlam-condo-renovation-case-study-2'
  AND focus_keyword_en = 'Coquitlam condo renovation';
