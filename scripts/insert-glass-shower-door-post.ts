import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const slug = 'glass-shower-doors-vancouver-frameless-semi-frameless-sliding';
const heroImage =
  'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/luxury-bathroom-renovation-north-vancouver-hero-mmxy475p.jpg';

const titleEn =
  'Glass Shower Doors Vancouver 2026: Frameless vs Semi-Frameless vs Sliding (Real Costs & Examples)';
const titleZh =
  '温哥华玻璃淋浴门 2026：无框 vs 半无框 vs 推拉门（真实费用与项目实例）';
const titleZhHant =
  '溫哥華玻璃淋浴門 2026：無框 vs 半無框 vs 推拉門（真實費用與項目實例）';
const titleJa =
  'バンクーバー・ガラスシャワードア 2026：フレームレス・セミフレームレス・スライディング比較（実費用＋実例）';
const titleKo =
  '밴쿠버 유리 샤워 도어 2026: 프레임리스 vs 세미프레임리스 vs 슬라이딩 (실제 비용+사례)';
const titleEs =
  'Puertas de Ducha de Vidrio Vancouver 2026: Sin Marco vs Semi-Sin Marco vs Corredizas (Costos Reales y Ejemplos)';

const metaTitleEn =
  'Glass Shower Doors Vancouver 2026 | Frameless vs Sliding | Reno Stars';
const metaTitleZh = '温哥华玻璃淋浴门 2026 | 无框 vs 推拉门 | Reno Stars';
const metaTitleZhHant = '溫哥華玻璃淋浴門 2026 | 無框 vs 推拉門 | Reno Stars';
const metaTitleJa =
  'バンクーバー・ガラスシャワードア 2026 | フレームレス vs スライディング | Reno Stars';
const metaTitleKo =
  '밴쿠버 유리 샤워 도어 2026 | 프레임리스 vs 슬라이딩 | Reno Stars';
const metaTitleEs =
  'Puertas de Ducha de Vidrio Vancouver 2026 | Sin Marco vs Corredizas | Reno Stars';

const metaDescEn =
  'Frameless vs semi-frameless vs sliding shower doors Vancouver: real costs $800–$5,500+, pros, cons, BC code, 6 Reno Stars projects.';
const metaDescZh =
  '温哥华无框/半无框/推拉淋浴门：真实安装价$800–$5,500+，优缺点、BC省规范、Reno Stars真实项目6例。';
const metaDescZhHant =
  '溫哥華無框/半無框/推拉淋浴門：真實安裝價$800–$5,500+，優缺點、BC省規範、Reno Stars真實項目6例。';
const metaDescJa =
  'バンクーバーのフレームレス/セミフレームレス/スライディング・シャワードア：実費用$800–$5,500+、長短、BC規格、Reno Stars実例6件。';
const metaDescKo =
  '밴쿠버 프레임리스/세미프레임리스/슬라이딩 샤워 도어: 설치비 $800–$5,500+, 장단점, BC 코드, Reno Stars 실제 6건.';
const metaDescEs =
  'Puertas de ducha sin marco/semi-sin marco/corredizas Vancouver: costos $800–$5,500+, pros, contras, código BC, 6 proyectos Reno Stars.';

const focusKwEn = 'glass shower doors vancouver';
const focusKwZh = '温哥华玻璃淋浴门';

const excerptEn =
  "Frameless vs semi-frameless vs sliding — which glass shower door is right for your Vancouver bathroom? Frameless installed runs $1,800–$5,500+ in Metro Vancouver; semi-frameless $1,200–$2,400; sliding bypass $800–$1,800. Each has trade-offs in cost, glass thickness, water containment, and hardware longevity. Here's the real breakdown from six recent Reno Stars bathroom projects, with the code rules (CSA tempered, BC Plumbing Code clearances) you have to hit either way.";
const excerptZh =
  '无框 vs 半无框 vs 推拉——哪种玻璃淋浴门适合你的温哥华浴室？大温安装价：无框 $1,800–$5,500+；半无框 $1,200–$2,400；推拉对滑 $800–$1,800。各有取舍：成本、玻璃厚度、防水围护、五金寿命。本文基于Reno Stars近期六个真实项目，附必须满足的规范（CSA钢化、BC管道规范防水间距）。';
const excerptZhHant =
  '無框 vs 半無框 vs 推拉——哪種玻璃淋浴門適合你的溫哥華浴室？大溫安裝價：無框 $1,800–$5,500+；半無框 $1,200–$2,400；推拉對滑 $800–$1,800。各有取捨：成本、玻璃厚度、防水圍護、五金壽命。本文基於Reno Stars近期六個真實項目，附必須滿足的規範（CSA鋼化、BC管道規範防水間距）。';
const excerptJa =
  'フレームレス vs セミフレームレス vs スライディング――バンクーバーの浴室に合うのはどれか？メトロ・バンクーバーの設置価格：フレームレス $1,800–$5,500+、セミフレームレス $1,200–$2,400、スライディング・バイパス $800–$1,800。コスト・ガラス厚・水の封じ込め・金物の耐用年数でトレードオフがある。Reno Starsの最近6件の実例と、必須規格（CSA強化ガラス・BC配管コードのクリアランス）を解説。';
const excerptKo =
  '프레임리스 vs 세미프레임리스 vs 슬라이딩 — 밴쿠버 욕실에 어떤 유리 샤워 도어가 맞을까요? 메트로 밴쿠버 설치비: 프레임리스 $1,800–$5,500+, 세미프레임리스 $1,200–$2,400, 슬라이딩 바이패스 $800–$1,800. 비용·유리 두께·물막이·하드웨어 수명에서 트레이드오프가 있습니다. Reno Stars의 최근 6개 실제 프로젝트와 반드시 충족해야 할 규정(CSA 강화유리, BC 배관 코드 이격거리)을 정리합니다.';
const excerptEs =
  'Sin marco vs semi-sin marco vs corredizas — ¿cuál puerta de ducha es la adecuada para tu baño en Vancouver? Precios instalados en Metro Vancouver: sin marco $1,800–$5,500+; semi-sin marco $1,200–$2,400; corrediza bypass $800–$1,800. Cada una tiene compromisos en costo, espesor del vidrio, contención de agua y vida útil del herraje. Aquí está el desglose real de seis proyectos recientes de Reno Stars, con las reglas de código (CSA templado, holguras del BC Plumbing Code) que debes cumplir igualmente.';

