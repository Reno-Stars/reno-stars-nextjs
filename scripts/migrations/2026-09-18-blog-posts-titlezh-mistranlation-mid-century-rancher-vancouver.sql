-- Migration: NOT APPLIED — needs human to run
-- Fixes title_zh mistranslation for mid-century-rancher-renovation-vancouver-2026
-- "角色指南" (character role guide) is wrong; correct translation of "Character Guide" is "特色保存指南" (character-preserving guide)
-- Original: 中世纪牧场主改造 Vancouver — 2026 成本和角色指南
-- Corrected: 中世紀牧場主改造 Vancouver — 2026 特色保存與造價指南

UPDATE blog_posts
SET title_zh = '中世紀牧場主改造 Vancouver — 2026 特色保存與造價指南'
WHERE slug = 'mid-century-rancher-renovation-vancouver-2026'
  AND title_zh = '中世纪牧场主改造 Vancouver — 2026 成本和角色指南';
