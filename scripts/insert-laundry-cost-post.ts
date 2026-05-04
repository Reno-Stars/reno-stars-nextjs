import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const slug = 'laundry-room-renovation-cost-vancouver-2026';
const heroImage =
  'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg';

const titleEn = 'Laundry Room Renovation Cost Vancouver 2026: Closet, Dedicated & Stacked Setups';
const titleZh = '温哥华洗衣房装修费用 2026：壁橱、独立间、堆叠机三种方案';
const titleZhHant = '溫哥華洗衣房裝修費用 2026：壁櫥、獨立洗衣間、上下疊三種方案';
const titleJa = 'バンクーバー ランドリールーム改装費用 2026：クローゼット型・専用ルーム・スタック型の3パターン';
const titleKo = '밴쿠버 세탁실 리노베이션 비용 2026: 클로짓·전용 룸·스택형 3가지 셋업';
const titleEs = 'Costo de Renovación del Cuarto de Lavado Vancouver 2026: Closet, Cuarto Dedicado y Stackable';

const metaTitleEn = 'Laundry Room Renovation Cost Vancouver 2026 | $1,800–$18,000+';
const metaTitleZh = '温哥华洗衣房装修费用 2026 | $1,800–$18,000+ | Reno Stars';
const metaTitleZhHant = '溫哥華洗衣房裝修費用 2026 | $1,800–$18,000+ | Reno Stars';
const metaTitleJa = 'バンクーバー ランドリールーム改装費用 2026 | $1,800〜$18,000+ | Reno Stars';
const metaTitleKo = '밴쿠버 세탁실 리노베이션 비용 2026 | $1,800–$18,000+ | Reno Stars';
const metaTitleEs = 'Costo Cuarto de Lavado Vancouver 2026 | $1,800–$18,000+ | Reno Stars';

const metaDescEn =
  'Vancouver laundry room reno cost: $1,800 (closet stackable swap) to $18,000+ (dedicated room w/ cabinets, sink, tile). Real tier breakdown + pitfalls.';
const metaDescZh =
  '温哥华洗衣房装修费用：$1,800（壁橱堆叠机更换）至$18,000+（独立洗衣间含柜体、水槽、瓷砖地板）。真实分层数据+排气和水电常见坑。';
const metaDescZhHant =
  '溫哥華洗衣房裝修費用：$1,800（壁櫥上下疊更換）至$18,000+（獨立洗衣間含櫃體、水槽、瓷磚地板）。真實分層數據+排氣與水電常見陷阱。';
const metaDescJa =
  'バンクーバーのランドリールーム改装費用：$1,800（クローゼットのスタック型交換）から$18,000+（キャビネット・シンク・タイル床付き専用ルーム）まで。実際の段階別内訳と配管・排気のつまずきポイント。';
const metaDescKo =
  '밴쿠버 세탁실 리노베이션 비용: $1,800(클로짓 스택형 교체)부터 $18,000+(캐비닛·싱크·타일 바닥 갖춘 전용 룸)까지. 단계별 실제 견적과 배관·배기 함정 정리.';
const metaDescEs =
  'Costo de renovación del cuarto de lavado en Vancouver: desde $1,800 (cambio de stackable en closet) hasta $18,000+ (cuarto dedicado con gabinetes, fregadero y piso de baldosa). Desglose real por nivel + errores de plomería y ventilación.';

const focusKwEn = 'laundry room renovation cost';
const focusKwZh = '温哥华洗衣房装修费用';

const excerptEn =
  "What does a laundry room renovation actually cost in Vancouver? A like-for-like stackable swap in a hallway closet runs $1,800–$3,500; a refreshed laundry closet with new cabinets and quartz top runs $4,500–$8,500; a fully built-out dedicated laundry room with sink, tile floor, custom cabinets, and proper venting runs $9,000–$18,000+. Here's the real breakdown from our recent Metro Vancouver projects, including the plumbing, venting, and electrical pitfalls that blow budgets.";
const excerptZh =
  '温哥华洗衣房装修真实费用是多少？走廊壁橱里的堆叠机等量更换：$1,800–$3,500；翻新的洗衣壁橱（新柜体+石英台面）：$4,500–$8,500；完整搭建的独立洗衣间（水槽+瓷砖地板+定制柜+合规排气）：$9,000–$18,000+。以下是我们大温地区近期项目的真实数据，包括最容易爆预算的水电和排气坑。';
const excerptZhHant =
  '溫哥華洗衣房裝修真實費用是多少？走廊壁櫥裡的上下疊洗烘等量更換：$1,800–$3,500；翻新的洗衣壁櫥（新櫃體+石英檯面）：$4,500–$8,500；完整建構的獨立洗衣間（水槽+瓷磚地板+客製櫃+合規排氣）：$9,000–$18,000+。以下是我們大溫地區近期專案的真實數據，包括最容易超支的水電與排氣陷阱。';
const excerptJa =
  'バンクーバーでランドリールーム改装の実際の費用は？廊下のクローゼット内でスタック型を同等品に交換する場合は$1,800〜$3,500、新しいキャビネットとクオーツトップ付きのリフレッシュ済みランドリークローゼットは$4,500〜$8,500、シンク・タイル床・カスタムキャビネット・適切な排気を備えた専用ランドリールームは$9,000〜$18,000+。メトロバンクーバーでの最近の現場データから、配管・排気・電気で予算が崩れるポイントまで詳しく解説します。';
const excerptKo =
  '밴쿠버 세탁실 리노베이션 실제 비용은? 복도 클로짓 안 스택형 교체는 $1,800–$3,500, 새 캐비닛+쿼츠 상판으로 리프레시된 세탁 클로짓은 $4,500–$8,500, 싱크·타일 바닥·맞춤 캐비닛·규정에 맞는 배기까지 갖춘 전용 세탁실은 $9,000–$18,000+. 메트로 밴쿠버 최근 현장 데이터와, 배관·배기·전기에서 예산이 무너지는 지점을 정리했습니다.';
const excerptEs =
  '¿Cuánto cuesta realmente renovar un cuarto de lavado en Vancouver? Cambiar una stackable en un closet de pasillo cuesta $1,800–$3,500; refrescar un closet de lavandería con gabinetes nuevos y top de cuarzo cuesta $4,500–$8,500; un cuarto de lavado dedicado con fregadero, piso de baldosa, gabinetes a medida y ventilación adecuada cuesta $9,000–$18,000+. Te mostramos el desglose real de nuestros proyectos recientes en Metro Vancouver, incluyendo los errores de plomería, ventilación y electricidad que disparan el presupuesto.';

const contentEn = `<article>
<h1>Laundry Room Renovation Cost Vancouver 2026: Closet, Dedicated & Stacked Setups</h1>

<p class="lead">Laundry rooms get the smallest budget on most Vancouver renovation projects — and the most expensive surprises. A simple stackable swap turns into a $5,000 plumbing reroute when the trap arm fails inspection. Here's what laundry room renovation actually costs in Metro Vancouver in 2026, broken down by setup and based on real Reno Stars project data.</p>

<h2>Quick price summary</h2>
<table>
<thead><tr><th>Setup</th><th>Vancouver installed cost</th><th>Lead time</th><th>Best for</th></tr></thead>
<tbody>
<tr><td>Stackable swap in existing closet</td><td>$1,800 – $3,500</td><td>1–2 days</td><td>Condos, townhomes, rentals — same location, like-for-like upgrade</td></tr>
<tr><td>Closet laundry refresh (cabinets + countertop + venting fix)</td><td>$4,500 – $8,500</td><td>3–5 days</td><td>Hallway / mudroom closets that need a clean look + storage</td></tr>
<tr><td>Side-by-side laundry closet expansion</td><td>$6,000 – $11,000</td><td>1–2 weeks</td><td>Converting stackable to side-by-side; framing widens, drywall + new flooring</td></tr>
<tr><td>Dedicated laundry room (basement / main floor)</td><td>$9,000 – $18,000</td><td>2–4 weeks</td><td>Whole-house renos, basement suites, families wanting sink + folding station</td></tr>
<tr><td>Combined laundry / mudroom build-out</td><td>$12,000 – $24,000+</td><td>3–5 weeks</td><td>Single-family homes adding bench seating, lockers, dog wash, full storage wall</td></tr>
</tbody>
</table>
<p><em>Prices are installed and include the appliances OR the contractor labour to install owner-supplied appliances, supply lines, dryer vent ducting up to 6 feet, GFCI outlets where required, and disposal of the old units. Permits, structural moves (relocating drain or vent stack), gas line work for gas dryers, and condo strata-required noise insulation are billed separately.</em></p>

<h2>What drives the price</h2>

<h3>1. Appliances themselves ($1,200 – $7,000)</h3>
<p>The pair you choose sets the floor for the whole project. What we install most:</p>
<ul>
<li><strong>Mid-range stackable (LG, Samsung, GE) — $1,400–$2,400 pair:</strong> 27" wide, ventless or vented, the default for condos and hallway closets.</li>
<li><strong>Compact 24" stackable (Bosch, Miele, Asko) — $2,800–$5,500 pair:</strong> Required where a 27" pair won't physically fit (tight condo closets, hallway alcoves under 28" wide). Ventless heat pump dryers eliminate ducting headaches.</li>
<li><strong>Full-size side-by-side (LG WashTower, Samsung FlexWash) — $2,200–$3,800 pair:</strong> 27" each, takes 54"+ of floor width. Better capacity, easier to load, more counter space above.</li>
<li><strong>Heat pump ventless ($2,800–$5,000 dryer alone):</strong> No vent through wall — huge for condos and basement laundry where venting is impossible. Slower drying cycles (~90 min vs 45 min) but eliminates the #1 fire hazard in any home.</li>
<li><strong>Smart all-in-one washer/dryer combos (LG WashCombo) — $3,200–$4,500:</strong> One unit washes AND dries with no transfer. Trade-off: half the dryer capacity of a separate unit.</li>
</ul>

<h3>2. Plumbing ($600 – $4,500)</h3>
<p>Almost every Vancouver laundry project surfaces at least one plumbing surprise:</p>
<ul>
<li><strong>Hot/cold supply line replacement (recessed washing machine box):</strong> $400–$800 (replace 25-year-old saddle valves with code-compliant ball valves; install proper recessed box behind washer)</li>
<li><strong>Trap arm replacement / re-pitch:</strong> $600–$1,500 (1990-and-earlier homes routinely have undersized 1.5" laundry traps; current code is 2" with a 2" standpipe ≥18" tall)</li>
<li><strong>Standpipe relocation (moving washer along same wall):</strong> $800–$1,800</li>
<li><strong>Drain rerouting (moving laundry to a new room):</strong> $2,000–$4,500 depending on joist accessibility, slab cut requirements, and vent stack location</li>
<li><strong>Adding a utility sink (new drain tee + supply lines):</strong> $700–$1,800 plumbing, plus $200–$1,200 for the sink/faucet itself</li>
</ul>

<h3>3. Venting ($300 – $2,500)</h3>
<p>Dryer venting is where most DIY laundry installs fail. Code minimums (BC Building Code 2024):</p>
<ul>
<li>Rigid metal duct only (no plastic flex) — exceptions only for 8 ft of UL-listed flex behind the dryer</li>
<li>Maximum total run 7.6 m (25 ft) minus 1.5 m (5 ft) per 90° elbow</li>
<li>Termination cap with damper, no screen on the outside hood</li>
<li>Slope downward to outside (no traps that collect lint condensate)</li>
</ul>
<p>Costs:</p>
<ul>
<li><strong>Like-for-like vent re-connection (existing duct stays):</strong> $150–$300</li>
<li><strong>New short run through exterior wall (less than 8 ft, no obstacles):</strong> $400–$900</li>
<li><strong>Long run through ceiling/joists with 2+ elbows:</strong> $900–$2,000</li>
<li><strong>Roof-vented run (3-storey + townhomes):</strong> $1,500–$2,500 + roof flashing work</li>
<li><strong>Switching to ventless heat pump (eliminates duct work entirely):</strong> appliance upcharge $1,200–$2,500 but saves all duct labour and prevents lint fires</li>
</ul>

<h3>4. Electrical ($300 – $2,200)</h3>
<p>Vancouver homes built before 2010 routinely fail laundry room electrical inspection:</p>
<ul>
<li><strong>Dedicated 240V/30A circuit for electric dryer:</strong> $600–$1,500 if no existing 240V receptacle, $300–$600 to replace a non-grounded 3-prong with code-compliant 4-prong</li>
<li><strong>Dedicated 120V/15A or 20A for washer:</strong> $400–$900 if a new home run is needed</li>
<li><strong>GFCI outlet within 1m of laundry sink:</strong> required by code; $200–$400 to add</li>
<li><strong>Light + exhaust fan circuit:</strong> $400–$800 if neither exists</li>
<li><strong>Subpanel needed (older 100A panel out of breakers):</strong> $1,800–$3,500 (plan separately if your panel is full)</li>
</ul>

<h3>5. Cabinets, countertop, sink ($1,800 – $7,500)</h3>
<p>The "feels like a real laundry room" upgrade. Where homeowners spend or save:</p>
<ul>
<li><strong>Stock IKEA SEKTION or Home Depot cabinets — $800–$2,200 for 6–8 linear ft:</strong> Most cost-effective. White or oak Shaker fronts, soft-close, holds detergent + linens.</li>
<li><strong>Custom melamine + laminate doors — $1,800–$4,500:</strong> Local Vancouver shops (Kelowna Wood, Fraser Valley Cabinets) build to exact dimensions for tight closets.</li>
<li><strong>Solid wood / shaker custom — $3,500–$7,500:</strong> Matches kitchen cabinets in main-floor laundry rooms.</li>
<li><strong>Quartz countertop (4–6 ft) — $600–$1,400:</strong> Folding station above front-loaders. White or grey Caesarstone is the most common spec.</li>
<li><strong>Butcher block (oak, maple) — $300–$800:</strong> Warmer look, requires annual oiling.</li>
<li><strong>Utility sink (single-bowl stainless 16–22") — $200–$700 fixture, plus faucet $150–$500:</strong> Critical for hand-washing and dog/pet bath stations.</li>
</ul>

<h3>6. Flooring ($800 – $3,500)</h3>
<p>Laundry room flooring takes water abuse. We spec by tier:</p>
<ul>
<li><strong>Sheet vinyl / LVT — $4–$8 per sq ft installed:</strong> Cheapest waterproof option. Easy to replace.</li>
<li><strong>Porcelain tile — $9–$15 per sq ft installed:</strong> Best long-term. Survives leaks, indoor/outdoor look matches mudroom needs.</li>
<li><strong>Heated tile floor (electric mat) — add $7–$12 per sq ft:</strong> Popular for basement laundry rooms where the floor sits on concrete.</li>
</ul>

<h2>The three setups in detail</h2>

<h3>Setup 1: Stackable swap in existing closet ($1,800–$3,500)</h3>
<p>Keeping the appliances in the same closet, replacing them like-for-like. This is the most common Vancouver condo job. Scope:</p>
<ul>
<li>Disconnect old units, dispose of them ($200 disposal fee through Encorp)</li>
<li>Install new recessed washing machine box if the old one is corroded ($300 plumbing labour + $80 box)</li>
<li>Install new 4-prong dryer cord if appliance comes with 3-prong ($30 cord + 15 min labour)</li>
<li>Connect supply lines, test for leaks under full pressure</li>
<li>Reconnect dryer vent (or replace if ducting is plastic flex — code violation)</li>
<li>Level the units and balance the washer drum</li>
</ul>
<p>Real Reno Stars example: <strong>Richmond condo, LG stackable swap</strong> — owner-supplied $2,100 LG WashTower, our labour $850 (4 hrs plumbing + electrical + venting), 1 day.</p>

<h3>Setup 2: Closet laundry refresh ($4,500–$8,500)</h3>
<p>Same location but adding cabinets above, a quartz countertop above front-loaders, new flooring, fresh paint, and proper code-compliant rough-in. Scope:</p>
<ul>
<li>Pull old appliances + drywall</li>
<li>Replace galvanized supply lines with PEX, install proper 2" trap and standpipe</li>
<li>New 240V outlet for dryer if not already 4-prong</li>
<li>Vinyl plank or LVT flooring under the appliances</li>
<li>Build 30"-deep upper cabinets (or stack of three open shelves)</li>
<li>Quartz remnant (4 ft × 24" depth) on top of side-by-side or above stackable</li>
<li>Frame in dryer vent through exterior wall with rigid metal duct</li>
<li>Repaint, install new trim, install new bi-fold or barn doors on the closet opening</li>
</ul>
<p>Real example: <strong>Coquitlam townhouse hallway closet</strong>, mid-range Samsung side-by-side ($2,200), white IKEA SEKTION cabinets ($1,400), quartz remnant ($550), LVT ($300), labour $3,800 = $8,250 total. 4 days.</p>

<h3>Setup 3: Dedicated laundry room ($9,000–$18,000)</h3>
<p>Building a real laundry room from a basement utility space, mudroom, or under-stair area. Scope:</p>
<ul>
<li>Frame walls (if converting open utility space)</li>
<li>Plumbing rough-in: hot/cold supply, 2" standpipe + trap, drain tee for utility sink</li>
<li>Electrical: dedicated 30A/240V dryer, 20A washer, GFCI receptacles, lighting + fan circuit</li>
<li>Insulation (R-12 minimum on exterior walls; sound batts on walls shared with bedrooms)</li>
<li>Drywall + skim coat + paint</li>
<li>Porcelain tile floor with optional heat mat</li>
<li>Custom cabinets (8–12 linear ft) with quartz top</li>
<li>Stainless utility sink with single-handle faucet</li>
<li>Open shelf for hanging delicates + ironing board hideaway</li>
<li>Side-by-side or full-size stackable appliances</li>
</ul>
<p>Real example: <strong>Vancouver east-side basement renovation</strong>, dedicated laundry room with utility sink + 12 ft of cabinets + heated porcelain tile + side-by-side LG. Total $14,800 over 3 weeks. Part of a broader basement suite project from our <a href="/en/blog/basement-renovation-vancouver-complete-guide/">basement renovation Vancouver complete guide</a>.</p>

<h2>Where Vancouver homeowners overspend</h2>
<ol>
<li><strong>Buying premium 24" stackables when 27" fits.</strong> Bosch and Miele 24" pairs run $4,000+ and serve a tight condo closet. If your closet is 28" wide or more, a $1,800 LG 27" pair gives more capacity for less than half the cost. Measure twice before specifying compact.</li>
<li><strong>Specifying a gas dryer when electric is fine.</strong> Gas line installation in a basement laundry room can add $1,500–$3,500 and requires permits. Electric dryers heat slightly slower but cost nothing extra to install when the home is already wired for one. Heat pump electric dryers actually use less energy than gas long-term.</li>
<li><strong>Skipping the recessed washing machine box.</strong> A $80 box behind the wall (with proper hammer-arrestors, ball valves, and a single-lever shutoff) prevents 90% of laundry leaks. Installing this during the renovation is $300 of labour vs $4,000–$15,000 of water damage repair after a hose bursts.</li>
<li><strong>Routing the dryer vent through the roof when a wall vent works.</strong> Roof venting adds $800–$1,500 and creates more lint trap points. Side-wall venting is cheaper, easier to clean, and code-approved. Only choose roof venting when there's no exterior wall path within 7.6 m.</li>
<li><strong>Forgetting noise insulation on shared walls.</strong> A washer on spin cycle is 75 dB+ at 1 m. If the laundry shares a wall with a bedroom, $400 of sound batts + resilient channel during framing makes the difference between "hear every cycle" and "didn't realize you ran a load." Critical for basement suites.</li>
</ol>

<h2>Recent Vancouver project costs (real Reno Stars data)</h2>
<ul>
<li><strong>Richmond condo stackable swap:</strong> $2,950 installed (owner-supplied LG WashTower $2,100, labour 4 hrs $850). Existing closet, no plumbing/electrical changes. <a href="/en/blog/condo-vs-house-renovation-cost-vancouver/">Condo renovation context</a>.</li>
<li><strong>Coquitlam townhouse hallway closet refresh:</strong> $8,250 (Samsung pair $2,200, IKEA SEKTION $1,400, quartz remnant $550, LVT $300, labour $3,800). 4 days.</li>
<li><strong>Burnaby whole-house renovation, basement laundry build-out:</strong> $11,400 of a $30K–$35K total project (Custom Kitchen Wood Veins basement reno). Included new 2" standpipe, 240V circuit, IKEA cabinets, vinyl plank floor, side-by-side LG.</li>
<li><strong>Vancouver east-side basement suite, dedicated laundry room with utility sink:</strong> $14,800 (custom cabinets $4,500, porcelain heated tile $2,200, plumbing rough-in $2,800, electrical $1,800, side-by-side appliances $2,400, drywall + paint $1,100). 3 weeks. Part of a basement suite per our <a href="/en/blog/basement-suite-renovation-cost-vancouver/">basement suite renovation cost guide</a>.</li>
<li><strong>West Vancouver mudroom + laundry combined build-out:</strong> $19,500 (custom millwork bench + lockers + laundry cabinets $9,500, porcelain tile $1,800, plumbing $2,400, electrical $1,200, paint + finish $1,400, appliances $3,200). 5 weeks.</li>
</ul>

<h2>Permits & strata rules</h2>

<h3>City of Vancouver / Surrey / Burnaby permits</h3>
<p>Like-for-like appliance swaps don't require permits. Anything below requires a building permit:</p>
<ul>
<li>Adding a new laundry where there was none (drain + supply rough-in)</li>
<li>Relocating a laundry to a different room</li>
<li>Adding a utility sink (drain + supply work)</li>
<li>New 240V or 30A circuits (electrical permit, separate from building permit)</li>
<li>Cutting a new dryer vent through an exterior wall</li>
</ul>
<p>Permit costs in Metro Vancouver run $250–$700 for a basic laundry build-out. A licensed contractor pulls these and includes the time in the quote.</p>

<h3>Condo strata rules</h3>
<p>Most Vancouver condo stratas have laundry-specific rules:</p>
<ul>
<li>No appliance changes without strata approval (some prohibit washer/dryer relocation entirely)</li>
<li>Plumbing work requires building manager notification 48 hrs in advance</li>
<li>Mandatory leak pan under washer (failure to install = unlimited liability for the unit owner)</li>
<li>Quiet hours often restrict laundry use (typically 10 PM – 7 AM)</li>
<li>Stack cleaning required every 5–10 years; some buildings charge unit owners</li>
</ul>
<p>Always pull the strata bylaws + Form B before signing a renovation contract that touches laundry plumbing.</p>

<h2>Timeline expectations</h2>
<ul>
<li><strong>Stackable swap:</strong> 1 day on site, 1–2 days lead time on the appliance order</li>
<li><strong>Closet refresh with new cabinets:</strong> 3–5 days on site, 2–3 weeks total project (cabinet order + rough-in + finish)</li>
<li><strong>Side-by-side closet expansion:</strong> 1–2 weeks on site (framing change), 4–6 weeks total</li>
<li><strong>Dedicated laundry room build-out:</strong> 2–4 weeks on site, 6–10 weeks total (permit + cabinets + tile + finish)</li>
<li><strong>Combined laundry / mudroom:</strong> 3–5 weeks on site, 8–12 weeks total</li>
</ul>

<h2>Frequently asked questions</h2>

<h3>Can I install a washer in a Vancouver condo closet that doesn't have hookups?</h3>
<p>Sometimes. Possible if there's a plumbing wall within 3–4 m and the strata approves. Cost: $2,500–$6,000 in plumbing rough-in, plus the appliance itself. Heat pump ventless dryers solve the venting problem in concrete-slab condos. Strata approval is the gating factor — check Form B and bylaws first.</p>

<h3>Stackable or side-by-side?</h3>
<p>Stackable saves floor width (27" vs 54" for side-by-side). Side-by-side is easier to load, gives counter space above, and is ~$200 cheaper than equivalent stackables. If you have 54"+ of wall and a folding surface matters, go side-by-side. If space is tight or it's a hallway closet, go stackable.</p>

<h3>Are heat pump dryers worth the upcharge?</h3>
<p>Yes for condos and basement laundries with no easy vent path. Yes for fire-sensitive applications. Heat pump dryers run cooler, use 50% less energy, and require no exterior duct. Trade-offs: 60–90 min cycles vs 30–45 min for vented, and slightly higher upfront cost ($800–$1,500 more than vented). BC Hydro rebates of $200–$400 sometimes apply.</p>

<h3>How much does it cost to add a utility sink during a laundry renovation?</h3>
<p>$900–$2,500 typical: $200–$700 for the sink, $150–$500 for the faucet, $700–$1,800 for plumbing labour (drain tee + hot/cold rough-in + connection). Easy to add when walls are open during a renovation. Hard and expensive ($3K+) to add later if the wall is closed.</p>

<h3>Can the dryer share a vent with the kitchen exhaust or bathroom fan?</h3>
<p>No. BC Building Code requires a dedicated dryer vent. Sharing creates lint accumulation in fan ducts and creates fire risk. Always rough in a separate dryer vent path during construction.</p>

<h3>Is a heated tile floor worth it in the laundry room?</h3>
<p>For basement laundry on concrete slab: yes — adds $700–$1,500 and dramatically improves comfort year-round. For main-floor wood-frame laundry: usually no — the floor stays room temperature. Heated mat draws roughly the same energy as a 60W bulb on a thermostat, so operating cost is minimal.</p>

<h3>How long does a renovated laundry room last?</h3>
<p>Appliances: 10–15 years for vented dryers, 8–12 for stackables, 12–18 for compact European pairs. Cabinets, countertop, and tile floor: 20–30 years if specs match the use. Rough-in plumbing and electrical: lifetime if installed to current code with PEX supply lines.</p>

<h2>Planning your laundry budget</h2>
<ol>
<li><strong>Pick your setup tier first (closet swap / closet refresh / dedicated room / combo).</strong> Each tier has wildly different downstream labour requirements.</li>
<li><strong>Confirm your panel has space for new circuits before specifying premium appliances.</strong> A full panel = $2,000+ subpanel job before you can install a 30A dryer.</li>
<li><strong>Measure the closet inside dimensions, not the door opening.</strong> A 27" stackable needs 28" minimum interior width; 24" compact needs 25"+. Stackables also need 2" depth clearance for hoses behind.</li>
<li><strong>Plan venting path before ordering the dryer.</strong> Heat pump ventless solves impossible-vent situations but adds $1,200–$2,500 to the appliance cost.</li>
<li><strong>Reserve $500–$1,000 for plumbing surprises.</strong> Pre-1990 Vancouver homes routinely surface old galvanized supply, undersized traps, or rotted standpipes during demo.</li>
</ol>

<h2>Related cost guides</h2>
<ul>
<li><a href="/en/guides/basement-renovation-cost-vancouver/">Basement Renovation Cost Vancouver</a> — most laundry rooms live in basements; this is the parent cost guide</li>
<li><a href="/en/blog/basement-suite-renovation-cost-vancouver/">Basement Suite Renovation Cost Vancouver</a> — laundry rough-in is core to suite legalization</li>
<li><a href="/en/blog/condo-vs-house-renovation-cost-vancouver/">Condo vs House Renovation Cost Vancouver</a> — different laundry constraints in each housing type</li>
<li><a href="/en/blog/renovation-permits-bc-guide/">Renovation Permits BC Guide</a> — when laundry work needs a permit</li>
<li><a href="/en/services/basement/">Basement Renovation Services</a> — what we deliver and how we work</li>
</ul>

<p>Want a real laundry room quote? Send us photos of the current space and what you're considering and we'll come back with three tiered options within 48 hours. <a href="/en/contact/">Free in-home consultation</a>.</p>
</article>`;

