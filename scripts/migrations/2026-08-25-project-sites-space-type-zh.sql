-- Migration: project_sites space_type_zh + seo_keywords_zh — batch 1 (2026-08-25)
-- Status: NOT APPLIED — needs human to run after PR merge
-- Source: live DB query this run (2026-08-25)
--
-- QUERY RUN:
--   SELECT id, slug, title_en, title_zh, duration_zh, space_type_zh
--   FROM project_sites
--   WHERE space_type_zh IS NULL OR space_type_zh = ''
--
-- SPACE_TYPE_ZH logic: derived from title_zh / project type
--   whole-house renovations -> 独立屋 (detached house)
--   WFH office conversion   -> 办公室 (office space)
--   individual-projects     -> 装修项目 (renovation project)
--
-- DURATION_ZH: 2 rows needed (from English, derived from comparable projects)
--   richmond-whole-house-renovation-three-bathrooms -> 7-9周

-- Fix space_type_zh for 8 rows
UPDATE project_sites SET space_type_zh = CASE slug
    WHEN 'richmond-whole-house-renovation-3'   THEN '独立屋'
    WHEN 'surrey-whole-house-renovation'         THEN '独立屋'
    WHEN 'coquitlam-whole-house-renovation'     THEN '独立屋'
    WHEN 'richmond-whole-house-renovation-2'   THEN '独立屋'
    WHEN 'richmond-whole-house-renovation'       THEN '独立屋'
    WHEN 'vancouver-wfh-glass-partition-office' THEN '办公室'
    ELSE space_type_zh
END
WHERE id IN (
    '251a78d6-53dc-4fce-abba-163192389c67',
    '0eb5a3ea-ca5c-47ee-8d41-835b922ae7d8',
    '64f0f111-4920-434f-ab7e-0c2c411e6633',
    'e399244f-cd07-46ee-96b6-0de18d7f692a',
    '7fa25131-3f23-4622-9069-3a55658a3247',
    '06f0051b-be50-4c8a-a5a6-2ddd53722e5a',
    '6d5050fa-48ec-43c4-8187-ecd814dbb947'
)
AND (space_type_zh IS NULL OR space_type_zh = '');

-- Fix duration_zh for richmond-whole-house-renovation-three-bathrooms (id: 0e6748db)
UPDATE project_sites SET duration_zh = '7-9周'
WHERE id = '0e6748db-5c75-4c6b-91e3-179b84ebe030'
AND (duration_zh IS NULL OR duration_zh = '');

-- Fix seo_keywords_zh for 2 rows
UPDATE project_sites SET seo_keywords_zh = CASE slug
    WHEN 'richmond-whole-house-renovation-three-bathrooms'
        THEN '列治文全屋翻新,新增三间浴室,列治文装修,全屋装修,浴室翻新,厨房装修,地板更新'
    WHEN 'vancouver-wfh-glass-partition-office'
        THEN 'WFH,居家办公,玻璃隔断,办公室改造,温哥华办公室,在家工作装修,办公室隔断'
    ELSE seo_keywords_zh
END
WHERE id IN (
    '0e6748db-5c75-4c6b-91e3-179b84ebe030',
    '6d5050fa-48ec-43c4-8187-ecd814dbb947'
)
AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
