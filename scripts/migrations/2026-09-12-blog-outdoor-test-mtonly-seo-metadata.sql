-- 2026-09-12-blog-outdoor-test-mtonly-seo-metadata.sql
-- Adds missing SEO metadata to unpublished blog post outdoor-test-mtonly
-- NOT YET APPLIED — requires human to run against production DB
UPDATE blog_posts
SET
  focus_keyword_en  = 'outdoor living space renovation vancouver',
  focus_keyword_zh = '温哥华户外空间装修',
  meta_description_en = 'Deck and patio costs in Vancouver. Permit requirements and the renovation process explained.',
  meta_description_zh = '温哥华甲板和露台装修费用、许可要求及装修流程完整指南。'
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND slug = 'outdoor-test-mtonly'
  AND focus_keyword_en IS NULL;
