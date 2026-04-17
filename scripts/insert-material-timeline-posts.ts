import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

interface BlogPost {
  slug: string;
  te: string; // title_en
  tz: string; // title_zh
  xe: string; // excerpt_en
  xz: string; // excerpt_zh
  ce: string; // content_en
  cz: string; // content_zh
  me: string; // meta_title_en
  mz: string; // meta_title_zh
  de: string; // meta_description_en
  dz: string; // meta_description_zh
  fe: string; // focus_keyword_en
  fz: string; // focus_keyword_zh
  rt: number; // reading_time_minutes
}

const posts: BlogPost[] = [
  {
    slug: 'quartz-vs-granite-countertops-vancouver-2026',
    te: 'Quartz vs Granite Countertops for Vancouver Kitchens (2026 Guide)',
    tz: '温哥华厨房石英石 vs 花岗岩台面对比指南（2026）',
    me: 'Quartz vs Granite Countertops Vancouver 2026 | Reno Stars',
    mz: '石英石 vs 花岗岩台面温哥华 2026 | Reno Stars',
    de: 'Quartz vs granite for Vancouver kitchens — cost per sq ft, durability, moisture resistance, maintenance & resale value. Real data from local renos.',
    dz: '温哥华厨房石英石与花岗岩台面全面对比——价格、耐用性、防潮性、维护及转售价值，含真实装修案例。',
    fe: 'quartz vs granite countertops vancouver',
    fz: '石英石 vs 花岗岩台面',
    rt: 8,
    xe: "Deciding between quartz vs granite countertops for your Vancouver kitchen? We break down cost per sq ft, durability, moisture resistance, maintenance, and resale value — with real data from local renovations.",
    xz: "在温哥华厨房装修中纠结石英石还是花岗岩台面？本文全面对比价格、耐用性、防潮性、维护要求及转售价值，并结合本地真实案例数据，帮您做出最佳决定。",
    ce: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Quartz vs Granite Countertops for Vancouver Kitchens (2026 Guide)",
  "description": "Quartz vs granite for Vancouver kitchens — cost per sq ft, durability, moisture resistance, maintenance & resale value. See real project data from local renos.",
  "image": "https://www.reno-stars.com/images/blog/quartz-vs-granite-countertops.jpg",
  "author": {"@type": "Organization", "name": "Reno Stars"},
  "publisher": {"@type": "Organization", "name": "Reno Stars", "logo": {"@type": "ImageObject", "url": "https://www.reno-stars.com/logo.png"}},
  "datePublished": "2026-04-17",
  "dateModified": "2026-04-17",
  "mainEntityOfPage": {"@type": "WebPage", "@id": "https://www.reno-stars.com/en/blog/quartz-vs-granite-countertops-vancouver-2026"}
}
</script>

<h2>Quartz vs Granite Countertops: Quick Comparison</h2>

<p>Choosing between <strong>quartz vs granite countertops</strong> is one of the most common decisions Vancouver homeowners face during a kitchen renovation. Both materials look stunning, hold up well over time, and can significantly boost your home's resale value — but they perform differently depending on your lifestyle, budget, and the unique demands of Vancouver's climate.</p>

<p>This guide cuts through the marketing noise with real pricing data, performance comparisons, and insights from our completed kitchen renovation projects across Vancouver, Burnaby, Richmond, Coquitlam, and Surrey.</p>

<table>
  <thead>
    <tr><th>Factor</th><th>Quartz</th><th>Granite</th></tr>
  </thead>
  <tbody>
    <tr><td>Cost (installed)</td><td>$60–$120/sq ft</td><td>$50–$100/sq ft</td></tr>
    <tr><td>Durability</td><td>Very high (engineered)</td><td>High (natural stone)</td></tr>
    <tr><td>Moisture resistance</td><td>Non-porous, excellent</td><td>Porous, needs sealing</td></tr>
    <tr><td>Maintenance</td><td>Wipe clean, no sealing</td><td>Annual sealing required</td></tr>
    <tr><td>Appearance</td><td>Consistent patterns</td><td>Unique natural veining</td></tr>
    <tr><td>Heat resistance</td><td>Moderate (use trivets)</td><td>Excellent</td></tr>
    <tr><td>Resale value</td><td>Very strong</td><td>Strong</td></tr>
  </tbody>
</table>

<h2>Cost Per Square Foot in Vancouver (2026)</h2>

<p>Material costs have shifted in 2026 due to supply chain stabilization and increased demand from the Metro Vancouver housing market. Here's what you can realistically expect to pay for installed countertops:</p>

<h3>Quartz Countertops</h3>
<ul>
  <li><strong>Entry-level quartz:</strong> $60–$75/sq ft installed — solid colour slabs, thinner profile (2cm), builder-grade brands</li>
  <li><strong>Mid-range quartz:</strong> $75–$95/sq ft installed — popular Calacatta and Carrara looks, 3cm thickness, Caesarstone or Silestone</li>
  <li><strong>Premium quartz:</strong> $95–$120/sq ft installed — ultra-thick slabs, waterfall islands, exotic vein patterns, Dekton or Cambria</li>
</ul>

<p>A typical 40 sq ft Vancouver kitchen countertop with quartz runs <strong>$2,400–$4,800 installed</strong>. Add a waterfall island (an extra 20–30 sq ft of material and more complex fabrication) and your total can reach $6,000–$8,000 for countertops alone.</p>

<h3>Granite Countertops</h3>
<ul>
  <li><strong>Entry-level granite:</strong> $50–$65/sq ft installed — common colours like Black Pearl or Uba Tuba, standard edge profiles</li>
  <li><strong>Mid-range granite:</strong> $65–$80/sq ft installed — more unique veining patterns, Saint Cecilia or Alaska White</li>
  <li><strong>Premium granite:</strong> $80–$100/sq ft installed — exotic slabs, book-matched patterns, rare imports from Brazil or India</li>
</ul>

<p>For the same 40 sq ft kitchen, granite typically runs <strong>$2,000–$4,000 installed</strong> — making it slightly more affordable at the entry level, though premium granite and premium quartz can reach similar price points.</p>

<p><strong>What drives costs up:</strong> complex cutouts (undermount sinks, cooktops), waterfall edges, full-height backsplashes, and removal of existing countertops add $200–$800 to any job.</p>

<h2>Durability: Which Holds Up Better?</h2>

<h3>Quartz</h3>
<p>Quartz is an engineered stone made of roughly 90–94% ground natural quartz crystals bound with polymer resins. This manufacturing process produces a <strong>highly consistent, impact-resistant surface</strong> that resists chips and cracks better than natural stone. You won't find weak veining lines or natural fissures that can become stress points over time.</p>

<p>The main durability caveat for quartz: it's <strong>less heat resistant than granite</strong>. The resin binders can discolour or crack if exposed to direct heat above 150°C (300°F). Always use trivets — never put a hot pan directly on quartz.</p>

<h3>Granite</h3>
<p>Granite is one of the hardest natural stones on earth, scoring 6–7 on the Mohs scale. It handles heat beautifully — you can set a hot cast iron skillet directly on it without damage. However, <strong>granite can chip at edges and corners</strong> if struck sharply, and natural fissures (hairline fractures already present in the stone) can sometimes propagate under stress.</p>

<p>Quality matters enormously with granite. High-grade slabs with tight grain structure outperform cheap imports that may have pre-existing micro-fractures. Always inspect slabs in person before purchase.</p>

<h2>Moisture Resistance in Vancouver's Climate</h2>

<p>Vancouver's notoriously damp climate makes moisture resistance a genuine concern — not just for bathrooms, but for kitchens too. Humidity, steam from cooking, and the simple reality of wet countertops every day mean your material choice matters.</p>

<h3>Quartz: The Winner for Wet Environments</h3>
<p>Quartz is <strong>non-porous by nature of its manufacturing</strong>. Liquids, bacteria, and mould cannot penetrate the surface. There's no need to seal it, and spills of coffee, red wine, or acidic citrus juice won't stain if wiped up within a reasonable time. For Vancouver homeowners who cook frequently, quartz's non-porous surface is a significant practical advantage.</p>

<h3>Granite: Manageable with Proper Sealing</h3>
<p>Natural granite is <strong>slightly porous</strong> — it has microscopic pores that can absorb liquids if left unsealed or if the sealant wears off. In Vancouver's kitchen environment (cooking steam, wet produce, coffee, oil), an unsealed or under-sealed granite countertop can stain or harbour bacteria over time.</p>

<p>The solution is regular sealing: most granite countertops need resealing every 12–18 months. This is a 30-minute DIY task with off-the-shelf granite sealer. If you stay on top of it, granite performs very well in the kitchen. If you're the type to skip maintenance, quartz is the safer choice.</p>

<h2>Maintenance Requirements</h2>

<h3>Quartz</h3>
<ul>
  <li>Daily cleaning: warm soapy water and a soft cloth — that's it</li>
  <li>No sealing, ever</li>
  <li>Avoid harsh chemicals (bleach, oven cleaner) which can dull the surface over time</li>
  <li>Avoid prolonged UV exposure — some quartz colours can fade in direct sunlight near windows</li>
</ul>

<h3>Granite</h3>
<ul>
  <li>Daily cleaning: mild dish soap and warm water — avoid acidic cleaners like vinegar</li>
  <li>Seal annually with a penetrating granite sealer ($20–$40 at any hardware store)</li>
  <li>Blot spills immediately — especially red wine, coffee, and oils</li>
  <li>Re-polish edges if chips occur (professional repair, typically $150–$300)</li>
</ul>

<h2>Appearance and Style</h2>

<h3>Quartz: Consistency and Variety</h3>
<p>Because quartz is manufactured, you get <strong>consistent colour and pattern from slab to slab</strong> — ideal when you need multiple slabs for a large kitchen island or L-shaped countertop and want them to match perfectly. The colour range is enormous: pure whites, warm creams, dramatic blacks, concrete greys, and increasingly convincing Calacatta marble looks.</p>

<p>The trade-off is that quartz can look "too perfect" to some eyes. The patterns are consistent across the slab rather than flowing naturally, which experienced stone enthusiasts sometimes find less interesting than natural granite.</p>

<h3>Granite: Unique Natural Beauty</h3>
<p>No two granite slabs are identical. The natural veining, crystal patterns, and colour variations mean your countertop is genuinely one-of-a-kind. Many Vancouver homeowners specifically choose granite for its organic character — the way light plays across the natural mineral crystals and veins creates a warmth and depth that engineered stone can't fully replicate.</p>

<p>The challenge: matching multiple slabs is harder. If your kitchen requires two or three slabs, getting consistent patterning requires careful slab selection at the stone yard.</p>

<h2>Resale Value in the Vancouver Market</h2>

<p>Real estate data from Metro Vancouver consistently shows that <strong>both quartz and granite add meaningful resale value</strong> compared to laminate or tile countertops. In the $800K–$1.5M condo and townhouse segment that makes up much of Vancouver's resale market, quality stone countertops are expected by buyers.</p>

<p><strong>Quartz currently has a slight edge in resale:</strong> Vancouver buyers at open houses consistently rate quartz as "move-in ready" without concern about maintenance. Realtors frequently mention that quartz kitchens photograph better for listings (consistent colour, no natural variation that can look like staining in photos).</p>

<p><strong>Granite holds its own in the luxury segment:</strong> For homes above $1.5M, unique granite with dramatic natural veining can actually command a premium, as it signals distinctive high-end choices rather than builder-grade selections.</p>

<p>In our experience from projects in Burnaby, Richmond, and Coquitlam, homeowners who renovate to sell see roughly a <strong>1.5–2x return on countertop investment</strong> in the current market, regardless of which material they choose — provided the installation quality is high.</p>

<h2>Real Project Data: What Vancouver Homeowners Actually Choose</h2>

<p>Looking at our completed kitchen renovations across Metro Vancouver, quartz dominates for mid-range projects ($20,000–$35,000 total kitchen budget). Granite tends to appear in either budget-conscious renovations where homeowners find excellent slabs on sale, or in higher-end projects where clients specifically want natural stone character.</p>

<p>Our <a href="/en/blog/average-bathroom-renovation-cost-vancouver/">bathroom renovation cost guides</a> follow a similar pattern — engineered surfaces for value, natural stone for prestige. The key insight: your countertop material should complement the overall renovation vision, not be chosen in isolation.</p>

<p>For example, our Coquitlam condo kitchen renovation featured custom quartz countertops specifically because the client was preparing the home for sale — the consistent, clean look photographs beautifully and appeals to the widest range of buyers. Our Burnaby custom kitchen with wood-vein cabinets used quartz with subtle veining to complement the cabinetry without competing with it.</p>

<h2>Which Should You Choose?</h2>

<h3>Choose Quartz If:</h3>
<ul>
  <li>You want zero-maintenance countertops (no sealing, no special cleaners)</li>
  <li>You cook frequently and want spill-resistance without stress</li>
  <li>You're renovating to sell and want maximum buyer appeal</li>
  <li>You need multiple slabs to match perfectly across a large kitchen</li>
  <li>You prefer a modern, clean aesthetic with consistent patterning</li>
  <li>You have young children (bacteria-resistant, easy to sanitize)</li>
</ul>

<h3>Choose Granite If:</h3>
<ul>
  <li>You want a truly unique countertop — no two slabs identical</li>
  <li>You love to cook and need heat resistance (can place hot pans directly)</li>
  <li>You're comfortable with annual sealing maintenance</li>
  <li>You prefer the warmth and character of natural stone</li>
  <li>Your kitchen design calls for organic, natural materials throughout</li>
  <li>You find an exceptional slab at a competitive price</li>
</ul>

<h3>The Bottom Line</h3>
<p>For most Vancouver homeowners, <strong>quartz is the safer, more practical choice</strong>. It's competitively priced, requires no maintenance, performs brilliantly in Vancouver's damp climate, and has strong buyer appeal. If you want the organic beauty and heat resistance of natural stone — and you'll commit to annual sealing — granite is an equally excellent choice that has stood the test of time.</p>

<p>The best decision is always one made in the context of your full kitchen renovation. Our team helps clients think through material choices as part of the complete design process — countertops, cabinets, flooring, and fixtures should work together as a cohesive system.</p>

<p>Ready to explore your countertop options? Our <a href="/en/services/">kitchen renovation services</a> team is happy to walk you through current material availability, pricing, and what works best for your space. <a href="/en/contact/">Get a free renovation estimate</a> and we'll bring samples to your home so you can see how different materials look in your actual lighting conditions.</p>

<p>Not sure about the overall budget for your kitchen project? Explore our full collection of <a href="/en/blog/">kitchen and bathroom renovation guides</a> for Vancouver-specific pricing and planning advice.</p>`,

    cz: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "温哥华厨房石英石 vs 花岗岩台面对比指南（2026）",
  "description": "温哥华厨房石英石与花岗岩台面全面对比——价格、耐用性、防潮性、维护及转售价值，含真实装修案例。",
  "image": "https://www.reno-stars.com/images/blog/quartz-vs-granite-countertops.jpg",
  "author": {"@type": "Organization", "name": "Reno Stars"},
  "publisher": {"@type": "Organization", "name": "Reno Stars", "logo": {"@type": "ImageObject", "url": "https://www.reno-stars.com/logo.png"}},
  "datePublished": "2026-04-17",
  "dateModified": "2026-04-17",
  "mainEntityOfPage": {"@type": "WebPage", "@id": "https://www.reno-stars.com/zh/blog/quartz-vs-granite-countertops-vancouver-2026"}
}
</script>

<h2>石英石 vs 花岗岩台面：快速对比</h2>

<p>在温哥华厨房装修中，<strong>石英石和花岗岩台面</strong>的选择是业主们最常提出的问题之一。两种材料都美观耐用，也都能有效提升房产转售价值——但在温哥华特有的气候条件和实际使用场景下，它们的表现有明显差异。</p>

<p>本文结合我们在温哥华、本拿比、列治文、高贵林和素里完成的真实厨房改造项目数据，帮您做出最适合自家情况的选择。</p>

<table>
  <thead>
    <tr><th>对比项目</th><th>石英石</th><th>花岗岩</th></tr>
  </thead>
  <tbody>
    <tr><td>安装费（含工料）</td><td>$60–$120/平方英尺</td><td>$50–$100/平方英尺</td></tr>
    <tr><td>耐用性</td><td>极强（工程石材）</td><td>强（天然石材）</td></tr>
    <tr><td>防潮性</td><td>无孔隙，优秀</td><td>有孔隙，需封缝</td></tr>
    <tr><td>日常维护</td><td>擦拭即可，无需封缝</td><td>建议每年封缝一次</td></tr>
    <tr><td>外观</td><td>纹理均匀一致</td><td>天然纹理独一无二</td></tr>
    <tr><td>耐热性</td><td>中等（建议使用隔热垫）</td><td>优秀</td></tr>
    <tr><td>转售价值</td><td>非常强</td><td>强</td></tr>
  </tbody>
</table>

<h2>2026年温哥华安装价格（含工料）</h2>

<p>2026年大温哥华地区的台面市场受供应链回稳和装修需求旺盛影响，价格已趋于稳定。以下是目前较为真实的市场报价：</p>

<h3>石英石台面</h3>
<ul>
  <li><strong>入门级石英石：</strong>$60–$75/平方英尺（安装完毕）——纯色板材，2cm厚度，建材级品牌</li>
  <li><strong>中档石英石：</strong>$75–$95/平方英尺——流行的卡拉卡塔或卡拉拉纹理，3cm厚度，品牌如Caesarstone或Silestone</li>
  <li><strong>高档石英石：</strong>$95–$120/平方英尺——超厚板材、瀑布岛台、异形纹理，品牌如Dekton或Cambria</li>
</ul>

<p>温哥华普通厨房台面面积约40平方英尺，使用石英石的安装总费用约为<strong>$2,400–$4,800</strong>。若加做瀑布式岛台（额外增加20–30平方英尺材料及更复杂的加工工艺），台面部分造价可达$6,000–$8,000。</p>

<h3>花岗岩台面</h3>
<ul>
  <li><strong>入门级花岗岩：</strong>$50–$65/平方英尺——常见颜色如黑珍珠或Uba Tuba，标准边缘处理</li>
  <li><strong>中档花岗岩：</strong>$65–$80/平方英尺——Saint Cecilia或Alaska White等纹理更丰富的品种</li>
  <li><strong>高档花岗岩：</strong>$80–$100/平方英尺——异域石板、书形拼接、巴西或印度进口稀有品种</li>
</ul>

<p>同样40平方英尺的厨房，花岗岩安装总费用约为<strong>$2,000–$4,000</strong>——入门价格略低，但高档花岗岩与高档石英石价格相当。</p>

<p><strong>额外增加费用的项目：</strong>复杂开孔（台下盆、嵌入式灶台）、瀑布边、通顶挡水板、拆除旧台面等，通常额外增加$200–$800。</p>

<h2>耐用性对比</h2>

<h3>石英石</h3>
<p>石英石是工程石材，由约90–94%的天然石英晶体与树脂粘合剂压制而成。这一工艺让石英石具备<strong>极高的一致性和抗冲击能力</strong>，比天然石材更不易崩边或开裂。工程石材中不存在天然的裂纹薄弱点。</p>

<p>主要注意事项：石英石的<strong>耐热性低于花岗岩</strong>。树脂成分在超过约150°C（300°F）的直接热源下可能变色或开裂。使用热锅时务必垫隔热垫。</p>

<h3>花岗岩</h3>
<p>花岗岩是地球上最坚硬的天然石材之一，莫氏硬度6–7级。耐热性出色——铸铁锅直接放置也不会损坏台面。然而，<strong>花岗岩边角受到硬物撞击时容易崩裂</strong>，且天然裂纹在应力下可能扩展。</p>

<p>选购花岗岩时，品质至关重要。高等级石板晶体结构致密，性能远优于可能存在微裂纹的廉价进口货。建议亲自到石材场挑选原板。</p>

<h2>温哥华气候下的防潮性能</h2>

<p>温哥华以潮湿著称，这让防潮性能成为厨房台面选材时绕不开的实际考量——烹饪蒸汽、日常清洗、台面积水都是日常。</p>

<h3>石英石：湿润环境的最佳选择</h3>
<p>石英石<strong>天然无孔隙</strong>，液体、细菌和霉菌无法渗入台面内部。无需封缝，咖啡、红酒、柠檬汁等酸性液体只要及时擦拭即不会留下痕迹。对于经常下厨的温哥华家庭，石英石的无孔特性是非常实际的优势。</p>

<h3>花岗岩：保养到位同样表现良好</h3>
<p>天然花岗岩<strong>有微小孔隙</strong>，若未封缝或封缝剂磨损，液体可能被吸收。在温哥华厨房环境中（烹饪蒸汽、湿润食材、咖啡、食用油），未封缝的花岗岩可能产生污渍或滋生细菌。</p>

<p>解决方案是定期封缝：大多数花岗岩台面需每12–18个月重新封缝一次。这是约30分钟的DIY工作，在任何五金店购买花岗岩封缝剂即可完成。只要坚持维护，花岗岩在厨房中表现非常好。如果您平时对维护工作不上心，石英石是更稳妥的选择。</p>

<h2>日常维护要求</h2>

<h3>石英石</h3>
<ul>
  <li>日常清洁：温水加洗涤剂，软布擦拭——仅此而已</li>
  <li>永久无需封缝</li>
  <li>避免漂白剂、烤箱清洁剂等强力化学品（长期使用会使表面失光）</li>
  <li>避免长时间阳光直射——某些颜色的石英石在强烈紫外线下可能褪色</li>
</ul>

<h3>花岗岩</h3>
<ul>
  <li>日常清洁：温和洗涤剂加温水——避免醋等酸性清洁剂</li>
  <li>每年使用渗透型花岗岩封缝剂封缝一次（五金店购买约$20–$40）</li>
  <li>立即擦拭溅出物，尤其是红酒、咖啡和食用油</li>
  <li>边角崩裂需专业修复（通常$150–$300）</li>
</ul>

<h2>外观与风格</h2>

<h3>石英石：一致性与多样选择</h3>
<p>由于石英石是人工制造，<strong>每块板材的颜色和纹理高度一致</strong>——非常适合大型厨房岛台或L形台面需要多块板材拼接的情况，无需担心色差问题。颜色选择丰富：纯白、暖米、深黑、混凝土灰，以及越来越逼真的卡拉拉大理石纹理。</p>

<p>缺点是：在某些审美眼光看来，石英石显得"太完美"。整块板材纹理均匀规律，缺乏天然石材那种生动的流动感。</p>

<h3>花岗岩：独一无二的天然美感</h3>
<p>没有两块花岗岩原板是完全相同的。天然的纹路、晶体形态和色彩变化使您的台面真正独一无二。许多温哥华业主正是为了这种有机质感而选择花岗岩——光线在天然矿物晶体和纹路上的折射效果，是工程石材难以完全复现的。</p>

<p>挑战在于：多块板材的纹理匹配难度更高。如果厨房需要两到三块板材，需要在石材场仔细挑选，确保拼接自然。</p>

<h2>在温哥华市场的转售价值</h2>

<p>大温哥华地区的房产数据一致表明，<strong>石英石和花岗岩台面都比层压板或瓷砖台面显著提升转售价值</strong>。在温哥华$80万–$150万公寓和联排别墅市场，优质石材台面已经是买家的基本期待。</p>

<p><strong>石英石目前在转售方面略占优势：</strong>看房的买家普遍将石英石厨房视为"拎包入住"级别，不担心维护问题。地产经纪人常提到，石英石厨房的楼盘照片效果更好（颜色一致，没有天然纹理变化被误认为污渍的风险）。</p>

<p><strong>花岗岩在豪华市场仍有竞争力：</strong>$150万以上的物业，有戏剧性天然纹路的独特花岗岩反而能带来溢价，传递出业主对品位的坚持，而非单纯选用建材级产品。</p>

<h2>如何做选择？</h2>

<h3>选择石英石，如果您：</h3>
<ul>
  <li>希望台面零维护（无需封缝、无特殊清洁要求）</li>
  <li>经常下厨，希望台面防溅不担心</li>
  <li>装修目的是出售，追求最大买家吸引力</li>
  <li>大厨房需要多块板材完美拼接</li>
  <li>偏好现代简洁、纹理均匀的美学风格</li>
  <li>家中有小孩（防菌表面，易于消毒）</li>
</ul>

<h3>选择花岗岩，如果您：</h3>
<ul>
  <li>想要真正独一无二的台面</li>
  <li>热爱烹饪，需要出色的耐热性（铸铁锅可直接放置）</li>
  <li>接受每年封缝的维护习惯</li>
  <li>偏好天然石材的温润质感和有机美感</li>
  <li>整体设计追求天然材质的统一风格</li>
  <li>遇到价格合适的优质石板</li>
</ul>

<h3>结论</h3>
<p>对大多数温哥华业主而言，<strong>石英石是更稳妥、更实用的选择</strong>。价格合理、零维护、在温哥华潮湿气候中表现出色、买家接受度高。如果您欣赏天然石材的有机美感和出色耐热性，且愿意承担每年封缝的维护工作，花岗岩同样是经过时间验证的优秀选择。</p>

<p>台面材料的最终选择应该结合整个厨房装修方案来考虑——台面、橱柜、地板和五金件需要作为整体系统协调配合。我们的团队会将材料选择纳入完整的设计流程，帮您找到最适合您生活方式和预算的方案。</p>

<p>想了解各项台面材料的价格和样品？我们的<a href="/zh/services/">厨房翻新服务</a>团队可以带着样品上门，让您在自家真实采光条件下对比效果。<a href="/zh/contact/">预约免费报价</a>，我们会为您提供详细的材料建议。</p>

<p>想了解更多温哥华装修成本和规划建议？欢迎浏览我们的<a href="/zh/blog/">厨房和浴室装修攻略</a>专栏。</p>`,
  },

  {
    slug: 'renovation-timeline-how-long-does-each-project-take',
    te: 'Renovation Timeline: How Long Does Each Project Actually Take? (2026)',
    tz: '装修工期全解析：各类翻新项目需要多长时间？（2026）',
    me: 'Renovation Timeline Vancouver 2026 | How Long Does It Take',
    mz: '温哥华装修工期 2026 | 各项目需要多长时间',
    de: 'Kitchen reno: 4-8 weeks. Bathroom: 3-6 weeks. Basement: 8-12 weeks. Full house: 2-6 months. Real timelines from completed Vancouver renovations.',
    dz: '厨房翻新4-8周，浴室3-6周，地下室8-12周，全屋2-6个月。来自温哥华真实装修项目的工期数据。',
    fe: 'renovation timeline vancouver',
    fz: '装修工期温哥华',
    rt: 7,
    xe: "Planning a renovation and wondering how long it will take? Here are realistic renovation timelines for Vancouver kitchens, bathrooms, basements, and whole-house projects — based on real completed projects, not optimistic estimates.",
    xz: "计划装修却不知道要多久？本文分享温哥华厨房、浴室、地下室及全屋翻新的真实工期数据——来自已完工项目，非乐观估算。",
    ce: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Renovation Timeline: How Long Does Each Project Actually Take? (2026)",
  "description": "Kitchen reno: 4-8 weeks. Bathroom: 3-6 weeks. Basement: 8-12 weeks. Full house: 2-6 months. Real timelines from completed Vancouver renovations.",
  "image": "https://www.reno-stars.com/images/blog/renovation-timeline-vancouver.jpg",
  "author": {"@type": "Organization", "name": "Reno Stars"},
  "publisher": {"@type": "Organization", "name": "Reno Stars", "logo": {"@type": "ImageObject", "url": "https://www.reno-stars.com/logo.png"}},
  "datePublished": "2026-04-17",
  "dateModified": "2026-04-17",
  "mainEntityOfPage": {"@type": "WebPage", "@id": "https://www.reno-stars.com/en/blog/renovation-timeline-how-long-does-each-project-take"}
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does a kitchen renovation take in Vancouver?",
      "acceptedAnswer": {"@type": "Answer", "text": "A standard kitchen renovation in Vancouver takes 4-8 weeks from demo to completion. Simple galley kitchens with in-stock cabinets can finish in 4 weeks; large open-concept kitchens with custom cabinetry, structural changes, or new plumbing can take 8 weeks or longer."}
    },
    {
      "@type": "Question",
      "name": "How long does a bathroom renovation take?",
      "acceptedAnswer": {"@type": "Answer", "text": "A bathroom renovation typically takes 3-6 weeks. A simple refresh (vanity, fixtures, tile) can be done in 3 weeks. A full gut renovation with new layout, custom shower, and heated floors takes 5-6 weeks. Most Reno Stars bathroom projects complete in 3-4 weeks."}
    },
    {
      "@type": "Question",
      "name": "How long does a basement renovation take?",
      "acceptedAnswer": {"@type": "Answer", "text": "Basement renovations take 8-12 weeks for a standard finish (framing, electrical, insulation, drywall, flooring). Adding a bathroom to the basement adds 2-3 weeks. A basement suite with full kitchen requires 10-14 weeks total."}
    },
    {
      "@type": "Question",
      "name": "What causes renovation delays in Vancouver?",
      "acceptedAnswer": {"@type": "Answer", "text": "The most common causes of renovation delays in Vancouver are: permit delays (City of Vancouver building permits can take 4-8 weeks to approve), custom material lead times (custom cabinets 6-10 weeks, imported tile 4-8 weeks), trade scheduling conflicts during busy seasons (spring/fall), and unforeseen structural issues discovered during demo."}
    },
    {
      "@type": "Question",
      "name": "How long does a whole house renovation take?",
      "acceptedAnswer": {"@type": "Answer", "text": "A whole house renovation in Metro Vancouver typically takes 2-6 months depending on scope. A cosmetic refresh (flooring, paint, fixtures throughout) takes 2-3 months. A structural renovation with layout changes, new kitchen, multiple bathrooms, and basement development takes 4-6 months."}
    }
  ]
}
</script>