const contentZh = `<article>
<h1>温哥华洗衣房装修费用 2026：壁橱、独立间、堆叠机三种方案</h1>

<p class="lead">洗衣房通常是温哥华装修项目里预算最少的，却最容易爆惊喜。一个简单的堆叠机更换可以变成$5,000的水管改造——只因排水陷管尺寸过检不通过。以下是温哥华2026年洗衣房装修真实费用，按方案分层，基于Reno Stars近期项目数据。</p>

<h2>价格速查表</h2>
<table>
<thead><tr><th>方案</th><th>温哥华安装价</th><th>工期</th><th>适合</th></tr></thead>
<tbody>
<tr><td>原壁橱内堆叠机更换</td><td>$1,800 – $3,500</td><td>1–2天</td><td>公寓、联排、出租房——同位置等量升级</td></tr>
<tr><td>洗衣壁橱翻新（柜体+台面+排气整改）</td><td>$4,500 – $8,500</td><td>3–5天</td><td>走廊/玄关壁橱想要整洁外观+收纳</td></tr>
<tr><td>堆叠机改并排（壁橱扩宽）</td><td>$6,000 – $11,000</td><td>1–2周</td><td>从堆叠机改并排——加框、批墙、新地板</td></tr>
<tr><td>独立洗衣间（地下室/主层）</td><td>$9,000 – $18,000</td><td>2–4周</td><td>整屋翻新、地下室套房、想要水槽+折衣台的家庭</td></tr>
<tr><td>洗衣+玄关组合</td><td>$12,000 – $24,000+</td><td>3–5周</td><td>独立屋加长凳、储物柜、宠物洗澡台、整面收纳墙</td></tr>
</tbody>
</table>
<p><em>价格为安装价，含家电（或家电由业主提供时的安装人工）、供水管、6英尺以内排气管、规范要求的GFCI插座、旧机回收。许可证、改下水主管或排气主管、燃气干衣机的燃气管工程、公寓楼管会要求的隔音另算。</em></p>

<h2>价格驱动因素</h2>

<h3>1. 家电本身（$1,200 – $7,000）</h3>
<p>选机决定整个项目下限。我们装得最多的：</p>
<ul>
<li><strong>中端堆叠机（LG、三星、GE）——成对$1,400–$2,400：</strong>27寸宽，有/无排气，公寓和走廊壁橱默认。</li>
<li><strong>紧凑型24寸堆叠机（Bosch、Miele、Asko）——成对$2,800–$5,500：</strong>27寸装不下时必选（公寓窄壁橱、走廊凹龛宽度<28寸）。无排气热泵干衣机省去排气头疼。</li>
<li><strong>全尺寸并排（LG WashTower、三星FlexWash）——成对$2,200–$3,800：</strong>每台27寸，需要54寸+地面宽度。容量大、装卸方便、上方有台面空间。</li>
<li><strong>无排气热泵干衣机（单台$2,800–$5,000）：</strong>不需穿墙排气——对公寓和地下室洗衣房是救命方案。烘干慢一些（约90分钟 vs 45分钟），但消除了住宅最大火灾隐患。</li>
<li><strong>洗烘一体机（LG WashCombo）——$3,200–$4,500：</strong>一台机器洗+烘不用倒衣。代价：烘干容量是分体的一半。</li>
</ul>

<h3>2. 水管工程（$600 – $4,500）</h3>
<p>温哥华洗衣项目几乎每次都会跳出至少一个水管惊喜：</p>
<ul>
<li><strong>冷热进水管更换（嵌墙洗衣机水盒）：</strong>$400–$800（25年老角阀换合规球阀；规范的嵌墙水盒装在洗衣机后）</li>
<li><strong>排水陷管更换/重新坡度：</strong>$600–$1,500（1990年前的房子洗衣陷管常是1.5寸不达标；现规范是2寸+18寸高的2寸立管）</li>
<li><strong>立管位移（沿同一面墙换位置）：</strong>$800–$1,800</li>
<li><strong>下水改道（洗衣搬到新房间）：</strong>$2,000–$4,500，看楼板可达性、是否需切混凝土、排气主管位置</li>
<li><strong>加洗衣槽（新增下水T口+冷热水）：</strong>水管$700–$1,800，水槽+龙头另$200–$1,200</li>
</ul>

<h3>3. 排气（$300 – $2,500）</h3>
<p>排气是大部分DIY洗衣安装翻车的地方。BC建筑规范2024要求：</p>
<ul>
<li>必须刚性金属管（不准塑料软管）——例外：干衣机后8英尺UL认证软管</li>
<li>总长不超过7.6米（25英尺），每个90度弯减1.5米（5英尺）</li>
<li>外端罩子带活门，外罩不准加防虫网</li>
<li>向下倾斜外排（不能有积液弯）</li>
</ul>
<p>费用：</p>
<ul>
<li><strong>等量重接（旧管保留）：</strong>$150–$300</li>
<li><strong>外墙短距离穿管（小于8英尺无障碍）：</strong>$400–$900</li>
<li><strong>穿吊顶/楼板长距离含2+弯头：</strong>$900–$2,000</li>
<li><strong>屋顶排气（3层+联排）：</strong>$1,500–$2,500+屋顶防水</li>
<li><strong>改无排气热泵（彻底消除排气工程）：</strong>家电加价$1,200–$2,500，但省全部排气人工，杜绝棉绒火灾</li>
</ul>

<h3>4. 电工（$300 – $2,200）</h3>
<p>2010年前的温哥华房子洗衣房电气检验经常不过：</p>
<ul>
<li><strong>电干衣机专用240V/30A回路：</strong>$600–$1,500（无现成240V接口）；$300–$600（旧3线换合规4线插座）</li>
<li><strong>洗衣机专用120V/15A或20A：</strong>$400–$900（需新拉线）</li>
<li><strong>洗衣槽1米内GFCI插座：</strong>规范要求；$200–$400加装</li>
<li><strong>照明+排气扇电路：</strong>$400–$800（从无到有）</li>
<li><strong>需要分电箱（旧100A电箱断路器位满）：</strong>$1,800–$3,500（电箱满请单独预算）</li>
</ul>

<h3>5. 柜体、台面、水槽（$1,800 – $7,500）</h3>
<p>"像真正的洗衣房"升级。业主花钱或省钱的地方：</p>
<ul>
<li><strong>IKEA SEKTION或Home Depot标准柜——6–8线英尺$800–$2,200：</strong>性价比最高。白或橡木Shaker门、缓冲铰链、放洗涤剂+布草。</li>
<li><strong>定制三聚氰胺+层压门——$1,800–$4,500：</strong>本地温哥华作坊（Kelowna Wood、Fraser Valley Cabinets）按窄壁橱精准定制。</li>
<li><strong>实木Shaker定制——$3,500–$7,500：</strong>主层洗衣房与厨柜成套。</li>
<li><strong>石英台面（4–6英尺）——$600–$1,400：</strong>前置滚筒上方的折衣台。白色或灰色Caesarstone最常见。</li>
<li><strong>实木台面（橡木、枫木）——$300–$800：</strong>更温暖，需要每年上油。</li>
<li><strong>洗衣槽（单盆不锈钢16–22寸）——配件$200–$700，龙头另$150–$500：</strong>手洗+宠物洗澡刚需。</li>
</ul>

<h3>6. 地板（$800 – $3,500）</h3>
<p>洗衣房地板要扛水患。我们按档配：</p>
<ul>
<li><strong>整张乙烯/LVT——安装$4–$8/平方英尺：</strong>最便宜的防水方案。换起来方便。</li>
<li><strong>瓷质砖——安装$9–$15/平方英尺：</strong>长期最优。扛漏水、室内外风格能与玄关呼应。</li>
<li><strong>地暖瓷砖（电热垫）——加$7–$12/平方英尺：</strong>地下室洗衣房（地板压在混凝土上）特别常见。</li>
</ul>

<h2>三种方案细节</h2>

<h3>方案1：原壁橱堆叠机更换（$1,800–$3,500）</h3>
<p>家电留在同一壁橱，等量替换。温哥华公寓最常见。范围：</p>
<ul>
<li>断开旧机回收（Encorp回收费$200）</li>
<li>旧嵌墙水盒锈蚀就换新（$300水管人工+$80水盒）</li>
<li>旧3线干衣机线换新4线（线$30+15分钟人工）</li>
<li>接进水管，全压试漏</li>
<li>重接干衣机排气（如果旧管是塑料软管——违规——换刚性金属管）</li>
<li>找平+平衡洗衣机滚筒</li>
</ul>
<p>Reno Stars真实案例：<strong>列治文公寓LG堆叠机更换</strong>——业主自购LG WashTower $2,100，我方人工$850（4小时水电+排气），1天完工。</p>

<h3>方案2：洗衣壁橱翻新（$4,500–$8,500）</h3>
<p>同位置但加上柜体、前置滚筒上方石英台面、新地板、新油漆、合规水电预埋。范围：</p>
<ul>
<li>拆旧家电+批墙</li>
<li>镀锌进水换PEX、装规范的2寸陷管+立管</li>
<li>不是4线就升级240V干衣机插座</li>
<li>家电下铺乙烯地板或LVT</li>
<li>装30寸深上柜（或3层开放搁板）</li>
<li>石英余料（4英尺×24寸深）放在并排上方或堆叠机上方</li>
<li>外墙刚性金属排气管</li>
<li>重新油漆、装新踢脚、壁橱口装新折叠门或谷仓门</li>
</ul>
<p>真实案例：<strong>高贵林联排走廊壁橱</strong>，中端三星并排$2,200，白色IKEA SEKTION $1,400，石英余料$550，LVT $300，人工$3,800=合计$8,250。4天。</p>

<h3>方案3：独立洗衣间（$9,000–$18,000）</h3>
<p>从地下室设备间、玄关或楼梯下空间搭建真正的洗衣房。范围：</p>
<ul>
<li>加框墙（敞开设备间转封闭间）</li>
<li>水管预埋：冷热进水、2寸立管+陷管、洗衣槽下水T口</li>
<li>电工：240V/30A干衣机专用、20A洗衣机、GFCI插座、照明+排气扇电路</li>
<li>保温（外墙至少R-12；与卧室共墙加隔音棉）</li>
<li>批墙+刮腻子+油漆</li>
<li>瓷质砖地板可选地暖电热垫</li>
<li>定制柜（8–12线英尺）+石英台面</li>
<li>不锈钢洗衣槽+单把龙头</li>
<li>挂晾衣物开放搁板+熨衣板隐藏槽</li>
<li>并排或全尺寸堆叠机</li>
</ul>
<p>真实案例：<strong>温哥华东区地下室翻新</strong>，独立洗衣房带洗衣槽+12英尺柜体+地暖瓷砖+并排LG。合计$14,800、3周完工。是更大地下室套房项目的一部分，详见<a href="/zh/blog/basement-renovation-vancouver-complete-guide/">温哥华地下室装修完全指南</a>。</p>

<h2>温哥华业主超支的地方</h2>
<ol>
<li><strong>27寸装得下还买高端24寸。</strong>Bosch和Miele 24寸成对$4,000+，只为塞进窄壁橱。如果壁橱内宽28寸+，$1,800的LG 27寸成对容量更大、价格不到一半。报紧凑型前请量两遍。</li>
<li><strong>电干衣机够用却选燃气。</strong>地下室洗衣房新拉燃气管$1,500–$3,500、还需许可证。电干衣机加热慢一点点，但房子既有线就不再花钱。热泵电干衣机长期能耗甚至比燃气更低。</li>
<li><strong>跳过嵌墙洗衣机水盒。</strong>$80的墙内水盒（带防水锤、球阀、单杆截止阀）防住90%洗衣漏水。装修阶段加$300人工 vs 软管爆裂后$4,000–$15,000水患修复。</li>
<li><strong>明明能侧墙排气却走屋顶。</strong>屋顶排气贵$800–$1,500、棉绒沉积点更多。侧墙排气便宜、好清、规范允许。除非7.6米内没外墙路径，不要走屋顶。</li>
<li><strong>共墙忘了隔音。</strong>洗衣机脱水1米外75分贝+。如果洗衣房与卧室共墙，加框时$400隔音棉+弹性条决定"每个程序都听得到"和"没意识到你洗了"两种生活质量。地下室套房刚需。</li>
</ol>

<h2>近期温哥华项目真实费用（Reno Stars数据）</h2>
<ul>
<li><strong>列治文公寓堆叠机更换：</strong>安装$2,950（业主自购LG WashTower $2,100、4小时人工$850）。原壁橱无水电改动。<a href="/zh/blog/condo-vs-house-renovation-cost-vancouver/">公寓装修上下文</a>。</li>
<li><strong>高贵林联排走廊壁橱翻新：</strong>$8,250（三星成对$2,200、IKEA SEKTION $1,400、石英余料$550、LVT $300、人工$3,800）。4天。</li>
<li><strong>本拿比整屋翻新含地下室洗衣搭建：</strong>$30K–$35K总预算中$11,400用在洗衣（定制厨柜木纹基础上）。含新2寸立管、240V回路、IKEA柜、乙烯地板、并排LG。</li>
<li><strong>温哥华东区地下室套房独立洗衣间含洗衣槽：</strong>$14,800（定制柜$4,500、地暖瓷砖$2,200、水管预埋$2,800、电工$1,800、并排家电$2,400、批墙油漆$1,100）。3周。地下室套房项目的一部分，详见<a href="/zh/blog/basement-suite-renovation-cost-vancouver/">温哥华地下室套房装修费用</a>。</li>
<li><strong>西温玄关+洗衣组合搭建：</strong>$19,500（定制木工长凳+储物柜+洗衣柜$9,500、瓷砖$1,800、水管$2,400、电工$1,200、油漆+收尾$1,400、家电$3,200）。5周。</li>
</ul>

<h2>许可证与楼管会规则</h2>

<h3>温哥华市/素里/本拿比许可证</h3>
<p>等量家电更换不需要许可证。下列工程需要建筑许可证：</p>
<ul>
<li>从无到有新增洗衣（下水+进水预埋）</li>
<li>洗衣搬到不同房间</li>
<li>加洗衣槽（下水+进水）</li>
<li>新增240V或30A回路（电工许可证，与建筑许可证分开）</li>
<li>外墙开新干衣机排气孔</li>
</ul>
<p>大温洗衣搭建许可证费用$250–$700。持牌承包商负责申办，时间已含在报价里。</p>

<h3>公寓楼管会规则</h3>
<p>大部分温哥华公寓楼管对洗衣有专门规定：</p>
<ul>
<li>未经楼管批准不准换家电（部分完全禁止洗衣机/干衣机移位）</li>
<li>水管工程需提前48小时通知大楼经理</li>
<li>洗衣机下方强制接漏水盘（不装=单元业主无限赔偿责任）</li>
<li>静音时段常限制洗衣（典型10 PM – 7 AM）</li>
<li>立管清洗每5–10年一次；部分大楼向单元业主收费</li>
</ul>
<p>签订涉及洗衣水管的装修合同前，务必拿到楼管细则+Form B。</p>

<h2>工期预期</h2>
<ul>
<li><strong>堆叠机更换：</strong>现场1天，家电下单1–2天交期</li>
<li><strong>壁橱翻新含新柜体：</strong>现场3–5天，整体项目2–3周（柜体下单+预埋+收尾）</li>
<li><strong>堆叠机改并排扩宽：</strong>现场1–2周（加框），整体4–6周</li>
<li><strong>独立洗衣间搭建：</strong>现场2–4周，整体6–10周（许可证+柜体+瓷砖+收尾）</li>
<li><strong>洗衣+玄关组合：</strong>现场3–5周，整体8–12周</li>
</ul>

<h2>常见问题</h2>

<h3>温哥华公寓壁橱原本没有水电接口能装洗衣机吗？</h3>
<p>有时可以。条件：3–4米内有水管墙、楼管会批准。费用：水管预埋$2,500–$6,000+家电本身。无排气热泵干衣机解决混凝土楼板公寓的排气问题。楼管会批准是关键——先看Form B和细则。</p>

<h3>堆叠机还是并排？</h3>
<p>堆叠机省地面宽度（27寸 vs 并排54寸）。并排装卸方便、上方有台面、价格比同等堆叠机便宜约$200。如果墙宽54寸+且需要折衣台面，选并排。如果空间紧或是走廊壁橱，选堆叠机。</p>

<h3>热泵干衣机加价值得吗？</h3>
<p>没有简易排气的公寓和地下室洗衣房：值得。怕火灾的应用：值得。热泵干衣机温度低、能耗低50%、不需外排气管。代价：60–90分钟程序 vs 排气式30–45分钟，单价高$800–$1,500。BC Hydro有时有$200–$400补贴。</p>

<h3>洗衣翻新阶段加洗衣槽多少钱？</h3>
<p>典型$900–$2,500：水槽$200–$700、龙头$150–$500、水管人工$700–$1,800（下水T口+冷热预埋+连接）。装修开墙阶段加便宜。封墙后再加既难又贵（$3K+）。</p>

<h3>干衣机能与厨房油烟机或浴室排气共管吗？</h3>
<p>不能。BC建筑规范要求干衣机专用排气管。共管会让风扇管沉积棉绒、产生火险。施工阶段务必预埋独立干衣机排气路径。</p>

<h3>洗衣房地暖瓷砖值得吗？</h3>
<p>地下室洗衣（地板压混凝土）：值得——加$700–$1,500、四季舒适度大幅提升。主层木结构洗衣房：通常不值——地板本来就接近室温。地暖电热垫由温控器控制，能耗约等于一只60W灯泡常亮，运行成本极低。</p>

<h3>翻新过的洗衣房能用多久？</h3>
<p>家电：排气干衣机10–15年、堆叠机8–12年、紧凑型欧机12–18年。柜体、台面、瓷砖地板：选材合理20–30年。预埋水电：按现行规范+PEX供水管，可终身使用。</p>

<h2>洗衣房预算规划</h2>
<ol>
<li><strong>先选方案档（壁橱更换/壁橱翻新/独立间/组合）。</strong>每档下游人工预算差异巨大。</li>
<li><strong>先确认电箱有断路器位再下单高端家电。</strong>电箱满=$2,000+分电箱工程，才能接30A干衣机。</li>
<li><strong>量壁橱内尺寸不是门口。</strong>27寸堆叠机需内宽至少28寸；24寸紧凑型需25寸+。堆叠机后方还需2寸深给水管。</li>
<li><strong>下单干衣机前规划好排气路径。</strong>无排气热泵解决无解的排气问题，但家电加价$1,200–$2,500。</li>
<li><strong>预留$500–$1,000水管应急款。</strong>1990年前温哥华老房子拆旧后常出旧镀锌进水管、不达标陷管、烂立管。</li>
</ol>

<h2>相关费用指南</h2>
<ul>
<li><a href="/zh/guides/basement-renovation-cost-vancouver/">温哥华地下室装修费用</a> — 大部分洗衣房在地下室；这是母指南</li>
<li><a href="/zh/blog/basement-suite-renovation-cost-vancouver/">温哥华地下室套房装修费用</a> — 洗衣预埋是套房合法化的核心</li>
<li><a href="/zh/blog/condo-vs-house-renovation-cost-vancouver/">温哥华公寓 vs 独立屋装修费用</a> — 不同住宅类型的洗衣约束</li>
<li><a href="/zh/blog/renovation-permits-bc-guide/">BC装修许可证指南</a> — 洗衣工程何时需许可证</li>
<li><a href="/zh/services/basement/">地下室装修服务</a> — 我们的工作内容和流程</li>
</ul>

<p>想要洗衣房真实报价？把现状照片和您在考虑的方案发给我们，48小时内给您三档分价方案。<a href="/zh/contact/">免费上门咨询</a>。</p>
</article>`;

