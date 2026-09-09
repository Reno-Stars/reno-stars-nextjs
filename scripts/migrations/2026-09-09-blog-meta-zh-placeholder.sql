/**
 * Migration: Fix meta_description_zh and meta_title_zh placeholder values for 2 published posts.
 * Run: pnpm db:query -f scripts/migrations/2026-09-09-blog-meta-zh-placeholder.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Coverage:
 *   1. test-rich-formatting-2026 (76e1c252) — meta_description_zh was "Test ZH" placeholder;
 *      meta_title_zh was "Test ZH" placeholder. Both derived from existing content_zh.
 *   2. townhouse-renovation-strata-rules-vancouver-2026 (ae52f455) — meta_title_zh was
 *      "Test ZH" placeholder. meta_description_zh was already absent (NULL), not a placeholder.
 *      Derived from English meta fields + content_zh subject matter.
 *
 * Background:
 *   Both posts have real Chinese content in content_zh (over 150 words each).
 *   Their meta_title_zh and meta_description_zh are still "Test ZH" placeholders.
 *   The existing migration 2026-09-07-blog-content-integrity.sql covers excerpt_zh for 76e1c252
 *   only — it did not address meta_description_zh or meta_title_zh.
 */

BEGIN;

-- 1. test-rich-formating-2026 — meta_title_zh placeholder → derived from content_zh
--    content_zh subject: testing table formatting, rich content, Chinese character handling,
--    blog publishing API, renovation contractor Metro Vancouver
UPDATE blog_posts
SET meta_title_zh = '測試富文本格式與內容驗證 2026'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND meta_title_zh = 'Test ZH';

-- 2. test-rich-formatting-2026 — meta_description_zh placeholder → derived from content_zh
--    content_zh subject: testing rich formatting (tables, lists), blog publishing API validation,
--    renovation contractor examples, Metro Vancouver project images
UPDATE blog_posts
SET meta_description_zh = '驗證部落格發布 API 的富文本格式支援：測試表格、清單與中文內容處理，確保裝修公司案例圖片正確顯示。'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND meta_description_zh = 'Test ZH';

-- 3. townhouse-renovation-strata-rules-vancouver-2026 — meta_title_zh placeholder → derived from title_en
--    title_en: "Test Post Full Validation" (this is a test post; use content_zh subject for meaning)
--    content_zh subject: strata renovation rules, Vancouver, permits, approval process
UPDATE blog_posts
SET meta_title_zh = '溫哥華城市屋裝修審批流程與規定 2026'
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND meta_title_zh = 'Test ZH';

COMMIT;
