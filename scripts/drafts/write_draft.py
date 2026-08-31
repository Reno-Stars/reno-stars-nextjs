#!/usr/bin/env python3
"""Generate a blog draft JSON file for human publish."""
import json, os, sys

script_dir = os.path.dirname(os.path.abspath(__file__))
out_path = os.path.join(script_dir, "..", "drafts", "2026-08-31-whole-house-renovation-white-rock-bc-2026.json")

content_en = (
    "<p>Planning a whole-house renovation in White Rock or South Surrey in 2026? "
    "Reno Stars has completed whole-home remodels across Metro Vancouver, including nearby Delta, "
    "and this guide shares what White Rock homeowners actually pay, how long projects take, "
    "and what permits are required.</p>"
    "<h2>What Does a Whole-House Renovation Cost in White Rock BC in 2026?</h2>"
    "<p>Whole-house renovation costs in White Rock and South Surrey typically range from "
    "<strong>$150 to $400 per square foot</strong> in 2026, depending on scope and finishes. "
    "A 2,000 sq ft home fully renovated — including kitchen, two bathrooms, flooring, and "
    "exterior updates — commonly falls between <strong>$300,000 and $800,000</strong>. "
    "Renovation costs in this semi-rural corner of Metro Vancouver track closely with the "
    "broader Metro Vancouver market.</p>"
    "<h2>Do You Need a Permit for a Whole-House Renovation in White Rock?</h2>"
    "<p>Yes. Whole-house renovations in White Rock require a building permit through the City of "
    "White Rock. Electrical and plumbing work requires separate permits. Heritage designations — "
    "several homes in the White Rock town centre are on the heritage register — add review steps. "
    "A qualified contractor familiar with City of White Rock processes manages permit applications. "
    "Delta and Surrey renovations follow a similar permit structure under their respective municipal processes.</p>"
    "<h2>How Long Does a Whole-House Renovation Take?</h2>"
    "<p>A comprehensive whole-house renovation in White Rock or South Surrey typically runs "
    "4 to 10 months from permit approval to handover. Major structural or layout changes extend "
    "the timeline. Reno Stars manages projects across Metro Vancouver and coordinates White Rock-area "
    "work with their dedicated crew.</p>"
    "<h2>Who Serves White Rock and South Surrey?</h2>"
    "<p>Reno Stars is based in Richmond and serves the full Metro Vancouver region including "
    "White Rock, South Surrey, Delta, Richmond, Vancouver, Burnaby, and Coquitlam. "
    "The team speaks English, Mandarin, and Cantonese. All quotes include a free on-site assessment.</p>"
    "<h2>Real Project Example: Whole-House Renovation in Delta</h2>"
    "<p>Reno Stars recently completed a whole-house renovation in Delta — immediately neighbouring "
    "White Rock — covering a kitchen renovation with apron-front farmhouse sink and quartz "
    "countertops, plus two full bathrooms. The project demonstrates the scope and finish quality "
    "achievable in the South Metro area.</p>"
    '<img src="https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/delta-kitchen-renovation-apron-sink-quartz-p01-after-v1.jpg" alt="White quartz countertop with apron-front farmhouse sink in a renovated Delta kitchen" />'
    "<p>Planning a kitchen, bathroom, whole-home or commercial renovation? "
    '<a href="/en/contact/">Get a free, no-obligation quote from Reno Stars</a>.</p>'
    "<h2>What Is Included in a Whole-House Renovation?</h2>"
    "<ul>"
    "<li>Kitchen: cabinetry, countertops, appliance installation, plumbing and electrical</li>"
    "<li>Bathrooms: tiling, fixtures, vanities, glass shower enclosures</li>"
    "<li>Flooring: hardwood, engineered, or luxury vinyl plank throughout</li>"
    "<li>Interior painting and trim</li>"
    "<li>Window and door replacements</li>"
    "<li>Exterior updates where required by permit</li>"
    "</ul>"
    "<h2>What Do Homeowners in White Rock Say About Reno Stars?</h2>"
    "<p>Reno Stars holds a 5-star average across verified client reviews. "
    "One White Rock-area client wrote: <em>&#8220;This is our second project with Reno Stars, "
    "and once again the experience was excellent. Sylvia, Ryan, and Jasper make a fantastic team, "
    "the workmanship was great, everything stayed on budget, and communication was always quick "
    "and easy. We are really happy with the results.&#8221;</em></p>"
    "<p>Another client noted: <em>&#8220;Ryan, Jasper and their staff were trustworthy, efficient, "
    "hardworking and nobody can beat their price. "
    "We would highly recommend them to our family and friends.&#8221;</em></p>"
    "<h2>Whole-House Renovation Checklist for White Rock Homeowners</h2>"
    "<ul>"
    "<li>Confirm your property is not heritage-designated before signing with a contractor</li>"
    "<li>Obtain a building permit from the City of White Rock before work begins</li>"
    "<li>Get separate electrical and plumbing permits if needed</li>"
    "<li>Request a site assessment and written quote — Reno Stars offers free on-site estimates</li>"
    "<li>Confirm the contractor carries BC liability insurance</li>"
    "<li>Discuss waste disposal: a whole-house demo generates 5–15 large contractor bags of debris</li>"
    "</ul>"
    "<p>Planning a kitchen, bathroom, whole-home or commercial renovation? "
    '<a href="/en/contact/">Get a free, no-obligation quote from Reno Stars</a>.</p>'
    "<h2>Frequently Asked Questions</h2>"
    "<h3>How much does a whole-house renovation cost in White Rock BC in 2026?</h3>"
    "<p>Whole-house renovations in White Rock and South Surrey typically range from $150 to $400 "
    "per square foot in 2026. A full 2,000 sq ft renovation with kitchen and two bathrooms "
    "commonly costs $300,000 to $800,000 depending on finishes and structural work.</p>"
    "<h3>Does White Rock require a building permit for interior renovation?</h3>"
    "<p>Yes. The City of White Rock requires a building permit for whole-house interior renovations. "
    "Heritage-designated properties require additional review. "
    "Electrical and plumbing work require separate trade permits.</p>"
    "<h3>How long does a whole-house renovation take in White Rock?</h3>"
    "<p>A comprehensive whole-house renovation in White Rock or South Surrey takes approximately "
    "4 to 10 months from permit approval to final handover, depending on project scope and "
    "whether structural changes are involved.</p>"
    "<h3>Does Reno Stars serve White Rock and South Surrey?</h3>"
    "<p>Yes. Reno Stars is based in Richmond and serves the full Metro Vancouver region including "
    "White Rock, South Surrey, Delta, Richmond, Vancouver, Burnaby, and Coquitlam.</p>"
)

