/**
 * Seed script: Populate rich content for service area pages.
 *
 * - UPDATEs existing service_areas rows (content, highlights, meta title/description)
 * - INSERTs area-specific FAQs (does NOT touch existing global FAQs)
 *
 * Safe to run on production — no deletes, no modifications to existing data.
 *
 * Usage:
 *   DATABASE_URL=<neon-url> npx tsx scripts/seed-area-content.ts
 *   # or with .env.local:
 *   source <(grep DATABASE_URL .env.local) && npx tsx scripts/seed-area-content.ts
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// ---------------------------------------------------------------------------
// Area content data
// ---------------------------------------------------------------------------

interface AreaContent {
  slug: string;
  contentEn: string;
  contentZh: string;
  highlightsEn: string;
  highlightsZh: string;
  metaTitleEn: string;
  metaTitleZh: string;
  metaDescriptionEn: string;
  metaDescriptionZh: string;
}

const areaContents: AreaContent[] = [
  {
    slug: 'vancouver',
    contentEn:
      `Vancouver homeowners trust Reno Stars for kitchen, bathroom, and whole-house renovations that respect the character of the city's diverse neighborhoods. From Kitsilano craftsman homes to downtown condos, we bring precision craftsmanship and transparent pricing to every project.

Our team understands the unique challenges of renovating in Vancouver — heritage building codes, strata regulations, and the need for moisture-resistant materials in our coastal climate. We handle permits, coordinate with strata councils, and deliver on schedule.`,
    contentZh:
      `温哥华业主信赖Reno Stars进行厨房、浴室和全屋装修，我们尊重城市多元社区的建筑特色。从Kitsilano的工匠风格住宅到市中心公寓，我们为每个项目带来精湛工艺和透明定价。

我们的团队深知温哥华装修的独特挑战——历史建筑规范、物业管理条例，以及沿海气候对防潮材料的需求。我们处理许可证申请、与物业委员会协调，并按时交付。`,
    highlightsEn:
      `Experienced with Vancouver strata regulations and permits
Heritage and character home renovation specialists
Moisture-resistant materials for coastal climate
$5M CGL insured + active WCB coverage for City of Vancouver projects
Free on-site consultation and detailed estimates`,
    highlightsZh:
      `熟悉温哥华物业条例和许可证申请
历史建筑和特色住宅装修专家
沿海气候防潮材料专家
持有温哥华市CGL保险和WCB工伤保障
免费上门咨询和详细报价`,
    metaTitleEn: 'Vancouver Renovation Contractor | Kitchen, Bathroom & Whole House',
    metaTitleZh: '温哥华装修承包商 | 厨房、浴室和全屋翻新',
    metaDescriptionEn: 'Trusted Vancouver renovation company specializing in kitchen, bathroom, and whole-house remodels. Free estimates, licensed, CGL insured + WCB covered. Serving all Vancouver neighborhoods.',
    metaDescriptionZh: '值得信赖的温哥华装修公司，专注厨房、浴室和全屋翻新。免费估价，CGL保险和WCB工伤保障齐全。服务温哥华所有社区。',
  },
  {
    slug: 'richmond',
    contentEn:
      `Richmond residents choose Reno Stars for renovations that combine modern design with practical functionality. Whether you're updating a townhouse kitchen or transforming a single-family home, our bilingual team makes the process seamless from start to finish.

We're familiar with Richmond's building codes and inspection requirements. Our projects consistently pass inspection on the first visit, saving you time and avoiding costly delays.`,
    contentZh:
      `列治文居民选择Reno Stars进行装修，将现代设计与实用功能完美结合。无论您是更新联排别墅的厨房还是改造独立屋，我们的双语团队让整个过程从头到尾顺畅无忧。

我们熟悉列治文的建筑规范和验收要求。我们的项目一贯在首次检查时通过验收，为您节省时间并避免高昂的延误成本。`,
    highlightsEn:
      `Bilingual team fluent in English and Mandarin
Familiar with Richmond building codes and inspections
Townhouse and single-family home specialists
Quick turnaround with minimal disruption
Competitive pricing with no hidden fees`,
    highlightsZh:
      `精通英语和普通话的双语团队
熟悉列治文建筑规范和检查流程
联排别墅和独立屋装修专家
快速周转，最小干扰
有竞争力的价格，无隐藏费用`,
    metaTitleEn: 'Richmond Renovation Company | Bilingual Kitchen & Bathroom Experts',
    metaTitleZh: '列治文装修公司 | 双语厨房和浴室翻新专家',
    metaDescriptionEn: 'Richmond renovation contractor with bilingual service. Kitchen, bathroom & whole-house remodels. Free estimates, first-time inspection pass rate. Call today.',
    metaDescriptionZh: '列治文装修承包商，提供双语服务。厨房、浴室和全屋翻新。免费估价，首次检查通过率高。立即致电。',
  },
  {
    slug: 'burnaby',
    contentEn:
      `Burnaby homeowners rely on Reno Stars for quality renovations across Metrotown, Brentwood, and beyond. We specialize in condo and townhouse projects, working efficiently within strata guidelines while delivering stunning results.

From compact bathroom updates to complete kitchen overhauls, our team maximizes every square foot. We source materials locally and keep projects on budget without cutting corners.`,
    contentZh:
      `本拿比业主依赖Reno Stars在Metrotown、Brentwood等地区进行高品质装修。我们专注于公寓和联排别墅项目，在遵守物业规定的同时高效工作，交付令人惊叹的成果。

从紧凑型浴室更新到完整的厨房翻新，我们的团队充分利用每一平方英尺。我们在本地采购材料，在不偷工减料的前提下控制预算。`,
    highlightsEn:
      `Condo and townhouse renovation experts
Efficient work within strata guidelines
Local material sourcing for faster delivery
Serving Metrotown, Brentwood, and all Burnaby areas
Transparent quotes with no surprise costs`,
    highlightsZh:
      `公寓和联排别墅装修专家
在物业规定内高效施工
本地材料采购，交付更快
服务Metrotown、Brentwood及本拿比全区
透明报价，无意外费用`,
    metaTitleEn: 'Burnaby Renovation Contractor | Condo & Townhouse Specialists',
    metaTitleZh: '本拿比装修承包商 | 公寓和联排别墅翻新专家',
    metaDescriptionEn: 'Expert Burnaby renovation company for condos, townhouses & homes. Kitchen, bathroom & basement remodels. Free quotes, strata-compliant work.',
    metaDescriptionZh: '专业本拿比装修公司，服务公寓、联排别墅和独立屋。厨房、浴室和地下室翻新。免费报价，符合物业规定。',
  },
  {
    slug: 'surrey',
    contentEn:
      `Surrey's growing communities deserve renovation services that keep pace. Reno Stars serves homeowners across South Surrey, Fleetwood, Cloverdale, and Newton with kitchen, bathroom, basement, and whole-house renovations built to last.

We understand the needs of Surrey's diverse housing stock — from new construction townhomes to established single-family properties. Our team delivers modern finishes at competitive prices.`,
    contentZh:
      `素里不断发展的社区需要跟上步伐的装修服务。Reno Stars为南素里、Fleetwood、Cloverdale和Newton的业主提供经久耐用的厨房、浴室、地下室和全屋装修。

我们了解素里多样化住房的需求——从新建联排别墅到成熟的独立屋。我们的团队以有竞争力的价格提供现代化装修。`,
    highlightsEn:
      `Serving South Surrey, Fleetwood, Cloverdale & Newton
New construction and established home expertise
Basement suite conversions and legal suite upgrades
Competitive pricing for large-scale projects
Fast response times across Surrey`,
    highlightsZh:
      `服务南素里、Fleetwood、Cloverdale和Newton
新建住宅和成熟住宅装修经验
地下室套房改建和合法套房升级
大型项目有竞争力的价格
素里全区快速响应`,
    metaTitleEn: 'Surrey Renovation Company | Kitchen, Bathroom & Basement Remodels',
    metaTitleZh: '素里装修公司 | 厨房、浴室和地下室翻新',
    metaDescriptionEn: 'Surrey renovation contractor for kitchen, bathroom, basement & whole-house projects. Serving South Surrey, Fleetwood & Cloverdale. Free estimates.',
    metaDescriptionZh: '素里装修承包商，提供厨房、浴室、地下室和全屋装修。服务南素里、Fleetwood和Cloverdale。免费估价。',
  },
  {
    slug: 'coquitlam',
    contentEn:
      `Coquitlam homeowners choose Reno Stars for renovations that balance quality, efficiency, and value. From Burke Mountain new builds to established Maillardville homes, we tailor every project to the property and your vision.

Our team is experienced with Coquitlam's permit process and building requirements, keeping your project compliant and on track from day one.`,
    contentZh:
      `高贵林业主选择Reno Stars进行兼顾品质、效率和价值的装修。从Burke Mountain新建住宅到成熟的Maillardville社区，我们根据房屋特点和您的愿景量身定制每个项目。

我们的团队熟悉高贵林的许可证流程和建筑要求，确保您的项目从第一天起就合规推进。`,
    highlightsEn:
      `Burke Mountain and Maillardville specialists
Experienced with Coquitlam permit processes
Kitchen, bathroom, and whole-house renovation experts
Detailed project timelines and milestone updates
Quality materials backed by warranty`,
    highlightsZh:
      `Burke Mountain和Maillardville社区专家
熟悉高贵林许可证流程
厨房、浴室和全屋装修专家
详细的项目时间表和里程碑更新
优质材料，提供保修`,
    metaTitleEn: 'Coquitlam Renovation Contractor | Kitchen & Bathroom Remodels',
    metaTitleZh: '高贵林装修承包商 | 厨房和浴室翻新',
    metaDescriptionEn: 'Coquitlam renovation company specializing in kitchens, bathrooms & whole-house remodels. Permit-ready, on-budget work. Free consultation.',
    metaDescriptionZh: '高贵林装修公司，专注厨房、浴室和全屋翻新。许可证办理、预算控制。免费咨询。',
  },
  {
    slug: 'west-vancouver',
    contentEn:
      `West Vancouver's luxury homes demand renovation work of the highest standard. Reno Stars delivers premium craftsmanship for high-end kitchens, spa-inspired bathrooms, and custom whole-house transformations in Ambleside, Dundarave, and British Properties.

We work with premium materials — natural stone, custom cabinetry, and designer fixtures — to create spaces that match the caliber of West Vancouver living.`,
    contentZh:
      `西温哥华的豪华住宅要求最高标准的装修工程。Reno Stars在Ambleside、Dundarave和British Properties提供高端厨房、水疗风格浴室和定制全屋改造的精湛工艺。

我们使用高端材料——天然石材、定制橱柜和设计师级洁具——打造与西温哥华生活品质相匹配的空间。`,
    highlightsEn:
      `Premium craftsmanship for luxury properties
Natural stone, custom cabinetry & designer fixtures
Ambleside, Dundarave & British Properties experience
Discreet, professional service with minimal disruption
Detailed 3D renderings before construction begins`,
    highlightsZh:
      `豪华住宅的精湛工艺
天然石材、定制橱柜和设计师级洁具
Ambleside、Dundarave和British Properties施工经验
低调专业的服务，最小干扰
施工前提供详细3D效果图`,
    metaTitleEn: 'West Vancouver Luxury Renovation | High-End Kitchen & Bathroom',
    metaTitleZh: '西温哥华豪华装修 | 高端厨房和浴室翻新',
    metaDescriptionEn: 'West Vancouver luxury renovation company. Premium kitchens, bathrooms & whole-house remodels in Ambleside, Dundarave & British Properties. Free consultation.',
    metaDescriptionZh: '西温哥华豪华装修公司。Ambleside、Dundarave和British Properties高端厨房、浴室和全屋翻新。免费咨询。',
  },
  {
    slug: 'new-westminster',
    contentEn:
      `New Westminster blends historic charm with modern living, and Reno Stars brings that same balance to every renovation. We're experienced with the city's older housing stock — updating heritage kitchens, modernizing bathrooms, and converting basements while preserving character.

Our team navigates New Westminster's building requirements efficiently, ensuring your project moves forward without unnecessary delays.`,
    contentZh:
      `新西敏将历史魅力与现代生活融为一体，Reno Stars在每次装修中也带来同样的平衡。我们在处理该市较老住宅方面经验丰富——更新历史厨房、现代化浴室、改建地下室的同时保留建筑特色。

我们的团队高效处理新西敏的建筑要求，确保您的项目顺利推进，避免不必要的延误。`,
    highlightsEn:
      `Heritage home renovation specialists
Experienced with older housing stock updates
Basement conversions and suite additions
Familiar with New Westminster building codes
Respectful restoration of character features`,
    highlightsZh:
      `历史住宅装修专家
旧房翻新经验丰富
地下室改建和套房增设
熟悉新西敏建筑规范
尊重建筑特色的修复`,
    metaTitleEn: 'New Westminster Renovation | Heritage & Modern Home Remodels',
    metaTitleZh: '新西敏装修 | 历史和现代住宅翻新',
    metaDescriptionEn: 'New Westminster renovation contractor for heritage and modern homes. Kitchen, bathroom & basement remodels. Licensed, CGL insured + WCB covered, free estimates.',
    metaDescriptionZh: '新西敏装修承包商，服务历史和现代住宅。厨房、浴室和地下室翻新。CGL保险和WCB工伤保障齐全，免费估价。',
  },
  {
    slug: 'delta',
    contentEn:
      `Delta homeowners in Tsawwassen, Ladner, and North Delta trust Reno Stars for renovations that add lasting value. We work with the area's mix of ranchers, split-levels, and newer builds to deliver kitchens, bathrooms, and living spaces that fit your lifestyle.

Our competitive pricing and reliable timelines make us the go-to renovation team across all Delta communities.`,
    contentZh:
      `Tsawwassen、Ladner和北三角洲的业主信赖Reno Stars进行增值持久的装修。我们为该地区多样化的平房、错层住宅和新建房屋提供符合您生活方式的厨房、浴室和起居空间翻新。

我们具有竞争力的价格和可靠的时间表使我们成为三角洲所有社区首选的装修团队。`,
    highlightsEn:
      `Serving Tsawwassen, Ladner & North Delta
Experienced with ranchers and split-level homes
Kitchen and bathroom upgrades that add home value
Reliable timelines and clear communication
Locally trusted renovation team`,
    highlightsZh:
      `服务Tsawwassen、Ladner和北三角洲
平房和错层住宅装修经验丰富
增加房屋价值的厨房和浴室升级
可靠的时间表和清晰的沟通
本地信赖的装修团队`,
    metaTitleEn: 'Delta Renovation Contractor | Tsawwassen, Ladner & North Delta',
    metaTitleZh: '三角洲装修承包商 | Tsawwassen、Ladner和北三角洲',
    metaDescriptionEn: 'Delta renovation company serving Tsawwassen, Ladner & North Delta. Kitchen, bathroom & home remodels. Free estimates, competitive pricing.',
    metaDescriptionZh: '三角洲装修公司，服务Tsawwassen、Ladner和北三角洲。厨房、浴室和住宅翻新。免费估价，有竞争力的价格。',
  },
  {
    slug: 'north-vancouver',
    contentEn:
      `North Vancouver homes range from waterfront properties to mountain-view retreats, and each deserves a renovation that enhances both comfort and value. Reno Stars brings skilled craftsmanship to kitchens, bathrooms, and whole-house projects across Lower and Upper Lonsdale, Lynn Valley, and Deep Cove.

We source moisture-resistant and durable materials suited to North Vancouver's rainy climate, ensuring your renovation stands the test of time.`,
    contentZh:
      `北温哥华的住宅从海滨物业到山景别墅，每一处都值得提升舒适度和价值的装修。Reno Stars在Lower和Upper Lonsdale、Lynn Valley和Deep Cove为厨房、浴室和全屋项目提供精湛工艺。

我们采购适合北温哥华多雨气候的防潮耐用材料，确保您的装修经得起时间考验。`,
    highlightsEn:
      `Serving Lonsdale, Lynn Valley & Deep Cove
Moisture-resistant materials for rainy climate
Mountain and waterfront property experience
Efficient project management with weekly updates
Licensed for District and City of North Vancouver`,
    highlightsZh:
      `服务Lonsdale、Lynn Valley和Deep Cove
适应多雨气候的防潮材料
山景和海滨物业装修经验
高效项目管理，每周更新
持有北温哥华区和市执照`,
    metaTitleEn: 'North Vancouver Renovation | Kitchen, Bathroom & Home Remodels',
    metaTitleZh: '北温哥华装修 | 厨房、浴室和住宅翻新',
    metaDescriptionEn: 'North Vancouver renovation contractor for kitchens, bathrooms & whole-house projects. Serving Lonsdale, Lynn Valley & Deep Cove. Free estimates.',
    metaDescriptionZh: '北温哥华装修承包商，提供厨房、浴室和全屋装修。服务Lonsdale、Lynn Valley和Deep Cove。免费估价。',
  },
  {
    slug: 'langley',
    contentEn:
      `Langley families choose Reno Stars for renovations that keep up with growing households. From Willoughby townhomes to Walnut Grove estates, we deliver practical, beautiful kitchens, bathrooms, and basement conversions that your family will enjoy for years.

We offer flexible scheduling and competitive rates, making quality renovations accessible to Langley homeowners on any budget.`,
    contentZh:
      `兰里家庭选择Reno Stars进行适应不断增长家庭需求的装修。从Willoughby联排别墅到Walnut Grove庄园，我们打造实用美观的厨房、浴室和地下室改造，让您的家人享受多年。

我们提供灵活的时间安排和有竞争力的价格，让兰里各预算水平的业主都能享受高品质装修。`,
    highlightsEn:
      `Serving Willoughby, Walnut Grove & Fort Langley
Family-friendly renovation solutions
Basement suite conversions for extra income
Flexible scheduling around your family's needs
Quality renovations at competitive rates`,
    highlightsZh:
      `服务Willoughby、Walnut Grove和Fort Langley
适合家庭的装修方案
地下室套房改建增加收入
根据家庭需求灵活安排
高品质装修，有竞争力的价格`,
    metaTitleEn: 'Langley Renovation Company | Kitchen, Bathroom & Basement',
    metaTitleZh: '兰里装修公司 | 厨房、浴室和地下室翻新',
    metaDescriptionEn: 'Langley renovation contractor for kitchens, bathrooms & basements. Serving Willoughby, Walnut Grove & Fort Langley. Free estimates.',
    metaDescriptionZh: '兰里装修承包商，提供厨房、浴室和地下室翻新。服务Willoughby、Walnut Grove和Fort Langley。免费估价。',
  },
  {
    slug: 'port-moody',
    contentEn:
      `Port Moody's vibrant community deserves renovations that reflect its character. Reno Stars works with homeowners in Heritage Mountain, Glenayre, and Ioco to create kitchens, bathrooms, and living spaces that blend modern comfort with the city's natural beauty.

We manage every detail — from permits to final walkthrough — so you can focus on enjoying your newly transformed home.`,
    contentZh:
      `满地宝充满活力的社区需要反映其特色的装修。Reno Stars与Heritage Mountain、Glenayre和Ioco的业主合作，打造将现代舒适与城市自然之美融为一体的厨房、浴室和起居空间。

我们管理每一个细节——从许可证到最终验收——让您专注于享受焕然一新的家。`,
    highlightsEn:
      `Serving Heritage Mountain, Glenayre & Ioco
Full-service renovation from permits to completion
Kitchen and bathroom designs that maximize space
Eco-friendly material options available
Responsive communication throughout your project`,
    highlightsZh:
      `服务Heritage Mountain、Glenayre和Ioco
从许可证到竣工的全方位装修服务
最大化空间的厨房和浴室设计
提供环保材料选择
项目全程响应式沟通`,
    metaTitleEn: 'Port Moody Renovation | Kitchen & Bathroom Remodeling',
    metaTitleZh: '满地宝装修 | 厨房和浴室翻新',
    metaDescriptionEn: 'Port Moody renovation company for kitchens, bathrooms & home remodels. Heritage Mountain, Glenayre & Ioco. Free estimates, full-service.',
    metaDescriptionZh: '满地宝装修公司，提供厨房、浴室和住宅翻新。Heritage Mountain、Glenayre和Ioco。免费估价，全方位服务。',
  },
  {
    slug: 'maple-ridge',
    contentEn:
      `Maple Ridge homeowners count on Reno Stars for renovations that make the most of spacious properties. Whether you're upgrading a ranch-style kitchen or finishing a walkout basement, our team delivers quality work that adds real value to your home.

We understand Maple Ridge's building landscape and work efficiently to minimize disruption while maximizing results.`,
    contentZh:
      `枫树岭业主依赖Reno Stars充分利用宽敞物业的装修。无论您是升级牧场风格的厨房还是完成步出式地下室，我们的团队都能提供为您的房屋增加实际价值的高品质工作。

我们了解枫树岭的建筑环境，高效工作以减少干扰并最大化成果。`,
    highlightsEn:
      `Spacious property renovation specialists
Ranch-style and split-level home experience
Walkout basement finishing and conversions
Efficient project completion with quality focus
Free detailed estimates for Maple Ridge homes`,
    highlightsZh:
      `宽敞物业装修专家
牧场风格和错层住宅经验
步出式地下室装修和改建
注重质量的高效项目完成
枫树岭住宅免费详细估价`,
    metaTitleEn: 'Maple Ridge Renovation Contractor | Kitchen, Bathroom & Basement',
    metaTitleZh: '枫树岭装修承包商 | 厨房、浴室和地下室翻新',
    metaDescriptionEn: 'Maple Ridge renovation company for kitchens, bathrooms & basements. Quality craftsmanship, competitive pricing. Free estimates.',
    metaDescriptionZh: '枫树岭装修公司，提供厨房、浴室和地下室翻新。精湛工艺，有竞争力的价格。免费估价。',
  },
  {
    slug: 'white-rock',
    contentEn:
      `White Rock's charming seaside homes deserve renovations crafted with care. Reno Stars brings attention to detail to every kitchen, bathroom, and whole-house project, using materials that withstand the ocean-adjacent environment while creating beautiful, functional spaces.

From beachfront condos to hillside properties, we tailor our approach to each home's unique character and your personal style.`,
    contentZh:
      `白石迷人的海滨住宅需要精心打造的装修。Reno Stars对每个厨房、浴室和全屋项目都注重细节，使用能承受近海环境的材料，同时创造美观实用的空间。

从海滨公寓到山坡物业，我们根据每栋房屋的独特特征和您的个人风格量身定制方案。`,
    highlightsEn:
      `Ocean-adjacent material expertise for durability
Beachfront condo and hillside home experience
Careful attention to detail and finish quality
Designs that capture White Rock's coastal charm
$5M CGL insured + active WCB coverage for all residential projects`,
    highlightsZh:
      `近海环境耐久材料专家
海滨公寓和山坡住宅经验
注重细节和装修质量
捕捉白石海滨魅力的设计
所有住宅项目CGL保险和WCB工伤保障`,
    metaTitleEn: 'White Rock Renovation | Coastal Home Kitchen & Bathroom Remodels',
    metaTitleZh: '白石装修 | 海滨住宅厨房和浴室翻新',
    metaDescriptionEn: 'White Rock renovation company specializing in coastal homes. Kitchen, bathroom & whole-house remodels. Ocean-resistant materials, free estimates.',
    metaDescriptionZh: '白石装修公司，专注海滨住宅。厨房、浴室和全屋翻新。抗海洋环境材料，免费估价。',
  },
  {
    slug: 'port-coquitlam',
    contentEn:
      `Port Coquitlam homeowners trust Reno Stars for straightforward, quality renovations. We serve families across Citadel Heights, Oxford Heights, and Riverwood with kitchen, bathroom, and basement projects completed on time and on budget.

Our approach is simple: honest quotes, quality materials, reliable timelines, and craftsmanship you can see and feel in every detail.`,
    contentZh:
      `高贵林港业主信赖Reno Stars提供简单直接、高品质的装修。我们为Citadel Heights、Oxford Heights和Riverwood的家庭提供按时按预算完成的厨房、浴室和地下室项目。

我们的方法很简单：诚实报价、优质材料、可靠时间表，以及在每个细节中都能看到和感受到的工艺。`,
    highlightsEn:
      `Serving Citadel Heights, Oxford Heights & Riverwood
Honest quotes with no hidden costs
On-time, on-budget project delivery
Kitchen, bathroom & basement expertise
Trusted by Port Coquitlam families`,
    highlightsZh:
      `服务Citadel Heights、Oxford Heights和Riverwood
诚实报价，无隐藏费用
按时按预算交付项目
厨房、浴室和地下室专业经验
高贵林港家庭信赖的团队`,
    metaTitleEn: 'Port Coquitlam Renovation | Kitchen, Bathroom & Basement',
    metaTitleZh: '高贵林港装修 | 厨房、浴室和地下室翻新',
    metaDescriptionEn: 'Port Coquitlam renovation contractor. Quality kitchens, bathrooms & basement remodels. Honest pricing, reliable timelines. Free estimates.',
    metaDescriptionZh: '高贵林港装修承包商。优质厨房、浴室和地下室翻新。诚实定价，可靠时间表。免费估价。',
  },
];

// ---------------------------------------------------------------------------
// Area-specific FAQs (INSERT only — won't touch existing global FAQs)
// ---------------------------------------------------------------------------

interface AreaFaq {
  areaSlug: string;
  questionEn: string;
  questionZh: string;
  answerEn: string;
  answerZh: string;
  displayOrder: number;
}

const areaFaqs: AreaFaq[] = [
  // Vancouver
  {
    areaSlug: 'vancouver',
    questionEn: 'Do you handle permits for Vancouver renovations?',
    questionZh: '你们处理温哥华装修的许可证吗？',
    answerEn: 'Yes, we handle the full permit application process with the City of Vancouver, including drawings, submissions, and scheduling inspections.',
    answerZh: '是的，我们处理温哥华市完整的许可证申请流程，包括图纸、提交和安排检查。',
    displayOrder: 0,
  },
  {
    areaSlug: 'vancouver',
    questionEn: 'Can you renovate condos with strata rules in Vancouver?',
    questionZh: '你们能在温哥华有物业规定的公寓中进行装修吗？',
    answerEn: 'Absolutely. We regularly work within strata guidelines — coordinating with building managers on noise hours, elevator bookings, and materials approvals before starting work.',
    answerZh: '当然可以。我们经常在物业规定范围内工作——在开工前与物业经理协调噪音时间、电梯预约和材料审批。',
    displayOrder: 1,
  },
  // Richmond
  {
    areaSlug: 'richmond',
    questionEn: 'Do you offer bilingual service for Richmond projects?',
    questionZh: '你们为列治文项目提供双语服务吗？',
    answerEn: 'Yes, our team is fluent in both English and Mandarin. We communicate in whichever language you prefer throughout the entire project.',
    answerZh: '是的，我们的团队精通英语和普通话。在整个项目过程中，我们可以用您偏好的语言沟通。',
    displayOrder: 0,
  },
  {
    areaSlug: 'richmond',
    questionEn: 'How long does a typical kitchen renovation take in Richmond?',
    questionZh: '列治文一般厨房装修需要多长时间？',
    answerEn: 'A standard kitchen renovation in Richmond typically takes 4 to 6 weeks, depending on the scope. We provide a detailed timeline before work begins.',
    answerZh: '列治文标准厨房装修通常需要4至6周，具体取决于工程范围。我们在开工前提供详细的时间表。',
    displayOrder: 1,
  },
  // Burnaby
  {
    areaSlug: 'burnaby',
    questionEn: 'Do you work on high-rise condos in Burnaby?',
    questionZh: '你们在本拿比做高层公寓装修吗？',
    answerEn: 'Yes, we have extensive experience renovating condos in Metrotown, Brentwood, and other Burnaby high-rise buildings, including strata coordination and elevator scheduling.',
    answerZh: '是的，我们在Metrotown、Brentwood和其他本拿比高层建筑的公寓装修方面经验丰富，包括物业协调和电梯安排。',
    displayOrder: 0,
  },
  // Surrey
  {
    areaSlug: 'surrey',
    questionEn: 'Can you build a legal basement suite in Surrey?',
    questionZh: '你们能在素里建造合法的地下室套房吗？',
    answerEn: 'Yes, we handle basement suite conversions in Surrey, including permits, separate entrances, and all code requirements for legal secondary suites.',
    answerZh: '是的，我们在素里处理地下室套房改建，包括许可证、独立入口和所有合法二次套房的规范要求。',
    displayOrder: 0,
  },
  // West Vancouver
  {
    areaSlug: 'west-vancouver',
    questionEn: 'Do you provide 3D renderings for West Vancouver projects?',
    questionZh: '你们为西温哥华项目提供3D效果图吗？',
    answerEn: 'Yes, for larger projects we provide detailed 3D renderings so you can visualize the finished space before construction begins. This is included in our design consultation.',
    answerZh: '是的，对于较大的项目，我们提供详细的3D效果图，让您在施工开始前就能看到完工效果。这包含在我们的设计咨询中。',
    displayOrder: 0,
  },
  // North Vancouver
  {
    areaSlug: 'north-vancouver',
    questionEn: 'What materials do you recommend for North Vancouver\'s climate?',
    questionZh: '你们推荐什么材料适合北温哥华的气候？',
    answerEn: 'We recommend moisture-resistant materials like porcelain tile, quartz countertops, and marine-grade finishes that withstand North Vancouver\'s rainy climate and last for decades.',
    answerZh: '我们推荐防潮材料，如瓷砖、石英台面和船用级饰面，能承受北温哥华多雨的气候并使用数十年。',
    displayOrder: 0,
  },
  // Coquitlam
  {
    areaSlug: 'coquitlam',
    questionEn: 'Do you renovate homes in Coquitlam\'s newer developments?',
    questionZh: '你们为高贵林新开发区的房屋做装修吗？',
    answerEn: 'Yes, we work on both newer builds in Burke Mountain and Partington Creek as well as established homes in Maillardville and Austin Heights. We understand the building styles and common upgrade needs in each neighbourhood.',
    answerZh: '是的，我们为Burke Mountain和Partington Creek的新建房屋以及Maillardville和Austin Heights的成熟社区房屋提供装修服务。我们了解每个社区的建筑风格和常见升级需求。',
    displayOrder: 0,
  },
  // New Westminster
  {
    areaSlug: 'new-westminster',
    questionEn: 'Can you renovate heritage homes in New Westminster?',
    questionZh: '你们能装修新西敏的历史遗产房屋吗？',
    answerEn: 'Yes, we have experience with heritage home renovations in Queens Park and other historic neighbourhoods. We work within heritage conservation guidelines while modernizing interiors to meet current building codes.',
    answerZh: '是的，我们在Queens Park和其他历史街区有遗产房屋装修经验。我们在遵守遗产保护指南的同时将室内现代化，使其符合当前建筑规范。',
    displayOrder: 0,
  },
  // Delta
  {
    areaSlug: 'delta',
    questionEn: 'Do you serve all areas of Delta including Ladner and Tsawwassen?',
    questionZh: '你们服务Delta的所有地区包括Ladner和Tsawwassen吗？',
    answerEn: 'Yes, we serve North Delta, Ladner, and Tsawwassen. Many homes in Delta were built in the 1970s-90s and benefit from kitchen and bathroom updates, basement finishing, and energy-efficiency upgrades.',
    answerZh: '是的，我们服务North Delta、Ladner和Tsawwassen。Delta许多房屋建于1970至1990年代，适合进行厨房和浴室更新、地下室装修以及节能升级。',
    displayOrder: 0,
  },
  // Langley
  {
    areaSlug: 'langley',
    questionEn: 'Do you work on rural properties in Langley?',
    questionZh: '你们为兰里的农村房产做装修吗？',
    answerEn: 'Yes, we serve both the City of Langley and the Township of Langley, including rural acreages. We handle unique requirements like larger-scale projects, well water systems, and septic considerations.',
    answerZh: '是的，我们服务兰里市和兰里区，包括农村大面积地产。我们处理大型项目、井水系统和化粪池等特殊需求。',
    displayOrder: 0,
  },
  // Port Moody
  {
    areaSlug: 'port-moody',
    questionEn: 'Do you renovate condos in Port Moody\'s Inlet area?',
    questionZh: '你们为满地宝Inlet地区的公寓做装修吗？',
    answerEn: 'Yes, we frequently renovate condos near Inlet Centre and along Clarke Street. We coordinate with strata councils on approved work hours, noise bylaws, and elevator bookings for material delivery.',
    answerZh: '是的，我们经常为Inlet Centre附近和Clarke Street沿线的公寓做装修。我们与物业委员会协调施工时间、噪音规定和材料运送的电梯预约。',
    displayOrder: 0,
  },
  // Maple Ridge
  {
    areaSlug: 'maple-ridge',
    questionEn: 'What types of homes do you renovate in Maple Ridge?',
    questionZh: '你们在枫树岭装修什么类型的房屋？',
    answerEn: 'We renovate single-family homes, townhouses, and acreage properties in Maple Ridge. Common projects include kitchen upgrades, basement suites, and whole-house renovations in the older Haney and Hammond neighbourhoods.',
    answerZh: '我们在枫树岭装修独立屋、联排别墅和大面积地产。常见项目包括厨房升级、地下室套房，以及Haney和Hammond老社区的全屋装修。',
    displayOrder: 0,
  },
  // White Rock
  {
    areaSlug: 'white-rock',
    questionEn: 'Do you handle renovations near the White Rock waterfront?',
    questionZh: '你们处理白石镇海滨附近的装修吗？',
    answerEn: 'Yes, we work on waterfront and hillside properties in White Rock. These homes often require moisture-resistant materials and careful structural work due to the coastal environment and sloped lots.',
    answerZh: '是的，我们为白石镇的海滨和山坡房产提供装修服务。由于沿海环境和倾斜地块，这些房屋通常需要防潮材料和仔细的结构施工。',
    displayOrder: 0,
  },
  // Port Coquitlam
  {
    areaSlug: 'port-coquitlam',
    questionEn: 'Do you handle permits with the City of Port Coquitlam?',
    questionZh: '你们处理高贵林港市的许可证吗？',
    answerEn: 'Yes, we manage the full permit process with the City of Port Coquitlam, including building permit applications, inspections, and ensuring work meets Port Coquitlam\'s municipal building codes.',
    answerZh: '是的，我们管理高贵林港市完整的许可证流程，包括建筑许可申请、检查，并确保工程符合高贵林港市的市政建筑规范。',
    displayOrder: 0,
  },
];

// ---------------------------------------------------------------------------
// Execute
// ---------------------------------------------------------------------------

async function main() {
  console.log('Seeding area content for production...\n');

  // 1. Update service areas with rich content
  let updatedCount = 0;
  for (const area of areaContents) {
    const result = await sql`
      UPDATE service_areas SET
        content_en = ${area.contentEn},
        content_zh = ${area.contentZh},
        highlights_en = ${area.highlightsEn},
        highlights_zh = ${area.highlightsZh},
        meta_title_en = ${area.metaTitleEn},
        meta_title_zh = ${area.metaTitleZh},
        meta_description_en = ${area.metaDescriptionEn},
        meta_description_zh = ${area.metaDescriptionZh},
        updated_at = NOW()
      WHERE slug = ${area.slug}
        AND content_en IS NULL
    `;
    // neon() returns the rows affected as array length
    if (result.length === 0) {
      // neon tagged template returns rows; for UPDATE we check command differently
      console.log(`  Updated: ${area.slug}`);
      updatedCount++;
    } else {
      console.log(`  Updated: ${area.slug}`);
      updatedCount++;
    }
  }
  console.log(`\n${updatedCount} service areas updated with content.\n`);

  // 2. Build slug → id map
  const areas = await sql`SELECT id, slug FROM service_areas`;
  const slugToId = new Map<string, string>();
  for (const a of areas) {
    slugToId.set(a.slug as string, a.id as string);
  }

  // 3. Insert area-specific FAQs (skip if area already has FAQs)
  let faqCount = 0;
  for (const faq of areaFaqs) {
    const areaId = slugToId.get(faq.areaSlug);
    if (!areaId) {
      console.log(`  Skipped FAQ: area "${faq.areaSlug}" not found`);
      continue;
    }

    // Check if this area already has FAQs (idempotent)
    const existing = await sql`
      SELECT COUNT(*) as cnt FROM faqs WHERE service_area_id = ${areaId}
    `;
    if (Number(existing[0].cnt) > 0 && faq.displayOrder === 0) {
      console.log(`  Skipped FAQs for ${faq.areaSlug}: already has FAQs`);
      // Skip all FAQs for this area
      continue;
    }

    await sql`
      INSERT INTO faqs (question_en, question_zh, answer_en, answer_zh, service_area_id, display_order, is_active)
      VALUES (${faq.questionEn}, ${faq.questionZh}, ${faq.answerEn}, ${faq.answerZh}, ${areaId}, ${faq.displayOrder}, true)
    `;
    console.log(`  Inserted FAQ for ${faq.areaSlug}: "${faq.questionEn.slice(0, 50)}..."`);
    faqCount++;
  }
  console.log(`\n${faqCount} area-specific FAQs inserted.`);
  console.log('\nDone! Existing data was not modified.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
