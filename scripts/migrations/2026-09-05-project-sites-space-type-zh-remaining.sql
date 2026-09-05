-- Migration: 2026-09-05-project-sites-space-type-zh-remaining.sql
-- Table: project_sites
-- Column: space_type_zh (remaining NULLs after 2026-08-25 batch)
-- Rows: 3 project_sites still NULL
-- NOT APPLIED — needs human to run after review

-- richmond-whole-house-renovation-3: whole house = 独立屋
UPDATE project_sites SET space_type_zh = '独立屋'
  WHERE id = '251a78d6-53dc-4fce-abba-163192389c67'
    AND (space_type_zh IS NULL OR space_type_zh = '');

-- individual-projects: matches title_zh 独立项目
UPDATE project_sites SET space_type_zh = '独立项目'
  WHERE id = '64f0f111-4920-434f-ab7e-0c2c411e6633'
    AND (space_type_zh IS NULL OR space_type_zh = '');

-- vancouver-wfh-glass-partition-office: WFH office renovation = 书房
UPDATE project_sites SET space_type_zh = '书房'
  WHERE id = '6d5050fa-48ec-43c4-8187-ecd814dbb947'
    AND (space_type_zh IS NULL OR space_type_zh = '');