content_zh = (
    "<p>2026年在白石镇（White Rock）或南素里进行整体房屋装修？"
    "Reno Stars已完成多套涵盖大温哥华地区的整体装修项目，包括邻近的Delta，"
    "本指南分享白石镇业主的实际装修费用、工期以及所需许可证信息。</p>"
    "<h2>2026年白石镇整体装修多少钱？</h2>"
    "<p>白石镇和南素里地区整体房屋装修费用通常在2026年达到每平方英尺150至400加元，"
    "具体取决于工程范围和装修档次。2,000平方英尺房屋全面装修——包括厨房、两间浴室、"
    "地板及外立面更新——通常在30万至80万加元之间。"
    "该大温边缘地区的装修成本与大温整体市场基本持平。</p>"
    "<h2>白石镇整体装修需要申请许可证吗？</h2>"
    "<p>需要。白石镇的房屋整体装修须通过白石市政府申请建筑许可证。"
    "电气和管道工程需单独申请许可证。白石镇中心的多处物业已被列入遗产名录，"
    "需额外审查步骤。熟悉白石市流程的合格承包商会将许可证申请纳入项目管理的一部分。"
    "Delta和素里的装修项目遵循类似的城市许可证流程。</p>"
    "<h2>整体装修需要多长时间？</h2>"
    "<p>白石镇或南素里地区的整体房屋全面装修项目通常从许可证批准到交付需要4至10个月。"
    "涉及结构或布局重大变更的项目会延长工期。"
    "Reno Stars管理大温各地区的项目，并派遣专属团队负责白石镇地区的工程。</p>"
    "<h2>哪些公司服务白石镇和南素里？</h2>"
    "<p>Reno Stars总部位于列治文，服务范围覆盖整个大温哥华地区，包括白石镇、南素里、"
    "Delta、列治文、温哥华、本拿比和高贵林。团队成员以英语、普通话和粤语沟通。"
    "所有报价均包含免费现场评估。</p>"
    "<h2>真实项目案例：Delta整体装修</h2>"
    "<p>Reno Stars近期在紧邻白石镇的Delta完成了一套整体房屋装修项目，"
    "涵盖开放式厨房装修——安装农舍风格前移水槽和石英石台面，以及两间全套浴室。"
    "该项目展示了南大温地区可实现的工程规模和装修品质。</p>"
    '<img src="https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/delta-kitchen-renovation-apron-sink-quartz-p01-after-v1.jpg" alt="白色石英石台面配农舍风格前移水槽，已装修完毕的Delta厨房" />'
    "<p>Planning a kitchen, bathroom, whole-home or commercial renovation? "
    '<a href="/en/contact/">Get a free, no-obligation quote from Reno Stars</a>.</p>'
    "<h2>整体装修包含哪些项目？</h2>"
    "<ul>"
    "<li>厨房：橱柜、台面、设备安装、水电工程</li>"
    "<li>浴室：瓷砖、洁具、浴室柜、玻璃淋浴房</li>"
    "<li>地板：实木地板、工程木地板或豪华乙烯基塑料地板</li>"
    "<li>室内油漆和装饰线条</li>"
    "<li>门窗更换</li>"
    "<li>按许可证要求进行的外立面更新</li>"
    "</ul>"
    "<h2>白石镇业主如何评价Reno Stars？</h2>"
    "<p>Reno Stars在经验证客户评价中保持5星平均评分。"
    "一位白石镇地区的客户写道："这是我们第二次与Reno Stars合作，"
    "体验一如既往地出色。Sylvia、Ryan和Jasper组成了超棒的团队，"
    "做工精湛，所有项目均未超出预算，沟通始终快速便捷。我们对结果非常满意。"</p>"
    "<p>另一位客户表示："Ryan、Jasper和他们的员工诚实可靠、效率高，"
    "工作勤奋，价格也无人能敌。我们会向亲朋好友强烈推荐他们。"</p>"
    "<h2>白石镇业主整体装修清单</h2>"
    "<ul>"
    "<li>在签约承包商前确认物业是否具有遗产指定身份</li>"
    "<li>在开工前向白石市政府申请建筑许可证</li>"
    "<li>如需电气和管道工程，请分别申请行业许可证</li>"
    "<li>要求现场评估和书面报价——Reno Stars提供免费现场估算</li>"
    "<li>确认承包商持有卑诗省责任保险</li>"
    "<li>讨论废料处理：整体房屋拆除会产生5至15大袋建筑废料</li>"
    "</ul>"
    "<p>Planning a kitchen, bathroom, whole-home or commercial renovation? "
    '<a href="/en/contact/">Get a free, no-obligation quote from Reno Stars</a>.</p>'
    "<h2>常见问题</h2>"
    "<h3>2026年白石镇整体装修费用是多少？</h3>"
    "<p>白石镇和南素里地区整体房屋装修费用通常在2026年达到每平方英尺150至400加元。"
    "2,000平方英尺含厨房和两间浴室的全面装修，根据装修档次和结构工程不同，"
    "通常在30万至80万加元之间。</p>"
    "<h3>白石镇室内装修需要申请建筑许可证吗？</h3>"
    "<p>需要。白石市政府要求整体房屋室内装修持有建筑许可证。"
    "具有遗产指定身份的物业需额外审查。电气和管道工程需单独申请行业许可证。</p>"
    "<h3>白石镇整体装修需要多长时间？</h3>"
    "<p>白石镇或南素里地区的全面整体房屋装修从许可证批准到最终交付通常需要约4至10个月，"
    "具体取决于项目范围及是否涉及结构工程。</p>"
    "<h3>Reno Stars是否服务白石镇和南素里？</h3>"
    "<p>是的。Reno Stars总部位于列治文，服务覆盖整个大温哥华地区，"
    "包括白石镇、南素里、Delta、列治文、温哥华、本拿比和高贵林。</p>"
)

