-- Migration: fix excerpt_zh for test-rich-formatting-2026 (76e1c252)
--
-- Status as of 2026-09-08:
--   - meta_title_zh and meta_description_zh were fixed by 2026-09-08-test-post-meta-zh-placeholder.sql
--   - excerpt_zh is STILL "Test ZH" (7 chars) — a separate field, not covered by that migration
--   - The post is published (is_published=true) and has genuine EN content about rich formatting
--
-- NOT APPLIED — run manually after review:
--   pnpm db:query -f scripts/migrations/2026-09-08-test-rich-formatting-excerpt-zh.sql
--
UPDATE blog_posts SET
  excerpt_zh = '這是一篇用於演示博客格式功能的技術測試文章，驗證各類排版元素是否正確顯示。'
WHERE slug = 'test-rich-formatting-2026'
  AND id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND (excerpt_zh IS NULL OR excerpt_zh !~ '[一-鿿]' OR char_length(excerpt_zh) < 20);