const contentEn = `<article>
<h1>Glass Shower Doors Vancouver 2026: Frameless vs Semi-Frameless vs Sliding (Real Costs &amp; Examples)</h1>

<p class="lead">A glass shower door is one of the highest-impact decisions in a bathroom renovation — it sets the visual style, drives 10–25% of the budget, and lives with the homeowner for 15–25 years before the hardware fails. After 200+ Metro Vancouver bathroom projects, here's the honest breakdown of frameless vs semi-frameless vs sliding bypass doors: what each costs installed, where each one wins, and where Vancouver homeowners regret their choice.</p>

<h2>Quick comparison: cost, thickness, look, longevity</h2>
<table>
<thead><tr><th>Type</th><th>Vancouver installed</th><th>Glass thickness</th><th>Look</th><th>Hardware lifespan</th><th>Best for</th></tr></thead>
<tbody>
<tr><td>Sliding bypass (framed)</td><td>$800 – $1,800</td><td>1/4" (6mm)</td><td>Utilitarian, visible aluminum frame</td><td>10–15 yrs (rollers wear)</td><td>Tubs, rentals, secondary baths, narrow openings</td></tr>
<tr><td>Semi-frameless pivot or hinged</td><td>$1,200 – $2,400</td><td>3/8" (10mm)</td><td>Clean, minimal hardware</td><td>15–20 yrs</td><td>Family ensuites, mid-range master baths</td></tr>
<tr><td>Frameless fixed panel + hinged door</td><td>$1,800 – $3,800</td><td>1/2" (12mm)</td><td>Premium, near-invisible</td><td>20–25 yrs</td><td>Master ensuites, walk-in showers, design-first projects</td></tr>
<tr><td>Frameless curbless walk-in (full enclosure)</td><td>$3,200 – $5,500+</td><td>1/2" (12mm)</td><td>Spa, gallery-grade</td><td>20–25 yrs</td><td>Luxury master ensuites, accessibility builds</td></tr>
<tr><td>Sliding bypass (frameless on track)</td><td>$2,400 – $4,200</td><td>3/8"–1/2"</td><td>Modern, narrow-frame</td><td>15–20 yrs</td><td>Tub conversions in tight spaces, modern condos</td></tr>
</tbody>
</table>
<p><em>Prices are installed and include the glass, hardware (hinges, clips, header bar where applicable), templating, delivery, and standard installation labour. CSA-certified tempered glass is included on all tiers (it's mandatory in BC). Custom notches, low-iron "ultra-clear" glass upgrades, and wall reinforcement for heavy frameless panels are billed separately.</em></p>

<h2>What's actually different between the three</h2>

<h3>1. Frameless (the premium choice)</h3>
<p>Frameless means no metal channel around the glass — just heavy 1/2" tempered glass panels held by stainless or solid brass hinges anchored directly into the wall, plus minimal clips at the floor and corners. The fixed panel typically meets the hinged door at a 90° angle in walk-in showers; in alcove showers a single hinged door with no fixed panel is common.</p>
<ul>
<li><strong>Glass thickness:</strong> 1/2" (12mm) is the Vancouver standard for frameless. Anything thinner won't hold its alignment without a frame.</li>
<li><strong>Hardware:</strong> Concealed hinges (Brass U.S. Horizon, CRL Pinnacle, Frameless Showers Direct) anchor into solid backing — installer must know there's a 2x6 or 3/4" plywood blocking behind the tile in the door-jamb stud bay. Cut the wrong stud bay during framing and the frameless option dies.</li>
<li><strong>Water containment:</strong> Frameless doors don't seal — they have a 3/16" gap at the bottom (for hinge clearance) and rely on the curb height + shower head placement to keep water in. A poorly designed frameless can splash out. Mitigated by: 4"+ curb height, header dam, shower head pointed away from the door.</li>
<li><strong>Cost driver:</strong> Glass thickness (1/2" tempered runs ~$45–$60/sq ft vs $20–$30/sq ft for 1/4"), hardware ($300–$700 set), and the templating + installation difficulty (2-person job, glass is 80–120 lbs per panel).</li>
<li><strong>Where it wins:</strong> Master ensuites where the bathroom is a "show" room. Walk-in curbless luxury showers. Modern aesthetic where you want the eye to travel through the glass.</li>
</ul>

<h3>2. Semi-frameless (the value sweet spot)</h3>
<p>Semi-frameless uses 3/8" (10mm) tempered glass with a slim frame on the perimeter (typically just a header bar at the top, plus channel along the wall edge). The door itself has no frame — the glass edge swings free.</p>
<ul>
<li><strong>Glass thickness:</strong> 3/8" (10mm) — thick enough to hold without a frame, thinner than frameless so 30% cheaper at the glass shop.</li>
<li><strong>Hardware:</strong> Header bar (chrome, brushed nickel, brushed gold, matte black are all standard) provides structural support so hinges don't pull on the wall as hard. Easier to retrofit into existing tile because the header carries some load.</li>
<li><strong>Water containment:</strong> Slightly better than frameless because the header bar acts as a splash guard at the top. Still not sealed at the bottom.</li>
<li><strong>Cost driver:</strong> 3/8" glass (~$30–$40/sq ft), simpler hardware ($150–$350 set), faster install (single-person feasible on smaller doors).</li>
<li><strong>Where it wins:</strong> Family ensuites and mid-range master baths where you want the clean look without the frameless cost premium. Often the best dollar-per-look choice for a $20K–$32K Vancouver bathroom.</li>
</ul>

<h3>3. Sliding bypass (the budget + tub option)</h3>
<p>Sliding bypass doors run on a top track (and sometimes a bottom track too). Two glass panels overlap and slide past each other — no swing arc, no clearance needed in front of the shower or tub. Available in framed (1/4" glass with full aluminum frame) and frameless-on-track (3/8"+ glass with minimal hardware) variants.</p>
<ul>
<li><strong>Framed sliding (the budget tier):</strong> 1/4" tempered glass, aluminum frame, plastic rollers. The default choice for tub-shower combos in rentals, secondary bathrooms, and budget-conscious primary builds. Rollers wear in 10–15 years and need replacement (~$200–$400).</li>
<li><strong>Frameless on track (the modern tier):</strong> 3/8"–1/2" glass with stainless steel header track and concealed rollers. Looks closer to frameless but solves the tight-space problem. Hard to find under $2,400 installed in Vancouver.</li>
<li><strong>Glass thickness:</strong> 1/4" framed, 3/8"–1/2" frameless on track.</li>
<li><strong>Water containment:</strong> Best of the three when properly installed — track + frame seals the perimeter. Worst when rollers wear and the door drifts out of alignment.</li>
<li><strong>Cost driver:</strong> The track and rollers ($150–$500 hardware set) plus the simpler installation. No hinge anchoring required.</li>
<li><strong>Where it wins:</strong> Tub-shower conversions where there's no swing room, tight Vancouver condo bathrooms, accessibility builds where a hinged door is a fall hazard.</li>
</ul>

<h2>Six real Reno Stars projects (and what each cost)</h2>

<h3>Project 1 — Coquitlam standard bath: framed sliding tub door</h3>
<p>A standard tub-shower combo in a Coquitlam townhouse. The client wanted to convert the old curtain to a glass enclosure but had a $14K–$17K total bathroom budget. We installed a framed sliding bypass (chrome frame, 1/4" tempered glass, 60" opening) for <strong>$980 installed</strong> as part of the bathroom refresh. The framed look isn't fancy, but it solves the splash problem and matches the rest of the budget tier finishes. Project: <a href="/en/projects/coquitlam-standard-bathroom-renovation-shower-conversion/">Coquitlam shower conversion</a>.</p>

<h3>Project 2 — Burnaby townhouse: semi-frameless pivot</h3>
<p>A Burnaby townhouse master ensuite, $20K–$25K bathroom budget. The client wanted "as clean as possible without spending master-bath money." We specified a semi-frameless pivot door (3/8" tempered glass, brushed nickel header bar, 30" wide) for <strong>$1,650 installed</strong>. The header bar matched the towel bar and faucet finish, which sealed the cohesive look. Three years later, zero hardware issues. Project: <a href="/en/projects/burnaby-townhouse-bathroom-renovation-custom-features/">Burnaby townhouse bathroom</a>.</p>

<h3>Project 3 — Maple Ridge custom glass door (90° walk-in)</h3>
<p>A Maple Ridge bathroom remodeled around a 36" × 36" walk-in shower. The client wanted frameless but on a $18K–$21K total budget — tight for full frameless. We delivered a custom-templated frameless 90° configuration (fixed return panel + hinged door, both 1/2" tempered) for <strong>$2,950 installed</strong>, anchored into a 2x6 stud bay we framed during demo specifically for the door. The "custom glass door" became the focal point of the entire bathroom — and the project name. Project: <a href="/en/projects/maple-ridge-bathroom-renovation-custom-glass-door-2/">Maple Ridge custom glass door bathroom</a>.</p>

<h3>Project 4 — Burnaby luxury bathroom: full frameless walk-in</h3>
<p>Burnaby master ensuite, $28K–$32K budget, with a 60" × 36" walk-in shower replacing an old tub. Specified frameless 1/2" tempered glass with low-iron "ultra-clear" upgrade (kills the green tint you get on standard tempered when looking through edges), brushed gold hinges to match the Brizo plumbing line. Total <strong>$3,650 installed</strong> — about 12% of the bathroom budget, but the most-photographed element of the finished room. Project: <a href="/en/projects/luxury-bathroom-renovation-burnaby/">Burnaby luxury bathroom</a>.</p>

<h3>Project 5 — North Vancouver curbless: frameless full enclosure</h3>
<p>North Vancouver master ensuite, $42K–$45K budget, designed around a curbless walk-in shower with linear drain and continuous tile from bathroom floor to shower floor. Required a full 1/2" frameless enclosure: fixed panel + door + return panel + 8' overhead glass header to keep the steam contained. <strong>$5,200 installed</strong>, including the steel-and-glass header dam. The curbless tile-through layout demanded the frameless treatment — semi-frameless or sliding would have visually broken the floor plane. Project: <a href="/en/projects/luxury-bathroom-renovation-north-vancouver/">North Vancouver curbless luxury bathroom</a>.</p>

<h3>Project 6 — West Vancouver champagne gold luxury bath</h3>
<p>West side luxury renovation, $36K–$40K bathroom budget. Frameless 1/2" tempered glass, oil-rubbed champagne gold hinges (matched to the Kohler Stillness fixture suite), polished edges throughout. The hardware spec alone added $400 over standard chrome, but the cohesion across plumbing/door/towel bar was non-negotiable for the design intent. <strong>$4,400 installed</strong>. Project: <a href="/en/projects/west-vancouver-luxury-bathroom-champagne-gold/">West Van champagne gold ensuite</a>.</p>

<h2>BC code &amp; safety rules every shower glass installer should follow</h2>
<ul>
<li><strong>CSA-certified tempered glass is mandatory.</strong> The BC Building Code (BCBC) Section 9.6 requires safety glass in all shower enclosures. Tempered (CSA Z97.1 or ANSI Z97.1) is the standard. Unmarked or non-tempered glass is a code violation and an insurance liability — if it shatters, it can cause severe lacerations.</li>
<li><strong>Each panel must show a permanent etched bug.</strong> CSA certification is identified by a permanent acid-etched logo in one corner. Walk away from any glass shop that supplies "tempered" glass without the bug.</li>
<li><strong>Curb height: 4" minimum, 6" recommended for frameless.</strong> The BC Plumbing Code minimum curb is 2", but with frameless doors that don't seal at the bottom, 4–6" is the practical minimum to keep water in.</li>
<li><strong>Backing in the wall is non-negotiable for frameless.</strong> 2x6 framing or 3/4" plywood blocking behind the tile in the hinge stud bay. This is a framing decision — it has to happen during demo, before the cement board goes up. Retrofitting after tile is set means cutting out finished tile.</li>
<li><strong>Tempered glass cannot be cut or drilled after tempering.</strong> All notches for hinges, clamps, and header attachments must be templated by the glass shop and cut before tempering. A measurement error means a new $300–$1,200 panel.</li>
<li><strong>Steam showers need overhead glass.</strong> If the design includes a steam generator (common in luxury projects), the door must be capped at the top with glass to contain steam and prevent fogging the rest of the bathroom. Adds $400–$1,500 for the glass cap.</li>
</ul>

<h2>Where Vancouver homeowners get the choice wrong</h2>
<ol>
<li><strong>Choosing frameless on a tub-shower combo.</strong> Frameless hinged doors don't work well over a bathtub because the hinge has nothing solid to anchor into (drywall over a tub deck won't hold 80 lbs of glass). Sliding bypass — framed or frameless on track — is the correct choice here. We've been called in to retrofit when other contractors tried this and the door pulled away from the wall within 18 months.</li>
<li><strong>Skipping the wall backing during framing.</strong> If you don't tell your contractor "this stud bay needs blocking for a frameless door" during demo, you'll either lose the frameless option later or pay $1,200–$2,000 to cut out finished tile and add blocking after the fact.</li>
<li><strong>Buying frameless without confirming wall flatness.</strong> Frameless glass needs a wall that's flat within 1/8" over its height. Old Vancouver tile walls (especially 4×4" tile pre-2000) often have 1/4"–1/2" undulations. If the wall isn't flat, the glass either pinches in spots or sits with visible gaps. Adds $400–$800 to skim-coat the wall before tile if discovered late.</li>
<li><strong>Choosing the cheapest framed sliding for a primary bathroom.</strong> The plastic rollers on $400–$600 framed sliding sets fail in 5–8 years (we've replaced them on dozens of jobs). For anything but a rental, spend the extra $200–$400 on stainless steel rollers — they last 15–20 years.</li>
<li><strong>Forgetting to specify low-iron glass on tinted lighting designs.</strong> Standard tempered has a green-tint at the edges that's invisible at 1/4" but pronounced at 1/2". On a frameless install with brushed gold or matte black hardware, the green edge fights the design. Low-iron (Starphire, Diamant) adds $150–$400 to the panel cost — almost always worth it on premium installs.</li>
</ol>

<h2>How to budget your shower glass</h2>
<ol>
<li><strong>Decide on enclosure type during the design phase, not the demo phase.</strong> Walk-in vs alcove vs tub-shower drives every other decision (hinge location, curb height, wall framing).</li>
<li><strong>Budget glass at 8–12% of total bathroom cost.</strong> A $25K bathroom should plan $2,000–$3,000 for glass. A $45K luxury build should plan $4,000–$5,500.</li>
<li><strong>Frame for blocking before tile.</strong> Tell the GC where the hinges land. 2x6 or plywood blocking, not 2x4 with drywall.</li>
<li><strong>Order the glass after rough-in, not during design.</strong> Final templates require the actual finished walls, so the glass shop measures after tile is set. Lead time is typically 2–3 weeks from template to install.</li>
<li><strong>Match the hardware finish to the plumbing line.</strong> If the faucets are champagne bronze, the hinges should be too. Mixed finishes are the cheapest visual mistake to avoid.</li>
</ol>

<h2>Frequently asked questions</h2>

<h3>Is frameless really worth the extra $1,500–$2,500?</h3>
<p>For a master ensuite that you'll live with for 15+ years, yes — the visual difference is significant and the hardware longevity is better. For a secondary bathroom or a flip property, no — semi-frameless gets 80% of the look at 60% of the cost.</p>

<h3>Do glass shower doors leak?</h3>
<p>Frameless and semi-frameless don't seal at the bottom by design (3/16" gap for hinge clearance). They rely on curb height + shower head positioning to contain water. If your shower head is pointed at the door, water will splash out — fix it by aiming the head at the back wall. Sliding bypass doors seal better but the seal degrades when rollers wear.</p>

<h3>What thickness of tempered glass do I need?</h3>
<p>1/4" for framed sliding doors only. 3/8" minimum for any unframed door (hinged, pivoted, or frameless on track). 1/2" is the Vancouver standard for true frameless installations, especially for panels over 30" wide. Thicker glass = stiffer panel = less flex = longer hardware life.</p>

<h3>Can I install a glass shower door on an existing tile shower?</h3>
<p>Sliding bypass and semi-frameless: yes, usually. Frameless: only if the wall has 2x6 or plywood blocking behind the tile in the hinge stud bay, which most pre-2010 Vancouver bathrooms don't have. Confirm before committing.</p>

<h3>How long does shower glass installation take?</h3>
<p>From template (day 1) to install (day 14–21) for custom frameless. Standard semi-frameless and framed sliding from in-stock sizes can install same-week. Plan the glass order during rough-in, not after tile.</p>

<h3>Is a curbless walk-in shower realistic on a budget?</h3>
<p>The shower itself is realistic at $25K+ bathrooms. The frameless full enclosure that goes with it pushes the project to $35K+. Curbless on a tight budget usually means a partial enclosure or a half-wall — but check our <a href="/en/blog/bathroom-refresh-without-full-renovation-vancouver-2026/">bathroom refresh guide</a> for refresh-tier curbless conversions.</p>

<h3>Should I splurge on low-iron glass?</h3>
<p>On 1/2" frameless installs with bold hardware finishes (gold, black, bronze), yes — the green tint at the edges of standard tempered fights the design. On 1/4" framed sliding, no — the tint is barely visible.</p>

<h2>Related guides</h2>
<ul>
<li><a href="/en/guides/bathroom-renovation-cost-vancouver/">Bathroom Renovation Cost Vancouver: $10K–$60K Real Data</a> — the parent guide for full bathroom budgets</li>
<li><a href="/en/blog/bathroom-renovation-cost-vancouver-by-style/">Bathroom Renovation Cost by Style: Modern, Spa, Heritage</a> — how style choices drive glass-door selection</li>
<li><a href="/en/blog/bathroom-refresh-without-full-renovation-vancouver-2026/">Bathroom Refresh Without a Full Renovation</a> — when a glass door swap is the right move alone</li>
<li><a href="/en/blog/best-bathroom-tiles-vancouver-2026/">Best Bathroom Tiles Vancouver 2026</a> — wall flatness affects frameless feasibility</li>
<li><a href="/en/blog/toilet-renovation-cost-vancouver/">Toilet Renovation Cost Vancouver</a> — companion fixture-cost guide</li>
<li><a href="/en/blog/vanity-renovation-cost-vancouver/">Vanity Renovation Cost Vancouver</a> — companion fixture-cost guide</li>
<li><a href="/en/blog/bathtub-renovation-cost-vancouver/">Bathtub Renovation Cost Vancouver</a> — when keeping the tub vs going walk-in</li>
<li><a href="/en/services/bathroom/">Bathroom Renovation Services</a> — what we do, how we work</li>
</ul>

<p>Want our recommendation on which door type fits your specific bathroom layout and budget? Send us a photo of the existing setup with rough dimensions, and we'll come back within 48 hours with three priced options across the tiers above. <a href="/en/contact/">Get a free in-home consultation</a>.</p>
</article>`;

