import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const FAQ_SECTION_EN = `
<h2>Frequently Asked Questions</h2>

<h3>How much does a bathtub replacement cost in Vancouver in 2026?</h3>
<p>A straight like-for-like acrylic alcove swap runs $800–$2,200 installed in Metro Vancouver in 2026. Upgrading to a cast-iron alcove tub costs $1,500–$3,500 installed. A drop-in soaking tub with a tiled surround runs $2,500–$5,500, while a freestanding tub with new plumbing supply lines ranges $3,500–$8,500+. A full tub-to-shower conversion — the most common upgrade in aging-in-place renovations — costs $4,000–$10,000 depending on glass, tile, and drain configuration.</p>

<h3>Do I need a permit to replace a bathtub in Vancouver?</h3>
<p>A straight bathtub swap — removing an old tub and installing a new one in the same location with no plumbing rough-in changes — does not normally require a permit in Metro Vancouver. However, if you are moving the drain location, converting a tub to a shower (which changes the wet-zone footprint), or working in a condo (which requires strata approval and potentially a building permit), you will need permits. Reno Stars handles all permit research as part of our standard project scoping.</p>

<h3>How long does a bathtub renovation take?</h3>
<p>A straightforward alcove like-for-like swap takes 2–4 days of labour once the new tub is on site. A drop-in tub with a tiled surround takes 1–2 weeks. A tub-to-shower conversion with curbless tile work and frameless glass typically runs 1–2 weeks. Luxury freestanding installs with floor-mount plumbing and structural reinforcement can take 2–3 weeks. Lead time on custom tubs and specialty faucets can add 4–8 weeks on top of labour time.</p>

<h3>Can I replace my bathtub with a shower in a condo?</h3>
<p>Yes, but condo tub-to-shower conversions require strata approval before any work begins. Most Vancouver-area stratas require a formal building permit application as well, which adds 4–8 weeks to the timeline. Condo conversions also typically require concrete coring for the new drain line (if the shower is moving location), which can cost $2,500–$4,000 on top of the conversion itself. Reno Stars has managed dozens of condo wet-work renovations in Metro Vancouver — we handle the strata application process as part of every condo project.</p>

<h3>What is the best bathtub material for a Vancouver climate?</h3>
<p>Cast iron is the top performer in Vancouver's climate because of its heat retention — it stays warm significantly longer than acrylic during a long soak, which matters in a city where people use their tubs year-round. Acrylic is the most popular choice for budget and mid-range renovations because it is lightweight (easy to install on upper floors without structural reinforcement), warm to the touch, and easy to maintain. For a forever home master ensuite, we generally recommend cast iron or stone resin for the heat retention and durability; for rental units, secondary baths, or quick refreshes, acrylic is the practical choice.</p>

<h3>Will a tub-to-shower conversion hurt my home's resale value in Metro Vancouver?</h3>
<p>It depends on how many other bathrooms your home has. If you have at least one other tub in the home, converting a second or third bathroom to a shower will not hurt resale and may help — buyers appreciate a modern shower. However, if this is your only full bathroom, removing the only tub can reduce your home's appeal to families and reduce resale value by $5,000–$15,000 in Metro Vancouver. The exception is studio and one-bedroom condos targeted at single occupants who never bathe — in those units, a tub-to-shower conversion is a net positive.</p>

<h3>How do I choose a contractor for bathtub work in Vancouver?</h3>
<p>Look for a contractor who specialises in bathroom renovations (not a general handyperson), carries $5 million+ CGL insurance and WCB coverage, provides a written quote with line-item pricing, and can show you in-person references from similar bathtub or bathroom projects in your neighbourhood. Reno Stars carries $5 million CGL insurance, WCB coverage, and offers free in-home consultations with three priced options across different tiers. All of our bathtub and bathroom projects include a written scope, a fixed price, and a completion timeline.</p>

<h3>Does Reno Stars offer financing for bathroom renovations?</h3>
<p>Yes. Reno Stars partners with a Vancouver-based financing broker to offer installment payment plans for bathroom and bathtub renovations. Financing is available for projects over $3,000 and can spread payments over 12–60 months. Ask us about financing when you book your free in-home consultation — we'll walk you through the options that fit your budget.</p>
`;

