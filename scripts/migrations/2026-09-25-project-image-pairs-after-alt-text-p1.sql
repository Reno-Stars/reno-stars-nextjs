-- Migration L2-P1: project_image_pairs after_alt_text (Delta + Coquitlam kitchens, 12 rows)
UPDATE project_image_pairs SET
    after_alt_text_en = CASE id
        WHEN '15aef9e3-3521-4a24-8726-81f34abe20a3' THEN 'Delta kitchen renovation featuring apron sink and quartz countertops'
        WHEN '615f510e-b1aa-41be-bf81-2e75cb2817c1' THEN 'Delta kitchen renovation with quartz countertops and modern fixtures'
        WHEN '943f3f08-952b-443e-b43f-6574ca96eb39' THEN 'Delta kitchen renovation showcasing apron sink installation'
        WHEN '63ae9638-32d2-488d-ab6a-cc26c0ea12ac' THEN 'Delta kitchen renovation with sleek quartz island and apron sink'
        WHEN '411f96a2-b161-4d17-9d5e-f8cbf1a74bee' THEN 'Delta kitchen renovation modern quartz countertops and fixtures'
        WHEN '91ad8b69-d896-4c1c-8532-abdd67c24880' THEN 'Delta kitchen renovation complete quartz and apron sink result'
        WHEN '6d619b10-4b1d-4dd7-b694-b08fb2e5fa9f' THEN 'Coquitlam kitchen renovation featuring quartz island countertop'
        WHEN 'e740b728-f490-4ebe-9fbd-c404af0a1396' THEN 'Coquitlam kitchen renovation with modern quartz island design'
        WHEN 'e1244ff4-b2fa-46ed-a5d1-82852b8f6c71' THEN 'Coquitlam kitchen renovation quartz island and custom cabinetry'
        WHEN '88c0bdf1-fb8d-4c99-bc33-70c8c6f95d57' THEN 'Coquitlam kitchen renovation showcasing quartz island installation'
        WHEN '79d2f843-d40d-4235-ae6d-41637d099885' THEN 'Coquitlam kitchen renovation modern quartz island and pendant lighting'
        WHEN 'c3184231-3286-4adb-a505-a44211a6e830' THEN 'Coquitlam kitchen renovation completed quartz island project'
    END,
    after_alt_text_zh = CASE id
        WHEN '15aef9e3-3521-4a24-8726-81f34abe20a3' THEN 'Delta 厨房翻新采用 apron 水槽和石英石台面'
        WHEN '615f510e-b1aa-41be-bf81-2e75cb2817c1' THEN 'Delta 厨房翻新配石英石台面和现代五金'
        WHEN '943f3f08-952b-443e-b43f-6574ca96eb39' THEN 'Delta 厨房翻新展示 apron 水槽安装'
        WHEN '63ae9638-32d2-488d-ab6a-cc26c0ea12ac' THEN 'Delta 厨房翻新配石英石岛台和 apron 水槽'
        WHEN '411f96a2-b161-4d17-9d5e-f8cbf1a74bee' THEN 'Delta 厨房翻新现代石英石台面和五金'
        WHEN '91ad8b69-d896-4c1c-8532-abdd67c24880' THEN 'Delta 厨房翻新石英石和 apron 水槽完成效果'
        WHEN '6d619b10-4b1d-4dd7-b694-b08fb2e5fa9f' THEN 'Coquitlam 厨房翻新配石英石岛台'
        WHEN 'e740b728-f490-4ebe-9fbd-c404af0a1396' THEN 'Coquitlam 厨房翻新现代石英石岛台设计'
        WHEN 'e1244ff4-b2fa-46ed-a5d1-82852b8f6c71' THEN 'Coquitlam 厨房翻新石英石岛台和定制橱柜'
        WHEN '88c0bdf1-fb8d-4c99-bc33-70c8c6f95d57' THEN 'Coquitlam 厨房翻新展示石英石岛台安装'
        WHEN '79d2f843-d40d-4235-ae6d-41637d099885' THEN 'Coquitlam 厨房翻新现代石英石岛台和吊灯'
        WHEN 'c3184231-3286-4adb-a505-a44211a6e830' THEN 'Coquitlam 厨房翻新石英石岛台项目完成'
    END
WHERE id IN (
    '15aef9e3-3521-4a24-8726-81f34abe20a3','615f510e-b1aa-41be-bf81-2e75cb2817c1',
    '943f3f08-952b-443e-b43f-6574ca96eb39','63ae9638-32d2-488d-ab6a-cc26c0ea12ac',
    '411f96a2-b161-4d17-9d5e-f8cbf1a74bee','91ad8b69-d896-4c1c-8532-abdd67c24880',
    '6d619b10-4b1d-4dd7-b694-b08fb2e5fa9f','e740b728-f490-4ebe-9fbd-c404af0a1396',
    'e1244ff4-b2fa-46ed-a5d1-82852b8f6c71','88c0bdf1-fb8d-4c99-bc33-70c8c6f95d57',
    '79d2f843-d40d-4235-ae6d-41637d099885','c3184231-3286-4adb-a505-a44211a6e830'
);