<h2>Why Renovation Timelines Matter — and Why They're Often Wrong</h2>

<p>One of the most frequent questions we hear from Vancouver homeowners is: <em>how long will my renovation actually take?</em> It's a completely reasonable question — you need to arrange temporary accommodation, plan around school schedules, coordinate with work, and manage your family's disruption.</p>

<p>The problem is that many renovation timelines you'll find online are either optimistically compressed (best-case scenarios with everything going smoothly) or bloated with unnecessary buffer. Neither is useful for planning.</p>

<p>This guide gives you <strong>realistic renovation timelines based on our completed projects</strong> across Metro Vancouver — including what goes wrong and how to minimize delays.</p>

<h3>What Determines Your Timeline?</h3>

<p>Before diving into specific project types, understand the key factors that drive your renovation timeline:</p>

<ul>
  <li><strong>Project scope:</strong> A cosmetic refresh (new fixtures, paint, hardware) takes a fraction of the time of a full structural renovation</li>
  <li><strong>Permit requirements:</strong> Any structural work, electrical panel upgrades, or plumbing additions require permits — and permit review adds time</li>
  <li><strong>Material lead times:</strong> In-stock materials are ready immediately; custom or imported materials can take 4–12 weeks to arrive</li>
  <li><strong>Trades availability:</strong> Electricians, plumbers, and tile setters in Vancouver are often booked 4–8 weeks in advance</li>
  <li><strong>Unforeseen conditions:</strong> Old homes often have surprises behind walls — asbestos, outdated wiring, water damage, non-standard framing</li>
