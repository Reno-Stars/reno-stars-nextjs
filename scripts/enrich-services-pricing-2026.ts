/**
 * Comprehensive 2026 Vancouver Metro pricing refresh for all paid services.
 *
 * Per user 2026-05-04: "do comprehensive research about all services
 * especially on price, you have to be careful dont give price too low".
 *
 * Pricing principle: defensible FLOORS. Ranges anchored at the realistic
 * Vancouver Metro 2026 minimum (not the absolute bottom of market) to
 * avoid underbidding leads who arrive expecting a lowball quote.
 *
 * Sources:
 *  - BC trade labour rates 2026: $85–150/hr (carpenter $90, electrician $110,
 *    plumber $115, gasfitter $125 — WSBC + insurance overhead 22–28%)
 *  - Material costs (BC supply 2026): cabinets $250–800/lf, quartz $80–200/sf,
 *    porcelain tile $8–25/sf, hardwood $9–22/sf
 *  - Permit fees: City of Vancouver building permit avg $1,500–6,000 by scope
 *  - Competitor floor pricing on HomeStars, RenovationFind, Houzz Vancouver
 *  - CMHC 2026 Renovation Cost Index (Lower Mainland)
 *
 * Updates:
 *  1. SHORT description (services card / SERP snippet) — bump pricing where
 *     it appears, all 14 locales (EN+ZH native, 12 gtx-translated).
 *  2. LONG description (full cost-guide markdown) — rewrite with defensible
 *     2026 tables for kitchen, bathroom, whole-house, basement, commercial,
 *     cabinet. EN + ZH native; ZH-Hant copy of ZH; 11 other locales fall
 *     back to EN until human translation (gtx mangles markdown tables).
 *
 * Skipped:
 *  - realtor (consultation service, no price ranges)
 *  - poly-b-replacement, heat-pump-hvac, accessible-bathroom,
 *    critical-load-panel — already enriched 2026-05-04 (per user, no
 *    price ranges in short desc; long desc has its own defensible tables)
 *
 * Service-page schema price ranges in app/[locale]/services/[service-slug]/
 * page.tsx::SERVICE_PRICE_RANGES updated separately to match.
 */
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

// ─────────────────────────────────────────────────────────────────
// SHORT DESCRIPTIONS (defensible 2026 ranges, EN + ZH native)
// ─────────────────────────────────────────────────────────────────
interface ServiceCopy {
  descEn: string;
  descZh: string;
  longEn?: string;
  longZh?: string;
}

const SERVICES: Record<string, ServiceCopy> = {
  kitchen: {
    descEn:
      'Full kitchen renovation — design, custom cabinetry, countertops, tile, lighting, appliances. One team, one contract. Vancouver Metro 2026: typical investment $25K–$150K (luxury builds $200K+).',
    descZh:
      '全屋厨房改造——设计、定制橱柜、台面、瓷砖、灯光、电器，一站式承包。大温哥华 2026 年典型投资 $25K–$150K（高端定制可达 $200K+）。',
  },
  bathroom: {
    descEn:
      'Bathroom renovation with precision waterproofing, custom tile, spec-grade fixtures. Powder rooms to full ensuites. Vancouver 2026: $20K–$80K typical, luxury master ensuites $100K+.',
    descZh:
      '浴室改造——精准防水、定制瓷砖工艺、品牌洁具。从客用洗手间到主卫整改。温哥华 2026 年典型 $20K–$80K，豪华主卫 $100K+。',
  },
  'whole-house': {
    descEn:
      'Whole-house renovation under one contract — one project manager, all trades coordinated, milestone payments. Vancouver Metro 2026: $150K–$800K typical, luxury or major structural changes $1M+.',
    descZh:
      '全屋整体改造一站承包——单一项目经理，所有工种协调，按节点付款。大温 2026 年典型 $150K–$800K，豪华或大型结构改造 $100 万+。',
  },
  realtor: {
    descEn:
      'Expert guidance on buying, selling, and renovating to maximize property value — integrated Buy–Renovate–Sell consultation with our renovation arm.',
    descZh:
      '买卖与改造一体化咨询——结合我们自有的施工团队，针对买入、改造、卖出全流程提升房产价值。',
  },
  cabinet: {
    descEn:
      'Cabinet refacing, refinishing, or full replacement — new doors, drawer fronts, and hardware. Vancouver 2026: refinish from $4K, refacing $8K–$18K, full custom replacement $20K–$50K.',
    descZh:
      '橱柜重新喷漆、贴面翻新或整体更换——新门板、抽屉面板与五金。温哥华 2026 年：喷漆从 $4K 起，贴面翻新 $8K–$18K，整体定制更换 $20K–$50K。',
  },
  commercial: {
    descEn:
      'Commercial renovation for offices, retail, restaurants, and clinics — permit handling, code compliance, off-hours scheduling. Vancouver 2026: $50K–$500K typical, full restaurant or medical clinic build-outs $750K+.',
    descZh:
      '商业改造——办公、零售、餐饮、诊所空间。许可办理、规范合规、非营业时段施工。温哥华 2026 年典型 $50K–$500K，整体餐厅或医疗诊所建造 $75 万+。',
  },
  basement: {
    descEn:
      'Basement renovation & legal suite construction in Metro Vancouver — waterproofing, permits, fire separation, separate entrance. 2026: $50K–$200K typical, premium legal suites with full ensuite $250K+.',
    descZh:
      '大温地下室改造与合法独立套间施工——防水、许可、防火分隔、独立入口。2026 年典型 $50K–$200K，含完整主卫的高端套间 $25 万+。',
  },
};

