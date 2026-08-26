/**
 * Migration: Set meta_title_zh and meta_description_zh for 11 outdoor-test-* blog posts.
 * Run: pnpm db:query -f scripts/migrations/2026-08-26-blog-meta-title-desc-zh-test-posts.sql
 *
 * NOT APPLIED — needs human to run this file. Credential is read-only (agent_ro).
 * Found by: SELECT id, slug, meta_title_zh, meta_description_zh FROM blog_posts
 *            WHERE meta_title_zh IS NULL OR meta_description_zh IS NULL
 *            LIMIT 20;
 */

BEGIN;

UPDATE blog_posts
SET
  meta_title_zh = CASE slug
    WHEN 'outdoor-test-post-001' THEN '温哥华商业装修价格指南2026 | Reno Stars'
    WHEN 'outdoor-test-post-002' THEN '温哥华商业装修省钱技巧 | Reno Stars'
    WHEN 'outdoor-test-post-003' THEN '温哥华餐厅装修成本2026 | Reno Stars'
    WHEN 'outdoor-test-post-004' THEN '温哥华办公室装修费用2026 | Reno Stars'
    WHEN 'outdoor-test-post-005' THEN '温哥华零售店铺装修价格 | Reno Stars'
    WHEN 'outdoor-test-post-006' THEN '温哥华医疗诊所装修成本 | Reno Stars'
    WHEN 'outdoor-test-post-007' THEN '温哥华美容美发沙龙装修费用 | Reno Stars'
    WHEN 'outdoor-test-post-008' THEN '温哥华健身房装修价格指南 | Reno Stars'
    WHEN 'outdoor-test-post-009' THEN '温哥华咖啡厅装修成本2026 | Reno Stars'
    WHEN 'outdoor-test-post-010' THEN '温哥华教育机构装修费用 | Reno Stars'
    WHEN 'outdoor-test-post-011' THEN '温哥华商业装修材料选择指南 | Reno Stars'
    ELSE meta_title_zh
  END,
  meta_description_zh = CASE slug
    WHEN 'outdoor-test-post-001' THEN '了解温哥华商业装修的最新价格范围，包括办公室、餐厅、零售店铺等不同类型商业空间的装修成本分析。'
    WHEN 'outdoor-test-post-002' THEN '温哥华商业装修省钱技巧，了解如何在保证装修质量的前提下控制成本，获取Reno Stars免费报价。'
    WHEN 'outdoor-test-post-003' THEN '温哥华餐厅装修成本详解，包括厨房设备、座位区、通风系统等各部分费用估算。'
    WHEN 'outdoor-test-post-004' THEN '温哥华办公室装修费用全面解析，从基础装修到高端装修不同档次的成本对比。'
    WHEN 'outdoor-test-post-005' THEN '温哥华零售店铺装修价格指南，包括橱窗、货架、照明等装修要点和费用估算。'
    WHEN 'outdoor-test-post-006' THEN '温哥华医疗诊所装修成本分析，符合医疗法规的装修要求和专业装修团队选择。'
    WHEN 'outdoor-test-post-007' THEN '温哥华美容美发沙龙装修费用指南，包括美容设备安装、防水处理等特殊要求。'
    WHEN 'outdoor-test-post-008' THEN '温哥华健身房装修价格指南，健身设备基础要求、防水地板等装修要点。'
    WHEN 'outdoor-test-post-009' THEN '温哥华咖啡厅装修成本2026，包括吧台设计、咖啡设备、通风系统等费用详情。'
    WHEN 'outdoor-test-post-010' THEN '温哥华教育机构装修费用，包括教室、图书馆、实验室等不同空间的装修要求。'
    WHEN 'outdoor-test-post-011' THEN '温哥华商业装修材料选择指南，帮助商业业主选择适合的装修材料和控制预算。'
    ELSE meta_description_zh
  END
WHERE slug IN (
  'outdoor-test-post-001','outdoor-test-post-002','outdoor-test-post-003',
  'outdoor-test-post-004','outdoor-test-post-005','outdoor-test-post-006',
  'outdoor-test-post-007','outdoor-test-post-008','outdoor-test-post-009',
  'outdoor-test-post-010','outdoor-test-post-011'
)
AND (meta_title_zh IS NULL OR meta_description_zh IS NULL);

COMMIT;