const contentZhHant = `<article>
<h1>溫哥華洗衣房裝修費用 2026：壁櫥、獨立間、上下疊三種方案</h1>

<p class="lead">洗衣房通常是溫哥華裝修專案裡預算最少的，卻最容易跳出超支驚喜。一個簡單的上下疊更換，可能因為排水陷管尺寸不過驗收，演變成$5,000的水路改造。以下是溫哥華2026年洗衣房裝修真實費用，按方案分層，基於Reno Stars近期專案數據。</p>

<h2>價格速查表</h2>
<table>
<thead><tr><th>方案</th><th>溫哥華完工價</th><th>工期</th><th>適合</th></tr></thead>
<tbody>
<tr><td>原壁櫥內上下疊更換</td><td>$1,800 – $3,500</td><td>1–2天</td><td>公寓、聯排、出租屋——同位置等量升級</td></tr>
<tr><td>洗衣壁櫥翻新（櫃體+檯面+排氣整改）</td><td>$4,500 – $8,500</td><td>3–5天</td><td>走廊／玄關壁櫥要俐落外觀+收納</td></tr>
<tr><td>上下疊改並排（壁櫥拓寬）</td><td>$6,000 – $11,000</td><td>1–2週</td><td>從上下疊改並排——加框、批牆、新地板</td></tr>
<tr><td>獨立洗衣間（地下室／主層）</td><td>$9,000 – $18,000</td><td>2–4週</td><td>整屋翻新、地下室套房、要水槽+折衣台的家庭</td></tr>
<tr><td>洗衣+玄關複合搭建</td><td>$12,000 – $24,000+</td><td>3–5週</td><td>獨立屋加長椅、置物櫃、寵物洗澡台、整面收納牆</td></tr>
</tbody>
</table>
<p><em>價格為完工價，含家電（或業主自備家電時的安裝人工）、進水管、6呎以內排氣管、規範要求的GFCI插座、舊機回收。許可證、改下水主管或排氣主管、瓦斯乾衣機的瓦斯管工程、公寓管理委員會要求的隔音另計。</em></p>

<h2>價格驅動因素</h2>

<h3>1. 家電本身（$1,200 – $7,000）</h3>
<p>選機決定整體下限。我們最常裝的：</p>
<ul>
<li><strong>中階上下疊（LG、三星、GE）——成對$1,400–$2,400：</strong>27吋寬，有／無排氣，公寓和走廊壁櫥的預設選擇。</li>
<li><strong>緊湊型24吋上下疊（Bosch、Miele、Asko）——成對$2,800–$5,500：</strong>27吋裝不下時必選（公寓窄壁櫥、走廊凹龕寬度小於28吋）。無排氣熱泵乾衣機省去排氣麻煩。</li>
<li><strong>全尺寸並排（LG WashTower、三星FlexWash）——成對$2,200–$3,800：</strong>每台27吋，需要54吋以上地面寬度。容量大、好上下取衣、上方還有檯面空間。</li>
<li><strong>無排氣熱泵乾衣機（單台$2,800–$5,000）：</strong>不必穿牆排氣——對公寓和地下室洗衣房是救星。乾衣較慢（約90分鐘 vs 45分鐘），但消除住宅最大的火災隱患。</li>
<li><strong>洗烘一體機（LG WashCombo）——$3,200–$4,500：</strong>一台機洗+烘不必倒衣。代價：乾衣容量是分體的一半。</li>
</ul>

<h3>2. 水管工程（$600 – $4,500）</h3>
<p>溫哥華洗衣專案幾乎每次都會跳出至少一個水管驚喜：</p>
<ul>
<li><strong>冷熱進水管更換（嵌牆洗衣機水盒）：</strong>$400–$800（25年舊角閥換合規球閥；嵌牆水盒裝在洗衣機後方）</li>
<li><strong>排水陷管更換／重新坡度：</strong>$600–$1,500（1990年以前的房子洗衣陷管常是1.5吋不達標；現規範是2吋+18吋高的2吋立管）</li>
<li><strong>立管位移（同一面牆換位置）：</strong>$800–$1,800</li>
<li><strong>下水改道（洗衣搬到新房間）：</strong>$2,000–$4,500，視樓板可達性、是否需切混凝土、排氣主管位置而定</li>
<li><strong>加洗衣槽（新增下水T接口+冷熱水）：</strong>水管$700–$1,800，水槽+龍頭另$200–$1,200</li>
</ul>

<h3>3. 排氣（$300 – $2,500）</h3>
<p>排氣是大多數DIY洗衣安裝失敗之處。BC建築規範2024要求：</p>
<ul>
<li>必須剛性金屬管（不准塑膠軟管）——例外只有乾衣機後方8呎UL認證軟管</li>
<li>總長不超過7.6米（25呎），每個90度彎扣減1.5米（5呎）</li>
<li>外端罩子帶活門，外罩不准加防蟲網</li>
<li>向下傾斜排出（不能有積液彎）</li>
</ul>
<p>費用：</p>
<ul>
<li><strong>等量重接（舊管保留）：</strong>$150–$300</li>
<li><strong>外牆短距離穿管（小於8呎無障礙）：</strong>$400–$900</li>
<li><strong>穿吊頂／樓板長距離含2個以上彎頭：</strong>$900–$2,000</li>
<li><strong>屋頂排氣（3層以上+聯排）：</strong>$1,500–$2,500+屋頂防水</li>
<li><strong>改用無排氣熱泵（徹底取消排氣工程）：</strong>家電加價$1,200–$2,500，但省全部排氣人工，杜絕棉絮起火</li>
</ul>

<h3>4. 電工（$300 – $2,200）</h3>
<p>2010年前的溫哥華房子洗衣房電氣驗收常常不過：</p>
<ul>
<li><strong>電乾衣機專用240V/30A迴路：</strong>$600–$1,500（無現成240V接口）；$300–$600（舊3線換合規4線插座）</li>
<li><strong>洗衣機專用120V/15A或20A：</strong>$400–$900（需新拉線）</li>
<li><strong>洗衣槽1米內GFCI插座：</strong>規範要求；$200–$400加裝</li>
<li><strong>照明+排氣扇電路：</strong>$400–$800（從無到有）</li>
<li><strong>需要分電箱（舊100A電箱斷路器位已滿）：</strong>$1,800–$3,500（電箱滿請另行預算）</li>
</ul>

<h3>5. 櫃體、檯面、水槽（$1,800 – $7,500）</h3>
<p>"像真正洗衣房"的升級。業主花錢或省錢的地方：</p>
<ul>
<li><strong>IKEA SEKTION或Home Depot標準櫃——6–8線呎$800–$2,200：</strong>性價比最高。白色或橡木Shaker門、緩衝鉸鏈、放洗劑+布巾。</li>
<li><strong>客製美耐板+貼皮門——$1,800–$4,500：</strong>本地溫哥華工廠（Kelowna Wood、Fraser Valley Cabinets）按窄壁櫥精準製作。</li>
<li><strong>實木Shaker客製——$3,500–$7,500：</strong>主層洗衣房與廚櫃成套。</li>
<li><strong>石英檯面（4–6呎）——$600–$1,400：</strong>滾筒上方的折衣檯面。白色或灰色Caesarstone最常見。</li>
<li><strong>實木檯面（橡木、楓木）——$300–$800：</strong>更溫暖，需每年上油。</li>
<li><strong>洗衣槽（單盆不鏽鋼16–22吋）——配件$200–$700，龍頭另$150–$500：</strong>手洗+寵物洗澡剛需。</li>
</ul>

<h3>6. 地板（$800 – $3,500）</h3>
<p>洗衣房地板要扛水患。我們依等級配：</p>
<ul>
<li><strong>整張塑膠／LVT——安裝$4–$8/平方呎：</strong>最便宜的防水方案。換起來方便。</li>
<li><strong>瓷質磚——安裝$9–$15/平方呎：</strong>長期最佳。耐漏水、室內外風格能與玄關呼應。</li>
<li><strong>地暖瓷磚（電熱墊）——加$7–$12/平方呎：</strong>地下室洗衣房（地板貼混凝土）特別常見。</li>
</ul>

<h2>三種方案細節</h2>

<h3>方案1：原壁櫥上下疊更換（$1,800–$3,500）</h3>
<p>家電留在同一壁櫥、等量替換。溫哥華公寓最常見。範圍：</p>
<ul>
<li>斷開舊機並回收（Encorp回收費$200）</li>
<li>舊嵌牆水盒鏽蝕就換新（$300水管人工+$80水盒）</li>
<li>舊3線乾衣機線換新4線（線$30+15分鐘人工）</li>
<li>接進水管、滿壓試漏</li>
<li>重接乾衣機排氣（如果舊管是塑膠軟管——違規——換剛性金屬管）</li>
<li>校水平+平衡洗衣機滾筒</li>
</ul>
<p>Reno Stars真實案例：<strong>列治文公寓LG上下疊更換</strong>——業主自購LG WashTower $2,100、我方人工$850（4小時水電+排氣），1天完工。</p>

<h3>方案2：洗衣壁櫥翻新（$4,500–$8,500）</h3>
<p>同位置但加上櫃體、滾筒上方石英檯面、新地板、新油漆、合規水電預埋。範圍：</p>
<ul>
<li>拆舊家電+批牆</li>
<li>鍍鋅進水改PEX、裝合規2吋陷管+立管</li>
<li>不是4線就升級240V乾衣機插座</li>
<li>家電下方鋪塑膠地板或LVT</li>
<li>裝30吋深上櫃（或3層開放層板）</li>
<li>石英餘料（4呎×24吋深）放在並排上方或上下疊上方</li>
<li>外牆剛性金屬排氣管</li>
<li>重新油漆、裝新踢腳、壁櫥口裝新折門或穀倉門</li>
</ul>
<p>真實案例：<strong>高貴林聯排走廊壁櫥</strong>，中階三星並排$2,200、白色IKEA SEKTION $1,400、石英餘料$550、LVT $300、人工$3,800=合計$8,250。4天。</p>

<h3>方案3：獨立洗衣間（$9,000–$18,000）</h3>
<p>從地下室機房、玄關或樓梯下空間搭建真正的洗衣房。範圍：</p>
<ul>
<li>加框牆（敞開機房改封閉間）</li>
<li>水管預埋：冷熱進水、2吋立管+陷管、洗衣槽下水T接口</li>
<li>電工：240V/30A乾衣機專用、20A洗衣機、GFCI插座、照明+排氣扇電路</li>
<li>保溫（外牆至少R-12；與臥室共牆加隔音棉）</li>
<li>批牆+刮膩子+油漆</li>
<li>瓷質磚地板可選地暖電熱墊</li>
<li>客製櫃（8–12線呎）+石英檯面</li>
<li>不鏽鋼洗衣槽+單把龍頭</li>
<li>掛晾衣物開放層板+燙衣板隱藏槽</li>
<li>並排或全尺寸上下疊家電</li>
</ul>
<p>真實案例：<strong>溫哥華東區地下室翻新</strong>，獨立洗衣房附洗衣槽+12呎櫃體+地暖瓷磚+並排LG。合計$14,800、3週完工。屬更大地下室套房專案的一部分，詳見<a href="/zh-Hant/blog/basement-renovation-vancouver-complete-guide/">溫哥華地下室裝修完整指南</a>。</p>

<h2>溫哥華業主超支的地方</h2>
<ol>
<li><strong>27吋裝得下還買高階24吋。</strong>Bosch和Miele 24吋成對$4,000+，只為塞進窄壁櫥。如果壁櫥內寬28吋以上，$1,800的LG 27吋成對容量更大、價格不到一半。下單緊湊型前請量兩遍。</li>
<li><strong>電乾衣機夠用卻選瓦斯。</strong>地下室洗衣房新拉瓦斯管$1,500–$3,500、還需許可證。電乾衣機加熱稍慢，但既有線就不必額外花錢。熱泵電乾衣機長期能耗甚至比瓦斯更低。</li>
<li><strong>跳過嵌牆洗衣機水盒。</strong>$80的牆內水盒（含防水鎚、球閥、單桿截止閥）防住90%洗衣漏水。裝修階段加$300人工 vs 軟管爆裂後$4,000–$15,000水患修復。</li>
<li><strong>明明能側牆排氣卻走屋頂。</strong>屋頂排氣多$800–$1,500、棉絮積點更多。側牆排氣便宜、好清、規範允許。除非7.6米內無外牆路徑，不要走屋頂。</li>
<li><strong>共牆忘了隔音。</strong>洗衣機脫水1米外75分貝以上。如果洗衣房與臥室共牆，加框時$400隔音棉+彈性條決定"每個程序都聽到"和"不知道你洗了"兩種生活品質。地下室套房剛需。</li>
</ol>

<h2>近期溫哥華專案真實費用（Reno Stars數據）</h2>
<ul>
<li><strong>列治文公寓上下疊更換：</strong>完工$2,950（業主自購LG WashTower $2,100、4小時人工$850）。原壁櫥無水電改動。<a href="/zh-Hant/blog/condo-vs-house-renovation-cost-vancouver/">公寓裝修脈絡</a>。</li>
<li><strong>高貴林聯排走廊壁櫥翻新：</strong>$8,250（三星成對$2,200、IKEA SEKTION $1,400、石英餘料$550、LVT $300、人工$3,800）。4天。</li>
<li><strong>本拿比整屋翻新含地下室洗衣搭建：</strong>$30K–$35K總預算中$11,400用在洗衣（客製廚櫃木紋基礎上）。含新2吋立管、240V迴路、IKEA櫃、塑膠地板、並排LG。</li>
<li><strong>溫哥華東區地下室套房獨立洗衣間含洗衣槽：</strong>$14,800（客製櫃$4,500、地暖瓷磚$2,200、水管預埋$2,800、電工$1,800、並排家電$2,400、批牆油漆$1,100）。3週。地下室套房專案的一部分，詳見<a href="/zh-Hant/blog/basement-suite-renovation-cost-vancouver/">溫哥華地下室套房裝修費用</a>。</li>
<li><strong>西溫玄關+洗衣複合搭建：</strong>$19,500（客製木工長椅+置物櫃+洗衣櫃$9,500、瓷磚$1,800、水管$2,400、電工$1,200、油漆+收尾$1,400、家電$3,200）。5週。</li>
</ul>

<h2>許可證與管理委員會規則</h2>

<h3>溫哥華市／素里／本拿比許可證</h3>
<p>等量家電更換不需要許可證。下列工程需要建築許可證：</p>
<ul>
<li>從無到有新增洗衣（下水+進水預埋）</li>
<li>洗衣搬到不同房間</li>
<li>加洗衣槽（下水+進水）</li>
<li>新增240V或30A迴路（電工許可證，與建築許可證分開）</li>
<li>外牆開新乾衣機排氣孔</li>
</ul>
<p>大溫洗衣搭建許可證費用$250–$700。持牌承包商負責申辦，時間已含在報價裡。</p>

<h3>公寓管理委員會規則</h3>
<p>大部分溫哥華公寓管委會對洗衣有專門規定：</p>
<ul>
<li>未經管委會批准不准換家電（部分完全禁止洗衣機／乾衣機移位）</li>
<li>水管工程需提前48小時通知大樓經理</li>
<li>洗衣機下方強制接漏水盤（不裝＝單元業主無限賠償責任）</li>
<li>靜音時段常限制洗衣（典型10 PM – 7 AM）</li>
<li>立管清洗每5–10年一次；部分大樓向單元業主收費</li>
</ul>
<p>簽訂涉及洗衣水管的裝修合約前，務必拿到管委會細則+Form B。</p>

<h2>工期預期</h2>
<ul>
<li><strong>上下疊更換：</strong>現場1天，家電下單1–2天交期</li>
<li><strong>壁櫥翻新含新櫃體：</strong>現場3–5天，整體專案2–3週（櫃體下單+預埋+收尾）</li>
<li><strong>上下疊改並排拓寬：</strong>現場1–2週（加框），整體4–6週</li>
<li><strong>獨立洗衣間搭建：</strong>現場2–4週，整體6–10週（許可證+櫃體+瓷磚+收尾）</li>
<li><strong>洗衣+玄關複合：</strong>現場3–5週，整體8–12週</li>
</ul>

<h2>常見問題</h2>

<h3>溫哥華公寓壁櫥原本沒有水電接口能裝洗衣機嗎？</h3>
<p>有時可以。條件：3–4米內有水管牆、管委會批准。費用：水管預埋$2,500–$6,000+家電本身。無排氣熱泵乾衣機解決混凝土樓板公寓的排氣問題。管委會批准是關鍵——先看Form B和細則。</p>

<h3>上下疊還是並排？</h3>
<p>上下疊省地面寬度（27吋 vs 並排54吋）。並排上下取衣方便、上方有檯面、價格比同等上下疊便宜約$200。如果牆寬54吋以上且需要折衣檯面，選並排。如果空間緊或是走廊壁櫥，選上下疊。</p>

<h3>熱泵乾衣機加價值得嗎？</h3>
<p>沒有簡易排氣的公寓和地下室洗衣房：值得。怕火災的應用：值得。熱泵乾衣機溫度低、能耗低50%、不需外排氣管。代價：60–90分鐘程序 vs 排氣式30–45分鐘，單價高$800–$1,500。BC Hydro有時有$200–$400補貼。</p>

<h3>洗衣翻新階段加洗衣槽多少錢？</h3>
<p>典型$900–$2,500：水槽$200–$700、龍頭$150–$500、水管人工$700–$1,800（下水T接口+冷熱預埋+連接）。裝修開牆階段加便宜。封牆後再加既難又貴（$3K以上）。</p>

<h3>乾衣機能與廚房抽油煙機或浴室排氣共管嗎？</h3>
<p>不能。BC建築規範要求乾衣機專用排氣管。共管會讓風扇管沉積棉絮、產生火險。施工階段務必預埋獨立乾衣機排氣路徑。</p>

<h3>洗衣房地暖瓷磚值得嗎？</h3>
<p>地下室洗衣（地板貼混凝土）：值得——加$700–$1,500、四季舒適度大幅提升。主層木結構洗衣房：通常不值——地板本就接近室溫。地暖電熱墊由溫控器控制，能耗約等於一支60W燈泡常亮，運行成本極低。</p>

<h3>翻新過的洗衣房能用多久？</h3>
<p>家電：排氣乾衣機10–15年、上下疊8–12年、緊湊歐機12–18年。櫃體、檯面、瓷磚地板：選材合理20–30年。預埋水電：按現行規範+PEX進水管，可終身使用。</p>

<h2>洗衣房預算規劃</h2>
<ol>
<li><strong>先選方案等級（壁櫥更換／壁櫥翻新／獨立間／複合）。</strong>每階下游人工預算差異巨大。</li>
<li><strong>先確認電箱有斷路器位再下單高階家電。</strong>電箱滿＝$2,000+分電箱工程，才能接30A乾衣機。</li>
<li><strong>量壁櫥內尺寸不是門口。</strong>27吋上下疊需內寬至少28吋；24吋緊湊型需25吋以上。上下疊後方還需2吋深給水管。</li>
<li><strong>下單乾衣機前規劃好排氣路徑。</strong>無排氣熱泵解決無解的排氣問題，但家電加價$1,200–$2,500。</li>
<li><strong>預留$500–$1,000水管應急款。</strong>1990年前溫哥華老房子拆舊後常出舊鍍鋅進水管、不達標陷管、爛立管。</li>
</ol>

<h2>相關費用指南</h2>
<ul>
<li><a href="/zh-Hant/guides/basement-renovation-cost-vancouver/">溫哥華地下室裝修費用</a> — 多數洗衣房在地下室；這是母指南</li>
<li><a href="/zh-Hant/blog/basement-suite-renovation-cost-vancouver/">溫哥華地下室套房裝修費用</a> — 洗衣預埋是套房合法化的核心</li>
<li><a href="/zh-Hant/blog/condo-vs-house-renovation-cost-vancouver/">溫哥華公寓 vs 獨立屋裝修費用</a> — 不同住宅類型的洗衣限制</li>
<li><a href="/zh-Hant/blog/renovation-permits-bc-guide/">BC裝修許可證指南</a> — 洗衣工程何時需許可證</li>
<li><a href="/zh-Hant/services/basement/">地下室裝修服務</a> — 我們的工作內容與流程</li>
</ul>

<p>想要洗衣房的真實報價？把現況照片和您正在考慮的方案傳給我們，48小時內提供三段式分價方案。<a href="/zh-Hant/contact/">免費到府諮詢</a>。</p>
</article>`;

