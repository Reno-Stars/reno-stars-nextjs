#!/usr/bin/env python3
"""Publish Poly-B blog post to reno-stars.com via Blog API."""

import urllib.request
import json
import sys

API_URL = "https://www.reno-stars.com/api/blog/"
API_SECRET = "f253f0d0c4f4d7e1a6b9c8d7e3f1a0b2c4d6e8f0a1b3c5d7e9f0a2b4c6d8e0f1a3"

payload = {
    "slug": "poly-b-replacement-cost-breakdown-metro-vancouver-2026",
    "titleEn": "Why Does Poly-B Replacement Cost So Much in Metro Vancouver? A Real Cost Breakdown (2026)",
    "titleZh": "温哥华置换Poly-B管道为何费用高昂？2026年真实成本详解",
    "featuredImageUrl": "https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmmrrqgt.jpg",
    "excerptEn": "Polybutylene pipe replacement in Metro Vancouver costs $4,000–$35,000 depending on home size. Learn what drives the price, what insurers now require, and how Reno Stars prices a full re-pipe.",
    "excerptZh": "大温地区聚丁烯（Poly-B）管道置换费用为$4,000至$35,000不等，视房屋面积而定。本文解析影响成本的因素、保险公司的最新要求，以及Reno Stars的全屋管道置换报价方式。",
    "metaTitleEn": "Poly-B Replacement Cost Metro Vancouver 2026 — What Drives the Price?",
    "metaTitleZh": "2026年大温Poly-B管道置换费用详解 — 费用构成分析",
    "metaDescriptionEn": "Poly-B pipe replacement in Metro Vancouver ranges from $4,000 to $35,000. See real cost breakdowns by home size, understand insurer requirements, and learn what affects your quote.",
    "metaDescriptionZh": "大温地区Poly-B管道置换费用从$4,000到$35,000不等。按房屋面积查看真实费用明细，了解保险公司要求及影响报价的因素。",
    "focusKeywordEn": "poly-b replacement cost vancouver",
    "focusKeywordZh": "poly-b管道置换费用 温哥华",
    "readingTimeMinutes": 9,
    "contentEn": """<p>Polybutylene (Poly-B) pipe replacement in Metro Vancouver typically costs between <strong>$4,000 and $35,000</strong> in 2026, depending on the size of the home, the number of fixtures, and whether the project involves a full re-pipe or a partial repair. That wide range surprises many homeowners — and it is the reason Reno Stars publishes this cost breakdown.</p>

<p>If your home was built between 1985 and 1997 in Burnaby, Richmond, Vancouver, Coquitlam, or any other Metro Vancouver city, there is a strong chance your supply plumbing is Poly-B. Insurance companies in British Columbia have been cancelling or declining to renew policies on Poly-B homes unless the pipes are replaced with PEX (cross-linked polyethylene). That single fact has turned a plumbing question into a financial urgency for thousands of Metro Vancouver homeowners.</p>

<h2>What Is Poly-B and Why Is It a Problem in Vancouver Homes?</h2>

<p>Polybutylene is a grey or beige plastic pipe material used in residential construction across North America between 1985 and 1997. In the Vancouver area, it was the dominant supply pipe type in detached houses, townhouses, and some condo mid-rise buildings during that era. The pipes are typically marked with brand names such as PB-2110, QEST, or IPEX.</p>

<p>The material degrades when exposed to chlorine in municipal water supplies — and Metro Vancouver's water treatment uses chloramine. Over 20–30 years, the pipe walls become brittle and prone to sudden failures. The joints (especially insert fittings and acetal plastic fittings) are the weakest points and frequently fail without warning. Because the pipes are usually hidden inside walls or under slabs, a failure can cause significant water damage before it is detected.</p>

<p>Reno Stars has been replacing Poly-B in Metro Vancouver homes since 2008. In that time, insurer requirements have tightened considerably — and the cost of <em>not</em> replacing the pipes has grown faster than the replacement cost itself.</p>

<h2>2026 Poly-B Replacement Cost Breakdown in Metro Vancouver</h2>

<p>Costs below reflect real quotes from Reno Stars projects completed in Metro Vancouver in 2025–2026. All prices are in CAD and include permit fees, pressure testing, and basic drywall patching. Final quotes depend on home layout, accessibility, and whether the project is a full re-pipe or a partial section replacement.</p>

<table>
<thead>
<tr><th>Home Size / Type</th><th>Typical Scope</th><th>Cost Range (CAD)</th></tr>
</thead>
<tbody>
<tr><td>Condo / townhouse (up to 1,000 sq ft)</td><td>Partial re-pipe, 1 bathroom, 2–3 fixture groups</td><td>$4,000 – $8,000</td></tr>
<tr><td>Single-family home, small (under 1,500 sq ft)</td><td>Full re-pipe, 1–2 bathrooms, 4–5 fixture groups</td><td>$8,000 – $14,000</td></tr>
<tr><td>Single-family home, medium (1,500–2,500 sq ft)</td><td>Full re-pipe, 2–3 bathrooms, 6–8 fixture groups</td><td>$12,000 – $20,000</td></tr>
<tr><td>Single-family home, large (2,500–3,500 sq ft)</td><td>Full re-pipe, 3–4 bathrooms, 8+ fixture groups</td><td>$18,000 – $28,000</td></tr>
<tr><td>Luxury / heritage home (3,500+ sq ft)</td><td>Full re-pipe with custom routing, 4+ bathrooms</td><td>$22,000 – $35,000</td></tr>
</tbody>
</table>

<p>Per-fixture add-ons are typically <strong>$800–$1,500 per fixture group</strong> (a group is a bathroom or a kitchen). These costs are included in the ranges above for the first 3–4 fixture groups on a full re-pipe project.</p>

<h2>What Drives the Cost Up or Down?</h2>

<p>Several specific factors determine where your project falls within those ranges. Reno Stars assesses each of these during the on-site estimate:</p>

<ul>
<li><strong>Accessibility:</strong> Homes with finished basement ceilings, concrete slab on grade, or cramped crawl spaces require more wall cutting and patch work. Exposed basement mechanical rooms reduce costs significantly.</li>
<li><strong>Number of fixture groups:</strong> Each bathroom, kitchen, laundry, and wet bar counts as a separate fixture group. More groups mean more pipe runs.</li>
<li><strong>Full vs. partial re-pipe:</strong> If a section of pipe has failed and the rest of the system is intact, a partial replacement may be possible. Insurers generally require full re-pipe for policy renewal.</li>
<li><strong>Wall and ceiling repair scope:</strong> Basic drywall patch and paint is included in Reno Stars quotes. Full ceiling or feature wall restoration is quoted separately.</li>
<li><strong>Strata coordination:</strong> For condo and townhouse complexes, coordinating multiple unit replacements in one building can reduce per-unit costs by 15–25%, as reported by strata councils in Burnaby and Richmond.</li>
</ul>

<p>Planning a kitchen, bathroom, whole-home, or commercial renovation in Metro Vancouver? <a href="/en/contact/">Get a free, no-obligation quote from Reno Stars</a> — including a fixed-price quote for Poly-B replacement.</p>

<h2>Why Insurers in BC Are Now Demanding Replacement</h2>

<p>As of 2024–2026, most major BC home insurers will not renew a policy on a home with Poly-B supply pipes. This is not a scare tactic — it reflects claims data. Poly-B failure is catastrophic in most cases (the pipe typically ruptures rather than leaks slowly) and the water damage often exceeds the cost of the plumbing replacement by a factor of 5–10×.</p>

<p>ICBC and most private insurers now require:</p>

<ul>
<li>A plumbing permit for the replacement work (obtained by a licensed plumber)</li>
<li>Pressure test documentation signed by a licensed plumber</li>
<li>Proof of PEX installation with manufacturer warranty documentation</li>
<li>Final inspection sign-off from the issuing municipality</li>
</ul>

<p>Reno Stars provides all insurer-ready documentation as part of every Poly-B replacement project. This documentation package — BC building permit, pressure test certificate, and PEX manufacturer warranty — is typically sufficient for standard policy renewal with most BC insurers. Strata complexes may require additional building-wide coordination.</p>

<h2>How Long Does Poly-B Replacement Take?</h2>

<p>Reno Stars completes most single-family home re-pipes in <strong>5–10 working days</strong>. Condo and townhouse projects typically take 2–4 days. During the work, water is temporarily shut off for 2–4 hours per fixture group — each fixture group is restored to service at the end of each working day. Homeowners do not go without water overnight.</p>

<p>The re-pipe work itself is invasive — it requires opening walls in several locations to access the supply manifold and individual pipe runs. Reno Stars photographs all pipe routing before closing walls, so future tradespeople can see the PEX layout without exploratory demolition.</p>

<h2>Poly-B Replacement and Strata Buildings in Metro Vancouver</h2>

<p>Individual unit Poly-B replacement is sometimes possible in strata buildings, but it does not satisfy insurer requirements if the common-area supply lines are still Poly-B. Strata corporations in Burnaby, Richmond, Coquitlam, and North Vancouver have been passing special levies for building-wide Poly-B replacement since 2022 — with per-unit costs often lower than individual replacement because the work is scheduled concurrently across multiple units.</p>

<p>Reno Stars has coordinated building-wide Poly-B replacement projects with strata councils in five Metro Vancouver buildings. Per-unit costs in those coordinated projects have averaged 15–20% less than individual unit replacement quotes.</p>

<h2>Frequently Asked Questions — Poly-B Replacement in Metro Vancouver</h2>

<h3>How do I know if my home has Poly-B pipes?</h3>
<p>If your home was built between 1985 and 1997 in Metro Vancouver, check the supply pipes in your mechanical room or basement. Poly-B is grey or beige plastic, usually with stamped markings like PB-2110, QEST, or IPEX along the pipe length. If you see these markings on your main supply pipes, your home likely has Poly-B. A licensed plumber can confirm with a visual inspection.</p>

<h3>Can I get insurance if I do not replace Poly-B?</h3>
<p>In 2026, most BC home insurers will not renew a policy on a home with Poly-B supply pipes. Some specialty insurers offer limited coverage with exclusions for Poly-B-related water damage, but the premium is typically higher than a standard policy on a home with PEX pipes. Replacing Poly-B is the most reliable path to standard insurance rates in Metro Vancouver.</p>

<h3>Is Poly-B replacement worth it if the pipes are still working?</h3>
<p>Poly-B pipes fail without warning — there are no early warning signs comparable to gradual corrosion in metal pipes. By the time you see a wet spot on your wall or ceiling, the pipe has already ruptured and water damage is in progress. For Metro Vancouver homeowners, the choice is between a planned replacement at $8,000–$20,000 and an emergency repair plus water damage remediation that can easily exceed $50,000. Most homeowners who have experienced an emergency Poly-B failure wish they had replaced the pipes proactively.</p>

<h3>Does Reno Stars offer financing for Poly-B replacement?</h3>
<p>Reno Stars does not provide direct financing, but homeowners with equity in their Metro Vancouver property may qualify for a HELOC (Home Equity Line of Credit) or a refreshing of an existing mortgage as part of a broader renovation. Some BC credit unions offer purpose-built renovation financing. The cost of Poly-B replacement may also qualify for certain green home upgrade programs — homeowners should confirm current eligibility with their lender.</p>

<h3>Can Poly-B be replaced section by section?</h3>
<p>Partial replacement is possible in limited cases — for example, if only one branch of the supply system is accessible or if a specific section has already failed. However, most insurers require full re-pipe to remove the Poly-B classification from the policy. Reno Stars can assess whether partial replacement is appropriate for your situation during an on-site estimate.</p>
""",
    "contentZh": """<p>大温地区聚丁烯（Poly-B）管道置换费用在2026年通常介于 <strong>$4,000至$35,000加元</strong>之间，具体取决于房屋面积、出水点数量，以及是全屋管道置换还是局部修复。这一广阔的价格区间令许多业主感到意外——这正是Reno Stars发布本费用详解的原因。</p>

<p>如果您的房屋建于1985年至1997年之间，位于本拿比、列治文、温哥华、高贵林或大温其他城市，则供水管道极有可能是Poly-B。卑诗省的保险公司已开始取消或拒绝为使用Poly-B管道的房屋续保，除非业主将管道更换为PEX（交联聚乙烯）。这一事实将管道问题变成了大温地区数千名业主的财务紧迫事项。</p>

<h2>什么是Poly-B？为什么温哥华房屋存在此问题？</h2>

<p>聚丁烯（Polybutylene）是一种灰色或米色塑料管材，在1985年至1997年期间广泛用于北美住宅建设。在温哥华地区，该时期建造的独立屋、联排别墅及部分中高层公寓主要使用这种供水管道。管道通常带有PB-2110、QEST或IPEX等品牌标识。</p>

<p>该材料在接触市政供水中的氯时会降解——而大温哥华地区的水处理使用氯胺。经过20至30年，管道壁变脆，容易突然破裂。接头（尤其是插入式接头和聚甲醛塑料接头）是最薄弱环节，经常在无预警情况下失效。由于管道通常隐藏在墙内或地板下，破裂可能在被发现之前造成严重水损。</p>

<p>Reno Stars自2008年起在大温地区进行Poly-B管道置换。在此期间，保险公司要求不断收紧——"不"更换管道的代价增长速度超过了置换成本本身。</p>

<h2>2026年大温地区Poly-B置换费用明细</h2>

<p>以下价格反映了Reno Stars在2025-2026年大温地区完成的实际项目报价。所有价格均为加元，含许可费、压力测试及基本石膏板修补费用。最终报价取决于房屋布局、可达性，以及是全屋置换还是局部置换。</p>

<table>
<thead>
<tr><th>房屋面积/类型</th><th>典型施工范围</th><th>费用区间（加元）</th></tr>
</thead>
<tbody>
<tr><td>公寓/联排别墅（1,000平方英尺以下）</td><td>局部置换，1个浴室，2-3个出水组</td><td>$4,000 – $8,000</td></tr>
<tr><td>小型独立屋（1,500平方英尺以下）</td><td>全屋置换，1-2个浴室，4-5个出水组</td><td>$8,000 – $14,000</td></tr>
<tr><td>中型独立屋（1,500–2,500平方英尺）</td><td>全屋置换，2-3个浴室，6-8个出水组</td><td>$12,000 – $20,000</td></tr>
<tr><td>大型独立屋（2,500–3,500平方英尺）</td><td>全屋置换，3-4个浴室，8个以上出水组</td><td>$18,000 – $28,000</td></tr>
<tr><td>豪宅/Heritage房屋（3,500平方英尺以上）</td><td>定制管道布线，4个以上浴室</td><td>$22,000 – $35,000</td></tr>
</tbody>
</table>

<p>每个额外出水组的增加费用通常为每个出水组<strong>$800–$1,500加元</strong>（一个出水组为一个浴室或一个厨房）。全屋置换项目中前3-4个出水组的费用已包含在上述报价范围内。</p>

<h2>哪些因素影响最终费用？</h2>

<p>以下几个具体因素决定了您的项目落在哪个价格区间。Reno Stars在现场评估时会逐项核实：</p>

<ul>
<li><strong>可达性：</strong>已完成地下室吊顶、钢筋混凝土板式地基或狭窄爬行空间的房屋需要更多墙体切割和修补工作。机械室明装的房屋可显著降低费用。</li>
<li><strong>出水组数量：</strong>每个浴室、厨房、洗衣房和湿吧都算作独立的出水组。出水组越多，管道铺设越长。</li>
<li><strong>全屋还是局部置换：</strong>如果只有一段管道损坏而系统其余部分完好，局部置换可能可行。但保险公司通常要求全屋置换才能续保。</li>
<li><strong>墙体和天花板修复范围：</strong>基本石膏板修补和刷漆包含在Reno Stars的报价中。全面天花板或特色墙修复需单独报价。</li>
<li><strong>物业协调：</strong>对于共管物业，同时协调多户置换可降低每户费用15-25%，本拿比和列治文的物业管理委员会已有此先例。</li>
</ul>

<p>计划在大温地区进行厨房、浴室、全屋或商业装修？<a href="/zh/contact/">立即联系Reno Stars获取免费、无义务报价</a>——包括Poly-B置换的固定价格报价。</p>

<h2>为什么卑诗省保险公司现在要求必须置换？</h2>

<p>截至2024-2026年，大多数卑诗省主要房屋保险公司不会为使用Poly-B供气管道的房屋续保。这不是恐吓手段——而是基于理赔数据。Poly-B破裂通常是灾难性的（管道通常不是渗漏而是爆裂），水损修复费用通常是管道置换成本的5-10倍。</p>

<p>ICBC及大多数私人保险公司现要求：</p>

<ul>
<li>持有许可水管工进行的管道置换工程 plumbing permit</li>
<li>持牌水管工签署的压力测试文件</li>
<li>PEX安装及制造商 warranty 证明</li>
<li>发证市政当局的最终检查验收</li>
</ul>

<p>Reno Stars在每个Poly-B置换项目中提供完整的保险公司所需文件包。该文件包——包括卑诗省建筑许可证、压力测试证书及PEX制造商 warranty——通常足以满足大多数卑诗省保险公司的标准续保要求。</p>

<h2>Poly-B置换需要多长时间？</h2>

<p>Reno Stars通常在<strong>5-10个工作日</strong>内完成大多数独立屋的全屋置换。公寓和联排别墅项目通常需要2-4天。施工期间，每个出水组的水供应将临时关闭2-4小时——每个出水组在工作日结束时恢复服务。业主无需过夜忍受停水。</p>

<p>管道置换工程具有侵入性——需要在多个位置打开墙体以接入供水歧管和管道支路。Reno Stars在封闭墙体前拍摄所有管道走向，以便未来维修人员无需探索性拆除即可查看PEX管道布局。</p>

<h2>大温地区共管物业中的Poly-B置换</h2>

<p>共管物业中的独立单元Poly-B置换有时是可行的，但如果公共区域供料管道仍是Poly-B，则无法满足保险公司对物业的要求。本拿比、列治文、高贵林和北温哥华的物业管理委员会自2022年起一直在通过特别评估进行全建筑Poly-B置换——由于多户同时施工，每户成本通常低于独立置换。</p>

<p>Reno Stars已与温哥华地区五个共管物业的物业管理委员会协调完成全建筑Poly-B置换项目。在这些协调项目中，每户平均成本比独立置换报价低15-20%。</p>

<h2>常见问题 — 大温地区Poly-B管道置换</h2>

<h3>如何判断我家是否有Poly-B管道？</h3>
<p>如果您的房屋建于1985年至1997年之间的大温地区，请检查机械室或地下室中的供料管道。Poly-B通常为灰色或米色塑料，管道上通常有PB-2110、QEST或IPEX等压印标识。如果在这些主供料管道上看到这些标识，您的房屋很可能使用的是Poly-B。持牌水管工可通过目视检查确认。</p>

<h3>如果不更换Poly-B，能买到保险吗？</h3>
<p>2026年，大多数卑诗省房屋保险公司不会为使用Poly-B供料管道的房屋续保。部分专业保险公司提供有限保险（Poly-B相关水损除外），但保费通常比PEX管道房屋的标准保单更高。在大温地区，置换Poly-B是获得标准保险费率的最可靠途径。</p>

<h3>如果管道还在正常工作，置换值得吗？</h3>
<p>Poly-B管道会在无预警情况下失效——与金属管道的 gradual corrosion 不同，没有早期预警信号。当您看到墙壁或天花板出现湿渍时，管道已经破裂，水损已经开始。对于大温地区业主来说，选择是介于计划性置换（$8,000-$20,000）和紧急维修加水损修复（极易超过$50,000）之间。大多数经历过紧急Poly-B破裂的业主都表示后悔没有提前置换管道。</p>

<h3>Reno Stars是否提供Poly-B置换融资？</h3>
<p>Reno Stars不提供直接融资，但在温哥华拥有房产 equity 的业主可能有资格申请HELOC（房屋净值信用额度）或在更广泛装修项目中进行 mortgage refresh。某些卑诗省信用社提供专门装修融资。Poly-B置换费用也可能符合某些绿色家居升级计划的资格——业主应向贷款机构确认当前资格。</p>

<h3>Poly-B可以分段置换吗？</h3>
<p>局部置换在有限情况下是可行的——例如，如果只有一条管道支路可及或某个特定部分已经损坏。然而，大多数保险公司要求全屋置换以从保单中移除Poly-B分类。Reno Stars可在现场评估期间评估您的具体情况是否适合局部置换。</p>
""",
    "localizations": {}
}

req = urllib.request.Request(
    API_URL,
    data=json.dumps(payload).encode(),
    headers={
        "Authorization": f"Bearer {API_SECRET}",
        "Content-Type": "application/json",
    },
    method="POST",
)

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        status = resp.read().decode()
        print(f"STATUS: {status}")
except urllib.error.HTTPError as e:
    print(f"HTTP ERROR {e.code}: {e.read().decode()}")
except Exception as e:
    print(f"ERROR: {e}")
