-- Migration: projects focus_keyword_en — batch 1 (2026-08-23)
-- Scope: 5 published projects with English title but missing focus_keyword_en
--  - batch2 covers 5 other projects (0d7d6efd, 9cbc6ccf, 3ef5531b, c8a66604, 018eda65)
-- NOT APPLIED — needs human to run after PR merge
-- Run: pnpm db:query -f scripts/migrations/2026-08-23-projects-focus-keyword-en-batch1.sql

UPDATE projects
SET focus_keyword_en = CASE
    WHEN id = '561278cf-e1cd-453c-8ec7-302075e6cc54'
        THEN 'luxury bathroom renovation Vancouver'
    WHEN id = '9063e628-abf9-411a-a7a4-2ddc179c1689'
        THEN 'hallway bathroom renovation Richmond'
    WHEN id = '838f1ee4-beaa-42e7-bca5-73c810422d76'
        THEN 'kitchen renovation Coquitlam'
    WHEN id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
        THEN 'whole house renovation Delta'
    WHEN id = '331f03b3-624e-4ddf-9b38-c8768d3d1932'
        THEN 'house renovation Richmond'
END
WHERE id IN (
    '561278cf-e1cd-453c-8ec7-302075e6cc54',
    '9063e628-abf9-411a-a7a4-2ddc179c1689',
    '838f1ee4-beaa-42e7-bca5-73c810422d76',
    '7c9a9237-4f64-480b-a2fa-2d14e9faa99f',
    '331f03b3-624e-4ddf-9b38-c8768d3d1932'
)
AND is_published = true
AND (focus_keyword_en IS NULL OR focus_keyword_en = '');
