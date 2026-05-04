/**
 * Comprehensive enrichment of the accessible-bathroom service:
 *
 *   (a) Short description: expand from 4 features to 7-8 covering
 *       mobility, safety, fixtures, code compliance, and grant help.
 *
 *   (b) Long description: full 10-category markdown ("What's Included")
 *       with feature tables for mobility/safety/fixtures/grab-bars/smart/
 *       future-proofing/funding/code-coordination/cultural/luxury.
 *       Renders via ServiceDetailPage's prose markdown converter.
 *
 *   (c) UI structured section: served by the markdown long_description
 *       (ServiceDetailPage already renders `prose-h2/h3` styled tables
 *        from the markdown via renderProseHtml — the ## headings + tables
 *        below produce a "What's Included" structured section visually).
 *
 * Plus: expand service_tags from 9 to 18 covering anti-scald valves,
 * linear drains, future-proofing, HAFI/OT/CSA, smart features, cultural
 * additions like bidet seats popular in Chinese/Korean households.
 *
 * All EN+ZH written natively. The 12 other locales for short descriptions
 * + tag.localizations are gtx-translated with brand-glossary protection.
 * Long descriptions: EN + ZH native only (long-form gtx is unreliable for
 * tables) — pickLocale falls back to EN for other locales until manually
 * translated.
 */
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const DESC_EN =
  'Aging-in-place bathroom renovations — curbless showers, grab bars, comfort-height fixtures, anti-scald valves, slip-resistant flooring. CSA B651 compliant, occupational-therapist coordinated. We help with HAFI grant paperwork.';
const DESC_ZH =
  '老人/无障碍浴室改造——无门槛淋浴、扶手、舒适高度洁具、防烫阀、防滑地面，符合 CSA B651 标准，与职业治疗师协作，协助办理 HAFI 居家改造资助申请。';

