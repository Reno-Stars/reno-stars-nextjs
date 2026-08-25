-- Migration: 2026-08-25-project-sites-duration-space-type-zh.sql
-- Table: project_sites
-- Columns: duration_zh, space_type_zh
-- Rows: 7 published project_sites that still have NULL zh values
-- Source: live DB query 2026-08-25, cross-referenced with existing migration coverage
--
-- NOT APPLIED — needs human to run after review

-- space_type_zh = '独立屋' (independent house) for all whole-house renovations
UPDATE project_sites SET space_type_zh = '独立屋'
  WHERE id = '0eb5a3ea-ca5c-47ee-8d41-835b922ae7d8'
    AND (space_type_zh IS NULL OR space_type_zh = '');

UPDATE project_sites SET space_type_zh = '独立屋'
  WHERE id = 'e399244f-cd07-46ee-96b6-0de18d7f692a'
    AND (space_type_zh IS NULL OR space_type_zh = '');

UPDATE project_sites SET space_type_zh = '独立屋'
  WHERE id = '7fa25131-3f23-4622-9069-3a55658a3247'
    AND (space_type_zh IS NULL OR space_type_zh = '');

UPDATE project_sites SET space_type_zh = '独立屋'
  WHERE id = '06f0051b-be50-4c8a-a5a6-2ddd53722e5a'
    AND (space_type_zh IS NULL OR space_type_zh = '');

-- duration_zh — infer from project title and similar projects
-- richmond-whole-house-renovation-three-bathrooms (3-bath full Reno): 8-10 weeks like other 3-bath projects
UPDATE project_sites SET duration_zh = '8-10周'
  WHERE id = '0e6748db-5c75-4c6b-91e3-179b84ebe030'
    AND (duration_zh IS NULL OR duration_zh = '');

-- vancouver-wfh-glass-partition (WFH renovation): shorter scope, 4-6 weeks
UPDATE project_sites SET duration_zh = '4-6周'
  WHERE id = '6d5050fa-48ec-43c4-8187-ecd814dbb947'
    AND (duration_zh IS NULL OR duration_zh = '');
