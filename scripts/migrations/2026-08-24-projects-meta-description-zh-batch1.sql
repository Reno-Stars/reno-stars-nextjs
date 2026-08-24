/**
 * Migration: Set meta_description_zh for 7 published projects missing it.
 * Date: 2026-08-24
 * Scope: is_published=true projects with NULL meta_description_zh
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-24-projects-meta-description-zh-batch1.sql
 */

BEGIN;

-- coquitlam-kitchen-renovation-quartz-island
-- zh title: 高贵林厨房装修：石英石中岛 | 聚星装修 Reno Stars
UPDATE projects
SET meta_description_zh = '高贵林石英石瀑布岛台厨房翻新工程。白橱柜配嵌入式烤箱和集成冰箱，石英石台面，线性吊灯照亮四人座中岛。二楼浴室同步翻新：大理石纹台面圆形背光镜，壁炉大理石纹理包边。全层铺设抛光大板瓷砖。'
WHERE slug = 'coquitlam-kitchen-renovation-quartz-island'
  AND (meta_description_zh IS NULL OR char_length(meta_description_zh) = 0);

-- north-vancouver-bathroom-renovation-herringbone-tile
-- zh title: 北温浴室装修：黑色人字拼瓷砖 | 聚星装修 Reno Stars
UPDATE projects
SET meta_description_zh = '北温哥华黑色人字纹瓷砖浴室翻新。白色浸入式浴缸配黑色光泽瓷砖通高围边，墙面嵌入式壁龛，黄铜五金配件在深色瓷砖上格外醒目，浴缸上方筒灯保持狭长空间明亮。'
WHERE slug = 'north-vancouver-bathroom-renovation-herringbone-tile'
  AND (meta_description_zh IS NULL OR char_length(meta_description_zh) = 0);

-- vancouver-house-renovation-kitchen-and-bathrooms
-- zh title: 温哥华全屋装修：厨房与卫浴 | 聚星装修 Reno Stars
UPDATE projects
SET meta_description_zh = '温哥华全屋翻新：厨房、双浴室及全屋地板。白橱柜配大理石纹瓷砖挡水板、哑光黑把手、石英石台板、不锈钢台下盆。二楼主卫大板灰瓷砖环绕浴缸和淋浴，Shaker风格双盆柜配石英石台面。大板木纹乙烯基地板和嵌入式照明贯通客厅区域。'
WHERE slug = 'vancouver-house-renovation-kitchen-and-bathrooms'
  AND (meta_description_zh IS NULL OR char_length(meta_description_zh) = 0);

-- richmond-condo-flooring-renovation
-- zh title: 列治文公寓地板更换 | 聚星装修 Reno Stars
UPDATE projects
SET meta_description_zh = '列治文高层公寓全屋地板更换。客厅和卧室铺设浅色橡木工程木地板，与入口和浴室门槛现有瓷砖无缝过渡。基础踢脚线按新地板高度重新安装，浅色饰面配合落地窗使空间通透明亮。'
WHERE slug = 'richmond-condo-flooring-renovation'
  AND (meta_description_zh IS NULL OR char_length(meta_description_zh) = 0);

-- richmond-house-renovation-kitchen-bathrooms-flooring
-- zh title: 列治文全屋装修：厨房、卫浴与地板 | 聚星装修 Reno Stars
UPDATE projects
SET meta_description_zh = '列治文全屋翻新：厨房、三间浴室、全屋地板及墙面涂料。保留枫木橱柜并重新整新，搭配新石英石台面、大理石纹瓷砖挡水板、台下双盆和嵌入式洗碗机。主卫重建：Shaker双盆柜配宽幅框镜，玻璃淋浴间铺大板大理石纹瓷砖。宽板地板和新鲜墙面涂料贯通客厅和卧室。'
WHERE slug = 'richmond-house-renovation-kitchen-bathrooms-flooring'
  AND (meta_description_zh IS NULL OR char_length(meta_description_zh) = 0);

-- delta-kitchen-renovation-apron-sink-quartz
-- zh title: 三角洲厨房装修：农场水槽与石英石 | 聚星装修 Reno Stars
UPDATE projects
SET meta_description_zh = '三角洲白色Shaker橱柜厨房翻新，瀑布石英石半岛配全高台面。窗户下深槽农场式水槽配黄铜抽拉龙头，叠层瓷砖挡水板反射光线，橡木色地板贯穿空间。浴室同步翻新，灰色台盆柜配黑色框镜面对大理石纹瓷砖浴缸围边。'
WHERE slug = 'delta-kitchen-renovation-apron-sink-quartz'
  AND (meta_description_zh IS NULL OR char_length(meta_description_zh) = 0);

-- richmond-whole-home-renovation-marble-kitchen
-- zh title: 列治文全屋装修：仿大理石厨房 | 聚星装修 Reno Stars
UPDATE projects
SET meta_description_zh = '列治文以大理石纹理厨房为核心的全屋翻新。挡水板和台面通高铺贴大理石纹岩板，配拱形玻璃门板橱柜、哑光黄铜龙头和黑色台下盆。化妆间配台盆和有机形镜面；楼梯以浅色橡木重建；条形瓷砖淋浴壁龛内衬大理石纹瓷砖；走廊嵌入式衣柜配感应照明。'
WHERE slug = 'richmond-whole-home-renovation-marble-kitchen'
  AND (meta_description_zh IS NULL OR char_length(meta_description_zh) = 0);

END;
