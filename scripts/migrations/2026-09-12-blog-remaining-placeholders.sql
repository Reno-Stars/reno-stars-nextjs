-- Migration: Fix remaining placeholder title_zh and meta_description_zh for 2 test posts.
-- Run: pnpm db:query -f scripts/migrations/2026-09-12-blog-remaining-placeholders.sql
--
-- NOT APPLIED — needs human to run after PR merge.
--
-- These two posts were created as technical API validation tests.
-- Their Chinese fields are English placeholders — they must not be live.
-- title_zh and meta_description_zh remain as "Test ZH" despite the
-- 2026-09-07 migration fixing excerpt_zh only.
--
-- 1. test-rich-formatting-2026 (76e1c252)
--    title_zh: "Test ZH" → "测试富文本格式：2026年温哥华装修测试"
--    meta_description_zh: "Test ZH" → "测试富文本格式与中文内容长度验证：确保发布的文章满足最低字数要求。"
--
-- 2. townhouse-renovation-strata-rules-vancouver-2026 (ae52f455)
--    title_zh: "Test ZH" → "温哥华城市屋装修规定：strata审批完整指南"
--    meta_description_zh: currently "使用格式正确的内容测试博客API发布。" — already real Chinese,
--    no change needed.

BEGIN;

-- 1. test-rich-formatting-2026 — title_zh placeholder → real Chinese translation
UPDATE blog_posts
SET title_zh = '测试富文本格式：2026年温哥华装修测试'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND title_zh = 'Test ZH'
  AND title_zh = 'Test ZH';

-- 2. test-rich-formatting-2026 — meta_description_zh placeholder → real Chinese summary
UPDATE blog_posts
SET meta_description_zh = '测试富文本格式与中文内容长度验证：确保发布的文章满足最低字数要求。'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND meta_description_zh = 'Test ZH'
  AND meta_description_zh = 'Test ZH';

-- 3. townhouse-renovation-strata-rules-vancouver-2026 — title_zh placeholder → real Chinese translation
--    English title: "Townhouse Renovation Strata Rules Vancouver 2026"
UPDATE blog_posts
SET title_zh = '温哥华城市屋装修规定：strata审批完整指南'
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND title_zh = 'Test ZH'
  AND title_zh = 'Test ZH';

COMMIT;
