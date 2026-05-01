import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const post = {
  slug: 'vanity-renovation-cost-vancouver',
  te: 'Vanity Renovation Cost Vancouver 2026: $700 to $7,200+ Real Pricing',
  tz: '温哥华浴室梳妆台装修费用 2026：$700–$7,200+ 真实数据',
  me: 'Vanity Renovation Cost Vancouver 2026 | $700–$7,200+ | Reno Stars',
  mz: '温哥华梳妆台装修费用 2026 | $700–$7,200+ | Reno Stars',
  de: "Vancouver vanity renovation cost: $700 (stock single) to $7,200+ (custom double). Real tier breakdown + plumbing relocation extras.",
  dz: '温哥华梳妆台装修费用：$700（库存单台）至$7,200+（定制双台）。真实分层数据+管道改位附加。',
  fe: 'vanity renovation cost vancouver',
  fz: '温哥华梳妆台装修费用',
  rt: 7,
  xe: "What does it really cost to renovate a vanity in Vancouver? Stock single units start around $700–$1,500 installed; semi-custom with a quartz top runs $1,500–$3,500; custom double-vanity millwork can hit $5,000–$7,200+. Plumbing relocation adds another $800–$2,500 if drains have to move. Here's the real breakdown from our recent Metro Vancouver bathroom projects.",
  xz: '在温哥华装修一个浴室梳妆台真实费用是多少？库存单台安装$700–$1,500；半定制配石英台面$1,500–$3,500；定制双台木工可达$5,000–$7,200+。如需移动管道，再加$800–$2,500。以下是我们大温地区近期浴室项目的真实数据。',
  ce: `<article>
<h1>Vanity Renovation Cost Vancouver 2026: $700 to $7,200+ Real Pricing</h1>

<p class="lead">A bathroom vanity is the single most visible piece of millwork in the room — it sets the tone for the whole space. It's also the easiest place to overspend or under-spec without realising. Here's what vanity renovation actually costs in Metro Vancouver in 2026, broken down by tier and based on real Reno Stars project data.</p>

<h2>Quick price summary</h2>
<table>
<thead><tr><th>Tier</th><th>Vancouver installed cost</th><th>Lead time</th><th>Best for</th></tr></thead>
<tbody>
<tr><td>Stock single (24"–36")</td><td>$700 – $1,500</td><td>1–2 wks</td><td>Powder rooms, rentals, fast refresh</td></tr>
<tr><td>Stock double (60"–72")</td><td>$1,500 – $2,800</td><td>1–3 wks</td><td>Master ensuites on a budget</td></tr>
<tr><td>Semi-custom + quartz</td><td>$2,500 – $4,500</td><td>3–5 wks</td><td>Most family-home renovations</td></tr>
<tr><td>Custom millwork single</td><td>$3,500 – $5,500</td><td>5–8 wks</td><td>High-end renos, unique sizing</td></tr>
<tr><td>Custom millwork double</td><td>$5,000 – $7,200+</td><td>6–10 wks</td><td>Luxury master ensuites</td></tr>
</tbody>
</table>
<p><em>Prices are installed and include the cabinet box, doors/drawers, countertop, backsplash strip, sink(s), and faucet(s). Plumbing relocation, electrical for vanity lighting, and tile around the vanity are billed separately.</em></p>

<h2>What drives the price</h2>

<h3>1. Cabinet construction (40–55% of total)</h3>
<p>A stock vanity is a pre-built unit shipped flat-packed. The doors and drawers are factory-stamped, the box is melamine or low-grade plywood, and the hardware is generic. Semi-custom keeps the factory carcass but lets you pick door style, finish, and a few size variants. Full custom is built locally to spec — solid plywood box, soft-close everything, your choice of door profile, integrated lighting, custom hardware. The labour and material gap between stock and custom is what creates the 5–10× price spread.</p>

<h3>2. Countertop material (15–25%)</h3>
<p>Laminate is rare in 2026 even at the budget end — most stock vanities ship with a basic quartz top. Stone codes we use most often:</p>
<ul>
<li><strong>Standard quartz (Caesarstone, Silestone basic):</strong> $80–$120/sqft installed</li>
<li><strong>Premium quartz (Silestone Eternal, Caesarstone supernatural):</strong> $120–$180/sqft</li>
<li><strong>Marble or natural stone:</strong> $150–$300/sqft</li>
</ul>

<h3>3. Sink + faucet (5–15%)</h3>
<p>Drop-in basic sink: $80–$200. Undermount: $200–$500. Vessel sink: $300–$1,000. Faucet ranges from $80 (chrome basic) to $700+ (designer matte black with thermostatic). For supply-and-install we mark up at our standard rate; clients also have the option to source their own and we install only.</p>

<h3>4. Plumbing relocation ($800–$2,500 add)</h3>
<p>If the existing drain rough-in lines up with the new vanity, no extra cost. If the new vanity is wider, has dual sinks, or moves to a different wall, expect $800–$2,500 added depending on access. Concrete-floor condos can push this to $4,000+ if drains have to be cored.</p>

<h3>5. Electrical for vanity light + GFCI ($250–$700 add)</h3>
<p>New vanity-light wire runs $250–$400 if the wall is open. Adding a GFCI vanity outlet to current code is mandatory if any electrical is touched — typically $150–$300 for the outlet + box + permit-able install.</p>

<h2>Where Vancouver homeowners overspend</h2>
<ol>
<li><strong>Buying a custom-millwork double when a 60" stock would have worked.</strong> If the bathroom is fundamentally rectangular and the wall is plumb, stock doubles in 60"/72" sizes with semi-custom upgrades hit 90% of the look at 50% of the cost.</li>
<li><strong>Marble countertops in a high-traffic ensuite.</strong> Marble etches from acidic products (lemon juice, certain cosmetics). Beautiful for show, painful in daily use. Quartz looks the same and costs less.</li>
<li><strong>Custom-floating vanities in older condos with tight plumbing access.</strong> The wall plumbing rough-in in pre-1995 buildings often doesn't line up with floating-vanity supply heights, requiring $1,500+ in plumbing modifications you didn't budget for.</li>
</ol>

<h2>Where homeowners under-spec</h2>
<ol>
<li><strong>Skipping soft-close hinges and slides.</strong> A $100–$200 upgrade pays back in 5+ years of not slamming doors. Always include in the spec.</li>
<li><strong>Standard sink depth on a 60"+ double.</strong> Two people brushing teeth at the same time with shallow sinks = water everywhere. Spec sinks ≥ 5" deep.</li>
<li><strong>Forgetting drawer outlets.</strong> Hair dryers, electric toothbrushes, beard trimmers — all live in vanity drawers now. A $200 in-drawer outlet is the single most-loved upgrade we install.</li>
</ol>

<h2>Real Vancouver vanity costs from recent projects</h2>
<ul>
<li><strong>Yaletown 1-bed condo, 30" stock vanity refresh:</strong> $1,200 installed (semi-custom door fronts, quartz top, undermount sink, chrome faucet)</li>
<li><strong>Burnaby SFH master ensuite, 72" semi-custom double:</strong> $4,200 installed (Shaker doors, premium quartz, dual undermount sinks, brushed nickel fixtures)</li>
<li><strong>Coquitlam townhouse, 48" custom floating vanity:</strong> $4,800 installed (white oak veneer, custom drawer layout, integrated LED, matte black hardware)</li>
<li><strong>West Vancouver luxury ensuite, 84" custom double:</strong> $7,200 installed (book-matched walnut, marble top, vessel sinks, designer faucets)</li>
</ul>

<h2>How to budget your vanity</h2>
<ol>
<li><strong>Start with the bathroom budget total.</strong> Vanity should be 15–25% of total bathroom renovation cost.</li>
<li><strong>Lock in the size before picking the style.</strong> A 60" stock costs less than a 48" custom — size constraints drive everything.</li>
<li><strong>Confirm plumbing locations with a contractor BEFORE ordering.</strong> Cabinetry returns are expensive.</li>
<li><strong>Budget 15% contingency.</strong> Older homes routinely have unexpected plumbing/electrical work behind the wall.</li>
</ol>

<h2>Related cost guides</h2>
<ul>
<li><a href="/en/guides/bathroom-renovation-cost-vancouver/">Bathroom Renovation Cost Vancouver: $10K–$60K Real Data</a> — the parent guide for full bathroom cost</li>
<li><a href="/en/guides/kitchen-renovation-cost-vancouver/">Kitchen Renovation Cost Vancouver: $15K–$72K Real Data</a> — same structure for kitchens</li>
<li><a href="/en/services/bathroom/">Bathroom Renovation Services</a> — what we do, how we work</li>
</ul>

<p>Want a real quote on your vanity? Send us your dimensions and we'll come back within 48 hours with three priced options across the tiers above. <a href="/en/contact/">Get a free in-home consultation</a>.</p>
</article>`,
  cz: `<article>
<h1>温哥华浴室梳妆台装修费用 2026：$700–$7,200+ 真实数据</h1>

<p class="lead">浴室梳妆台是房间里最显眼的木工件——它定下整个空间的基调。它也是最容易超支或规格不足的地方。本文基于Reno Stars近期真实项目数据，分层展示温哥华2026年梳妆台装修的真实费用。</p>

<h2>价格速查表</h2>
<table>
<thead><tr><th>等级</th><th>温哥华安装价</th><th>交期</th><th>最适合</th></tr></thead>
<tbody>
<tr><td>库存单台 (24"–36")</td><td>$700 – $1,500</td><td>1–2周</td><td>客用卫浴、出租房、快速翻新</td></tr>
<tr><td>库存双台 (60"–72")</td><td>$1,500 – $2,800</td><td>1–3周</td><td>预算友好的主卫</td></tr>
<tr><td>半定制 + 石英</td><td>$2,500 – $4,500</td><td>3–5周</td><td>大多数家庭装修</td></tr>
<tr><td>全定制单台</td><td>$3,500 – $5,500</td><td>5–8周</td><td>高端装修、特殊尺寸</td></tr>
<tr><td>全定制双台</td><td>$5,000 – $7,200+</td><td>6–10周</td><td>豪华主卫</td></tr>
</tbody>
</table>
<p><em>价格为安装到位价，含柜体、门板/抽屉、台面、挡水条、水盆、龙头。管道改位、镜前灯电路、梳妆台周边瓷砖另计。</em></p>

<h2>什么决定了价格</h2>

<h3>1. 柜体结构（占总价 40–55%）</h3>
<p>库存梳妆台是工厂预制扁平包装运输的成品，门板抽屉是工厂冲压的，柜体是密胺板或低级胶合板，五金通用。半定制保留工厂柜体，但允许选择门型、饰面和少数尺寸变体。全定制由本地工厂按尺寸制作——实木胶合板柜体、全部缓冲铰链、自选门型、内嵌灯、定制五金。库存与定制之间5–10倍的价差来自于人工和材料。</p>

<h3>2. 台面材料（15–25%）</h3>
<p>2026年即使在预算端，强化板台面也很少见——大多数库存梳妆台已配基础石英台面。我们最常用的石材代码：</p>
<ul>
<li><strong>标准石英（Caesarstone、Silestone基础款）：</strong>$80–$120/平方英尺安装价</li>
<li><strong>高端石英（Silestone Eternal、Caesarstone supernatural）：</strong>$120–$180/平方英尺</li>
<li><strong>大理石或天然石材：</strong>$150–$300/平方英尺</li>
</ul>

<h3>3. 水盆+龙头（5–15%）</h3>
<p>嵌入式基础水盆：$80–$200。台下盆：$200–$500。台上盆：$300–$1,000。龙头从$80（基础铬色）到$700+（设计师款哑光黑+恒温）不等。"供应+安装"按标准加价；客户也可自购材料，我们仅安装。</p>

<h3>4. 管道改位（$800–$2,500附加）</h3>
<p>如果现有下水点位与新梳妆台对齐，无附加费。如新梳妆台更宽、双盆或换墙，按实际通达难度加$800–$2,500。混凝土楼板的公寓如需开槽下水可达$4,000+。</p>

<h3>5. 镜前灯电路+GFCI（$250–$700附加）</h3>
<p>开墙时新增镜前灯线$250–$400。如有任何电路改动，按现行规范必须新增GFCI梳妆台插座——通常$150–$300含插座+盒+许可安装。</p>

<h2>温哥华业主常见超支</h2>
<ol>
<li><strong>该买库存双台时却定了全定制双台。</strong>如果浴室是规整长方形且墙体平整，60"/72"库存双台搭配半定制升级，能以一半的价格达到90%的视觉效果。</li>
<li><strong>高频使用主卫上大理石台面。</strong>大理石遇酸（柠檬汁、某些化妆品）会蚀刻。看着漂亮，日常用着心痛。石英外观相同且更便宜。</li>
<li><strong>老公寓里的悬浮定制梳妆台。</strong>1995年前楼盘的供水点位往往与悬浮梳妆台高度不对齐，需$1,500+管道改造，预算容易没算到。</li>
</ol>

<h2>常见低规格陷阱</h2>
<ol>
<li><strong>省掉缓冲铰链和滑轨。</strong>$100–$200的升级，5年以上不再砰砰响，必加。</li>
<li><strong>60"+双台用浅水盆。</strong>两人同时刷牙＝水花四溅。规格水盆≥5"深。</li>
<li><strong>忘了抽屉里的插座。</strong>吹风机、电动牙刷、剃须刀都住在抽屉里。$200的抽屉内插座是我们装过最受欢迎的升级项。</li>
</ol>

<h2>温哥华近期项目真实梳妆台费用</h2>
<ul>
<li><strong>耶鲁镇1卧公寓，30"库存梳妆台翻新：</strong>$1,200安装价（半定制门板、石英台面、台下盆、铬龙头）</li>
<li><strong>本拿比独立屋主卫，72"半定制双台：</strong>$4,200安装价（Shaker门型、高端石英、双台下盆、磨砂镍五金）</li>
<li><strong>高贵林联排，48"定制悬浮梳妆台：</strong>$4,800安装价（白橡木皮、定制抽屉布局、内嵌LED、哑光黑五金）</li>
<li><strong>西温奢华主卫，84"全定制双台：</strong>$7,200安装价（书本花纹胡桃木、大理石台面、台上盆、设计师龙头）</li>
</ul>

<h2>梳妆台预算规划</h2>
<ol>
<li><strong>从浴室总预算开始。</strong>梳妆台应占浴室总装修预算的15–25%。</li>
<li><strong>先定尺寸，再选风格。</strong>60"库存比48"定制便宜——尺寸约束决定一切。</li>
<li><strong>下单前先与承包商确认管道位置。</strong>柜体退货费用很高。</li>
<li><strong>预留15%应急款。</strong>老房子墙后常有意想不到的水电工作。</li>
</ol>

<h2>相关费用指南</h2>
<ul>
<li><a href="/zh/guides/bathroom-renovation-cost-vancouver/">温哥华浴室装修费用：$10K–$60K真实数据</a> — 完整浴室费用的母指南</li>
<li><a href="/zh/guides/kitchen-renovation-cost-vancouver/">温哥华厨房装修费用：$15K–$72K真实数据</a> — 厨房同类结构</li>
<li><a href="/zh/services/bathroom/">浴室装修服务</a> — 我们的工作内容和流程</li>
</ul>

<p>想要梳妆台真实报价？把您的尺寸发给我们，48小时内给您三档分价方案。<a href="/zh/contact/">免费上门咨询</a>。</p>
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
