-- Migration: 2026-08-29 blog excerpt_zh — pre-sale-renovation-white-rock-bc-2026
-- Date: 2026-08-29
-- Status: NOT APPLIED — human action required
-- Topic: Add missing excerpt_zh for one published blog post
-- IDs covered: 34e43ef8-6fde-4ef9-ac66-3f46f99b9df6
--
-- This post has full title_zh and content_zh (3,600+ char) but excerpt_zh is NULL.
-- Source query: SELECT id, slug FROM blog_posts WHERE excerpt_zh IS NULL;
-- Row count: 1

UPDATE blog_posts
SET excerpt_zh = '怀特罗克预售翻新2026：Morgan Creek、南素里独立屋及海滨公寓装修ROI分析。厨房浴室翻新回报160-225%，附海滩防潮材料选择与许可证攻略。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND excerpt_zh IS NULL;
