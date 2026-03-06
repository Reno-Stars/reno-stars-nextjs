/**
 * Generates bilingual example ZIP files for batch upload:
 *   - public/example-batch-upload-en.zip (English)
 *   - public/example-batch-upload-zh.zip (Chinese)
 *
 * Covers ALL supported features:
 *   - Nested layout (site with subfolders = projects)
 *   - Single-folder layout (standalone project auto-wrapped in site)
 *   - hero.jpg at site and project level
 *   - before-N / after-N pairs (hyphen separator)
 *   - before.jpg / after.jpg (no index = pair 0)
 *   - Standalone images (after-only pairs)
 *   - product-N images matched to products.txt entries by index
 *   - Skipping product indices (product-1, product-3 = skip 2nd)
 *   - notes.txt / description.txt / info.txt / readme.txt (all recognized)
 *   - products.txt / links.txt / external.txt (all recognized)
 *   - 4 residential service types auto-detected from folder names (kitchen, bathroom, basement, cabinet)
 *   - Multiple image formats (.jpg, .png, .webp)
 *   - Realistic filled-in content (not blank templates)
 *
 * Run: npx tsx scripts/build-example-zip.ts
 */
import { zipSync } from 'fflate';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Tiny placeholder images (valid minimal files)
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

const PLACEHOLDER_PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
  0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, 0x00, 0x00, 0x00,
  0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

const PLACEHOLDER_WEBP = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  0x56, 0x50, 0x38, 0x4c, 0x0d, 0x00, 0x00, 0x00, 0x2f, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

const enc = new TextEncoder();

// ---------------------------------------------------------------------------
// Realistic notes (filled in, not templates)
// ---------------------------------------------------------------------------

function siteNotes(lang: 'en' | 'zh'): string {
  if (lang === 'en') return `Location: Richmond, BC
PO Number: PO-2024-8171
Client Type: Young family with two kids
Property Type: 1995 two-storey single-family home
Total Budget: $95,000 - $120,000
Total Duration: 10 weeks

Scope: Full main floor gut renovation — kitchen, master ensuite, powder room, basement finishing.
Design Style: Modern transitional with warm tones
Color Palette: White oak, warm grey, matte black accents, brushed gold hardware

Key Highlights:
- Removed load-bearing wall to create open-concept kitchen-living area
- Custom white oak millwork throughout main floor
- Heated tile floors in all bathrooms
- Smart home integration (Lutron lighting, Ecobee thermostat)

Challenge: Load-bearing wall between kitchen and living room
Solution: Installed 16' LVL beam with concealed steel post and custom drywall wrap

Challenge: Original 100A electrical panel with aluminum wiring
Solution: Full panel upgrade to 200A, rewired kitchen and bathrooms with copper

Permit: City of Richmond BP-2024-03456
WorkSafeBC compliant — all trades licensed and insured`;

  return `地点: 列治文, BC
PO编号: PO-2024-8171
客户类型: 有两个孩子的年轻家庭
物业类型: 1995年两层独立屋
总预算: $95,000 - $120,000
总工期: 10周

范围: 主层全面翻新 — 厨房、主卧套间卫生间、粉间、地下室装修
设计风格: 现代过渡风格，暖色调
色彩方案: 白橡木、暖灰色、哑光黑点缀、拉丝金色五金

重点亮点:
- 拆除承重墙打造开放式厨房-客厅空间
- 主层全屋定制白橡木木作
- 所有卫生间地暖瓷砖
- 智能家居集成（Lutron灯光、Ecobee温控器）

挑战: 厨房和客厅之间的承重墙
方案: 安装16英尺LVL梁，配隐藏式钢柱和定制石膏板包裹

挑战: 原100A配电箱，铝线布线
方案: 升级至200A配电箱，厨房和卫生间全部改铜线

许可证: 列治文市 BP-2024-03456
符合WorkSafeBC规范 — 所有工种持证且已投保`;
}