const LONG_EN = `Accessible bathrooms — also called aging-in-place bathrooms — are designed for safe, independent use across mobility levels. We renovate bathrooms for homeowners 50+ planning to stay in their home long-term, post-stroke or post-injury homeowners returning from rehab, multi-generational households where grandparents move in, and disabled homeowners of any age.

The scope ranges from a few targeted safety upgrades to a full wheelchair-accessible ensuite. We design every project to current BC Building Code §3.8 (Barrier-Free Design) and CSA B651-23 standards, and coordinate with your occupational therapist when one is involved.

## What's Included

### 1. Mobility & Access

| Feature | What it does |
|---|---|
| Curbless / zero-threshold shower | Eliminates the lip that causes falls and blocks wheelchair entry |
| Linear floor drain | Lets a wheelchair roll smoothly across the entire bathroom — no center bump |
| Wider doorway (32"–36" clear) | BC Code requires 32" minimum for barrier-free; 36" is standard for wheelchairs |
| Pocket / barn door | Recovers ~9 sq ft of clearance vs a swing door — critical in small bathrooms |
| 5-foot turning radius | 60" diameter clear floor space lets a wheelchair turn in place |
| Toilet transfer space | 32" × 48" clear at front and side for sliding-board transfers |
| Roll-in shower (60" × 36" min) | Wheelchair enters with attendant; sized for caregiver assist |

### 2. Safety & Fall Prevention

| Feature | What it does |
|---|---|
| R10/R11 anti-slip tile | Wet-rated DCOF ≥ 0.42 per ANSI A137.1 — far higher than standard tile |
| Anti-slip retrofit coating | Etched coating on existing tile — lower-cost upgrade without re-tiling |
| Anti-scald thermostatic valve | TempAssure valve, max 49°C — required by BC Code §3.8.3.16 |
| Pressure-balance shower valve | Prevents temperature swing when toilet flushes elsewhere |
| Contrast strip at door + curb | 2" high-contrast strip — helps low-vision residents see the threshold |
| 70+ foot-candle lighting | 3× brighter than standard residential — reduces fall risk |
| Toe-kick LED + motion lights | Hands-free path lighting for nighttime trips |
| Wall blocking at all bar locations | 2×6 plywood backing supports 200kg+ load — code-compliant grab bar mounts |

### 3. Fixtures & Plumbing

| Feature | What it does |
|---|---|
| Comfort-height toilet (17"–19") | Easier on knees and hips — used by every age group, not just seniors |
| Wall-hung toilet | Mounting height adjustable; floor sweeps clean underneath |
| Walk-in tub | Side-entry door, 2-min fill time, optional hydrotherapy jets |
| Roll-under sink / vanity | 28"–32" counter, 27" knee clearance, insulated p-trap (no leg burns) |
| Single-lever / lever-handle faucets | Operable with closed fist — friendly to arthritic hands |
| Hand-held shower wand | 60"+ slide bar, on/off button on the wand head |
| Multi-head body sprays | Seated showering option — reduces fatigue |
| Bidet / wash-let toilet seat | Toto Washlet, Brondell — popular in Chinese/Korean households, also reduces caregiver dependency |
| WaterSense fixtures | Lower water bills, no compromise on accessibility |

### 4. Grab Bars & Support

| Feature | What it does |
|---|---|
| Grab bars at toilet | 1 horizontal + 1 vertical, 1.25"–1.5" diameter, 33"–36" mount height |
| Grab bars in shower | Two walls minimum, including a vertical bar at entry |
| Folding wall-mount shower seat | 350 lb capacity, padded, folds flat when not in use |
| Built-in tile shower bench | Integrated with curbless slope — looks like spa, functions like accessibility |
| Designer / hidden grab bars | Moen Home Care, Invisia — double as towel bars and shelves |
| Vertical pull-up bar at tub | Helps standing transition for users who keep an existing tub |
| Toilet riser frame with arms | 4" rise, removable — interim solution before full toilet swap |

### 5. Smart & Tech Features

| Feature | What it does |
|---|---|
| Voice-controlled lighting | Alexa / Google Home dimming — hands-free at any mobility level |
| Motion-activated faucets | Hands-free, also helps arthritis and reduces germ spread |
| Heated floors | Comfort + faster drying = lower slip risk |
| Heated towel rail | Doubles as low-temp drying rack for hand-washables |
| Emergency call button | Wired to outside light, smart-home alert, or monitored medical service |
| Fall-detection integration | Apple Watch + bathroom-only no-phone-zone solution |
| Defogging / lighted mirror | Better self-care for low-vision users |
| Waterproof shower phone holder | For emergency calls during a fall |

### 6. Future-Proofing

| Feature | What it does |
|---|---|
| Wall blocking for future grab bars | $200 now vs $2,500 retrofit later (tile demo + reset) |
| Reinforced ceiling joist | Prep for ceiling-mounted patient lift if needed later |
| Roughed-in supply for future bidet | Extra cold-water stub at toilet, no wall-cut later |
| Wider stud spacing on accent wall | Allows future cabinet expansion without major rework |
| Pre-wired outlet for stair lift | Adjacent hallway prep so a future stair lift install is plug-and-play |

### 7. Funding We Help With

| Program | Who qualifies | Amount |
|---|---|---|
| BC Home Adaptation for Independence (HAFI) | Income-qualified seniors / disability | Up to $20,000 |
| Veterans Affairs Canada accessibility funding | Veterans | Variable, separate stream |
| Disability Tax Credit (DTC) renovation invoicing | DTC-approved homeowners | Itemized for tax credit submission |
| Medical Expense Tax Credit | Anyone with prescription | Renovation portion claimable |
| RDSP / RRSP Home Buyers' Plan | First-time owners with disability | Up to $35,000 RRSP withdrawal for accessible build |

We complete the contractor portion of the HAFI application, provide pressure-test certificates for HAFI's plumbing requirement, and itemize invoices for tax-credit submissions.

### 8. Code & Coordination

- **BC Building Code §3.8** (Barrier-Free Design) compliance verified at sign-off
- **CSA B651-23** (latest 2023 standard) audit on full wheelchair-accessible builds
- **Permits + inspections** when plumbing or load-bearing walls move
- **Occupational therapist coordination** — OT writes specs, we build to them
- **RAA-certified Aging-in-Place assessor** site visit available before scoping
- **Pre-renovation home assessment** — full-house aging-in-place audit, not just bathroom

### 9. Multi-Generational Considerations

Common in Vancouver, Burnaby, Richmond, and Surrey where multi-generational households are the norm:

- **Bidet / wash-let standard** in many Chinese and Korean households — we treat it as default, not luxury
- **Two-person vanity** for caregiver-assisted hygiene
- **Lockable medicine cabinet** when grandchildren also live in the home
- **Convertible nursery → senior layout** — wider doors and grab-bar blocking from the start, even if currently a young family

### 10. Optional Premium Add-Ons

- Curbless wet room (entire bathroom is shower)
- Programmable bath fill (Kohler PerfectFill — auto-fills to set temp + level)
- Through-floor lift (main floor to upper bathroom)
- Separate caregiver entry (door from hallway and bedroom)
- Smart toilets with auto-flush + auto-lid (Toto Neorest, Kohler Numi)
- Steam shower with aromatherapy

## Aging-in-Place Advice We Give Every Client

**Plan for the bathroom you'll need at 75, not the one you need today.** Adding grab-bar backing in walls during a routine bathroom reno costs $200; adding it after, when you actually need the bars, costs $2,500 in tile demo and reset. Same logic for low-curb showers — much cheaper to build curbless once than to rebuild later.

**Bring in your occupational therapist before scoping.** OTs specify clearances, fixture heights, and access patterns based on your specific mobility profile. We translate their specs into a build plan that satisfies BC Code and CSA B651.

**Document everything for grants and tax credits.** We provide itemized invoices, photo documentation, and pressure-test certificates that satisfy HAFI, VAC, and DTC submission requirements.

## Free in-Home Accessibility Assessment

Every accessible bathroom project starts with an in-home assessment — we measure clearances, identify load-bearing walls, evaluate existing plumbing capacity, and discuss your current and projected mobility needs. The assessment is free, takes about an hour, and produces a written scope you can use whether or not we build the project.`;