const contentZh = `<article>
<h1>温哥华玻璃淋浴门 2026：无框 vs 半无框 vs 推拉门（真实费用与项目实例）</h1>

<p class="lead">玻璃淋浴门是浴室装修中影响最大的决策之一——它定义视觉风格，占预算的10–25%，业主使用15–25年才会因五金老化更换。基于Reno Stars 200+大温浴室项目，本文如实拆解无框 vs 半无框 vs 推拉对滑门：每种安装价多少，谁适合，温哥华业主常在哪选错。</p>

<h2>速查对比：成本、玻璃厚度、外观、寿命</h2>
<table>
<thead><tr><th>类型</th><th>温哥华安装价</th><th>玻璃厚度</th><th>外观</th><th>五金寿命</th><th>最适合</th></tr></thead>
<tbody>
<tr><td>推拉对滑（带框）</td><td>$800 – $1,800</td><td>1/4" (6mm)</td><td>实用，可见铝框</td><td>10–15年（滚轮磨损）</td><td>浴缸、出租房、次卫、窄洞口</td></tr>
<tr><td>半无框旋转/合页</td><td>$1,200 – $2,400</td><td>3/8" (10mm)</td><td>简洁，五金极少</td><td>15–20年</td><td>家庭主卫、中档主浴</td></tr>
<tr><td>无框定面板+合页门</td><td>$1,800 – $3,800</td><td>1/2" (12mm)</td><td>高端，近乎隐形</td><td>20–25年</td><td>主卫、走入式淋浴、设计感优先</td></tr>
<tr><td>无框无门槛走入式（全围）</td><td>$3,200 – $5,500+</td><td>1/2" (12mm)</td><td>水疗级、画廊级</td><td>20–25年</td><td>豪华主卫、无障碍主卫</td></tr>
<tr><td>推拉对滑（轨道式无框）</td><td>$2,400 – $4,200</td><td>3/8"–1/2"</td><td>现代，窄边框</td><td>15–20年</td><td>窄空间浴缸改造、现代公寓</td></tr>
</tbody>
</table>
<p><em>价格为安装到位价，含玻璃、五金（合页、夹片、视情况的顶部支撑杆）、定制测量、运输和标准安装人工。所有档次均含CSA认证钢化玻璃（BC省强制要求）。定制开槽、低铁"超清"玻璃升级、重型无框面板的墙体加固另计。</em></p>

<h2>三种门到底有什么区别</h2>

<h3>1. 无框（高端选择）</h3>
<p>无框=玻璃周围没有金属边框——只有重型1/2"钢化玻璃面板，由不锈钢或实心黄铜合页直接锚固到墙体，地面与转角辅以最少夹片。走入式淋浴中定面板通常与合页门成90°相交；嵌入式淋浴常用单合页门无定面板。</p>
<ul>
<li><strong>玻璃厚度：</strong>1/2"（12mm）是温哥华无框标准。再薄不带框就保不住对位。</li>
<li><strong>五金：</strong>隐藏式合页（Brass U.S. Horizon、CRL Pinnacle、Frameless Showers Direct）锚入实木背衬——安装工必须知道贴砖背后门柱跨距内有2x6或3/4"夹板加强。框架阶段切错跨距，无框选项就废了。</li>
<li><strong>防水围护：</strong>无框门不密封——底部留3/16"间隙（合页间距），靠门槛高度+花洒位置防水。设计不当会溅水。缓解：4"+门槛、顶部挡水、花洒朝向远离门。</li>
<li><strong>成本驱动：</strong>玻璃厚度（1/2"钢化约$45–$60/平方英尺 vs 1/4"的$20–$30）、五金（$300–$700一套）、定制测量+安装难度（双人作业，每片80–120磅）。</li>
<li><strong>胜出场景：</strong>把浴室当"展厅"的主卫。无门槛走入式豪华淋浴。视线穿透玻璃的现代美学。</li>
</ul>

<h3>2. 半无框（性价比甜点）</h3>
<p>半无框使用3/8"（10mm）钢化玻璃，周边带细边框（通常仅顶部支撑杆+靠墙边的U型槽）。门体本身无框——玻璃边缘自由摆动。</p>
<ul>
<li><strong>玻璃厚度：</strong>3/8"（10mm）——足够无框承重，比1/2"薄，玻璃店报价低30%。</li>
<li><strong>五金：</strong>顶部支撑杆（铬、拉丝镍、拉丝金、哑光黑均常规）提供结构支撑，合页对墙的拉力小。更易翻新装入既有瓷砖。</li>
<li><strong>防水围护：</strong>比无框略好——顶部支撑杆兼作顶端挡水。底部仍不密封。</li>
<li><strong>成本驱动：</strong>3/8"玻璃（约$30–$40/平方英尺）、更简单五金（$150–$350一套）、安装更快（小门单人可装）。</li>
<li><strong>胜出场景：</strong>家庭主卫和中档主浴，想要简洁外观又不愿付无框溢价。$20K–$32K温哥华浴室"每元颜值比"通常最高的选择。</li>
</ul>

<h3>3. 推拉对滑（预算+浴缸方案）</h3>
<p>推拉对滑门由顶部轨道（有时还有底轨）承载。两片玻璃错位重叠滑过——无开门弧线，淋浴或浴缸前不需预留摆角空间。分带框（1/4"玻璃+全铝框）和轨道式无框（3/8"+玻璃+极简五金）两类。</p>
<ul>
<li><strong>带框推拉（预算档）：</strong>1/4"钢化玻璃、铝框、塑料滚轮。出租房、次卫、预算紧的主卫的浴缸-淋浴一体方案默认选择。滚轮10–15年磨损需更换（约$200–$400）。</li>
<li><strong>轨道式无框（现代档）：</strong>3/8"–1/2"玻璃+不锈钢顶部轨道+隐藏滚轮。外观接近无框但解决窄空间问题。温哥华很少能在$2,400以下找到。</li>
<li><strong>玻璃厚度：</strong>带框1/4"，轨道式无框3/8"–1/2"。</li>
<li><strong>防水围护：</strong>正确安装时三者中最佳——轨道+边框密封周边。滚轮磨损门跑偏后变最差。</li>
<li><strong>成本驱动：</strong>轨道+滚轮（$150–$500五金套）+ 安装更简单。无需合页锚固。</li>
<li><strong>胜出场景：</strong>无开门空间的浴缸-淋浴改造、温哥华公寓窄浴室、合页门会摔倒的无障碍方案。</li>
</ul>

<h2>Reno Stars六个真实项目（每个花了多少）</h2>

<h3>项目1 — 高贵林标准浴室：带框推拉浴缸门</h3>
<p>高贵林联排别墅标准浴缸-淋浴一体。客户希望把旧浴帘换成玻璃门，但整个浴室预算$14K–$17K。我们装了带框推拉对滑（铬框、1/4"钢化玻璃、60"洞口），<strong>$980安装价</strong>，作为浴室翻新的一部分。带框看起来不高级，但解决了溅水问题且与同档其他配饰呼应。项目：<a href="/zh/projects/coquitlam-standard-bathroom-renovation-shower-conversion/">高贵林淋浴改造</a>。</p>

<h3>项目2 — 本拿比联排：半无框旋转门</h3>
<p>本拿比联排别墅主卫，浴室预算$20K–$25K。客户要"尽量简洁但不花主浴的钱"。我们指定了半无框旋转门（3/8"钢化玻璃、拉丝镍顶部支撑杆、30"宽），<strong>$1,650安装价</strong>。支撑杆颜色与毛巾架、龙头一致，整体观感统一。三年后五金毫无问题。项目：<a href="/zh/projects/burnaby-townhouse-bathroom-renovation-custom-features/">本拿比联排浴室</a>。</p>

<h3>项目3 — 枫树岭定制玻璃门（90°走入式）</h3>
<p>枫树岭浴室，围绕36"×36"走入式淋浴重做。客户想要无框但总预算$18K–$21K——做完整无框很紧。我们交付了定制90°布局（定面板+合页门，皆1/2"钢化），<strong>$2,950安装价</strong>，锚入我们专为这扇门在拆改阶段加的2x6龙骨。"定制玻璃门"成了整个浴室的视觉焦点——也成了项目名。项目：<a href="/zh/projects/maple-ridge-bathroom-renovation-custom-glass-door-2/">枫树岭定制玻璃门浴室</a>。</p>

<h3>项目4 — 本拿比奢华浴室：无框走入式</h3>
<p>本拿比主卫，预算$28K–$32K，60"×36"走入式淋浴替代旧浴缸。指定无框1/2"钢化玻璃+低铁"超清"升级（消除标准钢化的边缘绿色调），拉丝金合页配Brizo水龙头线。<strong>$3,650安装价</strong>——约浴室预算的12%，但成了完工最常被拍照的元素。项目：<a href="/zh/projects/luxury-bathroom-renovation-burnaby/">本拿比奢华浴室</a>。</p>

<h3>项目5 — 北温无门槛：无框完整围护</h3>
<p>北温主卫，预算$42K–$45K，围绕无门槛走入式淋浴+线性地漏+从浴室到淋浴一体连贯瓷砖设计。需要完整1/2"无框围护：定面板+门+回面板+8'顶部玻璃挡板封蒸汽。<strong>$5,200安装价</strong>，含钢-玻璃顶部挡水。无门槛通铺地面强制要求无框——半无框或推拉会视觉打断地面。项目：<a href="/zh/projects/luxury-bathroom-renovation-north-vancouver/">北温无门槛奢华浴室</a>。</p>

<h3>项目6 — 西温香槟金奢华主卫</h3>
<p>西区豪宅装修，浴室预算$36K–$40K。无框1/2"钢化玻璃、油磨香槟金合页（与Kohler Stillness龙头线匹配）、整圈抛光边。仅五金规格就比标准铬贵$400，但水龙头/玻璃门/毛巾架全套统一是设计意图所必需。<strong>$4,400安装价</strong>。项目：<a href="/zh/projects/west-vancouver-luxury-bathroom-champagne-gold/">西温香槟金主卫</a>。</p>

<h2>BC省规范+安全要求</h2>
<ul>
<li><strong>必须使用CSA认证钢化玻璃。</strong>BC建筑规范（BCBC）9.6条要求所有淋浴围护使用安全玻璃。钢化（CSA Z97.1或ANSI Z97.1）是标准。无标记或非钢化玻璃违反规范且承担保险责任——一旦碎裂可造成严重割伤。</li>
<li><strong>每片玻璃必须有永久蚀刻标记。</strong>CSA认证以一角永久酸蚀刻logo识别。任何未带标记的"钢化"玻璃店都要拒之。</li>
<li><strong>门槛高度：最低4"，无框建议6"。</strong>BC管道规范最低门槛2"，但底部不密封的无框门，4–6"是实操最低值。</li>
<li><strong>无框必须有墙体背衬。</strong>瓷砖背后合页龙骨跨距内必须有2x6龙骨或3/4"夹板加强。这是结构决策——必须在拆改阶段、水泥板上之前完成。瓷砖装好后再补=切碎成品瓷砖。</li>
<li><strong>钢化玻璃热处理后无法再切割或钻孔。</strong>所有合页/夹片/支撑杆开孔必须在玻璃店做模板、热处理前切完。一处量错=新一片$300–$1,200。</li>
<li><strong>蒸汽淋浴需顶部封板。</strong>设计含蒸汽发生器（豪华项目常见）时，门顶必须用玻璃封盖以封蒸汽防止其他区域起雾。加$400–$1,500用于玻璃顶盖。</li>
</ul>

<h2>温哥华业主常选错的地方</h2>
<ol>
<li><strong>浴缸-淋浴一体上装无框。</strong>无框合页门在浴缸上方装不好——合页没东西可以锚固（浴缸台面上的石膏板撑不住80磅玻璃）。推拉对滑（带框或轨道式无框）才是正解。我们被叫去补救过——其他承包商硬装，结果18个月内门从墙上脱开。</li>
<li><strong>框架阶段省了墙体背衬。</strong>不告诉施工方"这跨距要为无框门加背衬"，要么后期失去无框选项，要么花$1,200–$2,000切碎成品瓷砖事后加背衬。</li>
<li><strong>没确认墙面平整就买无框。</strong>无框玻璃要求墙面在玻璃高度内平整度1/8"以内。温哥华老瓷砖墙（尤其2000年前的4×4"砖）常有1/4"–1/2"起伏。墙不平=玻璃要么挤压要么留可见缝隙。后发现需补$400–$800贴砖前抹平。</li>
<li><strong>主浴买最便宜的带框推拉。</strong>$400–$600带框推拉套件的塑料滚轮5–8年就坏（我们替换过几十次）。除非出租房，多花$200–$400买不锈钢滚轮——能用15–20年。</li>
<li><strong>染色光带设计忘了指定低铁玻璃。</strong>标准钢化边缘有绿色调，1/4"几乎看不出，1/2"明显。无框装拉丝金或哑光黑五金时，绿边会与设计冲突。低铁（Starphire、Diamant）单片加$150–$400——高端项目几乎必加。</li>
</ol>

<h2>玻璃门预算规划</h2>
<ol>
<li><strong>设计阶段就确定围护类型，不要等到拆改。</strong>走入式 vs 嵌入式 vs 浴缸-淋浴决定其他所有决策（合页位置、门槛高度、墙体框架）。</li>
<li><strong>玻璃门预算占整体浴室8–12%。</strong>$25K浴室留$2,000–$3,000给玻璃门。$45K豪华规划$4,000–$5,500。</li>
<li><strong>贴砖前先做框架背衬。</strong>告诉施工方合页落点。2x6或夹板背衬，不是普通石膏板2x4。</li>
<li><strong>水电完工后再下单玻璃，不是设计阶段。</strong>最终模板需要实际成品墙，玻璃店在贴砖完成后才量。从模板到安装通常2–3周。</li>
<li><strong>五金颜色与水龙头线匹配。</strong>水龙头是香槟铜，合页也得是。混搭饰面是最廉价就能避免的视觉错误。</li>
</ol>

<h2>常见问题</h2>

<h3>无框真的值多花$1,500–$2,500吗？</h3>
<p>主卫且要住15+年，值——视觉差异显著、五金寿命也更长。次卫或翻新转售，不值——半无框能用60%的成本拿到80%的外观。</p>

<h3>玻璃淋浴门会漏水吗？</h3>
<p>无框和半无框设计上底部不密封（合页间距留3/16"）。靠门槛高度+花洒朝向防水。花洒对着门=必溅出来——把花洒对着后墙就好。推拉对滑密封更好但滚轮磨损后失效。</p>

<h3>需要多厚的钢化玻璃？</h3>
<p>仅带框推拉用1/4"。任何无边框门（合页、旋转、轨道式无框）最低3/8"。1/2"是温哥华真无框标准，尤其面板宽超30"。玻璃越厚=面板越硬=变形越小=五金寿命越长。</p>

<h3>能在既有瓷砖淋浴上装玻璃门吗？</h3>
<p>推拉对滑和半无框：通常可以。无框：仅当瓷砖背后合页跨距内有2x6或夹板背衬，2010年前的多数温哥华浴室没有。承诺前先确认。</p>

<h3>玻璃淋浴门安装多久？</h3>
<p>定制无框从模板（第1天）到安装（第14–21天）。标准半无框和带框推拉用现成尺寸可同周安装。水电完工时下单，不是贴砖后。</p>

<h3>预算紧的情况下无门槛走入式淋浴现实吗？</h3>
<p>淋浴本身在$25K+浴室现实。配套的无框完整围护把项目推到$35K+。预算紧的无门槛通常是局部围护或半墙——查看我们的<a href="/zh/blog/bathroom-refresh-without-full-renovation-vancouver-2026/">浴室翻新指南</a>了解翻新档无门槛改造。</p>

<h3>该上低铁玻璃吗？</h3>
<p>1/2"无框+大胆五金颜色（金、黑、青铜）的，上——标准钢化边缘绿调与设计冲突。1/4"带框推拉，不上——绿调几乎看不见。</p>

<h2>相关指南</h2>
<ul>
<li><a href="/zh/guides/bathroom-renovation-cost-vancouver/">温哥华浴室装修费用：$10K–$60K真实数据</a> — 完整浴室预算的母指南</li>
<li><a href="/zh/blog/bathroom-renovation-cost-vancouver-by-style/">按风格分浴室装修费用：现代、水疗、传统</a> — 风格选择如何影响玻璃门选型</li>
<li><a href="/zh/blog/bathroom-refresh-without-full-renovation-vancouver-2026/">浴室翻新无需大改装</a> — 何时单换玻璃门即可</li>
<li><a href="/zh/blog/best-bathroom-tiles-vancouver-2026/">温哥华最佳浴室瓷砖 2026</a> — 墙面平整度影响无框可行性</li>
<li><a href="/zh/blog/toilet-renovation-cost-vancouver/">温哥华马桶装修费用</a> — 配套洁具费用指南</li>
<li><a href="/zh/blog/vanity-renovation-cost-vancouver/">温哥华梳妆台装修费用</a> — 配套洁具费用指南</li>
<li><a href="/zh/blog/bathtub-renovation-cost-vancouver/">温哥华浴缸装修费用</a> — 保留浴缸 vs 走入式淋浴的取舍</li>
<li><a href="/zh/services/bathroom/">浴室装修服务</a> — 我们的工作内容和流程</li>
</ul>

<p>需要我们针对你的具体浴室布局和预算给出门型推荐？把现状照片+大致尺寸发给我们，48小时内给您三档分价方案。<a href="/zh/contact/">免费上门咨询</a>。</p>
</article>`;

