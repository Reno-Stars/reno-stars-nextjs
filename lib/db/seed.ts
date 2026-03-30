import { sql } from 'drizzle-orm';
import { db } from './index';
import { COMPANY_STATS, getYearsExperience } from '@/lib/company-config';
import {
  services,
  serviceAreas,
  companyInfo,
  showroomInfo,
  trustBadges,
  socialLinks,
  aboutSections,
  designs,
  faqs,
  partners,
} from './schema';

async function seed() {
  console.log('Seeding database...');

  // Seed Services (upsert - insert or skip on conflict)
  await db
    .insert(services)
    .values([
      {
        slug: 'kitchen',
        titleEn: 'Kitchen Renovation',
        titleZh: '厨房装修',
        descriptionEn: 'Complete kitchen remodeling with modern designs, custom cabinetry, and premium countertops.',
        descriptionZh: '全面的厨房改造，融合现代设计、定制橱柜和高端台面。',
        longDescriptionEn:
          'Transform your kitchen into the heart of your home with our comprehensive renovation services. From custom cabinetry and premium countertops to state-of-the-art appliances and innovative storage solutions, we create kitchens that are both beautiful and functional.',
        longDescriptionZh:
          '将您的厨房打造成家的核心空间。从定制橱柜和高端台面到先进家电和创新储物解决方案，我们创造既美观又实用的厨房。',
        iconName: 'Hammer',
        iconUrl: '/icons/services/hammer.svg',
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/modern-white-kitchen-renovation.jpg',
        displayOrder: 1,
        showOnServicesPage: true,
        isProjectType: true,
      },
      {
        slug: 'bathroom',
        titleEn: 'Bathroom Renovation',
        titleZh: '卫浴装修',
        descriptionEn: 'Transform your bathroom into a spa-like retreat with luxury fixtures and finishes.',
        descriptionZh: '将您的浴室打造成水疗般的休憩空间，配备豪华洁具和精美饰面。',
        longDescriptionEn:
          'Create your personal sanctuary with our bathroom renovation expertise. We specialize in luxury spa-inspired designs, modern fixtures, custom tile work, and innovative storage solutions that maximize both style and functionality.',
        longDescriptionZh:
          '通过我们的浴室装修专业知识，创造您的私人休憩空间。我们专注于豪华水疗风格设计、现代洁具、定制瓷砖工艺和创新储物解决方案。',
        iconName: 'Bath',
        iconUrl: '/icons/services/bath.svg',
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/luxury-modern-bathroom-renovation.jpg',
        displayOrder: 2,
        showOnServicesPage: true,
        isProjectType: true,
      },
      {
        slug: 'whole-house',
        titleEn: 'Whole House Renovation',
        titleZh: '全屋装修',
        descriptionEn: 'Full-scale home transformations from concept to completion.',
        descriptionZh: '从概念到完工的全方位家居改造。',
        longDescriptionEn:
          'Experience a complete home transformation with our whole house renovation services. We manage every aspect of your project, from initial design concepts through final completion, ensuring a seamless renovation experience.',
        longDescriptionZh:
          '通过我们的全屋装修服务体验完整的家居改造。我们管理项目的每个方面，从初始设计概念到最终完成，确保无缝的装修体验。',
        iconName: 'Home',
        iconUrl: '/icons/services/home.svg',
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/modern-open-concept-living-and-dining-room.jpg',
        displayOrder: 3,
        showOnServicesPage: true,
        isProjectType: true,
      },
      {
        slug: 'basement',
        titleEn: 'Basement Remodeling',
        titleZh: '地下室改造',
        descriptionEn: 'Convert your basement into functional living space. Ranked 3rd in Best of Vancouver.',
        descriptionZh: '将地下室改造为功能性生活空间。温哥华最佳排名第三。',
        longDescriptionEn:
          'Unlock the full potential of your home with our award-winning basement remodeling services. Whether you want a home theater, gym, guest suite, or home office, we transform underutilized basements into beautiful, functional living spaces.',
        longDescriptionZh:
          '通过我们屡获殊荣的地下室改造服务，释放您家的全部潜力。无论您想要家庭影院、健身房、客房套间还是家庭办公室，我们都能将闲置的地下室改造成美丽实用的生活空间。',
        iconName: 'ArrowDown',
        iconUrl: '/icons/services/arrow-down.svg',
        displayOrder: 4,
        showOnServicesPage: true,
        isProjectType: true,
      },
      {
        slug: 'cabinet',
        titleEn: 'Cabinet Refacing',
        titleZh: '橱柜翻新',
        descriptionEn: 'Refresh your kitchen look with professional cabinet refacing services.',
        descriptionZh: '通过专业的橱柜翻新服务焕新您的厨房面貌。',
        longDescriptionEn:
          "Give your kitchen a stunning new look without the cost of a full renovation. Our cabinet refacing services include new doors, drawer fronts, and hardware, transforming your kitchen's appearance while preserving your existing cabinet boxes.",
        longDescriptionZh:
          '无需全面装修的成本，即可让您的厨房焕然一新。我们的橱柜翻新服务包括新门板、抽屉面板和五金件，在保留现有橱柜箱体的同时改变厨房的外观。',
        iconName: 'Paintbrush',
        iconUrl: '/icons/services/paintbrush.svg',
        displayOrder: 5,
        showOnServicesPage: true,
        isProjectType: true,
      },
      {
        slug: 'commercial',
        titleEn: 'Commercial Renovation',
        titleZh: '商业装修',
        descriptionEn: 'Professional commercial space renovations for offices, retail, and restaurants.',
        descriptionZh: '专业的商业空间装修，包括办公室、零售店和餐厅。',
        longDescriptionEn:
          'Elevate your business space with our commercial renovation expertise. We handle office build-outs, retail store renovations, restaurant redesigns, and more, delivering professional results that enhance your brand and customer experience.',
        longDescriptionZh:
          '通过我们的商业装修专业知识提升您的商业空间。我们处理办公室建设、零售店装修、餐厅重新设计等，提供专业成果，提升您的品牌和客户体验。',
        iconName: 'Building2',
        iconUrl: '/icons/services/building-2.svg',
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/from-1-skin-lab-granville-commercial-renovation.jpg',
        displayOrder: 6,
        showOnServicesPage: true,
        isProjectType: true,
      },
    ])
    .onConflictDoNothing({ target: services.slug });

  console.log('Services seeded');

  // Seed Service Areas (upsert)
  await db
    .insert(serviceAreas)
    .values([
      {
        slug: 'vancouver',
        nameEn: 'Vancouver',
        nameZh: '温哥华',
        descriptionEn:
          'Serving the greater Vancouver area with quality renovations.',
        descriptionZh: '为大温哥华地区提供优质装修服务。',
        displayOrder: 1,
      },
      {
        slug: 'richmond',
        nameEn: 'Richmond',
        nameZh: '列治文',
        descriptionEn: 'Professional renovation services in Richmond.',
        descriptionZh: '列治文专业装修服务。',
        displayOrder: 2,
      },
      {
        slug: 'burnaby',
        nameEn: 'Burnaby',
        nameZh: '本拿比',
        descriptionEn: 'Expert renovations in Burnaby.',
        descriptionZh: '本拿比专业装修。',
        displayOrder: 3,
      },
      {
        slug: 'surrey',
        nameEn: 'Surrey',
        nameZh: '素里',
        descriptionEn: 'Quality renovations across Surrey.',
        descriptionZh: '素里优质装修服务。',
        displayOrder: 4,
      },
      {
        slug: 'coquitlam',
        nameEn: 'Coquitlam',
        nameZh: '高贵林',
        descriptionEn: 'Serving Coquitlam with premium renovations.',
        descriptionZh: '高贵林高端装修服务。',
        displayOrder: 5,
      },
      {
        slug: 'north-vancouver',
        nameEn: 'North Vancouver',
        nameZh: '北温哥华',
        descriptionEn: 'Renovations in North Vancouver.',
        descriptionZh: '北温哥华装修服务。',
        displayOrder: 6,
      },
      {
        slug: 'west-vancouver',
        nameEn: 'West Vancouver',
        nameZh: '西温哥华',
        descriptionEn: 'Luxury renovations in West Vancouver.',
        descriptionZh: '西温哥华豪华装修。',
        displayOrder: 7,
      },
      {
        slug: 'new-westminster',
        nameEn: 'New Westminster',
        nameZh: '新西敏',
        descriptionEn: 'Renovation services in New Westminster.',
        descriptionZh: '新西敏装修服务。',
        displayOrder: 8,
      },
      {
        slug: 'delta',
        nameEn: 'Delta',
        nameZh: '三角洲',
        descriptionEn: 'Professional renovations in Delta.',
        descriptionZh: '三角洲专业装修。',
        displayOrder: 9,
      },
      {
        slug: 'langley',
        nameEn: 'Langley',
        nameZh: '兰里',
        descriptionEn: 'Quality renovations in Langley.',
        descriptionZh: '兰里优质装修。',
        displayOrder: 10,
      },
      {
        slug: 'port-moody',
        nameEn: 'Port Moody',
        nameZh: '满地宝',
        descriptionEn: 'Serving Port Moody with expert renovations.',
        descriptionZh: '满地宝专业装修服务。',
        displayOrder: 11,
      },
      {
        slug: 'maple-ridge',
        nameEn: 'Maple Ridge',
        nameZh: '枫树岭',
        descriptionEn: 'Renovations in Maple Ridge.',
        descriptionZh: '枫树岭装修服务。',
        displayOrder: 12,
      },
      {
        slug: 'white-rock',
        nameEn: 'White Rock',
        nameZh: '白石',
        descriptionEn: 'Premium renovations in White Rock.',
        descriptionZh: '白石高端装修。',
        displayOrder: 13,
      },
      {
        slug: 'port-coquitlam',
        nameEn: 'Port Coquitlam',
        nameZh: '高贵林港',
        descriptionEn: 'Renovation services in Port Coquitlam.',
        descriptionZh: '高贵林港装修服务。',
        displayOrder: 14,
      },
    ])
    .onConflictDoNothing({ target: serviceAreas.slug });

  console.log('Service areas seeded');

  // Seed Company Info (upsert by name)
  const existingCompany = await db.select().from(companyInfo).limit(1);
  if (existingCompany.length === 0) {
    await db.insert(companyInfo).values({
      name: 'Reno Stars',
      tagline: 'Where Renovation Starts',
      phone: '778-960-7999',
      email: 'info@reno-stars.com',
      address: '21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2',
      logoUrl: '/logo.jpg',
      quoteUrl: '/contact/',
      // foundingYear, teamSize, warranty, liabilityCoverage in lib/company-config.ts
      // rating/reviewCount now fetched from Google Reviews API
      geoLatitude: '49.1666',
      geoLongitude: '-123.1336',
    });
    console.log('Company info seeded');
  } else {
    console.log('Company info already exists, skipping');
  }

  // Seed Showroom Info (upsert)
  const existingShowroom = await db.select().from(showroomInfo).limit(1);
  if (existingShowroom.length === 0) {
    await db.insert(showroomInfo).values({
      address: '21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2',
      appointmentTextEn:
        'Welcome to schedule a visit to our Renovation showroom by appointment!',
      appointmentTextZh: '欢迎预约参观我们的装修展厅！',
      phone: '778-960-7999',
      email: 'info@reno-stars.com',
      hoursOpen: '9:00 AM',
      hoursClose: '5:00 PM',
    });
    console.log('Showroom info seeded');
  } else {
    console.log('Showroom info already exists, skipping');
  }

  // Seed Trust Badges (idempotent via unique constraint on badgeEn)
  await db
    .insert(trustBadges)
    .values([
      {
        badgeEn: 'Ranking 3rd in Best of Vancouver',
        badgeZh: '温哥华最佳排名第三',
        displayOrder: 1,
      },
      {
        badgeEn: '3 Best Basement Remodeling Companies',
        badgeZh: '三大最佳地下室改造公司',
        displayOrder: 2,
      },
      {
        badgeEn: '5-Star Google Rating',
        badgeZh: 'Google 五星好评',
        displayOrder: 3,
      },
    ])
    .onConflictDoNothing({ target: trustBadges.badgeEn });
  console.log('Trust badges seeded');

  // Seed Social Links (idempotent via unique constraint on platform)
  await db
    .insert(socialLinks)
    .values([
      {
        platform: 'xiaohongshu',
        url: 'https://www.xiaohongshu.com/user/profile/60ac9360000000000100410d',
        label: 'Xiaohongshu',
        displayOrder: 1,
      },
      {
        platform: 'wechat',
        url: '#',
        label: 'WeChat',
        displayOrder: 2,
      },
      {
        platform: 'instagram',
        url: 'https://www.instagram.com/renostarsvancouver/',
        label: 'Instagram',
        displayOrder: 3,
      },
      {
        platform: 'facebook',
        url: 'https://www.facebook.com/Reno-Stars-100374582261988',
        label: 'Facebook',
        displayOrder: 4,
      },
      {
        platform: 'whatsapp',
        url: 'https://wa.me/17789607999',
        label: 'WhatsApp',
        displayOrder: 5,
      },
      {
        platform: 'linktree',
        url: 'https://linktr.ee/qr/140df243-3ba8-49df-8770-53926aba2324',
        label: 'Linktree',
        displayOrder: 6,
      },
    ])
    .onConflictDoNothing({ target: socialLinks.platform });
  console.log('Social links seeded');

  // Seed About Sections (singleton)
  const existingAbout = await db.select().from(aboutSections).limit(1);
  if (existingAbout.length === 0) {
    await db.insert(aboutSections).values({
      ourJourneyEn: 'With over {yearsExperience} years of combined experience, Reno Stars has grown from a small family operation into one of Vancouver\'s most trusted renovation companies, delivering quality craftsmanship to hundreds of satisfied homeowners.',
      ourJourneyZh: '凭借超过{yearsExperience}年的综合经验，Reno Stars 从一个小型家族企业发展成为温哥华最受信赖的装修公司之一，为数百位满意的房主提供优质工艺。',
      whatWeOfferEn: 'From kitchen and bathroom renovations to full-scale whole house remodels, we provide end-to-end renovation services including design consultation, project management, and expert construction.',
      whatWeOfferZh: '从厨房和浴室装修到全屋改造，我们提供端到端的装修服务，包括设计咨询、项目管理和专业施工。',
      ourValuesEn: 'Integrity, quality, and client satisfaction drive everything we do. We believe in transparent communication, fair pricing, and standing behind our work with a comprehensive warranty.',
      ourValuesZh: '诚信、品质和客户满意是我们一切工作的驱动力。我们坚持透明沟通、公平定价，并以全面的保修为我们的工作提供保障。',
      whyChooseUsEn: `Licensed, insured with ${COMPANY_STATS.liabilityCoverage} CGL insurance, active WCB coverage, and backed by up to a 3-year warranty. Our 5-star Google rating and dedicated team of ${COMPANY_STATS.teamSize}+ professionals ensure your project is in expert hands.`,
      whyChooseUsZh: `持证经营，拥有至多${COMPANY_STATS.liabilityCoverage.replace('Up to ', '')}CGL保险、有效WCB工伤保障及至多3年质保。我们的Google五星好评和${COMPANY_STATS.teamSize}人专业团队确保您的项目由专家负责。`,
      letsBuildTogetherEn: 'Your dream home is just a conversation away. Whether you\'re planning a minor update or a major transformation, we\'d love to bring your vision to life.',
      letsBuildTogetherZh: '您的梦想之家只需一次对话。无论您是计划小幅更新还是大规模改造，我们都乐意将您的愿景变为现实。',
    });
    console.log('About sections seeded');
  } else {
    console.log('About sections already exist, skipping');
  }

  // Blog posts are seeded separately via `pnpm db:seed:blog` (crawls WP REST API)
  console.log('Blog posts: run `pnpm db:seed:blog` to seed from WordPress');

  // Seed Design Items (idempotent via unique constraint on image_url)
  // 57 images uploaded to R2 under uploads/designs/
  const R2 = process.env.S3_PUBLIC_URL || 'https://pub-c1ab6c279d0b4d818f91cee00ab3defe.r2.dev';
  await db
    .insert(designs)
    .values([
      { imageUrl: `${R2}/uploads/designs/8c79e5d9eff5e21b435fd551bf296b0.png`, titleEn: 'Kitchen Design', titleZh: '厨房设计', displayOrder: 1 },
      { imageUrl: `${R2}/uploads/designs/faf3daf54872b70a8addecea2ccf41e.png`, titleEn: 'Kitchen Design Concept', titleZh: '厨房设计概念', displayOrder: 2 },
      { imageUrl: `${R2}/uploads/designs/dff5ad1d3a3c1fa4583e49943cc07ec.png`, titleEn: 'Interior Design Concept', titleZh: '室内设计概念', displayOrder: 3 },
      { imageUrl: `${R2}/uploads/designs/e5a0078cf93deae29107652b51b3829.png`, titleEn: 'Renovation Design Rendering', titleZh: '装修设计效果图', displayOrder: 4 },
      { imageUrl: `${R2}/uploads/designs/a984f898a591d5e747fd71f0e6b388d.png`, titleEn: 'Living Space Design', titleZh: '生活空间设计', displayOrder: 5 },
      { imageUrl: `${R2}/uploads/designs/f6c18ffcaadf6253e584f7b421e888c.png`, titleEn: 'Bathroom Design Rendering', titleZh: '浴室设计效果图', displayOrder: 6 },
      { imageUrl: `${R2}/uploads/designs/75b2c5d0915a977e6207ef2191928a6.png`, titleEn: 'Bathroom Design', titleZh: '浴室设计', displayOrder: 7 },
      { imageUrl: `${R2}/uploads/designs/961f7913f7a54d6dbc65780b477701f.png`, titleEn: 'Interior Design', titleZh: '室内设计', displayOrder: 8 },
      { imageUrl: `${R2}/uploads/designs/0033ba65c482f1ee5fd94608f056027.png`, titleEn: 'Modern Interior Design', titleZh: '现代室内设计', displayOrder: 9 },
      { imageUrl: `${R2}/uploads/designs/02a4d273d39b45492c3ab7e089ab353.png`, titleEn: 'Contemporary Space Design', titleZh: '当代空间设计', displayOrder: 10 },
      { imageUrl: `${R2}/uploads/designs/0f42c9093a57c43c6a3b87270a02259.png`, titleEn: 'Home Renovation Concept', titleZh: '家居装修概念', displayOrder: 11 },
      { imageUrl: `${R2}/uploads/designs/14dcf282f8063b35c25af526ce76f7f.png`, titleEn: 'Interior Renovation Design', titleZh: '室内装修设计', displayOrder: 12 },
      { imageUrl: `${R2}/uploads/designs/240406-44-11.png`, titleEn: 'Design Portfolio', titleZh: '设计作品集', displayOrder: 13 },
      { imageUrl: `${R2}/uploads/designs/3b0ec47545db7a753009f25cdf10fd8.png`, titleEn: 'Elegant Interior Design', titleZh: '优雅室内设计', displayOrder: 14 },
      { imageUrl: `${R2}/uploads/designs/3bed3a9db24965dc75e12cea7c73b2b.png`, titleEn: 'Luxury Home Design', titleZh: '豪华家居设计', displayOrder: 15 },
      { imageUrl: `${R2}/uploads/designs/530d04aba5306027ab508872e1e469a.png`, titleEn: 'Modern Home Interior', titleZh: '现代家居内饰', displayOrder: 16 },
      { imageUrl: `${R2}/uploads/designs/5b24007ca594330dac0072834306c88.png`, titleEn: 'Residential Design', titleZh: '住宅设计', displayOrder: 17 },
      { imageUrl: `${R2}/uploads/designs/63a4f694eef444f4f8cf3b16211f0c5.png`, titleEn: 'Custom Home Design', titleZh: '定制家居设计', displayOrder: 18 },
      { imageUrl: `${R2}/uploads/designs/8fe183b8f1015e5ecd7e19fe595e9c9.png`, titleEn: 'Space Planning Design', titleZh: '空间规划设计', displayOrder: 19 },
      { imageUrl: `${R2}/uploads/designs/98f85407624524ad48bc6ed6d701b19.png`, titleEn: 'Architectural Interior', titleZh: '建筑室内设计', displayOrder: 20 },
      { imageUrl: `${R2}/uploads/designs/9e63419ada3897c118f3745d1895fda.png`, titleEn: 'Premium Interior Design', titleZh: '高端室内设计', displayOrder: 21 },
      { imageUrl: `${R2}/uploads/designs/ad7ffd75f77222e9158a59d9afe1f65.png`, titleEn: 'Renovation Blueprint', titleZh: '装修蓝图', displayOrder: 22 },
      { imageUrl: `${R2}/uploads/designs/b7779651de7f8deaef2268b3e5eceb8.png`, titleEn: 'Classic Interior Design', titleZh: '经典室内设计', displayOrder: 23 },
      { imageUrl: `${R2}/uploads/designs/c43bff58e112c73609db69050b17c7e.png`, titleEn: 'Modern Bathroom Design', titleZh: '现代浴室设计', displayOrder: 24 },
      { imageUrl: `${R2}/uploads/designs/c54948ac11f8f813b6391296d176ec4.png`, titleEn: 'Stylish Living Space', titleZh: '时尚生活空间', displayOrder: 25 },
      { imageUrl: `${R2}/uploads/designs/cd8b39e55896ff2335cb837100eda08.png`, titleEn: 'Contemporary Home Design', titleZh: '当代家居设计', displayOrder: 26 },
      { imageUrl: `${R2}/uploads/designs/d1e9262bb71eef1bcea7c7909ca6801.png`, titleEn: 'Refined Interior Design', titleZh: '精致室内设计', displayOrder: 27 },
      { imageUrl: `${R2}/uploads/designs/d7caf01d94e22aacbc316f43d873de0.png`, titleEn: 'Sophisticated Home Design', titleZh: '高雅家居设计', displayOrder: 28 },
      { imageUrl: `${R2}/uploads/designs/db5c827019d09e2bf914af0136074f6.png`, titleEn: 'Minimalist Interior', titleZh: '极简室内设计', displayOrder: 29 },
      { imageUrl: `${R2}/uploads/designs/dd7489c0028accf8a7e3466ca9253d7.png`, titleEn: 'Functional Space Design', titleZh: '功能空间设计', displayOrder: 30 },
      { imageUrl: `${R2}/uploads/designs/washroom-black-large-tile-6.png`, titleEn: 'Black Tile Bathroom', titleZh: '黑色瓷砖浴室', displayOrder: 31 },
      { imageUrl: `${R2}/uploads/designs/washroom-black-large-tile-7.png`, titleEn: 'Dark Tile Bathroom Design', titleZh: '深色瓷砖浴室设计', displayOrder: 32 },
      { imageUrl: `${R2}/uploads/designs/large-kitchen-240409.png`, titleEn: 'Large Kitchen Design', titleZh: '大型厨房设计', displayOrder: 33 },
      { imageUrl: `${R2}/uploads/designs/powder-room-1.png`, titleEn: 'Powder Room Design', titleZh: '化妆间设计', displayOrder: 34 },
      { imageUrl: `${R2}/uploads/designs/powder-room-3.png`, titleEn: 'Elegant Powder Room', titleZh: '优雅化妆间', displayOrder: 35 },
      { imageUrl: `${R2}/uploads/designs/powder-room-4.png`, titleEn: 'Modern Powder Room', titleZh: '现代化妆间', displayOrder: 36 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-149.jpg`, titleEn: 'Commercial Space Design', titleZh: '商业空间设计', displayOrder: 37 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-150.jpg`, titleEn: 'Commercial Interior Design', titleZh: '商业室内设计', displayOrder: 38 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-151.jpg`, titleEn: 'Commercial Renovation Design', titleZh: '商业装修设计', displayOrder: 39 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-152.jpg`, titleEn: 'Commercial Design Concept', titleZh: '商业设计概念', displayOrder: 40 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-153.jpg`, titleEn: 'Design Showcase', titleZh: '设计展示', displayOrder: 41 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-154.jpg`, titleEn: 'Interior Showcase', titleZh: '室内展示', displayOrder: 42 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-155.jpg`, titleEn: 'Renovation Showcase', titleZh: '装修展示', displayOrder: 43 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-156.jpg`, titleEn: 'Commercial Space Rendering', titleZh: '商业空间效果图', displayOrder: 44 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-157.jpg`, titleEn: 'Commercial Interior Rendering', titleZh: '商业室内效果图', displayOrder: 45 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-158.jpg`, titleEn: 'Design Rendering', titleZh: '设计效果图', displayOrder: 46 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-159.jpg`, titleEn: 'Commercial Design Plan', titleZh: '商业设计方案', displayOrder: 47 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-164.jpg`, titleEn: 'Space Design Concept', titleZh: '空间设计概念', displayOrder: 48 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-165.jpg`, titleEn: 'Interior Design Plan', titleZh: '室内设计方案', displayOrder: 49 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-166.jpg`, titleEn: 'Renovation Plan', titleZh: '装修方案', displayOrder: 50 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-167.jpg`, titleEn: 'Home Design Concept', titleZh: '家居设计概念', displayOrder: 51 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-168.jpg`, titleEn: 'Project Design', titleZh: '项目设计', displayOrder: 52 },
      { imageUrl: `${R2}/uploads/designs/wechat-img-169.jpg`, titleEn: 'Design Detail', titleZh: '设计细节', displayOrder: 53 },
      { imageUrl: `${R2}/uploads/designs/img-e6734.jpg`, titleEn: 'Interior Photo', titleZh: '室内照片', displayOrder: 54 },
      { imageUrl: `${R2}/uploads/designs/img-e6735.jpg`, titleEn: 'Design Photo', titleZh: '设计照片', displayOrder: 55 },
      { imageUrl: `${R2}/uploads/designs/img-e6736.jpg`, titleEn: 'Renovation Photo', titleZh: '装修照片', displayOrder: 56 },
      { imageUrl: `${R2}/uploads/designs/img-e6737.jpg`, titleEn: 'Project Photo', titleZh: '项目照片', displayOrder: 57 },
    ])
    .onConflictDoNothing({ target: designs.imageUrl });
  console.log('Design items seeded (57 items)');

  // Seed FAQs (idempotent via display_order check)
  const existingFaqs = await db.select().from(faqs).limit(1);
  if (existingFaqs.length === 0) {
    await db.insert(faqs).values([
      {
        questionEn: 'What services does Reno Stars provide?',
        questionZh: 'Reno Stars 提供哪些服务？',
        answerEn: 'Reno Stars provides comprehensive renovation services including kitchen renovation, bathroom renovation, whole house remodeling, basement finishing, cabinet refacing, and commercial renovations. We handle everything from initial design consultation through final completion.',
        answerZh: 'Reno Stars 提供广泛的装修服务，包括厨房装修、卫浴装修、全屋改造、地下室装修、橱柜翻新和商业装修。我们负责从初始设计咨询到最终完工的所有事项。',
        displayOrder: 1,
      },
      {
        questionEn: 'Why choose Reno Stars?',
        questionZh: '为什么要选择 Reno Stars？',
        answerEn: `Reno Stars is committed to delivering high-quality craftsmanship with over ${getYearsExperience()} years of combined experience. We carry ${COMPANY_STATS.liabilityCoverage} CGL insurance, maintain active WCB coverage, offer up to 3 years warranty on all work, transparent pricing, and ${COMPANY_STATS.projectsCompleted} successfully completed projects. Our 5-star Google rating reflects our commitment to customer satisfaction.`,
        answerZh: `Reno Stars 始终致力于提供高品质的工艺，拥有超过${getYearsExperience()}年的综合经验。我们拥有至多${COMPANY_STATS.liabilityCoverage.replace('Up to ', '')}CGL保险、有效WCB工伤保障、至多3年质保、透明定价，已成功完成${COMPANY_STATS.projectsCompleted}项目。我们的Google五星好评反映了我们对客户满意度的承诺。`,
        displayOrder: 2,
      },
      {
        questionEn: 'How can I contact Reno Stars?',
        questionZh: '如何联系 Reno Stars？',
        answerEn: 'You can reach us by phone at 778-960-7999, email at info@reno-stars.com, or visit our showroom at 21300 Gordon Way, Unit 188, Richmond, BC (by appointment). We also respond to inquiries via WeChat, WhatsApp, Instagram, and Facebook.',
        answerZh: '您可以通过电话 778-960-7999、邮箱 info@reno-stars.com 联系我们，或预约参观我们位于 Richmond 的展厅（21300 Gordon Way, Unit 188）。我们也通过微信、WhatsApp、Instagram 和 Facebook 回复咨询。',
        displayOrder: 3,
      },
      {
        questionEn: 'How long does a typical renovation take?',
        questionZh: '一般装修需要多长时间？',
        answerEn: 'Project timelines vary based on scope and complexity. A bathroom renovation typically takes 2-4 weeks, kitchen renovations 4-8 weeks, and whole house remodels 3-6 months. During your free consultation, we provide a detailed timeline specific to your project.',
        answerZh: '项目时间根据范围和复杂程度而有所不同。浴室装修通常需要2-4周，厨房装修需要4-8周，全屋改造需要3-6个月。在免费咨询期间，我们会为您的项目提供详细的时间表。',
        displayOrder: 4,
      },
      {
        questionEn: 'Do you offer free estimates?',
        questionZh: '你们提供免费报价吗？',
        answerEn: 'Yes! We offer free in-home consultations and detailed estimates for all renovation projects. Our team will assess your space, discuss your vision, and provide a transparent quote with no hidden fees. Contact us to schedule your free consultation.',
        answerZh: '是的！我们为所有装修项目提供免费上门咨询和详细报价。我们的团队将评估您的空间，讨论您的愿景，并提供透明的报价，没有任何隐藏费用。请联系我们预约免费咨询。',
        displayOrder: 5,
      },
    ]);
    console.log('FAQs seeded');
  } else {
    console.log('FAQs already exist, skipping');
  }

  // Seed Partners (upsert - insert or skip on conflict)
  await db
    .insert(partners)
    .values([
      {
        nameEn: 'Home Depot',
        nameZh: '家得宝',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/TheHomeDepot.svg/512px-TheHomeDepot.svg.png',
        websiteUrl: 'https://www.homedepot.ca',
        displayOrder: 0,
      },
      {
        nameEn: 'IKEA',
        nameZh: '宜家',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ikea_logo.svg/512px-Ikea_logo.svg.png',
        websiteUrl: 'https://www.ikea.com/ca',
        displayOrder: 1,
      },
      {
        nameEn: 'Kohler',
        nameZh: '科勒',
        logoUrl: 'https://cdn.worldvectorlogo.com/logos/kohler.svg',
        websiteUrl: 'https://www.kohler.ca',
        displayOrder: 2,
      },
      {
        nameEn: 'Moen',
        nameZh: '摩恩',
        logoUrl: 'https://cdn.worldvectorlogo.com/logos/moen.svg',
        websiteUrl: 'https://www.moen.ca',
        displayOrder: 3,
      },
      {
        nameEn: 'Delta Faucet',
        nameZh: 'Delta 水龙头',
        logoUrl: 'https://cdn.worldvectorlogo.com/logos/delta-faucet.svg',
        websiteUrl: 'https://www.deltafaucet.ca',
        displayOrder: 4,
      },
      {
        nameEn: 'Benjamin Moore',
        nameZh: 'Benjamin Moore',
        logoUrl: 'https://cdn.worldvectorlogo.com/logos/benjamin-moore-paints-1.svg',
        websiteUrl: 'https://www.benjaminmoore.com',
        displayOrder: 5,
      },
      {
        nameEn: 'Sherwin-Williams',
        nameZh: '宣伟涂料',
        logoUrl: 'https://cdn.worldvectorlogo.com/logos/sherwin-williams-2.svg',
        websiteUrl: 'https://www.sherwin-williams.com',
        displayOrder: 6,
      },
      {
        nameEn: 'Caesarstone',
        nameZh: 'Caesarstone',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Caesarstone_logo_-_2.png',
        websiteUrl: 'https://www.caesarstone.ca',
        displayOrder: 7,
      },
    ])
    .onConflictDoUpdate({
      target: partners.nameEn,
      set: {
        nameZh: sql`excluded.name_zh`,
        logoUrl: sql`excluded.logo_url`,
        websiteUrl: sql`excluded.website_url`,
        displayOrder: sql`excluded.display_order`,
      },
    });
  console.log('Partners seeded');

  console.log('Database seeded successfully!');
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });
