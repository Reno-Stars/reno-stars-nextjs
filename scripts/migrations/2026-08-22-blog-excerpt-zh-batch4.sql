/**
 * Migration: Set excerpt_zh for 14 blog posts — truly new (not in pending batches 2/3).
 * Run: pnpm db:query -f scripts/migrations/2026-08-22-blog-excerpt-zh-batch4.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-22-blog-excerpt-zh-batch4.sql
 *
 * IDs excluded (already covered by pending batches 2+3):
 *   02fbb003, cba2639e, 02f69e00, f4d49e71, 6db67571, 90eab35f, 1caa85a5,
 *   66e06686, b3fc215e, c24c8d8a, 9739d7cc, c15a3d9f, c5b0ec68, 3ddc8b6b,
 *   fd7f0748, f576d97c, 7bfed8e7, 8fb0d159, d261406c, d9d0877e, e2200a9a, f0691cdb
 */

-- Burnaby Home Renovation 2026
UPDATE blog_posts SET excerpt_zh = '本拿比翻新2026：Metrotown、Brentwood、Lougheed等社区装修费用、许可证申请及投资回报分析。' WHERE id = '44ce6c72-bdff-4b15-956f-091b4a483aaf' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- Coquitlam Home Renovation 2026
UPDATE blog_posts SET excerpt_zh = '高贵林翻新2026：Burke Mountain、Coquitlam Centre等社区装修费用、许可证与分区规定。' WHERE id = '746a5a1e-f204-4461-80c5-07f54f2797ce' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- Delta Home Renovation 2026
UPDATE blog_posts SET excerpt_zh = 'Delta翻新2026：Ladner、Tsawwassen、北三角洲装修费用、许可证及社区特点。' WHERE id = 'fe6c5026-02df-4dd5-b21f-01ae46358656' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- Langley Home Renovation 2026
UPDATE blog_posts SET excerpt_zh = '兰里翻新2026：Willoughby、Langley City等社区装修费用、许可证与投资回报分析。' WHERE id = 'fe32a970-c27e-468e-9841-34f22a7e60fe' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- Maple Ridge Home Renovation 2026
UPDATE blog_posts SET excerpt_zh = '枫树岭翻新2026：Haney、Albion、Silver Valley等社区装修费用、许可证及翻新攻略。' WHERE id = '32736ae2-862a-4956-ad16-cfe8d311c8e5' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- New Westminster Home Renovation 2026
UPDATE blog_posts SET excerpt_zh = '新西敏翻新2026：Queens Park、Fraser Hill等社区装修费用、许可证与历史建筑翻新要点。' WHERE id = 'ae3b018b-2452-460c-b2be-6f0295ce201a' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- North Vancouver Home Renovation 2026
UPDATE blog_posts SET excerpt_zh = '北温哥华翻新2026：Lonsdale、Lynn Valley等社区装修费用、许可证及山景房产翻新攻略。' WHERE id = 'bd3d0048-474b-4a27-bf1b-e1662e4ced91' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- Pre-Sale Renovation Maple Ridge BC 2026
UPDATE blog_posts SET excerpt_zh = '枫树岭预售翻新2026：Silver Valley、Albion、Haney等社区装修增值攻略，出售前投资回报分析。' WHERE id = '6567c57b-8813-4894-b5b7-b69a51295d1a' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- Pre-Sale Renovation North Vancouver BC 2026
UPDATE blog_posts SET excerpt_zh = '北温哥华预售翻新2026：Lynn Valley、Lonsdale、Deep Cove等社区装修增值攻略，出售前投资回报分析。' WHERE id = 'cfdc320d-299c-4d4d-bc64-ae5c168aca11' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- Pre-Sale Renovation White Rock BC 2026
UPDATE blog_posts SET excerpt_zh = '白石镇预售翻新2026：海滨市场装修增值攻略，上市前投资回报分析，华人买家偏好解析。' WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- Richmond Home Renovation 2026
UPDATE blog_posts SET excerpt_zh = '列治文翻新2026：Steveston、Richmond Centre等社区装修费用、许可证与投资回报分析。' WHERE id = '89bce1b4-e13a-4c59-904f-8bd927e64718' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- Surrey Home Renovation 2026
UPDATE blog_posts SET excerpt_zh = '素里翻新2026：Fleetwood、Newton、South Surrey等社区装修费用、许可证与社区特点。' WHERE id = 'bad6eb5a-d9f1-4e89-8754-5cc200947eb7' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- Vancouver Home Renovation 2026
UPDATE blog_posts SET excerpt_zh = '温哥华翻新2026：Kitsilano、Mount Pleasant等社区装修费用、许可证及百年房产翻新要点。' WHERE id = 'ff42b7bf-b12c-4f32-83ba-4f63f664b80e' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- West Vancouver Home Renovation 2026
UPDATE blog_posts SET excerpt_zh = '西温哥华翻新2026：Ambleside、British Properties等社区装修费用、山坡许可证及奢华房产翻新要点。' WHERE id = '27c9242e-44c6-4744-9122-59f830904950' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');

-- White Rock Home Renovation 2026
UPDATE blog_posts SET excerpt_zh = '白石镇翻新2026：海滨房产装修费用、沿海许可证及特殊地形翻新攻略。' WHERE id = '5bb4fbd4-b293-4726-83a6-4bac05598775' AND (excerpt_zh IS NULL OR excerpt_zh = '' OR excerpt_zh = ' ');