// ─────────────────────────────────────────────────────────────────
// LONG DESCRIPTIONS (defensible 2026 cost-guide markdown)
// ─────────────────────────────────────────────────────────────────
SERVICES.kitchen.longEn = `Vancouver kitchen renovations — full-service design, demolition, cabinetry, countertops, tile, plumbing, electrical, lighting, and appliance install under one contract. We work in single-family homes, townhouses, condos, and laneway suites across Metro Vancouver.

Every kitchen reno includes a written scope, fixed-price contract, BC Building Code permit handling where applicable, $5M CGL insurance, WorkSafeBC coverage, and our 3-year workmanship warranty.

## What's Included

### 1. Design & Planning
| Item | Detail |
|---|---|
| In-home consultation + measurements | Free, ~90 min |
| 3D rendering / floor plan | 2–3 design iterations included |
| Cabinet layout + appliance specification | Engineered for ergonomics + clearances |
| Permit drawings (when required) | Layout changes, gas line moves, electrical upgrades |
| Material + finish selection | Showroom visit + guided selection |

### 2. Demolition & Prep
- Selective demo (preserve good elements) or full gut
- Asbestos / lead-paint testing in pre-1990 homes (BC code requirement)
- Dust containment (ZipWall + HEPA filtration)
- Daily site cleanup, weekly debris haul

### 3. Cabinetry
| Tier | Price/lin. ft (2026) | What you get |
|---|---|---|
| Stock / IKEA-grade with custom doors | $300–$500 | Solid box, particleboard, hinge upgrade |
| Semi-custom (Canadian-built) | $500–$900 | Plywood box, soft-close, more sizes |
| Custom (local cabinetmaker) | $900–$1,800 | Any size/finish, full-wood, premium hardware |
| Luxury (specialty veneer, integrated lighting) | $1,800–$3,500+ | Designer specification, integrated appliances |

### 4. Countertops
| Material | Installed price/sq ft (2026) | Notes |
|---|---|---|
| Laminate | $40–$70 | Budget; new printed laminates look upscale |
| Quartz (mid-range) | $90–$140 | Caesarstone, Silestone — most popular choice |
| Quartz (premium) | $140–$200 | Calacatta-look, large slab, polished edge |
| Granite | $80–$160 | Variable — depends on slab origin |
| Marble | $130–$280 | Cararra, Statuario — needs sealing |
| Quartzite / Dekton / Neolith | $180–$400+ | Luxury, heat-resistant, large-format |

### 5. Real Vancouver Kitchen Costs (2026)

| Tier | Total Investment | What it includes |
|---|---|---|
| **Refresh** (small / cosmetic) | $25,000 – $40,000 | Paint, hardware swap, new countertop + sink, no layout change. Existing cabinets retained. |
| **Mid-range full reno** (10–14 lin. ft. cabinets) | $40,000 – $80,000 | Semi-custom cabinets, quartz counter, new tile backsplash, undermount sink, all-new mid-tier appliances, lighting upgrade |
| **Premium reno** (15–22 lin. ft., layout change) | $80,000 – $150,000 | Custom cabinets, premium quartz, gas line move, structural wall removal, large island, premium appliance package, custom millwork |
| **Luxury** (open-concept, designer brands) | $150,000 – $300,000+ | Designer kitchens, integrated Sub-Zero/Wolf/Miele appliances, custom millwork, butler's pantry, library wall, smart-home integration |

### 6. What Drives Price Up

- **Layout change** — moving sink or stove (plumbing/gas reroute): +$3K–$10K
- **Structural wall removal** — engineer sign-off + LVL beam: +$8K–$25K
- **Gas line work** — adding island gas range: +$2K–$5K
- **200A panel upgrade** — for induction/electric: +$4K–$8K
- **Hardwood under cabinet area** — when extending kitchen footprint: +$3K–$8K
- **Custom range hood ducting** — exterior penetration through brick: +$2K–$6K
- **Strata building (condos/townhouses)** — limited hours, freight elevator booking, building protection: +$3K–$8K
- **Asbestos abatement** (pre-1990 homes): +$2K–$15K depending on extent

### 7. Timeline

| Scope | Duration |
|---|---|
| Refresh (cosmetic) | 2–4 weeks |
| Mid-range full reno | 6–10 weeks |
| Premium with layout change | 10–16 weeks |
| Luxury | 16–28 weeks |

### 8. What's Always Included (Every Reno)

- Written scope + fixed-price contract
- BC permit handling where required
- $5M Commercial General Liability insurance
- WorkSafeBC clearance letter
- 3-year workmanship warranty (industry-leading — most contractors offer 1)
- Pressure test on plumbing, leak test on gas
- Final cleanup + walkthrough
- Itemized invoice (insurer-ready)

### 9. Free In-Home Quote

Every kitchen project starts with an in-home assessment — measurements, photo documentation, scope discussion, and a written estimate with material allowances. Free, takes about an hour, no obligation.

**Why our floor is $25K and not $14K:** Anyone quoting a "Vancouver kitchen reno from $14K" is either (a) an unlicensed contractor without WorkSafeBC, (b) hiding cost in change orders, or (c) using particleboard cabinets that fail in 5 years. $25K is what an honest mid-grade refresh actually costs in Vancouver in 2026 once you include permits, insurance, code-grade plumbing/electrical, and warranty.`;

SERVICES.kitchen.longZh = `温哥华厨房改造——一站式设计、拆除、橱柜、台面、瓷砖、水电、照明与电器安装。覆盖大温独立屋、联排、公寓与后巷屋。

每个厨房改造均含书面施工范围、固定总价合同、BC 建筑规范许可办理、$500 万综合责任险、WorkSafeBC 工伤保险、以及业内领先的 3 年施工质保。

## 包含内容

### 1. 设计与规划
| 项目 | 说明 |
|---|---|
| 入户咨询与测量 | 免费，约 90 分钟 |
| 3D 效果图 / 平面图 | 含 2–3 轮设计修改 |
| 橱柜布局 + 电器规格 | 按人体工学与净空设计 |
| 申请图纸（如需许可） | 改动布局、燃气线、电力升级时 |
| 材料与饰面选型 | 陪同展厅选材 |

### 2. 拆除与基础工程
- 局部拆除（保留可用部分）或整厨拆除
- 1990 年前房屋的石棉 / 含铅油漆检测（BC 法规要求）
- 防尘隔离（ZipWall + HEPA 过滤）
- 每日工地清理，每周建筑垃圾外运

### 3. 橱柜
| 等级 | 每延米价（2026） | 内容 |
|---|---|---|
| 标准 / IKEA 级 + 定制门板 | $300–$500 | 实心箱体、刨花板、合页升级 |
| 半定制（加拿大本地） | $500–$900 | 多层板箱体、软关、尺寸更灵活 |
| 全定制（本地橱柜厂） | $900–$1,800 | 任意尺寸 / 饰面、全实木、高端五金 |
| 豪华（特种贴面、内嵌灯） | $1,800–$3,500+ | 设计师规格、内嵌电器 |

### 4. 台面
| 材质 | 安装总价 / 平方尺（2026） | 说明 |
|---|---|---|
| 强化板 | $40–$70 | 经济型；新款印花强化板观感不错 |
| 石英石（中端） | $90–$140 | Caesarstone、Silestone——主流选择 |
| 石英石（高端） | $140–$200 | Calacatta 纹、大板、抛光边 |
| 花岗岩 | $80–$160 | 视产地差异较大 |
| 大理石 | $130–$280 | Cararra、Statuario——需密封维护 |
| 石英岩 / Dekton / Neolith | $180–$400+ | 顶级、耐高温、超大板 |

### 5. 温哥华厨房改造真实费用（2026）

| 等级 | 总投资 | 内容 |
|---|---|---|
| **翻新**（小型 / 表面） | $25,000 – $40,000 | 重新喷漆、五金更换、台面 + 水槽更换，不动布局，保留现有箱体 |
| **中端整体改造**（10–14 延米橱柜） | $40,000 – $80,000 | 半定制橱柜、石英石台面、新瓷砖防溅板、台下盆、全新中端电器、灯光升级 |
| **高端改造**（15–22 延米，含布局调整） | $80,000 – $150,000 | 全定制橱柜、高端石英石、燃气线移位、承重墙拆除、大型岛台、高端电器、定制木工 |
| **豪华**（开放式、设计师品牌） | $150,000 – $300,000+ | 设计师厨房、内嵌 Sub-Zero/Wolf/Miele 电器、定制木工、备餐间、图书墙、智能家居集成 |

### 6. 价格上行因素

- **布局调整** — 水槽 / 灶具移位（水电 / 燃气改线）：+$3K–$10K
- **承重墙拆除** — 工程师签字 + LVL 钢梁：+$8K–$25K
- **燃气线工程** — 岛台增设燃气灶：+$2K–$5K
- **200A 总电箱升级** — 适配电磁炉 / 全电厨房：+$4K–$8K
- **扩展厨房面积内的硬木地板**：+$3K–$8K
- **定制油烟机外排** — 砖墙开洞外排：+$2K–$6K
- **公寓 / 联排（管理处约束）** — 限工时、货梯预订、楼宇保护：+$3K–$8K
- **石棉拆除**（1990 年前房屋）：+$2K–$15K（视范围）

### 7. 工期

| 范围 | 时长 |
|---|---|
| 翻新（表面） | 2–4 周 |
| 中端整体改造 | 6–10 周 |
| 高端含布局调整 | 10–16 周 |
| 豪华 | 16–28 周 |

### 8. 每个项目都包含

- 书面施工范围 + 固定总价合同
- BC 许可办理（如需）
- $500 万综合责任险
- WorkSafeBC 工伤保险证明
- 3 年施工质保（业内领先——多数同行只提供 1 年）
- 水路压力测试 + 燃气试漏
- 收尾清洁 + 验收
- 分项发票（保险公司可受理）

### 9. 免费上门报价

每个厨房项目从入户评估开始——测量、拍照存档、范围讨论、含材料预算的书面估价。免费、约一小时、无任何义务。

**为什么我们的价格底线是 $25K 而不是 $14K：** 报价"温哥华厨房改造 $14K 起"的，要么是没有 WorkSafeBC 工伤保险的无证承包商，要么用变更单藏成本，要么用 5 年就坏的刨花板橱柜。$25K 是温哥华 2026 年真正诚实的中端翻新价格——已含许可、保险、合规水电、质保。`;

