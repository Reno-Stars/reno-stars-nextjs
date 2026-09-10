-- Migration: populate seo_keywords_en for two published project_sites
-- NOT APPLIED — run manually after review:
--

UPDATE project_sites SET
  seo_keywords_en = 'Vancouver WFH glass partition office,glass partition home office Vancouver,home office renovation Vancouver,glass partition office conversion Vancouver,work from home office renovation Vancouver,Vancouver home office design'
WHERE id = '6d5050fa-48ec-43c4-8187-ecd814dbb947'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE project_sites SET
  seo_keywords_en = 'whole house renovation Richmond,Richmond whole house renovation cost,full home renovation Richmond,whole house renovation three bathrooms Richmond,Richmond home renovation contractor,Richmond renovation company'
WHERE id = '0e6748db-5c75-4c6b-91e3-179b84ebe030'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
