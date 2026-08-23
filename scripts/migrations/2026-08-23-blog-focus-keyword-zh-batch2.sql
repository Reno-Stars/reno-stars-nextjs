-- 2026-08-23-blog-focus-keyword-zh-batch2.sql
-- NOT APPLIED — needs human to run
-- Covers: published blog_posts with focus_keyword_zh NULL (第二批)
-- Idempotent WHERE guard ensures re-run is safe.

UPDATE blog_posts
SET
  focus_keyword_zh = CASE slug
    -- North Vancouver
    WHEN 'bathroom-renovations-north-vancouver-2026'
      THEN '北温哥华浴室装修'
    WHEN 'north-vancouver-home-renovation-guide-2026'
      THEN '北温哥华房屋装修指南'
    WHEN 'pre-sale-renovation-north-vancouver-bc-2026'
      THEN '北温哥华预售房屋装修 ROI'
    WHEN 'cabinet-refinishing-north-vancouver-cost-guide'
      THEN '北温哥华橱柜翻新费用指南'
    -- Burnaby
    WHEN 'basement-renovations-burnaby-2026'
      THEN '本拿比地下室装修'
    WHEN 'burnaby-home-renovation-guide-2026'
      THEN '本拿比房屋装修指南'
    WHEN 'cabinet-refinishing-burnaby-cost-guide'
      THEN '本拿比橱柜翻新费用指南'
    -- West Vancouver
    WHEN 'west-vancouver-home-renovation-guide-2026'
      THEN '西温哥华房屋装修指南'
    WHEN 'cabinet-refinishing-west-vancouver-cost-guide'
      THEN '西温哥华橱柜翻新费用指南'
    -- Vancouver (City)
    WHEN 'vancouver-home-renovation-guide-2026'
      THEN '温哥华房屋装修指南'
    WHEN 'kitchen-backsplash-cost-vancouver-2026'
      THEN '温哥华厨房防溅板费用'
    WHEN 'kitchen-layout-planning-vancouver-2026'
      THEN '温哥华厨房布局规划'
    WHEN 'kitchen-lighting-design-vancouver-2026'
      THEN '温哥华厨房照明设计'
    WHEN 'bathroom-refresh-without-full-renovation-vancouver-2026'
      THEN '温哥华浴室小翻新'
    -- Richmond
    WHEN 'richmond-home-renovation-guide-2026'
      THEN '列治文房屋装修指南'
    WHEN 'cabinet-refinishing-richmond-cost-guide'
      THEN '列治文橱柜翻新费用指南'
    -- Surrey
    WHEN 'surrey-home-renovation-guide-2026'
      THEN '素里房屋装修指南'
    WHEN 'cabinet-refinishing-surrey-cost-guide'
      THEN '素里橱柜翻新费用指南'
    -- Coquitlam
    WHEN 'bathroom-renovation-coquitlam-bc-2026'
      THEN '高贵林浴室装修'
    WHEN 'coquitlam-home-renovation-guide-2026'
      THEN '高贵林房屋装修指南'
    WHEN 'kitchen-renovation-coquitlam-bc-2026'
      THEN '高贵林厨房装修'
    WHEN 'pre-sale-renovation-coquitlam-bc-2026'
      THEN '高贵林预售房屋装修 ROI'
    -- New Westminster
    WHEN 'kitchen-renovation-new-westminster-bc-2026'
      THEN '新西敏厨房装修'
    WHEN 'cabinet-refinishing-new-westminster-cost-guide'
      THEN '新西敏橱柜翻新费用指南'
    WHEN 'new-westminster-home-renovation-guide-2026'
      THEN '新西敏房屋装修指南'
    -- Langley
    WHEN 'kitchen-renovation-langley-bc-2026'
      THEN '兰里厨房装修'
    WHEN 'langley-home-renovation-guide-2026'
      THEN '兰里房屋装修指南'
    -- Maple Ridge
    WHEN 'maple-ridge-home-renovation-guide-2026'
      THEN '枫树岭房屋装修指南'
    WHEN 'pre-sale-renovation-maple-ridge-bc-2026'
      THEN '枫树岭预售房屋装修 ROI'
    WHEN 'kitchen-renovation-maple-ridge-bc-2026'
      THEN '枫树岭厨房装修'
    WHEN 'bathroom-renovation-maple-ridge-bc-2026'
      THEN '枫树岭浴室装修'
    -- Port Moody
    WHEN 'port-moody-home-renovation-guide-2026'
      THEN '满地宝房屋装修指南'
    WHEN 'kitchen-renovation-port-moody-bc-2026'
      THEN '满地宝厨房装修'
    -- Port Coquitlam
    WHEN 'basement-renovations-port-coquitlam-2026'
      THEN '高贵林港地下室装修'
    WHEN 'kitchen-renovation-port-coquitlam-bc-2026'
      THEN '高贵林港厨房装修'
    WHEN 'cabinet-refinishing-port-coquitlam-cost-guide'
      THEN '高贵林港橱柜翻新费用指南'
    -- Delta / Tsawwassen / Ladner
    WHEN 'cabinet-refinishing-delta-cost-guide'
      THEN 'Delta 橱柜翻新费用指南'
    WHEN 'bathroom-renovation-delta-bc-2026'
      THEN 'Delta 浴室装修'
    WHEN 'delta-home-renovation-guide-2026'
      THEN 'Delta 房屋装修指南'
    -- White Rock / South Surrey
    WHEN 'white-rock-home-renovation-guide-2026'
      THEN '白石房屋装修指南'
    WHEN 'cabinet-refinishing-white-rock-cost-guide'
      THEN '白石橱柜翻新费用指南'
    -- Vancouver (city kitchen/bath broader)
    WHEN 'kitchen-renovation-vancouver-bc-2026'
      THEN '温哥华厨房装修'
    -- Generic cabinet refinishing
    WHEN 'cabinet-refinishing-vancouver-cost-guide'
      THEN '温哥华橱柜翻新费用指南'
    ELSE focus_keyword_zh  -- leave as-is for any unmatched rows
  END