</ul>

<h2>Kitchen Renovation Timeline: 4–8 Weeks</h2>

<p>A kitchen renovation is one of the more complex projects because it involves nearly every trade: demolition, rough-in plumbing and electrical, cabinet installation, countertop templating and fabrication, appliance connections, and detailed finishing work. Here's how a typical Vancouver kitchen renovation breaks down:</p>

<h3>Week 1: Demolition and Rough-In</h3>
<ul>
  <li><strong>Demo (1–2 days):</strong> Removal of existing cabinets, countertops, flooring, and sometimes walls. Fast work but creates significant disruption.</li>
  <li><strong>Structural work (1–3 days):</strong> Wall removal, beam installation, or framing changes if the layout is changing. Requires permit and inspection.</li>
  <li><strong>Rough-in plumbing (2–3 days):</strong> Relocating sink drains, adding dishwasher connections, moving gas lines if needed. Must be inspected before walls close.</li>
  <li><strong>Rough-in electrical (2–3 days):</strong> New circuits for appliances, under-cabinet lighting rough-in, dedicated circuits for refrigerator and microwave. Requires inspection.</li>
</ul>

<h3>Weeks 2–3: Flooring and Cabinet Installation</h3>
<ul>
  <li><strong>Subfloor prep and flooring (2–3 days):</strong> Leveling the subfloor, installing new flooring (hardwood, LVP, or tile). Tile floors need 24–48 hours cure time before traffic.</li>
  <li><strong>Cabinet delivery and installation (3–5 days):</strong> This is the milestone that makes or breaks timelines. In-stock RTA cabinets can install in 2–3 days. Custom cabinets from BC manufacturers typically take 6–10 weeks to build — this is often the long pole in the tent for custom kitchen projects.</li>