const contentZhHant = `<article>
<h1>溫哥華玻璃淋浴門 2026：無框 vs 半無框 vs 推拉門（真實費用與項目實例）</h1>

<p class="lead">玻璃淋浴門是浴室裝修中影響最大的決策之一——它定義視覺風格，佔預算的10–25%，業主使用15–25年才會因五金老化更換。基於Reno Stars 200+大溫浴室項目，本文如實拆解無框 vs 半無框 vs 推拉對滑門：每種安裝價多少，誰適合，溫哥華業主常在哪選錯。</p>

<h2>速查對比：成本、玻璃厚度、外觀、壽命</h2>
<table>
<thead><tr><th>類型</th><th>溫哥華安裝價</th><th>玻璃厚度</th><th>外觀</th><th>五金壽命</th><th>最適合</th></tr></thead>
<tbody>
<tr><td>推拉對滑（帶框）</td><td>$800 – $1,800</td><td>1/4" (6mm)</td><td>實用，可見鋁框</td><td>10–15年</td><td>浴缸、出租房、次衛、窄洞口</td></tr>
<tr><td>半無框旋轉/合頁</td><td>$1,200 – $2,400</td><td>3/8" (10mm)</td><td>簡潔，五金極少</td><td>15–20年</td><td>家庭主衛、中檔主浴</td></tr>
<tr><td>無框定面板+合頁門</td><td>$1,800 – $3,800</td><td>1/2" (12mm)</td><td>高端，近乎隱形</td><td>20–25年</td><td>主衛、走入式淋浴</td></tr>
<tr><td>無框無門檻走入式</td><td>$3,200 – $5,500+</td><td>1/2" (12mm)</td><td>水療級、畫廊級</td><td>20–25年</td><td>豪華主衛、無障礙</td></tr>
<tr><td>推拉對滑（軌道式無框）</td><td>$2,400 – $4,200</td><td>3/8"–1/2"</td><td>現代，窄邊框</td><td>15–20年</td><td>窄空間浴缸改造、現代公寓</td></tr>
</tbody>
</table>

<h2>三種門到底有什麼區別</h2>

<h3>1. 無框（高端選擇）</h3>
<p>無框=玻璃周圍沒有金屬邊框——只有重型1/2"鋼化玻璃面板，由不鏽鋼或實心黃銅合頁直接錨固到牆體，地面與轉角輔以最少夾片。1/2"（12mm）是溫哥華無框標準。隱藏式合頁必須鎖入瓷磚背後的2x6龍骨或3/4"夾板背襯——這是結構決策，必須在拆改階段完成。底部留3/16"間隙不密封，靠門檻高度+花灑位置防水。</p>

<h3>2. 半無框（性價比甜點）</h3>
<p>半無框使用3/8"（10mm）鋼化玻璃，僅頂部支撐桿+靠牆邊U型槽。門體本身無框，玻璃邊緣自由擺動。比無框玻璃便宜30%，五金更簡單（$150–$350一套），更易翻新裝入既有瓷磚。$20K–$32K溫哥華浴室「每元顏值比」最高的選擇。</p>

<h3>3. 推拉對滑（預算+浴缸方案）</h3>
<p>頂部軌道承載，兩片玻璃錯位重疊。無開門弧線，淋浴或浴缸前不需預留擺角空間。帶框（1/4"+全鋁框+塑料滾輪）出租房和次衛默認；軌道式無框（3/8"+不鏽鋼軌道+隱藏滾輪）外觀接近無框但解決窄空間。塑料滾輪10–15年磨損更換約$200–$400；多花$200–$400買不鏽鋼滾輪可用15–20年。</p>

<h2>Reno Stars真實項目六例</h2>
<ul>
<li><strong>高貴林標準浴室帶框推拉浴缸門：</strong>$980安裝價（鉻框、1/4"鋼化、60"洞口）。<a href="/zh-Hant/projects/coquitlam-standard-bathroom-renovation-shower-conversion/">項目</a></li>
<li><strong>本拿比聯排半無框旋轉門：</strong>$1,650（3/8"鋼化、拉絲鎳支撐桿、30"寬）。<a href="/zh-Hant/projects/burnaby-townhouse-bathroom-renovation-custom-features/">項目</a></li>
<li><strong>楓樹嶺定制90°走入式無框：</strong>$2,950（定面板+合頁門皆1/2"鋼化）。<a href="/zh-Hant/projects/maple-ridge-bathroom-renovation-custom-glass-door-2/">項目</a></li>
<li><strong>本拿比奢華主衛無框走入式：</strong>$3,650（1/2"低鐵鋼化+拉絲金合頁配Brizo水龍頭線）。<a href="/zh-Hant/projects/luxury-bathroom-renovation-burnaby/">項目</a></li>
<li><strong>北溫無門檻走入式無框完整圍護：</strong>$5,200（含8'頂部玻璃擋板封蒸汽）。<a href="/zh-Hant/projects/luxury-bathroom-renovation-north-vancouver/">項目</a></li>
<li><strong>西溫香檳金奢華主衛無框：</strong>$4,400（油磨香檳金合頁配Kohler Stillness）。<a href="/zh-Hant/projects/west-vancouver-luxury-bathroom-champagne-gold/">項目</a></li>
</ul>

<h2>BC省規範+安全要求</h2>
<ul>
<li>必須CSA認證鋼化玻璃（BCBC 9.6條），每片有永久蝕刻標記</li>
<li>門檻最低4"，無框建議6"</li>
<li>無框必須2x6或3/4"夾板背襯，框架階段完成</li>
<li>鋼化玻璃熱處理後無法切割鑽孔——量錯=新片$300–$1,200</li>
<li>蒸汽淋浴需頂部玻璃封板，加$400–$1,500</li>
</ul>

<h2>常選錯的地方</h2>
<ol>
<li>浴缸-淋浴一體裝無框（合頁無背襯支撐）</li>
<li>框架階段省了背襯（後期切瓷磚補墊$1,200–$2,000）</li>
<li>沒確認牆面平整（老瓷磚牆起伏需抹平$400–$800）</li>
<li>主浴買最便宜帶框推拉（塑料滾輪5–8年壞）</li>
<li>大膽五金顏色忘了低鐵玻璃（綠邊與設計衝突）</li>
</ol>

<h2>相關指南</h2>
<ul>
<li><a href="/zh-Hant/guides/bathroom-renovation-cost-vancouver/">溫哥華浴室裝修費用</a></li>
<li><a href="/zh-Hant/blog/bathroom-refresh-without-full-renovation-vancouver-2026/">浴室翻新無需大改裝</a></li>
<li><a href="/zh-Hant/blog/best-bathroom-tiles-vancouver-2026/">溫哥華最佳浴室瓷磚 2026</a></li>
<li><a href="/zh-Hant/services/bathroom/">浴室裝修服務</a></li>
</ul>

<p><a href="/zh-Hant/contact/">免費上門諮詢</a>。</p>
</article>`;

