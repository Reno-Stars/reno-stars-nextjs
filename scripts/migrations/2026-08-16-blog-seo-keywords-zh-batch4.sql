/**
 * Migration: Set seo_keywords_zh for 10 blog posts (batch 4 of content-gap migration).
 * Run: pnpm db:query -f scripts/migrations/2026-08-16-blog-seo-keywords-zh-batch4.sql
 *
 * Prerequisite: batches 1-3 applied first (IDs 1-30).
 * NOT APPLIED — needs human to run: pnpm db:query -f scripts/migrations/2026-08-16-blog-seo-keywords-zh-batch4.sql
 */

-- Batch 4: IDs 31-40 (Offset 30, LIMIT 10)
-- Metro Vancouver Renovation Cost Index Oct 2023
UPDATE blog_posts SET seo_keywords_zh = '大温哥华,装修成本,成本指数,2023年10月,房价,装修费用' WHERE id = '38607570-c195-4733-a854-5fcfb9d6690e' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Metro Vancouver Renovation Cost Index May 2025
UPDATE blog_posts SET seo_keywords_zh = '大温哥华,装修成本,成本指数,2025年5月,房价,装修费用' WHERE id = '3a4df7d9-ff99-47bf-b685-019bfc274a26' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Kitchen Renovation New Westminster BC 2026
UPDATE blog_posts SET seo_keywords_zh = '新西敏,厨房翻新,厨房装修,2026,公寓,历史建筑,温哥华' WHERE id = '3c8adf01-c025-44d8-9999-e7eb829a5e0d' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Bathroom Renovation Port Coquitlam 2026
UPDATE blog_posts SET seo_keywords_zh = '高贵林港,浴室装修,浴室翻新,2026,许可证,费用,设计' WHERE id = '3ddc8b6b-10d6-4e27-9295-5732991d77ec' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Bathroom Renovation Coquitlam BC 2026
UPDATE blog_posts SET seo_keywords_zh = '科奎特拉姆,高贵林,浴室装修,2026,许可证,社区指南,费用' WHERE id = '3eb481fc-b867-4f6a-a1f2-a093ed048908' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Metro Vancouver Renovation Cost Index February 2026
UPDATE blog_posts SET seo_keywords_zh = '大温哥华,装修成本,成本指数,2026年2月,房价,装修费用' WHERE id = '3f8b688f-7efc-4f74-89da-03c5f7e7830f' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Metro Vancouver Renovation Cost Index July 2024
UPDATE blog_posts SET seo_keywords_zh = '大温哥华,装修成本,成本指数,2024年7月,房价,装修费用' WHERE id = '405daeed-68c3-4421-aa0d-d85c1d8c7a8a' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Metro Vancouver Renovation Cost Index August 2023
UPDATE blog_posts SET seo_keywords_zh = '大温哥华,装修成本,成本指数,2023年8月,房价,装修费用' WHERE id = '40e10be5-1568-4a56-ae7d-d3777fbd23ec' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Kitchen Renovation Langley BC 2026
UPDATE blog_posts SET seo_keywords_zh = '兰利,厨房翻新,厨房装修,2026,许可证,社区,费用' WHERE id = '42173288-c54d-4186-a470-461694e978a9' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Bathroom Renovation Cost Vancouver by Size
UPDATE blog_posts SET seo_keywords_zh = '温哥华,浴室装修,浴室翻新,费用,3件套,4件套,5件套,尺寸' WHERE id = '42385256-2df5-46a2-a242-2024116e3bb7' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
