/**
 * Migration: Set seo_keywords_zh for 2 published project_sites missing this field.
 * Run: pnpm db:query -f scripts/migrations/2026-09-01-project-sites-seo-keywords-zh.sql
 *
 * NOT APPLIED — needs human to run after PR review.
 * IDs covered here are NOT in any previous seo_keywords_zh migration.
 */

BEGIN;

-- Richmond Whole House Renovation Three Bathrooms
-- Slug: richmond-whole-house-renovation-three-bathrooms
-- Area: Richmond | Type: Whole House | Scale: 3 bathrooms + full house
UPDATE project_sites
SET seo_keywords_zh = '列治文,全屋翻新,三间浴室,浴室翻新,厨房翻新,全屋装修,列治文装修公司,室内装修'
WHERE id = '0e6748db-5c75-4c6b-91e3-179b84ebe030'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- Vancouver WFH Glass Partition Office Conversion
-- Slug: vancouver-wfh-glass-partition-office
-- Area: Vancouver | Type: Home Office / WFH
UPDATE project_sites
SET seo_keywords_zh = '温哥华,家庭办公室,居家办公,玻璃隔断,办公室改造,居家工作空间,办公室装修,家居装修'
WHERE id = '6d5050fa-48ec-43c4-8187-ecd814dbb947'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

COMMIT;
