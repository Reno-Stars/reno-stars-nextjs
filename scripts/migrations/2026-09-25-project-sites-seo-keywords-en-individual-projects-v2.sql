-- Migration: 2026-09-25-project-sites-seo-keywords-en-individual-projects-v2.sql
-- Fix: individual-projects seo_keywords_en is set to the slug instead of keywords.
-- Also covers the second project_sites row needing seo_keywords_en (vancouver-wfh-glass-partition-office).
-- Idempotent UPDATE; only fires when NULL or slug-value.
-- NOT APPLIED — needs human to run against the live database.

UPDATE project_sites
SET seo_keywords_en = 'Vancouver renovation projects, individual renovation projects Vancouver, custom home renovation Vancouver, Reno Stars portfolio, Vancouver renovation gallery, residential renovation Vancouver, Metro Vancouver renovation projects',
    updated_at = NOW()
WHERE slug = 'individual-projects'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = 'individual-projects' OR seo_keywords_en NOT LIKE '%,%');

UPDATE project_sites
SET seo_keywords_en = 'Vancouver WFH office conversion, glass partition office Vancouver, home office renovation Vancouver, WFH setup Vancouver, home office conversion costs Vancouver, Vancouver renovation contractor',
    updated_at = NOW()
WHERE slug = 'vancouver-wfh-glass-partition-office'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = 'vancouver-wfh-glass-partition-office' OR seo_keywords_en NOT LIKE '%,%');
