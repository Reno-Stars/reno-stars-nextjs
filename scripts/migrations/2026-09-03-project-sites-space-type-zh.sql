-- Migration: 2026-09-03-project-sites-space-type-zh.sql
-- Target: project_sites.space_type_zh — 6 rows are NULL for "whole house renovation" type sites
-- Business logic: "whole house renovation" project sites map to space_type = House / 独立屋
-- Status: NOT APPLIED — requires human to run against agent_ro (read-only) or a write credential
-- Idempotent WHERE guard: only updates rows where space_type_zh IS NULL

-- Check which rows this affects (informational SELECT)
SELECT id, slug, title_en, space_type_en, space_type_zh, duration_zh
FROM project_sites
WHERE space_type_zh IS NULL;

-- Migrate the 6 whole-house renovation project sites to House/独立屋
UPDATE project_sites
SET space_type_zh = '独立屋'
WHERE space_type_zh IS NULL
  AND slug IN (
    'richmond-whole-house-renovation-3',
    'surrey-whole-house-renovation',
    'coquitlam-whole-house-renovation',
    'richmond-whole-house-renovation-2',
    'richmond-whole-house-renovation',
    'vancouver-wfh-glass-partition-office'
  );
