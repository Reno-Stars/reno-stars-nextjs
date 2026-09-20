-- Migration: NOT APPLIED — needs human to run
-- 2026-09-20 project_sites space_type_zh NULL — Richmond whole-house (new) + WFH office (consolidated)
-- Source: DB query — 2 published rows have space_type_zh IS NULL
-- richmond-whole-house-renovation-3: whole-house renovation → '住宅' (residential)
-- vancouver-wfh-glass-partition-office: home-office conversion → '住宅' (residential)
-- idempotent WHERE guard on id ensures no double-write

BEGIN;

UPDATE project_sites
SET space_type_zh = '住宅'
WHERE id IN ('251a78d6-53dc-4fce-abba-163192389c67', '6d5050fa-48ec-43c4-8187-ecd814dbb947')
  AND (space_type_zh IS NULL OR space_type_zh = '');

COMMIT;
