-- Migration: 2026-09-01-blog-content-zh-placeholder-stubs.sql
-- 5 published posts have English-first content_zh stubs awaiting translation team.
-- Placeholder marker: "<!-- 待编辑团队完整翻译。EN draft 已通过 publish=false 入库供审阅。 -->"
-- Set content_zh = NULL so Chinese URL falls back to English rather than showing this stub.
-- NOT APPLIED — human must review and run.
UPDATE blog_posts
SET content_zh = NULL
WHERE id IN (
  '48e499c1-38a7-4d00-bf54-b1cdd4568506', -- adu-renovation-vancouver-2026 (148-char English stub)
  'ebafaebf-3060-4dea-8dc3-508be25d95d6', -- split-level-home-renovation-burnaby-coquitlam-2026 (180-char English stub)
  '17e69f50-74b9-469e-8b87-11d3a4ed74ef', -- vancouver-infill-development-cost-2026 (182-char English stub)
  '2311bd71-d249-4143-8d7f-6dfb439c413c', -- heritage-home-renovation-vancouver-2026 (188-char English stub)
  'e6257f9d-a6fe-43ce-b06f-3a7b4304877b'  -- mid-century-rancher-renovation-vancouver-2026 (193-char English stub)
)
AND content_zh IS NOT NULL
  AND content_zh = '<!-- 待编辑团队完整翻译。EN draft 已通过 publish=false 入库供审阅。 -->';
