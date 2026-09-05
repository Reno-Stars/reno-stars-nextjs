-- Migration: 2026-09-05-projects-badge-zh-delta.sql
-- Table: projects
-- Column: badge_zh
-- Status: NOT APPLIED — requires human to run against live DB
-- Only 1 new row; 10 others already covered by prior pending migrations.

UPDATE projects SET badge_zh = '三角洲全屋装修'
  WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
    AND (badge_zh IS NULL OR badge_zh = '');