const contentJa = `<article>
<h1>バンクーバー・ガラスシャワードア 2026：フレームレス・セミフレームレス・スライディング比較（実費用＋実例）</h1>

<p class="lead">ガラスシャワードアは浴室リノベーションで最も影響の大きい決断の一つ――視覚スタイルを決定し、予算の10–25%を占め、金物が劣化するまで15–25年使用されます。Reno Starsのメトロ・バンクーバー浴室プロジェクト200件超に基づき、フレームレス・セミフレームレス・スライディングバイパスを正直に分解します。</p>

<h2>比較：費用・厚さ・外観・耐用年数</h2>
<table>
<thead><tr><th>タイプ</th><th>バンクーバー設置価</th><th>ガラス厚</th><th>外観</th><th>金物寿命</th></tr></thead>
<tbody>
<tr><td>スライディングバイパス（フレーム付）</td><td>$800 – $1,800</td><td>1/4" (6mm)</td><td>実用、アルミフレーム可視</td><td>10–15年</td></tr>
<tr><td>セミフレームレス（ピボット/ヒンジ）</td><td>$1,200 – $2,400</td><td>3/8" (10mm)</td><td>クリーン、最小金物</td><td>15–20年</td></tr>
<tr><td>フレームレス固定パネル+ヒンジドア</td><td>$1,800 – $3,800</td><td>1/2" (12mm)</td><td>プレミアム、ほぼ不可視</td><td>20–25年</td></tr>
<tr><td>フレームレス・段差なしウォークイン</td><td>$3,200 – $5,500+</td><td>1/2" (12mm)</td><td>スパ・ギャラリー級</td><td>20–25年</td></tr>
<tr><td>スライディングバイパス（レール式フレームレス）</td><td>$2,400 – $4,200</td><td>3/8"–1/2"</td><td>モダン、細枠</td><td>15–20年</td></tr>
</tbody>
</table>

<h2>3種類の本質的な違い</h2>

<h3>1. フレームレス（プレミアム）</h3>
<p>ガラス周辺に金属チャンネルなし――1/2"強化ガラスをステンレス・ソリッド真鍮ヒンジで壁に直接アンカー。バンクーバー標準は1/2"（12mm）。タイル裏のヒンジ・スタッドベイ内に2x6 or 3/4"合板ブロッキングが必須――解体時に決まる構造判断。底に3/16"の隙間（ヒンジクリアランス）があり密封しないため、4–6"の段差＋シャワーヘッド配置で水を留める。</p>

<h3>2. セミフレームレス（コスパ最良）</h3>
<p>3/8"（10mm）強化ガラス＋上部ヘッダーバーのみ。ドア本体に枠なし。3/8"ガラス（約$30–$40/sqft）、シンプルな金物（$150–$350/セット）、既存タイルに後付けしやすい。$20K–$32Kの浴室で「コスパ最良」となるケースが多い。</p>

<h3>3. スライディングバイパス（予算＋浴槽用）</h3>
<p>上部レールで2枚のガラスがすれ違いスライド。開閉スイング不要。フレーム付（1/4"＋アルミ枠＋プラ製ローラー）は賃貸・予備浴室の定番。レール式フレームレス（3/8"+＋ステンレスレール＋隠しローラー）はモダンだが$2,400以下では難しい。プラ製ローラーは5–8年で破損――ステンレス製に+$200–$400で15–20年寿命。</p>

<h2>Reno Stars実例6件</h2>
<ul>
<li><strong>コキットラム標準浴室・フレーム付スライディング浴槽ドア：</strong>$980（クロームフレーム、1/4"強化、60"開口）。<a href="/ja/projects/coquitlam-standard-bathroom-renovation-shower-conversion/">プロジェクト</a></li>
<li><strong>バーナビー・タウンハウス・セミフレームレスピボット：</strong>$1,650（3/8"強化、ブラッシュドニッケル・ヘッダーバー、30"幅）。<a href="/ja/projects/burnaby-townhouse-bathroom-renovation-custom-features/">プロジェクト</a></li>
<li><strong>メープルリッジ・カスタム90°ウォークインフレームレス：</strong>$2,950（固定パネル+ヒンジドア共に1/2"強化）。<a href="/ja/projects/maple-ridge-bathroom-renovation-custom-glass-door-2/">プロジェクト</a></li>
<li><strong>バーナビー・ラグジュアリー浴室フレームレスウォークイン：</strong>$3,650（1/2"低鉄強化＋ブラッシュドゴールド・ヒンジ＋Brizo配管）。<a href="/ja/projects/luxury-bathroom-renovation-burnaby/">プロジェクト</a></li>
<li><strong>ノースバンクーバー段差なし・フレームレス完全囲い：</strong>$5,200（蒸気封じ込め用8'オーバーヘッドガラス含む）。<a href="/ja/projects/luxury-bathroom-renovation-north-vancouver/">プロジェクト</a></li>
<li><strong>ウェストバンクーバー・シャンパンゴールドラグジュアリー：</strong>$4,400（オイルラブド・シャンパンゴールド・ヒンジ＋Kohler Stillness）。<a href="/ja/projects/west-vancouver-luxury-bathroom-champagne-gold/">プロジェクト</a></li>
</ul>

<h2>BC州規格・安全</h2>
<ul>
<li>BCBC 9.6条――CSA認証強化ガラス必須（永久エッチング・マーク要）</li>
<li>段差は最低4"、フレームレスは6"推奨</li>
<li>フレームレスは2x6 or 3/4"合板ブロッキング必須――解体時判断</li>
<li>強化ガラスは熱処理後切断・穴開け不可――テンプレートのミスは$300–$1,200の新パネル</li>
<li>スチームシャワーは天井ガラス・キャップ要（追加$400–$1,500）</li>
</ul>

<h2>バンクーバーの施主が選択を間違えがちなポイント</h2>
<ol>
<li>浴槽-シャワー一体にフレームレス（ヒンジを支える背材なし）</li>
<li>解体時にブロッキング省略（後付け$1,200–$2,000）</li>
<li>壁の平坦度未確認（古いタイル壁の起伏で$400–$800のスキム要）</li>
<li>主浴に最安フレーム付スライディング（プラ製ローラー5–8年で交換）</li>
<li>大胆な金物色を選ぶも低鉄ガラス指定忘れ（緑エッジが意匠と衝突）</li>
</ol>

<h2>関連ガイド</h2>
<ul>
<li><a href="/ja/guides/bathroom-renovation-cost-vancouver/">バンクーバー浴室リノベ費用</a></li>
<li><a href="/ja/blog/bathroom-refresh-without-full-renovation-vancouver-2026/">浴室リフレッシュ・全面リノベ不要</a></li>
<li><a href="/ja/blog/best-bathroom-tiles-vancouver-2026/">バンクーバー最良の浴室タイル 2026</a></li>
<li><a href="/ja/services/bathroom/">浴室リノベーション・サービス</a></li>
</ul>

<p><a href="/ja/contact/">無料の現地相談を予約</a>。</p>
</article>`;

