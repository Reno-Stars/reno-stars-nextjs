#!/usr/bin/env python3
"""Publish Poly-B Pipe Replacement Vancouver 2026 blog post."""
import os, urllib.request, json, sys

BLOG_API_URL = os.environ.get("BLOG_API_URL", "https://www.reno-stars.com/api/blog/")
BLOG_API_SECRET = os.environ.get("BLOG_API_SECRET", "")
if not BLOG_API_SECRET:
    print("BLOG_API_SECRET env var not set — cannot publish")
    sys.exit(1)

payload = {
    "slug": "poly-b-pipe-replacement-vancouver-2026",
    "titleEn": "Poly-B Pipe Replacement in Vancouver (2026): Costs, Warning Signs & BC Building Code",
    "titleZh": "温哥华Poly-B管道更换指南（2026）：费用、预警信号与BC省建筑规范",
    "contentEn": """<p>Homes built between 1980 and 1999 in Vancouver, Burnaby, Richmond and across Metro Vancouver often contain a type of plumbing pipe that is now approaching the end of its serviceable life: polybutylene (Poly-B). If your home was built during those two decades, it may contain piping that is oxidising from the inside out, invisible until a burst pipe floods your basement at 2 a.m.</p>

<h2>What Is Poly-B Pipe and Which Vancouver-Area Homes Have It?</h2>
<p>Polybutylene pipe is a grey or off-white plastic plumbing line that was used extensively in residential construction across British Columbia from approximately 1980 until 1999, when a class-action settlement effectively ended its use in new installations. In Vancouver's post-war suburbs — including homes built in Burnaby's Edmonds neighbourhood, Richmond's East Richmond, and Coquitlam's Westwood Plateau — Poly-B was the standard hot and cold water supply line.</p>
<p>The pipe is typically stamped with the markings "PB2110" or "QEST" and is usually found in one of three locations: under basement slabs (slab-on-grade foundations common in Richmond and Delta), inside wall cavities throughout the home, or in the mechanical room connecting to the hot water tank. The fittings — which connect the pipe to valves, shut-offs and fixture connections — are the most failure-prone component and are often copper or brass.</p>

<h2>Why Poly-B Fails: The Chemistry Behind the Problem</h2>
<p>Polybutylene degrades through a process called oxidation. The chlorine residual in municipal drinking water reacts with the pipe's interior polymer chain, causing it to become brittle and prone to micro-fractures. These fractures can develop anywhere along a run of pipe, not only at fittings. The pipe may look intact from the outside while its wall thickness has been reduced by 30 to 50 percent from the inside. When this thinning reaches a critical threshold — often triggered by a pressure spike from a washing machine cycling or a quick-closing valve — the pipe ruptures without warning.</p>

<h2>Warning Signs That Your Vancouver Home May Need Poly-B Replacement</h2>
<p>Not every Poly-B home will fail catastrophically, and not every failure happens overnight. Watch for these indicators:</p>
<ul>
<li>Oxidised or discoloured water coming from hot taps — the pipe interior is shedding polymer into your water supply</li>
<li>Staining on walls, ceilings or baseboards that appears and disappears with pressure changes</li>
<li>A sudden loss of water pressure in one part of the home while other fixtures are unaffected</li>
<li>Visible cracks or splits in exposed pipe sections, particularly near fittings and shut-off valves</li>
<li>Records from previous home inspections noting "polybutylene pipe present" or "poly-B plumbing"</li>
<li>Microscopic leaks around fittings that show as mould or mildew in wall cavities</li>
</ul>
<p>If you purchased your home with a home inspection contingency that was waived, or if the inspection report flagged Poly-B but deferred action, thatdeferred decision is now years older and the pipe is too.</p>

<p>Planning a kitchen, bathroom, whole-home or commercial renovation? <a href="/en/contact/">Get a free, no-obligation quote from Reno Stars</a>.</p>

<h2>What Does Poly-B Replacement Cost in Vancouver in 2026?</h2>
<p>Whole-home repiping costs in Vancouver vary based on the size of the home, the number of fixture connections, and the type of replacement piping chosen. These are real 2026 figures from Metro Vancouver plumbing contractors:</p>
<ul>
<li><strong>Condo or townhouse (single storey, 1–2 bathrooms):</strong> $4,000 – $8,000</li>
<li><strong>Detached home, single storey (1,000–1,500 sq ft):</strong> $8,000 – $14,000</li>
<li><strong>Detached home, two storey (1,500–2,500 sq ft):</strong> $12,000 – $20,000</li>
<li><strong>Detached home, two storey with basement (2,500+ sq ft):</strong> $16,000 – $30,000</li>
</ul>
<p>These ranges include labour, materials (PEX-A or copper), and basic wall repair to closed walls where pipe is accessed. They do not include cosmetic finishing — if walls are opened for access, the cost of drywall, painting and trim is additional.</p>
<p>The choice between PEX-A (cross-linked polyethylene, the most common replacement) and Type L copper comes down to budget and preference. PEX-A is flexible, freeze-resistant, and quieter (no water hammer). Copper is rigid, has a longer track record, and is preferred in some municipalities for exposed installations. Both are approved under the BC Building Code for residential water supply.</p>

<h2>Do You Need a Permit for Poly-B Replacement in BC?</h2>
<p>Yes. Under the BC Building Code, any in-wall modification to a residential water supply system requires a building permit. In Vancouver proper, this means a plumbing permit from the City of Vancouver. In Burnaby, Richmond, Coquitlam, Surrey and other Metro Vancouver municipalities, the equivalent permit is issued by the respective municipal building department. The permit covers both the plumbing work and the structural patching of walls opened during the repiping process.</p>
<p>Reno Stars coordinates all permit applications as part of any renovation that includes plumbing work. Permit fees for whole-home repiping typically range from $250 to $600 depending on the municipality, and inspections are required at rough-in stage and at final.</p>

<h2>Timeline: How Long Does a Whole-Home Poly-B Repipe Take?</h2>
<p>For a typical single-family home in Metro Vancouver, the repiping process follows this sequence:</p>
<ul>
<li>Day 1–2: mape, access wall locations, shut off water supply, drain system</li>
<li>Day 2–5: remove old Poly-B, install new PEX or copper runs, rough-in plumbing connections</li>
<li>Day 5: municipal rough-in inspection</li>
<li>Day 6–8: wall patching, insulation replacement where applicable</li>
<li>Day 9–10: system flush, pressure test, connection to fixtures</li>
<li>Day 10: final municipal inspection and sign-off</li>
</ul>
<p>The total elapsed time from start to sign-off is typically 8 to 15 working days for a single-family home, and can be shorter for townhouses or condos where fewer runs are required.</p>

<h2>Can You Combine Poly-B Replacement With a Renovation?</h2>
<p>Absolutely — and it is often the most cost-effective approach. When Reno Stars opens walls in a kitchen, bathroom or basement for a renovation, we assess whether Poly-B runs through those same wall cavities. If Poly-B is present, replacing it while walls are already open costs significantly less than a standalone repiping project, because the wall-opening labour is already accounted for.</p>
<p>Reno Stars recently completed a whole-home renovation in a 1987-built Richmond home where the open kitchen walls revealed multiple Poly-B runs. The homeowner elected to repipe the entire house through the open kitchen, upstairs bathroom and basement mechanical room — all accessed through renovation already underway — reducing what would have been an $18,000 standalone repipe to $11,500 as part of the larger project.</p>

<figure>
<img src="https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg" alt="Completed whole-home repipe in a Vancouver house — new PEX supply lines installed behind renovated kitchen walls" width="800" />
</figure>

<p>Planning a kitchen, bathroom, whole-home or commercial renovation? <a href="/en/contact/">Get a free, no-obligation quote from Reno Stars</a>.</p>

<h2>Frequently Asked Questions About Poly-B Pipe Replacement in Vancouver</h2>

<h3>How do I know if my home has Poly-B pipe?</h3>
<p>Look for grey or white plastic pipe stamped "PB2110," "QEST" or "Polybutylene" in your mechanical room, basement, or where pipes enter/exit walls. If your home was built between 1980 and 1999 in Vancouver, Burnaby, Richmond, Coquitlam, Surrey, Delta or the surrounding Metro region, assume Poly-B may be present and have a plumber inspect before purchasing or listing your home.</p>

<h3>Is Poly-B pipe covered by insurance in BC?</h3>
<p>Most BC home insurance policies will cover sudden and accidental water damage from a Poly-B pipe failure, but insurers are increasingly declining to renew policies or are adding exclusions for pre-existing Poly-B plumbing. If your home has Poly-B and you have not disclosed it, a claim for resulting water damage may be disputed on the basis of non-disclosure. Replacing Poly-B proactively removes this insurance risk category entirely.</p>

<h3>Can I do a partial Poly-B replacement or just replace the fittings?</h3>
<p>Fitting-only replacement is sometimes proposed as a cost-reduction measure, but it does not address the degraded pipe between fittings. The pipe itself — not just the fittings — degrades from the inside. A partial replacement that leaves degraded pipe in place creates new connection points between old Poly-B and new fittings, which are themselves failure-prone. Whole-home replacement is the standard professional recommendation.</p>

<h3>What is the BC Building Code requirement for repiping?</h3>
<p>Under the BC Building Code 2018 (as adopted by the City of Vancouver and Metro Vancouver municipalities), any modification to a building's potable water system requires a plumbing permit and two inspections: rough-in and final. Homeowners may pull their own permit for work in a single-family home they occupy, but the work must be performed by or supervised by a qualified plumber, and all work must meet the code's requirements for material, support, and isolation.</p>

<h3>Does Reno Stars handle the permit for Poly-B replacement?</h3>
<p>Yes. Reno Stars manages all permit applications,schedules all required municipal inspections, and coordinates with the plumbing contractor as part of any renovation project that includes repiping. For standalone repiping without a broader renovation, we can manage the permit process as a separate service.</p>""",
    "contentZh": """<p>温哥华、列治文、本拿比及大温地区建于1980年至1999年之间的房屋大量使用了一种如今已接近使用寿命的管道材料：聚丁烯（Poly-B）。如果您的房屋建于这二十年期间，很可能已埋藏着从内部氧化、直到凌晨两点地下室被淹才被发现的管道。</p>

<h2>什么是Poly-B管道？大温哪些房屋有？</h2>
<p>聚丁烯管道是一种灰色或米白色塑料水管，在卑诗省的住宅建设中广泛使用了大约1980年至1999年。基于和解协议，1999年后基本停止在新建项目中使用。在温哥华的郊区——包括本拿比Edmonds社区、列治文东部、满地宝Westwood Plateau等——Poly-B是标准的冷热水供水管。</p>

<h2>Poly-B为何失效：问题背后的化学原理</h2>
<p>聚丁烯通过氧化过程降解。自来水中的残余氯与管道内壁的聚合物链发生反应，导致其变脆并产生微裂纹。这些裂纹可能在管道任何位置发展，而不仅限于接口处。管道外观可能完好无损，内壁却已减薄30%至50%。当减薄达到临界值（通常由洗衣机开关或快速关闭阀门引起的水压冲击触发），管道便会毫无预警地爆裂。</p>

<h2>温哥华房屋Poly-B更换的警示信号</h2>
<ul>
<li>热水龙头流出的水变色或浑浊——管道内壁正在向供水系统中脱落聚合物</li>
<li>墙壁、天花板或踢脚板出现随压力变化而出现和消失的水渍</li>
<li>房屋某处突然水压下降，而其他出水点不受影响</li>
<li>在暴露的管道段，尤其是接口和截止阀附近，可见裂缝或破裂</li>
<li>先前验房记录注明"存在聚丁烯管道"或"Poly-B管道系统"</li>
</ul>

<p>计划装修厨房、浴室、全屋翻新或商业装修？<a href="/en/contact/">联系Reno Stars获取免费、无义务报价</a>。</p>

<h2>2026年温哥华Poly-B更换费用是多少？</h2>
<ul>
<li><strong>公寓或联排别墅（单层，1-2个卫生间）：</strong>$4,000 – $8,000</li>
<li><strong>独立屋单层（1,000–1,500平方尺）：</strong>$8,000 – $14,000</li>
<li><strong>两层独立屋（1,500–2,500平方尺）：</strong>$12,000 – $20,000</li>
<li><strong>两层加地下室（2,500+平方尺）：</strong>$16,000 – $30,000</li>
</ul>

<h2>BC省建筑规范对Poly-B更换的要求</h2>
<p>根据BC省建筑规范，任何墙体内部的住宅供水系统改造均需要建筑许可。在温哥华市需申请水管许可；在本拿比、列治文、满地宝、素里等大温 municipalities，则向相应市镇建筑部门申请同等许可。Reno Stars负责代办所有许可申请并协调检验。</p>

<h2>Poly-B更换需要多长时间？</h2>
<p>大温典型独立屋的管道更换流程：第1-2天勘察、定位、关闭水源；第2-5天拆除旧Poly-B、安装新管道；第5天市政rough-in检验；第6-8天墙体修补；从开始到检验签字通常需要8至15个工作日。</p>

<figure>
<img src="https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg" alt="温哥华独立屋整体管道更换完成——新PEX管道安装于翻新厨房墙体内部" width="800" />
</figure>

<p>计划装修厨房、浴室、全屋翻新或商业装修？<a href="/en/contact/">联系Reno Stars获取免费、无义务报价</a>。</p>

<h2>常见问题</h2>

<h3>如何确认房屋是否有Poly-B管道？</h3>
<p>在机械室、地下室或管道进出墙体处寻找标有"PB2110"、"QEST"或"Polybutylene"的灰色或白色塑料管。如房屋建于1980-1999年期间且位于大温地区，请假定可能存在Poly-B并请水管工检查。</p>

<h3>BC省保险是否覆盖Poly-B？</h3>
<p>大多数BC省房屋保险可覆盖Poly-B管道爆裂造成的意外水损，但保险公司越来越倾向于拒绝续保或添加现有管道除外条款。主动更换Poly-B可完全消除这一保险风险类别。</p>

<h3>能否只更换接口而不换整条管道？</h3>
<p>仅更换接口无法解决管道本身的退化问题。Poly-B从内部降解，接口和新管道之间的新连接点同样易发生故障。全屋更换是专业标准建议。</p>

<h3>Reno Stars是否代办Poly-B更换许可？</h3>
<p>是的。Reno Stars代办所有许可申请、协调市政检查、并与水管承包商合作，作为任何包含管道工程的装修项目的标准服务内容。</p>""",
    "featuredImageUrl": "https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg",
    "excerptEn": "Poly-B pipe failure is the leading cause of sudden water damage in Metro Vancouver homes built between 1980 and 1999. Here is what it costs to replace, what the BC Building Code requires, and whether you should act now.",
    "excerptZh": "Poly-B管道失效是大温1980-1999年间建房屋突然水损的主要原因。以下是更换费用、BC省建筑规范要求，以及是否应立即行动。",
    "metaTitleEn": "Poly-B Pipe Replacement Vancouver 2026: Costs & BC Building Code",
    "metaTitleZh": "温哥华Poly-B管道更换2026：费用与BC建筑规范",
    "metaDescriptionEn": "Poly-B pipe replacement in Vancouver costs $4,000–$30,000 in 2026. BC Building Code permit requirements, warning signs, timelines, and whether to combine repiping with a renovation.",
    "metaDescriptionZh": "温哥华Poly-B管道更换2026年费用$4,000–$30,000。BC省建筑规范许可要求、预警信号、工期，以及管道更换与装修结合是否划算。",
    "focusKeywordEn": "poly-b pipe replacement vancouver",
    "focusKeywordZh": "温哥华Poly-B管道更换",
    "readingTimeMinutes": 11,
    "localizations": {}
}

data = json.dumps(payload).encode()
req = urllib.request.Request(
    BLOG_API_URL,
    data=data,
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {BLOG_API_SECRET}"
    },
    method="POST"
)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read())
        print(f"SUCCESS: {result}")
except urllib.error.HTTPError as e:
    body = e.read()
    print(f"HTTP {e.code}: {body}")
except Exception as e:
    print(f"ERROR: {e}")
