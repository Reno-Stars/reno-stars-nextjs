/**
 * SEO Enrichment Script
 * Run: dotenv -e .env.local -- npx tsx scripts/seo-enrich.ts
 */
import { neon } from '@neondatabase/serverless';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL not set'); process.exit(1); }
const sql = neon(DATABASE_URL);

function wc(t: string): number {
  if (!t) return 0;
  const cjk = (t.match(/[\u4e00-\u9fff]/g) || []).length;
  const lat = t.replace(/[\u4e00-\u9fff]/g, '').trim().split(/\s+/).filter(Boolean).length;
  return cjk + lat;
}

function enParagraphs(city: string, svc: string): string[] {
  const m: Record<string, string[]> = {
    kitchen: [
      `\n\nThis ${city} kitchen renovation showcases our commitment to creating functional, beautiful cooking spaces. Our team selected premium materials including quartz countertops, solid wood cabinetry, and high-end appliances to deliver a kitchen combining modern aesthetics with everyday practicality.`,
      `\n\nThe renovation involved comprehensive planning from our experienced project managers who coordinated every aspect from demolition through final installation. We optimized the kitchen layout for improved workflow, ensuring the cooking triangle allows effortless meal preparation.`,
      `\n\nKey features include custom cabinetry with soft-close hinges and pull-out organizers, under-cabinet LED lighting, and a durable tile backsplash. Premium quartz countertops offer superior stain resistance and luxurious appearance that endures for years.`,
      `\n\nAs one of Vancouver's most trusted kitchen renovation contractors, Reno Stars brings over a decade of experience to every project. Our comprehensive warranty, up to $5M CGL insurance, and active WCB coverage give homeowners peace of mind. Contact us for a free consultation for your ${city} kitchen renovation.`,
    ],
    bathroom: [
      `\n\nThis ${city} bathroom renovation demonstrates our expertise in transforming outdated bathrooms into spa-inspired retreats. Our design team selected premium fixtures, luxurious tile work, and modern vanities creating a serene atmosphere for daily relaxation.`,
      `\n\nThe renovation included professional waterproofing using Schluter systems, heated flooring for year-round comfort, a frameless glass shower enclosure, and a custom vanity with ample storage to keep the space organized.`,
      `\n\nOur ${city} bathroom renovation specialists handle every detail from plumbing rough-in to final tile installation. We coordinate all trades under unified project management, so homeowners enjoy a stress-free experience with a single point of contact.`,
      `\n\nReno Stars delivers exceptional bathroom renovations across ${city} and the Lower Mainland. With our 3-year warranty, 5-star Google rating, and transparent pricing, we make it easy to transform your bathroom. Get a free quote today.`,
    ],
    basement: [
      `\n\nThis ${city} basement renovation transformed underutilized space into a fully functional living area adding significant home value. Our team addressed moisture management, insulation, and building code compliance to create a comfortable, safe environment.`,
      `\n\nThe scope included professional framing, electrical upgrades, high-efficiency insulation, and premium finishing materials. We installed recessed LED lighting and selected durable, moisture-resistant flooring suitable for below-grade applications.`,
      `\n\nRanked 3rd in Best of Vancouver for basement renovations, Reno Stars brings specialized expertise to every basement project in ${city}. We handle all permit applications, inspections, material procurement, and manage the entire construction process.`,
      `\n\nWhether you envision a home theater, guest suite, home office, or recreation room, our ${city} basement renovation team delivers exceptional results. Contact Reno Stars for a free in-home consultation.`,
    ],
  };
  return m[svc] || [
    `\n\nThis ${city} renovation project reflects Reno Stars' dedication to quality craftsmanship and thoughtful design. Our team worked closely with the homeowner to understand their vision, lifestyle needs, and budget, creating a plan maximizing functionality and aesthetic appeal.`,
    `\n\nThe project involved careful material selection, with our design consultants guiding options for flooring, fixtures, lighting, and finishes. We source from trusted suppliers across the Lower Mainland, ensuring premium quality with competitive pricing.`,
    `\n\nOur unified project management means homeowners never coordinate directly with individual trades. A dedicated project manager oversees scheduling, material delivery, and quality control, providing regular progress updates throughout.`,
    `\n\nReno Stars proudly serves ${city} with professional renovation services backed by over a decade of experience, up to $5M CGL insurance, active WCB coverage, and a 3-year warranty. Schedule your free consultation today.`,
  ];
}

