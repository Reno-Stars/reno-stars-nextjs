/**
 * Add basement renovation service to the database.
 * This creates the service entry which will automatically generate:
 * - /en/services/basement/ (service detail page)
 * - /en/services/basement/[city]/ pages for all service areas
 * 
 * The i18n messages for "basement" service and FAQs already exist in messages/en.json and messages/zh.json.
 *
 * Usage: DATABASE_URL=<url> npx tsx scripts/add-basement-service.ts
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
  // Check if basement service already exists
  const existing = await sql(`SELECT id, slug FROM services WHERE slug = 'basement'`);
  if (existing.length > 0) {
    console.log('Basement service already exists:', existing[0].id);
    return;
  }

  // Insert basement service (display_order 6 = after commercial)
  const result = await sql(`
    INSERT INTO services (slug, title_en, title_zh, description_en, description_zh, long_description_en, long_description_zh, icon_name, icon_url, display_order, show_on_services_page, is_project_type)
    VALUES (
      'basement',
      'Basement Renovation',
      '地下室改造',
      'Convert your basement into functional living space. Ranked 3rd in Best of Vancouver.',
      '将地下室改造为功能性生活空间。温哥华最佳排名第三。',
      'Unlock the full potential of your home with our award-winning basement remodeling services. Whether you want a home theater, gym, guest suite, or home office, we transform underutilized basements into beautiful, functional living spaces. Our team handles everything from waterproofing and insulation to electrical, plumbing, and finishing — delivering turnkey basement renovations across Metro Vancouver.',
      '通过我们屡获殊荣的地下室改造服务，释放您家的全部潜力。无论您想要家庭影院、健身房、客房套间还是家庭办公室，我们都能将闲置的地下室改造成美丽实用的生活空间。我们的团队处理从防水和隔热到电气、管道和装修的一切工作——为大温哥华地区提供一站式地下室装修。',
      'Home',
      '/icons/services/home.svg',
      6,
      true,
      true
    )
    RETURNING id, slug, title_en;
  `);

  console.log('Basement service created:', result[0]);

  // Now add basement-specific FAQs for North Vancouver, Surrey, and Richmond
  const areas = await sql(`SELECT id, slug, name_en FROM service_areas WHERE slug IN ('north-vancouver', 'surrey', 'richmond')`);
  const areaMap = new Map(areas.map((a: any) => [a.slug, a]));

  const northVan = areaMap.get('north-vancouver');
  const surrey = areaMap.get('surrey');
  const richmond = areaMap.get('richmond');

  if (!northVan || !surrey || !richmond) {
    console.error('Missing area(s):', { northVan: !!northVan, surrey: !!surrey, richmond: !!richmond });
    return;
  }

  const faqData = [
    {
      areaId: northVan.id,
      questionEn: 'How much does a basement renovation cost in North Vancouver?',
      questionZh: '北温哥华地下室装修费用是多少？',
      answerEn: 'Basement renovation costs in North Vancouver typically range from $35,000 to $120,000 depending on size and scope. Basic finishing (drywall, flooring, lighting) starts around $35,000-$50,000 for a standard basement. Mid-range renovations with a bathroom addition run $50,000-$80,000, while high-end basement suites with separate entrance and full kitchen can exceed $100,000. North Vancouver projects may require additional waterproofing due to the rainy North Shore climate.',
      answerZh: '北温哥华的地下室装修费用通常在$35,000至$120,000之间，具体取决于面积和范围。基本装修（石膏板、地板、照明）标准地下室约$35,000-$50,000起。包含浴室的中档装修在$50,000-$80,000之间，而带独立入口和完整厨房的高端地下室套房可能超过$100,000。由于北岸多雨的气候，北温哥华项目可能需要额外的防水处理。',
      displayOrder: 10,
    },
    {
      areaId: northVan.id,
      questionEn: 'Do North Vancouver homes need special waterproofing for basement renovations?',
      questionZh: '北温哥华的房屋进行地下室装修需要特殊防水吗？',
      answerEn: 'Yes, North Vancouver receives significantly more rainfall than other Metro Vancouver areas due to its proximity to the North Shore Mountains. We always assess moisture levels before starting any basement renovation and recommend appropriate waterproofing solutions including exterior drainage improvements, interior vapor barriers, moisture-resistant insulation, and dehumidification systems. This ensures your finished basement stays dry and comfortable year-round.',
      answerZh: '是的，由于靠近北岸山脉，北温哥华的降雨量明显多于大温哥华其他地区。我们在开始任何地下室装修之前都会评估湿度水平，并推荐适当的防水方案，包括外部排水改进、内部防潮层、防潮隔热材料和除湿系统。这确保您装修好的地下室全年保持干燥舒适。',
      displayOrder: 11,
    },
    {
      areaId: surrey.id,
      questionEn: 'How much does a basement renovation cost in Surrey?',
      questionZh: '素里地下室装修费用是多少？',
      answerEn: 'Basement renovations in Surrey typically cost $30,000 to $110,000. Surrey homes often have larger basements than Vancouver condos, which can increase overall cost but reduces cost per square foot. Basic finishing starts around $30,000-$45,000. A legal basement suite conversion with separate entrance, kitchen, and bathroom typically runs $70,000-$110,000. Surrey allows secondary suites in most residential zones, making basement suite conversions a popular investment for rental income.',
      answerZh: '素里的地下室装修费用通常在$30,000至$110,000之间。素里的房屋通常比温哥华公寓有更大的地下室，这可能增加总体成本但降低每平方英尺的成本。基本装修约$30,000-$45,000起。带独立入口、厨房和浴室的合法地下室套房改建通常在$70,000-$110,000之间。素里在大多数住宅区允许二级套房，使地下室套房改建成为获取租金收入的热门投资。',
      displayOrder: 10,
    },
    {
      areaId: surrey.id,
      questionEn: 'Can I build a legal basement suite in Surrey for rental income?',
      questionZh: '我可以在素里建造合法地下室套房用于出租吗？',
      answerEn: "Yes, the City of Surrey permits secondary suites in most single-family residential zones. Requirements include a separate entrance, minimum ceiling height of 6'5\", proper fire separation, egress windows in bedrooms, independent HVAC, and smoke/CO detectors. We handle all permit applications, inspections, and code compliance. A legal basement suite in Surrey can generate $1,200-$2,000+ per month in rental income, providing excellent ROI on your renovation investment.",
      answerZh: "是的，素里市在大多数独栋住宅区允许建造二级套房。要求包括独立入口、最低天花板高度6'5\"、适当的防火隔离、卧室逃生窗、独立暖通空调系统以及烟雾/一氧化碳探测器。我们处理所有许可证申请、检查和规范合规事宜。素里的合法地下室套房每月可产生$1,200-$2,000+的租金收入，为您的装修投资提供出色的回报。",
      displayOrder: 11,
    },
    {
      areaId: richmond.id,
      questionEn: 'How much does a basement renovation cost in Richmond?',
      questionZh: '列治文地下室装修费用是多少？',
      answerEn: 'Basement renovation costs in Richmond range from $30,000 to $100,000+. Many Richmond homes sit on low-lying land near sea level, so waterproofing and moisture management are critical considerations. Basic finishing starts around $30,000-$45,000. A full basement suite conversion with kitchen, bathroom, and separate entrance typically costs $65,000-$100,000. Our bilingual team provides all documentation and communication in both English and Mandarin Chinese.',
      answerZh: '列治文的地下室装修费用在$30,000至$100,000+之间。许多列治文的房屋位于接近海平面的低洼地带，因此防水和湿度管理是重要考虑因素。基本装修约$30,000-$45,000起。带厨房、浴室和独立入口的完整地下室套房改建通常费用为$65,000-$100,000。我们的双语团队以英语和普通话提供所有文件和沟通。',
      displayOrder: 10,
    },
    {
      areaId: richmond.id,
      questionEn: 'What are the unique challenges of basement renovations in Richmond?',
      questionZh: '列治文地下室装修的独特挑战是什么？',
      answerEn: 'Richmond sits on low-lying terrain near the Fraser River, which means basement renovations require extra attention to moisture management. Common challenges include high water tables, flood zone considerations, and soil composition. We address these with comprehensive waterproofing systems, sump pumps where needed, moisture-resistant materials, and proper drainage solutions. Our team is experienced with Richmond building codes and inspection requirements.',
      answerZh: '列治文位于菲沙河附近的低洼地带，这意味着地下室装修需要格外注意湿度管理。常见挑战包括高水位、洪水区考虑和土壤成分。我们通过全面的防水系统、必要时的污水泵、防潮材料和适当的排水方案来解决这些问题。我们的团队熟悉列治文的建筑规范和检查要求。',
      displayOrder: 11,
    },
  ];

  for (const faq of faqData) {
    const existing = await sql(`SELECT id FROM faqs WHERE service_area_id = $1 AND question_en = $2`, [faq.areaId, faq.questionEn]);
    if (existing.length > 0) {
      console.log(`FAQ already exists: ${faq.questionEn.slice(0, 60)}...`);
      continue;
    }

    await sql(`
      INSERT INTO faqs (question_en, question_zh, answer_en, answer_zh, service_area_id, display_order)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [faq.questionEn, faq.questionZh, faq.answerEn, faq.answerZh, faq.areaId, faq.displayOrder]);
    console.log(`FAQ added: ${faq.questionEn.slice(0, 60)}...`);
  }

  console.log('\nDone! Basement service and area-specific FAQs created.');
  console.log('Pages that will be auto-generated:');
  console.log('  /en/services/basement/');
  console.log('  /en/services/basement/north-vancouver/');
  console.log('  /en/services/basement/surrey/');
  console.log('  /en/services/basement/richmond/');
  console.log('  ... and all other service areas');
}

main().catch(console.error);
