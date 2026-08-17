/**
 * Migration: Set seo_keywords_zh for 2 project_sites rows.
 * Run: pnpm db:query -f scripts/migrations/2026-08-16-project-sites-seo-keywords-zh.sql
 *
 * NOT APPLIED — needs human to run: pnpm db:query -f scripts/migrations/2026-08-16-project-sites-seo-keywords-zh.sql
 */

-- Vancouver WFH Glass Partition Office
UPDATE project_sites SET seo_keywords_zh = '温哥华,WFH,居家办公,玻璃隔断,办公室改造,办公室装修' WHERE id = '6d5050fa-48ec-43c4-8187-ecd814dbb947' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Richmond Whole House Renovation Three New Bathrooms
UPDATE project_sites SET seo_keywords_zh = '列治文,全屋翻新,浴室装修,三间浴室,全屋装修,室内装修' WHERE id = '0e6748db-5c75-4c6b-91e3-179b84ebe030' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
