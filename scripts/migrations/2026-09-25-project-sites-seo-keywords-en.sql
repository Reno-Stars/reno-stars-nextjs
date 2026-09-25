-- Migration: 2026-09-25-project-sites-seo-keywords-en.sql
-- Fix 2 project_sites rows with NULL seo_keywords_en.
-- Idempotent UPDATE with WHERE id guard; only fires when NULL.
-- NOT APPLIED — needs human to run against the live database.
--
-- title_en: "Vancouver WFH Glass Partition Office Conversion"
-- focus_keyword_en: "Vancouver glass partition home office"
UPDATE project_sites
SET seo_keywords_en = 'Vancouver WFH glass partition office, home office conversion Vancouver, glass partition office design, WFH setup Vancouver, home office renovation Vancouver, glass office partition cost, Vancouver home office remodel, WFH space design Metro Vancouver',
    updated_at = NOW()
WHERE id = '6d5050fa-48ec-43c4-8187-ecd814dbb947'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- title_en: "Whole-House Renovation with Three New Bathrooms in Richmond"
-- focus_keyword_en: "whole house renovation richmond"
UPDATE project_sites
SET seo_keywords_en = 'whole house renovation Richmond, Richmond whole home renovation, three bathroom renovation Richmond, full house renovation Richmond BC, whole house renovation cost Richmond, luxury whole-home remodel Richmond, Richmond renovation contractor',
    updated_at = NOW()
WHERE id = '0e6748db-5c75-4c6b-91e3-179b84ebe030'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
