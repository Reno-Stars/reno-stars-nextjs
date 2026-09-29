/**
 * Migration: Populate seo_keywords_zh for townhouse-reno-vancouver-2026.
 * Run: pnpm db:query -f scripts/migrations/2026-09-29-blog-seo-keywords-zh-townhouse-reno.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Context: DB audit 2026-09-29 found 1 published post with seo_keywords_zh IS NULL.
 * title_zh: "大温联排别墅翻新共管物业规定2026"
 * focus_keyword_zh: "联排别墅翻新"
 * Keywords derived from title_zh + focus_keyword_zh + service context.
 *
 * title_en (for reference): "Townhouse Renovation in Metro Vancouver Strata Rules and Permits 2026"
 */

BEGIN;

UPDATE blog_posts
SET seo_keywords_zh = '大温联排别墅翻新,共管物业规定BC,联排别墅翻新费用2026,温哥华联排别墅装修,BC共管物业批准流程,共管物业投票要求,大温联排别墅翻新许可证,联排别墅翻新共管规定,温哥华联排装修2026,共管物业装修须知'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = ''); -- guard: only if still NULL

COMMIT;
