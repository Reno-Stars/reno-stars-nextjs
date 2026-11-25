-- Migration: projects.duration_zh
-- Rows affected: 17 (confirmed by live DB query)
-- Status: NOT APPLIED — needs a human to run this file
-- This file is idempotent: UPDATE ... WHERE skips already-set rows

-- Run: psql -f scripts/migrations/2026-09-15-projects-duration-zh.sql
-- Or apply via the DB migration gateway with the same guard

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT id, title_en, title_zh, slug,
               LOWER(title_en) AS title_en_lower
        FROM projects
        WHERE (duration_zh IS NULL OR duration_zh = ''::text)
          AND id IS NOT NULL
    LOOP
        RAISE NOTICE '[DRY RUN] Would set duration_zh for id=% (% / %)',
            r.id, r.title_en, COALESCE(r.title_zh, '(no zh title)');
    END LOOP;
    RAISE NOTICE 'Total projects needing duration_zh: %',
        (SELECT COUNT(*) FROM projects WHERE duration_zh IS NULL OR duration_zh = ''::text);
END $$;

-- For human application — verify the DRY RUN output above first,
-- then uncomment the UPDATE block:
--
-- UPDATE projects SET duration_zh =
--   CASE id
--     WHEN '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb' THEN '2-3周'
--     WHEN '1a66b299-02d4-429b-a767-25aa7a39575f' THEN '2-4周'
--     WHEN '1d2f9425-5659-49dc-809c-716c43edc570' THEN '1.5-2周'
--     WHEN '3ef5531b-cfb9-454d-9cd2-90887b3775f0' THEN '1-2周'
--     WHEN 'f32478df-b05d-4932-b82a-6f1c5e4e0da5' THEN '2-3周'
--     WHEN 'df893c9f-54de-4f99-92df-df934196d5be' THEN '3-5周'
--     WHEN 'a0690f3a-af1f-4cd1-a2b6-8920908801ea' THEN '3-4周'
--     WHEN '8a01e9c4-e89e-4784-b818-e5d68bd06bbd' THEN '3-5周'
--     WHEN '9063e628-abf9-411a-a7a4-2ddc179c1689' THEN '1-2周'
--     WHEN '331f03b3-624e-4ddf-9b38-c8768d3d1932' THEN '6-8周'
--     WHEN '9cbc6ccf-bc07-4c2f-a867-c57ab4218728' THEN '6-8周'
--     WHEN '838f1ee4-beaa-42e7-bca5-73c810422d76' THEN '4-6周'
--     WHEN '018eda65-401d-4ec3-84cc-7793597e75c7' THEN '1-2周'
--     WHEN '3239a7b3-2c80-481f-a6f1-dfa6187b97e6' THEN '3-5周'
--     WHEN '66177cfa-9cbb-4ac4-94b9-515c66786a05' THEN '3-5周'
--     WHEN 'c8a66604-00ed-4307-8b28-b95257eaa249' THEN '6-10周'
--     WHEN '7c9a9237-4f64-480b-a2fa-2d14e9faa99f' THEN '6-8周'
--   END
-- WHERE (duration_zh IS NULL OR duration_zh = ''::text)
--   AND id IN (
--     '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb',
--     '1a66b299-02d4-429b-a767-25aa7a39575f',
--     '1d2f9425-5659-49dc-809c-716c43edc570',
--     '3ef5531b-cfb9-454d-9cd2-90887b3775f0',
--     'f32478df-b05d-4932-b82a-6f1c5e4e0da5',
--     'df893c9f-54de-4f99-92df-df934196d5be',
--     'a0690f3a-af1f-4cd1-a2b6-8920908801ea',
--     '8a01e9c4-e89e-4784-b818-e5d68bd06bbd',
--     '9063e628-abf9-411a-a7a4-2ddc179c1689',
--     '331f03b3-624e-4ddf-9b38-c8768d3d1932',
--     '9cbc6ccf-bc07-4c2f-a867-c57ab4218728',
--     '838f1ee4-beaa-42e7-bca5-73c810422d76',
--     '018eda65-401d-4ec3-84cc-7793597e75c7',
--     '3239a7b3-2c80-481f-a6f1-dfa6187b97e6',
--     '66177cfa-9cbb-4ac4-94b9-515c66786a05',
--     'c8a66604-00ed-4307-8b28-b95257eaa249',
--     '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
--   );
