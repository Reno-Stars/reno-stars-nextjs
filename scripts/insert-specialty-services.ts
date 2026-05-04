/**
 * Inserts 4 new service categories the user identified 2026-05-04 as
 * common Vancouver renovation work that wasn't surfaced as a distinct
 * service:
 *
 *   poly-b-replacement   — polybutylene plumbing replacement (BC homes 1985-97)
 *   heat-pump-hvac       — heat pump installation + HVAC upgrades (BC Hydro rebates)
 *   accessible-bathroom  — aging-in-place / wheelchair-accessible bathroom mods
 *   critical-load-panel  — backup-power-ready electrical panel (Tesla, generator, EV)
 *
 * Two of them (accessible-bathroom, poly-b-replacement) get city combos
 * via is_project_type=true. The two technical specialties (heat-pump,
 * critical-load-panel) skip city combos (is_project_type=false) since
 * they're metro-wide trade work, not city-scoped projects.
 *
 * Pricing is grounded in Vancouver-market norms — Reno Stars completes
 * these regularly via subtrades or in-house. Numbers reflect 2026 market
 * with BC-Hydro / Province rebate context where applicable.
 */
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

interface ServiceInsert {
  slug: string;
  title_en: string;
  title_zh: string;
  description_en: string;
  description_zh: string;
  long_description_en: string;
  long_description_zh: string;
  display_order: number;
  is_project_type: boolean;
  show_on_services_page: boolean;
}