function zhParagraphs(city: string, svc: string): string[] {
  const m: Record<string, string[]> = {
    kitchen: [
      `\n\n这个${city}厨房装修项目展现了我们打造功能与美观兼备的烹饪空间的专业实力。团队精选石英石台面、实木橱柜和高端不锈钢电器，将现代美学与日常实用性完美结合。`,
      `\n\n装修过程由经验丰富的项目经理全程把控，从拆除到安装精心协调每个环节。我们特别注重优化厨房动线，确保水槽、灶台和冰箱之间形成高效工作三角。`,
      `\n\n亮点包括配备缓冲铰链的定制橱柜、柜下LED灯带、精美瓷砖背板。台面采用优质石英石，抗污性能卓越、外观奢华、经久耐用。`,
      `\n\n作为温哥华最值得信赖的厨房装修承包商，Reno Stars带来十余年经验。全面质保、至多500万CGL保险和有效WCB工伤保障让业主安心无忧。立即联系获取${city}厨房装修免费咨询。`,
    ],
    bathroom: [
      `\n\n这个${city}卫浴装修项目展示了我们将浴室改造成水疗级空间的专业能力。设计团队精选优质洁具、豪华瓷砖和现代浴室柜，营造宁静舒适的放松氛围。`,
      `\n\n工程采用Schluter防水系统确保长期防潮保护，安装地暖系统、无框玻璃淋浴隔断和定制浴室柜，兼顾舒适与收纳。`,
      `\n\n我们的${city}卫浴装修专家从管道粗装到瓷砖铺设全程负责。统一项目管理协调各工种，业主只需一个联系人即享无忧体验。`,
      `\n\nReno Stars为${city}及低陆平原提供卓越卫浴装修。3年质保、Google五星好评、透明定价，让浴室焕新简单轻松。立即获取免费报价。`,
    ],
    basement: [
      `\n\n这个${city}地下室装修将闲置空间转化为功能齐全的生活区域，显著提升房屋价值。团队妥善解决防潮、保温和建筑规范合规等挑战。`,
      `\n\n装修范围包括专业框架、电气升级、高效隔热和优质饰面材料。嵌入式LED照明提升亮度，耐潮地板适合地下环境。`,
      `\n\n温哥华地下室装修排名第三，Reno Stars为${city}每个项目带来专业技术。负责许可证申请、检查、材料采购和全程施工管理。`,
      `\n\n无论家庭影院、客房、办公室或娱乐室，我们的${city}团队都能交付出色成果。联系Reno Stars预约免费上门咨询。`,
    ],
  };
  return m[svc] || [
    `\n\n这个${city}装修项目体现了Reno Stars对精湛工艺的追求。团队与业主深入沟通，了解愿景、需求和预算，制定兼顾功能与美观的方案。`,
    `\n\n项目涉及细致选材，设计顾问提供地板、洁具、照明等方案。从低陆平原可靠供应商采购，确保品质与价格兼优。`,
    `\n\n统一项目管理模式下业主无需直接对接各工种。专属经理负责进度、材料和质检，定期汇报施工进展。`,
    `\n\nReno Stars以十余年经验、至多500万CGL保险、有效WCB工伤保障和3年质保为${city}社区提供专业装修。立即预约免费咨询。`,
  ];
}

function detectSvc(st: string|null, t: string|null): string {
  if (st==='kitchen'||t?.toLowerCase().includes('kitchen')) return 'kitchen';
  if (st==='bathroom'||t?.toLowerCase().includes('bathroom')) return 'bathroom';
  if (st==='basement'||t?.toLowerCase().includes('basement')) return 'basement';
  return 'renovation';
}

