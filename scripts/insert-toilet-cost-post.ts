import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const post = {
  slug: 'toilet-renovation-cost-vancouver',
  te: 'Toilet Renovation Cost Vancouver 2026: $400 to $8,500+ Real Pricing',
  tz: '温哥华马桶装修费用 2026：$400–$8,500+ 真实数据',
  me: 'Toilet Renovation Cost Vancouver 2026 | $400–$8,500+ | Reno Stars',
  mz: '温哥华马桶装修费用 2026 | $400–$8,500+ | Reno Stars',
  de: "Vancouver toilet renovation cost: $400 (basic two-piece swap) to $8,500+ (wall-hung with in-wall tank). Real tier breakdown + smart toilet wiring extras.",
  dz: '温哥华马桶装修费用：$400（基础两件式更换）至$8,500+（壁挂入墙水箱）。真实分层数据+智能马桶电路附加。',
  fe: 'toilet renovation cost',
  fz: '温哥华马桶装修费用',
  rt: 6,
  xe: "What does it really cost to renovate a toilet in Vancouver? A like-for-like two-piece swap runs $400–$900 installed; a one-piece elongated runs $650–$1,500; a smart bidet toilet (with the GFCI outlet and supply line work it requires) runs $1,300–$4,500; a wall-hung toilet with in-wall tank carrier runs $3,000–$8,500+. Here's the real breakdown from our recent Metro Vancouver bathroom projects.",
  xz: '在温哥华装修一个马桶真实费用是多少？等量替换两件式$400–$900安装价；一体式分体马桶$650–$1,500；智能净身马桶（含必要的GFCI插座+供水管改造）$1,300–$4,500；壁挂入墙水箱$3,000–$8,500+。以下是我们大温地区近期浴室项目的真实数据。',
  ce: `<article>
<h1>Toilet Renovation Cost Vancouver 2026: $400 to $8,500+ Real Pricing</h1>

<p class="lead">A toilet swap is the cheapest plumbing fixture decision in your bathroom — until you start adding smart features, wall-hung carriers, or bidet wiring. Then it becomes one of the most expensive. Here's what toilet renovation actually costs in Metro Vancouver in 2026, broken down by tier and based on real Reno Stars project data.</p>

<h2>Quick price summary</h2>
<table>
<thead><tr><th>Scope</th><th>Vancouver installed cost</th><th>Lead time</th><th>Best for</th></tr></thead>
<tbody>
<tr><td>Basic two-piece swap</td><td>$400 – $900</td><td>1–2 hrs</td><td>Rentals, secondary baths, fast refresh</td></tr>
<tr><td>One-piece elongated comfort-height</td><td>$650 – $1,500</td><td>2–3 hrs</td><td>Most family-home renovations</td></tr>
<tr><td>Skirted one-piece + soft-close seat</td><td>$900 – $2,000</td><td>2–4 hrs</td><td>Modern look, easier cleaning, master ensuites</td></tr>
<tr><td>Smart / bidet toilet (Toto, Kohler Numi)</td><td>$1,300 – $4,500</td><td>3–6 hrs</td><td>Aging-in-place, hygiene-focused, master ensuites</td></tr>
<tr><td>Wall-hung + in-wall tank carrier</td><td>$3,000 – $8,500+</td><td>1–2 days</td><td>Luxury master ensuites, small powder rooms reclaiming floor space</td></tr>
</tbody>
</table>
<p><em>Prices are installed and include the toilet itself, new wax ring or rubber gasket, supply line, shutoff valve replacement (if needed), and disposal of the old fixture. Flange repair, subfloor patches, GFCI outlet work for smart toilets, and structural work for wall-hung carriers are billed separately.</em></p>

<h2>What drives the price</h2>

<h3>1. Toilet itself (50–80% of total)</h3>
<p>The fixture price is the biggest driver. Categories we install most:</p>
<ul>
<li><strong>Basic two-piece (Glacier Bay, American Standard Champion):</strong> $200–$500 fixture. Tank bolted on top of bowl, the cheapest path. Works fine for rentals and secondary bathrooms.</li>
<li><strong>One-piece elongated comfort-height:</strong> $400–$1,000 fixture. Fully integrated tank/bowl, no seam to clean, comfort-height (17"–19") matches modern preference. The default choice for most renos.</li>
<li><strong>Skirted one-piece (Toto Aquia, Kohler Veil):</strong> $700–$1,800 fixture. Smooth flat sides hide the trapway — much easier to clean, more designer look.</li>
<li><strong>Smart / bidet toilet (Toto Washlet, Kohler Numi):</strong> $800–$3,500+ fixture. Heated seat, integrated bidet wand, deodorizer, auto-flush, ambient light. Toto S550e is the household standard at ~$1,200; Kohler Numi 2.0 hits $7,000+ at the top end.</li>
<li><strong>Wall-hung bowl (Geberit, TOTO wall-hung):</strong> $400–$1,500 for the bowl alone, plus $400–$1,200 for the in-wall tank carrier. Total fixture cost runs $800–$2,700 before installation.</li>
</ul>

<h3>2. Installation labour ($200–$1,500)</h3>
<p>Installation cost scales with complexity:</p>
<ul>
<li><strong>Like-for-like two-piece swap:</strong> $200–$400 (~1–2 hrs of plumber time, no flange work)</li>
<li><strong>One-piece swap with new shutoff + supply line:</strong> $300–$500</li>
<li><strong>Smart toilet swap requiring GFCI outlet:</strong> $500–$1,000 (electrician adds $250–$500 for GFCI install, plumber does the rest)</li>
<li><strong>Wall-hung install with in-wall tank carrier:</strong> $1,000–$2,500 labour (frame the wall, set the carrier, drywall + tile around it, bowl mount last)</li>
<li><strong>Drain relocation (toilet moves more than 12"):</strong> $800–$2,500 added (cut subfloor, re-glue ABS, new closet flange, sometimes new vent)</li>
</ul>

<h3>3. Flange + subfloor work ($150–$1,200 add when needed)</h3>
<p>The closet flange (the plastic or brass ring sealing the toilet to the drain pipe) often cracks during a swap or is already cracked from a previous install. Replacement runs $150–$300. Pre-1990 Vancouver homes routinely surface rotted subfloor under the toilet from a slow leak — patching the subfloor adds $300–$1,200 depending on rot extent. Always budget for this on any home older than 30 years.</p>

<h3>4. Smart-toilet electrical ($250–$700 add)</h3>
<p>Every smart/bidet toilet needs a GFCI outlet within 36" of the unit. If one doesn't exist (most Vancouver homes built before 2010 don't have one behind the toilet), an electrician runs new wire from the nearest source. Cost depends on wall access:</p>
<ul>
<li><strong>Wall is open (during a renovation):</strong> $250–$400</li>
<li><strong>Surface-mount conduit (ugly but cheap):</strong> $250–$400</li>
<li><strong>Fish wire through finished wall:</strong> $400–$700</li>
<li><strong>Concrete-floor condo with no nearby outlet:</strong> $600–$1,200</li>
</ul>

<h3>5. Wall-hung carrier + structural ($600–$3,000 add)</h3>
<p>A wall-hung toilet is gorgeous and frees ~9"–12" of floor space — but the in-wall tank requires a structural carrier (Geberit Duofix or equivalent) anchored to studs and the floor plate. Costs added beyond the carrier itself:</p>
<ul>
<li><strong>2x6 wall framing required (carrier won't fit in 2x4):</strong> $600–$1,200 if walls are open, $1,500–$3,000 if walls are finished and need to be opened</li>
<li><strong>Drywall + tile work to close the wall around the carrier:</strong> $400–$1,200 depending on tile complexity</li>
<li><strong>Engineered floor reinforcement on second-floor wood-frame:</strong> $300–$800 if joists need sistering</li>
</ul>

<h2>Where Vancouver homeowners overspend</h2>
<ol>
<li><strong>Buying a Kohler Numi 2.0 ($7,000+) for a secondary bathroom.</strong> The Numi is incredible but its features (motion-activated lid, ambient lighting, voice control) are wasted in a guest bath used 2× per month. Specify a Toto S550e ($1,200) for any non-primary bath; reserve the flagship for the master.</li>
<li><strong>Wall-hung toilet in a small powder room without 2x6 walls.</strong> Opening up a finished 2x4 wall to add 2x6 framing for a Geberit carrier turns a $2,500 powder room toilet into a $5,500 mini-renovation. Confirm wall depth before committing to wall-hung.</li>
<li><strong>Smart toilet with no GFCI outlet planned.</strong> The bidet seat needs power. We've seen homeowners install a $2,500 Toto Washlet only to discover there's no outlet — surface-mount conduit follows, and the install ends up looking like an afterthought. Plan the outlet during demo, not after.</li>
</ol>

<h2>Where homeowners under-spec</h2>
<ol>
<li><strong>Choosing a 16" standard-height bowl in a forever home.</strong> Comfort-height (17"–19") is the modern default for a reason — knees of every age appreciate it. The $50–$100 upgrade is among the most-loved on a 20-year hold.</li>
<li><strong>Skipping the soft-close seat.</strong> A $50–$100 add eliminates slamming for the life of the toilet. Always include in the spec.</li>
<li><strong>Forgetting the bidet attachment on a non-smart toilet.</strong> Even if the budget doesn't cover a Toto Washlet, a $50–$100 mechanical bidet attachment (no electrical needed) gets 80% of the function. The Tushy Classic is the go-to.</li>
</ol>

<h2>Real Vancouver toilet costs from recent projects</h2>
<ul>
<li><strong>Yaletown rental refresh, basic two-piece swap:</strong> $450 installed (Glacier Bay round-front 2-piece, new shutoff + supply line)</li>
<li><strong>Burnaby SFH master ensuite, Toto Aquia skirted one-piece:</strong> $1,400 installed (toilet $850, install $300, new flange $150, new shutoff $50)</li>
<li><strong>Coquitlam standard bath, Toto Washlet S550e on existing one-piece:</strong> $1,650 installed (Washlet $1,150, GFCI outlet $400 fish-through finished wall, install $100). Project: <a href="/en/projects/coquitlam-standard-bathroom-renovation-shower-conversion/">Coquitlam bathroom</a></li>
<li><strong>Maple Ridge bathroom, full Toto S550e smart toilet (one-piece + integrated bidet seat):</strong> $2,800 installed during a full bath reno (toilet $2,200, GFCI outlet during open-wall demo $250, install $350)</li>
<li><strong>West Vancouver luxury ensuite, wall-hung Toto + Geberit Duofix carrier:</strong> $5,400 installed (carrier $1,200, wall-hung bowl $1,800, Toto Washlet $1,200, framing + drywall + tile around carrier $1,000, plumber labour $200)</li>
</ul>

<h2>Smart vs basic: how to decide</h2>
<p>The smart toilet question is almost always about household priorities, not budget. Quick filter:</p>
<ul>
<li><strong>Basic two-piece is fine if:</strong> rental property, secondary bath used &lt; 5×/week, or you simply don't enjoy bidet features.</li>
<li><strong>One-piece comfort-height is the default if:</strong> primary bath, family home, want the cleaner look without smart-feature complexity.</li>
<li><strong>Smart / bidet toilet pays back if:</strong> primary master ensuite, household members 50+ planning to age in place, hygiene-focused household, OR resale-positioning a luxury home (smart toilets read "premium" to most Metro Vancouver buyers).</li>
<li><strong>Wall-hung is worth it if:</strong> small powder room where the floor space matters, OR full-gut master ensuite where the modern look is non-negotiable. Otherwise the cost premium isn't proportional to the benefit.</li>
</ul>

<h2>How to budget your toilet work</h2>
<ol>
<li><strong>Decide tier first (basic / one-piece / smart / wall-hung).</strong> Each tier shifts the labour budget downstream.</li>
<li><strong>Confirm GFCI outlet exists if going smart.</strong> If not, get the electrician quote before committing to a smart toilet.</li>
<li><strong>Confirm 2x6 walls if going wall-hung.</strong> Standard 2x4 walls won't accept a Geberit Duofix carrier.</li>
<li><strong>Budget $300 contingency for flange + subfloor surprises.</strong> Pre-1990 Vancouver homes routinely surface rotted subfloor when the old toilet comes out.</li>
<li><strong>Order 2 weeks ahead for smart toilets.</strong> Toto Washlets ship from supplier warehouses — backorders extend lead time.</li>
</ol>

<h2>Related cost guides</h2>
<ul>
<li><a href="/en/guides/bathroom-renovation-cost-vancouver/">Bathroom Renovation Cost Vancouver: $10K–$60K Real Data</a> — the parent guide for full bathroom cost</li>
<li><a href="/en/blog/bathtub-renovation-cost-vancouver/">Bathtub Renovation Cost Vancouver: $800–$8,500+</a> — same depth on bathtubs</li>
<li><a href="/en/blog/vanity-renovation-cost-vancouver/">Vanity Renovation Cost Vancouver: $700–$7,200+</a> — same depth on bathroom vanities</li>
<li><a href="/en/services/bathroom/">Bathroom Renovation Services</a> — what we do, how we work</li>
</ul>

<p>Want a real quote on your toilet work? Send us a photo of the existing setup and what you're considering, and we'll come back within 48 hours with three priced options across the tiers above. <a href="/en/contact/">Get a free in-home consultation</a>.</p>
</article>`,
  cz: `<article>
<h1>温哥华马桶装修费用 2026：$400–$8,500+ 真实数据</h1>

<p class="lead">马桶更换是浴室里最便宜的洁具决策——直到加上智能功能、壁挂入墙水箱或净身电路。然后它就变成最贵的之一。本文基于Reno Stars近期真实项目数据，分层展示温哥华2026年马桶装修的真实费用。</p>

<h2>价格速查表</h2>
<table>
<thead><tr><th>方案</th><th>温哥华安装价</th><th>工期</th><th>最适合</th></tr></thead>
<tbody>
<tr><td>基础两件式更换</td><td>$400 – $900</td><td>1–2小时</td><td>出租房、次卫、快速翻新</td></tr>
<tr><td>一体式长款舒适高度</td><td>$650 – $1,500</td><td>2–3小时</td><td>大多数家庭装修</td></tr>
<tr><td>无裙边一体式+缓降盖</td><td>$900 – $2,000</td><td>2–4小时</td><td>现代风、易清洁、主卫</td></tr>
<tr><td>智能/净身马桶（Toto、Kohler Numi）</td><td>$1,300 – $4,500</td><td>3–6小时</td><td>老龄无障碍、卫生需求高、主卫</td></tr>
<tr><td>壁挂+入墙水箱</td><td>$3,000 – $8,500+</td><td>1–2天</td><td>豪华主卫、需腾出地面空间的小客卫</td></tr>
</tbody>
</table>
<p><em>价格为安装到位价，含马桶本体、新法兰垫圈或橡胶圈、供水管、（如需）新角阀及旧件清运。法兰修复、楼板补丁、智能马桶GFCI插座电路工作、壁挂支架结构工作另计。</em></p>

<h2>什么决定了价格</h2>

<h3>1. 马桶本身（占总价 50–80%）</h3>
<p>洁具价格是最大驱动。我们最常装的类别：</p>
<ul>
<li><strong>基础两件式（Glacier Bay、American Standard Champion）：</strong>本体$200–$500。水箱螺栓装在马桶上，最便宜路径。出租房和次卫够用。</li>
<li><strong>一体式长款舒适高度：</strong>本体$400–$1,000。水箱与坐圈一体，无接缝清洁，舒适高度（17"–19"）符合现代偏好。大多数装修的默认选择。</li>
<li><strong>无裙边一体式（Toto Aquia、Kohler Veil）：</strong>本体$700–$1,800。光滑平面侧边遮住存水弯，清洁更轻松，外观更设计。</li>
<li><strong>智能/净身马桶（Toto Washlet、Kohler Numi）：</strong>本体$800–$3,500+。加热坐圈、内嵌净身臂、除臭、自动冲、环境光。Toto S550e是家用标杆约$1,200；Kohler Numi 2.0顶配$7,000+。</li>
<li><strong>壁挂坐便（Geberit、TOTO壁挂）：</strong>仅坐便$400–$1,500，加上入墙水箱支架$400–$1,200。安装前总洁具成本$800–$2,700。</li>
</ul>

<h3>2. 安装人工（$200–$1,500）</h3>
<p>安装费按复杂度递增：</p>
<ul>
<li><strong>等量替换两件式：</strong>$200–$400（~1–2小时管工时间，无法兰工作）</li>
<li><strong>一体式更换+新角阀+供水管：</strong>$300–$500</li>
<li><strong>智能马具更换需GFCI插座：</strong>$500–$1,000（电工GFCI安装$250–$500，管工做其余）</li>
<li><strong>壁挂+入墙支架安装：</strong>$1,000–$2,500人工（搭墙骨、装支架、墙周围批墙贴砖、最后挂坐便）</li>
<li><strong>下水点位搬移>12"：</strong>$800–$2,500附加（开楼板、ABS重粘、新马桶法兰、有时新通气）</li>
</ul>

<h3>3. 法兰+楼板（按需$150–$1,200附加）</h3>
<p>马桶法兰（封住马桶与下水管的塑料或铜环）在更换中常常裂或本来就裂。更换$150–$300。1990年前的温哥华老房子拆掉马桶后常常露出慢漏导致的烂楼板——按腐烂程度补楼板加$300–$1,200。30年以上的房子务必预留这笔。</p>

<h3>4. 智能马桶电路（$250–$700附加）</h3>
<p>每个智能/净身马桶36"内必须有GFCI插座。如不存在（2010年前建的大多数温哥华房子马桶后没有），电工从最近电源拉新线。按墙体通达难度：</p>
<ul>
<li><strong>开墙阶段（装修同期）：</strong>$250–$400</li>
<li><strong>明装管路（丑但便宜）：</strong>$250–$400</li>
<li><strong>成品墙穿线：</strong>$400–$700</li>
<li><strong>水泥楼板公寓附近无插座：</strong>$600–$1,200</li>
</ul>

<h3>5. 壁挂支架+结构（$600–$3,000附加）</h3>
<p>壁挂马桶漂亮，腾出9"–12"的地面空间——但入墙水箱需要结构支架（Geberit Duofix或同等）锚固到龙骨和地脚板。支架本身之外的附加成本：</p>
<ul>
<li><strong>需要2x6墙骨（支架装不进2x4）：</strong>开墙阶段$600–$1,200，成品墙拆改$1,500–$3,000</li>
<li><strong>支架周围批墙贴砖：</strong>$400–$1,200，按瓷砖复杂度</li>
<li><strong>二楼木结构需工程加固楼板：</strong>$300–$800如龙骨需并梁</li>
</ul>

<h2>温哥华业主常见超支</h2>
<ol>
<li><strong>次卫装$7,000+的Kohler Numi 2.0。</strong>Numi很棒但它的功能（感应翻盖、环境光、语音控制）在每月只用2次的客卫上是浪费。非主卫指定Toto S550e（$1,200）；旗舰留给主卫。</li>
<li><strong>没有2x6墙骨的小客卫装壁挂马桶。</strong>拆开成品2x4墙加2x6墙骨装Geberit支架，把$2,500的客卫马桶变成$5,500的小翻新。承诺壁挂前先确认墙厚。</li>
<li><strong>没规划GFCI插座就装智能马桶。</strong>净身坐圈需要电源。我们见过业主装了$2,500的Toto Washlet才发现没插座——明装管路接上，成品看着像后加的。在拆改阶段就规划插座，不要事后补。</li>
</ol>

<h2>常见低规格陷阱</h2>
<ol>
<li><strong>永居自住选16"标准高度。</strong>舒适高度（17"–19"）是现代默认有原因——任何年龄的膝盖都受用。$50–$100的升级在20年自住期内最受欢迎。</li>
<li><strong>省了缓降盖。</strong>$50–$100加项消除整个马桶寿命期的撞击声。务必加。</li>
<li><strong>非智能马桶忘了加机械净身配件。</strong>即使预算容不下Toto Washlet，$50–$100的机械净身配件（无需电）能实现80%的功能。Tushy Classic是首选。</li>
</ol>

<h2>温哥华近期项目真实马桶费用</h2>
<ul>
<li><strong>耶鲁镇出租房翻新，基础两件式更换：</strong>$450安装价（Glacier Bay圆前两件式、新角阀+供水管）</li>
<li><strong>本拿比独立屋主卫，Toto Aquia无裙边一体式：</strong>$1,400安装价（马桶$850、安装$300、新法兰$150、新角阀$50）</li>
<li><strong>高贵林标准浴室，现有一体式+加装Toto Washlet S550e：</strong>$1,650安装价（Washlet $1,150、GFCI插座成品墙穿线$400、安装$100）。项目：<a href="/zh/projects/coquitlam-standard-bathroom-renovation-shower-conversion/">高贵林浴室</a></li>
<li><strong>枫树岭浴室，整套Toto S550e智能马桶（一体式+集成净身圈）：</strong>$2,800安装价（马桶$2,200、开墙阶段加GFCI插座$250、安装$350）</li>
<li><strong>西温奢华主卫，壁挂Toto + Geberit Duofix支架：</strong>$5,400安装价（支架$1,200、壁挂坐便$1,800、Toto Washlet $1,200、支架周围搭骨+批墙+贴砖$1,000、管工人工$200）</li>
</ul>

<h2>智能 vs 基础：怎么选</h2>
<p>智能马桶问题几乎都是关于家庭优先级，而不是预算。简易过滤：</p>
<ul>
<li><strong>基础两件式OK的情况：</strong>出租房、每周用<5次的次卫，或本身不喜欢净身功能。</li>
<li><strong>一体式舒适高度作为默认的情况：</strong>主卫、家庭住宅、想要更整洁外观但不想要智能功能的复杂度。</li>
<li><strong>智能/净身马桶值得的情况：</strong>主卫、家庭成员50岁以上准备就地养老、注重卫生、或定位豪宅转售（智能马桶在大温买家眼中=高端）。</li>
<li><strong>壁挂值得的情况：</strong>地面空间宝贵的小客卫，或全拆主卫且现代外观必选。否则成本溢价与收益不成正比。</li>
</ul>

<h2>马桶预算规划</h2>
<ol>
<li><strong>先定档（基础/一体式/智能/壁挂）。</strong>每档下游决定不同的人工预算。</li>
<li><strong>选智能前确认GFCI插座是否存在。</strong>不存在就先拿电工报价再下单智能马桶。</li>
<li><strong>选壁挂前确认是否2x6墙。</strong>标准2x4墙装不下Geberit Duofix支架。</li>
<li><strong>预留$300法兰+楼板应急款。</strong>1990年前的温哥华老房子拆旧马桶后常出烂楼板。</li>
<li><strong>智能马桶提前2周下单。</strong>Toto Washlet从供应商仓库发货——缺货延长交期。</li>
</ol>

<h2>相关费用指南</h2>
<ul>
<li><a href="/zh/guides/bathroom-renovation-cost-vancouver/">温哥华浴室装修费用：$10K–$60K真实数据</a> — 完整浴室费用的母指南</li>
<li><a href="/zh/blog/bathtub-renovation-cost-vancouver/">温哥华浴缸装修费用：$800–$8,500+</a> — 同样深度的浴缸</li>
<li><a href="/zh/blog/vanity-renovation-cost-vancouver/">温哥华梳妆台装修费用：$700–$7,200+</a> — 同样深度的浴室梳妆台</li>
<li><a href="/zh/services/bathroom/">浴室装修服务</a> — 我们的工作内容和流程</li>
</ul>

<p>想要马桶真实报价？把现状照片和您在考虑的方案发给我们，48小时内给您三档分价方案。<a href="/zh/contact/">免费上门咨询</a>。</p>
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
  const sql =
    'INSERT INTO blog_posts (slug,title_en,title_zh,excerpt_en,excerpt_zh,content_en,content_zh,meta_title_en,meta_title_zh,meta_description_en,meta_description_zh,focus_keyword_en,focus_keyword_zh,reading_time_minutes,author,is_published,published_at,created_at,updated_at) VALUES (' +
    ph +
    ') ON CONFLICT (slug) DO NOTHING RETURNING id,slug';
  const r = await pool.query(sql, vals);
  console.log(r.rows.length ? 'Inserted: ' + r.rows[0].slug : 'Skip (exists): ' + post.slug);
  await pool.end();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
