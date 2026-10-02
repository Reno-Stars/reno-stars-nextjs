-- Clear English-only zh fields from unpublished blog posts with partial English content.
-- Post 76e1c252 (test-rich-formatting-2026): Chinese content/excerpt but English
--   focus_keyword_zh, meta_description_zh, meta_title_zh.
-- Post ae52f455 (townhouse-renovation-strata-rules-vancouver-2026): Chinese all
--   fields except meta_title_zh = "Test ZH".
-- NOT APPLIED — needs human to run.
-- 2026-10-02

UPDATE blog_posts SET
  focus_keyword_zh    = NULL,
  meta_description_zh = NULL,
  meta_title_zh      = NULL
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND is_published = false
  AND focus_keyword_zh IS NOT NULL AND focus_keyword_zh !~ '[一-鿿]';

UPDATE blog_posts SET
  meta_title_zh = NULL
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND is_published = false
  AND meta_title_zh IS NOT NULL AND meta_title_zh !~ '[一-鿿]';