const LONG_ZH = `无障碍浴室——也称为"老人/适老化浴室"——其设计目标是在不同行动能力下都能安全、独立使用。我们为以下人群提供改造服务：50 岁以上希望长期居住于家中的业主、中风或受伤后从康复中心回家的业主、多代同堂家庭（祖辈搬入同住）、以及任何年龄段的残障业主。

施工范围从针对性的安全升级，到全轮椅无障碍主卫，应有尽有。每个项目均按现行 BC 建筑规范 §3.8（无障碍设计）与 CSA B651-23 标准设计施工，并在客户已有职业治疗师介入时与之协作。

## 包含内容

### 1. 通行与移动

| 项目 | 作用 |
|---|---|
| 无门槛 / 无槛淋浴 | 消除导致跌倒、阻挡轮椅的边沿 |
| 线性地漏 | 轮椅可平滑穿过整间浴室——中部无凸起 |
| 加宽门洞（32"–36" 净宽） | BC 规范要求 32" 起；36" 是轮椅标准 |
| 推拉门 / 谷仓门 | 比平开门省约 9 平方尺通行空间——小浴室关键 |
| 5 尺回转直径 | 60" 直径净空地面让轮椅原地转向 |
| 马桶转移空间 | 前侧 32"×48" 净空，便于滑板转移 |
| 步入式淋浴（最小 60"×36"） | 轮椅可入，预留陪护协助空间 |

### 2. 防滑与防跌倒

| 项目 | 作用 |
|---|---|
| R10/R11 防滑瓷砖 | 湿态 DCOF ≥ 0.42（ANSI A137.1）——远高于普通瓷砖 |
| 现有瓷砖防滑改造涂层 | 蚀刻涂层——无需重铺即可升级 |
| 恒温防烫阀 | TempAssure 阀，最高 49°C——BC 规范 §3.8.3.16 强制要求 |
| 平压淋浴阀 | 防止他处冲水时温度突变 |
| 门口与边沿对比色边条 | 2" 高对比色边条——视障人士识别门槛 |
| 70+ 烛光高亮度照明 | 比标准住宅亮 3 倍——降低跌倒风险 |
| 脚踢 LED + 红外感应夜灯 | 夜间免触摸路径照明 |
| 全部扶手位置墙体加固 | 2×6 夹板背板，承重 200 公斤+——合规扶手安装基础 |

### 3. 洁具与水电

| 项目 | 作用 |
|---|---|
| 舒适高度马桶（17"–19"） | 减轻膝髋负担——所有年龄段都更舒适 |
| 壁挂式马桶 | 安装高度可调；地板易清洁 |
| 步入式浴缸 | 侧开门，2 分钟注水，可选水疗按摩 |
| 可滚入式梳妆台 | 28"–32" 台面高，27" 膝下空间，保温下水管（防烫腿） |
| 杠杆式水龙头 | 紧握拳头即可操作——关节炎友好 |
| 手持淋浴喷头 | 60"+ 滑杆，喷头自带开关 |
| 多喷头侧喷 | 可坐姿淋浴——减轻疲劳 |
| 智能洁身座圈（Toto Washlet 等） | 华人 / 韩国家庭常见标配，也降低陪护依赖 |
| WaterSense 节水洁具 | 节省水费，不影响无障碍性能 |

### 4. 扶手与支撑

| 项目 | 作用 |
|---|---|
| 马桶扶手 | 横竖各一，直径 1.25"–1.5"，安装高 33"–36" |
| 淋浴间扶手 | 至少两面墙，含入口处竖向扶手 |
| 折叠壁挂淋浴座椅 | 承重 350 磅，软包，不用时可收起 |
| 嵌入式瓷砖淋浴长凳 | 与无门槛斜坡一体——既像水疗又满足无障碍 |
| 设计款隐藏扶手 | Moen Home Care、Invisia——兼作毛巾杆与置物架 |
| 浴缸旁竖向起立杆 | 助力保留浴缸的用户起身 |
| 马桶升高架（含扶手） | 4" 升高，可拆卸——更换马桶前的过渡方案 |

### 5. 智能化

| 项目 | 作用 |
|---|---|
| 语音控制灯光 | Alexa / Google Home 调光——任何行动能力都免触摸 |
| 红外感应水龙头 | 免触摸，关节炎友好，减少细菌传播 |
| 地暖 | 舒适 + 快干——降低打滑风险 |
| 电热毛巾架 | 兼作低温干衣架 |
| 紧急呼叫按钮 | 接外部灯光、智能家居警报或医疗监护服务 |
| 跌倒检测集成 | Apple Watch + 浴室无手机区方案 |
| 防雾 / 带灯化妆镜 | 视障人士更易自理 |
| 防水淋浴手机架 | 跌倒时紧急呼叫 |

### 6. 未来预留

| 项目 | 作用 |
|---|---|
| 预留扶手墙体加固 | 现在 $200 vs 后期 $2,500（拆铺瓷砖费用） |
| 加固天花板 | 为日后吊运式护理升降做准备 |
| 预留智能马桶冷水接口 | 马桶旁多留接口，日后无需开墙 |
| 加宽墙体间距（特色墙） | 日后扩展柜体不需大改 |
| 预接电源（楼梯升降椅） | 走廊预留——日后楼梯升降椅即装即用 |

### 7. 我们协助申请的资助

| 项目 | 适用人群 | 金额 |
|---|---|---|
| BC 居家适老化改造资助 (HAFI) | 符合资格的低收入老人 / 残障人士 | 最高 $20,000 |
| 加拿大退伍军人事务部无障碍资金 | 退伍军人 | 数额视情况 |
| 残障税收抵免（DTC）改造发票 | 已批 DTC 业主 | 分项发票供税务申报 |
| 医疗费用税收抵免 | 凭处方人士 | 改造费用部分可抵扣 |
| RDSP / RRSP 首房计划 | 初次购房残障人士 | 最多 $35,000 RRSP 提取用于无障碍施工 |

我方完成 HAFI 申请的承包商部分文件、出具压力测试证书（HAFI 水路要求），并按税收抵免要求分项开具发票。

### 8. 合规与协作

- **BC 建筑规范 §3.8**（无障碍设计）合规——验收时确认
- **CSA B651-23**（2023 年最新版）审核——全轮椅无障碍项目适用
- **许可证 + 政府检验**——动管线或承重墙时必需
- **职业治疗师协作**——OT 出方案，我方按图施工
- **RAA 认证适老化评估师**入户评估——可在报价前提供
- **改造前全屋评估**——不仅限于浴室，整屋适老化审核

### 9. 多代同堂适配

温哥华、本拿比、列治文、Surrey 多代同堂家庭常见考量：

- **智能洁身座圈作为标配**——华人 / 韩国家庭普及，我们视为默认而非高端配置
- **双人梳妆台**——便于陪护协助
- **可锁药柜**——孙辈同住时防误取
- **婴儿房 → 适老化可转换布局**——年轻家庭也可预先加宽门洞与扶手墙体加固

### 10. 高端可选

- 整体湿区设计（整间浴室即淋浴，斜坡排水）
- 自动注水浴缸（Kohler PerfectFill 等，可预设温度水位）
- 楼层间升降梯（主楼 → 楼上浴室）
- 双门设计（卧室 + 走廊双入口，方便陪护）
- 智能马桶（自动冲水 + 自动开关盖，Toto Neorest、Kohler Numi 等）
- 蒸汽淋浴 + 香薰

## 我们给每位客户的"适老化"建议

**按 75 岁的需求设计浴室，而不是今天的需求。** 改造时一次性预留扶手墙体加固只需 $200；待真正需要时再加，瓷砖拆铺要 $2,500。无门槛淋浴同理——一次做无门槛远比未来重做便宜。

**报价前先请职业治疗师介入。** OT 根据您具体的行动能力档案，给出净空、洁具高度与通行模式规范。我方将其转化为符合 BC 规范与 CSA B651 的施工方案。

**为资助与税收抵免准备完整文件。** 我方提供分项发票、施工照片、压力测试证书，可满足 HAFI、VAC、DTC 申报要求。

## 免费上门无障碍评估

每个无障碍浴室项目都从入户评估开始——我们测量净空、识别承重墙、评估现有水电容量，并讨论您当前与未来可能的行动能力变化。评估免费，约一小时，并出具书面方案——无论是否最终由我方施工，您都可使用此方案。`;

