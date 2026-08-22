-- 2026-08-22-blog-content-zh-draft-placeholder.sql
-- blog_posts content_zh contains editorial placeholder text, not real translated content.
-- NOT APPLIED — needs human review before running.

BEGIN;

-- adu-renovation-vancouver-2026
-- content_zh currently contains: "<!-- 待编辑团队完整翻译。EN draft 已通过 publish=false 入库供审阅。 -->"
-- This is an editorial placeholder, not translated content. Clear it pending professional translation.
UPDATE blog_posts
SET content_zh = NULL
WHERE slug = 'adu-renovation-vancouver-2026'
  AND published_at IS NOT NULL;

COMMIT;