</ul>

<h3>Weeks 3–5: Countertops, Appliances, and Finishing</h3>
<ul>
  <li><strong>Countertop templating (1 day):</strong> After cabinets are installed, the fabricator comes to measure precisely. This triggers a 1–2 week fabrication window.</li>
  <li><strong>Countertop installation (1 day):</strong> Fast, but you must wait for fabrication — this is a common source of kitchen timeline extension.</li>
  <li><strong>Tile backsplash (2–3 days):</strong> Including grout cure time.</li>
  <li><strong>Appliance installation (1–2 days):</strong> Connecting range, dishwasher, range hood, refrigerator water line.</li>
  <li><strong>Finishing (2–3 days):</strong> Trim, hardware installation, touch-up painting, electrical cover plates, final inspections.</li>
</ul>

<h3>What Extends Kitchen Timelines</h3>
<p>In our Vancouver projects, the most common kitchen delay sources are: (1) custom cabinet lead times (6–10 weeks from order), (2) countertop templating must wait until cabinets are fully installed and level — adding 2 weeks for fabrication, and (3) permit inspection scheduling (City of Vancouver inspections can take 3–7 business days to schedule).</p>

<p>Our Langley kitchen renovation with the waterfall island design took 4–6 weeks — consistent with this framework. Our Surrey custom cabinet kitchen ran 4–5 weeks from start to completion.</p>

