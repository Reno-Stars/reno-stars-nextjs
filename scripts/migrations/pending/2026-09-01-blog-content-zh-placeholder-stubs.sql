-- Migration: 2026-09-01-blog-content-zh-placeholder-stubs.sql (REPLACES prior version with wrong guard)
-- 5 published posts have English-first content_zh stubs awaiting translation team.
-- Guard: char_length(content_zh) < 200 catches the actual English bleed (148-193 chars).
-- Set content_zh = NULL so Chinese URL falls back to English rather than showing English content.
-- NOT APPLIED — human must review and run.
UPDATE blog_posts
SET content_zh = NULL
WHERE id IN (
  '48e499c1-38a7-4d00-bf54-b1cdd4568506', -- adu-renovation-vancouver-2026 (148-char English bleed)
  'ebafaebf-3060-4dea-8dc3-508be25d95d6', -- split-level-home-renovation-burnaby-coquitlam-2026 (180-char English bleed)
  '17e69f50-74b9-469e-8b87-11d3a4ed74ef', -- vancouver-infill-development-cost-2026 (182-char English bleed)
  '2311bd71-d249-4143-8d7f-6dfb439c413c', -- heritage-home-renovation-vancouver-2026 (188-char English bleed)
  'e6257f9d-a6fe-43ce-b06f-3a7b4304877b'  -- mid-century-rancher-renovation-vancouver-2026 (193-char English bleed)
)
AND char_length(content_zh) < 200;