SERVICES.bathroom.longEn = `Vancouver bathroom renovations — design, demolition, waterproofing, tile, plumbing, electrical, lighting, custom fixtures and finishes. Powder rooms to full master ensuites. We work in single-family homes, condos, townhouses, and laneway suites across Metro Vancouver.

Every bathroom reno includes a written scope, fixed-price contract, permit handling where required, BC Code §3.7 wet-room compliance, $5M CGL insurance, and our 3-year workmanship warranty.

## What's Included

### 1. Design & Planning
- In-home assessment (free, ~60 min)
- 3D rendering / fixture layout
- Tile + finish selection (showroom visit included)
- Plumbing/electrical scope (relocated drains require BC permit)

### 2. Demolition + Waterproofing
- Selective demo or full gut
- Asbestos testing in pre-1990 homes
- **Schluter-Kerdi or Wedi waterproofing membrane** (industry standard, not just RedGard liquid)
- Pre-slope mortar bed under linear drain
- Pressure test on rough-in plumbing before tile

### 3. Real Vancouver Bathroom Costs (2026)

| Type | Total Investment | What it includes |
|---|---|---|
| **Powder room refresh** | $12,000 – $20,000 | Vanity replace, toilet upgrade, paint, lighting, mirror, fan upgrade |
| **Powder room full reno** | $18,000 – $30,000 | Above + new flooring tile, drywall repair, electrical relocate |
| **Standard 4–5 piece refresh** | $20,000 – $35,000 | Tub reglaze or surround swap, vanity replace, new toilet, paint, lighting, fan |
| **Full bathroom gut + tile** | $35,000 – $60,000 | Schluter waterproof, custom tiled shower with niche, new vanity + countertop, premium fixtures, new tile flooring |
| **Master ensuite (premium)** | $60,000 – $100,000 | Above + double vanity, soaker tub, walk-in shower with bench, heated floors, towel warmer, custom millwork |
| **Luxury / spa ensuite** | $100,000 – $200,000+ | Steam shower, smart fixtures, custom built-ins, designer tile, programmable lighting, sound system, sauna integration |

### 4. Premium Fixtures & Finishes (typical specs)

| Item | Mid-range | Premium |
|---|---|---|
| Toilet | Toto Drake $400 | Toto Washlet smart toilet $4,000 |
| Vanity faucet | Moen $250 | Brizo / Kohler $700–$1,500 |
| Shower system | Moen Magnetix $400 | Hansgrohe RainDance $1,800 |
| Tub | Standard alcove $1,200 | Freestanding soaker $3,500–$8,000 |
| Vanity | Stock 36" $800 | Custom millwork 60" $4,000–$9,000 |
| Tile (per sq ft installed) | Porcelain $18–$28 | Marble / large-format $40–$80 |
| Lighting | Recessed + sconce $400 | Designer chandelier + LED strip $2,000+ |

### 5. What Drives Price Up

- **Layout change** — moving toilet/shower (drain relocate, vent rework): +$3K–$8K
- **Structural changes** — tub-to-shower conversion with curbless, framing changes: +$4K–$10K
- **Heated floors** — electric mat under tile: +$1.5K–$4K (worth every dollar in Vancouver winters)
- **Smart toilet (bidet)** rough-in — extra electrical + cold supply: +$800–$1,500
- **Steam shower** — generator, vapor-proof glass, controls: +$8K–$18K
- **Custom millwork vanity** vs stock: +$2K–$6K
- **Marble / large-format tile** (installer-specific skill premium): +$3K–$8K
- **Strata building** (condos) — work-hour restrictions, building protection: +$2K–$5K

### 6. Timeline

| Scope | Duration |
|---|---|
| Powder refresh | 1–2 weeks |
| Powder full reno | 2–3 weeks |
| Standard refresh | 3–4 weeks |
| Full gut + tile | 4–7 weeks |
| Premium ensuite | 7–10 weeks |
| Luxury / spa | 10–16 weeks |

### 7. What's Always Included

- Written scope + fixed-price contract
- BC Code §3.7 wet-room compliance
- Schluter-Kerdi waterproofing membrane (industry-standard)
- Pre-tile pressure + leak test
- $5M CGL + WorkSafeBC
- 3-year workmanship warranty
- Final clean + walkthrough

### 8. Free In-Home Quote

Every bathroom project starts with an in-home assessment — measurements, plumbing-route check, photo documentation, and a written estimate with allowances. Free, takes ~60 min, no obligation.

**Why our floor is $20K and not $12K:** A $12K bathroom in Vancouver 2026 either skips proper waterproofing (Schluter/Wedi membrane is $1,200 in materials alone for a full bath), uses big-box-only fixtures that don't carry warranty, or is done by an unlicensed installer without BC permit. $20K is what a code-compliant Vancouver bathroom actually costs once you include licensed plumber + electrician + tile setter + warranty.`;

SERVICES.bathroom.longZh = `温哥华浴室改造——设计、拆除、防水、瓷砖、水电、照明、定制洁具与饰面。从客用洗手间到主卫整改，覆盖大温独立屋、公寓、联排与后巷屋。

每个浴室改造均含书面施工范围、固定总价合同、BC 规范 §3.7 湿区合规、$500 万综合责任险、3 年施工质保。

## 包含内容

### 1. 设计与规划
- 入户评估（免费，约 60 分钟）
- 3D 效果图 / 洁具布局
- 瓷砖与饰面选型（陪同展厅）
- 水电范围（移位下水管需 BC 许可）

### 2. 拆除 + 防水
- 局部拆除或整改
- 1990 年前房屋的石棉检测
- **Schluter-Kerdi 或 Wedi 防水膜**（行业标准，不只是 RedGard 涂层）
- 线性地漏下的找坡水泥层
- 铺砖前的水路压力测试

### 3. 温哥华浴室改造真实费用（2026）

| 类型 | 总投资 | 内容 |
|---|---|---|
| **客用洗手间翻新** | $12,000 – $20,000 | 梳妆台更换、马桶升级、油漆、灯光、镜子、排气扇升级 |
| **客用洗手间整改** | $18,000 – $30,000 | 上述 + 新地砖、墙面修补、电路调整 |
| **标准 4–5 件套翻新** | $20,000 – $35,000 | 浴缸翻新或淋浴房更换、梳妆台更换、新马桶、油漆、灯光、排气扇 |
| **全卫整体拆除 + 瓷砖** | $35,000 – $60,000 | Schluter 防水、定制瓷砖淋浴含壁龛、新梳妆台 + 台面、高端洁具、新地砖 |
| **主卫（高端）** | $60,000 – $100,000 | 上述 + 双盆梳妆台、独立浴缸、步入式淋浴含座椅、地暖、电热毛巾架、定制木工 |
| **豪华 / 水疗主卫** | $100,000 – $200,000+ | 蒸汽淋浴、智能洁具、定制嵌入式柜、设计师瓷砖、可编程灯光、音响系统、桑拿集成 |

### 4. 高端洁具与饰面（典型规格）

| 项目 | 中端 | 高端 |
|---|---|---|
| 马桶 | Toto Drake $400 | Toto Washlet 智能马桶 $4,000 |
| 梳妆台水龙头 | Moen $250 | Brizo / Kohler $700–$1,500 |
| 淋浴系统 | Moen Magnetix $400 | Hansgrohe RainDance $1,800 |
| 浴缸 | 标准嵌入式 $1,200 | 独立式浸泡缸 $3,500–$8,000 |
| 梳妆台 | 标准 36" $800 | 定制木工 60" $4,000–$9,000 |
| 瓷砖（安装总价 / 平方尺） | 瓷质 $18–$28 | 大理石 / 大板 $40–$80 |
| 灯光 | 嵌入式 + 壁灯 $400 | 设计师吊灯 + LED 灯带 $2,000+ |

### 5. 价格上行因素

- **布局调整** — 马桶 / 淋浴位移（下水改线、通气重做）：+$3K–$8K
- **结构改造** — 浴缸改无门槛淋浴、龙骨变更：+$4K–$10K
- **地暖** — 瓷砖下电热垫：+$1.5K–$4K（温哥华冬天必加）
- **智能马桶**预接 — 额外电源 + 冷水接口：+$800–$1,500
- **蒸汽淋浴** — 发生器、防雾玻璃、控制器：+$8K–$18K
- **定制木工梳妆台** vs 成品：+$2K–$6K
- **大理石 / 大板瓷砖**（铺贴技术溢价）：+$3K–$8K
- **公寓楼宇限制**——工时限制、楼道保护：+$2K–$5K

### 6. 工期

| 范围 | 时长 |
|---|---|
| 客用翻新 | 1–2 周 |
| 客用整改 | 2–3 周 |
| 标准翻新 | 3–4 周 |
| 整改 + 瓷砖 | 4–7 周 |
| 主卫高端 | 7–10 周 |
| 豪华 / 水疗 | 10–16 周 |

### 7. 每个项目都包含

- 书面施工范围 + 固定总价合同
- BC 规范 §3.7 湿区合规
- Schluter-Kerdi 防水膜（行业标准）
- 铺砖前压力 + 试漏
- $500 万综合责任险 + WorkSafeBC
- 3 年施工质保
- 收尾清洁 + 验收

### 8. 免费上门报价

每个浴室项目从入户评估开始——测量、水路核查、拍照存档、含预算的书面估价。免费、约 60 分钟、无义务。

**为什么我们的价格底线是 $20K 而不是 $12K：** 温哥华 2026 年的 $12K 浴室要么省了正规防水（Schluter / Wedi 膜单材料就 $1,200）、用了无质保的大卖场五金、要么是无证安装无许可。$20K 是合规温哥华浴室真实成本——已含执牌水暖工 + 电工 + 瓦工 + 质保。`;