const contentKo = `<article>
<h1>밴쿠버 유리 샤워 도어 2026: 프레임리스 vs 세미프레임리스 vs 슬라이딩 (실제 비용+사례)</h1>

<p class="lead">유리 샤워 도어는 욕실 리노베이션에서 가장 영향력이 큰 결정 중 하나입니다 — 시각적 스타일을 결정하고, 예산의 10–25%를 차지하며, 하드웨어 수명까지 15–25년 사용됩니다. Reno Stars의 메트로 밴쿠버 욕실 프로젝트 200건 이상을 바탕으로 프레임리스, 세미프레임리스, 슬라이딩 바이패스를 솔직히 비교합니다.</p>

<h2>비교: 비용·두께·외관·수명</h2>
<table>
<thead><tr><th>유형</th><th>밴쿠버 설치비</th><th>유리 두께</th><th>외관</th><th>하드웨어 수명</th></tr></thead>
<tbody>
<tr><td>슬라이딩 바이패스 (프레임)</td><td>$800 – $1,800</td><td>1/4" (6mm)</td><td>실용, 알루미늄 프레임 노출</td><td>10–15년</td></tr>
<tr><td>세미프레임리스 (피벗/힌지)</td><td>$1,200 – $2,400</td><td>3/8" (10mm)</td><td>깔끔, 최소 하드웨어</td><td>15–20년</td></tr>
<tr><td>프레임리스 고정 패널+힌지 도어</td><td>$1,800 – $3,800</td><td>1/2" (12mm)</td><td>프리미엄, 거의 보이지 않음</td><td>20–25년</td></tr>
<tr><td>프레임리스 무문턱 워크인</td><td>$3,200 – $5,500+</td><td>1/2" (12mm)</td><td>스파·갤러리급</td><td>20–25년</td></tr>
<tr><td>슬라이딩 바이패스 (레일 프레임리스)</td><td>$2,400 – $4,200</td><td>3/8"–1/2"</td><td>모던, 좁은 프레임</td><td>15–20년</td></tr>
</tbody>
</table>

<h2>세 가지의 본질적 차이</h2>

<h3>1. 프레임리스 (프리미엄)</h3>
<p>유리 주위에 금속 채널이 없습니다 — 무거운 1/2" 강화유리를 스테인리스 또는 솔리드 황동 힌지로 벽에 직접 앵커. 밴쿠버 표준은 1/2"(12mm). 타일 뒤 힌지 스터드 베이 안에 2x6 또는 3/4" 합판 블로킹이 필수 — 해체 단계에서 결정되는 구조 판단. 바닥에 3/16" 갭(힌지 클리어런스)이 있어 밀봉 안 됨, 따라서 4–6" 턱+샤워헤드 배치로 물을 잡습니다.</p>

<h3>2. 세미프레임리스 (가성비 최고)</h3>
<p>3/8"(10mm) 강화유리+상단 헤더 바만. 도어 자체엔 프레임 없음. 3/8" 유리 (약 $30–$40/sqft), 단순 하드웨어 ($150–$350/세트), 기존 타일에 추가 설치 용이. $20K–$32K 욕실에 가장 가성비 좋은 선택인 경우가 많습니다.</p>

<h3>3. 슬라이딩 바이패스 (예산+욕조용)</h3>
<p>상단 레일에 두 장의 유리가 엇갈려 슬라이드. 스윙 공간 불필요. 프레임 (1/4"+알루미늄+플라스틱 롤러)은 임대용·보조 욕실 기본; 레일 프레임리스 (3/8"+스테인리스 레일+히든 롤러)는 모던하지만 $2,400 이하 어려움. 플라스틱 롤러는 5–8년에 파손 — 스테인리스로 +$200–$400 시 15–20년 수명.</p>

<h2>Reno Stars 실제 프로젝트 6건</h2>
<ul>
<li><strong>코퀴틀람 표준 욕실·프레임 슬라이딩 욕조 도어:</strong> $980 (크롬 프레임, 1/4" 강화, 60" 개구). <a href="/ko/projects/coquitlam-standard-bathroom-renovation-shower-conversion/">프로젝트</a></li>
<li><strong>버나비 타운하우스·세미프레임리스 피벗:</strong> $1,650 (3/8" 강화, 브러시드 니켈 헤더 바, 30" 폭). <a href="/ko/projects/burnaby-townhouse-bathroom-renovation-custom-features/">프로젝트</a></li>
<li><strong>메이플 리지 커스텀 90° 워크인 프레임리스:</strong> $2,950 (고정 패널+힌지 도어 모두 1/2" 강화). <a href="/ko/projects/maple-ridge-bathroom-renovation-custom-glass-door-2/">프로젝트</a></li>
<li><strong>버나비 럭셔리 욕실·프레임리스 워크인:</strong> $3,650 (1/2" 저철 강화+브러시드 골드 힌지+Brizo 라인). <a href="/ko/projects/luxury-bathroom-renovation-burnaby/">프로젝트</a></li>
<li><strong>노스 밴쿠버 무문턱·프레임리스 완전 인클로저:</strong> $5,200 (스팀 차단용 8' 오버헤드 글라스 포함). <a href="/ko/projects/luxury-bathroom-renovation-north-vancouver/">프로젝트</a></li>
<li><strong>웨스트 밴쿠버 샴페인 골드 럭셔리:</strong> $4,400 (오일 러브드 샴페인 골드 힌지+Kohler Stillness). <a href="/ko/projects/west-vancouver-luxury-bathroom-champagne-gold/">프로젝트</a></li>
</ul>

<h2>BC 코드·안전</h2>
<ul>
<li>BCBC 9.6조 — CSA 인증 강화유리 필수 (영구 에칭 마크 요구)</li>
<li>턱 최소 4", 프레임리스는 6" 권장</li>
<li>프레임리스는 2x6 또는 3/4" 합판 블로킹 필수 — 해체 단계 결정</li>
<li>강화유리는 열처리 후 절단·천공 불가 — 템플릿 오류는 $300–$1,200 새 패널</li>
<li>스팀 샤워는 천장 글라스 캡 필요 (추가 $400–$1,500)</li>
</ul>

<h2>밴쿠버 집주인이 자주 잘못 선택하는 곳</h2>
<ol>
<li>욕조-샤워 일체에 프레임리스 (힌지를 받칠 백킹 없음)</li>
<li>해체 시 블로킹 생략 (후속 추가 $1,200–$2,000)</li>
<li>벽 평탄도 미확인 (구형 타일 벽 굴곡으로 $400–$800 스킴 코트)</li>
<li>주 욕실에 최저가 프레임 슬라이딩 (플라스틱 롤러 5–8년에 파손)</li>
<li>대담한 하드웨어 색상 선택 후 저철 유리 누락 (녹색 엣지 디자인 충돌)</li>
</ol>

<h2>관련 가이드</h2>
<ul>
<li><a href="/ko/guides/bathroom-renovation-cost-vancouver/">밴쿠버 욕실 리노베이션 비용</a></li>
<li><a href="/ko/blog/bathroom-refresh-without-full-renovation-vancouver-2026/">전체 리노베이션 없이 욕실 리프레시</a></li>
<li><a href="/ko/blog/best-bathroom-tiles-vancouver-2026/">밴쿠버 최고의 욕실 타일 2026</a></li>
<li><a href="/ko/services/bathroom/">욕실 리노베이션 서비스</a></li>
</ul>

<p><a href="/ko/contact/">무료 방문 상담 예약</a>.</p>
</article>`;

