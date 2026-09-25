-- Migration: 2026-09-25-project-sites-seo-keywords-en-individual-projects.sql
-- Fix 1 project_sites row with NULL seo_keywords_en.
-- Idempotent UPDATE with WHERE slug guard; only fires when NULL.
-- NOT APPLIED — needs human to run against the live database.
--
-- title_en: "Individual Projects"
-- focus_keyword_zh: "溫哥華獨立裝修項目" (Vancouver individual renovation projects)
-- This is a catch-all page for individually-managed projects.
-- No focus_keyword_en is set, so derive from the zh equivalent + general Reno Stars keywords.

UPDATE project_sites
SET seo_keywords_en = 'Vancouver renovation projects, individual renovation projects Vancouver, custom home renovation Vancouver, Reno Stars portfolio, Vancouver renovation gallery, residential renovation Vancouver, Metro Vancouver renovation projects',
    updated_at = NOW()
WHERE slug = 'individual-projects'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