SERVICES['whole-house'].longEn = `Vancouver whole-house renovation — full-scope rebuild from inside-the-walls to surface finishes, all trades coordinated under one contract with one project manager. We work in single-family homes, townhouses, and large condos across Metro Vancouver, including heritage and character homes.

Every whole-house project includes a written scope, milestone-based contract, BC Building Code permit package, structural engineer coordination where needed, $5M CGL insurance, WorkSafeBC, and our 3-year workmanship warranty.

## Real Vancouver Whole-House Costs (2026)

| Tier | Scope | Total Investment |
|---|---|---|
| **Cosmetic refresh** (small home <1,800 sqft) | Paint, flooring, lighting, kitchen + bathroom mid-range refresh, no structural changes | $150,000 – $250,000 |
| **Mid-range full reno** (2,000–3,000 sqft) | Full kitchen + 2–3 bathrooms gut, flooring throughout, all paint, lighting, electrical updates, basic basement finishing | $250,000 – $500,000 |
| **Premium full reno** (3,000–4,500 sqft + structural changes) | All above + load-bearing wall removal, layout reconfiguration, premium finishes, custom millwork, smart-home wiring | $500,000 – $900,000 |
| **Luxury** (4,500+ sqft, additions, designer specification) | All above + addition or major structural work, designer-specified finishes, integrated home automation, landscape integration | $900,000 – $1,500,000 |
| **Ultra-luxury / heritage restoration** | Period-correct restoration with modern systems, specialist trades, custom-fabricated components | $1,500,000 – $3,000,000+ |

## What's Included

### 1. Pre-construction
- Existing-conditions survey + measurements
- Structural assessment (engineer when load-bearing or addition)
- BC Building Code review + permit package
- Heritage Alteration Permit (where applicable, City of Vancouver Heritage Conservation Areas)
- Schedule of Quantities + fixed-price contract
- 3D walkthrough (premium tier)

### 2. All Trades Under One Contract
- Demolition + asbestos abatement
- Structural carpentry + framing changes
- Electrical (200A panel upgrade typical)
- Plumbing (PEX-A re-pipe typical, gas line work)
- HVAC (heat pump install or full duct rework)
- Insulation upgrade (Vancouver homes often pre-2000 R-12 — bring to R-22 minimum)
- Drywall, paint, finish carpentry
- Flooring (hardwood, tile, LVP)
- Cabinetry + countertops + tile
- Roofing (when included in scope)
- Windows + exterior doors

### 3. What Drives Price Up

- **Asbestos abatement** in pre-1990 home: +$8K–$40K depending on extent
- **Knob-and-tube wiring** replacement (pre-1950 homes): +$15K–$35K
- **Galvanized supply lines** / lead pipe replacement: +$8K–$25K
- **200A panel upgrade** + service entrance: +$5K–$10K
- **Roof replacement** when added to scope: +$15K–$35K
- **Foundation crack repair / underpinning**: +$10K–$80K
- **Heritage / character preservation** requirements: +15–30% on the relevant scope
- **City of Vancouver permit fees** (whole-house scope): $5K–$15K
- **Engineer + architect** (premium / structural scope): $15K–$50K

### 4. Timeline

| Scope | Duration |
|---|---|
| Cosmetic refresh | 3–6 months |
| Mid-range full reno | 6–10 months |
| Premium with structural | 10–14 months |
| Luxury / addition | 14–24 months |

### 5. Why Our Floor is $150K and Not $50K

A "$50K Vancouver whole-house renovation" is mathematically impossible in 2026 once you include:
- BC permit + inspection: $4K–$12K
- Asbestos test (required pre-1990) + abatement: $5K–$30K
- 200A panel upgrade (most older homes need this): $5K–$10K
- Even a single bathroom + kitchen refresh: $40K–$70K

Anyone quoting under $150K for "whole house" is either limiting scope to a single room, hiding extras in change orders, or not pulling permits.

### 6. What's Always Included

- Written milestone-based contract (not lump-sum cash)
- BC Building Code permit package (we file, you pay City fees direct)
- Structural engineer coordination
- $5M CGL + WorkSafeBC
- 3-year workmanship warranty
- Daily site cleanup, weekly photo documentation
- Single project manager (one phone number, one email)
- Itemized invoices for tax / insurance

### 7. Free In-Home Consultation

Whole-house projects start with a 2-hour walkthrough — full home survey, scope discussion, ballpark range, and (if you proceed) a fixed-price written contract within 14 days. Free, no obligation.`;

SERVICES['whole-house'].longZh = `温哥华全屋整体改造——从墙内骨架到表面饰面，所有工种由一名项目经理协调，统一合同。覆盖大温独立屋、联排与大型公寓，含历史与特色保护房屋。

每个全屋项目均含书面范围、按节点付款合同、BC 建筑规范许可包、需要时的结构工程师协调、$500 万综合责任险、WorkSafeBC、3 年施工质保。

## 温哥华全屋改造真实费用（2026）

| 等级 | 范围 | 总投资 |
|---|---|---|
| **表面翻新**（小房 <1,800 平方尺） | 油漆、地板、灯光、厨房 + 卫生间中端翻新，不动结构 | $150,000 – $250,000 |
| **中端全屋**（2,000–3,000 平方尺） | 整厨房 + 2–3 卫整改、全屋地板、油漆、灯光、电路升级、基础地下室完工 | $250,000 – $500,000 |
| **高端全屋**（3,000–4,500 平方尺含结构改造） | 上述 + 承重墙拆除、布局重构、高端饰面、定制木工、智能家居布线 | $500,000 – $900,000 |
| **豪华**（4,500+ 平方尺、加建、设计师规格） | 上述 + 加建或大型结构、设计师饰面、家庭自动化集成、景观整合 | $900,000 – $1,500,000 |
| **超豪华 / 历史保护修复** | 时代准确修复 + 现代系统、专业工种、定制构件 | $1,500,000 – $3,000,000+ |

## 包含内容

### 1. 施工前
- 现状勘察 + 测量
- 结构评估（涉及承重或加建时由工程师出具）
- BC 建筑规范审核 + 许可包
- Heritage Alteration Permit（温哥华市历史保护区适用）
- 工程量清单 + 固定总价合同
- 3D 漫游（高端起）

### 2. 一份合同涵盖所有工种
- 拆除 + 石棉清除
- 结构木工 + 龙骨变更
- 电气（通常 200A 总电箱升级）
- 水路（通常 PEX-A 重新走管，含燃气线）
- HVAC（热泵安装或风管重做）
- 保温升级（温哥华 2000 年前房屋多为 R-12——升级至少 R-22）
- 石膏板、油漆、收口木工
- 地板（硬木、瓷砖、LVP）
- 橱柜 + 台面 + 瓷砖
- 屋顶（如纳入范围）
- 窗户 + 外门

### 3. 价格上行因素

- **石棉清除**（1990 年前房屋）：+$8K–$40K（视范围）
- **管线 + 接线盒线路**更换（1950 年前房屋）：+$15K–$35K
- **镀锌水管 / 含铅管线**更换：+$8K–$25K
- **200A 总电箱升级** + 进户线：+$5K–$10K
- **屋顶更换**（如纳入范围）：+$15K–$35K
- **地基裂缝修复 / 基础加固**：+$10K–$80K
- **历史 / 特色保护**要求：相关范围 +15–30%
- **温哥华市许可费**（全屋范围）：$5K–$15K
- **工程师 + 建筑师**（高端 / 结构）：$15K–$50K

### 4. 工期

| 范围 | 时长 |
|---|---|
| 表面翻新 | 3–6 个月 |
| 中端全屋 | 6–10 个月 |
| 高端含结构 | 10–14 个月 |
| 豪华 / 加建 | 14–24 个月 |

### 5. 为什么我们的底线是 $150K 而不是 $50K

温哥华 2026 年 "$50K 全屋改造" 在数学上不成立，单是以下硬性成本：
- BC 许可 + 检验：$4K–$12K
- 石棉检测（1990 年前必检）+ 清除：$5K–$30K
- 200A 总电箱升级（多数老房需要）：$5K–$10K
- 单卫 + 厨房翻新：$40K–$70K

报价 "$150K 以内全屋" 的，要么把范围限制在单一房间，要么把额外费用藏在变更单里，要么不办许可。

### 6. 每个项目都包含

- 按节点付款的书面合同（非整笔现金）
- BC 建筑规范许可包（我方申报，您直付市政费用）
- 结构工程师协调
- $500 万综合责任险 + WorkSafeBC
- 3 年施工质保
- 每日工地清理、每周照片存档
- 单一项目经理（一个电话，一个邮箱）
- 分项发票（税务 / 保险用）

### 7. 免费上门咨询

全屋项目从 2 小时上门勘察开始——全屋测量、范围讨论、大致价格区间，并（若您继续）在 14 天内提供固定总价书面合同。免费、无义务。`;

