/**
 * Generates bilingual example ZIP files for batch upload:
 *   - public/example-batch-upload-en.zip (English templates)
 *   - public/example-batch-upload-zh.zip (Chinese templates)
 *
 * Run: npx tsx scripts/build-example-zip.ts
 */
import { zipSync } from 'fflate';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Tiny 1x1 JPEG placeholder (valid JPEG)
// ---------------------------------------------------------------------------
const PLACEHOLDER_JPG = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
  0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
  0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
  0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
  0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
  0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
  0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
  0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
  0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
  0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
  0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7d,
  0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
  0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
  0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
  0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
  0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
  0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
  0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
  0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
  0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
  0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
  0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
  0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
  0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
  0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01,
  0x00, 0x00, 0x3f, 0x00, 0x7b, 0x94, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xd9,
]);

const enc = new TextEncoder();

// ---------------------------------------------------------------------------
// Notes templates — English
// ---------------------------------------------------------------------------

const SITE_NOTES_EN = `=== SITE INFORMATION (fill in what you know) ===

Location: [City, Province — e.g. Richmond, BC]
PO Number: [Sales/work order number — e.g. PO-8171]
Client Type: [Young family / Retired couple / Investor / Commercial tenant]
Property Type: [Single-family home / Townhouse / Condo / Commercial space]
Property Age: [e.g. 1990s rancher / 2005 townhouse / 1970s split-level]
Total Budget: [e.g. $85,000 - $120,000]
Total Duration: [e.g. 8-10 weeks]

=== PROJECT OVERVIEW ===

Scope: [Brief summary — e.g. Full gut renovation of main floor and 2 bathrooms]
Design Style: [e.g. Modern minimalist / Transitional / Contemporary farmhouse]
Color Palette: [e.g. White and warm grey with gold accents]

=== KEY HIGHLIGHTS (for marketing) ===

- [e.g. Open-concept kitchen-living transformation]
- [e.g. Custom millwork throughout]
- [e.g. Heated bathroom floors]
- [e.g. Smart home integration]

=== CHALLENGES & SOLUTIONS ===

Challenge: [e.g. Load-bearing wall between kitchen and living room]
Solution: [e.g. Installed LVL beam with concealed steel post]

Challenge: [e.g. Outdated electrical not up to code]
Solution: [e.g. Full panel upgrade to 200A with AFCI breakers]

=== ADDITIONAL NOTES ===

[Any other details: permit info, special client requests, awards, etc.]
`;

const KITCHEN_NOTES_EN = `=== KITCHEN PROJECT DETAILS ===

Project Type: Kitchen
Budget: [e.g. $35,000 - $45,000]
Duration: [e.g. 4 weeks]

=== SCOPE OF WORK ===

- [e.g. Full gut renovation — demo to studs]
- [e.g. Wall removal to create open concept]
- [e.g. New cabinetry, countertops, backsplash, flooring]
- [e.g. Relocated sink and dishwasher plumbing]
- [e.g. New pot lights and under-cabinet LED lighting]
- [e.g. Appliance package installation]

=== MATERIALS & FINISHES ===

Cabinets: [e.g. Shaker-style, soft-close, white matte finish]
Countertops: [e.g. Calacatta quartz, 3cm with waterfall island edge]
Backsplash: [e.g. Subway tile in herringbone pattern, matte white]
Flooring: [e.g. Engineered hardwood, European white oak]
Hardware: [e.g. Brushed gold pulls and knobs]
Sink: [e.g. Undermount single-bowl stainless steel]
Faucet: [e.g. Matte black pull-down sprayer]

=== APPLIANCES ===

- [e.g. 36" induction cooktop — Bosch]
- [e.g. Built-in wall oven — KitchenAid]
- [e.g. French door refrigerator — Samsung]
- [e.g. Integrated dishwasher — Bosch]
- [e.g. Range hood — Zephyr 600 CFM]

=== DESIGN FEATURES ===

- [e.g. Kitchen island with seating for 4]
- [e.g. Walk-in pantry with custom shelving]
- [e.g. Pot filler above cooktop]
- [e.g. Open shelving beside range hood]

=== CHALLENGES ===

[e.g. Needed structural beam to remove load-bearing wall; asbestos abatement in old flooring]
`;