function kitchenNotes(lang: 'en' | 'zh'): string {
  if (lang === 'en') return `Project Type: Kitchen
Budget: $38,000
Duration: 4 weeks

Scope of Work:
- Full gut renovation — demolished to studs
- Removed wall to dining room (non-load-bearing)
- New custom cabinetry, quartz countertops, tile backsplash
- Relocated sink plumbing for island placement
- 12 new pot lights + under-cabinet LED strips
- All new Bosch appliance package

Materials:
- Cabinets: Shaker-style, soft-close, white matte lacquer by Sunrise Kitchen
- Countertops: Calacatta Laza quartz, 3cm, waterfall island edge
- Backsplash: 2x8 ceramic subway tile, herringbone pattern, matte white
- Flooring: 7" European white oak engineered hardwood (throughout main floor)
- Hardware: Brushed gold pulls (128mm) and knobs by Richelieu
- Sink: Kohler Prolific undermount single-bowl, stainless steel
- Faucet: Moen Align pull-down, matte black

Appliances:
- 36" Bosch 800 Series induction cooktop
- Bosch 30" single wall oven
- Bosch 800 Series French door refrigerator
- Bosch 500 Series integrated dishwasher
- Zephyr Breeze II 30" range hood, 600 CFM

Design Features:
- 8' kitchen island with waterfall edge, seating for 4
- Walk-in pantry with custom pine shelving and barn door
- Pot filler above cooktop (matte black, Moen S665BL)
- Open shelving flanking range hood in floating white oak

Challenge: Needed 14' structural beam for wall removal; discovered asbestos in original 1995 vinyl flooring — professional abatement required before demo.`;

  return `项目类型: 厨房
预算: $38,000
工期: 4周

施工范围:
- 全面拆除翻新 — 拆至骨架
- 拆除通往餐厅的非承重墙
- 全新定制橱柜、石英石台面、瓷砖后挡板
- 重新布置水管以安装岛台
- 12个新射灯 + 橱柜下LED灯带
- 全套Bosch电器

材料:
- 橱柜: Sunrise Kitchen Shaker风格，缓冲闭合，白色哑光漆面
- 台面: Calacatta Laza石英石，3cm厚，岛台瀑布边
- 后挡板: 2x8陶瓷地铁砖，人字形拼贴，哑光白
- 地板: 7寸欧洲白橡木工程实木（贯穿整个主层）
- 五金: Richelieu拉丝金色把手（128mm）和旋钮
- 水槽: Kohler Prolific台下式单槽不锈钢
- 水龙头: Moen Align抽拉式，哑光黑

电器:
- 36寸 Bosch 800系列电磁灶
- Bosch 30寸嵌入式烤箱
- Bosch 800系列法式对开门冰箱
- Bosch 500系列嵌入式洗碗机
- Zephyr Breeze II 30寸油烟机，600 CFM

设计亮点:
- 8英尺厨房岛台，瀑布边设计，可坐4人
- 步入式储藏室，定制松木搁架和谷仓门
- 灶台上方注水龙头（哑光黑，Moen S665BL）
- 油烟机两侧悬浮白橡木开放式搁架

挑战: 拆墙需要14英尺结构梁；发现1995年原始乙烯地板含石棉 — 需专业清除后才能开工。`;
}