async function enrichProjects() {
  console.log('\n📝 ENRICHING PROJECTS\n');
  const rows = await sql`SELECT id,slug,title_en,description_en,description_zh,service_type,location_city FROM projects WHERE is_published=true ORDER BY created_at`;
  console.log(`${rows.length} projects`);
  for (const p of rows) console.log(`  ${p.slug}: EN=${wc(p.description_en)}w ZH=${wc(p.description_zh)}w`);
  const thin = rows.filter(p => wc(p.description_en)<500 || wc(p.description_zh)<500);
  console.log(`${thin.length} need enrichment`);
  for (const p of thin) {
    const city = p.location_city||'Vancouver', svc = detectSvc(p.service_type, p.title_en);
    let en = p.description_en||'', zh = p.description_zh||'';
    if (wc(en)<500) for (const a of enParagraphs(city,svc)) { en+=a; if(wc(en)>=520) break; }
    if (wc(zh)<500) for (const a of zhParagraphs(city,svc)) { zh+=a; if(wc(zh)>=520) break; }
    if (en!==p.description_en||zh!==p.description_zh) {
      await sql`UPDATE projects SET description_en=${en},description_zh=${zh},updated_at=NOW() WHERE id=${p.id}`;
      console.log(`  ✅ ${p.slug}: EN ${wc(p.description_en)}→${wc(en)}w ZH ${wc(p.description_zh)}→${wc(zh)}w`);
    }
  }
}

async function enrichSites() {
  console.log('\n📝 ENRICHING SITES\n');
  const rows = await sql`SELECT id,slug,title_en,description_en,description_zh,location_city FROM project_sites WHERE is_published=true AND show_as_project=true`;
  const thin = rows.filter(s => wc(s.description_en)<500||wc(s.description_zh)<500);
  console.log(`${rows.length} sites, ${thin.length} thin`);
  for (const s of thin) {
    const city = s.location_city||'Vancouver';
    let en = s.description_en||'', zh = s.description_zh||'';
    if (wc(en)<500) for (const a of enParagraphs(city,'renovation')) { en+=a; if(wc(en)>=520) break; }
    if (wc(zh)<500) for (const a of zhParagraphs(city,'renovation')) { zh+=a; if(wc(zh)>=520) break; }
    if (en!==s.description_en||zh!==s.description_zh) {
      await sql`UPDATE project_sites SET description_en=${en},description_zh=${zh},updated_at=NOW() WHERE id=${s.id}`;
      console.log(`  ✅ ${s.slug}`);
    }
  }
}

async function expandFaqs() {
  console.log('\n❓ EXPANDING FAQS\n');
  const rows = await sql`SELECT id,question_en,answer_en,answer_zh FROM faqs WHERE is_active=true`;
  let u=0;
  for (const f of rows) {
    const ew=wc(f.answer_en), zw=wc(f.answer_zh);
    if (ew<40||zw<40) {
      let ne=f.answer_en, nz=f.answer_zh;
      if (ew<40) ne+=' At Reno Stars, we ensure every aspect of your renovation is handled professionally. Our experienced team provides personalized solutions tailored to your needs and budget, backed by our comprehensive warranty, $5M CGL insurance, and active WCB coverage.';
      if (zw<40) nz+=' Reno Stars确保装修的每个环节都由专业团队负责。我们根据您的需求和预算提供个性化方案，并提供全面的质保、CGL保险和WCB工伤保障。';
      await sql`UPDATE faqs SET answer_en=${ne},answer_zh=${nz},updated_at=NOW() WHERE id=${f.id}`;
      u++;
    }
  }
  console.log(`Updated ${u}/${rows.length} FAQs`);
}