post = {
    "slug": "whole-house-renovation-white-rock-bc-2026",
    "titleEn": "Whole-House Renovation White Rock BC 2026: Real Costs, Timeline & Permit Guide",
    "titleZh": "白石镇整体装修2026：真实成本、工期与许可证指南",
    "contentEn": content_en,
    "contentZh": content_zh,
    "featuredImageUrl": "https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/delta-kitchen-renovation-apron-sink-quartz-p01-after-v1.jpg",
    "excerptEn": "Whole-house renovation costs in White Rock and South Surrey in 2026 range from $150 to $400 per square foot. This guide covers real costs, timelines, permits, and a Delta project example.",
    "excerptZh": "白石镇和南素里2026年整体房屋装修费用为每平方英尺150至400加元。本指南涵盖真实成本、工期、许可证信息及Delta真实项目案例。",
    "metaTitleEn": "Whole-House Renovation White Rock BC 2026: Real Costs & Permit Guide",
    "metaTitleZh": "白石镇整体装修2026：真实成本与许可证指南 | Reno Stars",
    "metaDescriptionEn": "Whole-house renovation costs in White Rock and South Surrey in 2026. Real costs, timelines, permits, and a Delta project example. Get a free quote from Reno Stars.",
    "metaDescriptionZh": "白石镇和南素里2026年整体房屋装修费用。真实成本、工期、许可证信息及Delta项目案例。Reno Stars免费报价。",
    "focusKeywordEn": "whole-house renovation White Rock BC 2026",
    "focusKeywordZh": "白石镇整体装修 2026",
    "readingTimeMinutes": 8,
    "localizations": {}
}

os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(post, f, ensure_ascii=False, indent=2)

print(f"Draft written to: {out_path}")
# quick word count
import re
wc = len(re.sub(r'<[^>]+>', ' ', content_en).split())
print(f"EN word count (HTML stripped): {wc}")
