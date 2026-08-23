-- Migration: projects focus_keyword_zh — batch 2 (2026-08-23)
-- Covers 5 remaining projects with genuine Chinese titles
UPDATE projects SET focus_keyword_zh = CASE
    WHEN id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f' THEN '三角洲厨房翻新'
    WHEN id = 'c8a66604-00ed-4307-8b28-b95257eaa249' THEN '列治文全屋翻新'
    WHEN id = '9063e628-abf9-411a-a7a4-2ddc179c1689' THEN '列治文走廊浴室翻新'
    WHEN id = '018eda65-401d-4ec3-84cc-7793597e75c7' THEN '列治文洗手间翻新'
    WHEN id = '561278cf-e1cd-453c-8ec7-302075e6cc54' THEN '西温哥华豪华浴室翻新'
END
WHERE id IN ('7c9a9237-4f64-480b-a2fa-2d14e9faa99f','c8a66604-00ed-4307-8b28-b95257eaa249','9063e628-abf9-411a-a7a4-2ddc179c1689','018eda65-401d-4ec3-84cc-7793597e75c7','561278cf-e1cd-453c-8ec7-302075e6cc54')
AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');
