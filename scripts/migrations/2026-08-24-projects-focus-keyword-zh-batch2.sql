-- Migration: 2026-08-24
-- NOT APPLIED — requires human to run against production DB
-- 5 projects missing focus_keyword_zh (remaining after batch 1)

BEGIN;

UPDATE projects SET focus_keyword_zh = '三角洲厨房翻新,石英石水槽,浴室翻新,三角洲全屋装修,Delta厨房装修' WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f' AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE projects SET focus_keyword_zh = '列治文全屋翻新,大理石效果厨房,豪华装修,列治文装修,Marble kitchen Richmond' WHERE id = 'c8a66604-00ed-4307-8b28-b95257eaa249' AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE projects SET focus_keyword_zh = '列治文走廊浴室翻新,客卫装修,列治文装修,Richmond bathroom renovation' WHERE id = '9063e628-abf9-411a-a7a4-2ddc179c1689' AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE projects SET focus_keyword_zh = '列治文化妆间翻新,洗手间装修,列治文装修,小浴室翻新,Richmond powder room' WHERE id = '018eda65-401d-4ec3-84cc-7793597e75c7' AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE projects SET focus_keyword_zh = '西温哥华豪华浴室,香槟金浴室,欧式奢华浴室,西温装修,West Vancouver luxury bathroom' WHERE id = '561278cf-e1cd-453c-8ec7-302075e6cc54' AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

COMMIT;
