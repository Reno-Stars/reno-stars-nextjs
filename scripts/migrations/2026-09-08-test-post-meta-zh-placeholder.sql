-- Migration: fix meta_title_zh and meta_description_zh for two published test posts
-- that contain English placeholder "Test ZH" instead of real Chinese content.
--
-- Post 1: test-rich-formatting-2026 (76e1c252-b1ed-4268-89c5-20958dbb7cbd)
--   title_en = "Test Rich Formatting 2026"
--   meta_title_zh = "Test ZH"  (placeholder — no CJK characters)
--   meta_description_zh = "Test ZH"  (placeholder — no CJK characters)
--
-- Post 2: townhouse-renovation-strata-rules-vancouver-2026 (ae52f455-64eb-40fb-8f4a-7488902c53c3)
--   title_en = "Test Post Full Validation"
--   meta_title_zh = "Test ZH"  (placeholder — no CJK characters)
--   meta_description_zh = "使用正确内容和有效字段测试博客API发布。"  (already CJK, leave it)
--
-- These posts were published with validateDraft not yet enforced (pre #361) and
-- got past early INSERT gates because the zh fields were not checked there.
-- No migration for this repo has ever touched these rows.
--
-- NOT APPLIED — run manually after review:
--   pnpm db:query -f scripts/migrations/2026-09-08-test-post-meta-zh-placeholder.sql
--
-- UPDATE 1: test-rich-formatting-2026
UPDATE blog_posts SET
  meta_title_zh    = '溫哥華裝修測試文章：表格格式示範',
  meta_description_zh = '這是一篇用於測試博客API發布功能的技術測試文章，驗證表格格式和所有必填欄位是否正確運作。'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND (meta_title_zh IS NULL OR meta_title_zh !~ '[一-鿿]');

-- UPDATE 2: townhouse-renovation-strata-rules-vancouver-2026
-- meta_description_zh already has CJK; only fix meta_title_zh here.
UPDATE blog_posts SET
  meta_title_zh = '溫哥華聯排別墅裝修：共管物业规定与许可证2026'
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND (meta_title_zh IS NULL OR meta_title_zh !~ '[一-鿿]');
