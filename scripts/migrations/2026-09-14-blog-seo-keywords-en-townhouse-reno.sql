/**
 * Migration: Populate seo_keywords_en for townhouse-reno-vancouver-2026.
 * Run: pnpm db:query -f scripts/migrations/2026-09-14-blog-seo-keywords-en-townshouse-reno.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Context: DB audit 2026-09-14 found 1 published post with seo_keywords_en IS NULL.
 * Keywords derived from title_en + focus_keyword_en.
 *
 * title_en:  "Townhouse Renovation in Metro Vancouver Strata Rules and Permits 2026"
 * focus_keyword_en: "townhouse renovation strata rules Vancouver"
 */

BEGIN;

UPDATE blog_posts
SET seo_keywords_en = 'townhouse renovation Vancouver, Metro Vancouver townhouse renovation, strata renovation rules BC, townhouse renovation permits, BC strata approval process, townhouse renovation cost Vancouver, townhouse renovation 2026, strata vote requirements, townhouse renovation strata rules, Vancouver townhouse remodeling'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND seo_keywords_en IS NULL; -- guard: only if still NULL

COMMIT;
