-- Migration L2-P4: project_image_pairs after_alt_text (Richmond House + Vancouver House Kitchens, 12 rows)
UPDATE project_image_pairs SET
    after_alt_text_en = CASE id
        WHEN '57c2acb2-cd88-4573-8b24-1829e1033ae0' THEN 'Richmond house renovation kitchen and bathrooms flooring upgrade'
        WHEN 'a4ffea51-a939-4272-a816-658079a7b90f' THEN 'Richmond house renovation kitchen bathrooms flooring completion'
        WHEN '2f4a067e-9e0e-4c98-8f6d-e9830139b5df' THEN 'Richmond house renovation modern kitchen and bathroom flooring'
        WHEN 'd86c126c-ee32-4365-bee2-64fa110b4493' THEN 'Richmond house renovation flooring and finish work in kitchen'
        WHEN '414d7d7a-8f79-49e8-9873-57457e3c79d4' THEN 'Richmond house renovation full kitchen and bathroom flooring'
        WHEN 'fb27c850-afab-4b84-8f86-513a1a340c51' THEN 'Richmond house renovation completed kitchen bathrooms flooring'
        WHEN 'b8285cfe-5ab0-4375-9747-8a4449e7d5d7' THEN 'Vancouver house renovation kitchen and bathrooms project'
        WHEN '64caaaa4-729a-4dd8-a92c-7e95319b2131' THEN 'Vancouver house renovation kitchen and bathrooms finished result'
        WHEN '2eb5b788-4c3e-453c-89e9-7ad768fb4987' THEN 'Vancouver house renovation modern kitchen and bathrooms upgrade'
        WHEN '079663bb-9203-462c-b24d-436967a68404' THEN 'Vancouver house renovation kitchen bathrooms renovation complete'
        WHEN '9570830f-3966-43fe-b938-75d1e34ee3e9' THEN 'Vancouver house renovation kitchen and bathrooms final result'
        WHEN 'fa67f7e2-82e0-4101-baf7-7e585f8410cf' THEN 'Vancouver house renovation full kitchen and bathrooms project'
    END,
    after_alt_text_zh = CASE id
        WHEN '57c2acb2-cd88-4573-8b24-1829e1033ae0' THEN 'Richmond 房屋翻新厨房和浴室地板升级'
        WHEN 'a4ffea51-a939-4272-a816-658079a7b90f' THEN 'Richmond 房屋翻新厨房浴室地板完成'
        WHEN '2f4a067e-9e0e-4c98-8f6d-e9830139b5df' THEN 'Richmond 房屋翻新现代厨房和浴室地板'
        WHEN 'd86c126c-ee32-4365-bee2-64fa110b4493' THEN 'Richmond 房屋翻新厨房地板和装修工程'
        WHEN '414d7d7a-8f79-49e8-9873-57457e3c79d4' THEN 'Richmond 房屋翻新全套厨房和浴室地板'
        WHEN 'fb27c850-afab-4b84-8f86-513a1a340c51' THEN 'Richmond 房屋翻新厨房浴室地板完成'
        WHEN 'b8285cfe-5ab0-4375-9747-8a4449e7d5d7' THEN 'Vancouver 房屋翻新厨房和浴室项目'
        WHEN '64caaaa4-729a-4dd8-a92c-7e95319b2131' THEN 'Vancouver 房屋翻新厨房和浴室完成效果'
        WHEN '2eb5b788-4c3e-453c-89e9-7ad768fb4987' THEN 'Vancouver 房屋翻新现代厨房和浴室升级'
        WHEN '079663bb-9203-462c-b24d-436967a68404' THEN 'Vancouver 房屋翻新厨房浴室翻新完成'
        WHEN '9570830f-3966-43fe-b938-75d1e34ee3e9' THEN 'Vancouver 房屋翻新厨房和浴室最终效果'
        WHEN 'fa67f7e2-82e0-4101-baf7-7e585f8410cf' THEN 'Vancouver 房屋翻新全套厨房和浴室项目'
    END
WHERE id IN (
    '57c2acb2-cd88-4573-8b24-1829e1033ae0','a4ffea51-a939-4272-a816-658079a7b90f',
    '2f4a067e-9e0e-4c98-8f6d-e9830139b5df','d86c126c-ee32-4365-bee2-64fa110b4493',
    '414d7d7a-8f79-49e8-9873-57457e3c79d4','fb27c850-afab-4b84-8f86-513a1a340c51',
    'b8285cfe-5ab0-4375-9747-8a4449e7d5d7','64caaaa4-729a-4dd8-a92c-7e95319b2131',
    '2eb5b788-4c3e-453c-89e9-7ad768fb4987','079663bb-9203-462c-b24d-436967a68404',
    '9570830f-3966-43fe-b938-75d1e34ee3e9','fa67f7e2-82e0-4101-baf7-7e585f8410cf'
);
