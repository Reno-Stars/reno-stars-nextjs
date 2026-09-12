-- Migration: blog_posts — seo_keywords_en for townhouse-reno-vancouver-2026
-- Date: 2026-09-12
-- Status: NOT APPLIED — needs human to run
-- Topic: ladder item 2 (schema/metadata on existing pages)
-- Issue: post "townhouse-reno-vancouver-2026" is published but seo_keywords_en is null
--          (seo_keywords_zh already covered by cc0fe43b on this branch)
-- Source: DB query confirming null; focus_keyword_en = "townhouse renovation strata rules Vancouver"
-- NOT APPLIED — this credential is SELECT-only; human must run before publish

UPDATE blog_posts
SET seo_keywords_en = 'townhouse renovation strata rules,strata renovation Vancouver,BC strata rules townhouse,Vancouver townhouse renovation permits,Metro Vancouver townhouse renovation,strata approval process,townhouse renovation vote requirements,BC strata renovation voting'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
AND is_published = true
AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
