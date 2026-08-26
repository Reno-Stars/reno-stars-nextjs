-- Migration: blog_posts excerpt_zh for pre-sale-renovation-white-rock-bc-2026
-- Row: id 34e43ef8-6fde-4ef9-ac66-3f46f99b9df6
-- NOT APPLIED — needs human review and execution
UPDATE blog_posts
SET excerpt_zh = '白石预出售装修投资回报指南2026：面向Semiahmoo和Ocean Park卖家的精选项目。厨房、浴室和海岸路缘提升装修，在白石海滩市场销售时回报率达成本的150%至300%。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
