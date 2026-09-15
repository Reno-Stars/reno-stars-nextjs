-- Migration: 2026-09-15-social-media-title-zh.sql
-- Task: Ladder 1 — Content integrity, social_media_posts.title_zh English-only
-- NOT APPLIED — needs human to run and verify
-- 4 rows where title_zh duplicates the English title instead of a Chinese translation
UPDATE social_media_posts
SET title_zh = CASE id
  WHEN 'ff2aacda-ab3a-4c81-a11b-f5513d8a9839' THEN '本拿比经济型浴室翻新 — 视频日记 (2026-04-24)'
  WHEN 'f83cdd9a-9292-4a20-a47e-899970903529' THEN '两个浴室，一个忙碌的家庭，井井有条。'
  WHEN 'feb87e63-baf4-4512-aed9-7ec20dd05363' THEN '原本计划卖房不住，但厨房预算影响了挂牌价。'
  WHEN '1401e631-0eeb-4c55-a13a-01ac6ed9c472' THEN '素里，$29K–$31K，4周。同样的厨房。'
  ELSE title_zh
END
WHERE id IN (
  'ff2aacda-ab3a-4c81-a11b-f5513d8a9839',
  'f83cdd9a-9292-4a20-a47e-899970903529',
  'feb87e63-baf4-4512-aed9-7ec20dd05363',
  '1401e631-0eeb-4c55-a13a-01ac6ed9c472'
)
AND title_zh IS NOT NULL
AND title_zh !~ '[一-鿿]';