const FAQ_SECTION_ZH = `
<h2>常见问题</h2>

<h3>2026年温哥华更换浴缸需要多少钱？</h3>
<p>等量替换亚克力嵌入式浴缸，温哥华2026年安装价 $800–$2,200。升级为铸铁嵌入式浴缸 $1,500–$3,500。下沉式浴缸配瓷砖围裙 $2,500–$5,500。独立式浴缸含新供水管线 $3,500–$8,500+。浴缸改淋浴（最常见的养老装修升级）$4,000–$10,000，取决于玻璃、瓷砖和地漏配置。</p>

<h3>温哥华更换浴缸需要申请许可证吗？</h3>
<p>直接更换浴缸——在原位置拆除旧浴缸安装新浴缸，且不改变管道点位——通常不需要许可证。但是，如果需要移动下水位置、将浴缸改为淋浴（改变湿区范围），或是在公寓中施工（需要业主立案局批准并可能需要建筑许可证），则必须申请许可证。Reno Stars会在标准项目范围界定中处理所有许可研究工作。</p>

<h3>浴缸装修需要多长时间？</h3>
<p>直接嵌入式等量替换，上门后2–4天。下沉式浴缸配瓷砖围裙1–2周。无障碍瓷砖淋浴改造（无门槛地漏+无框玻璃）1–2周。豪华独立式安装配地面管道和结构加固需2–3周。定制浴缸和特殊龙头的备货时间在此基础上额外增加4–8周。</p>

<h3>我可以在公寓里把浴缸改成淋浴吗？</h3>
<p>可以，但公寓浴缸改淋浴必须先获得业主立案局批准。温哥华大多数立案局还要求正式的的建筑许可证申请，额外增加4–8周时间。公寓改造如果淋浴需要移位，通常还需要混凝土取芯铺设新排水管，费用 $2,500–$4,000。Reno Stars在大温地区已成功完成数十个公寓湿区装修项目——我们负责处理所有业主立案局申请流程。</p>

<h3>温哥华气候最适合哪种材质的浴缸？</h3>
<p>铸铁浴缸在温哥华气候下表现最佳，保温性能优异——长时间泡澡时温度保持远优于亚克力，这在全年都有人使用浴缸的城市非常重要。亚克力是预算和中档装修最受欢迎的选择，因为重量轻（楼上安装无需结构加固）、触感温暖、维护简单。对于永久自住的 主卧浴室，建议选择铸铁或树脂石以获得更好的保温性和耐久性；对于出租房、次卫或快速翻新，亚克力是实用选择。</p>

<h3>浴缸改淋浴会影响大温哥华地区的房产转售价值吗？</h3>
<p>取决于您家有多少其他浴室。如果您至少还有一个浴缸，将第二或第三个浴室改为淋浴不会影响转售，甚至可能有所帮助——买家欣赏现代淋浴体验。但是，如果这是您唯一的全卫，去掉唯一浴缸会降低对家庭买家的吸引力，使大温地区转售价值降低 $5,000–$15,000。开间和一卧公寓（针对从不泡澡的单人居住者）例外——在这些单位，浴缸改淋浴是净正效益。</p>

<h3>如何在温哥华选择浴缸装修承包商？</h3>
<p>选择专门从事浴室装修（而非杂项维修人员）的承包商，持有 $500万以上CGL保险和WCB保障，提供逐项书面报价，并能展示与您所在社区类似浴缸或浴室项目的现场参考资料。Reno Stars持有 $500万CGL保险、WCB保障，提供免费上门咨询和三档定价方案。所有浴缸和浴室项目均包含书面范围、固定价格和完工时间表。</p>

<h3>Reno Stars提供浴室装修分期付款吗？</h3>
<p>是的。Reno Stars与温哥华当地融资经纪商合作，为浴室和浴缸装修项目提供分期付款计划。$3,000以上的项目可申请分期，付款期可分散至12–60个月。预约免费上门咨询时请询问融资选项——我们将为您介绍适合预算的方案。</p>
`;

async function run() {
  const slug = 'bathtub-renovation-cost-vancouver';

  // Fetch current post
  const current = await pool.query(
    'SELECT id, content_en, content_zh FROM blog_posts WHERE slug = $1',
    [slug]
  );

  if (current.rows.length === 0) {
    console.error('Post not found:', slug);
    process.exit(1);
  }

  const post = current.rows[0];
  const currentContentEn = post.content_en || '';
  const currentContentZh = post.content_zh || '';

  // Check if FAQ section already exists
  if (currentContentEn.includes('Frequently Asked Questions') || currentContentEn.includes('FAQ')) {
    console.log('FAQ section already exists in EN content — skipping add.');
  } else {
    // Append FAQ section before </article>
    const newContentEn = currentContentEn.replace(/<\/article>\s*$/, FAQ_SECTION_EN + '\n</article>');
    const newContentZh = currentContentZh.replace(/<\/article>\s*$/, FAQ_SECTION_ZH + '\n</article>');

    await pool.query(
      `UPDATE blog_posts
       SET content_en = $1, content_zh = $2,
           content_updated_at = NOW(),
           updated_at = NOW()
       WHERE slug = $3`,
      [newContentEn, newContentZh, slug]
    );
    console.log('Updated:', slug);
    console.log('FAQ section added (EN + ZH)');
  }

  await pool.end();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
