-- Migration L2-P3: project_image_pairs after_alt_text (North Vancouver Herringbone + Richmond Condo Flooring, 8 rows)
UPDATE project_image_pairs SET
    after_alt_text_en = CASE id
        WHEN '59013c4c-0449-4d8f-86bf-4286c66402b8' THEN 'North Vancouver bathroom renovation featuring herringbone tile'
        WHEN '11f4b471-0338-490b-aa72-4898c25450fd' THEN 'North Vancouver bathroom renovation herringbone accent wall'
        WHEN '9d7aa325-ca6b-4744-8e63-5e0ade107288' THEN 'North Vancouver bathroom renovation modern herringbone tile design'
        WHEN '4959025c-7002-4ffc-91d3-7ea1dbd7e2c3' THEN 'Richmond condo flooring renovation hardwood floor installation'
        WHEN '04b0a43c-b793-4adf-92f6-15e912f19a8f' THEN 'Richmond condo renovation new hardwood flooring result'
        WHEN 'fe53529a-0e3b-4bc1-8c0f-c51ac3bf9af7' THEN 'Richmond condo flooring renovation premium hardwood finish'
        WHEN 'a7d11f64-e2d9-494e-abcb-21cb718b60b3' THEN 'Richmond condo renovation flooring upgrade with hardwood'
        WHEN '921d4939-d5f5-43dd-b905-974830f8aa27' THEN 'Richmond condo flooring renovation completed hardwood project'
    END,
    after_alt_text_zh = CASE id
        WHEN '59013c4c-0449-4d8f-86bf-4286c66402b8' THEN 'North Vancouver 浴室翻新配鱼骨砖'
        WHEN '11f4b471-0338-490b-aa72-4898c25450fd' THEN 'North Vancouver 浴室翻新鱼骨砖特色墙'
        WHEN '9d7aa325-ca6b-4744-8e63-5e0ade107288' THEN 'North Vancouver 浴室翻新现代鱼骨砖设计'
        WHEN '4959025c-7002-4ffc-91d3-7ea1dbd7e2c3' THEN 'Richmond 公寓翻新硬木地板安装'
        WHEN '04b0a43c-b793-4adf-92f6-15e912f19a8f' THEN 'Richmond 公寓翻新新硬木地板效果'
        WHEN 'fe53529a-0e3b-4bc1-8c0f-c51ac3bf9af7' THEN 'Richmond 公寓翻新优质硬木地板完成'
        WHEN 'a7d11f64-e2d9-494e-abcb-21cb718b60b3' THEN 'Richmond 公寓翻新硬木地板升级'
        WHEN '921d4939-d5f5-43dd-b905-974830f8aa27' THEN 'Richmond 公寓翻新硬木地板项目完成'
    END
WHERE id IN (
    '59013c4c-0449-4d8f-86bf-4286c66402b8','11f4b471-0338-490b-aa72-4898c25450fd',
    '9d7aa325-ca6b-4744-8e63-5e0ade107288','4959025c-7002-4ffc-91d3-7ea1dbd7e2c3',
    '04b0a43c-b793-4adf-92f6-15e912f19a8f','fe53529a-0e3b-4bc1-8c0f-c51ac3bf9af7',
    'a7d11f64-e2d9-494e-abcb-21cb718b60b3','921d4939-d5f5-43dd-b905-974830f8aa27'
);
