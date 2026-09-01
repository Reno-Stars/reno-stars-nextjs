-- Migration: blog_posts excerpt_zh
-- Target: 1 blog_post with NULL excerpt_zh
-- NOT APPLIED — needs human review and execution
UPDATE blog_posts
SET excerpt_zh = '白石（White Rock）售前装修 ROI 指南 2026：为 Semiahmoo 和 Ocean Park 卖家精选项目。厨房、卫生间及海岸线外观升级，装修费用回报率达售价的 150–300%。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
