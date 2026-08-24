/**
 * Migration: Set excerpt_zh for 2 project_sites missing excerpt_zh
 * Scope: project_sites with excerpt_en AND excerpt_zh both NULL (not covered by prior migration)
 * NOT APPLIED — needs human to run:
 *   pnpm db:query -f scripts/migrations/2026-08-24-project-sites-excerpt-zh-batch2.sql
 *
 * IDs excluded (already covered):
 *   vancouver-wfh-glass-partition-office (2026-08-23-project-sites-excerpt-zh.sql)
 *   individual-projects (2026-08-23-project-sites-zh-individual-projects.sql)
 */

BEGIN;

-- Vancouver WFH Glass Partition Office
UPDATE project_sites
SET excerpt_zh = '温哥华居家办公室玻璃隔断改造。定制整高黑框玻璃隔断+玻璃双开门，兼顾采光与隔音。点击了解聚星装修的居家办公室解决方案。'
WHERE slug = 'vancouver-wfh-glass-partition-office'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

-- Individual Projects hub page
UPDATE project_sites
SET excerpt_zh = '浏览聚星装修在大温哥华地区完成的精选装修项目案例，含厨房、浴室、全屋翻新及商业装修。查看真实项目照片和客户评价。'
WHERE slug = 'individual-projects'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

END;
