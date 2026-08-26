-- Migration: NOT APPLIED — needs human to run
-- 2026-08-26 blog_posts excerpt_zh for pre-sale-renovation-white-rock-bc-2026
-- id: 34e43ef8-6fde-4ef9-ac66-3f46f99b9df6
-- Row found via: SELECT id, slug, title_en FROM blog_posts WHERE is_published AND excerpt_zh IS NULL
-- All other published blog_posts have excerpt_zh populated (253/253 non-null, 269/269 with CJK)

UPDATE blog_posts
SET excerpt_zh = '2026 年白岩售前装修投资回报指南：面向塞米亚莫区和海洋公园卖家的首选项目。厨房、浴室及海岸线提升，回报率达销售成本的 150–300%，适用于白岩海滩市场。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND (excerpt_zh IS NULL OR excerpt_zh !~ '[一-鿿]');
