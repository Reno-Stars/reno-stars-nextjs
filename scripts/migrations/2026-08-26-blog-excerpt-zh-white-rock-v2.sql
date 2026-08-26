-- Migration: blog_posts excerpt_zh — White Rock pre-sale post (id confirmed pending)
-- Date: 2026-08-26
-- Status: NOT APPLIED — needs human to run against the database
-- Topic: Content integrity / missing zh excerpt
-- Source: id=34e43ef8-6fde-4ef9-ac66-3f46f99b9df6, slug=pre-sale-renovation-white-rock-bc-2026
-- English excerpt: "White Rock pre-sale renovation ROI guide 2026: top projects for
--   Semiahmoo and Ocean Park sellers. Kitchen, bathroom, and coastal curb appeal
--   upgrades that return 150–300% of cost at sale in the White Rock beach market."
--
-- MIGRATION (idempotent WHERE guard):
UPDATE blog_posts
SET excerpt_zh = '白石预上市翻新投资回报指南 2026：面向 Semiahmoo 和 Ocean Park 卖家的首选项目。厨房、浴室和海岸线外观升级，在白石海滩市场销售时回报率可达 150%–300%。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND (excerpt_zh IS NULL OR excerpt_zh = ''::text);