// New tags to ADD (existing 9 retained). 18 total after this.
const NEW_TAGS_EN: { en: string; zh: string }[] = [
  { en: 'Anti-scald thermostatic valve', zh: '恒温防烫阀' },
  { en: 'Linear floor drain', zh: '线性地漏（轮椅可滚过）' },
  { en: '5-foot turning radius', zh: '5 尺回转直径' },
  { en: 'Wall blocking for future bars', zh: '预留扶手墙体加固' },
  { en: 'Bidet / wash-let toilet seat', zh: '智能洁身座圈' },
  { en: 'Heated floors + heated towel rail', zh: '地暖 + 电热毛巾架' },
  { en: 'Motion-activated lights', zh: '红外感应灯' },
  { en: 'Emergency call button', zh: '紧急呼叫按钮' },
  { en: 'HAFI grant paperwork assistance', zh: '协助办理 HAFI 资助申请' },
  { en: 'OT-coordinated build', zh: '与职业治疗师协作施工' },
  { en: 'Walk-in tub option', zh: '步入式浴缸（可选）' },
  { en: 'Hand-held shower wand', zh: '手持淋浴喷头' },
  { en: 'Pocket / barn door for clearance', zh: '推拉门 / 谷仓门（节省空间）' },
];

const LOCALES: { suffix: string; gtx: string }[] = [
  { suffix: 'ZhHant', gtx: 'zh-TW' },
  { suffix: 'Ja',      gtx: 'ja' },
  { suffix: 'Ko',      gtx: 'ko' },
  { suffix: 'Es',      gtx: 'es' },
  { suffix: 'Pa',      gtx: 'pa' },
  { suffix: 'Tl',      gtx: 'tl' },
  { suffix: 'Fa',      gtx: 'fa' },
  { suffix: 'Vi',      gtx: 'vi' },
  { suffix: 'Ru',      gtx: 'ru' },
  { suffix: 'Ar',      gtx: 'ar' },
  { suffix: 'Hi',      gtx: 'hi' },
  { suffix: 'Fr',      gtx: 'fr' },
];

