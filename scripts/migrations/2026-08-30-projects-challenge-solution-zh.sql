-- Migration: populate projects.challenge_zh and projects.solution_zh for 11 English-only rows
-- NOT APPLIED — needs human to review and run against the live database
-- Covers projects whose challenge_en and solution_en are populated but Chinese is not
-- Date: 2026-08-30
-- Fix applied 2026-08-31: added AND (solution_zh IS NULL OR solution_zh = '') guard to all 11 UPDATE blocks
-- (previously only challenge_zh guard was present, so solution_zh could silently skip if challenge_zh was already set)

-- richmond-condo-flooring-renovation
UPDATE projects
SET challenge_zh = '公寓楼层老化，原始地板破损，需要在不影响邻居的情况下完成更换。'
  , solution_zh = '采用静音浮动地板系统，选用SPC防水地板，施工全程控制噪音，2天内完成。'
WHERE slug = 'richmond-condo-flooring-renovation'
  AND (challenge_zh IS NULL OR challenge_zh = '')
  AND (solution_zh IS NULL OR solution_zh = '');

-- ensuite-bathroom-renovation-richmond
UPDATE projects
SET challenge_zh = '主卧浴室管道老化，淋浴间渗漏，需要在不破坏相邻空间的情况下进行改造。'
  , solution_zh = '全面重铺管道，采用PEX管材，换装步入式淋浴间，一站式完成拆除到交付。'
WHERE slug = 'ensuite-bathroom-renovation-richmond'
  AND (challenge_zh IS NULL OR challenge_zh = '')
  AND (solution_zh IS NULL OR solution_zh = '');

-- hallway-bathroom-renovation-richmond
UPDATE projects
SET challenge_zh = '走廊浴室空间狭小，管道位置固定，改造受限。'
  , solution_zh = '利用现有管道走向，定制窄型浴室柜，安装壁挂式马桶，最大化空间利用。'
WHERE slug = 'hallway-bathroom-renovation-richmond'
  AND (challenge_zh IS NULL OR challenge_zh = '')
  AND (solution_zh IS NULL OR solution_zh = '');

-- west-vancouver-luxury-bathroom-champagne-gold
UPDATE projects
SET challenge_zh = '豪华浴室要求使用欧洲标准无障碍设计，香槟金色配件协调，工艺精度要求高。'
  , solution_zh = '安装香槟金色欧式管道系统，配置无障碍步入式淋浴间，全屋铜管重铺，符合西温建筑规范。'
WHERE slug = 'west-vancouver-luxury-bathroom-champagne-gold'
  AND (challenge_zh IS NULL OR challenge_zh = '')
  AND (solution_zh IS NULL OR solution_zh = '');

-- north-vancouver-bathroom-renovation-herringbone-tile
UPDATE projects
SET challenge_zh = '浴室需要铺设鱼骨形瓷砖，对缝要求极高，管道需要同时升级。'
  , solution_zh = '持牌水管工全屋PEX改管，瓦工精确铺贴黑色鱼骨砖，无框玻璃隔断，一体化交付。'
WHERE slug = 'north-vancouver-bathroom-renovation-herringbone-tile'
  AND (challenge_zh IS NULL OR challenge_zh = '')
  AND (solution_zh IS NULL OR solution_zh = '');

-- richmond-house-renovation-kitchen-bathrooms-flooring
UPDATE projects
SET challenge_zh = '整屋翻新包括厨房和浴室，管道和地板同时改造，多工种协调挑战大。'
  , solution_zh = '分阶段施工，管道先行，厨房浴室同步推进，全程项目经理协调，8周完成整屋交付。'
WHERE slug = 'richmond-house-renovation-kitchen-bathrooms-flooring'
  AND (challenge_zh IS NULL OR challenge_zh = '')
  AND (solution_zh IS NULL OR solution_zh = '');

-- coquitlam-kitchen-renovation-quartz-island
UPDATE projects
SET challenge_zh = '开放式厨房需要改动部分管道以配合石英石岛台，施工期间需保持住宅其他区域可居住。'
  , solution_zh = '合理规划管道走向，石英石台面与管道同步安装，厨房区域分阶段施工，其他区域正常居住。'
WHERE slug = 'coquitlam-kitchen-renovation-quartz-island'
  AND (challenge_zh IS NULL OR challenge_zh = '')
  AND (solution_zh IS NULL OR solution_zh = '');

-- powder-room-renovation-richmond
UPDATE projects
SET challenge_zh = '化妆间空间极小，管道需要局部改造以配合新洗手池和壁挂式马桶。'
  , solution_zh = '紧凑布局设计，管道微调，选用挂墙式马桶和小型洗手池，3天完成交付。'
WHERE slug = 'powder-room-renovation-richmond'
  AND (challenge_zh IS NULL OR challenge_zh = '')
  AND (solution_zh IS NULL OR solution_zh = '');

-- vancouver-house-renovation-kitchen-and-bathrooms
UPDATE projects
SET challenge_zh = '温哥华住宅需要同时翻新厨房和多间浴室，管道系统全面升级，permit申请复杂。'
  , solution_zh = '统一办理所有permit，全屋管道重铺为PEX，厨房浴室同步施工，10周完成整体交付。'
WHERE slug = 'vancouver-house-renovation-kitchen-and-bathrooms'
  AND (challenge_zh IS NULL OR challenge_zh = '')
  AND (solution_zh IS NULL OR solution_zh = '');

-- richmond-whole-home-renovation-marble-kitchen
UPDATE projects
SET challenge_zh = '全屋翻新使用大理石台面，管道必须与石材安装精密配合，工艺要求极高。'
  , solution_zh = '管道与石材工人协同作业，大理石台面现场切割适配，全屋铜管更换，一体化高端交付。'
WHERE slug = 'richmond-whole-home-renovation-marble-kitchen'
  AND (challenge_zh IS NULL OR challenge_zh = '')
  AND (solution_zh IS NULL OR solution_zh = '');

-- delta-kitchen-renovation-apron-sink-quartz
UPDATE projects
SET challenge_zh = 'Delta厨房要求安装农夫风格水槽，石英石台面需要配合较大的重型水槽，开孔精度要求高。'
  , solution_zh = '管道工与石材工精确配合，农夫水槽安装找平，石英石台面精密开孔，一次验收通过。'
WHERE slug = 'delta-kitchen-renovation-apron-sink-quartz'
  AND (challenge_zh IS NULL OR challenge_zh = '')
  AND (solution_zh IS NULL OR solution_zh = '');
