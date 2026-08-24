-- Migration: projects focus_keyword_zh
-- Scope: 10 projects with non-null focus_keyword_en but missing focus_keyword_zh
-- NOT APPLIED — needs human run
-- City mapping: Coquitlam→高贵林, North Vancouver→北温哥华, Vancouver→温哥华,
--   Richmond→列治文, Delta→三角洲, West Vancouver→西温哥华

UPDATE projects
SET focus_keyword_zh =
  CASE slug
    WHEN 'coquitlam-kitchen-renovation-quartz-island'
      THEN '高贵林厨房装修 石英石台面'
    WHEN 'north-vancouver-bathroom-renovation-herringbone-tile'
      THEN '北温哥华浴室装修 人字形瓷砖'
    WHEN 'vancouver-house-renovation-kitchen-and-bathrooms'
      THEN '温哥华房屋装修 厨房和浴室'
    WHEN 'richmond-condo-flooring-renovation'
      THEN '列治文公寓地板装修'
    WHEN 'richmond-house-renovation-kitchen-bathrooms-flooring'
      THEN '列治文房屋装修 厨房 浴室 地板'
    WHEN 'delta-kitchen-renovation-apron-sink-quartz'
      THEN '三角洲厨房装修 陶瓷水槽 石英石台面'
    WHEN 'richmond-whole-home-renovation-marble-kitchen'
      THEN '列治文全屋装修 大理石台面厨房'
    WHEN 'hallway-bathroom-renovation-richmond'
      THEN '列治文走廊浴室装修'
    WHEN 'powder-room-renovation-richmond'
      THEN '列治文化妆间装修'
    WHEN 'west-vancouver-luxury-bathroom-champagne-gold'
      THEN '西温哥华豪华浴室 香槟金'
    ELSE focus_keyword_en
  END
WHERE slug IN (
  'coquitlam-kitchen-renovation-quartz-island',
  'north-vancouver-bathroom-renovation-herringbone-tile',
  'vancouver-house-renovation-kitchen-and-bathrooms',
  'richmond-condo-flooring-renovation',
  'richmond-house-renovation-kitchen-bathrooms-flooring',
  'delta-kitchen-renovation-apron-sink-quartz',
  'richmond-whole-home-renovation-marble-kitchen',
  'hallway-bathroom-renovation-richmond',
  'powder-room-renovation-richmond',
  'west-vancouver-luxury-bathroom-champagne-gold'
)
AND focus_keyword_zh IS NULL;
