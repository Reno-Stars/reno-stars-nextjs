/**
 * Migration: Populate seo_keywords_zh for townhouse-reno-vancouver-2026.
 * Run: pnpm db:query -f scripts/migrations/2026-09-15-blog-seo-keywords-zh-townhouse-reno.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Context: DB audit 2026-09-15 found 1 published post with seo_keywords_zh IS NULL.
 * Keywords derived from title_zh + focus_keyword_zh.
 *
 * title_zh:  "大温联排别墅翻新共管物业规定2026"
 * focus_keyword_zh: "联排别墅翻新"
 */

BEGIN;

UPDATE blog_posts
SET seo_keywords_zh = '大温联排别墅翻新,温哥华联排别墅翻新,共管物业翻新规定,BC共管物业法,联排别墅装修许可,共管物业审批流程,联排别墅翻新费用,大温地区联排别墅装修,共管物业装修规则,温哥华联排别墅改造'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND seo_keywords_zh IS NULL; -- guard: only if still NULL

COMMIT;