const contentJa = `<article>
<h1>バンクーバー ランドリールーム改装費用 2026：クローゼット型・専用ルーム・スタック型の3パターン</h1>

<p class="lead">ランドリールームはバンクーバーの改装プロジェクトでもっとも予算が削られる場所ですが、もっとも高額な"想定外"が出てくる場所でもあります。簡単なスタック型の入れ替えが、排水トラップの規格不適合で$5,000の配管工事に化けることも珍しくありません。本記事では、メトロバンクーバーにおける2026年のランドリールーム改装費用を、Reno Starsの最近の実プロジェクトデータをもとにパターン別に解説します。</p>

<h2>料金早見表</h2>
<table>
<thead><tr><th>パターン</th><th>バンクーバー設置価格</th><th>工期</th><th>適した用途</th></tr></thead>
<tbody>
<tr><td>既存クローゼット内のスタック型交換</td><td>$1,800 – $3,500</td><td>1–2日</td><td>コンドミニアム、タウンハウス、賃貸——同位置で同等品にアップグレード</td></tr>
<tr><td>クローゼット型ランドリーのリフレッシュ（キャビネット+トップ+排気是正）</td><td>$4,500 – $8,500</td><td>3–5日</td><td>廊下／玄関のクローゼット — すっきりした見た目+収納が欲しい場合</td></tr>
<tr><td>サイドバイサイド化（クローゼット拡張）</td><td>$6,000 – $11,000</td><td>1–2週</td><td>スタック型から横並びに変更——枠組変更、ボード、新床材</td></tr>
<tr><td>専用ランドリールーム（地下／メインフロア）</td><td>$9,000 – $18,000</td><td>2–4週</td><td>全戸改装、地下スイート、シンク+折りたたみ台が欲しい家庭</td></tr>
<tr><td>ランドリー+マッドルーム複合</td><td>$12,000 – $24,000+</td><td>3–5週</td><td>戸建てにベンチ・ロッカー・ペット洗い場・収納壁を追加</td></tr>
</tbody>
</table>
<p><em>価格は設置済みベースで、家電本体（または施主支給時の取付人工）、給水ライン、6フィート以内の排気ダクト、規格上必要なGFCI、旧機回収を含みます。許可申請、構造変更（排水・通気管の移設）、ガス乾燥機のガス配管、コンドミニアム管理組合が要求する遮音工事は別途見積もりです。</em></p>

<h2>価格を左右する6つの要素</h2>

<h3>1. 家電本体（$1,200 – $7,000）</h3>
<p>選んだ家電がプロジェクト全体の下限を決めます。施工頻度が高いモデル：</p>
<ul>
<li><strong>ミドルレンジのスタック型（LG・Samsung・GE）——ペアで$1,400–$2,400：</strong>27インチ幅。コンドミニアムや廊下クローゼットの定番。</li>
<li><strong>コンパクト24インチスタック型（Bosch・Miele・Asko）——ペアで$2,800–$5,500：</strong>27インチが物理的に入らない場合に必須（28インチ未満のクローゼット）。ヒートポンプ型なら排気不要。</li>
<li><strong>フルサイズ サイドバイサイド（LG WashTower・Samsung FlexWash）——ペアで$2,200–$3,800：</strong>各27インチ、設置幅54インチ以上必要。容量大、出し入れしやすく、上にカウンターを取れます。</li>
<li><strong>ヒートポンプ型ノンベント乾燥機（単体$2,800–$5,000）：</strong>外排気不要——コンドミニアムや地下ランドリーで決定打。乾燥時間は90分前後と長め（通常45分）ですが、火災リスクをほぼ消せます。</li>
<li><strong>洗濯乾燥一体機（LG WashCombo）——$3,200–$4,500：</strong>移し替え不要。ただし乾燥容量は分離型の半分程度。</li>
</ul>

<h3>2. 配管工事（$600 – $4,500）</h3>
<p>バンクーバーのランドリー工事はほぼ必ず想定外の配管トラブルが出ます：</p>
<ul>
<li><strong>給水ライン更新（埋込み式洗濯機ボックス）：</strong>$400–$800（25年経過のサドルバルブを規格適合のボールバルブに交換、洗濯機背面に正しいリセスボックス設置）</li>
<li><strong>トラップアームの交換／勾配修正：</strong>$600–$1,500（1990年以前の住宅は1.5インチの旧規格トラップが多い、現規格は2インチ＋18インチ以上の立ち上げ）</li>
<li><strong>立管移設（同壁内）：</strong>$800–$1,800</li>
<li><strong>排水経路の引き直し（別室への移設）：</strong>$2,000–$4,500（梁のアクセス、スラブカット、通気管位置による）</li>
<li><strong>ユーティリティシンク追加（排水T+給水）：</strong>配管$700–$1,800、シンク+蛇口で別途$200–$1,200</li>
</ul>

<h3>3. 排気（$300 – $2,500）</h3>
<p>DIYのランドリー工事が最もつまずく箇所。BCビルディングコード2024の要点：</p>
<ul>
<li>金属硬質ダクトのみ（プラフレキ不可）。例外：乾燥機背面のUL認証フレキ最大8フィート</li>
<li>合計長さ7.6m（25フィート）以下、90度エルボ1個につき1.5m（5フィート）短縮</li>
<li>外側終端はダンパー付きフード、虫よけメッシュ不可</li>
<li>外側に向けて下り勾配（リント結露が溜まらないよう）</li>
</ul>
<p>費用：</p>
<ul>
<li><strong>同等接続（旧ダクト流用）：</strong>$150–$300</li>
<li><strong>外壁貫通の短い経路（8フィート以内、障害物なし）：</strong>$400–$900</li>
<li><strong>天井／梁経由でエルボ2個以上：</strong>$900–$2,000</li>
<li><strong>屋根抜き（3階建て+タウンハウス）：</strong>$1,500–$2,500＋屋根防水</li>
<li><strong>ヒートポンプ式に変更（ダクト工事ゼロ）：</strong>家電のアップチャージ$1,200–$2,500、しかし排気工事人工をすべて節約しリント火災を防止</li>
</ul>

<h3>4. 電気工事（$300 – $2,200）</h3>
<p>2010年以前のバンクーバー住宅はランドリー部分の電気検査でつまずきがちです：</p>
<ul>
<li><strong>電気乾燥機専用 240V/30A 回路：</strong>$600–$1,500（既存240Vなしの場合）／$300–$600（旧3ピンを規格適合の4ピンに更新）</li>
<li><strong>洗濯機専用 120V/15Aまたは20A：</strong>$400–$900（新規ランが必要な場合）</li>
<li><strong>シンクから1m以内のGFCI：</strong>規格要件、$200–$400で追加</li>
<li><strong>照明＋換気扇回路：</strong>$400–$800（新規）</li>
<li><strong>サブパネルが必要（旧100Aパネルが満杯）：</strong>$1,800–$3,500（パネル満杯の場合は別予算で）</li>
</ul>

<h3>5. キャビネット・カウンター・シンク（$1,800 – $7,500）</h3>
<p>"本物のランドリールーム"に見せるアップグレード。コスト増減のポイント：</p>
<ul>
<li><strong>IKEA SEKTIONまたはホームデポ標準キャビネット——6〜8リニアフィートで$800–$2,200：</strong>コスパ最強。白／オークのShakerドア、ソフトクローズ、洗剤+リネン収納。</li>
<li><strong>カスタム化粧合板＋ラミネート扉——$1,800–$4,500：</strong>地元バンクーバーの工房（Kelowna Wood、Fraser Valley Cabinets）が狭いクローゼット寸法に合わせて製作。</li>
<li><strong>無垢材／Shakerカスタム——$3,500–$7,500：</strong>メインフロアでキッチンと統一感を出すならこちら。</li>
<li><strong>クォーツカウンター（4〜6フィート）——$600–$1,400：</strong>フロントローダー上の折りたたみ台。白／グレーのCaesarstoneが定番。</li>
<li><strong>ブッチャーブロック（オーク・メープル）——$300–$800：</strong>温かみのある見た目、年1回のオイル塗布が必要。</li>
<li><strong>ユーティリティシンク（ステンレス単槽16〜22インチ）——本体$200–$700、蛇口$150–$500：</strong>手洗い・ペット洗い場として欠かせない。</li>
</ul>

<h3>6. 床材（$800 – $3,500）</h3>
<p>ランドリーの床は水に強いことが必須。グレード別：</p>
<ul>
<li><strong>シートビニール／LVT——施工単価$4–$8/平方フィート：</strong>最安の防水オプション。張り替えが楽。</li>
<li><strong>磁器タイル——施工単価$9–$15/平方フィート：</strong>長期最適解。漏水耐性、玄関と統一感が出せる。</li>
<li><strong>床暖タイル（電気マット）——$7–$12/平方フィート追加：</strong>地下ランドリー（コンクリート土間）で人気。</li>
</ul>

<h2>3つのパターンを詳しく</h2>

<h3>パターン1：既存クローゼット内のスタック型交換（$1,800–$3,500）</h3>
<p>同じクローゼットで同等品に入れ替え。バンクーバーのコンドミニアム改装で最多パターン。スコープ：</p>
<ul>
<li>旧機を切り離して回収（Encorp処分料$200）</li>
<li>埋込みボックスが腐食していれば新規交換（配管人工$300＋ボックス$80）</li>
<li>3ピンの場合は4ピンコードに更新（コード$30＋15分人工）</li>
<li>給水ライン接続、満圧での漏れテスト</li>
<li>乾燥機排気を再接続（プラフレキの場合は規格違反のため金属硬質に交換）</li>
<li>レベリングと洗濯ドラムバランス調整</li>
</ul>
<p>Reno Stars実例：<strong>リッチモンドのコンドミニアム、LGスタック型交換</strong>——施主支給のLG WashTower $2,100、当社人工$850（4時間：配管・電気・排気）、所要1日。</p>

<h3>パターン2：クローゼット型ランドリーのリフレッシュ（$4,500–$8,500）</h3>
<p>同位置で上部にキャビネット、フロントローダー上にクォーツカウンター、新床、塗装、規格適合の下地工事を追加。スコープ：</p>
<ul>
<li>旧家電と石膏ボードの撤去</li>
<li>亜鉛めっき給水をPEXに更新、規格適合の2インチトラップ＋立管設置</li>
<li>4ピンでなければ240Vコンセント更新</li>
<li>家電下にビニールプランクまたはLVT敷設</li>
<li>奥行30インチの上部キャビネット（または開放棚3段）</li>
<li>クォーツ端材（4フィート×24インチ深さ）をサイドバイサイドまたはスタック上に</li>
<li>外壁貫通の金属硬質ダクトで乾燥機排気を新設</li>
<li>塗装、新巾木、クローゼット開口部に折戸または納屋戸</li>
</ul>
<p>実例：<strong>コキットラムのタウンハウス廊下クローゼット</strong>、ミドルレンジSamsungサイドバイサイド$2,200、白IKEA SEKTION $1,400、クォーツ端材$550、LVT $300、人工$3,800、合計$8,250、4日。</p>

<h3>パターン3：専用ランドリールーム（$9,000–$18,000）</h3>
<p>地下のユーティリティスペース、マッドルーム、または階段下に専用ランドリーを構築。スコープ：</p>
<ul>
<li>枠組（オープンユーティリティを区画化）</li>
<li>配管下地：給水、2インチ立管＋トラップ、ユーティリティシンクの排水T</li>
<li>電気：30A/240V専用乾燥機回路、20A洗濯機、GFCI、照明＋ファン回路</li>
<li>断熱（外壁R-12以上、寝室共有壁には遮音バット）</li>
<li>石膏ボード＋スキムコート＋塗装</li>
<li>磁器タイル床（オプションで床暖マット）</li>
<li>カスタムキャビネット（8〜12リニアフィート）＋クォーツトップ</li>
<li>ステンレスユーティリティシンク＋シングルレバー蛇口</li>
<li>デリケート用ハンガーバー＋アイロン台収納</li>
<li>サイドバイサイドまたはフルサイズスタック家電</li>
</ul>
<p>実例：<strong>バンクーバー東部の地下改装</strong>、ユーティリティシンク+12フィートのキャビネット+床暖磁器タイル+サイドバイサイドLGの専用ランドリー。総額$14,800、3週間。地下スイートプロジェクトの一部、詳細は<a href="/ja/blog/basement-renovation-vancouver-complete-guide/">バンクーバー地下改装完全ガイド</a>。</p>

<h2>バンクーバーの施主が払いすぎるポイント</h2>
<ol>
<li><strong>27インチが入るのに高級24インチを選んでしまう。</strong>BoschやMieleの24インチペアは$4,000+。クローゼット内寸が28インチ以上あるなら、$1,800のLG 27インチで容量も多く半額以下。コンパクト指定前に2回測りましょう。</li>
<li><strong>電気乾燥機で十分なのにガスを選ぶ。</strong>地下ランドリーへのガス配管は$1,500–$3,500＋許可。電気は加熱がやや遅いだけで配線が既にあれば追加費用ゼロ。ヒートポンプ電気乾燥機は長期エネルギーコストでもガスを下回ります。</li>
<li><strong>埋込み式洗濯機ボックスを省く。</strong>$80のボックス（ハンマーアレスター、ボールバルブ、シングルレバー止水付き）でランドリー漏水の90%を防げます。改装時の取付人工$300 vs ホース破裂後の$4,000–$15,000水損修復。</li>
<li><strong>側壁排気で済むのに屋根抜きにする。</strong>屋根抜きは$800–$1,500高くリント詰まりも増えます。側壁排気は安く清掃も簡単で規格適合。7.6m以内に外壁経路がない場合のみ屋根を選びましょう。</li>
<li><strong>共有壁の遮音を忘れる。</strong>洗濯機の脱水は1m地点で75dB+。寝室と壁を共有するなら、枠組時に$400の遮音バット＋レジリエントチャンネルで「毎サイクル聞こえる」と「気づかない」が分かれます。地下スイートでは必須。</li>
</ol>

<h2>最近のバンクーバープロジェクト実費（Reno Stars実データ）</h2>
<ul>
<li><strong>リッチモンドのコンドミニアム、スタック型交換：</strong>$2,950（施主支給LG WashTower $2,100、人工4時間$850）。既存クローゼット、配管・電気は変更なし。<a href="/ja/blog/condo-vs-house-renovation-cost-vancouver/">コンドミニアム改装の文脈</a>。</li>
<li><strong>コキットラムのタウンハウス廊下クローゼットリフレッシュ：</strong>$8,250（Samsungペア$2,200、IKEA SEKTION $1,400、クォーツ端材$550、LVT $300、人工$3,800）。4日。</li>
<li><strong>バーナビーの全戸改装、地下ランドリー新設：</strong>$30K–$35Kのプロジェクトのうち$11,400をランドリーに（Wood Veinsカスタムキッチンの基礎データ）。新2インチ立管、240V回路、IKEAキャビネット、ビニールプランク床、サイドバイサイドLG。</li>
<li><strong>バンクーバー東部の地下スイート、ユーティリティシンク付き専用ランドリールーム：</strong>$14,800（カスタムキャビネット$4,500、床暖磁器タイル$2,200、配管下地$2,800、電気$1,800、サイドバイサイド家電$2,400、ボード+塗装$1,100）。3週。地下スイートの一部、<a href="/ja/blog/basement-suite-renovation-cost-vancouver/">バンクーバー地下スイート改装費用</a>を参照。</li>
<li><strong>ウェストバンクーバーのマッドルーム+ランドリー複合：</strong>$19,500（カスタムミルワークのベンチ+ロッカー+ランドリーキャビネット$9,500、磁器タイル$1,800、配管$2,400、電気$1,200、塗装+仕上げ$1,400、家電$3,200）。5週。</li>
</ul>

<h2>許可と管理組合のルール</h2>

<h3>バンクーバー市／サリー／バーナビーの許可</h3>
<p>同等品の家電交換は許可不要。以下の作業は建築許可が必要：</p>
<ul>
<li>新規ランドリー追加（排水＋給水下地）</li>
<li>別室へのランドリー移設</li>
<li>ユーティリティシンク追加（排水＋給水）</li>
<li>新規240Vまたは30A回路（電気許可、建築許可とは別）</li>
<li>外壁の新規乾燥機ベント貫通</li>
</ul>
<p>メトロバンクーバーで基本的なランドリー新設の許可費は$250–$700。ライセンス保持の請負業者が代行し、見積に時間を含めます。</p>

<h3>コンドミニアム管理組合のルール</h3>
<p>大半のバンクーバーのコンドミニアム管理組合はランドリーに関する独自ルールがあります：</p>
<ul>
<li>家電の変更には組合承認が必要（移設を完全禁止する組合もあり）</li>
<li>配管工事は48時間前に管理人へ通知</li>
<li>洗濯機下に漏水トレイ必須（未設置＝オーナーの無限賠償責任）</li>
<li>静粛時間帯に洗濯使用が制限されることが多い（典型的に22時〜7時）</li>
<li>立管清掃は5〜10年ごと、一部の建物は所有者に課金</li>
</ul>
<p>ランドリー配管に触れる契約を結ぶ前に、組合細則とForm Bを必ず取り寄せましょう。</p>

<h2>工期の目安</h2>
<ul>
<li><strong>スタック型交換：</strong>現場1日、家電発注リード1〜2日</li>
<li><strong>クローゼット リフレッシュ（新キャビネット込み）：</strong>現場3〜5日、プロジェクト全体2〜3週（キャビネット発注+下地+仕上げ）</li>
<li><strong>サイドバイサイド化拡張：</strong>現場1〜2週（枠組変更）、全体4〜6週</li>
<li><strong>専用ランドリールーム新設：</strong>現場2〜4週、全体6〜10週（許可+キャビネット+タイル+仕上げ）</li>
<li><strong>ランドリー+マッドルーム複合：</strong>現場3〜5週、全体8〜12週</li>
</ul>

<h2>よくある質問</h2>

<h3>給排水のないバンクーバーのコンドミニアム クローゼットに洗濯機を設置できますか？</h3>
<p>条件次第で可能です。3〜4m以内に水道壁があり、組合が承認すれば。費用：配管下地$2,500–$6,000＋家電本体。コンクリートスラブのコンドミニアムでは、ヒートポンプ式ノンベント乾燥機が排気問題を解決します。組合承認が最重要——Form Bと細則を先に確認してください。</p>

<h3>スタック型かサイドバイサイドか？</h3>
<p>スタック型は床面積を節約（27インチ vs サイドバイサイド54インチ）。サイドバイサイドは出し入れしやすく、上にカウンターを設けられ、同等スタック型より$200ほど安い。壁が54インチ以上で折りたたみ台が欲しいならサイドバイサイド、狭いスペースや廊下クローゼットならスタック型。</p>

<h3>ヒートポンプ乾燥機の追加費用は払う価値がありますか？</h3>
<p>排気経路の取れないコンドミニアムや地下：価値あり。火災を避けたい場面：価値あり。ヒートポンプ式は低温運転、エネルギー消費50%減、外排気不要。トレードオフ：60〜90分のサイクル（排気式は30〜45分）、初期費用$800–$1,500高。BCハイドロのリベートで$200–$400戻ることもあります。</p>

<h3>ランドリー改装中にユーティリティシンクを追加するといくら？</h3>
<p>典型的に$900–$2,500：シンク$200–$700、蛇口$150–$500、配管人工$700–$1,800（排水T＋給水＋接続）。改装で壁が開いている時の追加は安い。閉壁後の後追い追加は難しく$3K以上。</p>

<h3>乾燥機の排気をキッチン換気や浴室ファンと共有できますか？</h3>
<p>不可。BCビルディングコードは乾燥機専用ベントを義務付け。共有はファンダクトにリントが堆積し火災リスクを生みます。施工時に独立した乾燥機ベント経路を必ず確保してください。</p>

<h3>ランドリーの床暖タイルは価値ありますか？</h3>
<p>地下ランドリー（コンクリートスラブ上）：価値あり——$700–$1,500の追加で年中快適性が劇的に向上。メインフロアの木造：通常は不要——床温度が室温に近い。床暖マットはサーモスタット制御で、消費は60W電球程度のため運転コストは僅か。</p>

<h3>改装したランドリールームは何年使えますか？</h3>
<p>家電：排気式乾燥機10〜15年、スタック型8〜12年、コンパクト欧州ペア12〜18年。キャビネット・カウンター・タイル床：仕様が用途に合っていれば20〜30年。配管・電気下地：現行コード＋PEX給水なら住宅の寿命と同等。</p>

<h2>ランドリー予算の組み方</h2>
<ol>
<li><strong>まずパターン（クローゼット交換／リフレッシュ／専用室／複合）を決める。</strong>パターンごとに後工程の人工が大きく異なります。</li>
<li><strong>高級家電を発注する前に分電盤の空きを確認。</strong>満杯=サブパネル工事$2,000+が先に必要。</li>
<li><strong>ドア開口ではなくクローゼット内寸を測る。</strong>27インチ スタック型は内寸28インチ以上、24インチ コンパクトは25インチ以上。背面にホース用2インチも確保。</li>
<li><strong>乾燥機を発注する前に排気経路を計画。</strong>ヒートポンプ式は排気不可能ケースを解決しますが家電が$1,200–$2,500高。</li>
<li><strong>配管想定外に$500–$1,000を確保。</strong>1990年以前のバンクーバー住宅は解体時に旧亜鉛給水管・規格外トラップ・腐食立管が出やすい。</li>
</ol>

<h2>関連コストガイド</h2>
<ul>
<li><a href="/ja/guides/basement-renovation-cost-vancouver/">バンクーバー地下改装費用</a> — 多くのランドリーは地下にあり、これが親ガイド</li>
<li><a href="/ja/blog/basement-suite-renovation-cost-vancouver/">バンクーバー地下スイート改装費用</a> — ランドリー下地はスイート合法化の核</li>
<li><a href="/ja/blog/condo-vs-house-renovation-cost-vancouver/">バンクーバー コンドミニアム vs 戸建て改装費用</a> — 住居タイプ別のランドリー制約</li>
<li><a href="/ja/blog/renovation-permits-bc-guide/">BC改装許可ガイド</a> — ランドリー工事に許可が必要なタイミング</li>
<li><a href="/ja/services/basement/">地下改装サービス</a> — Reno Starsの仕事内容と進め方</li>
</ul>

<p>ランドリールームの実見積をご希望ですか？現状写真と検討中の方向性を送っていただければ、48時間以内に3段階の予算プランをご提案します。<a href="/ja/contact/">無料の現地相談</a>。</p>
</article>`;

