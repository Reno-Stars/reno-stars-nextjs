/**
 * Migration: Populate seo_keywords_zh for townhouse-reno-vancouver-2026.
 * Run: pnpm db:query -f scripts/migrations/2026-10-02-blog-seo-keywords-zh-townhouse-reno.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Context: DB audit 2026-10-02 found 1 published post with seo_keywords_zh IS NULL.
 * Keywords derived from title_zh + focus_keyword_zh.
 *
 * title_zh:        "大温哥华联排别墅翻新：2026年分层物业法规与许可证完全指南"
 * focus_keyword_zh: "联排别墅翻新"
 */

BEGIN;

UPDATE blog_posts
SET seo_keywords_zh = '联排别墅翻新,大温哥华联排别墅翻新,BC省共管物业装修,联排别墅许可证,温哥华联排别墅改建,分层物业批准流程,联排别墅翻新费用,共管物业装修规定,温哥华住宅翻新,联排别墅改造2026'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND seo_keywords_zh IS NULL; -- guard: only if still NULL

COMMIT;