<h2>Bathroom Renovation Timeline: 3–6 Weeks</h2>

<p>Bathrooms are smaller spaces than kitchens but often involve complex waterproofing, tile work, and plumbing changes that require careful sequencing. Here's the typical breakdown:</p>

<h3>Week 1: Demo and Rough-In</h3>
<ul>
  <li><strong>Demo (1–2 days):</strong> Removal of tile, fixtures, vanity, and sometimes wall cement board down to studs. Careful demo preserves adjacent rooms.</li>
  <li><strong>Plumbing rough-in (1–3 days):</strong> Moving drains, adding shower valve, relocating toilet flange if layout changes. Requires permit inspection.</li>
  <li><strong>Electrical rough-in (1–2 days):</strong> Adding GFCI circuits, heat lamp, bathroom fan replacement, heated floor thermostat. Requires inspection.</li>
</ul>

<h3>Weeks 2–3: Waterproofing and Tile</h3>
<ul>
  <li><strong>Shower waterproofing (2–3 days including cure time):</strong> This step cannot be rushed. Proper waterproofing — whether Schluter system, RedGard membrane, or traditional mud bed — needs full cure before tile.</li>
  <li><strong>Tile installation (3–5 days):</strong> Floor tile, shower walls, niche installation. Complex tile patterns or large-format tiles take longer. 24–48 hours minimum cure before grouting.</li>
  <li><strong>Grouting and sealing (1–2 days):</strong> Including appropriate cure time before using the shower.</li>
</ul>

<h3>Weeks 3–5: Fixtures and Finishing</h3>
<ul>
  <li><strong>Vanity and fixture installation (2–3 days):</strong> Vanity set, countertop (if separate from vanity), faucet, toilet, shower fixtures, mirror, accessories.</li>
  <li><strong>Glass shower enclosure (1–2 days, plus 1–2 week lead time for custom glass):</strong> Frameless shower glass is measured after tile is complete and typically takes 1–2 weeks to fabricate.</li>
  <li><strong>Finishing (1–2 days):</strong> Touch-up painting, caulking, hardware, final inspection.</li>
</ul>

<p>Our North Vancouver luxury curbless shower bathroom completed in 3–4 weeks. Our Maple Ridge bathroom with custom glass door also ran 3–4 weeks — the custom glass was ordered early to avoid delays. Our Burnaby master bathroom renovation took 4–5 weeks due to the complexity of the custom features.</p>

<h2>Basement Renovation Timeline: 8–12 Weeks</h2>

<p>Basement renovations tend to take longer than kitchens or bathrooms because they involve a larger space and typically require all major trades working in sequence: framing, electrical, plumbing (if adding a bathroom), insulation, drywall, flooring, and full finishing. This sequential nature is unavoidable — each phase must complete and pass inspection before the next begins.</p>

<h3>Phase 1 — Framing and Rough-In (Weeks 1–3)</h3>
<ul>
  <li><strong>Framing (3–5 days):</strong> Partition walls, bulkheads, bathroom framing, window framing. Requires permit and framing inspection.</li>
  <li><strong>Rough-in plumbing (2–4 days):</strong> If adding a bathroom, this involves breaking concrete for drain lines — add 1–2 days for concrete work and cure time.</li>
  <li><strong>Rough-in electrical (3–5 days):</strong> Full circuit layout for a basement suite — bedroom circuits, bathroom, living area, kitchen if applicable. Requires inspection.</li>
  <li><strong>Insulation (2–3 days):</strong> Batt insulation in walls, spray foam for rim joists, vapour barrier. Requires insulation inspection.</li>
</ul>

<h3>Phase 2 — Drywall (Weeks 3–5)</h3>
<ul>
  <li><strong>Drywall installation (3–5 days):</strong> Hanging, taping, and mudding. Each coat of mud requires 24 hours dry time — minimum 3 coats means minimum 3 days just for mud drying.</li>
  <li><strong>Sanding and priming (2–3 days):</strong> Can't be rushed without affecting final finish quality.</li>
</ul>

<h3>Phase 3 — Finishing (Weeks 6–10)</h3>
<ul>
  <li><strong>Flooring (3–5 days):</strong> LVP, carpet, or tile depending on the space. Floating floor install is fastest; tile with heated floor system takes longer.</li>
  <li><strong>Bathroom finishing (if applicable) (1–2 weeks):</strong> Tile, vanity, fixtures — runs concurrently with other finishing work.</li>
  <li><strong>Kitchen/kitchenette (if applicable) (1–2 weeks):</strong> Cabinets, countertop, appliances — significant additional timeline if creating a legal suite.</li>
  <li><strong>Painting, trim, and finishing (1 week):</strong> Doors, window trim, baseboards, hardware, final electrical connections, fixtures.</li>