const contentKo = `<article>
<h1>밴쿠버 세탁실 리노베이션 비용 2026: 클로짓·전용 룸·스택형 3가지 셋업</h1>

<p class="lead">세탁실은 밴쿠버 리노베이션 프로젝트에서 예산이 가장 적게 잡히는 공간이지만, 가장 비싼 깜짝 청구서가 나오는 공간이기도 합니다. 단순한 스택형 교체가 트랩 암 검사 불합격으로 $5,000짜리 배관 재공사로 변하는 일이 흔합니다. 본 글에서는 메트로 밴쿠버 2026년 세탁실 리노베이션 실제 비용을, Reno Stars 최근 프로젝트 데이터에 기반해 셋업별로 정리합니다.</p>

<h2>가격 요약표</h2>
<table>
<thead><tr><th>셋업</th><th>밴쿠버 설치 비용</th><th>공기</th><th>적합한 경우</th></tr></thead>
<tbody>
<tr><td>기존 클로짓 내 스택형 교체</td><td>$1,800 – $3,500</td><td>1–2일</td><td>콘도, 타운홈, 임대 — 같은 자리에서 동일 사양 업그레이드</td></tr>
<tr><td>클로짓 세탁 리프레시(캐비닛 + 상판 + 배기 정비)</td><td>$4,500 – $8,500</td><td>3–5일</td><td>복도/현관 클로짓 — 깔끔한 외관 + 수납이 필요할 때</td></tr>
<tr><td>스택형 → 사이드바이사이드 확장</td><td>$6,000 – $11,000</td><td>1–2주</td><td>스택형에서 가로 배치로 변경 — 골조 확장, 보드, 새 바닥</td></tr>
<tr><td>전용 세탁실(지하/주층)</td><td>$9,000 – $18,000</td><td>2–4주</td><td>전체 리노, 지하 스위트, 싱크 + 폴딩 스테이션이 필요한 가족</td></tr>
<tr><td>세탁 + 머드룸 통합</td><td>$12,000 – $24,000+</td><td>3–5주</td><td>단독주택에 벤치·로커·반려동물 세척대·수납 벽까지 추가</td></tr>
</tbody>
</table>
<p><em>가격은 설치 완료 기준이며, 가전(또는 직접 구매한 가전 설치 인건비), 급수 라인, 6피트 이내 건조기 배기 덕트, 규정상 필요한 GFCI 콘센트, 폐기 비용을 포함합니다. 인허가, 구조 변경(배수·통기관 이설), 가스 건조기용 가스 배관, 콘도 관리위가 요구하는 차음 공사는 별도 견적입니다.</em></p>

<h2>가격을 좌우하는 6가지 요소</h2>

<h3>1. 가전 본체($1,200 – $7,000)</h3>
<p>선택한 가전이 프로젝트 하한선을 결정합니다. 시공이 가장 많은 모델군:</p>
<ul>
<li><strong>중급 스택형(LG, 삼성, GE) — 페어 $1,400–$2,400:</strong> 27인치 폭. 콘도 및 복도 클로짓의 기본.</li>
<li><strong>컴팩트 24인치 스택형(보쉬, 밀레, 아스코) — 페어 $2,800–$5,500:</strong> 27인치가 물리적으로 들어가지 않을 때 필수(28인치 미만 클로짓). 히트펌프 무배기 건조기는 배기 골치를 제거.</li>
<li><strong>풀사이즈 사이드바이사이드(LG WashTower, 삼성 FlexWash) — 페어 $2,200–$3,800:</strong> 각 27인치, 바닥 폭 54인치 이상 필요. 용량 크고, 적재 편하며, 위에 카운터 공간을 만들 수 있음.</li>
<li><strong>히트펌프 무배기 건조기(단품 $2,800–$5,000):</strong> 외부 배기 불필요 — 콘도와 지하 세탁실에 결정적. 건조 시간이 90분 정도로 길지만(배기형은 45분) 화재 위험을 제거.</li>
<li><strong>일체형 세탁건조기(LG WashCombo) — $3,200–$4,500:</strong> 옷을 옮길 필요 없음. 단점: 건조 용량이 분리형의 절반 수준.</li>
</ul>

<h3>2. 배관($600 – $4,500)</h3>
<p>밴쿠버 세탁실 작업은 거의 매번 배관 깜짝 이슈가 하나씩 나옵니다:</p>
<ul>
<li><strong>급수 라인 교체(매립형 세탁기 박스):</strong> $400–$800 (25년 된 새들 밸브를 규정에 맞는 볼 밸브로 교체, 세탁기 뒤에 정규 매립 박스 설치)</li>
<li><strong>트랩 암 교체/구배 재조정:</strong> $600–$1,500 (1990년 이전 주택의 1.5인치 트랩 미달 사례 다수, 현 규정은 2인치 + 18인치 이상 스탠드파이프)</li>
<li><strong>스탠드파이프 위치 변경(같은 벽 내):</strong> $800–$1,800</li>
<li><strong>배수 경로 재설계(다른 방으로 이설):</strong> $2,000–$4,500 (장선 접근성, 슬래브 컷 필요 여부, 통기관 위치에 따라)</li>
<li><strong>유틸리티 싱크 추가(배수 T + 급수):</strong> 배관 $700–$1,800, 싱크/수전 $200–$1,200 별도</li>
</ul>

<h3>3. 배기($300 – $2,500)</h3>
<p>DIY 세탁기 설치가 가장 많이 실패하는 지점. BC 빌딩 코드 2024 핵심:</p>
<ul>
<li>금속 강관만 허용(플라스틱 플렉스 불가). 예외: 건조기 뒤 UL 인증 플렉스 8피트까지</li>
<li>총 길이 7.6m(25피트) 이내, 90도 엘보 1개당 1.5m(5피트) 차감</li>
<li>외부 종단은 댐퍼가 있는 후드, 방충망 금지</li>
<li>외부로 하향 구배(린트 응결액이 고이지 않게)</li>
</ul>
<p>비용:</p>
<ul>
<li><strong>동일 스펙 재연결(기존 덕트 활용):</strong> $150–$300</li>
<li><strong>외벽 관통 짧은 경로(8피트 이내, 장애물 없음):</strong> $400–$900</li>
<li><strong>천장/장선 경유 + 엘보 2개 이상:</strong> $900–$2,000</li>
<li><strong>지붕 배기(3층 이상 + 타운홈):</strong> $1,500–$2,500 + 지붕 방수</li>
<li><strong>히트펌프 무배기로 변경(덕트 공사 전면 제거):</strong> 가전 추가 $1,200–$2,500이지만 배기 인건비 전부 절약, 린트 화재 방지</li>
</ul>

<h3>4. 전기($300 – $2,200)</h3>
<p>2010년 이전 밴쿠버 주택은 세탁실 전기 검사에서 자주 부적합 판정:</p>
<ul>
<li><strong>전기 건조기 전용 240V/30A 회로:</strong> $600–$1,500 (기존 240V 없을 때) / $300–$600 (구형 3핀을 규정 4핀으로 교체)</li>
<li><strong>세탁기 전용 120V/15A 또는 20A:</strong> $400–$900 (신규 배선 필요 시)</li>
<li><strong>싱크 1m 이내 GFCI:</strong> 규정 요건, 추가 $200–$400</li>
<li><strong>조명 + 환풍기 회로:</strong> $400–$800 (둘 다 없을 때)</li>
<li><strong>서브패널 필요(구형 100A 패널 차단기 자리 만석):</strong> $1,800–$3,500 (패널 만석이면 별도 예산)</li>
</ul>

<h3>5. 캐비닛, 상판, 싱크($1,800 – $7,500)</h3>
<p>"진짜 세탁실 같다"는 느낌을 만드는 업그레이드. 비용 차이가 갈리는 지점:</p>
<ul>
<li><strong>이케아 SEKTION 또는 홈데포 표준 캐비닛 — 6~8 리니어피트 $800–$2,200:</strong> 가성비 최고. 화이트 또는 오크 셰이커 도어, 소프트클로즈, 세제·린넨 수납.</li>
<li><strong>맞춤 멜라민 + 라미네이트 도어 — $1,800–$4,500:</strong> 현지 밴쿠버 공방(Kelowna Wood, Fraser Valley Cabinets)이 좁은 클로짓 치수에 정확히 제작.</li>
<li><strong>원목 셰이커 맞춤 — $3,500–$7,500:</strong> 주층 세탁실에서 키친과 통일감을 줄 때.</li>
<li><strong>쿼츠 상판(4~6피트) — $600–$1,400:</strong> 프런트 로더 위 폴딩 스테이션. 화이트 또는 그레이 시저스톤이 가장 일반적.</li>
<li><strong>부처블록(오크, 메이플) — $300–$800:</strong> 따뜻한 느낌, 연 1회 오일 도포 필요.</li>
<li><strong>유틸리티 싱크(스테인리스 단조 16~22인치) — 본체 $200–$700, 수전 $150–$500:</strong> 손빨래 + 반려동물 세척에 필수.</li>
</ul>

<h3>6. 바닥($800 – $3,500)</h3>
<p>세탁실 바닥은 물에 강해야 합니다. 등급별:</p>
<ul>
<li><strong>시트 비닐/LVT — 시공 $4–$8/제곱피트:</strong> 가장 저렴한 방수 옵션. 교체 용이.</li>
<li><strong>자기 타일 — 시공 $9–$15/제곱피트:</strong> 장기적으로 최적. 누수에 강하고 머드룸과 통일감.</li>
<li><strong>난방 타일(전기 매트) — $7–$12/제곱피트 추가:</strong> 콘크리트 슬래브에 닿는 지하 세탁실에서 인기.</li>
</ul>

<h2>3가지 셋업 자세히 보기</h2>

<h3>셋업 1: 기존 클로짓 내 스택형 교체($1,800–$3,500)</h3>
<p>같은 클로짓에서 동일 사양 교체. 밴쿠버 콘도에서 가장 흔한 작업. 범위:</p>
<ul>
<li>구형 가전 분리 및 폐기(Encorp 처분료 $200)</li>
<li>매립형 세탁기 박스가 부식되었으면 신규 교체(배관 인건비 $300 + 박스 $80)</li>
<li>3핀 케이블이면 4핀으로 교체(케이블 $30 + 15분 인건)</li>
<li>급수 연결, 만압 누수 시험</li>
<li>건조기 배기 재연결(플라 플렉스라면 규정 위반이므로 금속 강관으로 교체)</li>
<li>레벨링 및 세탁기 드럼 균형 조정</li>
</ul>
<p>Reno Stars 실제 사례: <strong>리치몬드 콘도 LG 스택형 교체</strong> — 직접 구매한 LG WashTower $2,100, 당사 인건 $850(4시간 배관 + 전기 + 배기), 1일 시공.</p>

<h3>셋업 2: 클로짓 세탁 리프레시($4,500–$8,500)</h3>
<p>같은 위치에 상부 캐비닛, 프런트로더 위 쿼츠 상판, 새 바닥, 새 페인트, 규정에 맞는 러프인 추가. 범위:</p>
<ul>
<li>구형 가전 + 보드 철거</li>
<li>아연도금 급수관을 PEX로 교체, 정규 2인치 트랩과 스탠드파이프 설치</li>
<li>4핀이 아니면 240V 콘센트 업그레이드</li>
<li>가전 아래 비닐 플랭크 또는 LVT 시공</li>
<li>30인치 깊이 상부 캐비닛(또는 3단 오픈 선반)</li>
<li>쿼츠 잔재(4피트 × 24인치 깊이)를 사이드바이사이드 또는 스택형 위에 설치</li>
<li>외벽 관통 금속 강관으로 건조기 배기 신설</li>
<li>재도장, 신규 몰딩, 클로짓 입구에 폴딩 도어나 반 도어 설치</li>
</ul>
<p>실제 사례: <strong>코퀴틀람 타운홈 복도 클로짓</strong>, 중급 삼성 사이드바이사이드 $2,200, 화이트 IKEA SEKTION $1,400, 쿼츠 잔재 $550, LVT $300, 인건 $3,800 = 합계 $8,250. 4일.</p>

<h3>셋업 3: 전용 세탁실($9,000–$18,000)</h3>
<p>지하 유틸리티 공간, 머드룸, 또는 계단 아래 공간을 진짜 세탁실로 만들기. 범위:</p>
<ul>
<li>벽체 골조(개방형 유틸리티 → 폐쇄형 룸)</li>
<li>배관 러프인: 급수, 2인치 스탠드파이프 + 트랩, 유틸리티 싱크용 배수 T</li>
<li>전기: 30A/240V 건조기 전용, 20A 세탁기, GFCI, 조명 + 팬 회로</li>
<li>단열(외벽 R-12 이상, 침실 공유 벽에는 차음 배트)</li>
<li>보드 + 스킴 코트 + 페인트</li>
<li>자기 타일 바닥(옵션으로 난방 매트)</li>
<li>맞춤 캐비닛(8~12 리니어피트) + 쿼츠 상판</li>
<li>스테인리스 유틸리티 싱크 + 단일 레버 수전</li>
<li>섬세한 빨래용 행거바 + 다림판 수납</li>
<li>사이드바이사이드 또는 풀사이즈 스택 가전</li>
</ul>
<p>실제 사례: <strong>밴쿠버 동부 지하 리노</strong>, 유틸리티 싱크 + 12피트 캐비닛 + 난방 자기 타일 + LG 사이드바이사이드 가전을 갖춘 전용 세탁실. 총 $14,800, 3주. 더 큰 지하 스위트 프로젝트의 일부, 자세한 내용은 <a href="/ko/blog/basement-renovation-vancouver-complete-guide/">밴쿠버 지하 리노베이션 완전 가이드</a> 참고.</p>

<h2>밴쿠버 집주인이 과지출하는 지점</h2>
<ol>
<li><strong>27인치가 들어가는데 고급 24인치를 선택.</strong> 보쉬·밀레 24인치 페어는 $4,000+로, 좁은 클로짓을 위한 선택입니다. 클로짓 내경이 28인치 이상이면 $1,800 LG 27인치 페어가 용량도 더 크고 가격은 절반 이하. 컴팩트 사양 전에 두 번 측정하세요.</li>
<li><strong>전기 건조기로 충분한데 가스를 선택.</strong> 지하 세탁실로 가스 라인을 가설하면 $1,500–$3,500 + 인허가. 전기는 가열이 약간 느릴 뿐 이미 배선되어 있다면 추가 비용 없음. 히트펌프 전기 건조기는 장기 에너지 비용까지 가스보다 저렴합니다.</li>
<li><strong>매립형 세탁기 박스를 생략.</strong> 벽 안 $80짜리 박스(워터해머 어레스터, 볼 밸브, 단일 레버 차단)는 세탁 누수 90%를 방지. 리노 시 인건비 $300 vs 호스 파열 후 $4,000–$15,000 누수 복구.</li>
<li><strong>측벽 배기로 충분한데 지붕 배기로 선택.</strong> 지붕 배기는 $800–$1,500 비싸고 린트 막힘 지점이 많아짐. 측벽 배기는 저렴하고 청소 쉽고 규정 적합. 7.6m 이내에 외벽 경로가 없을 때만 지붕 선택.</li>
<li><strong>공유 벽 차음을 잊는 것.</strong> 세탁기 탈수는 1m 지점에서 75dB+. 침실과 벽을 공유하면 골조 시공 시 $400 차음 배트 + 레질리언트 채널 차이로 "사이클마다 들리는 집"과 "돌렸는지도 모르는 집"이 갈립니다. 지하 스위트에서는 필수.</li>
</ol>

<h2>최근 밴쿠버 프로젝트 실제 비용(Reno Stars 데이터)</h2>
<ul>
<li><strong>리치몬드 콘도 스택형 교체:</strong> $2,950 (직접 구매 LG WashTower $2,100, 인건 4시간 $850). 기존 클로짓, 배관·전기 변경 없음. <a href="/ko/blog/condo-vs-house-renovation-cost-vancouver/">콘도 리노 맥락</a>.</li>
<li><strong>코퀴틀람 타운홈 복도 클로짓 리프레시:</strong> $8,250 (삼성 페어 $2,200, IKEA SEKTION $1,400, 쿼츠 잔재 $550, LVT $300, 인건 $3,800). 4일.</li>
<li><strong>버나비 전체 리노, 지하 세탁 신설:</strong> $30K–$35K 프로젝트 중 $11,400을 세탁(우드 베인 맞춤 키친 베이스). 새 2인치 스탠드파이프, 240V 회로, IKEA 캐비닛, 비닐 플랭크 바닥, LG 사이드바이사이드.</li>
<li><strong>밴쿠버 동부 지하 스위트, 유틸리티 싱크 포함 전용 세탁실:</strong> $14,800 (맞춤 캐비닛 $4,500, 난방 자기 타일 $2,200, 배관 러프인 $2,800, 전기 $1,800, 사이드바이사이드 가전 $2,400, 보드+페인트 $1,100). 3주. 지하 스위트 프로젝트의 일부, <a href="/ko/blog/basement-suite-renovation-cost-vancouver/">밴쿠버 지하 스위트 리노 비용</a> 참고.</li>
<li><strong>웨스트밴쿠버 머드룸 + 세탁 통합:</strong> $19,500 (맞춤 목공 벤치 + 로커 + 세탁 캐비닛 $9,500, 자기 타일 $1,800, 배관 $2,400, 전기 $1,200, 페인트+마감 $1,400, 가전 $3,200). 5주.</li>
</ul>

<h2>인허가 및 관리위 규정</h2>

<h3>밴쿠버시/서리/버나비 인허가</h3>
<p>동일 사양 가전 교체는 인허가 불필요. 다음 작업은 건축 허가 필요:</p>
<ul>
<li>없던 자리에 세탁 신설(배수 + 급수 러프인)</li>
<li>다른 방으로 세탁 이설</li>
<li>유틸리티 싱크 추가(배수 + 급수)</li>
<li>신규 240V 또는 30A 회로(전기 허가, 건축 허가와 별개)</li>
<li>외벽에 신규 건조기 배기 관통</li>
</ul>
<p>메트로 밴쿠버 기본 세탁 신설 인허가 비용은 $250–$700. 면허 시공자가 대행하며 견적에 시간이 포함됩니다.</p>

<h3>콘도 관리위 규정</h3>
<p>대부분의 밴쿠버 콘도 관리위에는 세탁 관련 별도 규정이 있습니다:</p>
<ul>
<li>관리위 승인 없이 가전 변경 불가(세탁기/건조기 이설을 완전 금지하는 곳도 있음)</li>
<li>배관 작업은 48시간 전 빌딩 매니저 통보</li>
<li>세탁기 아래 누수 트레이 의무(미설치 = 단위 소유자 무한 배상 책임)</li>
<li>정숙 시간대에 세탁 사용 제한이 흔함(통상 22시–7시)</li>
<li>스택 청소 5–10년마다, 일부 빌딩은 단위 소유자에게 청구</li>
</ul>
<p>세탁 배관에 손대는 리노 계약 전에 관리위 세칙과 Form B를 반드시 확보하세요.</p>

<h2>공기 가이드</h2>
<ul>
<li><strong>스택형 교체:</strong> 현장 1일, 가전 발주 리드 1–2일</li>
<li><strong>새 캐비닛 포함 클로짓 리프레시:</strong> 현장 3–5일, 전체 2–3주(캐비닛 발주 + 러프인 + 마감)</li>
<li><strong>스택형 → 사이드바이사이드 확장:</strong> 현장 1–2주(골조 변경), 전체 4–6주</li>
<li><strong>전용 세탁실 신설:</strong> 현장 2–4주, 전체 6–10주(인허가 + 캐비닛 + 타일 + 마감)</li>
<li><strong>세탁 + 머드룸 통합:</strong> 현장 3–5주, 전체 8–12주</li>
</ul>

<h2>자주 묻는 질문</h2>

<h3>급배수가 없는 밴쿠버 콘도 클로짓에 세탁기를 설치할 수 있나요?</h3>
<p>경우에 따라 가능합니다. 3–4m 이내에 배관 벽이 있고 관리위가 승인하면. 비용: 배관 러프인 $2,500–$6,000 + 가전 본체. 콘크리트 슬래브 콘도에서는 히트펌프 무배기 건조기가 배기 문제를 해결합니다. 관리위 승인이 핵심 — Form B와 세칙을 먼저 확인하세요.</p>

<h3>스택형이냐 사이드바이사이드냐?</h3>
<p>스택형은 바닥 폭을 절약(27인치 vs 사이드바이사이드 54인치). 사이드바이사이드는 적재가 편하고 위에 카운터를 둘 수 있으며 동일 사양 스택형보다 약 $200 저렴. 벽이 54인치 이상이고 폴딩 면이 필요하면 사이드바이사이드, 공간이 좁거나 복도 클로짓이면 스택형.</p>

<h3>히트펌프 건조기 추가 비용이 가치 있나요?</h3>
<p>배기 경로가 어려운 콘도와 지하 세탁실: 가치 있음. 화재가 우려되는 환경: 가치 있음. 히트펌프 건조기는 저온 운전, 에너지 50% 절감, 외부 덕트 불필요. 트레이드오프: 60–90분 사이클(배기형은 30–45분), 초기 비용 $800–$1,500 추가. BC Hydro 리베이트로 $200–$400 받을 수 있음.</p>

<h3>세탁실 리노베이션 중 유틸리티 싱크 추가 비용은?</h3>
<p>일반적으로 $900–$2,500: 싱크 $200–$700, 수전 $150–$500, 배관 인건 $700–$1,800(배수 T + 급수 + 연결). 벽이 열린 리노 단계에서 추가하면 저렴. 닫힌 후 추가는 어렵고 $3K 이상.</p>

<h3>건조기 배기를 키친 후드나 욕실 환풍기와 공유할 수 있나요?</h3>
<p>안 됩니다. BC 빌딩 코드는 건조기 전용 배기를 의무화. 공유 시 팬 덕트에 린트가 쌓여 화재 위험 발생. 시공 시 반드시 독립된 건조기 배기 경로를 확보하세요.</p>

<h3>세탁실 난방 타일은 가치 있나요?</h3>
<p>지하 세탁(콘크리트 슬래브 위): 가치 있음 — $700–$1,500 추가로 사계절 쾌적성이 크게 개선. 주층 목조 세탁실: 보통 불필요 — 바닥이 실온에 가까움. 난방 매트는 서모스탯 제어로 60W 전구 정도의 에너지를 사용해 운전 비용은 미미합니다.</p>

<h3>리노한 세탁실은 얼마나 오래 가나요?</h3>
<p>가전: 배기 건조기 10–15년, 스택형 8–12년, 컴팩트 유럽 페어 12–18년. 캐비닛, 상판, 타일 바닥: 사양이 용도에 맞다면 20–30년. 배관·전기 러프인: 현행 코드 + PEX 급수면 주택 수명과 동일.</p>

<h2>세탁실 예산 계획</h2>
<ol>
<li><strong>먼저 셋업 등급(클로짓 교체/리프레시/전용 룸/통합)을 정하세요.</strong> 등급별로 후속 인건비가 매우 다릅니다.</li>
<li><strong>고급 가전을 발주하기 전에 분전반 자리를 확인하세요.</strong> 만석 = 서브패널 작업 $2,000+ 선행 필요.</li>
<li><strong>도어 개구가 아니라 클로짓 내경을 측정하세요.</strong> 27인치 스택형은 내경 28인치 이상, 24인치 컴팩트는 25인치 이상. 뒤쪽에 호스용 2인치도 확보.</li>
<li><strong>건조기 발주 전 배기 경로를 계획하세요.</strong> 히트펌프 무배기는 풀기 어려운 배기 문제를 해결하지만 가전 비용이 $1,200–$2,500 증가.</li>
<li><strong>배관 돌발 비용 $500–$1,000을 예비.</strong> 1990년 이전 밴쿠버 주택은 철거 시 구형 아연 급수, 미달 트랩, 부식된 스탠드파이프가 자주 나옵니다.</li>
</ol>

<h2>관련 비용 가이드</h2>
<ul>
<li><a href="/ko/guides/basement-renovation-cost-vancouver/">밴쿠버 지하 리노베이션 비용</a> — 대부분의 세탁실이 지하에 위치하며 이 글의 모(母) 가이드</li>
<li><a href="/ko/blog/basement-suite-renovation-cost-vancouver/">밴쿠버 지하 스위트 리노 비용</a> — 세탁 러프인은 스위트 합법화의 핵심</li>
<li><a href="/ko/blog/condo-vs-house-renovation-cost-vancouver/">밴쿠버 콘도 vs 단독주택 리노 비용</a> — 주거 유형별 세탁 제약</li>
<li><a href="/ko/blog/renovation-permits-bc-guide/">BC 리노 인허가 가이드</a> — 세탁 작업에 인허가가 필요한 시점</li>
<li><a href="/ko/services/basement/">지하 리노베이션 서비스</a> — Reno Stars의 작업 범위와 진행 방식</li>
</ul>

<p>세탁실 실제 견적이 필요하신가요? 현재 공간 사진과 검토 중인 방향을 보내주시면 48시간 이내에 3단계 가격 옵션으로 회신드립니다. <a href="/ko/contact/">무료 방문 상담</a>.</p>
</article>`;