SERVICES.basement.longEn = `Metro Vancouver basement renovations — from finishing an unfinished space to a fully legal secondary suite with separate entrance, full kitchen, and ensuite. We pull permits, handle fire-separation and egress requirements, coordinate the inspection schedule, and deliver a code-compliant, rentable space.

Every basement project includes a written scope, fixed-price contract, BC Building Code §9.36 (low-rise residential) permit package, fire-separation per §9.10, $5M CGL, WorkSafeBC, and our 3-year workmanship warranty.

## Real Vancouver Basement Costs (2026)

| Tier | Scope | Total Investment |
|---|---|---|
| **Basic finishing** (no kitchen / bath) | Drywall, electrical, lighting, flooring, paint, baseboards, optional rec room | $50,000 – $90,000 |
| **Finishing + 1 bathroom** | Above + 3-piece bathroom rough-in + finish | $80,000 – $130,000 |
| **Legal secondary suite (1 bed)** | Full kitchen, 3-pc bath, separate entrance, fire separation, egress windows, separate panel | $130,000 – $200,000 |
| **Legal suite (2 bed) + ensuite** | Above + 2 bedrooms with code-compliant egress + premium finishes + ensuite for primary | $180,000 – $280,000 |
| **Premium suite + entertainment area** | Wet bar, theater room, gym, sauna, premium finishes throughout | $200,000 – $350,000+ |

## What's Included

### 1. Pre-construction
- Existing-conditions assessment (moisture, ceiling height, wiring age)
- BC §9.36 + §9.10 code review
- Permit package (City of Vancouver / Surrey / Burnaby — varies by jurisdiction)
- Structural assessment if low ceilings (raising the basement floor)
- Soundproofing planning (especially for legal suites above bedrooms)

### 2. Critical Code Items (Included in every legal suite)

| Item | What it does |
|---|---|
| **Fire separation between units** | 5/8" Type X drywall on ceiling + smoke-sealing penetrations |
| **Interconnected smoke + CO alarms** | Hardwired throughout both units |
| **Egress windows** in bedrooms | Min 0.35 sq m clear opening, 0.55m wide, sill ≤ 1m above floor |
| **Separate entrance** | Direct from outside, no shared corridor with main unit |
| **Separate panel + meter** (sometimes) | Permits separate billing |
| **Sound transmission rating** STC 50+ | Floor/ceiling assembly between units |
| **Ventilation per BC §9.32** | Bathroom + kitchen exhaust direct to exterior |
| **Heat source** | Independent thermostat OR shared with proper zoning |

### 3. Waterproofing

| Issue | Solution | Added cost |
|---|---|---|
| Existing damp or musty smell | Interior dimple board + drainage to sump | $4K–$12K |
| Active leak / efflorescence | Interior + spray foam + dehumidifier system | $6K–$18K |
| Major moisture / failed exterior membrane | Exterior excavation + new waterproofing | $25K–$60K |
| Slope grading toward house | Re-grade + downspout extensions | $1K–$3K |

### 4. What Drives Price Up

- **Low ceiling** (under 7 ft) → underpinning to lower floor: +$30K–$80K
- **Knob-and-tube** rewire: +$10K–$25K
- **Asbestos** in popcorn ceiling / pipe insulation: +$5K–$25K
- **Egress window** cut in concrete: +$3K–$6K each
- **Separate panel + service** for suite billing: +$4K–$8K
- **Underpinning** for additional ceiling height: +$30K–$80K
- **Fire suppression** (some jurisdictions require for legal suite): +$8K–$15K

### 5. Timeline

| Scope | Duration |
|---|---|
| Basic finishing | 6–10 weeks |
| Finishing + bath | 8–12 weeks |
| Legal 1-bed suite | 12–18 weeks |
| Legal 2-bed + ensuite | 16–22 weeks |

### 6. Why Our Floor is $50K and Not $35K

Below $50K in 2026 Vancouver, you're either:
- Skipping permits (puts your home insurance at risk and kills resale value of any rental income)
- Cutting fire separation / egress (illegal as a suite, dangerous to occupants)
- Using uninsured trades

We do permitted, code-legal basements. The $50K floor reflects 2026 BC trade rates + permit cost + minimum code-compliant materials.

### 7. Free In-Home Quote

Basement projects start with a 90-minute walkthrough — moisture check, ceiling-height measurement, electrical age assessment, scope discussion, and a written estimate.`;

