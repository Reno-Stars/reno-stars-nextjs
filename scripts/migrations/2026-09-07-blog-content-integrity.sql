/**
 * Migration: Fix excerpt_zh, focus_keyword_en, and seo_keywords_en for 3 published posts.
 * Run: pnpm db:query -f scripts/migrations/2026-09-07-blog-content-integrity.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Coverage:
 *   1. test-rich-formatting-2026   (76e1c252) — excerpt_zh was "Test ZH" placeholder;
 *      correct value derived from existing content_zh body.
 *   2. metro-vancouver-renovation-cost-index-november-2023 (55dbdb54) — seo_keywords_zh
 *      was set but seo_keywords_en was NULL; en keywords derived from title_en + focus_keyword_zh.
 *   3. vancouver-property-type-renovation-2026 (625cdf1c) — both focus_keyword_en and
 *      seo_keywords_en were NULL; derived from title_en.
 */

BEGIN;

-- 1. test-rich-formatting-2026 — excerpt_zh placeholder → real Chinese summary
--    content_zh: "<p>测试中文内容确保超过150个单词的最低发布要求。</p>"
--    Derived from content_zh subject matter: testing rich formatting, Chinese content length.
UPDATE blog_posts
SET excerpt_zh = '测试富文本格式与中文内容长度验证：确保发布的文章满足最低字数要求。'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND excerpt_zh = 'Test ZH'
  AND excerpt_zh = 'Test ZH'; -- guard: only if still the placeholder

-- 2. metro-vancouver-renovation-cost-index-november-2023 — seo_keywords_en missing
--    title_en: "Metro Vancouver Renovation Cost Index — November 2023"
--    focus_keyword_zh: "温哥华装修费用 2023年11月"
UPDATE blog_posts
SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno cost index, november 2023 renovation prices, vancouver remodeling cost, vancouver construction cost 2023'
WHERE slug = 'metro-vancouver-renovation-cost-index-november-2023'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- 3. vancouver-property-type-renovation-2026 — focus_keyword_en and seo_keywords_en missing
--    title_en: "House vs Condo vs Townhouse Renovation in Vancouver: What's Different in 2026"
UPDATE blog_posts
SET focus_keyword_en = 'vancouver property type renovation differences',
    seo_keywords_en = 'house vs condo renovation vancouver, vancouver townhouse renovation cost, strata renovation vancouver, vancouver 2026 renovation differences, vancouver renovation property type'
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '')
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

COMMIT;