const BATHROOM_NOTES_EN = `=== BATHROOM PROJECT DETAILS ===

Project Type: Bathroom
Budget: [e.g. $18,000 - $25,000]
Duration: [e.g. 2-3 weeks]

=== SCOPE OF WORK ===

- [e.g. Full gut renovation of master ensuite]
- [e.g. Converted tub/shower combo into walk-in frameless glass shower]
- [e.g. New vanity, toilet, shower, tile, lighting]
- [e.g. Added heated floor system]
- [e.g. Waterproofing with Schluter-KERDI membrane]

=== MATERIALS & FINISHES ===

Vanity: [e.g. 48" floating vanity, walnut with white quartz top]
Toilet: [e.g. Wall-hung dual-flush — TOTO]
Shower: [e.g. Frameless glass enclosure, rain head + handheld]
Wall Tile: [e.g. Large-format porcelain, 24x48, matte grey]
Floor Tile: [e.g. Hexagon mosaic, Carrara marble look]
Hardware: [e.g. Matte black fixtures throughout]
Lighting: [e.g. LED mirror with built-in defogger]

=== DESIGN FEATURES ===

- [e.g. Curbless shower entry for accessibility]
- [e.g. Recessed niche with LED strip lighting]
- [e.g. Heated towel rack]
- [e.g. Custom medicine cabinet]

=== CHALLENGES ===

[e.g. Discovered water damage behind old tile — replaced subfloor and sister joists]
`;

const BASEMENT_NOTES_EN = `=== BASEMENT PROJECT DETAILS ===

Project Type: Basement
Budget: [e.g. $30,000 - $40,000]
Duration: [e.g. 4-5 weeks]

=== SCOPE OF WORK ===

- [e.g. Finished previously unfinished concrete space]
- [e.g. Framing, insulation, drywall, flooring, lighting]
- [e.g. Added 3-piece bathroom]
- [e.g. Built home theatre area with soundproofing]
- [e.g. Installed egress window for bedroom legality]

=== MATERIALS & FINISHES ===

Flooring: [e.g. Luxury vinyl plank with moisture barrier]
Walls: [e.g. Drywall with R-20 batt insulation + vapor barrier]
Ceiling: [e.g. Suspended acoustic tile for easy access to mechanicals]
Lighting: [e.g. 4" slim LED pot lights on dimmers]
Bathroom: [e.g. 3-piece with 32" shower stall, pedestal sink]

=== DESIGN FEATURES ===

- [e.g. Built-in entertainment center with concealed wiring]
- [e.g. Home office nook with custom desk]
- [e.g. Wet bar with mini fridge and quartz countertop]
- [e.g. Storage room with custom shelving]

=== CHALLENGES ===

[e.g. Low ceiling height required careful layout planning; sump pump relocated for bathroom rough-in]
`;

// ---------------------------------------------------------------------------
// Notes templates — Chinese
// ---------------------------------------------------------------------------

