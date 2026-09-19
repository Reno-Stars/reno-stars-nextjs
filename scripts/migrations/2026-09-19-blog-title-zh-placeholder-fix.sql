-- Migration: blog_posts — fix placeholder title_zh + project_scopes scope_zh English fragment
-- Date: 2026-09-19
-- Status: NOT APPLIED — needs human to run against production DB
-- Tables: blog_posts, project_scopes
-- Issue 1: Two blog_posts rows have title_zh = 'Test ZH' — placeholder text never replaced
--          with a real Chinese title before the posts went live.
-- Issue 2: project_scopes row has scope_zh starting with English 'Basketweave'.
--
-- VERIFY (run against live DB):
--   SELECT id, slug, title_en, title_zh FROM blog_posts
--   WHERE id IN ('ae52f455-64eb-40fb-8f4a-7488902c53c3','76e1c252-b1ed-4268-89c5-20958dbb7cbd');
--   SELECT id, project_id, scope_en, scope_zh FROM project_scopes
--   WHERE id = 'f8e80715-aaa1-475f-856b-78b464e987e3';
--
-- FINDINGS (2026-09-19):
--   ae52f455  townhouse-renovation-strata-rules-vancouver-2026  title_zh = 'Test ZH'
--   76e1c252  test-rich-formatting-2026                     title_zh = 'Test ZH'
--   f8e80715  (project scope)                               scope_zh = 'Basketweave 大理石马赛克淋浴地面'
--
-- FIX — Idempotent WHERE guards prevent double-write if re-run after human applies:

-- Issue 1a: townhouse strata rules post — title_zh placeholder
UPDATE blog_posts
SET title_zh = '温哥华联排别墅物业规定装修指南 2026：共管规则、许可与费用'
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND title_zh = 'Test ZH';

-- Issue 1b: test-rich-formatting — title_zh placeholder
UPDATE blog_posts
SET title_zh = '测试富文本格式 2026'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND title_zh = 'Test ZH';

-- Issue 2: scope_zh with English 'Basketweave'
UPDATE project_scopes
SET scope_zh = '编织纹大理石马赛克淋浴地面'
WHERE id = 'f8e80715-aaa1-475f-856b-78b464e987e3'
  AND scope_zh = 'Basketweave 大理石马赛克淋浴地面';

--
-- NOT APPLIED — needs human review before execution.
