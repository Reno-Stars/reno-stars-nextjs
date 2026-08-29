-- Migration: populate missing excerpt_zh for blog_posts
-- Row: id=34e43ef8-6fde-4ef9-ac66-3f46f99b9df6 (slug=pre-sale-renovation-white-rock-bc-2026)
-- Status: NOT APPLIED — needs human to run this file
UPDATE blog_posts
SET excerpt_zh = '白石预售装修投资回报指南2026：面向Semiahmoo及Ocean Park卖家精选项目。厨房、浴室和海岸线升级装修，在白石海滩市场回报率高达150%至300%。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