</ul>

<p>A basement suite development is at the upper end of this range — expect 10–14 weeks when creating a fully legal secondary suite with kitchen and bathroom, due to the additional permit requirements and trade coordination involved.</p>

<h2>Whole House Renovation Timeline: 2–6 Months</h2>

<p>Whole house renovations vary enormously in scope, but here's a practical framework:</p>

<table>
  <thead>
    <tr><th>Scope</th><th>Typical Timeline</th><th>What's Included</th></tr>
  </thead>
  <tbody>
    <tr><td>Cosmetic refresh</td><td>6–10 weeks</td><td>New flooring throughout, fresh paint, fixture updates, no structural changes</td></tr>
    <tr><td>Moderate renovation</td><td>3–4 months</td><td>Kitchen update, 1–2 bathroom renovations, new flooring, electrical upgrades</td></tr>
    <tr><td>Full renovation</td><td>4–6 months</td><td>Structural changes, full kitchen, multiple bathrooms, basement development</td></tr>
  </tbody>
</table>

<p>Our Vancouver whole house renovation with bathroom updates completed in 4–5 weeks — but that was focused primarily on bathroom and cosmetic updates, not a full structural project. Our Richmond condo renovation (kitchen, bathrooms, flooring) took 4–5 weeks as a focused scope project.</p>

<h2>What Extends Renovation Timelines</h2>

<p>Based on our projects across Metro Vancouver, here are the real culprits when timelines slip:</p>

<h3>1. Permit Processing Times</h3>
<p>City of Vancouver building permits for structural work, electrical panels, or plumbing additions can take <strong>4–8 weeks</strong> for review. Surrey and Burnaby are typically faster (2–4 weeks). The permit clock starts when you submit drawings — not when you start the renovation. Smart contractors submit permits before the project start date so approval arrives right when demo begins.</p>

<h3>2. Custom Material Lead Times</h3>
<ul>
  <li>Custom cabinets from local BC manufacturers: 6–10 weeks</li>
  <li>Custom/specialty tile (imported or special order): 4–8 weeks</li>
  <li>Custom countertop fabrication: 1–2 weeks after templating</li>
  <li>Custom glass shower enclosures: 1–2 weeks after measurement</li>
  <li>Special order plumbing fixtures: 2–6 weeks</li>
</ul>

<h3>3. Trades Availability</h3>
<p>Vancouver's renovation market is competitive. Skilled tile setters, custom cabinet installers, and glass technicians are often booked 4–8 weeks in advance during peak seasons (spring: March–June, fall: September–November). Projects starting in these windows need trades booked well in advance.</p>

<h3>4. Unforeseen Conditions</h3>
<p>Older Vancouver homes (pre-1980) frequently hide surprises: asbestos in floor tile or drywall texture (requires professional abatement, 1–3 days plus testing), knob-and-tube wiring requiring full replacement, galvanized pipes, non-standard stud spacing that complicates tile backing, and water damage from decades of minor leaks. Budget 10–15% of your timeline as buffer for unexpected discoveries.</p>

<h2>How to Avoid Delays</h2>

<h3>Start the Permit Process Early</h3>
<p>If your project requires permits, submit drawings before you plan to start work. A 6-week permit review period doesn't need to extend your project start if you plan for it. Your contractor should be able to advise you on permit requirements at the design stage.</p>

<h3>Order Materials Before Work Begins</h3>
<p>The single biggest delay we see in kitchen renovations is custom cabinet lead time. Order your cabinets at the design sign-off stage — not when demo starts. Same for specialty tile and custom fixtures. Materials should arrive before the project starts, not while trades are waiting.</p>

<h3>Confirm Trade Schedules Before Signing</h3>
<p>Before signing your renovation contract, ask explicitly: "What's your current schedule? When can this project start?" A contractor who can start next week but has no availability for the electrician for six weeks is setting you up for delays. A reliable contractor plans the full trade sequence before committing to a start date.</p>

<h3>Make Final Selections Early</h3>
<p>Change orders after work has started are the most disruptive and expensive timeline killers. Changing countertop material after cabinets are installed means restarting the templating and fabrication window. Changing tile after waterproofing means removing and re-doing work. Lock in your selections before demo begins.</p>

<h2>Our Actual Project Timelines</h2>

<p>Rather than estimates, here's what our completed projects actually took:</p>

<ul>
  <li><strong>Langley kitchen with waterfall island:</strong> 4–6 weeks (custom island design, standard cabinet lead time)</li>
  <li><strong>Burnaby custom kitchen with wood-vein cabinets:</strong> 4–5 weeks</li>
  <li><strong>North Vancouver luxury bathroom (curbless shower):</strong> 3–4 weeks</li>
  <li><strong>Maple Ridge bathroom with custom glass door:</strong> 3–4 weeks</li>
  <li><strong>Burnaby master bathroom with custom features:</strong> 4–5 weeks</li>
  <li><strong>Burnaby townhouse bathroom with custom features:</strong> 2–3 weeks (compact scope)</li>
  <li><strong>Richmond condo (kitchen + bathrooms + flooring):</strong> 4–5 weeks</li>
  <li><strong>Vancouver whole house renovation:</strong> 4–5 weeks (focused scope)</li>
  <li><strong>Vancouver Skin Lab commercial renovation:</strong> 4–5 months (major commercial scope)</li>
</ul>

<h2>Renovation Timeline FAQ</h2>

<h3>Can I live in my home during a kitchen renovation?</h3>
<p>Usually yes, though it requires planning. You'll need to set up a temporary kitchen space (microwave, mini-fridge, hot plate in another room). The most disruptive period is demo and rough-in (Week 1). From cabinet installation onward, the space is liveable though messy. Most Vancouver homeowners choose to stay — a 4–6 week hotel stay adds significant cost.</p>

<h3>How far in advance should I book a contractor?</h3>
<p>For spring and fall projects (peak seasons), book 8–12 weeks in advance. For winter projects (December–February), 4–6 weeks is usually sufficient. The busier the season, the earlier you need to lock in your start date and confirm material orders.</p>

<h3>Can I speed up my renovation timeline?</h3>
<p>Yes — within limits. Choosing in-stock materials over custom dramatically compresses timelines (RTA cabinets vs. custom: 2 weeks vs. 8+ weeks). Having a single contractor who coordinates all trades (rather than managing each trade yourself) reduces scheduling gaps. Avoiding scope changes mid-project is the single highest-impact thing you can do.</p>

<h3>What's the minimum realistic bathroom renovation timeline?</h3>
<p>For a full gut bathroom renovation (removing everything and starting fresh), 3 weeks is the practical minimum for a competent, well-organized contractor with all materials pre-ordered. Anything shorter likely means corners are being cut on waterproofing cure times or inspection steps — which creates expensive problems later.</p>

<p>Ready to plan your project timeline? Our <a href="/en/services/">renovation services</a> team provides detailed project schedules as part of every estimate. We map out the full trade sequence before work begins so you know exactly what to expect. <a href="/en/contact/">Get a timeline estimate</a> for your specific project and we'll walk you through what's realistic for your scope and budget.</p>

