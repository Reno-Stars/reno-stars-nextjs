-- 2026-08-24-project-sites-excerpt-zh.sql
-- NOT APPLIED — needs human to run against live database
-- Covers project_sites rows with NULL excerpt_zh discovered 2026-08-24

UPDATE project_sites
SET excerpt_zh = '温哥华WFH玻璃隔断办公室改造 — 用黑框玻璃隔断分隔专注空间，同时保留自然采光。专为居家办公设计。'
WHERE slug = 'vancouver-wfh-glass-partition-office'
AND (excerpt_zh IS NULL OR excerpt_zh = '');