const SITE_NOTES_ZH = `=== 工地信息（请填写您知道的内容）===

地点: [城市、省份 — 例如：列治文, BC]
PO编号: [销售/工单编号 — 例如：PO-8171]
客户类型: [年轻家庭 / 退休夫妇 / 投资者 / 商业租户]
物业类型: [独立屋 / 联排别墅 / 公寓 / 商业空间]
房龄: [例如：1990年代平层 / 2005年联排 / 1970年代错层]
总预算: [例如：$85,000 - $120,000]
总工期: [例如：8-10周]

=== 项目概述 ===

范围: [简要总结 — 例如：主层全面翻新加2个卫生间]
设计风格: [例如：现代简约 / 过渡风格 / 现代农舍风]
色彩方案: [例如：白色和暖灰色搭配金色点缀]

=== 重点亮点（用于营销）===

- [例如：厨房-客厅开放式改造]
- [例如：全屋定制木作]
- [例如：卫生间地暖系统]
- [例如：智能家居集成]

=== 挑战与解决方案 ===

挑战: [例如：厨房和客厅之间的承重墙]
方案: [例如：安装LVL梁配隐藏式钢柱]

挑战: [例如：老旧电路不符合规范]
方案: [例如：升级至200A配电箱，加装AFCI断路器]

=== 其他备注 ===

[其他细节：许可证信息、客户特殊要求、获奖情况等]
`;

const KITCHEN_NOTES_ZH = `=== 厨房项目详情 ===

项目类型: 厨房
预算: [例如：$35,000 - $45,000]
工期: [例如：4周]

=== 施工范围 ===

- [例如：全面拆除翻新 — 拆至骨架]
- [例如：拆墙打通开放式空间]
- [例如：全新橱柜、台面、后挡板、地板]
- [例如：水槽和洗碗机管道重新布局]
- [例如：新增射灯和橱柜下LED灯带]
- [例如：全套电器安装]

=== 材料与饰面 ===

橱柜: [例如：Shaker风格、缓冲闭合、白色哑光]
台面: [例如：卡拉卡塔石英石, 3cm厚, 岛台瀑布边]
后挡板: [例如：人字形地铁砖, 哑光白]
地板: [例如：工程实木地板, 欧洲白橡木]
五金: [例如：拉丝金色把手和旋钮]
水槽: [例如：台下式单槽不锈钢]
水龙头: [例如：哑光黑色抽拉式]

=== 电器 ===

- [例如：36寸电磁灶 — Bosch]
- [例如：嵌入式烤箱 — KitchenAid]
- [例如：法式对开门冰箱 — Samsung]
- [例如：嵌入式洗碗机 — Bosch]
- [例如：油烟机 — Zephyr 600 CFM]

=== 设计亮点 ===

- [例如：可坐4人的厨房岛台]
- [例如：步入式储藏室配定制搁架]
- [例如：灶台上方注水龙头]
- [例如：油烟机旁开放式搁架]

=== 挑战 ===

[例如：拆除承重墙需安装结构梁；旧地板含石棉需专业清除]
`;

const BATHROOM_NOTES_ZH = `=== 卫生间项目详情 ===

项目类型: 卫生间
预算: [例如：$18,000 - $25,000]
工期: [例如：2-3周]

=== 施工范围 ===

- [例如：主卧套间卫生间全面翻新]
- [例如：浴缸/淋浴组合改为无框玻璃步入式淋浴]
- [例如：全新浴室柜、马桶、淋浴、瓷砖、灯具]
- [例如：加装地暖系统]
- [例如：Schluter-KERDI防水膜防水处理]

=== 材料与饰面 ===

浴室柜: [例如：48寸悬挂式, 胡桃木配白色石英石台面]
马桶: [例如：壁挂式双冲水 — TOTO]
淋浴: [例如：无框玻璃围挡, 顶喷+手持花洒]
墙砖: [例如：大板瓷砖, 24x48, 哑光灰]
地砖: [例如：六角马赛克, 卡拉拉大理石纹]
五金: [例如：全套哑光黑色龙头五金]
灯具: [例如：LED防雾镜]

=== 设计亮点 ===

- [例如：无门槛淋浴入口（无障碍设计）]
- [例如：嵌入式壁龛配LED灯带]
- [例如：电热毛巾架]
- [例如：定制镜柜]

=== 挑战 ===

[例如：拆除旧瓷砖后发现水损 — 更换地板基层并加固托梁]
`;