<p>Want to understand what drives renovation costs? Our detailed <a href="/en/blog/average-bathroom-renovation-cost-vancouver/">bathroom renovation cost guide</a> and <a href="/en/blog/">full renovation guide library</a> have everything you need to plan and budget your Vancouver renovation.</p>`,

    cz: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "装修工期全解析：各类翻新项目需要多长时间？（2026）",
  "description": "厨房翻新4-8周，浴室3-6周，地下室8-12周，全屋2-6个月。来自温哥华真实装修项目的工期数据。",
  "image": "https://www.reno-stars.com/images/blog/renovation-timeline-vancouver.jpg",
  "author": {"@type": "Organization", "name": "Reno Stars"},
  "publisher": {"@type": "Organization", "name": "Reno Stars", "logo": {"@type": "ImageObject", "url": "https://www.reno-stars.com/logo.png"}},
  "datePublished": "2026-04-17",
  "dateModified": "2026-04-17",
  "mainEntityOfPage": {"@type": "WebPage", "@id": "https://www.reno-stars.com/zh/blog/renovation-timeline-how-long-does-each-project-take"}
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "温哥华厨房翻新需要多长时间？",
      "acceptedAnswer": {"@type": "Answer", "text": "温哥华标准厨房翻新从拆除到完工通常需要4-8周。简单的走廊式厨房配现货橱柜可在4周内完成；大型开放式厨房加定制橱柜、结构调整或新增水管则需要8周或更长时间。"}
    },
    {
      "@type": "Question",
      "name": "浴室翻新需要多长时间？",
      "acceptedAnswer": {"@type": "Answer", "text": "浴室翻新通常需要3-6周。简单翻新（浴室柜、洁具、瓷砖）约3周完成。全面改造（新布局、定制淋浴间、地暖）需要5-6周。Reno Stars大多数浴室项目在3-4周内完成。"}
    },
    {
      "@type": "Question",
      "name": "地下室翻新需要多长时间？",
      "acceptedAnswer": {"@type": "Answer", "text": "标准地下室精装修（龙骨、电气、保温、石膏板、地板）需要8-12周。地下室新增卫浴再加2-3周。带完整厨房的地下室套房需10-14周。"}
    },
    {
      "@type": "Question",
      "name": "温哥华装修工期延误的主要原因是什么？",
      "acceptedAnswer": {"@type": "Answer", "text": "最常见的延误原因：建筑许可审批（温哥华市建筑许可审批需4-8周）、定制材料备货期（定制橱柜6-10周，进口瓷砖4-8周）、旺季工人档期冲突（春秋两季）、拆除时发现隐蔽的结构问题。"}
    },
    {
      "@type": "Question",
      "name": "全屋翻新需要多长时间？",
      "acceptedAnswer": {"@type": "Answer", "text": "大温哥华地区全屋翻新通常需要2-6个月，取决于范围。表面翻新（全屋地板、油漆、洁具）需2-3个月；包含布局调整、新厨房、多间浴室和地下室开发的结构性改造需4-6个月。"}
    }
  ]
}
</script>

<h2>为什么工期很重要——以及为什么它们经常出错</h2>

<p>在与温哥华业主的沟通中，我们最常被问到的问题之一就是：<em>装修到底需要多长时间？</em> 这是非常合理的问题——您需要安排临时住所、配合孩子的学习时间、协调工作日程，并尽量减少对家庭日常生活的影响。</p>

<p>问题在于，网上许多工期信息要么过于乐观（假设一切顺利的最佳情况），要么充斥着不必要的水分。两种都对实际规划没有帮助。</p>

<p>本文给出的是基于我们在大温哥华地区<strong>真实完工项目的装修工期</strong>——包括实际遇到的问题以及如何减少延误。</p>

<h3>影响工期的关键因素</h3>

<ul>
  <li><strong>项目规模：</strong>表面翻新（新洁具、油漆、五金件）所需时间远少于全面结构改造</li>
  <li><strong>许可证要求：</strong>任何结构工程、电气面板升级或新增管道都需要建筑许可——审批流程会增加时间</li>
  <li><strong>材料备货期：</strong>现货材料可立即使用；定制或进口材料可能需要4-12周到货</li>
  <li><strong>工人档期：</strong>温哥华的电工、水管工和瓷砖工通常提前4-8周排满</li>
  <li><strong>隐蔽条件：</strong>老房子墙内经常藏有惊喜——石棉、老化线路、水损、非标准结构</li>
</ul>

<h2>厨房翻新工期：4-8周</h2>

<p>厨房翻新是较为复杂的项目之一，因为几乎涉及所有工种：拆除、水电粗装、橱柜安装、台面放样和加工、电器连接及精细收口工作。以下是典型温哥华厨房翻新的阶段分解：</p>

<h3>第1周：拆除与粗装</h3>
<ul>
  <li><strong>拆除（1-2天）：</strong>拆除原有橱柜、台面、地板，有时包括墙体。工程快但对生活影响大。</li>
  <li><strong>结构工程（1-3天）：</strong>如需改变布局，进行拆墙、安装钢梁或调整龙骨结构。需要许可和检验。</li>
  <li><strong>水管粗装（2-3天）：</strong>重新布置洗手盆排水、添加洗碗机接口、必要时移动燃气管道。须经检验后方可封墙。</li>
  <li><strong>电气粗装（2-3天）：</strong>新增电器回路、橱柜底灯预留线路、冰箱和微波炉专用回路。须经检验。</li>
</ul>

<h3>第2-3周：地板与橱柜安装</h3>
<ul>
  <li><strong>基层处理与铺地板（2-3天）：</strong>基层找平、铺设新地板（实木、LVP或瓷砖）。瓷砖地面需24-48小时养护才能正常使用。</li>
  <li><strong>橱柜到货与安装（3-5天）：</strong>这是影响工期的关键节点。现货平板包橱柜安装约2-3天；BC本地厂家定制橱柜通常需要6-10周生产——这往往是定制厨房项目的最长等待项。</li>
</ul>

<h3>第3-5周：台面、电器与收口</h3>
<ul>
  <li><strong>台面放样（1天）：</strong>橱柜安装完成后，加工厂上门精确测量。这触发1-2周加工周期。</li>
  <li><strong>台面安装（1天）：</strong>速度快，但必须等待加工完成——这是厨房工期延误的常见来源。</li>
  <li><strong>瓷砖挡水板（2-3天）：</strong>含填缝养护时间。</li>
  <li><strong>电器安装（1-2天）：</strong>连接灶台、洗碗机、抽油烟机、冰箱水管。</li>
  <li><strong>收口（2-3天）：</strong>线脚收边、五金安装、补漆、电气面板盖板、最终检验。</li>
</ul>

<h3>导致厨房工期延误的主要因素</h3>
<p>在我们的温哥华项目中，最常见的延误来源是：①定制橱柜备货期（下单后6-10周）；②台面必须等橱柜完全安装并找平后才能放样，加工需再等2周；③建筑检验排期（温哥华市检验约需3-7个工作日预约）。</p>

<h2>浴室翻新工期：3-6周</h2>

<p>浴室空间虽小，但防水、瓷砖和水管改动往往需要严格的工序衔接。典型分解如下：</p>

<h3>第1周：拆除与粗装</h3>
<ul>
  <li><strong>拆除（1-2天）：</strong>拆除瓷砖、洁具、浴室柜，有时需拆至龙骨层。细心拆除可保护相邻房间。</li>
  <li><strong>水管粗装（1-3天）：</strong>移动排水管、安装新淋浴阀体、必要时重新定位马桶法兰。须经检验。</li>
  <li><strong>电气粗装（1-2天）：</strong>添加GFCI回路、暖灯、更换排气扇、地暖温控器预留。须经检验。</li>
</ul>

<h3>第2-3周：防水与瓷砖</h3>
<ul>
  <li><strong>淋浴区防水（2-3天含养护）：</strong>这一步不能赶工。无论Schluter系统、RedGard防水膜还是传统泥浆基层，都需充分养护才能铺砖。</li>
  <li><strong>瓷砖铺贴（3-5天）：</strong>地砖、淋浴墙砖、壁龛安装。复杂图案或大规格瓷砖耗时更长。最少24-48小时养护后方可填缝。</li>
  <li><strong>填缝与密封（1-2天）：</strong>含填缝养护时间，养护充分后才能使用淋浴间。</li>
</ul>

<h3>第3-5周：洁具与收口</h3>
<ul>
  <li><strong>浴室柜与洁具安装（2-3天）：</strong>安装浴室柜、台面（如分件）、水龙头、马桶、淋浴花洒、镜子和配件。</li>
  <li><strong>玻璃淋浴房（1-2天安装，加1-2周定制加工期）：</strong>无框淋浴玻璃须在瓷砖铺贴完成后测量，通常需1-2周加工。</li>
  <li><strong>收口（1-2天）：</strong>补漆、打胶、五金、最终检验。</li>
</ul>

<p>我们的北温哥华豪华无坎淋浴浴室完工用时3-4周；枫岭带定制玻璃门浴室也是3-4周——提前订购玻璃是关键。本拿比主卫定制功能浴室因工程复杂用时4-5周。</p>

<h2>地下室翻新工期：8-12周</h2>

<p>地下室改造工期普遍长于厨卫，原因在于面积更大，且所有主要工种必须按顺序推进：龙骨、电气、水管（如新增卫浴）、保温、石膏板、地板、全面收口。每个阶段必须完工并通过检验才能启动下一阶段。</p>

<h3>第一阶段——龙骨与粗装（第1-3周）</h3>
<ul>
  <li><strong>龙骨（3-5天）：</strong>隔墙、暗箱、卫浴龙骨、窗口框架。须经许可和龙骨检验。</li>
  <li><strong>水管粗装（2-4天）：</strong>新增卫浴需凿混凝土布置排水管线——含凿凿工程及混凝土养护，额外1-2天。</li>
  <li><strong>电气粗装（3-5天）：</strong>地下室套房的完整回路布置——卧室、卫浴、客厅、厨房（如适用）。须经检验。</li>
  <li><strong>保温（2-3天）：</strong>墙内矿棉，楼板边缘喷涂泡沫，蒸汽屏障。须经保温检验。</li>
</ul>

<h3>第二阶段——石膏板（第3-5周）</h3>
<ul>
  <li><strong>石膏板安装（3-5天）：</strong>上板、贴纸带、批腻子。每道腻子需24小时干燥——最少3道意味着至少3天等待时间。</li>
  <li><strong>打磨与底漆（2-3天）：</strong>不可赶工，否则影响最终面漆质量。</li>
</ul>

<h3>第三阶段——收口（第6-10周）</h3>
<ul>
  <li><strong>地板（3-5天）：</strong>LVP、地毯或瓷砖，依空间用途而定。悬浮式地板安装最快；带地暖系统的瓷砖地板耗时更长。</li>
  <li><strong>卫浴精装（如适用，1-2周）：</strong>瓷砖、浴室柜、洁具——与其他收口工程同步推进。</li>
  <li><strong>厨房/小厨（如适用，1-2周）：</strong>橱柜、台面、电器——如需打造合法出租套房，工期显著增加。</li>
  <li><strong>油漆、线脚与收口（1周）：</strong>门、窗线脚、踢脚板、五金、最终电气连接、灯具安装。</li>
</ul>

<p>带完整厨卫的合法出租套房开发处于工期上限——因额外的许可要求和工种协调，预计需要10-14周。</p>

<h2>全屋翻新工期：2-6个月</h2>

<table>
  <thead>
    <tr><th>改造范围</th><th>典型工期</th><th>包含内容</th></tr>
  </thead>
  <tbody>
    <tr><td>表面翻新</td><td>6-10周</td><td>全屋换地板、刷新油漆、更换洁具，无结构变动</td></tr>
    <tr><td>中等改造</td><td>3-4个月</td><td>厨房更新、1-2间浴室翻新、新地板、电气升级</td></tr>
    <tr><td>全面改造</td><td>4-6个月</td><td>结构变动、全新厨房、多间浴室、地下室开发</td></tr>
  </tbody>
</table>

<h2>导致工期延误的主要原因</h2>

<h3>1. 建筑许可审批时间</h3>
<p>温哥华市针对结构工程、电气面板或新增水管的建筑许可审批需要<strong>4-8周</strong>。素里和本拿比通常较快（2-4周）。许可计时从提交图纸开始——而非从开始施工算起。有经验的承包商会在项目开工前提前申请许可，确保审批通过时间与拆除工程同步。</p>

<h3>2. 定制材料备货期</h3>
<ul>
  <li>BC本地厂家定制橱柜：6-10周</li>
  <li>定制/特殊订货瓷砖（进口或特别订制）：4-8周</li>
  <li>定制台面加工：放样后1-2周</li>
  <li>定制玻璃淋浴房：测量后1-2周</li>
  <li>特殊订货洁具：2-6周</li>
</ul>

<h3>3. 工人档期</h3>
<p>温哥华装修市场竞争激烈。技术熟练的瓷砖工、定制橱柜安装工和玻璃技师在旺季（春季3-6月、秋季9-11月）通常提前4-8周排满。在这些时间段启动的项目需要提前预约工人。</p>

<h3>4. 隐蔽条件</h3>
<p>老温哥华房屋（1980年前）拆除时经常发现：地板砖或石膏板纹理中的石棉（需专业清除，1-3天含检测）、需全面更换的铝线或花线布线、镀锌水管、非标准龙骨间距增加瓷砖背板难度、长年细微渗漏导致的水损。建议在工期计划中预留10-15%的缓冲时间。</p>

<h2>如何减少延误</h2>

<h3>提前启动许可申请流程</h3>
<p>如项目需要许可，在计划开工前就提交图纸。6周的许可审批期不必延长您的开工时间——只要提前规划好。您的承包商应在设计阶段就告知您许可要求。</p>

<h3>在施工开始前订购材料</h3>
<p>我们在厨房项目中见到的最大延误来源是定制橱柜备货期。在设计方案确认时就下橱柜订单——而不是等到拆除开始后再订。特殊瓷砖和定制洁具同理。材料应在项目开工前到货，而不是让工人等待材料。</p>

<h3>签合同前确认工人档期</h3>
<p>签署装修合同前，明确询问："您目前的档期如何？这个项目什么时候能开工？" 承包商下周能开工但电工还要六周才有空，这本质上是在给您制造延误。靠谱的承包商会在确认开工日期前规划好完整的工种排班。</p>

<h3>提前确认所有材料选型</h3>
<p>施工开始后更改设计是工期延误最具破坏性、代价最高的来源。橱柜安装后更换台面材料意味着重新放样和加工，至少再等2周。防水完成后更换瓷砖意味着拆除重做。在拆除开始前锁定所有选材。</p>

<h2>我们真实项目的工期数据</h2>

<ul>
  <li><strong>朗里厨房（瀑布岛台）：</strong>4-6周</li>
  <li><strong>本拿比定制木纹橱柜厨房：</strong>4-5周</li>
  <li><strong>北温哥华豪华无坎淋浴浴室：</strong>3-4周</li>
  <li><strong>枫岭定制玻璃门浴室：</strong>3-4周</li>
  <li><strong>本拿比主卫定制功能浴室：</strong>4-5周</li>
  <li><strong>本拿比联排别墅浴室（紧凑改造）：</strong>2-3周</li>
  <li><strong>列治文公寓（厨房+浴室+地板）：</strong>4-5周</li>
  <li><strong>温哥华全屋翻新：</strong>4-5周（聚焦范围）</li>
  <li><strong>温哥华美容实验室商业改造：</strong>4-5个月（大型商业项目）</li>
</ul>

<p>想了解您项目的详细工期安排？我们的<a href="/zh/services/">装修服务</a>团队会在每份报价中提供完整的项目进度计划，在施工开始前就规划好完整的工种排班，让您清楚知道每个阶段的预期时间。<a href="/zh/contact/">预约工期评估</a>，我们将为您的具体项目和预算提供切实可行的建议。</p>

<p>想了解装修成本？我们的<a href="/zh/blog/average-bathroom-renovation-cost-vancouver/">浴室翻新费用指南</a>和<a href="/zh/blog/">完整装修攻略专栏</a>涵盖温哥华装修规划和预算的全面信息。</p>`,
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
      r.rows.length ? 'Inserted: ' + r.rows[0].slug : 'Skip: ' + p.slug
    );
  }
  await pool.end();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
