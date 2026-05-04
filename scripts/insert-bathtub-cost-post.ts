import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const post = {
  slug: 'bathtub-renovation-cost-vancouver',
  te: 'Bathtub Renovation Cost Vancouver 2026: $800 to $8,500+ Real Pricing',
  tz: '温哥华浴缸装修费用 2026：$800–$8,500+ 真实数据',
  me: 'Bathtub Renovation Cost Vancouver 2026 | $800–$8,500+ | Reno Stars',
  mz: '温哥华浴缸装修费用 2026 | $800–$8,500+ | Reno Stars',
  de: "Vancouver bathtub renovation cost: $800 (alcove swap) to $8,500+ (freestanding + plumbing). Real tier breakdown + tub-to-shower conversion pricing.",
  dz: '温哥华浴缸装修费用：$800（亚克力嵌入式更换）至$8,500+（独立式带新管道）。真实分层数据+浴缸改淋浴报价。',
  fe: 'bathtub renovation cost',
  fz: '温哥华浴缸装修费用',
  rt: 7,
  xe: "What does it really cost to renovate a bathtub in Vancouver? A like-for-like acrylic alcove swap runs $800–$2,200 installed; a cast-iron or drop-in tub with a tiled surround runs $2,500–$5,500; a freestanding statement tub with new plumbing supply lines hits $5,000–$8,500+. Tub-to-shower conversions are the biggest single decision and typically cost $4,000–$10,000. Here's the real breakdown from our recent Metro Vancouver bathroom projects.",
  xz: '在温哥华装修一个浴缸真实费用是多少？等量替换亚克力嵌入式浴缸$800–$2,200安装价；铸铁或嵌入式浴缸配瓷砖围裙$2,500–$5,500；独立式造型浴缸+新供水管线达$5,000–$8,500+。浴缸改淋浴是最大的单项决策，通常$4,000–$10,000。以下是我们大温地区近期浴室项目的真实数据。',
  ce: `<article>
<h1>Bathtub Renovation Cost Vancouver 2026: $800 to $8,500+ Real Pricing</h1>

<p class="lead">A bathtub is the single biggest fixture decision in any bathroom renovation — the wrong call costs you $3,000+ and weeks of regret. Like-for-like alcove swaps stay cheap; freestanding tubs and tub-to-shower conversions are the budget-killers. Here's what bathtub work actually costs in Metro Vancouver in 2026, broken down by tier and based on real Reno Stars project data.</p>

<h2>Quick price summary</h2>
<table>
<thead><tr><th>Scope</th><th>Vancouver installed cost</th><th>Lead time</th><th>Best for</th></tr></thead>
<tbody>
<tr><td>Acrylic alcove like-for-like swap</td><td>$800 – $2,200</td><td>2–4 days</td><td>Rental units, secondary baths, fast refresh</td></tr>
<tr><td>Cast iron / steel alcove swap</td><td>$1,500 – $3,500</td><td>3–5 days</td><td>Long-term home baths, heat retention</td></tr>
<tr><td>Drop-in tub + new tile surround</td><td>$2,500 – $5,500</td><td>1–2 wks</td><td>Master ensuites with custom surround</td></tr>
<tr><td>Freestanding tub (new plumbing)</td><td>$3,500 – $7,500</td><td>1–2 wks</td><td>Statement ensuites, hardwood-floor adjacent</td></tr>
<tr><td>Freestanding + designer plumbing</td><td>$5,000 – $8,500+</td><td>2–3 wks</td><td>Luxury master ensuites, copper supply lines</td></tr>
<tr><td>Tub-to-shower conversion</td><td>$4,000 – $10,000</td><td>1–2 wks</td><td>Aging-in-place, single-bath households who never bathe</td></tr>
</tbody>
</table>
<p><em>Prices are installed and include the tub itself, drain/overflow assembly, supply lines from existing rough-in, the basic surround (alcove tile or apron skirt), and disposal of the old fixture. Tub-fillers, body sprays, separate handheld units, and structural floor reinforcement are billed separately.</em></p>

<h2>What drives the price</h2>

<h3>1. Tub material + format (40–60% of total)</h3>
<p>The tub itself anchors the price. Material and format options we install most:</p>
<ul>
<li><strong>Acrylic alcove (60" standard):</strong> $300–$700 fixture. Light, warm to the touch, easy to install, prone to flexing under heavy bathers, cosmetic chip repair is straightforward.</li>
<li><strong>Cast iron alcove or drop-in:</strong> $700–$1,800 fixture. Heaviest option (~300 lbs+), retains heat the longest, requires reinforced subfloor on second-floor bathrooms, lasts 50+ years if the enamel isn't cracked.</li>
<li><strong>Drop-in soaking tub:</strong> $800–$2,500 fixture. Built into a tile or quartz surround, deeper than alcove tubs, the surround itself often costs more than the tub.</li>
<li><strong>Freestanding acrylic:</strong> $1,000–$3,500 fixture. The cheapest path to the freestanding look — light, easy to move into upper-floor ensuites without structural work.</li>
<li><strong>Freestanding cast iron / stone resin / copper:</strong> $2,500–$8,000+ fixture. Heavy, gorgeous, generally needs floor reinforcement on anything but slab-on-grade or main-floor installs.</li>
</ul>

<h3>2. Plumbing rough-in changes ($600–$3,000 add)</h3>
<p>If the existing drain rough-in is in the same spot as the new tub, no extra cost. The cost climbs based on how far the drain has to move:</p>
<ul>
<li><strong>Same wall, drain shifts 6"–12":</strong> $600–$1,200 (cut subfloor, re-glue ABS, re-vent if required by inspection)</li>
<li><strong>Drain shifts to a different wall:</strong> $1,500–$2,500 (joist work, longer venting run)</li>
<li><strong>Concrete-floor condo, drain has to be cored:</strong> $2,500–$4,000+ (strata approval, concrete coring, water-management seal)</li>
<li><strong>Adding a freestanding tub with no existing rough-in:</strong> $2,000–$3,500 (floor-mounted supply lines, P-trap chase, sometimes dropped ceiling below)</li>
</ul>

<h3>3. Surround / wall finish (10–25%)</h3>
<p>Alcove tubs need three walls of waterproof finish. Drop-ins need a built surround (tile-clad apron + deck). Freestanding tubs technically need nothing, but most homeowners still tile the splash zone behind the faucet:</p>
<ul>
<li><strong>Acrylic surround panels:</strong> $400–$900 installed (rental-grade, sealed in 1 day)</li>
<li><strong>Tiled alcove surround (3 walls, basic ceramic):</strong> $1,200–$2,500 installed</li>
<li><strong>Tiled drop-in surround + floor (porcelain or stone):</strong> $2,000–$5,000 installed</li>
<li><strong>Marble or natural stone surround:</strong> $4,000–$10,000+ installed</li>
</ul>

<h3>4. Tub filler / faucet ($200–$2,500 add)</h3>
<p>Wall-mount tub spouts run $80–$400. Deck-mount fillers (drop-in tubs) run $200–$700. Floor-mount fillers for freestanding tubs run $500–$2,500 depending on finish — a designer-grade matte black or unlacquered brass floor-mount filler with thermostatic and handheld is the single most-expensive faucet category we install.</p>

<h3>5. Floor reinforcement ($300–$1,500 add when needed)</h3>
<p>A cast-iron or stone-resin freestanding tub on a second-floor wood-frame bathroom usually requires reinforcing the joist span. Engineering letter + sistered joists or LVL upgrade adds $300–$1,500. Cast-iron alcove tubs in mid-century single-family homes built between 1945 and 1975 often go in without issue because the joists were already over-spec'd — but always confirm via a load calc.</p>

<h2>Where Vancouver homeowners overspend</h2>
<ol>
<li><strong>Buying a freestanding cast-iron tub for a second-floor ensuite without checking the joists.</strong> The fixture arrives, the floor needs reinforcing, the schedule slips two weeks and adds $1,500. Always confirm structural before ordering anything over 200 lbs dry weight.</li>
<li><strong>Tub-to-shower conversion in a 1-bathroom condo.</strong> If the unit only has one full bath, removing the only tub hurts resale by $5,000–$15,000 in Metro Vancouver — most family buyers want at least one tub for kids, infants, or future-proofing. The exception is studio/1-bed condos targeted at single buyers who never bathe.</li>
<li><strong>Skipping the access panel during alcove tile-in.</strong> A $200 access panel on the wet-wall side saves a $2,500 tile demo if a supply line ever leaks. Always include behind any tub with a wall-mount filler.</li>
</ol>

<h2>Where homeowners under-spec</h2>
<ol>
<li><strong>Going with a 60" alcove when the bathroom would fit a 66" or 72".</strong> An extra 6"–12" of tub length is the single most-loved upgrade in family bathrooms — adults can actually lie down. Confirm wall-to-wall measurements before defaulting to the 60" spec.</li>
<li><strong>Acrylic surround panels in a forever-home master bath.</strong> Acrylic looks fine for the first three years; tile lasts 30+. If you're staying, tile the surround.</li>
<li><strong>Forgetting the handheld shower in a tub-only setup.</strong> A $100–$200 add for a slide-bar handheld pays back at every kid bath, dog wash, and tub cleaning.</li>
</ol>

<h2>Real Vancouver bathtub costs from recent projects</h2>
<ul>
<li><strong>Coquitlam standard bathroom, alcove tub-to-shower conversion:</strong> $14,000–$17,000 total bath, of which the conversion alone (custom glass, tiled curb, linear drain) ran $7,500. Project: <a href="/en/projects/coquitlam-standard-bathroom-renovation-shower-conversion/">Coquitlam shower conversion</a></li>
<li><strong>Richmond minimalist bathroom, drop-in soaking tub + tiled surround:</strong> $15,000–$18,000 total, drop-in tub + porcelain surround portion was ~$5,200</li>
<li><strong>Maple Ridge bathroom with custom glass, freestanding acrylic:</strong> $18,000–$21,000 total, freestanding tub portion ran ~$3,800 including new supply lines</li>
<li><strong>Burnaby townhouse two-bath reno, alcove tub swap (kids bath) + tub-to-shower (master):</strong> $26,000–$30,000 total — alcove swap was $1,800, master conversion was $9,000</li>
<li><strong>West Vancouver luxury ensuite, freestanding cast iron + designer floor-mount filler:</strong> tub + filler portion alone was $7,200 (fixture $3,800, plumbing rough-in $1,400, designer filler $2,000)</li>
</ul>

<h2>Tub-to-shower conversion: when it makes sense</h2>
<p>This is the most-asked bathtub question we get. The honest answer:</p>
<ul>
<li><strong>YES if:</strong> your home has at least one other tub, you're 50+ and planning to age in place, the household members never use the existing tub, OR you're swapping a non-functional whirlpool/jetted tub for a wet zone you'll actually use.</li>
<li><strong>NO if:</strong> this is your only full bath in the home, you have or are planning to have young kids, OR resale within 3 years is on the table — Metro Vancouver buyers expect at least one tub.</li>
</ul>
<p>A proper conversion (curbless or low-curb tile shower with a linear drain, frameless glass, niche, and a bench) runs $6,000–$10,000 in Metro Vancouver. A budget conversion using prefab acrylic panels can be done for $4,000–$5,500 but looks like a budget conversion forever.</p>

<h2>How to budget your bathtub work</h2>
<ol>
<li><strong>Decide tub vs no-tub first.</strong> Every other decision flows from this.</li>
<li><strong>Confirm structural before picking a heavy material.</strong> Cast iron and stone resin require a joist check on second-floor wood-frame homes.</li>
<li><strong>Check the existing drain rough-in location.</strong> Same-spot drain = lowest cost; cross-room drain = $1,500–$3,000 added.</li>
<li><strong>Budget the surround separately.</strong> The tub itself is often the cheapest part — surround can cost 2–3× the tub.</li>
<li><strong>Add 15% contingency.</strong> Pre-1980 Vancouver homes routinely surface galvanized supply lines, lead solder, or rotted subfloor when the old tub comes out.</li>
</ol>

<h2>Related cost guides</h2>
<ul>
<li><a href="/en/guides/bathroom-renovation-cost-vancouver/">Bathroom Renovation Cost Vancouver: $10K–$60K Real Data</a> — the parent guide for full bathroom cost</li>
<li><a href="/en/blog/vanity-renovation-cost-vancouver/">Vanity Renovation Cost Vancouver: $700–$7,200+</a> — same depth on bathroom vanities</li>
<li><a href="/en/services/bathroom/">Bathroom Renovation Services</a> — what we do, how we work</li>
</ul>

<p>Want a real quote on your bathtub work? Send us your bathroom dimensions and what you have today and we'll come back within 48 hours with three priced options across the tiers above. <a href="/en/contact/">Get a free in-home consultation</a>.</p>
</article>`,
  cz: `<article>
<h1>温哥华浴缸装修费用 2026：$800–$8,500+ 真实数据</h1>

<p class="lead">浴缸是浴室装修中最大的单项决策——选错可能多花$3,000以上还要后悔好几周。等量替换嵌入式亚克力浴缸最便宜；独立式浴缸和浴缸改淋浴是预算杀手。本文基于Reno Stars近期真实项目数据，分层展示温哥华2026年浴缸装修的真实费用。</p>

<h2>价格速查表</h2>
<table>
<thead><tr><th>方案</th><th>温哥华安装价</th><th>工期</th><th>最适合</th></tr></thead>
<tbody>
<tr><td>亚克力嵌入式等量替换</td><td>$800 – $2,200</td><td>2–4天</td><td>出租房、次卫、快速翻新</td></tr>
<tr><td>铸铁/钢制嵌入式更换</td><td>$1,500 – $3,500</td><td>3–5天</td><td>长期自住、需保温</td></tr>
<tr><td>嵌入式浴缸+新瓷砖围裙</td><td>$2,500 – $5,500</td><td>1–2周</td><td>主卫定制围裙</td></tr>
<tr><td>独立式浴缸（含新管道）</td><td>$3,500 – $7,500</td><td>1–2周</td><td>造型主卫、与木地板相邻</td></tr>
<tr><td>独立式+设计师龙头</td><td>$5,000 – $8,500+</td><td>2–3周</td><td>豪华主卫、铜质供水管</td></tr>
<tr><td>浴缸改淋浴</td><td>$4,000 – $10,000</td><td>1–2周</td><td>老龄无障碍、单卫从不泡澡</td></tr>
</tbody>
</table>
<p><em>价格为安装到位价，含浴缸本体、下水/溢流组件、自现有点位接出的供水管、基础围裙（嵌入式瓷砖或独立式裙边）以及旧件清运。落地龙头、侧喷、独立手持花洒、楼板加固另计。</em></p>

<h2>什么决定了价格</h2>

<h3>1. 浴缸材质+形态（占总价 40–60%）</h3>
<p>浴缸本身定下基价。我们最常装的材质和形态：</p>
<ul>
<li><strong>亚克力嵌入式（60"标准款）：</strong>本体$300–$700。轻、触感温暖、易装、重负载下会形变、表面磕碰修复简单。</li>
<li><strong>铸铁嵌入式或下沉式：</strong>本体$700–$1,800。最重（300磅+）、保温最久、二楼浴室需要楼板加固、釉面不裂可用50年以上。</li>
<li><strong>下沉式深泡浴缸：</strong>本体$800–$2,500。装入瓷砖或石英围裙，比嵌入式深，围裙本身常常比浴缸还贵。</li>
<li><strong>独立式亚克力：</strong>本体$1,000–$3,500。实现独立式造型最便宜的路径——轻便、易搬上楼、二楼装无需结构加固。</li>
<li><strong>独立式铸铁/树脂石/铜：</strong>本体$2,500–$8,000+。重、漂亮，除底层水泥地外通常都需要楼板加固。</li>
</ul>

<h3>2. 管道点位改造（$600–$3,000附加）</h3>
<p>如果现有下水点位与新浴缸对齐，无附加费。否则按搬移距离加费：</p>
<ul>
<li><strong>同墙下水偏移6"–12"：</strong>$600–$1,200（开楼板、ABS重粘、按需加通气）</li>
<li><strong>下水搬到不同墙：</strong>$1,500–$2,500（动龙骨、加长通气管）</li>
<li><strong>水泥楼板公寓需开槽：</strong>$2,500–$4,000+（业主立案审批、混凝土取芯、防水密封）</li>
<li><strong>新增独立式浴缸但无现成点位：</strong>$2,000–$3,500（地面供水管、P弯封槽、有时需吊下层顶）</li>
</ul>

<h3>3. 围裙/墙面饰面（10–25%）</h3>
<p>嵌入式浴缸需要三面防水墙。下沉式需要砌筑围裙（瓷砖裙+台面）。独立式技术上不需要任何围裙，但大多数业主仍会在龙头后水溅区贴砖：</p>
<ul>
<li><strong>亚克力围裙板：</strong>$400–$900安装价（出租房等级，1天密封）</li>
<li><strong>瓷砖嵌入式围裙（三面、基础陶瓷）：</strong>$1,200–$2,500安装价</li>
<li><strong>瓷砖下沉式围裙+地面（瓷化或天然石）：</strong>$2,000–$5,000安装价</li>
<li><strong>大理石或天然石围裙：</strong>$4,000–$10,000+安装价</li>
</ul>

<h3>4. 浴缸龙头（$200–$2,500附加）</h3>
<p>墙挂出水嘴$80–$400。下沉式台面龙头$200–$700。独立式落地龙头$500–$2,500，看款式——设计师款哑光黑或无漆黄铜+恒温+手持的落地龙头是我们装过最贵的龙头类别。</p>

<h3>5. 楼板加固（按需$300–$1,500附加）</h3>
<p>二楼木结构浴室装铸铁或树脂石独立式浴缸通常需要加固龙骨跨度。结构师函+并梁或LVL升级加$300–$1,500。1945–1975年间建的世纪中独立屋装铸铁嵌入式浴缸通常无碍，因为当年龙骨规格本来就足——但仍要先做荷载计算确认。</p>

<h2>温哥华业主常见超支</h2>
<ol>
<li><strong>二楼主卫装铸铁独立式浴缸却没查龙骨。</strong>浴缸到货才发现楼板要加固，工期延后两周加$1,500。重量>200磅的浴缸下单前一定先确认结构。</li>
<li><strong>单卫公寓做浴缸改淋浴。</strong>整个单元只有一个全卫时，去掉唯一浴缸会让大温地区转售价跌$5,000–$15,000——大多数家庭买家至少要保留一个浴缸给小孩、婴儿或未来用途。例外：单身买家定位的开间/1卧公寓且业主从不泡澡。</li>
<li><strong>嵌入式浴缸贴砖时省了检修口。</strong>湿区墙侧$200的检修口可以省下未来供水管漏水时$2,500的拆砖费。墙挂龙头浴缸后必装。</li>
</ol>

<h2>常见低规格陷阱</h2>
<ol>
<li><strong>浴室明明能装66"或72"却选了60"。</strong>多6"–12"的浴缸长度是家庭浴室最受欢迎的升级——成人能真正躺平。下单60"前先量好墙到墙尺寸。</li>
<li><strong>永居自住主卫用亚克力围裙板。</strong>亚克力前三年看着OK，瓷砖能用30年以上。如果不卖，主卫一定贴砖。</li>
<li><strong>浴缸单装却忘了手持花洒。</strong>$100–$200加项，每次给小孩洗澡、给狗洗澡、清洗浴缸都用得上。</li>
</ol>

<h2>温哥华近期项目真实浴缸费用</h2>
<ul>
<li><strong>高贵林标准浴室，嵌入式浴缸改淋浴：</strong>整体$14,000–$17,000，仅改淋浴部分（定制玻璃、瓷砖挡水、线性地漏）$7,500。项目：<a href="/zh/projects/coquitlam-standard-bathroom-renovation-shower-conversion/">高贵林浴改淋项目</a></li>
<li><strong>列治文极简浴室，下沉式深泡缸+瓷砖围裙：</strong>整体$15,000–$18,000，下沉缸+瓷化围裙部分约$5,200</li>
<li><strong>枫树岭浴室带定制玻璃，独立式亚克力浴缸：</strong>整体$18,000–$21,000，独立浴缸部分约$3,800（含新供水管）</li>
<li><strong>本拿比联排两卫装修，嵌入式浴缸更换（儿童卫）+浴改淋（主卫）：</strong>整体$26,000–$30,000——更换部分$1,800，主卫改淋$9,000</li>
<li><strong>西温奢华主卫，铸铁独立式+设计师落地龙头：</strong>仅浴缸+龙头部分$7,200（本体$3,800、管道点位$1,400、设计师龙头$2,000）</li>
</ul>

<h2>浴缸改淋浴：什么时候值得做</h2>
<p>这是我们被问最多的浴缸问题。诚实答案：</p>
<ul>
<li><strong>值得做的情况：</strong>家里至少还有一个浴缸；50岁以上准备就地养老；家里没人用现有浴缸；或者要替换从不用的按摩缸/水疗缸。</li>
<li><strong>不要做的情况：</strong>这是家里唯一的全卫；有或计划要小孩；3年内可能转售——大温地区买家期望至少一个浴缸。</li>
</ul>
<p>合规的改造（无门槛或低门槛瓷砖淋浴+线性地漏+无框玻璃+壁龛+座椅）大温地区$6,000–$10,000。预算款用预制亚克力板可做到$4,000–$5,500但永远看着像预算款。</p>

<h2>浴缸预算规划</h2>
<ol>
<li><strong>先决定要不要浴缸。</strong>所有其他决策都从这里出发。</li>
<li><strong>选重材质前先确认结构。</strong>铸铁和树脂石在二楼木结构浴室需查龙骨。</li>
<li><strong>查一下现有下水点位。</strong>同点位=最低费；跨房间下水=加$1,500–$3,000。</li>
<li><strong>围裙单独列预算。</strong>浴缸本体常常是最便宜的部分——围裙能贵2–3倍。</li>
<li><strong>预留15%应急款。</strong>1980年前的温哥华老房子拆掉旧浴缸后常常露出镀锌供水管、铅焊点或腐烂的楼板。</li>
</ol>

<h2>相关费用指南</h2>
<ul>
<li><a href="/zh/guides/bathroom-renovation-cost-vancouver/">温哥华浴室装修费用：$10K–$60K真实数据</a> — 完整浴室费用的母指南</li>
<li><a href="/zh/blog/vanity-renovation-cost-vancouver/">温哥华梳妆台装修费用：$700–$7,200+</a> — 同样深度的浴室梳妆台</li>
<li><a href="/zh/services/bathroom/">浴室装修服务</a> — 我们的工作内容和流程</li>
</ul>

<p>想要浴缸真实报价？把您的浴室尺寸和现状发给我们，48小时内给您三档分价方案。<a href="/zh/contact/">免费上门咨询</a>。</p>
</article>`,
};

