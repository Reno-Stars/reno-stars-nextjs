-- 2026-09-16: blog_posts Chinese placeholder fix — 2 test posts
-- title_zh, meta_title_zh, and meta_description_zh contain "Test ZH" placeholder text.
-- These posts (ae52f455-, 76e1c252-) are unpublished test entries.
-- NOT APPLIED — requires human to run before any publish attempt.
--
-- Post 1 (ae52f455): townhouse-renovation-strata-rules-vancouver-2026
--   title_en:  "Test Post Full Validation"
--   slug:      townhouse-renovation-strata-rules-vancouver-2026
--   content_zh: "<p>测试中文内容确保超过150个单词的最低发布要求。</p>"
--   Proper zh title:  "温哥华联排别墅翻新共管物业规定与许可2026"
--   Proper meta_title_zh:  "温哥华联排别墅翻新共管物业规定2026 | 聚星装修"
--   Proper meta_description_zh: "温哥华联排别墅翻新需要了解共管物业规定、建筑许可和审批流程。本指南涵盖2026年大温地区联排别墅翻新的完整规定解读。"
--
-- Post 2 (76e1c252): test-rich-formatting-2026
--   title_en:  "Test Rich Formatting 2026"
--   slug:      test-rich-formatting-2026
--   content_zh: "<p>测试中文内容确保超过150个单词的最低发布要求。</p>"
--   Proper zh title:  "温哥华装修丰富格式测试指南2026"
--   Proper meta_title_zh:  "温哥华装修丰富格式测试指南2026 | 聚星装修"
--   Proper meta_description_zh: "测试丰富格式渲染：列表、表格、引用块和代码片段在温哥华装修博客中的展示效果验证。"

UPDATE blog_posts
SET
  title_zh           = CASE id
    WHEN 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
      THEN '温哥华联排别墅翻新共管物业规定与许可2026'
    WHEN '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
      THEN '温哥华装修丰富格式测试指南2026'
  END,
  meta_title_zh      = CASE id
    WHEN 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
      THEN '温哥华联排别墅翻新共管物业规定2026 | 聚星装修'
    WHEN '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
      THEN '温哥华装修丰富格式测试指南2026 | 聚星装修'
  END,
  meta_description_zh = CASE id
    WHEN 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
      THEN '温哥华联排别墅翻新需要了解共管物业规定、建筑许可和审批流程。本指南涵盖2026年大温地区联排别墅翻新的完整规定解读。'
    WHEN '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
      THEN '测试丰富格式渲染：列表、表格、引用块和代码片段在温哥华装修博客中的展示效果验证。'
  END
WHERE id IN ('ae52f455-64eb-40fb-8f4a-7488902c53c3', '76e1c252-b1ed-4268-89c5-20958dbb7cbd')
  AND (title_zh = 'Test ZH' OR meta_title_zh = 'Test ZH' OR meta_description_zh = 'Test ZH')
;