const contentEs = `<article>
<h1>Puertas de Ducha de Vidrio Vancouver 2026: Sin Marco vs Semi-Sin Marco vs Corredizas (Costos Reales y Ejemplos)</h1>

<p class="lead">Una puerta de ducha de vidrio es una de las decisiones de mayor impacto en la renovación de un baño — define el estilo visual, representa el 10–25% del presupuesto y vive con el propietario 15–25 años antes de que el herraje falle. Después de más de 200 proyectos de baño en Metro Vancouver, aquí está el desglose honesto de sin marco vs semi-sin marco vs corredizas bypass: qué cuesta cada una instalada, dónde gana cada una y dónde los propietarios de Vancouver lamentan su elección.</p>

<h2>Comparación rápida: costo, espesor, apariencia, vida útil</h2>
<table>
<thead><tr><th>Tipo</th><th>Instalado en Vancouver</th><th>Espesor del vidrio</th><th>Apariencia</th><th>Vida útil del herraje</th><th>Mejor para</th></tr></thead>
<tbody>
<tr><td>Corrediza bypass (con marco)</td><td>$800 – $1,800</td><td>1/4" (6mm)</td><td>Utilitaria, marco aluminio visible</td><td>10–15 años (rodillos se desgastan)</td><td>Bañeras, alquileres, baños secundarios</td></tr>
<tr><td>Semi-sin marco (pivote o bisagra)</td><td>$1,200 – $2,400</td><td>3/8" (10mm)</td><td>Limpia, herraje mínimo</td><td>15–20 años</td><td>Baños familiares principales, baños master de gama media</td></tr>
<tr><td>Sin marco panel fijo + puerta con bisagra</td><td>$1,800 – $3,800</td><td>1/2" (12mm)</td><td>Premium, casi invisible</td><td>20–25 años</td><td>Baños master, duchas walk-in, proyectos con prioridad de diseño</td></tr>
<tr><td>Sin marco walk-in sin reborde (encerramiento completo)</td><td>$3,200 – $5,500+</td><td>1/2" (12mm)</td><td>Spa, calidad galería</td><td>20–25 años</td><td>Baños master de lujo, proyectos de accesibilidad</td></tr>
<tr><td>Corrediza bypass (sin marco sobre rieles)</td><td>$2,400 – $4,200</td><td>3/8"–1/2"</td><td>Moderna, marco estrecho</td><td>15–20 años</td><td>Conversiones de bañera en espacios estrechos, condos modernos</td></tr>
</tbody>
</table>
<p><em>Los precios son instalados e incluyen el vidrio, el herraje (bisagras, clips, barra superior cuando aplica), la plantilla, la entrega y la mano de obra estándar de instalación. Vidrio templado certificado CSA está incluido en todos los niveles (es obligatorio en BC). Las muescas personalizadas, las actualizaciones a vidrio "ultra-claro" de bajo hierro y el refuerzo de pared para paneles sin marco pesados se facturan por separado.</em></p>

<h2>Qué es realmente diferente entre las tres</h2>

<h3>1. Sin marco (la elección premium)</h3>
<p>Sin marco significa sin canal metálico alrededor del vidrio — solo paneles pesados de vidrio templado de 1/2" sostenidos por bisagras de acero inoxidable o latón macizo ancladas directamente en la pared, más clips mínimos en piso y esquinas. El panel fijo típicamente se encuentra con la puerta con bisagra a 90° en duchas walk-in; en duchas tipo nicho es común una sola puerta con bisagra sin panel fijo.</p>
<ul>
<li><strong>Espesor del vidrio:</strong> 1/2" (12mm) es el estándar de Vancouver para sin marco. Cualquier cosa más delgada no mantendrá la alineación sin un marco.</li>
<li><strong>Herraje:</strong> Bisagras ocultas (Brass U.S. Horizon, CRL Pinnacle, Frameless Showers Direct) ancladas en respaldo sólido — el instalador debe saber que hay refuerzo 2x6 o de contrachapado de 3/4" detrás del azulejo en la cavidad de pernos del marco de la puerta. Cortar la cavidad incorrecta durante el armado, y la opción sin marco muere.</li>
<li><strong>Contención de agua:</strong> Las puertas sin marco no sellan — tienen una brecha de 3/16" en la parte inferior (para el juego de la bisagra) y dependen de la altura del reborde + la colocación del cabezal de ducha para mantener el agua dentro. Un sin marco mal diseñado puede salpicar afuera. Mitigado por: altura de reborde de 4"+, presa superior, cabezal de ducha apuntando lejos de la puerta.</li>
<li><strong>Impulsor del costo:</strong> Espesor del vidrio (templado de 1/2" cuesta ~$45–$60/pie² vs $20–$30/pie² para 1/4"), herraje ($300–$700 juego), y la dificultad de plantilla + instalación (trabajo de 2 personas, el vidrio pesa 80–120 lbs por panel).</li>
<li><strong>Donde gana:</strong> Baños master donde el baño es una "habitación de exhibición". Duchas walk-in sin reborde de lujo. Estética moderna donde quieres que la mirada viaje a través del vidrio.</li>
</ul>

<h3>2. Semi-sin marco (el punto óptimo de valor)</h3>
<p>Semi-sin marco usa vidrio templado de 3/8" (10mm) con un marco delgado en el perímetro (típicamente solo una barra superior, más canal a lo largo del borde de la pared). La puerta misma no tiene marco — el borde del vidrio se balancea libre.</p>
<ul>
<li><strong>Espesor del vidrio:</strong> 3/8" (10mm) — lo suficientemente grueso para sostenerse sin marco, más delgado que sin marco así que 30% más barato en la vidriería.</li>
<li><strong>Herraje:</strong> Barra superior (cromo, níquel cepillado, oro cepillado, negro mate son todos estándar) proporciona soporte estructural para que las bisagras no jalen tanto la pared. Más fácil de adaptar a azulejo existente porque la barra superior carga parte del peso.</li>
<li><strong>Contención de agua:</strong> Ligeramente mejor que sin marco porque la barra superior actúa como guarda contra salpicaduras en la parte superior. Aún no sellado en la parte inferior.</li>
<li><strong>Impulsor del costo:</strong> Vidrio de 3/8" (~$30–$40/pie²), herraje más simple ($150–$350 juego), instalación más rápida (factible para una persona en puertas más pequeñas).</li>
<li><strong>Donde gana:</strong> Baños familiares principales y baños master de gama media donde quieres el aspecto limpio sin la prima de costo del sin marco. A menudo la mejor elección dólar-por-aspecto para un baño de Vancouver de $20K–$32K.</li>
</ul>

<h3>3. Corrediza bypass (la opción de presupuesto + bañera)</h3>
<p>Las puertas corredizas bypass corren sobre un riel superior (y a veces también un riel inferior). Dos paneles de vidrio se superponen y se deslizan uno frente al otro — sin arco de oscilación, sin holgura necesaria frente a la ducha o bañera. Disponibles en variantes con marco (vidrio de 1/4" con marco completo de aluminio) y sin marco sobre rieles (vidrio de 3/8"+ con herraje mínimo).</p>
<ul>
<li><strong>Corrediza con marco (nivel de presupuesto):</strong> Vidrio templado de 1/4", marco de aluminio, rodillos de plástico. La elección por defecto para combos bañera-ducha en alquileres, baños secundarios y construcciones primarias conscientes del presupuesto. Los rodillos se desgastan en 10–15 años y necesitan reemplazo (~$200–$400).</li>
<li><strong>Sin marco sobre rieles (nivel moderno):</strong> Vidrio de 3/8"–1/2" con riel superior de acero inoxidable y rodillos ocultos. Se ve más cercano a sin marco pero resuelve el problema de espacios estrechos. Difícil de encontrar bajo $2,400 instalada en Vancouver.</li>
<li><strong>Espesor del vidrio:</strong> 1/4" con marco, 3/8"–1/2" sin marco sobre rieles.</li>
<li><strong>Contención de agua:</strong> La mejor de las tres cuando se instala correctamente — el riel + marco sella el perímetro. La peor cuando los rodillos se desgastan y la puerta se desalinea.</li>
<li><strong>Impulsor del costo:</strong> El riel y los rodillos ($150–$500 juego de herraje) más la instalación más simple. No se requiere anclaje de bisagras.</li>
<li><strong>Donde gana:</strong> Conversiones de bañera-ducha donde no hay espacio de oscilación, baños estrechos de condo de Vancouver, construcciones de accesibilidad donde una puerta con bisagra es un peligro de caída.</li>
</ul>

<h2>Seis proyectos reales de Reno Stars (y cuánto costó cada uno)</h2>

<h3>Proyecto 1 — Baño estándar Coquitlam: corrediza con marco para bañera</h3>
<p>Combo bañera-ducha estándar en una townhouse en Coquitlam. El cliente quería convertir la cortina vieja a un encerramiento de vidrio pero tenía un presupuesto total de baño de $14K–$17K. Instalamos una corrediza bypass con marco (marco cromo, vidrio templado de 1/4", abertura de 60") por <strong>$980 instalada</strong> como parte del refresh del baño. El aspecto con marco no es elegante, pero resuelve el problema de salpicaduras y combina con los acabados del resto del nivel de presupuesto. Proyecto: <a href="/es/projects/coquitlam-standard-bathroom-renovation-shower-conversion/">Conversión de ducha Coquitlam</a>.</p>

<h3>Proyecto 2 — Townhouse Burnaby: pivote semi-sin marco</h3>
<p>Baño master de townhouse en Burnaby, presupuesto de baño $20K–$25K. El cliente quería "lo más limpio posible sin gastar dinero de baño master". Especificamos una puerta de pivote semi-sin marco (vidrio templado de 3/8", barra superior níquel cepillado, 30" ancho) por <strong>$1,650 instalada</strong>. La barra superior coincidía con el toallero y el acabado del grifo, lo que selló el aspecto cohesivo. Tres años después, cero problemas de herraje. Proyecto: <a href="/es/projects/burnaby-townhouse-bathroom-renovation-custom-features/">Baño de townhouse Burnaby</a>.</p>

<h3>Proyecto 3 — Puerta de vidrio personalizada Maple Ridge (walk-in 90°)</h3>
<p>Un baño de Maple Ridge remodelado alrededor de una ducha walk-in de 36" × 36". El cliente quería sin marco pero con un presupuesto total de $18K–$21K — apretado para sin marco completo. Entregamos una configuración de plantilla personalizada sin marco a 90° (panel de retorno fijo + puerta con bisagra, ambos vidrio templado de 1/2") por <strong>$2,950 instalada</strong>, anclada en una cavidad de pernos 2x6 que enmarcamos durante la demolición específicamente para la puerta. La "puerta de vidrio personalizada" se convirtió en el punto focal de todo el baño — y en el nombre del proyecto. Proyecto: <a href="/es/projects/maple-ridge-bathroom-renovation-custom-glass-door-2/">Baño con puerta de vidrio personalizada Maple Ridge</a>.</p>

<h3>Proyecto 4 — Baño de lujo Burnaby: walk-in sin marco completo</h3>
<p>Baño master de Burnaby, presupuesto $28K–$32K, con una ducha walk-in de 60" × 36" reemplazando una bañera vieja. Se especificó vidrio templado sin marco de 1/2" con actualización a "ultra-claro" de bajo hierro (elimina el tinte verde que se obtiene en el templado estándar al mirar a través de los bordes), bisagras de oro cepillado para combinar con la línea de plomería Brizo. Total <strong>$3,650 instalada</strong> — alrededor del 12% del presupuesto del baño, pero el elemento más fotografiado de la habitación terminada. Proyecto: <a href="/es/projects/luxury-bathroom-renovation-burnaby/">Baño de lujo Burnaby</a>.</p>

<h3>Proyecto 5 — North Vancouver sin reborde: encerramiento completo sin marco</h3>
<p>Baño master de North Vancouver, presupuesto $42K–$45K, diseñado alrededor de una ducha walk-in sin reborde con drenaje lineal y azulejo continuo desde el piso del baño hasta el piso de la ducha. Requirió un encerramiento completo sin marco de 1/2": panel fijo + puerta + panel de retorno + cabezal de vidrio superior de 8' para mantener el vapor contenido. <strong>$5,200 instalada</strong>, incluyendo la presa de cabezal de acero y vidrio. La distribución sin reborde con azulejo continuo demandaba el tratamiento sin marco — semi-sin marco o corrediza habría roto visualmente el plano del piso. Proyecto: <a href="/es/projects/luxury-bathroom-renovation-north-vancouver/">Baño de lujo sin reborde North Vancouver</a>.</p>

<h3>Proyecto 6 — Baño de lujo champagne gold West Vancouver</h3>
<p>Renovación de lujo del lado oeste, presupuesto de baño $36K–$40K. Vidrio templado sin marco de 1/2", bisagras de oro champagne envejecido en aceite (combinadas con la suite de accesorios Kohler Stillness), bordes pulidos en todo. La especificación del herraje sola añadió $400 sobre el cromo estándar, pero la cohesión a través de plomería/puerta/toallero era no negociable para la intención del diseño. <strong>$4,400 instalada</strong>. Proyecto: <a href="/es/projects/west-vancouver-luxury-bathroom-champagne-gold/">Baño master champagne gold West Van</a>.</p>

<h2>Reglas de código BC y seguridad que todo instalador debe seguir</h2>
<ul>
<li><strong>El vidrio templado certificado CSA es obligatorio.</strong> El Código de Construcción de BC (BCBC) Sección 9.6 requiere vidrio de seguridad en todos los encerramientos de ducha. Templado (CSA Z97.1 o ANSI Z97.1) es el estándar. Vidrio sin marca o no templado es una violación de código y una responsabilidad del seguro — si se rompe, puede causar laceraciones graves.</li>
<li><strong>Cada panel debe mostrar un sello permanente grabado.</strong> La certificación CSA se identifica por un logo permanente grabado al ácido en una esquina. Aléjate de cualquier vidriería que suministre vidrio "templado" sin el sello.</li>
<li><strong>Altura del reborde: mínimo 4", recomendado 6" para sin marco.</strong> El mínimo del Código de Plomería de BC es 2", pero con puertas sin marco que no sellan en la parte inferior, 4–6" es el mínimo práctico para mantener el agua dentro.</li>
<li><strong>El refuerzo en la pared no es negociable para sin marco.</strong> Refuerzo 2x6 o bloqueo de contrachapado de 3/4" detrás del azulejo en la cavidad de pernos de la bisagra. Esta es una decisión de armado — debe suceder durante la demolición, antes de que suba el cemento. Adaptar después de que el azulejo está colocado significa cortar azulejo terminado.</li>
<li><strong>El vidrio templado no se puede cortar ni perforar después del templado.</strong> Todas las muescas para bisagras, abrazaderas y fijaciones de cabezal deben ser plantilladas por la vidriería y cortadas antes del templado. Un error de medición significa un nuevo panel de $300–$1,200.</li>
<li><strong>Las duchas de vapor necesitan vidrio superior.</strong> Si el diseño incluye un generador de vapor (común en proyectos de lujo), la puerta debe estar tapada en la parte superior con vidrio para contener el vapor y evitar empañar el resto del baño. Añade $400–$1,500 para la tapa de vidrio.</li>
</ul>

<h2>Donde los propietarios de Vancouver eligen mal</h2>
<ol>
<li><strong>Elegir sin marco en un combo bañera-ducha.</strong> Las puertas con bisagra sin marco no funcionan bien sobre una bañera porque la bisagra no tiene nada sólido en lo que anclarse (el yeso sobre la cubierta de la bañera no aguanta 80 lbs de vidrio). Corrediza bypass — con marco o sin marco sobre rieles — es la elección correcta aquí. Nos han llamado para adaptar cuando otros contratistas intentaron esto y la puerta se separó de la pared en 18 meses.</li>
<li><strong>Saltar el refuerzo de pared durante el armado.</strong> Si no le dices a tu contratista "esta cavidad de pernos necesita bloqueo para una puerta sin marco" durante la demolición, perderás la opción sin marco más tarde o pagarás $1,200–$2,000 para cortar azulejo terminado y agregar bloqueo después del hecho.</li>
<li><strong>Comprar sin marco sin confirmar la planitud de la pared.</strong> El vidrio sin marco necesita una pared que sea plana dentro de 1/8" sobre su altura. Las paredes viejas de azulejo de Vancouver (especialmente azulejo de 4×4" anterior a 2000) a menudo tienen ondulaciones de 1/4"–1/2". Si la pared no es plana, el vidrio o se pellizca en partes o se asienta con espacios visibles. Añade $400–$800 para nivelar la pared antes del azulejo si se descubre tarde.</li>
<li><strong>Elegir la corrediza con marco más barata para un baño principal.</strong> Los rodillos de plástico en juegos corredizos con marco de $400–$600 fallan en 5–8 años (los hemos reemplazado en docenas de trabajos). Para cualquier cosa que no sea un alquiler, gasta los $200–$400 extra en rodillos de acero inoxidable — duran 15–20 años.</li>
<li><strong>Olvidar especificar vidrio de bajo hierro en diseños de iluminación con tonos.</strong> El templado estándar tiene un tinte verde en los bordes que es invisible a 1/4" pero pronunciado a 1/2". En una instalación sin marco con herraje de oro cepillado o negro mate, el borde verde lucha con el diseño. El bajo hierro (Starphire, Diamant) añade $150–$400 al costo del panel — casi siempre vale la pena en instalaciones premium.</li>
</ol>

<h2>Cómo presupuestar tu vidrio de ducha</h2>
<ol>
<li><strong>Decide el tipo de encerramiento durante la fase de diseño, no en la fase de demolición.</strong> Walk-in vs nicho vs bañera-ducha impulsa cada decisión posterior (ubicación de la bisagra, altura del reborde, armado de la pared).</li>
<li><strong>Presupuesta vidrio en 8–12% del costo total del baño.</strong> Un baño de $25K debería planificar $2,000–$3,000 para vidrio. Una construcción de lujo de $45K debería planificar $4,000–$5,500.</li>
<li><strong>Arma para bloqueo antes del azulejo.</strong> Dile al GC dónde caen las bisagras. Bloqueo 2x6 o de contrachapado, no 2x4 con yeso.</li>
<li><strong>Pide el vidrio después del rough-in, no durante el diseño.</strong> Las plantillas finales requieren las paredes terminadas reales, así que la vidriería mide después de que se coloca el azulejo. El tiempo de espera típico es 2–3 semanas desde la plantilla hasta la instalación.</li>
<li><strong>Combina el acabado del herraje con la línea de plomería.</strong> Si los grifos son bronce champagne, las bisagras también deberían serlo. Los acabados mezclados son el error visual más barato de evitar.</li>
</ol>

<h2>Preguntas frecuentes</h2>

<h3>¿Realmente vale la pena sin marco los $1,500–$2,500 extra?</h3>
<p>Para un baño master con el que vivirás 15+ años, sí — la diferencia visual es significativa y la longevidad del herraje es mejor. Para un baño secundario o una propiedad para vender, no — el semi-sin marco logra el 80% del aspecto al 60% del costo.</p>

<h3>¿Las puertas de ducha de vidrio gotean?</h3>
<p>Sin marco y semi-sin marco no sellan en la parte inferior por diseño (brecha de 3/16" para juego de bisagra). Dependen de la altura del reborde + posicionamiento del cabezal de ducha para contener el agua. Si tu cabezal de ducha apunta a la puerta, el agua salpicará — corrígelo apuntando el cabezal a la pared trasera. Las puertas corredizas bypass sellan mejor pero el sello se degrada cuando los rodillos se desgastan.</p>

<h3>¿Qué espesor de vidrio templado necesito?</h3>
<p>1/4" solo para puertas corredizas con marco. Mínimo 3/8" para cualquier puerta sin marco (con bisagra, pivotada o sin marco sobre rieles). 1/2" es el estándar de Vancouver para instalaciones verdaderamente sin marco, especialmente para paneles de más de 30" de ancho. Vidrio más grueso = panel más rígido = menos flexión = vida útil del herraje más larga.</p>

<h3>¿Puedo instalar una puerta de ducha de vidrio en una ducha de azulejo existente?</h3>
<p>Corrediza bypass y semi-sin marco: sí, generalmente. Sin marco: solo si la pared tiene refuerzo 2x6 o de contrachapado detrás del azulejo en la cavidad de pernos de la bisagra, lo que la mayoría de los baños de Vancouver anteriores a 2010 no tienen. Confirma antes de comprometerte.</p>

<h3>¿Cuánto tarda la instalación de vidrio de ducha?</h3>
<p>Desde plantilla (día 1) hasta instalación (días 14–21) para sin marco personalizado. Semi-sin marco estándar y corrediza con marco de tamaños en stock pueden instalarse la misma semana. Planifica el pedido del vidrio durante el rough-in, no después del azulejo.</p>

<h3>¿Es realista una ducha walk-in sin reborde con presupuesto?</h3>
<p>La ducha en sí es realista en baños de $25K+. El encerramiento sin marco completo que la acompaña empuja el proyecto a $35K+. Sin reborde con presupuesto ajustado generalmente significa un encerramiento parcial o un medio muro — pero consulta nuestra <a href="/es/blog/bathroom-refresh-without-full-renovation-vancouver-2026/">guía de refresh de baño</a> para conversiones sin reborde de nivel refresh.</p>

<h3>¿Debería gastar en vidrio de bajo hierro?</h3>
<p>En instalaciones sin marco de 1/2" con acabados de herraje audaces (oro, negro, bronce), sí — el tinte verde en los bordes del templado estándar lucha con el diseño. En corrediza con marco de 1/4", no — el tinte apenas es visible.</p>

<h2>Guías relacionadas</h2>
<ul>
<li><a href="/es/guides/bathroom-renovation-cost-vancouver/">Costo de Renovación de Baño Vancouver: $10K–$60K Datos Reales</a> — la guía padre para presupuestos completos de baño</li>
<li><a href="/es/blog/bathroom-renovation-cost-vancouver-by-style/">Costo de Renovación de Baño por Estilo: Moderno, Spa, Heritage</a> — cómo las elecciones de estilo impulsan la selección de puerta de vidrio</li>
<li><a href="/es/blog/bathroom-refresh-without-full-renovation-vancouver-2026/">Refresh de Baño sin Renovación Completa</a> — cuando un cambio de puerta de vidrio es la jugada correcta sola</li>
<li><a href="/es/blog/best-bathroom-tiles-vancouver-2026/">Mejores Azulejos de Baño Vancouver 2026</a> — la planitud de la pared afecta la viabilidad sin marco</li>
<li><a href="/es/blog/toilet-renovation-cost-vancouver/">Costo de Renovación de Inodoro Vancouver</a> — guía complementaria de costo de accesorios</li>
<li><a href="/es/blog/vanity-renovation-cost-vancouver/">Costo de Renovación de Mueble Vancouver</a> — guía complementaria de costo de accesorios</li>
<li><a href="/es/blog/bathtub-renovation-cost-vancouver/">Costo de Renovación de Bañera Vancouver</a> — cuando mantener la bañera vs ir walk-in</li>
<li><a href="/es/services/bathroom/">Servicios de Renovación de Baño</a> — qué hacemos, cómo trabajamos</li>
</ul>

<p>¿Quieres nuestra recomendación sobre qué tipo de puerta encaja en tu disposición y presupuesto específicos? Envíanos una foto de la configuración existente con dimensiones aproximadas, y te respondemos en 48 horas con tres opciones por niveles a través de los niveles anteriores. <a href="/es/contact/">Reserva una consulta gratuita en casa</a>.</p>
</article>`;