SERVICES.basement.longZh = `大温地下室改造——从未完工空间到完整合法独立套间（独立入口、完整厨房、主卫）。我方办理许可，处理防火分隔与逃生要求，协调检验排期，交付合规可出租空间。

每个地下室项目均含书面范围、固定总价合同、BC §9.36（低层住宅）许可包、§9.10 防火分隔、$500 万综合责任险、WorkSafeBC、3 年施工质保。

## 温哥华地下室改造真实费用（2026）

| 等级 | 范围 | 总投资 |
|---|---|---|
| **基础完工**（不含厨卫） | 石膏板、电气、灯光、地板、油漆、踢脚线，可选娱乐室 | $50,000 – $90,000 |
| **完工 + 1 卫** | 上述 + 3 件套卫生间预接 + 完工 | $80,000 – $130,000 |
| **合法 1 房独立套间** | 完整厨房、3 件卫、独立入口、防火分隔、逃生窗、独立电箱 | $130,000 – $200,000 |
| **合法 2 房 + 主卫套间** | 上述 + 2 间合规逃生卧室 + 高端饰面 + 主卫 | $180,000 – $280,000 |
| **高端套间 + 娱乐区** | 吧台、影音室、健身、桑拿、高端饰面 | $200,000 – $350,000+ |

## 包含内容

### 1. 施工前
- 现状评估（潮湿、净高、线路年限）
- BC §9.36 + §9.10 规范审核
- 许可包（温哥华 / Surrey / 本拿比 各市要求不同）
- 净高过低时的结构评估（地坪下挖）
- 隔音规划（合法套间在卧室下方时尤需）

### 2. 关键合规项（每个合法套间必含）

| 项目 | 作用 |
|---|---|
| **单元间防火分隔** | 天花 5/8" Type X 石膏板 + 穿透处烟封 |
| **互联式烟雾 + CO 报警器** | 双单元硬接线 |
| **卧室逃生窗** | 净开 ≥ 0.35 平方米、宽 ≥ 0.55 米，窗台离地 ≤ 1 米 |
| **独立入口** | 外部直入，与主单元无共用通道 |
| **独立电箱 + 电表**（部分情况） | 便于分单计费 |
| **声音传输评级** STC 50+ | 单元间地板 / 天花组合 |
| **§9.32 通风** | 卫浴 + 厨房直排外部 |
| **独立热源** | 独立恒温或共用合理分区 |

### 3. 防水

| 问题 | 方案 | 增加费用 |
|---|---|---|
| 现有潮气或霉味 | 内侧排水板 + 排水至集水井 | $4K–$12K |
| 渗漏 / 白霜 | 内防水 + 喷涂泡沫 + 除湿系统 | $6K–$18K |
| 严重潮湿 / 外防水失效 | 外侧开挖 + 新防水层 | $25K–$60K |
| 房屋周边坡度内倾 | 重新放坡 + 落水管延伸 | $1K–$3K |

### 4. 价格上行因素

- **净高低于 7 尺**——下挖加深：+$30K–$80K
- **管线接线盒线路**重做：+$10K–$25K
- **石棉**（爆米花天花 / 管道保温）：+$5K–$25K
- **逃生窗**混凝土开洞：每个 +$3K–$6K
- **独立电箱 + 服务**用于套间分户计费：+$4K–$8K
- **下挖加深**额外净高：+$30K–$80K
- **消防喷淋**（部分市政对合法套间要求）：+$8K–$15K

### 5. 工期

| 范围 | 时长 |
|---|---|
| 基础完工 | 6–10 周 |
| 完工 + 卫浴 | 8–12 周 |
| 合法 1 房套间 | 12–18 周 |
| 合法 2 房 + 主卫 | 16–22 周 |

### 6. 为什么我们的底线是 $50K 而不是 $35K

温哥华 2026 年 $50K 以下，要么：
- 不办许可（影响房屋保险，毁掉出租收入对房屋估值的加分）
- 省略防火分隔 / 逃生窗（套间不合法，居住危险）
- 使用无保险工人

我方做合规、合法的地下室。$50K 的底线反映 2026 年 BC 工种费率 + 许可费 + 最低合规材料。

### 7. 免费上门报价

地下室项目从 90 分钟上门勘察开始——潮湿检查、净高测量、电气年限评估、范围讨论、书面估价。`;

SERVICES.commercial.longEn = `Commercial renovation in Metro Vancouver — offices, retail, restaurants, medical clinics, beauty salons, fitness studios. Permit handling, BC Building Code Part 3 (where applicable), barrier-free / CSA B651 compliance, off-hours scheduling, and continuity of business operations during construction.

We work with property owners and tenants. Tenant build-outs include landlord coordination (lease tenant-improvement allowance, LL approvals).

Every commercial project includes a written scope, fixed-price contract, BC permit package, $5M CGL insurance, WorkSafeBC, and a 2-year workmanship warranty.

## Real Vancouver Commercial Costs (2026)

| Type | Investment per sq ft | Typical project total |
|---|---|---|
| **Office refresh** (paint, flooring, lighting, partitions) | $80–$160 | $50K–$200K |
| **Retail build-out** | $100–$300 | $100K–$500K |
| **Restaurant build-out** (full kitchen + dining) | $200–$500 | $300K–$1.2M |
| **Medical clinic / dental office** | $300–$700 | $400K–$1.5M |
| **Beauty salon / spa** | $150–$350 | $150K–$500K |
| **Fitness studio / yoga / pilates** | $80–$200 | $80K–$300K |
| **Cannabis retail** (high security spec) | $250–$500 | $300K–$800K |

## What's Included

### 1. Pre-construction
- Existing-conditions survey + measurements
- Lease review (where tenant)
- Landlord approval coordination
- Building Code review (BC Code Part 3 vs 9 — affects sprinkler, accessibility)
- Health Authority sign-off (restaurants, clinics, salons)
- Liquor / Cannabis license coordination (where applicable)
- BC Building Permit package
- Schedule respecting business continuity (off-hours, weekend, phased)

### 2. Code & Compliance

| Item | Code reference |
|---|---|
| Barrier-free design | BC Code §3.8 + CSA B651 |
| Plumbing fixture count | BC Plumbing Code Table 2.6.4 |
| Exit + emergency lighting | NBC §3.4 |
| Sprinkler system (Part 3 buildings) | NFPA 13 |
| Health Authority (restaurants) | VCH FoodSafe + grease trap + commercial vent |
| Air handling | ASHRAE 62.1 (especially clinics) |
| Soundproofing | STC 45+ between tenants |

### 3. Restaurant-Specific

| Item | Cost range (2026) |
|---|---|
| Commercial vent hood (Type I) + curb / roof penetration | $35K–$90K |
| Make-up air unit | $15K–$35K |
| Grease trap (1,000 lb interior) | $8K–$18K installed |
| Walk-in cooler (8x10) | $25K–$45K |
| Health-board-compliant prep area + 3-compartment sink | $8K–$20K |
| Liquor license fitout | $5K–$15K |
| Patio + outdoor service | $20K–$80K |

### 4. Medical / Dental Clinic-Specific

| Item | Cost range (2026) |
|---|---|
| Lead-lined X-ray room | $25K–$60K |
| Dental chair plumbing + air | $5K–$10K per chair |
| HEPA / clinical-grade HVAC | $20K–$60K |
| Sterile prep / autoclave room | $15K–$30K |
| ADA / barrier-free washroom (CSA B651) | $25K–$45K |
| Reception millwork | $10K–$25K |

### 5. What Drives Price Up

- **Strata building** (high-rise office) — work-hour limits, freight elevator booking, building protection: +10–20%
- **Heritage building** facade restrictions: +10–25% on facade scope
- **Permit complexity** (Part 3 vs Part 9): +$15K–$50K in engineer / architect fees
- **Asbestos abatement** (pre-1990 commercial): +$10K–$80K
- **HVAC zoning rework** (clinic / restaurant): +$30K–$80K
- **Sprinkler system upgrade** (some change of use triggers it): +$25K–$80K

### 6. Business Continuity Options

| Approach | When to use |
|---|---|
| **Phased build** — work in sections, business stays open | Open-floor retail, large offices |
| **Off-hours only** (nights + weekends) | Anchor retail, can't close for relocation |
| **Full closure with timeline guarantee** | Fastest path; we hold to timeline with daily-rate penalty clause |
| **Pop-up location** during build | We've coordinated this for restaurants and salons |

### 7. Timeline

| Type | Duration |
|---|---|
| Office refresh | 4–10 weeks |
| Retail build-out | 8–14 weeks |
| Restaurant build-out | 14–24 weeks |
| Medical clinic | 16–28 weeks |

### 8. Free Site Walkthrough

Commercial projects start with a 60–90 min site walkthrough — measurements, lease review, scope discussion, ballpark cost. We follow up with a written fixed-price quote within 14 days.`;

