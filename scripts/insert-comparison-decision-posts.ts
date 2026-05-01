import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

interface BlogPost {
  slug: string;
  te: string;
  tz: string;
  xe: string;
  xz: string;
  ce: string;
  cz: string;
  me: string;
  mz: string;
  de: string;
  dz: string;
  fe: string;
  fz: string;
  rt: number;
}

const posts: BlogPost[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // POST 1: Kitchen vs Bathroom — Which Renovation First?
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'kitchen-vs-bathroom-which-renovation-first-vancouver',
    te: 'Kitchen vs Bathroom: Which Renovation Should I Do First in Vancouver?',
    tz: '厨房还是浴室：温哥华装修先做哪个？',
    me: 'Kitchen vs Bathroom Renovation First | Vancouver | Reno Stars',
    mz: '厨房还是浴室先装修？温哥华决策指南 | Reno Stars',
    de: 'Kitchen ($15K–$72K) vs bathroom ($10K–$60K) renovation in Vancouver: which should you do first? Decision framework + real costs + ROI.',
    dz: '温哥华厨房（$15K–$72K）vs 浴室（$10K–$60K）装修：先做哪个？决策框架+真实费用+回报率。',
    fe: 'kitchen vs bathroom renovation first',
    fz: '厨房还是浴室先装修',
    rt: 8,
    xe: "A common question from Vancouver homeowners: do I renovate the kitchen first, or the bathroom? The honest answer depends on three things — current condition, daily-life pain points, and resale timeline. Here's the framework we use with clients.",
    xz: '温哥华业主常问的问题：先装修厨房还是浴室？答案取决于三个因素——现状、日常使用痛点和出售计划。以下是我们与客户讨论时使用的决策框架。',
    ce: `<article>
<h1>Kitchen vs Bathroom: Which Renovation Should I Do First in Vancouver?</h1>

<p class="lead">A common question from Vancouver homeowners: do I renovate the kitchen first, or the bathroom? The honest answer depends on three things — current condition, daily-life pain points, and resale timeline.</p>

<h2>Quick comparison</h2>
<table>
<thead><tr><th>Factor</th><th>Kitchen</th><th>Bathroom</th></tr></thead>
<tbody>
<tr><td>Typical cost (Vancouver)</td><td>$15K – $72K</td><td>$10K – $60K</td></tr>
<tr><td>Typical timeline</td><td>4–8 weeks</td><td>2–8 weeks</td></tr>
<tr><td>Daily disruption</td><td>High (no cooking)</td><td>Moderate (use other bathroom)</td></tr>
<tr><td>Resale ROI</td><td>60–80%</td><td>60–70%</td></tr>
<tr><td>Permits required</td><td>If moving plumbing or electrical</td><td>If adding fixtures or moving plumbing</td></tr>
</tbody>
</table>

<p>For full breakdowns see our <a href="/en/guides/kitchen-renovation-cost-vancouver/">kitchen renovation cost guide</a> and <a href="/en/guides/bathroom-renovation-cost-vancouver/">bathroom renovation cost guide</a>.</p>

<h2>Renovate the kitchen first if…</h2>
<ul>
<li><strong>You cook daily and the layout fights you.</strong> A bad kitchen costs you time every single day. Storage, counter workflow, and appliance placement compound.</li>
<li><strong>You're selling within 2 years.</strong> Kitchens drive listing photos and showing reactions. The kitchen is the single biggest swing in buyer perception.</li>
<li><strong>Your appliances are end-of-life.</strong> If the dishwasher and fridge are due for replacement anyway, doing them inside a renovation captures the labour you'd pay either way.</li>
<li><strong>The kitchen has water damage or asbestos concerns.</strong> Older homes (pre-1990) sometimes need addressing inside walls — better discovered during a renovation than during a leak.</li>
</ul>

<h2>Renovate the bathroom first if…</h2>
<ul>
<li><strong>The kids' bathroom or master bath is past its life.</strong> Fixtures leaking, tile cracking, fan failing — these are functional failures that get worse the longer they wait.</li>
<li><strong>You have multiple bathrooms.</strong> Renovating one at a time keeps a working bathroom in the house. Kitchens don't have that luxury.</li>
<li><strong>Your budget is under $25K.</strong> A bathroom refresh fits in this range; a meaningful kitchen renovation generally doesn't.</li>
<li><strong>You want fast satisfaction.</strong> A 3-week bathroom transformation feels great. Kitchens take longer and disrupt cooking the whole time.</li>
</ul>

<h2>The combo case: do both together</h2>
<p>If you can stretch the budget to $40K–$100K and you live somewhere you can manage 6–10 weeks of disruption (or move out temporarily), doing both at the same time saves 10–15% vs sequential projects. Same crew, shared mobilization, bulk material orders. We do this regularly for Vancouver families planning to stay 5+ years.</p>

<h2>The "neither right now" case</h2>
<p>If you're moving within 12 months, neither full renovation makes financial sense — you won't recoup the disruption. A budget refresh ($5K–$15K paint, hardware, fixtures, lighting) often delivers better dollar-per-listing-photo. We'll tell you honestly when this is the right call.</p>

<h2>What we recommend asking yourself</h2>
<ol>
<li>Which one fights me daily?</li>
<li>Which one is failing functionally (leaks, fan, fixtures)?</li>
<li>What's my realistic budget total — for one room, or for both?</li>
<li>How long do I plan to stay?</li>
<li>Can I tolerate 4–8 weeks of disruption now, or do I need to phase?</li>
</ol>

<p>Honest answers to these usually make the choice clear. If you're still stuck, we offer a <a href="/en/contact/">free in-home consultation</a> — we walk both spaces with you and tell you which one will give you more value.</p>

<h2>Related reading</h2>
<ul>
<li><a href="/en/guides/kitchen-renovation-cost-vancouver/">Kitchen Renovation Cost Vancouver: $15K–$72K real data</a></li>
<li><a href="/en/guides/bathroom-renovation-cost-vancouver/">Bathroom Renovation Cost Vancouver: $10K–$60K+ real data</a></li>
<li><a href="/en/guides/whole-house-renovation-cost-vancouver/">Whole-House Renovation Cost: $50K–$200K+</a></li>
</ul>
</article>`,
    cz: `<article>
<h1>厨房还是浴室：温哥华装修先做哪个？</h1>

<p class="lead">温哥华业主常问：先装修厨房还是浴室？诚实的答案取决于三个因素——现状、日常使用痛点和出售计划。</p>

<h2>快速对比</h2>
<table>
<thead><tr><th>对比项</th><th>厨房</th><th>浴室</th></tr></thead>
<tbody>
<tr><td>温哥华典型费用</td><td>$15K – $72K</td><td>$10K – $60K</td></tr>
<tr><td>典型工期</td><td>4–8周</td><td>2–8周</td></tr>
<tr><td>生活干扰</td><td>高（无法做饭）</td><td>中（可使用其他浴室）</td></tr>
<tr><td>转售回报率</td><td>60–80%</td><td>60–70%</td></tr>
<tr><td>许可需求</td><td>移动管道或电路时需要</td><td>新增洁具或移动管道时需要</td></tr>
</tbody>
</table>

<p>详细费用分析见我们的<a href="/zh/guides/kitchen-renovation-cost-vancouver/">厨房装修费用指南</a>和<a href="/zh/guides/bathroom-renovation-cost-vancouver/">浴室装修费用指南</a>。</p>

<h2>这些情况下先装修厨房</h2>
<ul>
<li><strong>每天做饭且布局不顺手。</strong>糟糕的厨房每天都在浪费您的时间。储物、操作台动线、电器位置都会累积成本。</li>
<li><strong>2年内出售。</strong>厨房是房源照片和看房第一印象的核心，是买家感知中变化最大的一项。</li>
<li><strong>电器已到使用末期。</strong>如果洗碗机和冰箱本来就要换，纳入装修能省下重复的人工费。</li>
<li><strong>厨房有水损或石棉隐患。</strong>1990年前的老房子墙内可能藏有问题——装修时发现比漏水时发现强。</li>
</ul>

<h2>这些情况下先装修浴室</h2>
<ul>
<li><strong>儿童浴室或主卫已过寿命。</strong>洁具漏水、瓷砖开裂、排风扇坏——这些都是功能性故障，越拖越糟。</li>
<li><strong>家中有多个浴室。</strong>一次装修一个，房子始终有可用浴室。厨房做不到这一点。</li>
<li><strong>预算低于$25K。</strong>一个浴室翻新能装在这个预算内；有意义的厨房装修一般装不下。</li>
<li><strong>想要快速满足感。</strong>3周的浴室改造效果立竿见影。厨房工期更长，全程影响做饭。</li>
</ul>

<h2>组合方案：一起做</h2>
<p>如果预算能拉到$40K–$100K，并且能承受6–10周的干扰（或临时搬出去住），同时做两个比分开做省10–15%。同一施工队、共享进场费、批量采购材料。我们经常为打算长住5年以上的温哥华家庭做这种安排。</p>

<h2>"现在两个都不做"的情况</h2>
<p>如果12个月内要搬家，两个全套装修都不划算——根本收不回干扰成本。预算翻新（$5K–$15K：粉刷、五金、洁具、灯具）的每张照片回报通常更好。如果是这种情况，我们会如实告知。</p>

<h2>建议自问的问题</h2>
<ol>
<li>哪个每天都在跟我作对？</li>
<li>哪个正在功能性失效（漏水、风扇、洁具）？</li>
<li>我现实的预算总额——单间还是两间？</li>
<li>我打算住多久？</li>
<li>现在能承受4–8周的干扰，还是需要分阶段？</li>
</ol>

<p>如实回答以上问题后，选择通常已经清晰。如果仍然犹豫，我们提供<a href="/zh/contact/">免费上门咨询</a>——我们会陪您走查两个空间，告诉您哪个能带来更多价值。</p>

<h2>相关阅读</h2>
<ul>
<li><a href="/zh/guides/kitchen-renovation-cost-vancouver/">温哥华厨房装修费用：$15K–$72K真实数据</a></li>
<li><a href="/zh/guides/bathroom-renovation-cost-vancouver/">温哥华浴室装修费用：$10K–$60K+真实数据</a></li>
<li><a href="/zh/guides/whole-house-renovation-cost-vancouver/">全屋装修费用：$50K–$200K+</a></li>
</ul>
</article>`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // POST 2: Condo vs House Renovation Cost in Vancouver
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'condo-vs-house-renovation-cost-vancouver',
    te: "Condo vs House Renovation Cost in Vancouver: What's Actually Different?",
    tz: '温哥华公寓 vs 独立屋装修费用对比：实际差别在哪？',
    me: 'Condo vs House Renovation Cost Vancouver | Reno Stars',
    mz: '温哥华公寓还是独立屋装修费用对比 | Reno Stars',
    de: 'Condo renovations cost 15–30% more per sqft than houses in Vancouver. Strata, freight elevators, hours rules drive the gap. Real costs + framework.',
    dz: '温哥华公寓装修每平方英尺比独立屋贵15–30%。strata、货梯、时间限制是主因。真实费用+决策框架。',
    fe: 'condo vs house renovation cost vancouver',
    fz: '温哥华公寓独立屋装修费用',
    rt: 9,
    xe: "Condo renovations in Vancouver routinely cost 15–30% more per square foot than equivalent work in a single-family home. The gap isn't labour — it's strata logistics, freight elevators, working-hour restrictions, and water shutoff coordination. Here's what actually drives the difference, and what to budget for.",
    xz: '在温哥华，公寓装修每平方英尺通常比同等独立屋装修贵15–30%。差距不在人工，而在业主立案法团（strata）的物流、货梯安排、施工时间限制和水路关停协调。本文说明真实差别和预算建议。',
    ce: `<article>
<h1>Condo vs House Renovation Cost in Vancouver: What's Actually Different?</h1>

<p class="lead">Condo renovations in Vancouver routinely cost 15–30% more per square foot than equivalent work in a single-family home. The gap isn't labour cost — it's strata logistics, freight elevators, working-hour restrictions, and water shutoff coordination.</p>

<h2>Side-by-side: kitchen renovation</h2>
<table>
<thead><tr><th>Factor</th><th>Condo (1,000 sqft)</th><th>House (1,000 sqft kitchen + adjacent)</th></tr></thead>
<tbody>
<tr><td>Typical kitchen cost</td><td>$25K – $55K</td><td>$25K – $72K</td></tr>
<tr><td>Per-sqft installed cost</td><td>$200 – $350</td><td>$150 – $280</td></tr>
<tr><td>Working hours</td><td>Strata-restricted (often 9–5 weekdays only)</td><td>Owner-determined</td></tr>
<tr><td>Material delivery</td><td>Freight elevator booking + protective padding</td><td>Driveway drop</td></tr>
<tr><td>Demolition disposal</td><td>Bin + freight elevator slot, or daily-bag-out</td><td>Bin in driveway</td></tr>
<tr><td>Water shutoff</td><td>Building-wide notice 48–72h ahead, limited windows</td><td>Owner controls main valve</td></tr>
<tr><td>Permit complexity</td><td>City + strata council approval (parallel)</td><td>City only</td></tr>
</tbody>
</table>

<h2>Why condos cost more per square foot</h2>

<h3>1. Working-hour restrictions (10–20% premium)</h3>
<p>Most Metro Vancouver buildings restrict construction noise to 9 AM – 5 PM weekdays. Some restrict more aggressively (e.g. 10 AM – 4 PM, no Saturdays). A renovation that takes 4 weeks in a house may take 6 weeks in a condo on the same scope, and crew time is the single biggest cost line.</p>

<h3>2. Material handling (5–10% premium)</h3>
<p>Every cabinet, sheet of drywall, bag of mortar, and slab of countertop has to go through a freight elevator with reserved time slots. Strata-required floor protection in lobbies and elevator pads adds setup time daily.</p>

<h3>3. Demolition disposal (3–7% premium)</h3>
<p>Houses get a bin parked in the driveway. Condos require either bin-and-freight-elevator coordination or "bag-out" disposal — every day, contractors carry waste out in 50–80 lb bags. Slower and more labour-intensive.</p>

<h3>4. Water and gas shutoffs (variable)</h3>
<p>Replacing a kitchen island sink in a house: turn off the under-sink shutoff, done. Same task in a condo: building-wide notice 48–72 hours in advance, scheduled around other residents, limited window. Plumbing tasks that take 1 hour in a house often take half a day in a condo.</p>

<h3>5. Permits + strata approval</h3>
<p>Vancouver building permits run $200–$800 for kitchen/bath work in either case. Condos add strata council approval — typically 2–6 weeks for review, plus engineer letters for any work touching the demising walls or building systems. Engineer letters cost $500–$2,500 each.</p>

<h2>What's the same</h2>
<ul>
<li><strong>Cabinet quality and pricing.</strong> Same vendors, same pricing, same lead times.</li>
<li><strong>Countertop, tile, fixture costs.</strong> Material costs are identical.</li>
<li><strong>Electrical labour rates.</strong> Same rate per hour, just sometimes spread over longer days.</li>
<li><strong>Warranty terms.</strong> Quality contractors offer the same workmanship warranty either way.</li>
</ul>

<h2>Condo-specific things that bite</h2>
<ul>
<li><strong>The 24-month strata moratorium clause.</strong> Some buildings won't allow major renovations within 24 months of original move-in. Check your bylaws.</li>
<li><strong>"Common element" surprises.</strong> Walls between units are usually common elements — you can't move them. Some buildings include the floor sub-slab as common element, restricting plumbing relocations.</li>
<li><strong>Insurance riders.</strong> Some strata require contractors to carry $5M CGL + name the strata as additional insured. We do this routinely; ensure your contractor can produce paperwork the same day.</li>
<li><strong>Building rules on rentals during reno.</strong> If you can't live there during work and the building restricts short-term rentals, your hotel cost during reno is your real cost.</li>
</ul>

<h2>House-specific things that bite</h2>
<ul>
<li><strong>Heritage / character home overlays.</strong> Vancouver, North Van, New Westminster have heritage zones with restrictions on exterior changes that don't apply to condos.</li>
<li><strong>Asbestos and lead testing.</strong> Pre-1990 homes routinely require testing before demolition. Condos newer than the asbestos era skip this entirely.</li>
<li><strong>Foundation and structural surprises.</strong> Houses sometimes reveal joist rot, foundation cracks, or undersized structural members during demolition. Condos isolate you from these risks.</li>
<li><strong>Self-managed projects.</strong> The freedom to project-manage means you also bear it; condos force a process discipline that's sometimes valuable.</li>
</ul>

<h2>Decision framework</h2>
<ol>
<li><strong>Get the strata bylaws + renovation rules in writing</strong> before you scope a condo project. The hour-restrictions and approval timelines are non-negotiable cost drivers.</li>
<li><strong>Plan for 2× the schedule and 1.2× the budget</strong> on a condo vs equivalent house work. If the house quote was $40K and 4 weeks, expect the condo equivalent at $48K and 6–8 weeks.</li>
<li><strong>Ask the strata for past-renovation precedents.</strong> Most strata councils will tell you what's been approved before. If your scope is unusual, factor in extra approval time.</li>
<li><strong>Get the engineer letter requirements early.</strong> If your contractor doesn't routinely deal with these, find one who does. We work with building engineers across Metro Vancouver every month.</li>
</ol>

<h2>Real-world ranges from our recent projects</h2>
<ul>
<li><strong>Yaletown 1-bed condo, kitchen + bathroom:</strong> $52K, 7 weeks, 2 strata approval cycles</li>
<li><strong>Burnaby Heights SFH, kitchen + bathroom:</strong> $48K, 5 weeks, no strata</li>
<li><strong>Coquitlam townhouse, kitchen only:</strong> $32K, 4.5 weeks, strata-lite (limited rules)</li>
<li><strong>Kerrisdale character house, kitchen only:</strong> $58K, 5 weeks, heritage consultation added</li>
</ul>

<p>For deeper cost data see our <a href="/en/guides/kitchen-renovation-cost-vancouver/">kitchen renovation cost guide</a> and <a href="/en/guides/bathroom-renovation-cost-vancouver/">bathroom renovation cost guide</a>.</p>

<h2>Bottom line</h2>
<p>Condo or house, the renovation itself isn't fundamentally different — the logistics around it are. Budget the logistics, not just the work. If you're unsure whether your specific building, project, or budget makes sense, we offer <a href="/en/contact/">free consultations</a> and have done condo renovations in dozens of Metro Vancouver buildings.</p>
</article>`,
    cz: `<article>
<h1>温哥华公寓 vs 独立屋装修费用对比：实际差别在哪？</h1>

<p class="lead">在温哥华，公寓装修每平方英尺通常比同等独立屋装修贵15–30%。差距不在人工成本，而在业主立案法团（strata）的物流、货梯安排、施工时间限制和水路关停协调。</p>

<h2>厨房装修对比</h2>
<table>
<thead><tr><th>对比项</th><th>公寓（1000平方英尺）</th><th>独立屋（同等厨房+周边1000平方英尺）</th></tr></thead>
<tbody>
<tr><td>典型厨房费用</td><td>$25K – $55K</td><td>$25K – $72K</td></tr>
<tr><td>每平方英尺造价</td><td>$200 – $350</td><td>$150 – $280</td></tr>
<tr><td>施工时间</td><td>strata限制（通常工作日9–5）</td><td>业主自定</td></tr>
<tr><td>材料运输</td><td>预约货梯+保护垫</td><td>车道直送</td></tr>
<tr><td>拆除处理</td><td>垃圾桶+货梯档期，或人工日运</td><td>车道放垃圾桶</td></tr>
<tr><td>停水</td><td>全楼提前48–72小时通知，时段有限</td><td>业主控总阀</td></tr>
<tr><td>许可复杂度</td><td>市政许可+strata理事会审批（并行）</td><td>仅市政</td></tr>
</tbody>
</table>

<h2>公寓为什么每平方英尺更贵</h2>

<h3>1. 施工时间限制（10–20%溢价）</h3>
<p>大温哥华大多数公寓将装修噪音限制在工作日上午9点至下午5点。部分更严格（如10点–4点，禁周六）。同等工作量在独立屋4周完成，在公寓可能需要6周，而工人时间是最大的成本项。</p>

<h3>2. 材料搬运（5–10%溢价）</h3>
<p>每个橱柜、每张石膏板、每袋水泥、每块石材台面都要通过预约时段的货梯。strata要求的大堂和电梯保护每天都要重新铺设，增加准备时间。</p>

<h3>3. 拆除处理（3–7%溢价）</h3>
<p>独立屋直接在车道放垃圾桶。公寓则要么协调垃圾桶+货梯档期，要么"日运"——每天工人用50–80磅的袋子搬出去。慢且费人工。</p>

<h3>4. 停水停气（变动）</h3>
<p>独立屋换厨房岛台水槽：关下水槽阀门即可。公寓同样的工作：全楼提前48–72小时通知、协调其他住户时间、窗口有限。独立屋1小时的水路工作在公寓常需半天。</p>

<h3>5. 许可+strata审批</h3>
<p>温哥华厨卫装修建筑许可两种情况都是$200–$800。公寓增加strata理事会审批——通常2–6周审核，加上涉及楼板墙面或楼宇系统的工程师证明。每份工程师证明费用$500–$2,500。</p>

<h2>哪些是相同的</h2>
<ul>
<li><strong>橱柜质量和报价。</strong>同样的供应商、同样的报价、同样的交期。</li>
<li><strong>台面、瓷砖、洁具费用。</strong>材料成本完全一致。</li>
<li><strong>电工小时工资。</strong>每小时单价相同，只是有时延伸到更长天数。</li>
<li><strong>保修条款。</strong>专业承包商两种情况下提供同等工艺保修。</li>
</ul>

<h2>公寓特有的"坑"</h2>
<ul>
<li><strong>24个月装修禁令条款。</strong>部分楼盘禁止入住24个月内进行大型装修。需查阅章程。</li>
<li><strong>"共同元素"陷阱。</strong>单元间隔墙通常属于共同元素——不可拆。部分楼盘将地板下层混凝土板也归为共同元素，限制管道改位。</li>
<li><strong>保险附加险。</strong>部分strata要求承包商持$5M CGL并将strata列为附加被保险人。我们常规处理；请确认承包商能当天出具证明。</li>
<li><strong>装修期间无法入住时楼盘是否禁止短租。</strong>如果不能住、楼盘又禁止短租，您的酒店成本就是真实成本。</li>
</ul>

<h2>独立屋特有的"坑"</h2>
<ul>
<li><strong>历史保护区/特色房屋叠加。</strong>温哥华、北温、新西敏有历史保护区，对外立面改动有限制，公寓不存在。</li>
<li><strong>石棉和铅检测。</strong>1990年前的房屋拆除前常需检测。比石棉时代新的公寓完全跳过此环节。</li>
<li><strong>地基和结构意外。</strong>独立屋拆除时偶尔暴露搁栅腐烂、地基开裂、结构尺寸不足。公寓让您隔离这些风险。</li>
<li><strong>自管项目。</strong>自由项目管理意味着您自己承担——公寓强制流程纪律有时反而是优点。</li>
</ul>

<h2>决策框架</h2>
<ol>
<li><strong>动手定公寓项目范围前，先拿到strata章程+装修规则书面文件。</strong>时间限制和审批周期是不可商量的成本驱动因素。</li>
<li><strong>公寓比独立屋同等工作做工期×2、预算×1.2规划。</strong>如果独立屋报价$40K、4周，预期公寓同等$48K、6–8周。</li>
<li><strong>向strata了解过往装修先例。</strong>多数strata理事会会告诉您过去批准过什么。如果您的项目范围不同寻常，要预留额外审批时间。</li>
<li><strong>提早确认工程师证明要求。</strong>如果承包商不熟悉，找一家熟悉的。我们每月都在大温多个楼盘与建筑工程师合作。</li>
</ol>

<h2>近期真实项目区间</h2>
<ul>
<li><strong>耶鲁镇1卧公寓，厨房+浴室：</strong>$52K，7周，2轮strata审批</li>
<li><strong>本拿比Heights独立屋，厨房+浴室：</strong>$48K，5周，无strata</li>
<li><strong>高贵林联排，仅厨房：</strong>$32K，4.5周，strata规则较松</li>
<li><strong>克里斯戴尔特色房屋，仅厨房：</strong>$58K，5周，加历史保护咨询</li>
</ul>

<p>更深入的费用数据见<a href="/zh/guides/kitchen-renovation-cost-vancouver/">厨房装修费用指南</a>和<a href="/zh/guides/bathroom-renovation-cost-vancouver/">浴室装修费用指南</a>。</p>

<h2>底线</h2>
<p>无论公寓还是独立屋，装修本身没有根本不同——区别在于围绕它的物流。预算时把物流也算进去，不只是施工本身。如果不确定您的具体楼盘、项目或预算是否合理，我们提供<a href="/zh/contact/">免费咨询</a>，已经在大温多个楼盘完成过装修。</p>
</article>`,
  },
];

async function run() {
  for (const p of posts) {
    const vals = [
      p.slug,
      p.te,
      p.tz,
      p.xe,
      p.xz,
      p.ce,
      p.cz,
      p.me,
      p.mz,
      p.de,
      p.dz,
      p.fe,
      p.fz,
      p.rt,
      'Reno Stars Team',
      true,
      new Date().toISOString(),
      new Date().toISOString(),
      new Date().toISOString(),
    ];
    const ph = vals.map((_: unknown, i: number) => '$' + (i + 1)).join(',');
    const sql =
      'INSERT INTO blog_posts (slug,title_en,title_zh,excerpt_en,excerpt_zh,content_en,content_zh,meta_title_en,meta_title_zh,meta_description_en,meta_description_zh,focus_keyword_en,focus_keyword_zh,reading_time_minutes,author,is_published,published_at,created_at,updated_at) VALUES (' +
      ph +
      ') ON CONFLICT (slug) DO NOTHING RETURNING id,slug';
    const r = await pool.query(sql, vals);
    console.log(
      r.rows.length ? 'Inserted: ' + r.rows[0].slug : 'Skip (exists): ' + p.slug
    );
  }
  await pool.end();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
