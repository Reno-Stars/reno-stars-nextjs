-- 2026-09-08-blog-posts-test-zh-fix.sql
-- Fix English "Test ZH" placeholder in title_zh on two test blog posts.
-- NOT APPLIED — needs human to run.
-- Idempotent: WHERE guard ensures it only hits the intended rows.
UPDATE blog_posts
SET
  title_zh = CASE
    WHEN slug = 'townhouse-renovation-strata-rules-vancouver-2026' THEN '测试帖子：完整验证'
    WHEN slug = 'test-rich-formatting-2026' THEN '测试富文本格式 2026'
    ELSE title_zh
  END,
  excerpt_zh = CASE
    WHEN slug = 'townhouse-renovation-strata-rules-vancouver-2026' THEN '使用格式正确的内容测试博客API发布。'
    WHEN slug = 'test-rich-formatting-2026' THEN '测试富文本格式，包括表格和其他元素。'
    ELSE excerpt_zh
  END
WHERE id IN ('ae52f455-64eb-40fb-8f4a-7488902c53c3', '76e1c252-b1ed-4268-89c5-20958dbb7cbd')
  AND title_zh = 'Test ZH';