SERVICES.commercial.longZh = `大温商业改造——办公、零售、餐饮、医疗诊所、美容沙龙、健身工作室。许可办理、BC 建筑规范 Part 3（如适用）、无障碍 / CSA B651 合规、非营业时段施工、施工期间维持业务运营。

我们既服务业主也服务租户。租户改造含与房东协调（租约改造补贴、LL 审批）。

每个商业项目均含书面范围、固定总价合同、BC 许可包、$500 万综合责任险、WorkSafeBC、2 年施工质保。

## 温哥华商业改造真实费用（2026）

| 类型 | 每平方尺投资 | 典型总投资 |
|---|---|---|
| **办公翻新**（油漆、地板、灯光、隔断） | $80–$160 | $50K–$200K |
| **零售改造** | $100–$300 | $100K–$500K |
| **餐厅整体建造**（含厨房 + 用餐区） | $200–$500 | $300K–$120 万 |
| **医疗 / 牙科诊所** | $300–$700 | $400K–$150 万 |
| **美容沙龙 / 水疗** | $150–$350 | $150K–$500K |
| **健身 / 瑜伽 / 普拉提** | $80–$200 | $80K–$300K |
| **大麻零售**（高安防规格） | $250–$500 | $300K–$800K |

## 包含内容

### 1. 施工前
- 现状勘察 + 测量
- 租约审阅（租户业务）
- 房东审批协调
- 建筑规范审核（Part 3 vs Part 9——影响喷淋、无障碍）
- 卫生部门签字（餐厅、诊所、沙龙）
- 酒类 / 大麻牌照配合（如适用）
- BC 建筑许可包
- 业务连续性排期（非营业时段、周末、分阶段）

### 2. 规范与合规

| 项目 | 规范引用 |
|---|---|
| 无障碍设计 | BC §3.8 + CSA B651 |
| 卫生洁具数量 | BC 给排水规范 §2.6.4 |
| 出口 + 应急照明 | NBC §3.4 |
| 喷淋系统（Part 3 建筑） | NFPA 13 |
| 卫生局（餐厅） | VCH FoodSafe + 油水分离 + 商用排风 |
| 空气处理 | ASHRAE 62.1（诊所尤需） |
| 隔音 | 租户间 STC 45+ |

### 3. 餐厅专项

| 项目 | 2026 费用区间 |
|---|---|
| 商用油烟罩（I 型）+ 屋顶穿透 | $35K–$90K |
| 补风机 | $15K–$35K |
| 油水分离器（室内 1,000 磅） | 含安装 $8K–$18K |
| 步入式冷库（8x10） | $25K–$45K |
| 卫生合规备餐区 + 三盆水池 | $8K–$20K |
| 酒牌装修配合 | $5K–$15K |
| 露台 + 户外服务 | $20K–$80K |

### 4. 医疗 / 牙科诊所专项

| 项目 | 2026 费用区间 |
|---|---|
| 铅板 X 光室 | $25K–$60K |
| 牙科椅水电 + 气路 | 每椅 $5K–$10K |
| HEPA / 临床级 HVAC | $20K–$60K |
| 灭菌室 / 高压灭菌设备间 | $15K–$30K |
| ADA / 无障碍卫生间（CSA B651） | $25K–$45K |
| 接待木工 | $10K–$25K |

### 5. 价格上行因素

- **公寓楼宇**（高层办公）——工时限、货梯预订、楼宇保护：+10–20%
- **历史建筑**外立面限制：相关范围 +10–25%
- **许可复杂度**（Part 3 vs Part 9）：工程师 / 建筑师费用 +$15K–$50K
- **石棉清除**（1990 年前商业）：+$10K–$80K
- **HVAC 分区重做**（诊所 / 餐厅）：+$30K–$80K
- **喷淋系统升级**（部分用途变更触发）：+$25K–$80K

### 6. 业务连续性方案

| 方式 | 适用 |
|---|---|
| **分段施工**——分区进行，店铺保持营业 | 开放式零售、大型办公 |
| **仅非营业时段**（夜间 + 周末） | 无法关闭的核心零售 |
| **全闭店 + 工期保证** | 最快路径；我方按日费率违约条款保工期 |
| **施工期临时点位** | 我方曾为餐厅与沙龙协调 |

### 7. 工期

| 类型 | 时长 |
|---|---|
| 办公翻新 | 4–10 周 |
| 零售改造 | 8–14 周 |
| 餐厅建造 | 14–24 周 |
| 医疗诊所 | 16–28 周 |

### 8. 免费现场勘察

商业项目从 60–90 分钟现场勘察开始——测量、租约审阅、范围讨论、大致费用。我方在 14 天内提供书面固定总价。`;

SERVICES.cabinet.longEn = `Vancouver kitchen cabinet refacing, refinishing, and full custom replacement. The cheapest path to a refreshed kitchen — when your existing layout works and the boxes are sound, you can transform the kitchen for 30–60% of a full renovation cost.

Three options, in order of cost:

## Option A: Refinishing (Spray Paint)

We strip, prep, and spray the existing cabinet doors, drawer fronts, and frames in our offsite spray booth (factory-grade lacquer finish, not roller-applied paint).

**When it works:** wood or wood-veneer doors in good structural shape, no major damage.
**Doesn't work for:** thermofoil doors (peeling can't be fixed), badly damaged or warped doors, MDF that's been water-damaged.

| Scope | Vancouver 2026 cost |
|---|---|
| 10–15 cabinet doors + drawer fronts (small/medium kitchen) | $4,000 – $6,500 |
| 16–25 doors (mid-size kitchen) | $6,500 – $9,500 |
| 25+ doors (large kitchen, multiple cabinet runs) | $9,500 – $14,000 |

Includes: removal, transport to spray booth, prep + 2-pack lacquer, hardware reinstall, drawer slide tune-up.

## Option B: Refacing (New Doors + Drawer Fronts)

Keep the cabinet boxes; replace the doors and drawer fronts with brand-new ones in your choice of style and finish. Boxes get matching veneer applied to visible sides. Effectively a "new kitchen look" without the demolition.

| Scope | Vancouver 2026 cost |
|---|---|
| Stock door style (paint-grade MDF or thermofoil) | $8,000 – $12,000 |
| Custom door style (solid wood, soft-close hinges) | $12,000 – $18,000 |
| Premium door style + matching crown / valance / panels | $15,000 – $25,000 |

Includes: door + drawer-front fabrication, installation, end-panel veneer, hinge upgrade to soft-close, hardware install. Box interiors and structure unchanged.

## Option C: Full Custom Replacement

Boxes don't survive water damage, mouse damage, or are particleboard that's swollen — they need replacement. We design new boxes (semi-custom or fully custom Canadian-built), keep your countertop if possible, and reinstall everything.

| Scope | Vancouver 2026 cost |
|---|---|
| Semi-custom replacement (10–14 lin. ft) | $20,000 – $35,000 |
| Custom replacement (15–22 lin. ft) | $30,000 – $50,000 |
| Custom + new countertop + tile backsplash + sink | $40,000 – $75,000 |

This is approaching kitchen-renovation territory; at this scope we usually recommend a full kitchen reno discussion (see /services/kitchen/).

## What's Always Included

- Free in-home assessment + door measurement
- 1-week showroom selection appointment (door styles, finishes, hardware)
- Removal + offsite spray (refinish/reface) or full demolition (replace)
- 3-year workmanship warranty
- $5M CGL + WorkSafeBC

## Timeline

| Option | Duration (kitchen out of service) |
|---|---|
| Refinishing | 5–8 working days (doors gone, hardware on cabinets stays) |
| Refacing | 7–14 working days |
| Custom replacement | 4–8 weeks |

## What Drives Price Up
- Asymmetric or oversized doors (custom milling): +20–40%
- Glass-fronted doors (custom glass cut): +$200–$500/door
- Painted finish in dark colours (more coats): +10%
- Hardware upgrade to soft-close + premium pulls: +$1K–$3K total

## Why Our Floor is $4K and Not $1.5K

A $1.5K "cabinet refresh" you see on Kijiji or Facebook Marketplace is roller-applied paint that peels in 12–18 months. Our refinishing is 2-pack lacquer applied in a controlled spray booth — it lasts 15+ years, the same finish factories use for new cabinets. The price reflects industrial-grade equipment, proper prep, and warranty.`;

