-- Migration: social_media_posts.title_zh — backfill Chinese titles for posts with English-only titles
-- NOT APPLIED — requires human to run against the live database
-- 4 rows identified: title_zh is NULL or matches title_en (English verbatim)
-- Idempotent: UPDATE with WHERE id IN (...) guard

UPDATE social_media_posts
SET title_zh = CASE id
  WHEN 'ff2aacda-ab3a-4c81-a11b-f5513d8a9839'
    THEN 'Burnaby 省钱浴室翻新 — 拍摄日 (2026-04-24)'
  WHEN 'f83cdd9a-9292-4a20-a47e-899970903529'
    THEN '两个浴室，一个忙碌家庭，零混乱 — 大概。'
  WHEN 'feb87e63-baf4-4512-aed9-7ec20dd05363'
    THEN '本来计划卖房不住 — 但厨房会拉低房价。'
  WHEN '1401e631-0eeb-4c55-a13a-01ac6ed9c472'
    THEN 'Surrey，$29K–$31K，4周。同一套厨房。'
END
WHERE id IN (
  'ff2aacda-ab3a-4c81-a11b-f5513d8a9839',
  'f83cdd9a-9292-4a20-a47e-899970903529',
  'feb87e63-baf4-4512-aed9-7ec20dd05363',
  '1401e631-0eeb-4c55-a13a-01ac6ed9c472'
)
AND (
  title_zh IS NULL
  OR title_zh = title_en
);