function bathroomNotes(lang: 'en' | 'zh'): string {
  if (lang === 'en') return `Project Type: Bathroom (Master Ensuite)
Budget: $24,000
Duration: 3 weeks

Scope of Work:
- Full gut renovation of 5-piece master ensuite
- Converted tub/shower combo into 5' frameless glass walk-in shower
- New floating vanity, wall-hung toilet, freestanding tub
- Heated tile floor system (Nuheat Mat, 120V)
- Full Schluter-KERDI waterproofing membrane system

Materials:
- Vanity: 60" floating double vanity, walnut veneer with white quartz top
- Toilet: TOTO Ultramax II wall-hung, dual flush (0.9/1.28 GPF)
- Tub: Woodbridge 59" acrylic freestanding soaking tub
- Shower: 10mm frameless glass enclosure, rain head + handheld, thermostatic valve
- Wall Tile: 24x48 porcelain, matte grey (Centura London Fog)
- Floor Tile: 2" hexagon mosaic, Carrara marble look
- Hardware: Matte black fixtures throughout (Moen Align series)
- Lighting: 48" LED mirror with built-in defogger + dimmer

Design Features:
- Curbless shower entry (linear drain, universal accessibility)
- 12x24 recessed double niche with LED strip accent
- Heated towel rack (Amba Radiant, hardwired)
- Custom framed medicine cabinet with interior outlets

Challenge: Discovered extensive water damage behind old tile — rotted subfloor and two joists. Replaced 4x6' section of subfloor, sistered both damaged joists with LVL.`;

  return `项目类型: 卫生间（主卧套间）
预算: $24,000
工期: 3周

施工范围:
- 五件套主卧套间卫生间全面翻新
- 浴缸/淋浴组合改为5英尺无框玻璃步入式淋浴
- 新悬挂式浴室柜、壁挂式马桶、独立式浴缸
- 地暖系统（Nuheat Mat, 120V）
- Schluter-KERDI防水膜系统全覆盖

材料:
- 浴室柜: 60寸悬挂式双盆，胡桃木饰面配白色石英石台面
- 马桶: TOTO Ultramax II壁挂式，双冲水（0.9/1.28 GPF）
- 浴缸: Woodbridge 59寸亚克力独立式泡澡缸
- 淋浴: 10mm无框玻璃围挡，顶喷+手持花洒，恒温阀
- 墙砖: 24x48瓷砖，哑光灰（Centura London Fog）
- 地砖: 2寸六角马赛克，卡拉拉大理石纹
- 五金: 全套哑光黑（Moen Align系列）
- 灯具: 48寸LED防雾调光镜

设计亮点:
- 无门槛淋浴入口（线性排水，无障碍设计）
- 12x24嵌入式双壁龛配LED灯带
- 电热毛巾架（Amba Radiant，硬线连接）
- 定制镜框药柜，内置插座

挑战: 拆除旧瓷砖后发现严重水损 — 地板基层腐烂，两根托梁受损。更换4x6英尺地板基层，用LVL加固两根受损托梁。`;
}

function basementNotes(lang: 'en' | 'zh'): string {
  if (lang === 'en') return `Project Type: Basement
Budget: $42,000
Duration: 5 weeks

Scope of Work:
- Finished previously unfinished 850 sq ft concrete basement
- Full framing (2x4 walls, 2x6 on exterior), insulation, drywall
- Added 3-piece bathroom with shower (new rough-in)
- Home theatre area with acoustic soundproofing
- Installed egress window (bedroom code requirement)
- New electrical sub-panel (60A) for basement circuits

Materials:
- Flooring: COREtec Plus XL luxury vinyl plank (Hampden Oak) with built-in cork underlayment
- Walls: 1/2" drywall on 2x4 framing, R-14 Roxul mineral wool + 6mil poly vapor barrier
- Ceiling: Armstrong suspended acoustic tile (easy access to HVAC/plumbing above)
- Lighting: 4" Halo slim LED wafer lights on Lutron Caseta dimmers (18 total)
- Bathroom: Maax 32" neo-angle shower, Kohler pedestal sink, American Standard Cadet toilet

Design Features:
- Built-in entertainment center (8' wide) with concealed conduit for HDMI/power
- Home office nook with 6' custom walnut desktop and built-in USB outlets
- Wet bar area with bar fridge, undermount sink, and quartz countertop
- 10x12 storage/utility room with heavy-duty wire shelving

Challenge: 7'2" ceiling height required careful planning — used slim LED wafers instead of pot lights, ran ductwork through bulkheads. Relocated sump pump 4' east to accommodate bathroom rough-in.`;

  return `项目类型: 地下室
预算: $42,000
工期: 5周

施工范围:
- 850平方英尺未完成混凝土地下室全面装修
- 全面框架（2x4内墙，2x6外墙）、保温、石膏板
- 新增三件套卫生间含淋浴（新排水粗管）
- 家庭影院区域含声学隔音
- 安装逃生窗（卧室合规要求）
- 新增60A电气子面板

材料:
- 地板: COREtec Plus XL石塑地板（Hampden Oak），内置软木底层
- 墙面: 1/2寸石膏板，2x4框架，R-14 Roxul矿棉 + 6mil聚乙烯防潮层
- 天花板: Armstrong悬挂式吸音板（便于检修上方暖通/管道）
- 照明: 4寸Halo超薄LED晶圆灯配Lutron Caseta调光器（共18个）
- 卫生间: Maax 32寸钻石型淋浴间，Kohler立柱盆，American Standard Cadet马桶

设计亮点:
- 嵌入式娱乐中心（8英尺宽），隐藏HDMI/电源走线管
- 家庭办公角落，6英尺定制胡桃木桌面配内置USB插座
- 湿吧台区，配小冰箱、台下水槽和石英石台面
- 10x12储物/设备间配重型铁丝搁架

挑战: 7英尺2寸层高需精心规划 — 使用超薄LED晶圆灯代替射灯，暖通管道走吊顶。将污水泵东移4英尺以配合卫生间排水粗管。`;
}