const contentEs = `<article>
<h1>Costo de Renovación del Cuarto de Lavado Vancouver 2026: Closet, Cuarto Dedicado y Stackable</h1>

<p class="lead">Los cuartos de lavado son el espacio con menor presupuesto en la mayoría de las renovaciones de Vancouver — y donde aparecen las sorpresas más caras. Un simple cambio de stackable se convierte en un desvío de plomería de $5,000 cuando el brazo de la trampa no pasa la inspección. Aquí está el costo real de renovar un cuarto de lavado en Metro Vancouver en 2026, desglosado por tipo de instalación y basado en datos reales de proyectos de Reno Stars.</p>

<h2>Resumen rápido de precios</h2>
<table>
<thead><tr><th>Configuración</th><th>Costo instalado en Vancouver</th><th>Tiempo</th><th>Ideal para</th></tr></thead>
<tbody>
<tr><td>Cambio de stackable en closet existente</td><td>$1,800 – $3,500</td><td>1–2 días</td><td>Condos, townhomes, rentas — misma ubicación, upgrade igual por igual</td></tr>
<tr><td>Renovación del closet de lavandería (gabinetes + top + ventilación corregida)</td><td>$4,500 – $8,500</td><td>3–5 días</td><td>Closets de pasillo / mudroom que necesitan look limpio + almacenamiento</td></tr>
<tr><td>Expansión a side-by-side (closet ampliado)</td><td>$6,000 – $11,000</td><td>1–2 semanas</td><td>Convertir stackable a side-by-side; ampliar estructura, drywall + piso nuevo</td></tr>
<tr><td>Cuarto de lavado dedicado (sótano / planta principal)</td><td>$9,000 – $18,000</td><td>2–4 semanas</td><td>Renos integrales, suites de sótano, familias que quieren fregadero + estación de doblado</td></tr>
<tr><td>Lavandería + mudroom combinados</td><td>$12,000 – $24,000+</td><td>3–5 semanas</td><td>Casas unifamiliares con banca, lockers, lavado de mascotas, pared completa de almacenamiento</td></tr>
</tbody>
</table>
<p><em>Los precios son instalados e incluyen los electrodomésticos O la mano de obra del contratista para instalar electrodomésticos suministrados por el dueño, líneas de suministro, ducto de ventilación de hasta 6 pies, tomacorrientes GFCI cuando se requieran, y desecho de las unidades viejas. Permisos, movimientos estructurales (reubicar drenaje o columna de ventilación), trabajo de gas para secadoras a gas, y el aislamiento acústico requerido por strata de condos se cotizan por separado.</em></p>

<h2>Qué impulsa el precio</h2>

<h3>1. Los electrodomésticos en sí ($1,200 – $7,000)</h3>
<p>El par que elijas marca el piso de todo el proyecto. Lo que más instalamos:</p>
<ul>
<li><strong>Stackable de gama media (LG, Samsung, GE) — par $1,400–$2,400:</strong> 27" de ancho, con o sin ventilación, el estándar para condos y closets de pasillo.</li>
<li><strong>Stackable compacto de 24" (Bosch, Miele, Asko) — par $2,800–$5,500:</strong> Necesario donde un par de 27" no entra físicamente (closets estrechos en condos, nichos de pasillo de menos de 28"). Las secadoras de bomba de calor sin ventilación eliminan los dolores de cabeza con ducting.</li>
<li><strong>Side-by-side de tamaño completo (LG WashTower, Samsung FlexWash) — par $2,200–$3,800:</strong> 27" cada una, requiere 54"+ de ancho de piso. Mayor capacidad, más fácil de cargar, más espacio de mostrador encima.</li>
<li><strong>Secadora de bomba de calor sin ventilación ($2,800–$5,000 solo la secadora):</strong> Sin ducto a través de la pared — enorme para condos y lavanderías de sótano donde la ventilación es imposible. Ciclos de secado más lentos (~90 min vs 45 min) pero elimina el riesgo de incendio #1 en cualquier hogar.</li>
<li><strong>Combos lavadora/secadora todo-en-uno (LG WashCombo) — $3,200–$4,500:</strong> Una unidad lava Y seca sin transferir. Concesión: la mitad de la capacidad de secado de unidades separadas.</li>
</ul>

<h3>2. Plomería ($600 – $4,500)</h3>
<p>Casi todo proyecto de lavandería en Vancouver descubre al menos una sorpresa de plomería:</p>
<ul>
<li><strong>Reemplazo de líneas de suministro caliente/frío (caja empotrada para lavadora):</strong> $400–$800 (reemplazar válvulas saddle de 25 años por válvulas de bola conformes al código; instalar caja empotrada adecuada detrás de la lavadora)</li>
<li><strong>Reemplazo / re-pendiente del brazo de la trampa:</strong> $600–$1,500 (las casas de 1990 e inferiores rutinariamente tienen trampas de lavandería de 1.5" subdimensionadas; el código actual es 2" con un standpipe de 2" de ≥18" de altura)</li>
<li><strong>Reubicación del standpipe (mover la lavadora en la misma pared):</strong> $800–$1,800</li>
<li><strong>Re-direccionamiento de drenaje (mover la lavandería a un cuarto nuevo):</strong> $2,000–$4,500 dependiendo de la accesibilidad de las viguetas, requisitos de corte de losa y ubicación de la columna de ventilación</li>
<li><strong>Agregar un fregadero de servicio (nueva derivación de drenaje + líneas de suministro):</strong> $700–$1,800 plomería, más $200–$1,200 por el fregadero/grifo en sí</li>
</ul>

<h3>3. Ventilación ($300 – $2,500)</h3>
<p>La ventilación de la secadora es donde fracasan la mayoría de las instalaciones DIY. Mínimos del código (BC Building Code 2024):</p>
<ul>
<li>Solo ducto rígido de metal (sin plástico flexible) — excepción de hasta 8 ft de flexible UL detrás de la secadora</li>
<li>Carrera total máxima 7.6 m (25 ft) menos 1.5 m (5 ft) por cada codo de 90°</li>
<li>Tapa de terminación con dámper, sin malla en la campana exterior</li>
<li>Pendiente hacia abajo al exterior (sin trampas que recolecten condensado de pelusa)</li>
</ul>
<p>Costos:</p>
<ul>
<li><strong>Reconexión igual por igual (ducto existente se mantiene):</strong> $150–$300</li>
<li><strong>Carrera nueva corta a través de pared exterior (menos de 8 ft, sin obstáculos):</strong> $400–$900</li>
<li><strong>Carrera larga a través de techo/viguetas con 2+ codos:</strong> $900–$2,000</li>
<li><strong>Ventilación al techo (3 pisos + townhomes):</strong> $1,500–$2,500 + trabajo de tapajuntas</li>
<li><strong>Cambiar a bomba de calor sin ventilación (elimina trabajo de ductos por completo):</strong> sobrecosto del electrodoméstico $1,200–$2,500 pero ahorra toda la mano de obra de ductos y previene incendios por pelusa</li>
</ul>

<h3>4. Eléctrico ($300 – $2,200)</h3>
<p>Las casas de Vancouver construidas antes de 2010 rutinariamente fallan la inspección eléctrica de la lavandería:</p>
<ul>
<li><strong>Circuito dedicado de 240V/30A para secadora eléctrica:</strong> $600–$1,500 si no existe receptáculo de 240V, $300–$600 para reemplazar un 3-pin sin tierra por un 4-pin conforme al código</li>
<li><strong>Dedicado 120V/15A o 20A para lavadora:</strong> $400–$900 si se necesita un nuevo circuito directo</li>
<li><strong>Tomacorriente GFCI a menos de 1m del fregadero:</strong> requerido por código; $200–$400 para agregar</li>
<li><strong>Circuito de luz + extractor:</strong> $400–$800 si no existe ninguno</li>
<li><strong>Subpanel necesario (panel viejo de 100A sin breakers):</strong> $1,800–$3,500 (planificar por separado si tu panel está lleno)</li>
</ul>

<h3>5. Gabinetes, mostrador, fregadero ($1,800 – $7,500)</h3>
<p>El upgrade que hace que "se sienta como un cuarto de lavado real". Donde los dueños gastan o ahorran:</p>
<ul>
<li><strong>Gabinetes IKEA SEKTION o de Home Depot — $800–$2,200 por 6–8 pies lineales:</strong> Lo más rentable. Frentes Shaker blanco u oak, cierre suave, almacena detergente + ropa de cama.</li>
<li><strong>Custom melamina + puertas laminadas — $1,800–$4,500:</strong> Talleres locales de Vancouver (Kelowna Wood, Fraser Valley Cabinets) construyen a las dimensiones exactas para closets estrechos.</li>
<li><strong>Madera maciza / Shaker custom — $3,500–$7,500:</strong> Hace juego con gabinetes de cocina en lavanderías de planta principal.</li>
<li><strong>Mostrador de cuarzo (4–6 ft) — $600–$1,400:</strong> Estación de doblado encima de las lavadoras frontales. Caesarstone blanco o gris es la spec más común.</li>
<li><strong>Butcher block (oak, maple) — $300–$800:</strong> Look más cálido, requiere aceite anual.</li>
<li><strong>Fregadero de servicio (single-bowl acero inoxidable 16–22") — $200–$700 fixture, más grifería $150–$500:</strong> Crítico para lavar a mano y estaciones de baño de mascotas.</li>
</ul>

<h3>6. Pisos ($800 – $3,500)</h3>
<p>El piso del cuarto de lavado aguanta abuso de agua. Especificamos por nivel:</p>
<ul>
<li><strong>Vinilo en hoja / LVT — $4–$8 por sq ft instalado:</strong> Opción impermeable más barata. Fácil de reemplazar.</li>
<li><strong>Tile de porcelana — $9–$15 por sq ft instalado:</strong> Mejor a largo plazo. Sobrevive fugas, look interior/exterior compatible con necesidades de mudroom.</li>
<li><strong>Piso radiante eléctrico (mat) — agregar $7–$12 por sq ft:</strong> Popular para lavanderías de sótano donde el piso descansa sobre concreto.</li>
</ul>

<h2>Las tres configuraciones en detalle</h2>

<h3>Configuración 1: Cambio de stackable en closet existente ($1,800–$3,500)</h3>
<p>Manteniendo los electrodomésticos en el mismo closet, reemplazándolos igual por igual. Es el trabajo más común en condos de Vancouver. Alcance:</p>
<ul>
<li>Desconectar las unidades viejas, desechar (cargo de desecho $200 vía Encorp)</li>
<li>Instalar nueva caja empotrada para lavadora si la vieja está corroída ($300 mano de obra plomería + $80 caja)</li>
<li>Instalar cordón de secadora 4-pin si el electrodoméstico viene con 3-pin (cordón $30 + 15 min mano de obra)</li>
<li>Conectar líneas de suministro, probar fugas bajo presión completa</li>
<li>Reconectar ventilación de secadora (o reemplazar si el ducting es plástico flexible — violación al código)</li>
<li>Nivelar las unidades y balancear el tambor de la lavadora</li>
</ul>
<p>Ejemplo real Reno Stars: <strong>condo en Richmond, cambio de stackable LG</strong> — LG WashTower de $2,100 suministrado por el dueño, nuestra mano de obra $850 (4 hrs plomería + eléctrico + ventilación), 1 día.</p>

<h3>Configuración 2: Renovación del closet de lavandería ($4,500–$8,500)</h3>
<p>Misma ubicación pero agregando gabinetes arriba, un mostrador de cuarzo encima de las frontales, piso nuevo, pintura fresca y un rough-in apropiado y conforme al código. Alcance:</p>
<ul>
<li>Sacar electrodomésticos viejos + drywall</li>
<li>Reemplazar líneas de suministro galvanizadas con PEX, instalar trampa de 2" y standpipe apropiados</li>
<li>Nuevo tomacorriente de 240V para secadora si aún no es 4-pin</li>
<li>Piso de tablilla de vinilo o LVT debajo de los electrodomésticos</li>
<li>Construir gabinetes superiores de 30" de profundidad (o un stack de tres estantes abiertos)</li>
<li>Remanente de cuarzo (4 ft × 24" de profundidad) encima de side-by-side o sobre stackable</li>
<li>Estructurar ventilación de secadora a través de pared exterior con ducto rígido de metal</li>
<li>Repintar, instalar moldura nueva, instalar puertas plegables o de granero nuevas en la abertura del closet</li>
</ul>
<p>Ejemplo real: <strong>townhouse de Coquitlam, closet de pasillo</strong>, Samsung side-by-side de gama media ($2,200), gabinetes IKEA SEKTION blancos ($1,400), remanente de cuarzo ($550), LVT ($300), mano de obra $3,800 = $8,250 total. 4 días.</p>

<h3>Configuración 3: Cuarto de lavado dedicado ($9,000–$18,000)</h3>
<p>Construir un cuarto de lavado real desde un espacio utility de sótano, mudroom, o área debajo de la escalera. Alcance:</p>
<ul>
<li>Estructurar paredes (si convirtiendo espacio utility abierto)</li>
<li>Rough-in de plomería: suministro caliente/frío, standpipe de 2" + trampa, derivación de drenaje para fregadero de servicio</li>
<li>Eléctrico: secadora dedicada 30A/240V, lavadora 20A, receptáculos GFCI, circuito de iluminación + extractor</li>
<li>Aislamiento (R-12 mínimo en paredes exteriores; battings acústicos en paredes compartidas con dormitorios)</li>
<li>Drywall + skim coat + pintura</li>
<li>Piso de tile de porcelana con mat de calor opcional</li>
<li>Gabinetes custom (8–12 pies lineales) con top de cuarzo</li>
<li>Fregadero de servicio de acero inoxidable con grifo de monomando</li>
<li>Repisa abierta para colgar prendas delicadas + escondite de tabla de planchar</li>
<li>Electrodomésticos side-by-side o stackable de tamaño completo</li>
</ul>
<p>Ejemplo real: <strong>renovación de sótano del lado este de Vancouver</strong>, cuarto de lavado dedicado con fregadero de servicio + 12 ft de gabinetes + tile de porcelana radiante + LG side-by-side. Total $14,800 a lo largo de 3 semanas. Parte de un proyecto más amplio de suite de sótano de nuestra <a href="/es/blog/basement-renovation-vancouver-complete-guide/">guía completa de renovación de sótano en Vancouver</a>.</p>

<h2>Donde los dueños de Vancouver gastan de más</h2>
<ol>
<li><strong>Comprar stackables premium de 24" cuando 27" entra.</strong> Los pares Bosch y Miele de 24" cuestan $4,000+ y sirven a un closet apretado de condo. Si tu closet es de 28" de ancho o más, un par LG de 27" de $1,800 da más capacidad por menos de la mitad del costo. Mide dos veces antes de especificar compacto.</li>
<li><strong>Especificar secadora de gas cuando la eléctrica está bien.</strong> La instalación de línea de gas en un cuarto de lavado de sótano puede agregar $1,500–$3,500 y requiere permisos. Las secadoras eléctricas calientan ligeramente más despacio pero no cuestan extra cuando la casa ya está cableada para una. Las secadoras eléctricas de bomba de calor en realidad usan menos energía que las de gas a largo plazo.</li>
<li><strong>Saltarse la caja empotrada para lavadora.</strong> Una caja de $80 detrás de la pared (con martillos amortiguadores apropiados, válvulas de bola y un cierre de palanca única) previene el 90% de las fugas de lavandería. Instalar esto durante la renovación es $300 de mano de obra vs $4,000–$15,000 de reparación de daños por agua después de que revienta una manguera.</li>
<li><strong>Enrutar la ventilación de la secadora a través del techo cuando una de pared funciona.</strong> La ventilación al techo agrega $800–$1,500 y crea más puntos de trampa para pelusa. La ventilación lateral es más barata, más fácil de limpiar y aprobada por el código. Solo elige ventilación al techo cuando no haya camino por pared exterior dentro de 7.6 m.</li>
<li><strong>Olvidarse del aislamiento acústico en paredes compartidas.</strong> Una lavadora en ciclo de centrifugado tiene 75 dB+ a 1 m. Si la lavandería comparte pared con un dormitorio, $400 de battings acústicos + canal resiliente durante el estructurado hace la diferencia entre "escuchar cada ciclo" y "no me di cuenta de que pusiste una carga". Crítico para suites de sótano.</li>
</ol>

<h2>Costos recientes de proyectos en Vancouver (datos reales de Reno Stars)</h2>
<ul>
<li><strong>Cambio de stackable en condo de Richmond:</strong> $2,950 instalado (LG WashTower $2,100 suministrado por el dueño, mano de obra 4 hrs $850). Closet existente, sin cambios de plomería/eléctrico. <a href="/es/blog/condo-vs-house-renovation-cost-vancouver/">Contexto de renovación de condo</a>.</li>
<li><strong>Refresco de closet de pasillo en townhouse de Coquitlam:</strong> $8,250 (par Samsung $2,200, IKEA SEKTION $1,400, remanente de cuarzo $550, LVT $300, mano de obra $3,800). 4 días.</li>
<li><strong>Renovación integral en Burnaby, construcción de lavandería de sótano:</strong> $11,400 de un proyecto total de $30K–$35K (reno Custom Kitchen Wood Veins). Incluyó nuevo standpipe de 2", circuito de 240V, gabinetes IKEA, piso de tablilla de vinilo, side-by-side LG.</li>
<li><strong>Suite de sótano del lado este de Vancouver, cuarto de lavado dedicado con fregadero de servicio:</strong> $14,800 (gabinetes custom $4,500, tile de porcelana radiante $2,200, rough-in de plomería $2,800, eléctrico $1,800, electrodomésticos side-by-side $2,400, drywall + pintura $1,100). 3 semanas. Parte de una suite de sótano según nuestra <a href="/es/blog/basement-suite-renovation-cost-vancouver/">guía de costo de renovación de suite de sótano</a>.</li>
<li><strong>Mudroom + lavandería combinados en West Vancouver:</strong> $19,500 (banca de millwork custom + lockers + gabinetes de lavandería $9,500, tile de porcelana $1,800, plomería $2,400, eléctrico $1,200, pintura + acabado $1,400, electrodomésticos $3,200). 5 semanas.</li>
</ul>

<h2>Permisos y reglas de strata</h2>

<h3>Permisos en Ciudad de Vancouver / Surrey / Burnaby</h3>
<p>Los cambios de electrodomésticos igual por igual no requieren permisos. Lo siguiente requiere permiso de construcción:</p>
<ul>
<li>Agregar una nueva lavandería donde no había (rough-in de drenaje + suministro)</li>
<li>Reubicar una lavandería a un cuarto diferente</li>
<li>Agregar un fregadero de servicio (trabajo de drenaje + suministro)</li>
<li>Nuevos circuitos de 240V o 30A (permiso eléctrico, separado del permiso de construcción)</li>
<li>Cortar una nueva ventilación de secadora a través de pared exterior</li>
</ul>
<p>Los costos de permisos en Metro Vancouver van de $250–$700 para una construcción básica de lavandería. Un contratista licenciado tramita estos e incluye el tiempo en la cotización.</p>

<h3>Reglas de strata de condo</h3>
<p>La mayoría de stratas de condos de Vancouver tienen reglas específicas para lavandería:</p>
<ul>
<li>Sin cambios de electrodomésticos sin aprobación de strata (algunas prohíben la reubicación de lavadora/secadora por completo)</li>
<li>El trabajo de plomería requiere notificación al gerente del edificio con 48 hrs de anticipación</li>
<li>Bandeja de fugas obligatoria debajo de la lavadora (no instalar = responsabilidad ilimitada para el dueño de la unidad)</li>
<li>Las horas de silencio a menudo restringen el uso de lavandería (típicamente 10 PM – 7 AM)</li>
<li>Limpieza de stack requerida cada 5–10 años; algunos edificios cobran a los dueños de unidades</li>
</ul>
<p>Siempre solicita los bylaws de strata + Form B antes de firmar un contrato de renovación que toque la plomería de lavandería.</p>

<h2>Expectativas de tiempo</h2>
<ul>
<li><strong>Cambio de stackable:</strong> 1 día en sitio, 1–2 días de plazo en el pedido de electrodomésticos</li>
<li><strong>Refresco de closet con gabinetes nuevos:</strong> 3–5 días en sitio, 2–3 semanas proyecto total (pedido de gabinetes + rough-in + acabado)</li>
<li><strong>Expansión a side-by-side de closet:</strong> 1–2 semanas en sitio (cambio de estructura), 4–6 semanas total</li>
<li><strong>Construcción de cuarto de lavado dedicado:</strong> 2–4 semanas en sitio, 6–10 semanas total (permiso + gabinetes + tile + acabado)</li>
<li><strong>Lavandería + mudroom combinados:</strong> 3–5 semanas en sitio, 8–12 semanas total</li>
</ul>

<h2>Preguntas frecuentes</h2>

<h3>¿Puedo instalar una lavadora en un closet de condo de Vancouver que no tiene conexiones?</h3>
<p>A veces. Posible si hay una pared de plomería dentro de 3–4 m y la strata aprueba. Costo: $2,500–$6,000 en rough-in de plomería, más el electrodoméstico en sí. Las secadoras de bomba de calor sin ventilación resuelven el problema de ventilación en condos con losa de concreto. La aprobación de strata es el factor decisivo — revisa Form B y bylaws primero.</p>

<h3>¿Stackable o side-by-side?</h3>
<p>El stackable ahorra ancho de piso (27" vs 54" para side-by-side). El side-by-side es más fácil de cargar, da espacio de mostrador encima y es ~$200 más barato que un stackable equivalente. Si tienes 54"+ de pared y una superficie de doblado importa, ve por side-by-side. Si el espacio es apretado o es un closet de pasillo, ve por stackable.</p>

<h3>¿Las secadoras de bomba de calor valen el sobrecosto?</h3>
<p>Sí para condos y lavanderías de sótano sin camino fácil de ventilación. Sí para aplicaciones sensibles al fuego. Las secadoras de bomba de calor funcionan más frescas, usan 50% menos energía y no requieren ducto exterior. Concesiones: ciclos de 60–90 min vs 30–45 min para ventiladas, y costo inicial ligeramente mayor ($800–$1,500 más que ventiladas). A veces aplican rebates de BC Hydro de $200–$400.</p>

<h3>¿Cuánto cuesta agregar un fregadero de servicio durante una renovación de lavandería?</h3>
<p>Típico $900–$2,500: $200–$700 por el fregadero, $150–$500 por la grifería, $700–$1,800 por mano de obra de plomería (derivación de drenaje + rough-in caliente/frío + conexión). Fácil de agregar cuando las paredes están abiertas durante una renovación. Difícil y caro ($3K+) agregar después si la pared está cerrada.</p>

<h3>¿Puede la secadora compartir ventilación con el extractor de cocina o el ventilador del baño?</h3>
<p>No. El BC Building Code requiere una ventilación dedicada para la secadora. Compartir crea acumulación de pelusa en los ductos del ventilador y crea riesgo de incendio. Siempre haz rough-in de un camino de ventilación de secadora separado durante la construcción.</p>

<h3>¿Vale la pena un piso radiante en el cuarto de lavado?</h3>
<p>Para lavandería de sótano sobre losa de concreto: sí — agrega $700–$1,500 y mejora dramáticamente el confort durante todo el año. Para lavandería de planta principal con estructura de madera: usualmente no — el piso se mantiene a temperatura ambiente. El mat de calor consume aproximadamente la misma energía que un foco de 60W con termostato, así que el costo operativo es mínimo.</p>

<h3>¿Cuánto dura un cuarto de lavado renovado?</h3>
<p>Electrodomésticos: 10–15 años para secadoras ventiladas, 8–12 para stackables, 12–18 para pares europeos compactos. Gabinetes, mostrador y piso de tile: 20–30 años si las specs coinciden con el uso. Rough-in de plomería y eléctrico: vida útil si se instala según el código actual con líneas PEX.</p>

<h2>Planeando tu presupuesto de lavandería</h2>
<ol>
<li><strong>Elige primero tu nivel de configuración (cambio de closet / refresco de closet / cuarto dedicado / combo).</strong> Cada nivel tiene requisitos de mano de obra aguas abajo muy diferentes.</li>
<li><strong>Confirma que tu panel tiene espacio para nuevos circuitos antes de especificar electrodomésticos premium.</strong> Un panel lleno = trabajo de subpanel de $2,000+ antes de poder instalar una secadora de 30A.</li>
<li><strong>Mide las dimensiones interiores del closet, no la abertura de la puerta.</strong> Un stackable de 27" necesita 28" mínimo de ancho interior; un compacto de 24" necesita 25"+. Los stackables también necesitan 2" de profundidad de holgura para mangueras detrás.</li>
<li><strong>Planea el camino de ventilación antes de pedir la secadora.</strong> La bomba de calor sin ventilación resuelve situaciones imposibles de ventilación pero agrega $1,200–$2,500 al costo del electrodoméstico.</li>
<li><strong>Reserva $500–$1,000 para sorpresas de plomería.</strong> Las casas de Vancouver previas a 1990 rutinariamente descubren suministro galvanizado viejo, trampas subdimensionadas o standpipes podridos durante el demo.</li>
</ol>

<h2>Guías de costo relacionadas</h2>
<ul>
<li><a href="/es/guides/basement-renovation-cost-vancouver/">Costo de Renovación de Sótano Vancouver</a> — la mayoría de cuartos de lavado viven en sótanos; esta es la guía padre</li>
<li><a href="/es/blog/basement-suite-renovation-cost-vancouver/">Costo de Renovación de Suite de Sótano Vancouver</a> — el rough-in de lavandería es central para la legalización de la suite</li>
<li><a href="/es/blog/condo-vs-house-renovation-cost-vancouver/">Costo Condo vs Casa Renovación Vancouver</a> — diferentes restricciones de lavandería en cada tipo de vivienda</li>
<li><a href="/es/blog/renovation-permits-bc-guide/">Guía de Permisos de Renovación BC</a> — cuándo el trabajo de lavandería necesita permiso</li>
<li><a href="/es/services/basement/">Servicios de Renovación de Sótano</a> — qué entregamos y cómo trabajamos</li>
</ul>

<p>¿Quieres una cotización real para tu cuarto de lavado? Envíanos fotos del espacio actual y lo que estás considerando, y te respondemos con tres opciones por niveles dentro de 48 horas. <a href="/es/contact/">Consulta gratuita en casa</a>.</p>
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
    14,
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