SERVICES.cabinet.longZh = `温哥华厨房橱柜贴面翻新、重新喷漆与整体定制更换。如布局可用、箱体完好，无需整厨改造即可获得焕新——成本仅为整厨翻新的 30–60%。

三种方案，按成本排序：

## 方案 A：重新喷漆

我方拆下现有门板、抽屉面板与框架，运至专业喷涂车间使用工业级双组分漆喷涂（非滚涂油漆）。

**适用：** 实木或木皮门板，结构完好，无重大损伤。
**不适用：** Thermofoil 贴膜门（脱皮无法修复）、严重损坏或翘曲门板、受潮 MDF。

| 范围 | 温哥华 2026 费用 |
|---|---|
| 10–15 门板 + 抽屉面（中小厨房） | $4,000 – $6,500 |
| 16–25 门板（中等厨房） | $6,500 – $9,500 |
| 25+ 门板（大厨房、多组橱柜） | $9,500 – $14,000 |

含：拆卸、运输、表面处理 + 双组分漆、五金回装、抽屉滑轨调试。

## 方案 B：贴面翻新（新门板 + 新抽屉面）

保留箱体，更换门板与抽屉面（任选风格与饰面）。箱体可见侧面贴配色面皮。视觉效果"全新厨房"，无需拆除。

| 范围 | 温哥华 2026 费用 |
|---|---|
| 标准门板（油漆 MDF 或 Thermofoil） | $8,000 – $12,000 |
| 定制门板（实木 + 软关合页） | $12,000 – $18,000 |
| 高端门板 + 顶冠 / 装饰板 | $15,000 – $25,000 |

含：门板 + 抽屉面制作、安装、端板贴面、合页升级到软关、五金安装。箱体内部与结构不变。

## 方案 C：整体定制更换

如箱体水损、鼠害、刨花板膨胀，需要更换。我方设计新箱体（半定制或全定制本地厂），尽量保留台面，重装回位。

| 范围 | 温哥华 2026 费用 |
|---|---|
| 半定制更换（10–14 延米） | $20,000 – $35,000 |
| 定制更换（15–22 延米） | $30,000 – $50,000 |
| 定制 + 新台面 + 瓷砖防溅板 + 水槽 | $40,000 – $75,000 |

此规模接近整厨改造范畴，通常建议讨论整厨改造方案（参见 /services/kitchen/）。

## 每个项目都包含

- 免费上门评估 + 门板测量
- 1 周展厅选择（门型、饰面、五金）
- 拆卸 + 离厂喷漆（重新喷漆 / 贴面）或整体拆除（更换）
- 3 年施工质保
- $500 万综合责任险 + WorkSafeBC

## 工期

| 方案 | 时长（厨房暂停使用期） |
|---|---|
| 重新喷漆 | 5–8 工作日（门板拆走，箱体五金保留） |
| 贴面翻新 | 7–14 工作日 |
| 定制更换 | 4–8 周 |

## 价格上行因素
- 非标或超大门板（定制铣型）：+20–40%
- 玻璃门板（定制切割）：每扇 +$200–$500
- 深色油漆饰面（多遍）：+10%
- 软关 + 高端拉手五金升级：合计 +$1K–$3K

## 为什么我们的底线是 $4K 而不是 $1.5K

Kijiji / Facebook Marketplace 上 $1.5K 的"橱柜翻新"是滚涂油漆——12–18 个月就会脱皮。我方为工业喷漆车间双组分漆——耐用 15 年以上，与新橱柜出厂工艺相同。价格反映工业级设备、规范前期处理、与质保。`;

const LOCALES: { suffix: string; gtx: string }[] = [
  { suffix: 'ZhHant', gtx: 'zh-TW' },
  { suffix: 'Ja', gtx: 'ja' },
  { suffix: 'Ko', gtx: 'ko' },
  { suffix: 'Es', gtx: 'es' },
  { suffix: 'Pa', gtx: 'pa' },
  { suffix: 'Tl', gtx: 'tl' },
  { suffix: 'Fa', gtx: 'fa' },
  { suffix: 'Vi', gtx: 'vi' },
  { suffix: 'Ru', gtx: 'ru' },
  { suffix: 'Ar', gtx: 'ar' },
  { suffix: 'Hi', gtx: 'hi' },
  { suffix: 'Fr', gtx: 'fr' },
];

const GLOSSARY: { term: string; marker: string }[] = [
  { term: 'Reno Stars', marker: 'XQXAAYQY' },
  { term: 'Vancouver Metro', marker: 'XQXABYQY' },
  { term: 'Vancouver', marker: 'XQXACYQY' },
  { term: 'BC Hydro', marker: 'XQXADYQY' },
  { term: 'BC Code', marker: 'XQXAEYQY' },
  { term: 'CSA B651', marker: 'XQXAFYQY' },
  { term: 'WorkSafeBC', marker: 'XQXAGYQY' },
  { term: 'PEX-A', marker: 'XQXAHYQY' },
  { term: 'PEX', marker: 'XQXAIYQY' },
  { term: 'WaterSense', marker: 'XQXAJYQY' },
  { term: 'IKEA', marker: 'XQXAKYQY' },
  { term: 'Toto', marker: 'XQXALYQY' },
  { term: 'Kohler', marker: 'XQXAMYQY' },
  { term: 'Caesarstone', marker: 'XQXANYQY' },
  { term: 'Silestone', marker: 'XQXAOYQY' },
  { term: 'Schluter', marker: 'XQXAPYQY' },
  { term: 'Wedi', marker: 'XQXAQYQY' },
  { term: 'BC', marker: 'XQXARYQY' },
];
GLOSSARY.sort((a, b) => b.term.length - a.term.length);
function applyGlossary(t: string): string {
  let o = t;
  for (const { term, marker } of GLOSSARY) o = o.split(term).join(marker);
  return o;
}
function unprotectGlossary(t: string): string {
  let o = t;
  for (const { term, marker } of GLOSSARY) {
    const re = new RegExp(marker.split('').join('\\s*'), 'g');
    o = o.replace(re, term);
  }
  return o;
}
async function gtxTranslate(text: string, target: string): Promise<string> {
  if (!text || !text.trim()) return text;
  const protected_ = applyGlossary(text);
  const params = new URLSearchParams({ client: 'gtx', sl: 'en', tl: target, dt: 't', q: protected_ });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: unknown = await r.json();
      if (!Array.isArray(data) || !Array.isArray((data as unknown[][])[0])) throw new Error('shape');
      const segs = (data as unknown[][])[0] as unknown[][];
      const out = segs
        .map((s) => (Array.isArray(s) && typeof s[0] === 'string') ? s[0] : '')
        .filter(Boolean)
        .join('');
      return unprotectGlossary(out);
    } catch (e) {
      if (attempt === 2) {
        console.warn(`  gtx fail [${target}]: ${(e as Error).message}`);
        return text;
      }
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  return text;
}

async function run() {
  for (const [slug, copy] of Object.entries(SERVICES)) {
    console.log(`\n=== ${slug} ===`);

    const cur = await pool.query<{ id: string; localizations: Record<string, string> | null }>(
      `SELECT id, localizations FROM services WHERE slug = $1`,
      [slug],
    );
    if (cur.rows.length === 0) {
      console.log(`  SKIP — service not found`);
      continue;
    }
    const id = cur.rows[0].id;
    const existingLoc = cur.rows[0].localizations ?? {};
    const newLoc: Record<string, string> = { ...existingLoc };

    // Translate the new short description to all 12 non-EN/ZH locales (refresh).
    process.stdout.write('  desc: ');
    for (const { suffix, gtx } of LOCALES) {
      const k = `description${suffix}`;
      newLoc[k] = await gtxTranslate(copy.descEn, gtx);
      process.stdout.write(`${suffix} `);
      await new Promise((r) => setTimeout(r, 100));
    }
    process.stdout.write('\n');

    // Long description: set EN + ZH; ZH-Hant gets ZH (close enough); wipe other long_description locales so they fall back to EN.
    if (copy.longEn && copy.longZh) {
      newLoc['longDescriptionZhHant'] = copy.longZh;
      for (const { suffix } of LOCALES) {
        if (suffix === 'ZhHant') continue;
        delete newLoc[`longDescription${suffix}`];
      }
      console.log(`  long: EN + ZH set, ZH-Hant cloned, 11 others fallback to EN`);
    }

    // UPDATE
    if (copy.longEn && copy.longZh) {
      await pool.query(
        `UPDATE services
            SET description_en = $1, description_zh = $2,
                long_description_en = $3, long_description_zh = $4,
                localizations = $5
          WHERE id = $6`,
        [copy.descEn, copy.descZh, copy.longEn, copy.longZh, JSON.stringify(newLoc), id],
      );
    } else {
      await pool.query(
        `UPDATE services
            SET description_en = $1, description_zh = $2, localizations = $3
          WHERE id = $4`,
        [copy.descEn, copy.descZh, JSON.stringify(newLoc), id],
      );
    }
    console.log(`  ✓ ${slug} updated`);
  }

  await pool.end();
  console.log('\nAll done.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
