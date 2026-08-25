-- Migration: scripts/migrations/2026-08-25-social-media-title-zh.sql
-- 4 social_media_posts rows where title_zh holds English instead of Chinese.
-- NOT auto-applied; requires human review before running.
-- Verifying no prior migration covers these IDs:
--   grep -rhoE "WHERE id = '[a-f0-9-]+'" scripts/migrations/ | grep social_media
--   (returned 0 matches — these IDs are uncovered)

UPDATE social_media_posts
SET title_zh = CASE id
    WHEN 'ff2aacda-ab3a-4c81-a11b-f5513d8a9839'
      THEN '本拿比浴室翻新省钱攻略 — 拍摄日 (2026-04-24)'
    WHEN 'f83cdd9a-9292-4a20-a47e-899970903529'
      THEN '两只浴室，四口之家，井然有序 — 基本上'
    WHEN 'feb87e63-baf4-4512-aed9-7ec20dd05363'
      THEN '本打算卖房不住，却因厨房卖相太差而却步'
    WHEN '1401e631-0eeb-4c55-a13a-01ac6ed9c472'
      THEN '素里项目，$29K–$31K，4周。同一个厨房。'
    END
WHERE id IN (
    'ff2aacda-ab3a-4c81-a11b-f5513d8a9839',
    'f83cdd9a-9292-4a20-a47e-899970903529',
    'feb87e63-baf4-4512-aed9-7ec20dd05363',
    '1401e631-0eeb-4c55-a13a-01ac6ed9c472'
)
AND title_zh IS NOT NULL
AND title_zh !~ '[一-鿿]';