const GLOSSARY: { term: string; marker: string }[] = [
  { term: 'Reno Stars', marker: 'XQXAAYQY' },
  { term: 'BC Hydro',   marker: 'XQXABYQY' },
  { term: 'BC Code',    marker: 'XQXACYQY' },
  { term: 'CSA B651',   marker: 'XQXADYQY' },
  { term: 'HAFI',       marker: 'XQXAEYQY' },
  { term: 'PEX',        marker: 'XQXAFYQY' },
  { term: 'Vancouver',  marker: 'XQXAGYQY' },
  { term: 'WaterSense', marker: 'XQXAHYQY' },
  { term: 'Kohler',     marker: 'XQXAIYQY' },
  { term: 'Toto',       marker: 'XQXAJYQY' },
  { term: 'BC',         marker: 'XQXAKYQY' },
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
  const url = `https://translate.googleapis.com/translate_a/single?${params}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
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
      await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
    }
  }
  return text;
}

async function run() {
  // ──────────────────────────────────────────────────────────
  // 1. SHORT DESCRIPTION + LONG DESCRIPTION
  // ──────────────────────────────────────────────────────────
  const svc = await pool.query<{ id: string; localizations: Record<string, string> | null }>(
    `SELECT id, localizations FROM services WHERE slug='accessible-bathroom'`,
  );
  const serviceId = svc.rows[0].id;
  const existingLoc = svc.rows[0].localizations ?? {};

  console.log('Translating short description + long description for 12 locales...');
  const newLoc: Record<string, string> = { ...existingLoc };
  for (const { suffix, gtx } of LOCALES) {
    const sk = `description${suffix}`;
    if (!existingLoc[sk] || existingLoc[sk].length < 5) {
      newLoc[sk] = await gtxTranslate(DESC_EN, gtx);
      process.stdout.write(`  ${suffix} desc done\n`);
      await new Promise((r) => setTimeout(r, 100));
    } else {
      // Always refresh — short description was rewritten
      newLoc[sk] = await gtxTranslate(DESC_EN, gtx);
      process.stdout.write(`  ${suffix} desc refreshed\n`);
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  // Long descriptions: only translate ZhHant (preserves Mandarin variant);
  // EN long_description serves as fallback for the other 11 locales until
  // human translation. Long-form gtx routinely mangles markdown tables.
  newLoc['longDescriptionZhHant'] = LONG_ZH; // ZH-Hant uses Simplified ZH source — close enough
  // Wipe stale gtx-mangled long descriptions for other locales so pickLocale
  // falls back to EN. (Alternatively keep them — but page-on-locale parity
  // suffers when the table renders broken.)
  for (const { suffix } of LOCALES) {
    if (suffix === 'ZhHant') continue;
    delete newLoc[`longDescription${suffix}`];
  }

  await pool.query(
    `UPDATE services
        SET description_en = $1,
            description_zh = $2,
            long_description_en = $3,
            long_description_zh = $4,
            localizations = $5
      WHERE id = $6`,
    [DESC_EN, DESC_ZH, LONG_EN, LONG_ZH, JSON.stringify(newLoc), serviceId],
  );
  console.log('  ✓ short + long description updated');

  // ──────────────────────────────────────────────────────────
  // 2. EXPAND service_tags (insert new tags after existing 9)
  // ──────────────────────────────────────────────────────────
  const existingTags = await pool.query<{ tag_en: string; display_order: number }>(
    `SELECT tag_en, display_order FROM service_tags WHERE service_id = $1`,
    [serviceId],
  );
  const existingEn = new Set(existingTags.rows.map((r) => r.tag_en));
  const maxOrder = Math.max(0, ...existingTags.rows.map((r) => r.display_order));
  console.log(`\nExisting tags: ${existingTags.rows.length}, max display_order: ${maxOrder}`);

  let nextOrder = maxOrder + 1;
  for (const { en, zh } of NEW_TAGS_EN) {
    if (existingEn.has(en)) {
      console.log(`  SKIP "${en}" (exists)`);
      continue;
    }
    const tagLoc: Record<string, string> = { tagEn: en, tagZh: zh };
    for (const { suffix, gtx } of LOCALES) {
      tagLoc[`tag${suffix}`] = await gtxTranslate(en, gtx);
      await new Promise((r) => setTimeout(r, 80));
    }
    await pool.query(
      `INSERT INTO service_tags (id, service_id, tag_en, tag_zh, display_order, localizations)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), serviceId, en, zh, nextOrder++, JSON.stringify(tagLoc)],
    );
    console.log(`  + ${en}`);
  }

  await pool.end();
  console.log('\nDone.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