const services: ServiceInsert[] = [
  {
    slug: 'poly-b-replacement',
    title_en: 'Poly-B Pipe Replacement',
    title_zh: 'Poly-B 水管更换',
    description_en: 'Replace failing polybutylene plumbing in BC homes built 1985–1997. Insurance renewal, leak prevention, $8K–$25K.',
    description_zh: '更换 1985–1997 年间在 BC 省建造的房屋中失效的 Poly-B 聚乙烯管道。保险续保、防漏水，$8K–$25K。',
    long_description_en: `Poly-B (polybutylene) plumbing was widely installed in Vancouver-area homes built between 1985 and 1997. Two decades later, the chlorine in BC water reacts with the pipe walls, causing brittleness, micro-cracks, and eventually catastrophic leaks. As of 2025, multiple BC insurers will not renew home insurance on Poly-B properties — replacement is now a transactional necessity, not just a maintenance choice.

We replace Poly-B with PEX (cross-linked polyethylene) — the modern standard, code-approved, 50-year warranty from major manufacturers. Typical scope: re-pipe all hot/cold supply lines from the manifold to every fixture, replace shutoff valves, drywall patch behind access points, pressure-test the new system.

**Real Vancouver Poly-B replacement costs:**

| Property type | Replacement cost | Timeline |
|---|---|---|
| Condo (1-bath, single-floor) | $4,000 – $8,000 | 2–3 days |
| Condo (2-bath) | $6,000 – $12,000 | 3–4 days |
| Townhouse (2 floors) | $8,000 – $14,000 | 4–6 days |
| SFH (single-floor 1,500 sqft) | $10,000 – $16,000 | 5–7 days |
| SFH (2-floor 2,500 sqft) | $14,000 – $22,000 | 6–10 days |
| Luxury SFH (3-floor + ensuites) | $20,000 – $35,000+ | 10–14 days |

**What's included:** PEX-A or PEX-B re-pipe, all supply line connections, manifold installation, drywall patch (paint touch-up not included), pressure test, BC permit + inspection.

**What's extra:** Drain/waste re-piping (separate scope), hot water tank replacement, fixture replacements, full repaint of touched walls.

**Why now:** insurers are tightening coverage every year. Get ahead of a forced replacement at the worst possible time (after a leak, with damage repair costs piled on top). We coordinate with your insurer if needed for renewal documentation.`,
    long_description_zh: `Poly-B（聚丁烯）管道在 1985 至 1997 年间被广泛安装在大温地区的房屋中。20 多年后，BC 省自来水中的氯气与管壁反应，导致管道变脆、微裂纹，最终发生严重漏水。截至 2025 年，多家 BC 保险公司不再为含 Poly-B 的物业续保——更换不再只是维护选项，而是交易必需。

我们用 PEX（交联聚乙烯）替换 Poly-B——这是现代标准管道、符合规范，主要厂商提供 50 年保修。典型工作内容：从分水器到每个洁具的所有冷热供水管全部重铺、更换角阀、维修开口处的墙面、新系统压力测试。

**温哥华 Poly-B 更换真实费用：**

| 物业类型 | 更换费用 | 工期 |
|---|---|---|
| 公寓（单卫、单层） | $4,000 – $8,000 | 2–3 天 |
| 公寓（双卫） | $6,000 – $12,000 | 3–4 天 |
| 联排别墅（两层） | $8,000 – $14,000 | 4–6 天 |
| 独立屋（单层 1,500 平尺） | $10,000 – $16,000 | 5–7 天 |
| 独立屋（双层 2,500 平尺） | $14,000 – $22,000 | 6–10 天 |
| 豪华独立屋（三层 + 主卫套间） | $20,000 – $35,000+ | 10–14 天 |

**含：** PEX-A 或 PEX-B 重新走管、所有供水接头、分水器安装、墙面修补（油漆补涂另计）、压力测试、BC 许可证和检验。

**不含：** 下水/排水改管（单独工程）、热水箱更换、洁具更换、对受影响墙面的全面重新粉刷。

**为何现在做：** 保险公司每年都在收紧承保。在最糟糕的时机（漏水后、损坏修复成本堆叠之上）面临强制更换之前抢先完成。如保险续保需要文件，我们会协调对接。`,
    display_order: 7,
    is_project_type: true,
    show_on_services_page: true,
  },
  {
    slug: 'heat-pump-hvac',
    title_en: 'Heat Pump Installation',
    title_zh: '热泵 / 空调升级',
    description_en: 'Replace gas furnace with heat pump. BC Hydro rebates up to $11K. Vancouver heat pump installation $7K–$25K.',
    description_zh: '用热泵替换燃气炉。BC Hydro 退税最高 $11K。温哥华热泵安装 $7K–$25K。',
    long_description_en: `Heat pumps are now the dominant choice for Vancouver-area HVAC upgrades. They heat in winter, cool in summer (the AC every Vancouver homeowner now wants after 2021's heat dome), and run on electricity — meaning compatibility with BC's net-zero direction and freedom from natural gas price volatility.

We coordinate the full upgrade: HVAC subtrade for installation, electrical work for the dedicated 240V circuit (and panel upgrade if needed — see Critical Load Panel), drywall patch around indoor units, and BC Hydro rebate paperwork.

**Real Vancouver heat pump installation costs (before rebates):**

| System type | Installed cost | Heats / cools |
|---|---|---|
| Ductless mini-split (1 zone) | $4,500 – $7,500 | 1 room or open space |
| Ductless multi-split (2–3 zones) | $8,000 – $15,000 | 2–3 rooms |
| Ductless multi-split (4+ zones) | $14,000 – $22,000 | Whole-floor or whole-house |
| Ducted central (replace gas furnace) | $12,000 – $25,000+ | Whole house, existing ducts |
| Cold-climate ducted + backup heat | $18,000 – $35,000+ | Whole house, premium tier |

**BC Hydro / Province rebates available:**

- Heat pump rebate: up to **$3,000** (BC Hydro)
- Greener Homes Grant: up to **$5,000** (federal)
- Income-qualified low-income top-up: additional **$3,000** (BC Hydro)
- **Combined potential rebate: up to $11,000** depending on eligibility

We handle rebate applications on your behalf — including the pre/post home energy audit if it changes your eligibility tier.

**Common Vancouver scenarios:**

1. **AC retrofit on a heat-only home.** ~70% of pre-2010 Vancouver SFH have no AC. A 3-zone ductless mini-split adds AC + supplemental heat for $10–14K.
2. **Replace a 20+ year gas furnace.** Federal carbon pricing makes this the right financial call now. Heat pump central system runs $14–22K installed, rebates can offset $7–11K.
3. **Heat pump + Critical Load Panel + EV charger combo.** If you're upgrading the panel anyway (heat pump needs 30A breaker, EV charger needs 40A), bundle everything in one electrician visit. Combined cost typically $22–35K.`,
    long_description_zh: `热泵已成为大温地区 HVAC 升级的主流选择。冬天供暖、夏天制冷（2021 年热穹之后每位温哥华业主都想要的空调），用电运行——意味着与 BC 净零方向兼容，并摆脱天然气价格波动。

我们协调整个升级流程：HVAC 分包安装、电气工作（专用 240V 电路 + 必要时的电箱升级——参考关键负载面板）、室内机周围的墙面修补、BC Hydro 退税文件办理。

**温哥华热泵安装真实费用（退税前）：**

| 系统类型 | 安装费用 | 供暖/制冷范围 |
|---|---|---|
| 单区无管道分体 | $4,500 – $7,500 | 单间或开放区域 |
| 多区无管道（2–3 区） | $8,000 – $15,000 | 2–3 个房间 |
| 多区无管道（4+ 区） | $14,000 – $22,000 | 整层或整屋 |
| 中央有管道（替换燃气炉） | $12,000 – $25,000+ | 整屋、现有风管 |
| 寒带级中央 + 辅热 | $18,000 – $35,000+ | 整屋、高端配置 |

**可申请 BC Hydro / 省级退税：**

- 热泵退税：最高 **$3,000**（BC Hydro）
- 加拿大绿色家园补助：最高 **$5,000**（联邦）
- 低收入家庭补充：额外 **$3,000**（BC Hydro）
- **合计可达 $11,000**，视资格等级而定

我们代为办理退税申请——包括影响您退税等级的入户能源审计前后流程。

**温哥华常见场景：**

1. **无空调家庭加装制冷。** 约 70% 的 2010 年前温哥华独立屋没有空调。3 区无管道分体加装可提供制冷 + 辅热，$10–14K。
2. **替换 20 年以上燃气炉。** 联邦碳税让现在升级在经济上合算。中央热泵系统安装 $14–22K，退税可抵 $7–11K。
3. **热泵 + 关键负载面板 + EV 充电器组合。** 如果反正要升级电箱（热泵需要 30A 断路器，EV 充电器需要 40A），最好一次性请电工搞定全部。组合费用通常 $22–35K。`,
    display_order: 8,
    is_project_type: false,
    show_on_services_page: true,
  },
  {
    slug: 'accessible-bathroom',
    title_en: 'Accessible Bathroom Renovation',
    title_zh: '无障碍 / 老人浴室改造',
    description_en: 'Aging-in-place bathroom: walk-in shower, grab bars, comfort-height toilet, wheelchair access. $3K–$60K Vancouver.',
    description_zh: '老人/无障碍浴室改造：步入式淋浴、扶手、舒适高度马桶、轮椅通行。温哥华 $3K–$60K。',
    long_description_en: `Accessible bathrooms — also called aging-in-place bathrooms — are designed for safe, independent use across mobility levels. We renovate bathrooms for homeowners 50+ planning to stay in their home long-term, post-stroke or post-injury homeowners returning from rehab, and multi-generational households where grandparents move in.

The scope ranges from $3K (grab bars + comfort-height toilet) to $60K (full wheelchair-accessible ensuite with curbless shower and roll-under vanity). We follow BC Building Code accessibility guidelines and CSA B651 wherever applicable, and coordinate with occupational therapists when you have one involved.

**Real Vancouver accessible bathroom costs:**

| Scope | Cost | Best for |
|---|---|---|
| Safety basics (grab bars, comfort toilet, slip-resistant flooring) | $3,000 – $8,000 | Aging in place, light mobility issues |
| Walk-in tub conversion | $8,000 – $18,000 | Cannot step over standard tub edge |
| Tub-to-walk-in-shower conversion (low-curb) | $10,000 – $25,000 | Want shower-only, need easy entry |
| Curbless / barrier-free shower | $18,000 – $35,000 | Wheelchair or walker access |
| Full wheelchair-accessible ensuite (roll-in shower, roll-under vanity, 5-foot turning radius) | $35,000 – $60,000+ | Permanent wheelchair user |

**What we routinely include:**

- **Grab bars** properly anchored to studs (NOT drywall — BC code requires structural backing)
- **Comfort-height toilet** (17"–19" — easier on knees + hips at every age)
- **Slip-resistant tile** with R10+ rating in shower areas
- **Lever-handle faucets** (no twist required for arthritic hands)
- **Curbless or low-curb shower** (single-pour linear-drain construction)
- **Roll-in shower seat** (folding wall-mount, supports 350+ lbs)
- **Roll-under vanity** (counter at 28"–32" with knee clearance)
- **Lower light switches and outlets** (44" max for wheelchair reach)
- **Wider doorways** (minimum 32" clear, ideally 36" for wheelchair)

**Aging-in-place advice we give every client:** plan for the bathroom you'll need at 75, not the one you need today. Adding grab-bar backing in walls during a routine bathroom reno costs $200; adding it after, when you actually need the bars, costs $2,500 in tile demo + tile reset. Same logic for low-curb showers — much cheaper to build curbless once than to rebuild later.

**Who pays what:** The Province's Home Adaptation for Independence program covers up to $20,000 for income-qualified seniors. Veterans Affairs Canada has separate accessibility funding. We help with the application paperwork.`,
    long_description_zh: `无障碍浴室——也称为老人就地养老浴室——为不同行动能力者设计安全、独立使用的空间。我们为以下客户改造浴室：50 岁以上计划长期自住的业主、中风/伤后康复出院的业主、多代同堂家庭中老人入住的住宅。

工作范围从 $3K（扶手 + 舒适高度马桶）到 $60K（带无门槛淋浴、轮椅可入式梳妆台的全无障碍主卫套间）。我们遵循 BC 建筑规范无障碍指南和适用的 CSA B651 标准，并在客户已委托职业治疗师时与其协调。

**温哥华无障碍浴室真实费用：**

| 范围 | 费用 | 最适合 |
|---|---|---|
| 安全基础（扶手、舒适马桶、防滑地板） | $3,000 – $8,000 | 老年自住、轻度行动不便 |
| 普通浴缸改步入式浴缸 | $8,000 – $18,000 | 无法跨越标准浴缸边缘 |
| 浴缸改低门槛步入式淋浴 | $10,000 – $25,000 | 只想要淋浴、需易于进入 |
| 无门槛/无障碍淋浴 | $18,000 – $35,000 | 需轮椅或助行器进入 |
| 全轮椅无障碍主卫套间（可滚入式淋浴、可滚入式梳妆台、5 英尺回转半径） | $35,000 – $60,000+ | 永久轮椅使用者 |

**我们常规包含：**

- **扶手** 正确锚定到墙骨（不仅仅锚定干墙——BC 规范要求结构背板）
- **舒适高度马桶**（17"–19"——任何年龄都对膝盖和髋部更友好）
- **防滑瓷砖** 淋浴区 R10+ 防滑等级
- **杠杆式水龙头**（关节炎手部无需扭转）
- **无门槛或低门槛淋浴**（线性地漏一次浇筑施工）
- **可滚入式淋浴座椅**（折叠式墙挂、承重 350+ 磅）
- **可滚入式梳妆台**（28"–32" 高、有膝部空间）
- **较低开关和插座**（44" 上限，便于轮椅取用）
- **加宽门洞**（最小 32" 净宽、轮椅理想 36"）

**我们对每位客户的就地养老建议：** 规划 75 岁时需要的浴室，而不是今天需要的浴室。在常规浴室装修时给墙体加扶手背板需 $200；之后真正需要扶手时再加，需 $2,500 的瓷砖拆改。无门槛淋浴同理——一次建好比之后重建便宜得多。

**谁负担什么：** BC 省的"独立生活居家改造"项目为符合资格的低收入老人提供最高 $20,000 的资助。退伍军人事务部加拿大有单独的无障碍资金。我们协助申请文件办理。`,
    display_order: 9,
    is_project_type: true,
    show_on_services_page: true,
  },
  {
    slug: 'critical-load-panel',
    title_en: 'Critical Load Panel Installation',
    title_zh: '关键负载电箱（应急配电）',
    description_en: 'Backup-power-ready electrical panel for generator, battery, EV. Vancouver $3K–$12K. Pairs with heat pump installs.',
    description_zh: '应急电源就绪电箱，适配发电机、家庭储能、EV 充电。温哥华 $3K–$12K。常配合热泵安装一并升级。',
    long_description_en: `A critical load panel (also called a sub-panel or backup-load panel) separates your essential circuits — fridge, furnace/heat pump, well pump, network, key lights — from the rest of your house's electrical load. When power fails, a generator or battery can run JUST those critical circuits without trying to power the whole house.

This is the install you need before any of these become useful: portable generator, Tesla Powerwall / Enphase battery, whole-home generator, EV charger upgrade requiring panel headroom, heat pump install requiring a 30A breaker.

**Real Vancouver critical load panel costs:**

| Scope | Cost | What it does |
|---|---|---|
| Sub-panel only (10–12 critical circuits) | $2,500 – $4,500 | Pre-wires for future generator/battery |
| Sub-panel + manual transfer switch | $4,000 – $6,500 | Plug-in portable generator ready |
| Sub-panel + automatic transfer switch + generator pad | $6,000 – $9,500 | Whole-home generator ready |
| Sub-panel + battery prep (Powerwall, Enphase) | $9,000 – $15,000 | Solar-battery future-ready, includes battery wall mount + sub-conduit |
| Full panel upgrade (100A → 200A) + sub-panel + battery prep | $12,000 – $20,000 | EV + heat pump + battery all on one upgrade |

**Why this often shows up alongside other renovations:**

1. **Heat pump install pushes electrical load past panel capacity.** Most pre-2000 Vancouver homes have 100A service. A heat pump (30A) + EV charger (40A) + existing dryer + range easily exceeds it. Panel upgrade to 200A is $4–7K on its own.
2. **EV charger requires a 40A circuit + permit.** While the electrician's there, adding the critical-load panel adds only $2–3K marginally.
3. **Insurance and resale.** Vancouver homes with backup-power-ready panels resell for measurably more — every weather-driven outage event makes the upgrade more attractive.

**BC permit and inspection.** All electrical work goes through BC Technical Safety Authority — we pull the permit, schedule the inspection, and warranty the install for 5 years.`,
    long_description_zh: `关键负载电箱（也称分电箱或备用负载箱）将您家中的关键电路——冰箱、暖炉/热泵、水井泵、网络、关键照明——与其余电气负载分开。停电时，发电机或电池只需为这些关键电路供电，无需尝试驱动整栋房屋。

这是以下任何一项在停电时变得有用之前的必装项：便携式发电机、特斯拉 Powerwall / Enphase 电池、整屋发电机、需要电箱裕量的 EV 充电器升级、需要 30A 断路器的热泵安装。

**温哥华关键负载电箱真实费用：**

| 范围 | 费用 | 用途 |
|---|---|---|
| 仅分电箱（10–12 关键电路） | $2,500 – $4,500 | 为未来发电机/电池预接线 |
| 分电箱 + 手动转换开关 | $4,000 – $6,500 | 便携式发电机即插即用 |
| 分电箱 + 自动转换开关 + 发电机基座 | $6,000 – $9,500 | 整屋发电机就绪 |
| 分电箱 + 储能预装（Powerwall、Enphase） | $9,000 – $15,000 | 太阳能/储能未来就绪、含壁挂 + 分支管 |
| 全箱升级（100A → 200A）+ 分电箱 + 储能预装 | $12,000 – $20,000 | EV + 热泵 + 储能一次升级到位 |

**为何这通常与其他装修同时出现：**

1. **热泵安装把电气负载推过电箱容量。** 大多数 2000 年前的温哥华房屋是 100A 总服务。热泵（30A）+ EV 充电器（40A）+ 现有干衣机 + 灶具，很容易超出。升级到 200A 单独 $4–7K。
2. **EV 充电器需要 40A 电路 + 许可证。** 电工到场时，加装关键负载电箱仅边际增加 $2–3K。
3. **保险与转售。** 大温地区配备备用电源就绪电箱的房屋转售价更高——每次极端天气停电都让该升级更具吸引力。

**BC 许可证与检验。** 所有电气工作由 BC 技术安全局批准——我们办理许可证、安排检验，安装质保 5 年。`,
    display_order: 10,
    is_project_type: false,
    show_on_services_page: true,
  },
];

async function run() {
  for (const s of services) {
    const sql = `
      INSERT INTO services (
        slug, title_en, title_zh,
        description_en, description_zh,
        long_description_en, long_description_zh,
        display_order, is_project_type, show_on_services_page,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET
        title_en = EXCLUDED.title_en,
        title_zh = EXCLUDED.title_zh,
        description_en = EXCLUDED.description_en,
        description_zh = EXCLUDED.description_zh,
        long_description_en = EXCLUDED.long_description_en,
        long_description_zh = EXCLUDED.long_description_zh,
        display_order = EXCLUDED.display_order,
        is_project_type = EXCLUDED.is_project_type,
        show_on_services_page = EXCLUDED.show_on_services_page,
        updated_at = NOW()
      RETURNING slug, (xmax = 0) AS inserted
    `;
    const r = await pool.query(sql, [
      s.slug, s.title_en, s.title_zh,
      s.description_en, s.description_zh,
      s.long_description_en, s.long_description_zh,
      s.display_order, s.is_project_type, s.show_on_services_page,
    ]);
    const row = r.rows[0];
    console.log(`${row.inserted ? 'INSERTED' : 'UPDATED '} ${row.slug}`);
  }
  await pool.end();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