async function fixAltText() {
  console.log('\n🖼️ FIXING ALT TEXT\n');
  const imgs = await sql`SELECT pip.id, pip.before_image_url, pip.after_image_url, pip.before_alt_text_en, pip.after_alt_text_en, p.title_en, p.title_zh, p.service_type, p.location_city FROM project_image_pairs pip JOIN projects p ON pip.project_id=p.id`;
  let f = 0;
  for (const i of imgs) {
    const c = i.location_city || 'Vancouver';
    const s = i.service_type || 'renovation';
    const sz = s === 'kitchen' ? '厨房' : s === 'bathroom' ? '卫浴' : s === 'basement' ? '地下室' : '';
    let bE: string | null = null, bZ: string | null = null;
    let aE: string | null = null, aZ: string | null = null;
    if (i.before_image_url && (!i.before_alt_text_en || i.before_alt_text_en.length < 10)) {
      bE = `Before photo of ${i.title_en} - ${c} ${s} renovation by Reno Stars`;
      bZ = `${i.title_zh}施工前 - ${c}${sz}装修 Reno Stars`;
    }
    if (i.after_image_url && (!i.after_alt_text_en || i.after_alt_text_en.length < 10)) {
      aE = `After photo of ${i.title_en} - ${c} ${s} renovation by Reno Stars`;
      aZ = `${i.title_zh}施工后 - ${c}${sz}装修完成 Reno Stars`;
    }
    if (bE || aE) {
      await sql`UPDATE project_image_pairs SET before_alt_text_en=COALESCE(${bE}, before_alt_text_en), before_alt_text_zh=COALESCE(${bZ}, before_alt_text_zh), after_alt_text_en=COALESCE(${aE}, after_alt_text_en), after_alt_text_zh=COALESCE(${aZ}, after_alt_text_zh) WHERE id=${i.id}`;
      f++;
    }
  }
  console.log(`Fixed ${f}/${imgs.length} project images`);

  const si = await sql`SELECT sip.id, sip.before_image_url, sip.after_image_url, sip.before_alt_text_en, sip.after_alt_text_en, ps.title_en, ps.title_zh, ps.location_city FROM site_image_pairs sip JOIN project_sites ps ON sip.site_id=ps.id`;
  let sf = 0;
  for (const i of si) {
    const c = i.location_city || 'Vancouver';
    let bE: string | null = null, bZ: string | null = null;
    let aE: string | null = null, aZ: string | null = null;
    if (i.before_image_url && (!i.before_alt_text_en || i.before_alt_text_en.length < 10)) {
      bE = `Before - ${i.title_en} ${c} renovation Reno Stars`;
      bZ = `${i.title_zh}施工前 - ${c}装修 Reno Stars`;
    }
    if (i.after_image_url && (!i.after_alt_text_en || i.after_alt_text_en.length < 10)) {
      aE = `After - ${i.title_en} ${c} renovation Reno Stars`;
      aZ = `${i.title_zh}施工后 - ${c}装修完成 Reno Stars`;
    }
    if (bE || aE) {
      await sql`UPDATE site_image_pairs SET before_alt_text_en=COALESCE(${bE}, before_alt_text_en), before_alt_text_zh=COALESCE(${bZ}, before_alt_text_zh), after_alt_text_en=COALESCE(${aE}, after_alt_text_en), after_alt_text_zh=COALESCE(${aZ}, after_alt_text_zh) WHERE id=${i.id}`;
      sf++;
    }
  }
  console.log(`Fixed ${sf}/${si.length} site images`);
}

async function improveBlogMeta() {
  console.log('\n📰 IMPROVING BLOG META\n');
  const posts = await sql`SELECT id, slug, title_en, title_zh, excerpt_en, excerpt_zh, meta_description_en, meta_description_zh, content_en, content_zh FROM blog_posts WHERE is_published=true`;
  let u = 0;
  for (const p of posts) {
    let mE = p.meta_description_en;
    let mZ = p.meta_description_zh;
    let changed = false;
    if (!mE || mE.length < 80) {
      const plain = (p.excerpt_en || p.content_en || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      mE = plain.substring(0, 150).replace(/\s\S*$/, '') + '...';
      if (mE.length < 80) mE = p.title_en + '. Expert renovation tips from Reno Stars Vancouver.';
      if (mE.length > 155) mE = mE.substring(0, 152) + '...';
      changed = true;
    }
    if (!mZ || mZ.length < 30) {
      const plain = (p.excerpt_zh || p.content_zh || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      mZ = plain.substring(0, 150);
      if (mZ.length < 30) mZ = p.title_zh + '。Reno Stars温哥华专业装修指南。';
      if (mZ.length > 155) mZ = mZ.substring(0, 152) + '...';
      changed = true;
    }
    if (changed) {
      await sql`UPDATE blog_posts SET meta_description_en=${mE}, meta_description_zh=${mZ}, updated_at=NOW() WHERE id=${p.id}`;
      u++;
      console.log('  ✅ ' + p.slug);
    }
  }
  console.log(`Updated ${u}/${posts.length} blog posts`);
}

async function main() {
  console.log('🚀 SEO Enrichment Script\n');
  await enrichProjects();
  await enrichSites();
  await expandFaqs();
  await fixAltText();
  await improveBlogMeta();
  console.log('\n✅ Done!');
}
main().catch(e => { console.error('❌', e); process.exit(1); });
