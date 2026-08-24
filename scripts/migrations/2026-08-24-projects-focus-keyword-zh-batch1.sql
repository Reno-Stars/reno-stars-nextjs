-- Migration: 2026-08-24
-- NOT APPLIED — requires human to run against production DB
-- 10 projects missing focus_keyword_zh (none covered by prior migrations)

BEGIN;

UPDATE projects SET focus_keyword_zh = '高贵林厨房翻新,石英石瀑布岛台,高贵林橱柜,石英石台面,Coquitlam厨房装修' WHERE id = '838f1ee4-beaa-42e7-bca5-73c810422d76' AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE projects SET focus_keyword_zh = '北温哥华浴室翻新,鱼骨瓷砖,黑色瓷砖浴室,North Vancouver卫生间装修,瓷砖浴室' WHERE id = '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb' AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE projects SET focus_keyword_zh = '温哥华全屋翻新,厨房浴室翻新,地板更换,温哥华装修,Vancouver房屋装修' WHERE id = '9cbc6ccf-bc07-4c2f-a867-c57ab4218728' AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE projects SET focus_keyword_zh = '列治文公寓地板,地板更换,列治文装修,地板翻新,Richmond condo装修' WHERE id = '3ef5531b-cfb9-454d-9cd2-90887b3775f0' AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE projects SET focus_keyword_zh = '列治文房屋翻新,厨房浴室装修,地板翻新,列治文全屋装修,Richmond renovation' WHERE id = '331f03b3-624e-4ddf-9b38-c8768d3d1932' AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

COMMIT;