const BASEMENT_NOTES_ZH = `=== 地下室项目详情 ===

项目类型: 地下室
预算: [例如：$30,000 - $40,000]
工期: [例如：4-5周]

=== 施工范围 ===

- [例如：未完成的混凝土空间全面装修]
- [例如：框架、保温、石膏板、地板、照明]
- [例如：新增三件套卫生间]
- [例如：打造家庭影院区域（含隔音处理）]
- [例如：安装逃生窗（卧室合规要求）]

=== 材料与饰面 ===

地板: [例如：SPC石塑地板配防潮层]
墙面: [例如：石膏板 + R-20保温棉 + 防潮层]
天花板: [例如：悬挂式吸音板（便于维修管线）]
照明: [例如：4寸超薄LED射灯配调光器]
卫生间: [例如：三件套，32寸淋浴间，立柱盆]

=== 设计亮点 ===

- [例如：嵌入式娱乐中心（隐藏走线）]
- [例如：家庭办公角落配定制书桌]
- [例如：湿吧台配迷你冰箱和石英石台面]
- [例如：储物间配定制搁架]

=== 挑战 ===

[例如：层高较低需精心规划布局；污水泵重新定位以配合卫生间排水]
`;

// ---------------------------------------------------------------------------
// Build ZIP for a given locale
// ---------------------------------------------------------------------------

function buildZip(notes: {
  site: string;
  kitchen: string;
  bathroom: string;
  basement: string;
}): Uint8Array {
  const root = 'Richmond Whole House';

  const files: Record<string, Uint8Array> = {
    // Site root
    [`${root}/hero.jpg`]: PLACEHOLDER_JPG,
    [`${root}/notes.txt`]: enc.encode(notes.site),
    [`${root}/Before 1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/After 1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Before 2.jpg`]: PLACEHOLDER_JPG,
    [`${root}/After 2.jpg`]: PLACEHOLDER_JPG,
    [`${root}/exterior.jpg`]: PLACEHOLDER_JPG,

    // Kitchen
    [`${root}/Kitchen/notes.txt`]: enc.encode(notes.kitchen),
    [`${root}/Kitchen/before-1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Kitchen/after-1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Kitchen/before-2.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Kitchen/after-2.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Kitchen/before-3.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Kitchen/after-3.jpg`]: PLACEHOLDER_JPG,

    // Bathroom
    [`${root}/Bathroom/notes.txt`]: enc.encode(notes.bathroom),
    [`${root}/Bathroom/before-1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Bathroom/after-1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Bathroom/before-2.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Bathroom/after-2.jpg`]: PLACEHOLDER_JPG,

    // Basement (with project-level hero)
    [`${root}/Basement/hero.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Basement/notes.txt`]: enc.encode(notes.basement),
    [`${root}/Basement/before-1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Basement/after-1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Basement/before-2.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Basement/after-2.jpg`]: PLACEHOLDER_JPG,
  };

  return zipSync(files, { level: 6 });
}

// ---------------------------------------------------------------------------
// Generate both ZIPs
// ---------------------------------------------------------------------------

const outDir = path.join(process.cwd(), 'public');

const enZip = buildZip({
  site: SITE_NOTES_EN,
  kitchen: KITCHEN_NOTES_EN,
  bathroom: BATHROOM_NOTES_EN,
  basement: BASEMENT_NOTES_EN,
});
fs.writeFileSync(path.join(outDir, 'example-batch-upload-en.zip'), enZip);
console.log(`Created example-batch-upload-en.zip (${(enZip.length / 1024).toFixed(1)} KB)`);

const zhZip = buildZip({
  site: SITE_NOTES_ZH,
  kitchen: KITCHEN_NOTES_ZH,
  bathroom: BATHROOM_NOTES_ZH,
  basement: BASEMENT_NOTES_ZH,
});
fs.writeFileSync(path.join(outDir, 'example-batch-upload-zh.zip'), zhZip);
console.log(`Created example-batch-upload-zh.zip (${(zhZip.length / 1024).toFixed(1)} KB)`);