function cabinetNotes(lang: 'en' | 'zh'): string {
  if (lang === 'en') return `Project Type: Cabinet / Cabinetry
Budget: $15,500
Duration: 2 weeks

Scope of Work:
- Custom cabinetry design and installation (main floor kitchen + laundry)
- Replaced all upper and lower kitchen cabinets (22 doors, 8 drawer fronts)
- Added floor-to-ceiling pantry tower with pull-out shelves
- New lazy Susan corner unit
- All new hardware throughout

Materials:
- Cabinet Style: Flat-panel modern, thermofoil, high-gloss white (uppers) / walnut veneer (lowers)
- Hardware: Richelieu integrated edge pulls (matte black) + Blum soft-close hinges
- Interior: Custom drawer organizers, pull-out trash/recycling, spice rack
- Pantry: 6-shelf pull-out system with adjustable dividers

Design Features:
- Two-tone design — white uppers create brightness, walnut lowers add warmth
- Glass-front display cabinets (2 units) with interior LED puck lights
- Deep pot drawers flanking cooktop (36" wide, full-extension)
- Integrated appliance garage for small countertop appliances

Challenge: Walls up to 1.5" out of plumb — required custom scribing and shimming on every cabinet for flush fit. Existing countertop saved and re-templated.`;

  return `项目类型: 橱柜
预算: $15,500
工期: 2周

施工范围:
- 定制橱柜设计和安装（主层厨房+洗衣房）
- 更换所有上柜和下柜（22扇门板，8个抽屉面板）
- 新增落地式储物高柜配拉出式搁板
- 新增旋转拉篮转角柜
- 全部更换新五金件

材料:
- 柜体风格: 平板现代风，热压膜，高光白（上柜）/ 胡桃木饰面（下柜）
- 五金: Richelieu一体式边缘拉手（哑光黑）+ Blum缓冲铰链
- 内部: 定制抽屉分隔器、拉出式垃圾/回收桶、调料架
- 储物柜: 6层拉出式系统配可调节分隔器

设计亮点:
- 双色设计 — 白色上柜增加明亮感，胡桃木下柜增添温暖
- 玻璃门展示柜（2组）配内部LED射灯
- 灶台两侧深抽锅具抽屉（36寸宽，全伸出式）
- 内嵌式电器收纳柜

挑战: 墙面偏差达1.5寸 — 每个柜体均需定制划线和垫平以确保齐平安装。保留原有台面并重新模板。`;
}

// ---------------------------------------------------------------------------
// Products content (realistic, filled in)
// ---------------------------------------------------------------------------

