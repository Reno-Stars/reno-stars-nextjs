-- Migration: replace placeholder title_zh and meta_title_zh values in two published
-- test posts with proper Traditional Chinese equivalents.
--
-- Both posts have Chinese content rendered via localizations but the direct
-- title_zh and meta_title_zh fields contain "Test ZH" — a placeholder that
-- should not appear in structured data or RSS feeds.
--
-- NOT APPLIED — needs human run:
--   pnpm db:query -f scripts/migrations/2026-09-08-published-test-posts-title-zh-placeholder.sql
--
-- Post 1: townhouse-renovation-strata-rules-vancouver-2026 (ae52f455)
--   title_zh       : "Test ZH"  → "温哥华联排别墅装修strata规则2026"
--   meta_title_zh  : "Test ZH"  → "温哥华联排别墅装修strata规则2026 | 聚星装修"
--
-- Post 2: test-rich-formatting-2026 (76e1c252)
--   title_zh       : "Test ZH"  → "测试富文本格式2026"
--   meta_title_zh  : "Test ZH"  → "测试富文本格式2026 | 聚星装修"

-- ── Post 1 ──────────────────────────────────────────────────────────────────
UPDATE blog_posts SET
  title_zh      = '温哥华联排别墅装修strata规则2026',
  meta_title_zh = '温哥华联排别墅装修strata规则2026 | 聚星装修'
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND title_zh = 'Test ZH';

-- ── Post 2 ──────────────────────────────────────────────────────────────────
UPDATE blog_posts SET
  title_zh      = '测试富文本格式2026',
  meta_title_zh = '测试富文本格式2026 | 聚星装修'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND title_zh = 'Test ZH';
