-- Migration: 2026-09-25-blog-seo-keywords-en-townhouse-v2.sql
-- Fix: townhouse-reno-vancouver-2026 seo_keywords_en is set to the SLUG instead of keywords.
-- Idempotent UPDATE; only fires when the value looks like a slug (contains no commas, long dash).
-- NOT APPLIED — needs human to run against the live database.

UPDATE blog_posts
SET seo_keywords_en = 'townhouse renovation strata rules Vancouver, townhouse renovation permits BC, strata renovation requirements, Vancouver townhouse renovation costs, Metro Vancouver townhouse renovation',
    updated_at = NOW()
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND is_published = true
  AND (seo_keywords_en IS NULL
       OR seo_keywords_en = 'townhouse-reno-vancouver-2026'
       OR seo_keywords_en NOT LIKE '%,%');