WHERE
  is_published
  AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '')
  AND slug IN (
    'bathroom-renovations-north-vancouver-2026',
    'north-vancouver-home-renovation-guide-2026',
    'pre-sale-renovation-north-vancouver-bc-2026',
    'cabinet-refinishing-north-vancouver-cost-guide',
    'basement-renovations-burnaby-2026',
    'burnaby-home-renovation-guide-2026',
    'cabinet-refinishing-burnaby-cost-guide',
    'west-vancouver-home-renovation-guide-2026',
    'cabinet-refinishing-west-vancouver-cost-guide',
    'vancouver-home-renovation-guide-2026',
    'kitchen-backsplash-cost-vancouver-2026',
    'kitchen-layout-planning-vancouver-2026',
    'kitchen-lighting-design-vancouver-2026',
    'bathroom-refresh-without-full-renovation-vancouver-2026',
    'richmond-home-renovation-guide-2026',
    'cabinet-refinishing-richmond-cost-guide',
    'surrey-home-renovation-guide-2026',
    'cabinet-refinishing-surrey-cost-guide',
    'bathroom-renovation-coquitlam-bc-2026',
    'coquitlam-home-renovation-guide-2026',
    'kitchen-renovation-coquitlam-bc-2026',
    'pre-sale-renovation-coquitlam-bc-2026',
    'kitchen-renovation-new-westminster-bc-2026',
    'cabinet-refinishing-new-westminster-cost-guide',
    'new-westminster-home-renovation-guide-2026',
    'kitchen-renovation-langley-bc-2026',
    'langley-home-renovation-guide-2026',
    'maple-ridge-home-renovation-guide-2026',
    'pre-sale-renovation-maple-ridge-bc-2026',
    'kitchen-renovation-maple-ridge-bc-2026',
    'bathroom-renovation-maple-ridge-bc-2026',
    'port-moody-home-renovation-guide-2026',
    'kitchen-renovation-port-moody-bc-2026',
    'basement-renovations-port-coquitlam-2026',
    'kitchen-renovation-port-coquitlam-bc-2026',
    'cabinet-refinishing-port-coquitlam-cost-guide',
    'cabinet-refinishing-delta-cost-guide',
    'bathroom-renovation-delta-bc-2026',
    'delta-home-renovation-guide-2026',
    'white-rock-home-renovation-guide-2026',
    'cabinet-refinishing-white-rock-cost-guide',
    'kitchen-renovation-vancouver-bc-2026',
    'cabinet-refinishing-vancouver-cost-guide'
  );
