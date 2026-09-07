-- Migration: populate seo_keywords_en for one published project_site missing it.
--
-- NOT APPLIED — run manually after review:
--   pnpm db:query -f scripts/migrations/2026-09-07-project-sites-seo-keywords-en.sql
--
-- Coverage check: vancouver-wfh-glass-partition-office already covered in a prior
-- migration; only richmond-whole-house-renovation-three-bathrooms is new.
--
-- Post: richmond-whole-house-renovation-three-bathrooms
--   title_en: "Whole-House Renovation with Three New Bathrooms in Richmond"
--   focus_keyword_en: "whole house renovation richmond"
--   seo_keywords_zh already set: "列治文,全屋翻新,浴室装修,三间浴室,全屋装修,室内装修"

UPDATE project_sites SET
  seo_keywords_en = 'whole house renovation richmond,richmond whole house renovation,richmond renovation three bathrooms,full house renovation richmond bc,renovating whole house richmond,richmond renovation cost 2026,richmond bc renovation contractor'
WHERE slug = 'richmond-whole-house-renovation-three-bathrooms'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
