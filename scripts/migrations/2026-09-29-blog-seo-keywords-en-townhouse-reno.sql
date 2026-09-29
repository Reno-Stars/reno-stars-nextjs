/*
 * Migration: Populate seo_keywords_en for townhouse-reno-vancouver-2026.
 * Run: pnpm db:query -f scripts/migrations/2026-09-29-blog-seo-keywords-en-townhouse-reno.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Context: townhouse-reno-vancouver-2026 has both seo_keywords_en AND seo_keywords_zh as NULL.
 * The zh migration (2026-09-29-blog-seo-keywords-zh-townhouse-reno.sql) handles zh keywords.
 * This file handles en keywords.
 *
 * title_en: "Townhouse Renovation in Metro Vancouver Strata Rules and Permits 2026"
 * focus_keyword_en: "Townhouse Renovation Metro Vancouver Strata"
 * focus_keyword_zh: "联排别墅翻新"
 */

BEGIN;

UPDATE blog_posts
SET seo_keywords_en = 'Metro Vancouver townhouse renovation,strata rules BC,townhouse renovation costs 2026,Vancouver townhouse remodeling,BC strata approval process,strata voting requirements,Metro Vancouver townhouse renovation permits,townhouse renovation strata rules,Vancouver townhouse renovation 2026,strata renovation guidelines'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

COMMIT;
