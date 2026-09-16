-- Migration: 2026-09-16-blog-meta-description-en-kitchen-vs-bathroom-reno-vancouver-2026.sql
-- Target: blog_posts.meta_description_en for kitchen-vs-bathroom-reno-vancouver-2026
-- Issue: meta_description_en is "Kitchen vs bathroom Vancouver" (25 chars) — thin placeholder.
--         The article is a full cost/timeline/ROI comparison with a decision framework;
--         the meta description should reflect that depth.
-- Status: NOT APPLIED — needs human to run before publish/merge.
-- Applies ONLY to the identified row (id-based WHERE guard):
UPDATE blog_posts
SET
  meta_description_en = 'Kitchen vs Bathroom Renovation in Vancouver: Which Should You Do First? Compare real costs, timelines, and ROI from actual Reno Stars Metro Vancouver projects to choose the right renovation for your home and budget.',
  meta_description_zh = '温哥华装修：先厨房还是先卫生间？聚星装修基于真实项目对比费用、工期与转售回报，附决策框架，助您为自家做出正确选择。'
WHERE id = 'c88b22eb-13c7-45f6-9597-4a6852742c54'
  AND meta_description_en = 'Kitchen vs bathroom Vancouver';