const localizations = {
  titleZhHant,
  excerptZhHant,
  contentZhHant,
  metaTitleZhHant,
  metaDescriptionZhHant: metaDescZhHant,
  titleJa,
  excerptJa,
  contentJa,
  metaTitleJa,
  metaDescriptionJa: metaDescJa,
  titleKo,
  excerptKo,
  contentKo,
  metaTitleKo,
  metaDescriptionKo: metaDescKo,
  titleEs,
  excerptEs,
  contentEs,
  metaTitleEs,
  metaDescriptionEs: metaDescEs,
};

async function run() {
  const sql = `INSERT INTO blog_posts (
    slug, title_en, title_zh, excerpt_en, excerpt_zh, content_en, content_zh,
    meta_title_en, meta_title_zh, meta_description_en, meta_description_zh,
    focus_keyword_en, focus_keyword_zh, reading_time_minutes,
    featured_image_url, author, is_published, published_at, created_at, updated_at,
    localizations
  ) VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21::jsonb
  ) ON CONFLICT (slug) DO NOTHING RETURNING id, slug`;
  const now = new Date().toISOString();
  const vals = [
    slug,
    titleEn,
    titleZh,
    excerptEn,
    excerptZh,
    contentEn,
    contentZh,
    metaTitleEn,
    metaTitleZh,
    metaDescEn,
    metaDescZh,
    focusKwEn,
    focusKwZh,
    13,
    heroImage,
    'Reno Stars Team',
    true,
    now,
    now,
    now,
    JSON.stringify(localizations),
  ];
  const r = await pool.query(sql, vals);
  if (r.rows.length) {
    console.log('Inserted:', r.rows[0].slug);
  } else {
    console.log('Skip (exists):', slug);
  }
  await pool.end();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
