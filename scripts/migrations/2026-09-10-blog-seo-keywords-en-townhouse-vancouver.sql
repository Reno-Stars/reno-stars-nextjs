-- Migration: populate seo_keywords_en for published post
-- townhouse-reno-vancouver-2026 (e50092a6-59f9-45a1-8ad3-4db06f6048ba)
-- Focus keyword: townhouse renovation strata rules Vancouver
-- NOT APPLIED — run manually after review:
--
UPDATE blog_posts SET
  seo_keywords_en = 'townhouse renovation strata rules Vancouver,Metro Vancouver townhouse renovation,strata approval renovation Vancouver,townhouse renovation permits BC,strata renovation guidelines Vancouver,2026 townhouse renovation Vancouver'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
