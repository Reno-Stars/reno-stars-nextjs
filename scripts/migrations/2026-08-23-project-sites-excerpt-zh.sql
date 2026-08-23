-- Migration: project_sites excerpt_zh — one row (2026-08-23)
-- vancouver-wfh-glass-partition-office: title_zh, description_zh, meta_title_zh, meta_description_zh all set;
-- excerpt_zh derived from description_zh
UPDATE project_sites SET excerpt_zh = '把空间改造成专属居家办公室，定制黑框玻璃隔断保留自然采光，获得视频会议隐私与隔音。'
WHERE slug = 'vancouver-wfh-glass-partition-office'
AND (excerpt_zh IS NULL OR excerpt_zh = '');
