-- Migration: populate projects.challenge_zh, solution_zh, project_story_zh for 9 uncovered English-only rows
-- NOT APPLIED — needs human to review and run against the live database
-- Covers projects where challenge_zh/solution_zh/project_story_zh are NULL or empty
-- Date: 2026-09-07
-- Note: project_story_zh was not covered by 2026-08-30-projects-challenge-solution-zh.sql

-- toystore-renovation-metrotown-burnaby
UPDATE projects SET
  challenge_zh = '主要挑战是确保翻新工程全程符合政府规范，商铺营业期间不能影响周边商户。',
  solution_zh = '团队与当地政府部门密切协调，所有改建均按标准执行，并在施工期间做好商铺隔离和噪音控制，确保合规交付。',
  project_story_zh = '本项目为Metrotown商圈商铺翻新工程，业主希望在维持营业的前提下完成全面改造。聚星装修团队制定分段施工方案，优先完成关键基础设施升级，再推进表面装修，最终按时交付，商铺提前恢复营业。'
WHERE slug = 'toystore-renovation-metrotown-burnaby'
  AND (challenge_zh IS NULL OR challenge_zh = '' OR solution_zh IS NULL OR solution_zh = '' OR project_story_zh IS NULL OR project_story_zh = '');

-- vancouver-whole-house-renovation-bathroom-updates
UPDATE projects SET
  challenge_zh = '全屋翻新涉及多个工种协调，包括水电、泥瓦、橱柜等，需在保持业主正常居住的同时按计划推进工期。',
  solution_zh = '项目经理制定详细施工进度表，各工种按序进场，每日沟通进度，确保每道工序高效衔接，质量全程把控。',
  project_story_zh = '温哥华全屋翻新项目，业主希望在现有住宅内完成全面改造并同步升级两间浴室。聚星装修采用分区域施工方案，业主可居住在未施工区域，浴室翻新分批完成，整体工程顺利交付，业主入住后对细节和品质非常满意。'
WHERE slug = 'vancouver-whole-house-renovation-bathroom-updates'
  AND (challenge_zh IS NULL OR challenge_zh = '' OR solution_zh IS NULL OR solution_zh = '' OR project_story_zh IS NULL OR project_story_zh = '');

-- two-bathroom-renovation-burnaby-2
UPDATE projects SET
  challenge_zh = '两间浴室同时翻新，工种交叉多，工期紧张，需在有限时间内完成高品质交付。',
  solution_zh = '团队制定详细施工计划，各工种同步协调，保持全程沟通，确保每道工序无缝衔接。',
  project_story_zh = '本项目为Burnaby两间浴室翻新工程，业主希望在不延长工期的同时完成两间浴室的全面升级。聚星装修团队分派专人负责各浴室施工，泥瓦、水电、防水同步推进，最终两间浴室均提前交付，质量获业主高度认可。'
WHERE slug = 'two-bathroom-renovation-burnaby-2'
  AND (challenge_zh IS NULL OR challenge_zh = '' OR solution_zh IS NULL OR solution_zh = '' OR project_story_zh IS NULL OR project_story_zh = '');

-- vancouver-whole-house-bathroom-renovation
UPDATE projects SET
  challenge_zh = '原有浴室设施老旧，瓷砖破损，与整体装修风格不协调，改造期间需保障业主正常使用。',
  solution_zh = '更换全部洁具，安装新型瓷砖台面，配置现代浴室柜，并同步做好防水和排水系统升级，改造后与全屋风格无缝衔接。',
  project_story_zh = '温哥华住宅浴室翻新项目，原有浴室设施老旧，整体风格与新装修脱节。聚星装修团队从拆除到防水重建，选用高品质瓷砖和现代洁具，完成后浴室焕然一新，业主对最终效果非常满意。'
WHERE slug = 'vancouver-whole-house-bathroom-renovation'
  AND (challenge_zh IS NULL OR challenge_zh = '' OR solution_zh IS NULL OR solution_zh = '' OR project_story_zh IS NULL OR project_story_zh = '');

