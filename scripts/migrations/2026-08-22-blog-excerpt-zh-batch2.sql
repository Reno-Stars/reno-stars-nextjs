/**
 * Migration: Set excerpt_zh for 7 blog posts — batch 2 (remaining posts missing excerpt_zh).
 * Run: pnpm db:query -f scripts/migrations/2026-08-22-blog-excerpt-zh-batch2.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-22-blog-excerpt-zh-batch2.sql
 */

-- Basement Renovation New Westminster 2026
UPDATE blog_posts SET excerpt_zh = '新西敏地下室翻新：分区规定、热门项目及2026年温哥华都市区投资回报分析。' WHERE id = '02fbb003-b3d6-4ed9-8c64-302601db37b6' AND (excerpt_zh IS NULL OR excerpt_zh = ' ');

-- Pre-Sale Renovation West Vancouver BC 2026
UPDATE blog_posts SET excerpt_zh = '温哥华西区售前翻新：最大化房产价值的装修策略，2026年投资回报指南。' WHERE id = 'cba2639e-a408-4a0c-8543-9f81b5c5422e' AND (excerpt_zh IS NULL OR excerpt_zh = ' ');

-- Pre-Sale Renovation Surrey BC 2026
UPDATE blog_posts SET excerpt_zh = '素里售前翻新：上市前提升房产价值的最佳装修项目，2026年投资回报指南。' WHERE id = '02f69e00-ad87-4665-a4b0-8316d78db673' AND (excerpt_zh IS NULL OR excerpt_zh = ' ');

-- Pre-Sale Renovation Port Coquitlam BC 2026
UPDATE blog_posts SET excerpt_zh = '满江埠售前翻新：在竞争激烈的市场中最大化房产价值的装修策略。' WHERE id = 'f4d49e71-3d4d-4f9a-ae46-efd741c63c8e' AND (excerpt_zh IS NULL OR excerpt_zh = ' ');

-- Pre-Sale Renovation Langley BC 2026
UPDATE blog_posts SET excerpt_zh = '兰里售前翻新：公寓及独立屋上市前装修，2026年投资回报分析。' WHERE id = '6db67571-7d0e-455c-a88b-4601ed53a6e1' AND (excerpt_zh IS NULL OR excerpt_zh = ' ');

-- Whole House Renovation White Rock 2026
UPDATE blog_posts SET excerpt_zh = '白石全屋翻新：成本、规划及2026年海景房产装修指南。' WHERE id = '90eab35f-6c73-4e54-8fe2-3a127f0ba35c' AND (excerpt_zh IS NULL OR excerpt_zh = ' ');

-- Surrey Renovation Permits Guide 2026
UPDATE blog_posts SET excerpt_zh = '素里装修许可证指南：2026年分区规定、施工许可及申请流程。' WHERE id = '1caa85a5-3449-469c-b1fc-9c9054ec8efe' AND (excerpt_zh IS NULL OR excerpt_zh = ' ');