function siteProducts(lang: 'en' | 'zh'): string {
  if (lang === 'en') return `# Site-level external product links
# Format: URL | English Label | Chinese Label
# To add a product image, include product-N.jpg in the same folder (N = line position)

# Product 1 — has product-1.jpg in folder
https://www.homedepot.ca/product/moen-align-single-handle-pull-down-kitchen-faucet/1001657046 | Moen Align Kitchen Faucet | Moen Align 厨房水龙头
# Product 2 — no product-2.jpg, so no image
https://www.lowes.ca/product/quartz-countertops/silestone-calacatta-gold-quartz | Silestone Calacatta Gold Quartz | Silestone 卡拉卡塔金石英石台面
# Product 3 — has product-3.jpg in folder
https://www.ikea.com/ca/en/p/sektion-base-cabinet-white-voxtorp-walnut-s59428306/ | IKEA SEKTION Base Cabinet | IKEA SEKTION 底柜
`;

  return `# 工地级别外部产品链接
# 格式: URL | 英文标签 | 中文标签
# 如需添加产品图片，在同一文件夹中放入 product-N.jpg（N = 产品行号）

# 产品1 — 文件夹中有 product-1.jpg
https://www.homedepot.ca/product/moen-align-single-handle-pull-down-kitchen-faucet/1001657046 | Moen Align Kitchen Faucet | Moen Align 厨房水龙头
# 产品2 — 没有 product-2.jpg，不会有图片
https://www.lowes.ca/product/quartz-countertops/silestone-calacatta-gold-quartz | Silestone Calacatta Gold Quartz | Silestone 卡拉卡塔金石英石台面
# 产品3 — 文件夹中有 product-3.jpg
https://www.ikea.com/ca/en/p/sektion-base-cabinet-white-voxtorp-walnut-s59428306/ | IKEA SEKTION Base Cabinet | IKEA SEKTION 底柜
`;
}

function kitchenProducts(lang: 'en' | 'zh'): string {
  if (lang === 'en') return `# Product 1 — has product-1.jpg in folder
https://www.homedepot.ca/product/kohler-prolific-undermount-single-bowl-kitchen-sink/1001025042 | Kohler Prolific Undermount Sink | Kohler Prolific 台下水槽
# Product 2 — no product-2.jpg, link only
https://www.lowes.ca/product/range-hoods/zephyr-breeze-ii-30-in-range-hood/3456789 | Zephyr Breeze II Range Hood 600 CFM | Zephyr Breeze II 油烟机 600 CFM
`;

  return `# 产品1 — 文件夹中有 product-1.jpg
https://www.homedepot.ca/product/kohler-prolific-undermount-single-bowl-kitchen-sink/1001025042 | Kohler Prolific Undermount Sink | Kohler Prolific 台下水槽
# 产品2 — 没有 product-2.jpg，仅链接
https://www.lowes.ca/product/range-hoods/zephyr-breeze-ii-30-in-range-hood/3456789 | Zephyr Breeze II Range Hood 600 CFM | Zephyr Breeze II 油烟机 600 CFM
`;
}

function bathroomProducts(lang: 'en' | 'zh'): string {
  if (lang === 'en') return `# Product 1 — has product-1.jpg in folder
https://www.totousa.com/ultramax-ii-one-piece-toilet-128-gpf | TOTO Ultramax II Toilet | TOTO Ultramax II 马桶
# Product 2 — has product-2.jpg in folder
https://www.homedepot.ca/product/delta-in2ition-two-in-one-shower/1001234567 | Delta In2ition Shower System | Delta In2ition 淋浴系统
`;

  return `# 产品1 — 文件夹中有 product-1.jpg
https://www.totousa.com/ultramax-ii-one-piece-toilet-128-gpf | TOTO Ultramax II Toilet | TOTO Ultramax II 马桶
# 产品2 — 文件夹中有 product-2.jpg
https://www.homedepot.ca/product/delta-in2ition-two-in-one-shower/1001234567 | Delta In2ition Shower System | Delta In2ition 淋浴系统
`;
}

// ---------------------------------------------------------------------------
// Build ZIP for a given locale
// ---------------------------------------------------------------------------

