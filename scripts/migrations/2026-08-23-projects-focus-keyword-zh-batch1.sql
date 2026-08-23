-- Migration: projects focus_keyword_zh — batch 1 (2026-08-23)
-- Covers 5 projects with genuine Chinese titles
UPDATE projects SET focus_keyword_zh = CASE
    WHEN id = '838f1ee4-beaa-42e7-bca5-73c810422d76' THEN '高贵林厨房翻新'
    WHEN id = '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb' THEN '北温哥华浴室翻新'
    WHEN id = '9cbc6ccf-bc07-4c2f-a867-c57ab4218728' THEN '温哥华房屋翻新'
    WHEN id = '3ef5531b-cfb9-454d-9cd2-90887b3775f0' THEN '列治文地板装修'
    WHEN id = '331f03b3-624e-4ddf-9b38-c8768d3d1932' THEN '列治文厨房浴室翻新'
END
WHERE id IN ('838f1ee4-beaa-42e7-bca5-73c810422d76','0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb','9cbc6ccf-bc07-4c2f-a867-c57ab4218728','3ef5531b-cfb9-454d-9cd2-90887b3775f0','331f03b3-624e-4ddf-9b38-c8768d3d1932')
AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');
