-- Migration: 2026-09-15-project-image-pairs-before-alt-text-zh.sql
-- Task: Ladder 1 — Content integrity, project_image_pairs.before_alt_text_zh NULL (16 rows)
-- NOT APPLIED — needs human to run and verify
-- All 16 rows have before_image_url=null (social-ready images, after-only).
-- before_alt_text_zh derived from existing after_alt_text_zh pattern: replace "改造后 N" with "改造前 N".
-- Projects: Family Townhouse Kitchen, Budget-Friendly Bathroom Burnaby, Coquitlam Condo Kitchen,
--   Kitchen Custom Cabinets, Bathroom Custom Glass Door, Two Bathroom Family.

UPDATE project_image_pairs
SET before_alt_text_zh =
  CASE
    WHEN id = 'f92464e9-1447-4a26-8b48-3eead69542de' THEN '家庭联排别墅厨房翻新 - 改造前 3'
    WHEN id = 'a56fab00-9b26-421d-a7c3-c2c8a71044f5' THEN '温哥华预算友好型卫生间翻新 - 改造前 5'
    WHEN id = '1002e4a5-8d8f-4f7d-8bab-7a8dda5533b9' THEN '高贵林公寓厨房翻新 — 石英石台面 - 改造前 2'
    WHEN id = '6b135417-aa87-470b-838b-62a9e47d39a2' THEN '厨房翻新 — 定制橱柜与石英石台面 - 改造前 6'
    WHEN id = 'b6e5abf5-0b8b-4f39-ae7d-e39bdfa0f6c3' THEN '厨房翻新 — 定制橱柜与石英石台面 - 改造前 4'
    WHEN id = '07860f02-d3bc-4d48-a10c-d44287606e75' THEN '厨房翻新 — 定制橱柜与石英石台面 - 改造前 7'
    WHEN id = 'f95e7ba0-1f58-4fff-83cd-b9c16807a77f' THEN '厨房翻新 — 定制橱柜与石英石台面 - 改造前 5'
    WHEN id = '461bf7db-1a65-4b79-a0ad-ee2530b925bc' THEN '厨房翻新 — 定制橱柜与石英石台面 - 改造前 3'
    WHEN id = 'e3412f0c-11f2-4bde-a1ca-c10fc91bd69d' THEN '家庭联排别墅厨房翻新 - 改造前 6'
    WHEN id = '4aabe80b-0631-45b4-896a-d8aefa62ef1c' THEN '卫生间翻新 — 定制玻璃门 - 改造前 5'
    WHEN id = '6f1ea06d-cb51-4765-b609-882a2c67f6d0' THEN '卫生间翻新 — 定制玻璃门 - 改造前 4'
    WHEN id = '57227518-03f4-43be-b451-cf6b5829a8dd' THEN '卫生间翻新 — 定制玻璃门 - 改造前 6'
    WHEN id = 'ead9ff15-c1ac-41fd-a125-5d0c81cea9b1' THEN '家庭联排别墅厨房翻新 - 改造前 4'
    WHEN id = 'beb3828e-862a-4d48-bce2-08660f4b9c91' THEN '家庭联排别墅厨房翻新 - 改造前 5'
    WHEN id = 'f196a0da-5ad0-4d6a-a64d-10d98c8c234c' THEN '家庭联排别墅厨房翻新 - 改造前 7'
    WHEN id = '0f943a70-cc70-41bb-98fd-ac5e5538ec52' THEN '家庭的两个卫生间翻新 - 改造前 5'
    ELSE before_alt_text_zh
  END
WHERE id IN (
  'f92464e9-1447-4a26-8b48-3eead69542de',
  'a56fab00-9b26-421d-a7c3-c2c8a71044f5',
  '1002e4a5-8d8f-4f7d-8bab-7a8dda5533b9',
  '6b135417-aa87-470b-838b-62a9e47d39a2',
  'b6e5abf5-0b8b-4f39-ae7d-e39bdfa0f6c3',
  '07860f02-d3bc-4d48-a10c-d44287606e75',
  'f95e7ba0-1f58-4fff-83cd-b9c16807a77f',
  '461bf7db-1a65-4b79-a0ad-ee2530b925bc',
  'e3412f0c-11f2-4bde-a1ca-c10fc91bd69d',
  '4aabe80b-0631-45b4-896a-d8aefa62ef1c',
  '6f1ea06d-cb51-4765-b609-882a2c67f6d0',
  '57227518-03f4-43be-b451-cf6b5829a8dd',
  'ead9ff15-c1ac-41fd-a125-5d0c81cea9b1',
  'beb3828e-862a-4d48-bce2-08660f4b9c91',
  'f196a0da-5ad0-4d6a-a64d-10d98c8c234c',
  '0f943a70-cc70-41bb-98fd-ac5e5538ec52'
)
AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');
