/**
 * Migration: Populate seo_keywords_zh for two published blog posts.
 * Run: pnpm db:query -f scripts/migrations/2026-09-14-blog-seo-keywords-zh.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Context: DB audit 2026-09-14 found 2 published posts (published_at IS NOT NULL)
 * with seo_keywords_zh IS NULL. Keywords derived from title_zh + focus_keyword_zh.
 * Test posts (slug LIKE 'test-%' OR slug LIKE 'outdoor-test-%') excluded intentionally.
 *
 * Post 1 — slug: townhouse-reno-vancouver-2026
 *   title_zh:  "大温哥华联排别墅翻新：共管物业规定与许可申请指南 2026"
 *   focus_keyword_zh: "联排别墅翻新"
 *   Derived keywords from title + service context (Metro Vancouver strata renovation)
 *
 * Post 2 — slug: adu-vancouver-2026-cost-guide
 *   title_zh:  "温哥华ADU（附属住宅）2026年费用全解"
 *   focus_keyword_zh: "温哥华ADU成本2026"
 *   Derived from title + focus keyword
 */

BEGIN;

-- townhouse-reno-vancouver-2026
UPDATE blog_posts
SET seo_keywords_zh = '大温哥华联排别墅翻新,共管物业翻新规定,BC省联排别墅装修许可,温哥华联排别墅翻新费用2026,共管物业装修申请,大温地区联排别墅改造, strata翻新BC,联排别墅阳台装修,共管物业装修限制,温哥华ADU成本'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND seo_keywords_zh IS NULL;

-- adu-vancouver-2026-cost-guide
UPDATE blog_posts
SET seo_keywords_zh = '温哥华ADU费用2026,温哥华附属住宅成本,ADU建造成本温哥华,温哥华后巷屋装修费用,BC省ADU法规,温哥华套房翻新,独立住宅附属单位费用,温哥华装修成本2026,ADU许可证温哥华,附属住宅投资回报温哥华'
WHERE slug = 'adu-vancouver-2026-cost-guide'
  AND seo_keywords_zh IS NULL;

COMMIT;