-- custom-kitchen-renovation-black-fixtures-burnaby
UPDATE projects SET
  challenge_zh = '优化厨房采光，同时确保所有水电工程符合安全标准，需在不动主体结构的情况下实现最大改进。',
  solution_zh = '引入LED照明系统，选用防水防火电缆，与持牌水电工紧密合作，所有管线改造均通过安全验收。',
  project_story_zh = 'Burnaby定制橱柜厨房翻新项目，业主追求深色系橱柜配黑色五金的高端质感。聚星装修团队精选黑色把手和龙头的实木橱柜，配合专业照明设计，厨房既实用又富有设计感，完工后成为业主最满意的家居空间。'
WHERE slug = 'custom-kitchen-renovation-black-fixtures-burnaby'
  AND (challenge_zh IS NULL OR challenge_zh = '' OR solution_zh IS NULL OR solution_zh = '' OR project_story_zh IS NULL OR project_story_zh = '');

-- daughter-bath-renovation-richmond-gray-tile
UPDATE projects SET
  challenge_zh = '在现有联排别墅布局限制内打造功能与美观兼备的浴室，需平衡空间利用率与整体美感。',
  solution_zh = '精心挑选材料与洁具，最大化空间利用，选用灰色瓷砖提升质感，同时确保每一寸空间都具备实用功能。',
  project_story_zh = 'Richmond联排别墅浴室翻新，业主希望为女儿打造一个兼具功能性与时尚感的专属空间。聚星装修选用浅灰色瓷砖搭配白色洁具，空间在视觉上更显宽敞，储物设计恰到好处，完工后业主女儿对全新浴室赞不绝口。'
WHERE slug = 'daughter-bath-renovation-richmond-gray-tile'
  AND (challenge_zh IS NULL OR challenge_zh = '' OR solution_zh IS NULL OR solution_zh = '' OR project_story_zh IS NULL OR project_story_zh = '');

-- three-bathroom-renovation-delta
UPDATE projects SET
  challenge_zh = '三间半浴室同时改造，工程量大，需在施工期间最大程度减少对业主家庭正常生活的干扰。',
  solution_zh = '采用分阶段改造方案，每次完成一间浴室，业主家庭在此期间可使用其他浴室，最大程度减少不便。',
  project_story_zh = 'Delta三间半浴室翻新工程，业主家庭人口多，对浴室使用需求高。聚星装修团队以家庭生活为优先，每次改造一间浴室，全工程分阶段有序推进，最终四间浴室全部高品质交付，业主家庭对施工期间的理解与配合给予高度评价。'
WHERE slug = 'three-bathroom-renovation-delta'
  AND (challenge_zh IS NULL OR challenge_zh = '' OR solution_zh IS NULL OR solution_zh = '' OR project_story_zh IS NULL OR project_story_zh = '');

-- vancouver-custom-whole-house-renovation
UPDATE projects SET
  challenge_zh = '客户对定制油漆颜色要求精确，需确保颜色与整体风格完全匹配，同时严格按时间表完成。',
  solution_zh = '在施工前与客户进行充分沟通，提供色板样本供确认，确保颜色准确无误，工期全程透明管理。',
  project_story_zh = '温哥华全屋定制翻新项目，业主对装修细节有极高要求。聚星装修团队与业主多次现场沟通，从油漆配色到材料选择，每一步都经过业主确认，最终全屋装修效果完全符合业主愿景，准时交付，业主给予五星好评。'
WHERE slug = 'vancouver-custom-whole-house-renovation'
  AND (challenge_zh IS NULL OR challenge_zh = '' OR solution_zh IS NULL OR solution_zh = '' OR project_story_zh IS NULL OR project_story_zh = '');

-- kitchen-renovation-coquitlam
UPDATE projects SET
  challenge_zh = '在有限预算内实现现代感设计，需兼顾成本控制与材料品质，不能因省钱而牺牲效果。',
  solution_zh = '精选高性价比材料，重点投入业主最关注的视觉区域，通过设计技巧提升整体档次，避免不必要的花费。',
  project_story_zh = 'Coquitlam经济型厨房翻新项目，预算有限但期望值高。聚星装修团队在预算范围内精心规划，选用优质复合地板和现代层压板台面，通过灯光设计和色彩搭配提升空间质感，最终厨房呈现出现代化效果，业主对性价比非常满意。'
WHERE slug = 'kitchen-renovation-coquitlam'
  AND (challenge_zh IS NULL OR challenge_zh = '' OR solution_zh IS NULL OR solution_zh = '' OR project_story_zh IS NULL OR project_story_zh = '');