function buildZip(locale: 'en' | 'zh'): Uint8Array {
  const root = 'Richmond Whole House';

  const files: Record<string, Uint8Array> = {
    // ======================================================================
    // SITE 1: Nested layout — whole house with all 5 project types
    // Demonstrates: hero, notes, products, product images, site-level pairs,
    //   standalone images, multiple image formats
    // ======================================================================

    // --- Site root ---
    [`${root}/hero.jpg`]: PLACEHOLDER_JPG,                            // Site hero image
    [`${root}/notes.txt`]: enc.encode(siteNotes(locale)),             // AI context (filled in)
    [`${root}/products.txt`]: enc.encode(siteProducts(locale)),       // 3 products with comments
    [`${root}/product-1.jpg`]: PLACEHOLDER_JPG,                       // -> 1st product (Moen faucet)
    [`${root}/product-3.jpg`]: PLACEHOLDER_JPG,                       // -> 3rd product (skip 2nd)
    [`${root}/before-1.jpg`]: PLACEHOLDER_JPG,                        // Site-level pair 1
    [`${root}/after-1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/before-2.jpg`]: PLACEHOLDER_JPG,                        // Site-level pair 2
    [`${root}/after-2.jpg`]: PLACEHOLDER_JPG,
    [`${root}/exterior.jpg`]: PLACEHOLDER_JPG,                        // Standalone -> after-only pair

    // --- Kitchen (auto-detected: "Kitchen" -> kitchen) ---
    [`${root}/Kitchen/notes.txt`]: enc.encode(kitchenNotes(locale)),
    [`${root}/Kitchen/products.txt`]: enc.encode(kitchenProducts(locale)),
    [`${root}/Kitchen/product-1.jpg`]: PLACEHOLDER_JPG,               // -> 1st product (Kohler sink)
    [`${root}/Kitchen/before-1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Kitchen/after-1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Kitchen/before-2.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Kitchen/after-2.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Kitchen/before-3.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Kitchen/after-3.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Kitchen/island-detail.png`]: PLACEHOLDER_PNG,           // PNG -> after-only pair

    // --- Bathroom (auto-detected: "Bathroom" -> bathroom) ---
    //     Uses alternate filenames: description.txt + links.txt
    [`${root}/Bathroom/description.txt`]: enc.encode(bathroomNotes(locale)),
    [`${root}/Bathroom/links.txt`]: enc.encode(bathroomProducts(locale)),
    [`${root}/Bathroom/product-1.jpg`]: PLACEHOLDER_JPG,              // -> 1st product (TOTO toilet)
    [`${root}/Bathroom/product-2.jpg`]: PLACEHOLDER_JPG,              // -> 2nd product (Delta shower)
    [`${root}/Bathroom/before-1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Bathroom/after-1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Bathroom/before-2.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Bathroom/after-2.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Bathroom/shower-niche.webp`]: PLACEHOLDER_WEBP,        // WebP -> after-only pair

    // --- Basement (auto-detected: "Basement" -> basement) ---
    //     Has project-level hero + uses before/after WITHOUT index (pair 0)
    [`${root}/Basement/hero.jpg`]: PLACEHOLDER_JPG,                   // Project hero
    [`${root}/Basement/info.txt`]: enc.encode(basementNotes(locale)), // "info.txt" also works
    [`${root}/Basement/before.jpg`]: PLACEHOLDER_JPG,                 // No index = pair 0
    [`${root}/Basement/after.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Basement/before-2.jpg`]: PLACEHOLDER_JPG,               // Pair 2
    [`${root}/Basement/after-2.jpg`]: PLACEHOLDER_JPG,

    // --- Cabinetry (auto-detected: "Cabinetry" -> cabinet) ---
    [`${root}/Cabinetry/notes.txt`]: enc.encode(cabinetNotes(locale)),
    [`${root}/Cabinetry/before-1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Cabinetry/after-1.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Cabinetry/before-2.jpg`]: PLACEHOLDER_JPG,
    [`${root}/Cabinetry/after-2.jpg`]: PLACEHOLDER_JPG,

    // ======================================================================
    // SITE 2: Single-folder layout — standalone project (no subfolders)
    //   Auto-wrapped in a site. "Bathroom" in name -> bathroom type.
    //   Products belong to the project only (not duplicated to site).
    // ======================================================================
    ['Burnaby Bathroom Reno/before-1.jpg']: PLACEHOLDER_JPG,
    ['Burnaby Bathroom Reno/after-1.jpg']: PLACEHOLDER_JPG,
    ['Burnaby Bathroom Reno/before-2.jpg']: PLACEHOLDER_JPG,
    ['Burnaby Bathroom Reno/after-2.jpg']: PLACEHOLDER_JPG,
    ['Burnaby Bathroom Reno/before-3.jpg']: PLACEHOLDER_JPG,
    ['Burnaby Bathroom Reno/after-3.jpg']: PLACEHOLDER_JPG,
    ['Burnaby Bathroom Reno/notes.txt']: enc.encode(
      locale === 'en'
        ? `Location: Burnaby, BC
PO Number: PO-2024-9203
Client Type: Retired couple
Property Type: 2003 townhouse
Budget: $22,000
Duration: 3 weeks

Scope: Full master bathroom renovation — converted tub/shower combo into walk-in curbless shower, new 48" floating vanity, heated porcelain tile floor, TOTO wall-hung toilet, frameless glass enclosure.

Materials: Large-format porcelain wall tile (matte white, 24x48), hexagon mosaic floor tile, matte black Moen fixtures, quartz vanity top.

Challenge: Discovered corroded galvanized drain stack — replaced with ABS from floor to main stack tie-in. Added Nuheat floor heating mat under tile.`
        : `地点: 本拿比, BC
PO编号: PO-2024-9203
客户类型: 退休夫妇
物业类型: 2003年联排别墅
预算: $22,000
工期: 3周

范围: 主卫生间全面翻新 — 浴缸/淋浴组合改为无门槛步入式淋浴，新48寸悬挂式浴室柜，地暖瓷砖，TOTO壁挂式马桶，无框玻璃围挡。

材料: 大板瓷砖墙面（哑光白，24x48），六角马赛克地砖，哑光黑Moen五金，石英石台面。

挑战: 发现老化镀锌排水管 — 从地板到主管道全部更换为ABS管。在瓷砖下加装Nuheat地暖垫。`
    ),
    ['Burnaby Bathroom Reno/products.txt']: enc.encode(
      locale === 'en'
        ? `# Product 1 — has product-1.jpg in folder
https://www.totousa.com/aquia-iv-wall-hung-toilet | TOTO Aquia IV Wall-Hung Toilet | TOTO Aquia IV 壁挂式马桶
# Product 2 — no product-2.jpg, link only
https://www.build.com/moen-t2192/s1492062 | Moen Align Shower Trim Kit | Moen Align 淋浴饰件套装`
        : `# 产品1 — 文件夹中有 product-1.jpg
https://www.totousa.com/aquia-iv-wall-hung-toilet | TOTO Aquia IV Wall-Hung Toilet | TOTO Aquia IV 壁挂式马桶
# 产品2 — 没有 product-2.jpg，仅链接
https://www.build.com/moen-t2192/s1492062 | Moen Align Shower Trim Kit | Moen Align 淋浴饰件套装`
    ),
    ['Burnaby Bathroom Reno/product-1.jpg']: PLACEHOLDER_JPG,        // -> TOTO toilet
  };

  return zipSync(files, { level: 6 });
}

// ---------------------------------------------------------------------------
// Generate both ZIPs
// ---------------------------------------------------------------------------

const outDir = path.join(process.cwd(), 'public');

const enZip = buildZip('en');
fs.writeFileSync(path.join(outDir, 'example-batch-upload-en.zip'), enZip);
console.log(`Created example-batch-upload-en.zip (${(enZip.length / 1024).toFixed(1)} KB)`);

const zhZip = buildZip('zh');
fs.writeFileSync(path.join(outDir, 'example-batch-upload-zh.zip'), zhZip);
console.log(`Created example-batch-upload-zh.zip (${(zhZip.length / 1024).toFixed(1)} KB)`);
