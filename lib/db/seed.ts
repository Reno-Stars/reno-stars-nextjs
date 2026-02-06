import { db } from './index';
import {
  services,
  serviceAreas,
  companyInfo,
  showroomInfo,
  trustBadges,
  socialLinks,
  aboutSections,
  galleryItems,
  faqs,
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
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/modern-white-kitchen-renovation.jpg',
        displayOrder: 1,
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
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/luxury-modern-bathroom-renovation.jpg',
        displayOrder: 2,
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
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/modern-open-concept-living-and-dining-room.jpg',
        displayOrder: 3,
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
        displayOrder: 4,
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
        displayOrder: 5,
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
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/from-1-skin-lab-granville-commercial-renovation.jpg',
        displayOrder: 6,
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
      foundingYear: 1997,
      teamSize: 17,
      warranty: '3 Years',
      liabilityCoverage: '$5M',
      rating: '5/5',
      reviewCount: 150,
      ratingSource: 'Google',
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
      whyChooseUsEn: 'Licensed, insured with $5M liability coverage, and backed by a 3-year warranty. Our 5-star Google rating and dedicated team of 17 professionals ensure your project is in expert hands.',
      whyChooseUsZh: '持证经营，拥有500万美元责任保险和3年保修。我们的Google五星好评和17人专业团队确保您的项目由专家负责。',
      letsBuildTogetherEn: 'Your dream home is just a conversation away. Whether you\'re planning a minor update or a major transformation, we\'d love to bring your vision to life.',
      letsBuildTogetherZh: '您的梦想之家只需一次对话。无论您是计划小幅更新还是大规模改造，我们都乐意将您的愿景变为现实。',
    });
    console.log('About sections seeded');
  } else {
    console.log('About sections already exist, skipping');
  }

  // Blog posts are seeded separately via `pnpm db:seed:blog` (crawls WP REST API)
  console.log('Blog posts: run `pnpm db:seed:blog` to seed from WordPress');

  // Seed Gallery Items (idempotent via unique constraint on image_url)
  await db
    .insert(galleryItems)
    .values([
      {
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/modern-white-kitchen-renovation.jpg',
        titleEn: 'Modern Kitchen',
        titleZh: '现代厨房',
        category: 'kitchen',
        displayOrder: 1,
      },
      {
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/luxury-modern-bathroom-renovation.jpg',
        titleEn: 'Luxury Bathroom',
        titleZh: '豪华浴室',
        category: 'bathroom',
        displayOrder: 2,
      },
      {
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/modern-open-concept-living-and-dining-room.jpg',
        titleEn: 'Open Concept Living',
        titleZh: '开放式客厅',
        category: 'whole-house',
        displayOrder: 3,
      },
      {
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/bright-and-cozy-dining-living-room.jpg',
        titleEn: 'Cozy Dining Room',
        titleZh: '温馨餐厅',
        category: 'whole-house',
        displayOrder: 4,
      },
      {
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/from-1-skin-lab-granville-commercial-renovation.jpg',
        titleEn: 'Commercial Space',
        titleZh: '商业空间',
        category: 'commercial',
        displayOrder: 5,
      },
      {
        imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/brightened-whole-house-renovation-living-room.jpg',
        titleEn: 'Bright Living Room',
        titleZh: '明亮客厅',
        category: 'whole-house',
        displayOrder: 6,
      },
    ])
    .onConflictDoNothing({ target: galleryItems.imageUrl });
  console.log('Gallery items seeded');

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
        answerEn: 'Reno Stars is committed to delivering high-quality craftsmanship with over {yearsExperience} years of combined experience. We offer $5M liability coverage, a 3-year warranty on all work, transparent pricing, and a dedicated team of 17 professionals. Our 5-star Google rating reflects our commitment to customer satisfaction.',
        answerZh: 'Reno Stars 始终致力于提供高品质的工艺，拥有超过{yearsExperience}年的综合经验。我们提供500万美元责任保险、所有工程3年质保、透明定价和17人专业团队。我们的Google五星好评反映了我们对客户满意度的承诺。',
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

  console.log('Database seeded successfully!');
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });
