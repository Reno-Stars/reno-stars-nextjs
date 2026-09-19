-- Migration: project_sites.meta_description_zh — richmond-whole-house-renovation-3
-- Row: id=251a78d6-53dc-4fce-abba-163192389c67
-- Problem: meta_description_zh is 30 chars, truncated from description_zh; needs a proper
--   meta description derived from the project's Chinese content.
-- NOT APPLIED — needs human to run after infra gate

UPDATE project_sites
SET meta_description_zh = '列治文全屋装修：浴缸改现代淋浴，灰色瓷砖配黑色水件，无框玻璃门。查看完整改造效果。'
WHERE id = '251a78d6-53dc-4fce-abba-163192389c67'
  AND meta_description_zh = '探索这项列治文全屋装修，特色现代卫生间翻新，配以时尚的装饰。';