async function run() {
  const vals = [
    post.slug, post.te, post.tz, post.xe, post.xz, post.ce, post.cz,
    post.me, post.mz, post.de, post.dz, post.fe, post.fz, post.rt,
    'Reno Stars Team', true,
    new Date().toISOString(), new Date().toISOString(), new Date().toISOString(),
  ];
  const ph = vals.map((_: unknown, i: number) => '$' + (i + 1)).join(',');
  // UPDATE on conflict: a bathtub-cost post existed since 2026-04-17 (refinishing-vs-
  // replacement angle, pos 9.66 with 0 clicks on 386 imp). Replacing with the tier-by-
  // format breakdown above — same URL, refreshed content, keeps the page's index trust.
  const sql =
    'INSERT INTO blog_posts (slug,title_en,title_zh,excerpt_en,excerpt_zh,content_en,content_zh,meta_title_en,meta_title_zh,meta_description_en,meta_description_zh,focus_keyword_en,focus_keyword_zh,reading_time_minutes,author,is_published,published_at,created_at,updated_at) VALUES (' +
    ph +
    ') ON CONFLICT (slug) DO UPDATE SET title_en = EXCLUDED.title_en, title_zh = EXCLUDED.title_zh, excerpt_en = EXCLUDED.excerpt_en, excerpt_zh = EXCLUDED.excerpt_zh, content_en = EXCLUDED.content_en, content_zh = EXCLUDED.content_zh, meta_title_en = EXCLUDED.meta_title_en, meta_title_zh = EXCLUDED.meta_title_zh, meta_description_en = EXCLUDED.meta_description_en, meta_description_zh = EXCLUDED.meta_description_zh, focus_keyword_en = EXCLUDED.focus_keyword_en, focus_keyword_zh = EXCLUDED.focus_keyword_zh, reading_time_minutes = EXCLUDED.reading_time_minutes, updated_at = EXCLUDED.updated_at RETURNING id,slug';
  const r = await pool.query(sql, vals);
  console.log(r.rows.length ? 'Upserted: ' + r.rows[0].slug : 'No-op: ' + post.slug);
  await pool.end();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
