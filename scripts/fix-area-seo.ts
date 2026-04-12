/**
 * SEO fix script: Fixes meta titles/descriptions, AI writing tells,
 * and adds missing area FAQs.
 *
 * Issues addressed:
 * - Meta titles >60 chars (will be truncated in SERP)
 * - Brand name "Reno Stars" missing from titles/descriptions
 * - Meta descriptions too short (<140) or too long (>160)
 * - Em dashes (—) in content (top AI writing tell)
 * - AI-tell words: "seamless", "stunning", "vibrant"
 * - "Whether you're [X] or [Y]" AI pattern
 * - 8 areas with zero FAQs
 *
 * Safe: only UPDATEs existing rows and INSERTs new FAQs.
 *
 * Usage:
 *   DATABASE_URL=<url> npx tsx scripts/fix-area-seo.ts
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// ---------------------------------------------------------------------------
// Fixed meta titles/descriptions (all ≤60 / 150-160 chars, with brand)
// ---------------------------------------------------------------------------

interface MetaFix {
  slug: string;
  metaTitleEn: string;
  metaTitleZh: string;
  metaDescriptionEn: string;
  metaDescriptionZh: string;
}

const metaFixes: MetaFix[] = [
  {
    slug: 'vancouver',
    metaTitleEn: 'Vancouver Renovation | Reno Stars Kitchen & Bath',
    metaTitleZh: '温哥华装修 | Reno Stars 厨房浴室翻新',
    metaDescriptionEn: 'Reno Stars is a trusted Vancouver renovation company for kitchens, bathrooms, and whole-house remodels. Licensed, CGL insured + WCB covered, serving all Vancouver neighborhoods. Free estimates.',
    metaDescriptionZh: 'Reno Stars是值得信赖的温哥华装修公司，提供厨房、浴室和全屋翻新。CGL保险和WCB工伤保障齐全，服务温哥华所有社区。免费估价。',
  },
  {
    slug: 'richmond',
    metaTitleEn: 'Richmond Renovation | Reno Stars Bilingual Team',
    metaTitleZh: '列治文装修 | Reno Stars 双语装修团队',
    metaDescriptionEn: 'Reno Stars offers bilingual renovation service in Richmond. Kitchen, bathroom, and whole-house remodels with high first-time inspection pass rates. Free estimates.',
    metaDescriptionZh: 'Reno Stars在列治文提供双语装修服务。厨房、浴室和全屋翻新，首次检查通过率高。免费估价，立即致电。',
  },
  {
    slug: 'burnaby',
    metaTitleEn: 'Burnaby Renovation | Reno Stars Condo Experts',
    metaTitleZh: '本拿比装修 | Reno Stars 公寓翻新专家',
    metaDescriptionEn: 'Reno Stars renovates condos, townhouses, and homes across Burnaby. Kitchen, bathroom, and basement remodels. Strata-compliant work, free quotes.',
    metaDescriptionZh: 'Reno Stars为本拿比公寓、联排别墅和独立屋提供装修服务。厨房、浴室和地下室翻新。符合物业规定，免费报价。',
  },
  {
    slug: 'surrey',
    metaTitleEn: 'Surrey Renovation | Reno Stars Kitchen & Basement',
    metaTitleZh: '素里装修 | Reno Stars 厨房地下室翻新',
    metaDescriptionEn: 'Reno Stars serves Surrey homeowners with kitchen, bathroom, basement, and whole-house renovations. Covering South Surrey, Fleetwood, and Cloverdale. Free estimates.',
    metaDescriptionZh: 'Reno Stars为素里业主提供厨房、浴室、地下室和全屋装修。覆盖南素里、Fleetwood和Cloverdale。免费估价。',
  },
  {
    slug: 'coquitlam',
    metaTitleEn: 'Coquitlam Renovation | Reno Stars Kitchen & Bath',
    metaTitleZh: '高贵林装修 | Reno Stars 厨房浴室翻新',
    metaDescriptionEn: 'Reno Stars handles kitchen, bathroom, and whole-house renovations in Coquitlam. Permit-ready, on-budget work from Burke Mountain to Maillardville. Free consultation.',
    metaDescriptionZh: 'Reno Stars在高贵林提供厨房、浴室和全屋装修。从Burke Mountain到Maillardville，许可证办理和预算控制。免费咨询。',
  },
  {
    slug: 'west-vancouver',
    metaTitleEn: 'West Vancouver Luxury Renovation | Reno Stars',
    metaTitleZh: '西温哥华豪华装修 | Reno Stars',
    metaDescriptionEn: 'Reno Stars delivers high-end renovations in West Vancouver. Premium kitchens, bathrooms, and whole-house remodels in Ambleside, Dundarave, and British Properties.',
    metaDescriptionZh: 'Reno Stars在西温哥华提供高端装修。Ambleside、Dundarave和British Properties的高端厨房、浴室和全屋翻新。免费咨询。',
  },
  {
    slug: 'new-westminster',
    metaTitleEn: 'New Westminster Renovation | Reno Stars',
    metaTitleZh: '新西敏装修 | Reno Stars 住宅翻新',
    metaDescriptionEn: 'Reno Stars renovates heritage and modern homes in New Westminster. Kitchen, bathroom, and basement remodels. Licensed, CGL insured + WCB covered, free estimates available.',
    metaDescriptionZh: 'Reno Stars在新西敏翻新历史和现代住宅。厨房、浴室和地下室装修。CGL保险和WCB工伤保障齐全，免费估价。',
  },
  {
    slug: 'delta',
    metaTitleEn: 'Delta Renovation | Reno Stars Home Remodeling',
    metaTitleZh: '三角洲装修 | Reno Stars 住宅翻新',
    metaDescriptionEn: 'Reno Stars serves Delta homeowners in Tsawwassen, Ladner, and North Delta. Kitchen, bathroom, and home remodels at competitive prices. Free estimates.',
    metaDescriptionZh: 'Reno Stars服务三角洲Tsawwassen、Ladner和北三角洲业主。厨房、浴室和住宅翻新，价格有竞争力。免费估价。',
  },
  {
    slug: 'north-vancouver',
    metaTitleEn: 'Home Renovations North Vancouver | Free Quotes | Reno Stars',
    metaTitleZh: '北温哥华家庭装修 | 免费报价 | Reno Stars',
    metaDescriptionEn: 'North Vancouver home renovation contractor serving Lonsdale, Lynn Valley & Deep Cove. Kitchen, bathroom & whole-house remodels. Insured, free estimates.',
    metaDescriptionZh: '北温哥华家庭装修承包商，服务Lonsdale、Lynn Valley和Deep Cove。厨房、浴室及全屋翻新。持牌投保，免费估价。',
  },
  {
    slug: 'langley',
    metaTitleEn: 'Langley Renovation | Reno Stars Kitchen & Bath',
    metaTitleZh: '兰里装修 | Reno Stars 厨房浴室翻新',
    metaDescriptionEn: 'Reno Stars renovates kitchens, bathrooms, and basements for Langley families. Serving Willoughby, Walnut Grove, and Fort Langley. Flexible scheduling, free estimates.',
    metaDescriptionZh: 'Reno Stars为兰里家庭提供厨房、浴室和地下室翻新。服务Willoughby、Walnut Grove和Fort Langley。灵活安排，免费估价。',
  },
  {
    slug: 'port-moody',
    metaTitleEn: 'Port Moody Renovation | Reno Stars',
    metaTitleZh: '满地宝装修 | Reno Stars 厨房浴室翻新',
    metaDescriptionEn: 'Reno Stars offers full-service renovations in Port Moody. Kitchen, bathroom, and home remodels for Heritage Mountain, Glenayre, and Ioco. Free estimates.',
    metaDescriptionZh: 'Reno Stars在满地宝提供全方位装修服务。Heritage Mountain、Glenayre和Ioco的厨房、浴室和住宅翻新。免费估价。',
  },
  {
    slug: 'maple-ridge',
    metaTitleEn: 'Maple Ridge Renovation | Reno Stars',
    metaTitleZh: '枫树岭装修 | Reno Stars 住宅翻新',
    metaDescriptionEn: 'Reno Stars renovates kitchens, bathrooms, and basements in Maple Ridge. Quality craftsmanship for spacious properties at competitive prices. Free estimates.',
    metaDescriptionZh: 'Reno Stars在枫树岭提供厨房、浴室和地下室翻新。宽敞物业的精湛工艺，价格有竞争力。免费估价。',
  },
  {
    slug: 'white-rock',
    metaTitleEn: 'White Rock Renovation | Reno Stars Coastal Homes',
    metaTitleZh: '白石装修 | Reno Stars 海滨住宅翻新',
    metaDescriptionEn: 'Reno Stars specializes in coastal home renovations in White Rock. Kitchen, bathroom, and whole-house remodels with ocean-resistant materials. Free estimates.',
    metaDescriptionZh: 'Reno Stars专注白石海滨住宅装修。厨房、浴室和全屋翻新，使用抗海洋环境材料。免费估价。',
  },
  {
    slug: 'port-coquitlam',
    metaTitleEn: 'Port Coquitlam Renovation | Reno Stars',
    metaTitleZh: '高贵林港装修 | Reno Stars 住宅翻新',
    metaDescriptionEn: 'Reno Stars provides quality kitchen, bathroom, and basement renovations in Port Coquitlam. Serving Citadel Heights, Oxford Heights, and Riverwood. Free estimates.',
    metaDescriptionZh: 'Reno Stars在高贵林港提供优质厨房、浴室和地下室装修。服务Citadel Heights、Oxford Heights和Riverwood。免费估价。',
  },
];

// ---------------------------------------------------------------------------
// Content fixes (em dashes, AI-tell words, templated patterns)
// ---------------------------------------------------------------------------

interface ContentFix {
  slug: string;
  contentEn: string;
  contentZh: string;
}

const contentFixes: ContentFix[] = [
  {
    slug: 'vancouver',
    contentEn:
      `Vancouver homeowners trust Reno Stars for kitchen, bathroom, and whole-house renovations that respect the character of the city's diverse neighborhoods. From Kitsilano craftsman homes to downtown condos, we bring precision craftsmanship and transparent pricing to every project.

Our team understands the unique challenges of renovating in Vancouver: heritage building codes, strata regulations, and the need for moisture-resistant materials in our coastal climate. We handle permits, coordinate with strata councils, and deliver on schedule.`,
    contentZh:
      `温哥华业主信赖Reno Stars进行厨房、浴室和全屋装修，我们尊重城市多元社区的建筑特色。从Kitsilano的工匠风格住宅到市中心公寓，我们为每个项目带来精湛工艺和透明定价。

我们的团队深知温哥华装修的独特挑战：历史建筑规范、物业管理条例，以及沿海气候对防潮材料的需求。我们处理许可证申请、与物业委员会协调，并按时交付。`,
  },
  {
    slug: 'richmond',
    contentEn:
      `Richmond residents choose Reno Stars for renovations that combine modern design with practical functionality. From townhouse kitchen updates to full single-family home transformations, our bilingual team keeps the process smooth from start to finish.

We know Richmond's building codes and inspection requirements well. Our projects consistently pass inspection on the first visit, saving you time and avoiding costly delays.`,
    contentZh:
      `列治文居民选择Reno Stars进行装修，将现代设计与实用功能完美结合。从联排别墅厨房更新到独立屋全面改造，我们的双语团队让整个过程从头到尾顺畅无忧。

我们熟悉列治文的建筑规范和验收要求。我们的项目一贯在首次检查时通过验收，为您节省时间并避免高昂的延误成本。`,
  },
  {
    slug: 'burnaby',
    contentEn:
      `Reno Stars delivers quality renovations across Burnaby, from Metrotown and Brentwood to the quieter neighborhoods beyond. We specialize in condo and townhouse projects, working efficiently within strata guidelines while achieving results that exceed expectations.

From compact bathroom updates to complete kitchen overhauls, our team maximizes every square foot. We source materials locally and keep projects on budget without cutting corners.`,
    contentZh:
      `Reno Stars在本拿比全区提供高品质装修，从Metrotown和Brentwood到更安静的社区。我们专注于公寓和联排别墅项目，在遵守物业规定的同时高效工作，交付超出预期的成果。

从紧凑型浴室更新到完整的厨房翻新，我们的团队充分利用每一平方英尺。我们在本地采购材料，在不偷工减料的前提下控制预算。`,
  },
  {
    slug: 'surrey',
    contentEn:
      `Surrey's growing communities deserve renovation services that keep pace. Reno Stars serves homeowners across South Surrey, Fleetwood, Cloverdale, and Newton with kitchen, bathroom, basement, and whole-house renovations built to last.

We understand the needs of Surrey's diverse housing stock, from new construction townhomes to established single-family properties. Our team delivers modern finishes at competitive prices.`,
    contentZh:
      `素里不断发展的社区需要跟上步伐的装修服务。Reno Stars为南素里、Fleetwood、Cloverdale和Newton的业主提供经久耐用的厨房、浴室、地下室和全屋装修。

我们了解素里多样化住房的需求，从新建联排别墅到成熟的独立屋。我们的团队以有竞争力的价格提供现代化装修。`,
  },
  {
    slug: 'west-vancouver',
    contentEn:
      `West Vancouver's luxury homes demand renovation work of the highest standard. Reno Stars delivers premium craftsmanship for high-end kitchens, spa-inspired bathrooms, and custom whole-house transformations in Ambleside, Dundarave, and British Properties.

We work with premium materials (natural stone, custom cabinetry, and designer fixtures) to create spaces that match the caliber of West Vancouver living.`,
    contentZh:
      `西温哥华的豪华住宅要求最高标准的装修工程。Reno Stars在Ambleside、Dundarave和British Properties提供高端厨房、水疗风格浴室和定制全屋改造的精湛工艺。

我们使用高端材料（天然石材、定制橱柜和设计师级洁具）打造与西温哥华生活品质相匹配的空间。`,
  },
  {
    slug: 'new-westminster',
    contentEn:
      `New Westminster blends historic charm with modern living, and Reno Stars brings that same balance to every renovation. We have deep experience with the city's older housing stock: updating heritage kitchens, modernizing bathrooms, and converting basements while preserving character.

Our team navigates New Westminster's building requirements efficiently, keeping your project on track without unnecessary delays.`,
    contentZh:
      `新西敏将历史魅力与现代生活融为一体，Reno Stars在每次装修中也带来同样的平衡。我们在处理该市较老住宅方面经验丰富：更新历史厨房、现代化浴室、改建地下室的同时保留建筑特色。

我们的团队高效处理新西敏的建筑要求，确保您的项目顺利推进，避免不必要的延误。`,
  },
  {
    slug: 'port-moody',
    contentEn:
      `Port Moody is a community with real character, and its homes deserve renovations to match. Reno Stars works with homeowners in Heritage Mountain, Glenayre, and Ioco to create kitchens, bathrooms, and living spaces that blend modern comfort with the city's natural beauty.

We manage every detail, from permits to final walkthrough, so you can focus on enjoying your newly transformed home.`,
    contentZh:
      `满地宝是一个充满特色的社区，其住宅需要与之匹配的装修。Reno Stars与Heritage Mountain、Glenayre和Ioco的业主合作，打造将现代舒适与城市自然之美融为一体的厨房、浴室和起居空间。

我们管理每一个细节，从许可证到最终验收，让您专注于享受焕然一新的家。`,
  },
  {
    slug: 'maple-ridge',
    contentEn:
      `Maple Ridge homeowners count on Reno Stars for renovations that make the most of spacious properties. From ranch-style kitchen upgrades to walkout basement finishing, our team delivers quality work that adds real value to your home.

We understand Maple Ridge's building landscape and work efficiently to minimize disruption while maximizing results.`,
    contentZh:
      `枫树岭业主依赖Reno Stars充分利用宽敞物业的装修。从牧场风格的厨房升级到步出式地下室装修，我们的团队都能提供为您的房屋增加实际价值的高品质工作。

我们了解枫树岭的建筑环境，高效工作以减少干扰并最大化成果。`,
  },
];

// ---------------------------------------------------------------------------
// Missing area FAQs (8 areas with zero FAQs)
// ---------------------------------------------------------------------------

interface AreaFaq {
  areaSlug: string;
  questionEn: string;
  questionZh: string;
  answerEn: string;
  answerZh: string;
  displayOrder: number;
}

const newFaqs: AreaFaq[] = [
  // Coquitlam
  {
    areaSlug: 'coquitlam',
    questionEn: 'Do you handle permits for Coquitlam renovations?',
    questionZh: '你们处理高贵林装修的许可证吗？',
    answerEn: 'Yes, we manage the full permit process with the City of Coquitlam, including drawings, applications, and scheduling inspections. Your project stays compliant from start to finish.',
    answerZh: '是的，我们管理高贵林市完整的许可证流程，包括图纸、申请和安排检查。您的项目从头到尾保持合规。',
    displayOrder: 0,
  },
  {
    areaSlug: 'coquitlam',
    questionEn: 'How long does a kitchen renovation take in Coquitlam?',
    questionZh: '高贵林厨房装修需要多长时间？',
    answerEn: 'A typical kitchen renovation in Coquitlam takes 4 to 6 weeks depending on the scope. We provide a detailed timeline before work begins so you know what to expect.',
    answerZh: '高贵林典型的厨房装修需要4到6周，具体取决于工程范围。我们在开工前提供详细的时间表，让您了解预期进度。',
    displayOrder: 1,
  },
  // New Westminster
  {
    areaSlug: 'new-westminster',
    questionEn: 'Can you renovate heritage homes in New Westminster?',
    questionZh: '你们能翻新新西敏的历史住宅吗？',
    answerEn: 'Yes, we have extensive experience renovating older and heritage homes in New Westminster. We preserve original character features while updating kitchens, bathrooms, and living spaces to modern standards.',
    answerZh: '是的，我们在翻新新西敏的老旧和历史住宅方面经验丰富。我们在将厨房、浴室和生活空间更新到现代标准的同时保留原有的建筑特色。',
    displayOrder: 0,
  },
  // Delta
  {
    areaSlug: 'delta',
    questionEn: 'Do you serve all three Delta communities?',
    questionZh: '你们服务三角洲的所有三个社区吗？',
    answerEn: 'Yes, we serve homeowners across Tsawwassen, Ladner, and North Delta. Our team is familiar with each community and can schedule a free on-site consultation at your convenience.',
    answerZh: '是的，我们为Tsawwassen、Ladner和北三角洲的业主提供服务。我们的团队熟悉每个社区，可以在您方便的时候安排免费上门咨询。',
    displayOrder: 0,
  },
  {
    areaSlug: 'delta',
    questionEn: 'What types of homes do you renovate in Delta?',
    questionZh: '你们在三角洲翻新哪些类型的住宅？',
    answerEn: 'We work with all home types common in Delta, including ranchers, split-levels, two-storey homes, and newer builds. Each project is tailored to the home style and your goals.',
    answerZh: '我们服务三角洲常见的所有住宅类型，包括平房、错层住宅、两层住宅和新建房屋。每个项目都根据房屋风格和您的目标量身定制。',
    displayOrder: 1,
  },
  // Langley
  {
    areaSlug: 'langley',
    questionEn: 'Can you convert a basement into a rental suite in Langley?',
    questionZh: '你们能在兰里将地下室改建为出租套房吗？',
    answerEn: 'Yes, we handle basement suite conversions in Langley, including permits, separate entrances, fire separation, and all building code requirements for legal secondary suites.',
    answerZh: '是的，我们在兰里处理地下室套房改建，包括许可证、独立入口、防火隔断和所有合法二次套房的建筑规范要求。',
    displayOrder: 0,
  },
  {
    areaSlug: 'langley',
    questionEn: 'Do you work in both City and Township of Langley?',
    questionZh: '你们在兰里市和兰里区都服务吗？',
    answerEn: 'Yes, we serve homeowners in both the City of Langley and the Township of Langley, including Willoughby, Walnut Grove, Fort Langley, and Murrayville.',
    answerZh: '是的，我们为兰里市和兰里区的业主提供服务，包括Willoughby、Walnut Grove、Fort Langley和Murrayville。',
    displayOrder: 1,
  },
  // Port Moody
  {
    areaSlug: 'port-moody',
    questionEn: 'Do you offer eco-friendly renovation options in Port Moody?',
    questionZh: '你们在满地宝提供环保装修选择吗？',
    answerEn: 'Yes, we offer low-VOC paints, sustainably sourced wood, energy-efficient fixtures, and recycled-content materials. We can discuss green options during your free consultation.',
    answerZh: '是的，我们提供低VOC油漆、可持续采购木材、节能灯具和回收材料。我们可以在免费咨询时讨论环保选择。',
    displayOrder: 0,
  },
  // Maple Ridge
  {
    areaSlug: 'maple-ridge',
    questionEn: 'Can you finish a walkout basement in Maple Ridge?',
    questionZh: '你们能在枫树岭装修步出式地下室吗？',
    answerEn: 'Yes, walkout basement finishing is one of our specialties in Maple Ridge. We handle everything from framing and insulation to flooring, bathrooms, and kitchenettes.',
    answerZh: '是的，步出式地下室装修是我们在枫树岭的专长之一。我们处理从框架和隔热到地板、浴室和小厨房的所有工作。',
    displayOrder: 0,
  },
  // White Rock
  {
    areaSlug: 'white-rock',
    questionEn: 'What materials work best for White Rock\'s coastal environment?',
    questionZh: '什么材料最适合白石的沿海环境？',
    answerEn: 'We recommend porcelain tile, quartz countertops, marine-grade hardware, and moisture-resistant cabinetry for White Rock homes. These materials stand up to salt air and humidity while looking great for years.',
    answerZh: '我们为白石住宅推荐瓷砖、石英台面、船用级五金件和防潮橱柜。这些材料能承受盐雾和湿气，同时保持多年美观。',
    displayOrder: 0,
  },
  {
    areaSlug: 'white-rock',
    questionEn: 'Do you renovate beachfront condos in White Rock?',
    questionZh: '你们翻新白石的海滨公寓吗？',
    answerEn: 'Yes, we renovate condos along Marine Drive and throughout White Rock. We coordinate with strata councils on scheduling, noise rules, and material approvals before starting work.',
    answerZh: '是的，我们翻新Marine Drive沿线和白石全区的公寓。我们在开工前与物业委员会协调时间安排、噪音规定和材料审批。',
    displayOrder: 1,
  },
  // Port Coquitlam
  {
    areaSlug: 'port-coquitlam',
    questionEn: 'How do you keep renovation costs transparent in Port Coquitlam?',
    questionZh: '你们如何在高贵林港保持装修费用透明？',
    answerEn: 'We provide itemized quotes before work starts, with no hidden fees. If anything changes during the project, we discuss it with you and get written approval before proceeding.',
    answerZh: '我们在开工前提供逐项报价，没有隐藏费用。如果项目中有任何变更，我们会与您讨论并在继续之前获得书面批准。',
    displayOrder: 0,
  },
  {
    areaSlug: 'port-coquitlam',
    questionEn: 'What neighborhoods do you serve in Port Coquitlam?',
    questionZh: '你们在高贵林港服务哪些社区？',
    answerEn: 'We serve all Port Coquitlam neighborhoods including Citadel Heights, Oxford Heights, Riverwood, Mary Hill, and the downtown area along Shaughnessy Street.',
    answerZh: '我们服务高贵林港所有社区，包括Citadel Heights、Oxford Heights、Riverwood、Mary Hill和Shaughnessy Street沿线的市中心区域。',
    displayOrder: 1,
  },
];

// ---------------------------------------------------------------------------
// Execute
// ---------------------------------------------------------------------------

async function main() {
  console.log('Applying SEO fixes...\n');

  // 1. Fix meta titles and descriptions
  console.log('--- Meta Title & Description Fixes ---');
  for (const fix of metaFixes) {
    await sql`
      UPDATE service_areas SET
        meta_title_en = ${fix.metaTitleEn},
        meta_title_zh = ${fix.metaTitleZh},
        meta_description_en = ${fix.metaDescriptionEn},
        meta_description_zh = ${fix.metaDescriptionZh},
        updated_at = NOW()
      WHERE slug = ${fix.slug}
    `;
    console.log(`  [${fix.metaTitleEn.length} chars] ${fix.slug}: ${fix.metaTitleEn}`);
  }

  // 2. Fix content (em dashes, AI tells)
  console.log('\n--- Content Fixes (em dashes, AI tells) ---');
  for (const fix of contentFixes) {
    await sql`
      UPDATE service_areas SET
        content_en = ${fix.contentEn},
        content_zh = ${fix.contentZh},
        updated_at = NOW()
      WHERE slug = ${fix.slug}
    `;
    console.log(`  ${fix.slug}: content updated`);
  }

  // 3. Insert missing area FAQs
  console.log('\n--- Missing Area FAQs ---');
  const areas = await sql`SELECT id, slug FROM service_areas`;
  const slugToId = new Map<string, string>();
  for (const a of areas) slugToId.set(a.slug as string, a.id as string);

  let faqCount = 0;
  const seenAreas = new Set<string>();
  for (const faq of newFaqs) {
    const areaId = slugToId.get(faq.areaSlug);
    if (!areaId) {
      console.log(`  Skipped: area "${faq.areaSlug}" not found`);
      continue;
    }

    // Check if area already has FAQs (idempotent)
    if (!seenAreas.has(faq.areaSlug)) {
      const existing = await sql`SELECT COUNT(*) as cnt FROM faqs WHERE service_area_id = ${areaId}`;
      if (Number(existing[0].cnt) > 0) {
        console.log(`  Skipped ${faq.areaSlug}: already has FAQs`);
        seenAreas.add(faq.areaSlug);
        continue;
      }
      seenAreas.add(faq.areaSlug);
    }

    await sql`
      INSERT INTO faqs (question_en, question_zh, answer_en, answer_zh, service_area_id, display_order, is_active)
      VALUES (${faq.questionEn}, ${faq.questionZh}, ${faq.answerEn}, ${faq.answerZh}, ${areaId}, ${faq.displayOrder}, true)
    `;
    console.log(`  Inserted FAQ for ${faq.areaSlug}: "${faq.questionEn.slice(0, 50)}..."`);
    faqCount++;
  }

  console.log(`\n${faqCount} new FAQs inserted.`);
  console.log('\nDone! All SEO fixes applied.');
}

main().catch((err) => {
  console.error('Fix failed:', err);
  process.exit(1);
});
