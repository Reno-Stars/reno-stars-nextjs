-- Migration L2-P2: project_image_pairs after_alt_text (Richmond Whole Home Marble Kitchen, 6 rows)
UPDATE project_image_pairs SET
    after_alt_text_en = CASE id
        WHEN 'fc69c193-3a26-488b-895c-3b8210508a22' THEN 'Richmond whole home renovation marble kitchen countertops'
        WHEN '703c2c38-c9b4-412f-8df8-1a6dc6ea81da' THEN 'Richmond whole home renovation modern marble kitchen design'
        WHEN '2a1cef46-85cb-4d95-aad0-691c07ecd63a' THEN 'Richmond whole home renovation marble kitchen and custom cabinetry'
        WHEN 'd027d875-6748-47fb-a182-e837b7ed8505' THEN 'Richmond whole home renovation marble kitchen island installation'
        WHEN 'cd0f6d68-23d0-4665-ba68-ec04def54917' THEN 'Richmond whole home renovation completed marble kitchen project'
        WHEN '66a979e8-54e9-482f-aef5-82f03010caf2' THEN 'Richmond whole home renovation luxury marble kitchen finish'
    END,
    after_alt_text_zh = CASE id
        WHEN 'fc69c193-3a26-488b-895c-3b8210508a22' THEN 'Richmond 全屋翻新大理石厨房台面'
        WHEN '703c2c38-c9b4-412f-8df8-1a6dc6ea81da' THEN 'Richmond 全屋翻新现代大理石厨房设计'
        WHEN '2a1cef46-85cb-4d95-aad0-691c07ecd63a' THEN 'Richmond 全屋翻新大理石厨房和定制橱柜'
        WHEN 'd027d875-6748-47fb-a182-e837b7ed8505' THEN 'Richmond 全屋翻新大理石厨房岛台安装'
        WHEN 'cd0f6d68-23d0-4665-ba68-ec04def54917' THEN 'Richmond 全屋翻新大理石厨房项目完成'
        WHEN '66a979e8-54e9-482f-aef5-82f03010caf2' THEN 'Richmond 全屋翻新豪华大理石厨房装修'
    END
WHERE id IN (
    'fc69c193-3a26-488b-895c-3b8210508a22','703c2c38-c9b4-412f-8df8-1a6dc6ea81da',
    '2a1cef46-85cb-4d95-aad0-691c07ecd63a','d027d875-6748-47fb-a182-e837b7ed8505',
    'cd0f6d68-23d0-4665-ba68-ec04def54917','66a979e8-54e9-482f-aef5-82f03010caf2'
);
