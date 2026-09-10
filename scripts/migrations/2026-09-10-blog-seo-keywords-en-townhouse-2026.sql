-- 2026-09-10: populate seo_keywords_en for published post townhouse-reno-vancouver-2026
-- NOT APPLIED — needs human to run before it auto-applies on merge
-- Coverage: 1 published post with seo_keywords_en IS NULL
-- keywords derived from post content and focus_keyword: strata rules, permits, BC Strata Property Act, Form B

BEGIN;

UPDATE blog_posts
SET seo_keywords_en = 'townhouse renovation Vancouver, strata renovation Vancouver, BC Strata Property Act, Form B Information Certificate, townhouse renovation permits, townhouse renovation strata approval, Metro Vancouver townhouse renovation, townhouse renovation Burnaby, townhouse renovation Richmond, townhouse renovation Langley, townhouse renovation Coquitlam, townhouse renovation Delta'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

COMMIT;
