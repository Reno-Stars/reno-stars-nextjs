import type { Service, ServiceType, Locale } from '../types';

export const services: Service[] = [
  {
    slug: 'kitchen',
    title: {
      en: 'Kitchen Renovation',
      zh: '厨房装修',
    },
    description: {
      en: 'Complete kitchen remodeling with modern designs, custom cabinetry, and premium countertops.',
      zh: '全面的厨房改造，融合现代设计、定制橱柜和高端台面。',
    },
    long_description: {
      en: 'Transform your kitchen into the heart of your home with our comprehensive renovation services. From custom cabinetry and premium countertops to state-of-the-art appliances and innovative storage solutions, we create kitchens that are both beautiful and functional.',
      zh: '将您的厨房打造成家的核心空间。从定制橱柜和高端台面到先进家电和创新储物解决方案，我们创造既美观又实用的厨房。',
    },
    icon: 'Hammer',
    image: 'https://reno-stars.com/wp-content/uploads/2025/04/modern-white-kitchen-renovation.jpg',
  },
  {
    slug: 'bathroom',
    title: {
      en: 'Bathroom Renovation',
      zh: '卫浴装修',
    },
    description: {
      en: 'Transform your bathroom into a spa-like retreat with luxury fixtures and finishes.',
      zh: '将您的浴室打造成水疗般的休憩空间，配备豪华洁具和精美饰面。',
    },
    long_description: {
      en: 'Create your personal sanctuary with our bathroom renovation expertise. We specialize in luxury spa-inspired designs, modern fixtures, custom tile work, and innovative storage solutions that maximize both style and functionality.',
      zh: '通过我们的浴室装修专业知识，创造您的私人休憩空间。我们专注于豪华水疗风格设计、现代洁具、定制瓷砖工艺和创新储物解决方案。',
    },
    icon: 'Bath',
    image: 'https://reno-stars.com/wp-content/uploads/2025/04/luxury-modern-bathroom-renovation.jpg',
  },
  {
    slug: 'whole-house',
    title: {
      en: 'Whole House Renovation',
      zh: '全屋装修',
    },
    description: {
      en: 'Full-scale home transformations from concept to completion.',
      zh: '从概念到完工的全方位家居改造。',
    },
    long_description: {
      en: 'Experience a complete home transformation with our whole house renovation services. We manage every aspect of your project, from initial design concepts through final completion, ensuring a seamless renovation experience.',
      zh: '通过我们的全屋装修服务体验完整的家居改造。我们管理项目的每个方面，从初始设计概念到最终完成，确保无缝的装修体验。',
    },
    icon: 'Home',
    image: 'https://reno-stars.com/wp-content/uploads/2025/04/modern-open-concept-living-and-dining-room.jpg',
  },
  {
    slug: 'basement',
    title: {
      en: 'Basement Remodeling',
      zh: '地下室改造',
    },
    description: {
      en: 'Convert your basement into functional living space. Ranked 3rd in Best of Vancouver.',
      zh: '将地下室改造为功能性生活空间。温哥华最佳排名第三。',
    },
    long_description: {
      en: 'Unlock the full potential of your home with our award-winning basement remodeling services. Whether you want a home theater, gym, guest suite, or home office, we transform underutilized basements into beautiful, functional living spaces.',
      zh: '通过我们屡获殊荣的地下室改造服务，释放您家的全部潜力。无论您想要家庭影院、健身房、客房套间还是家庭办公室，我们都能将闲置的地下室改造成美丽实用的生活空间。',
    },
    icon: 'ArrowDown',
  },
  {
    slug: 'cabinet',
    title: {
      en: 'Cabinet Refacing',
      zh: '橱柜翻新',
    },
    description: {
      en: 'Refresh your kitchen look with professional cabinet refacing services.',
      zh: '通过专业的橱柜翻新服务焕新您的厨房面貌。',
    },
    long_description: {
      en: 'Give your kitchen a stunning new look without the cost of a full renovation. Our cabinet refacing services include new doors, drawer fronts, and hardware, transforming your kitchen\'s appearance while preserving your existing cabinet boxes.',
      zh: '无需全面装修的成本，即可让您的厨房焕然一新。我们的橱柜翻新服务包括新门板、抽屉面板和五金件，在保留现有橱柜箱体的同时改变厨房的外观。',
    },
    icon: 'Paintbrush',
  },
  {
    slug: 'commercial',
    title: {
      en: 'Commercial Renovation',
      zh: '商业装修',
    },
    description: {
      en: 'Professional commercial space renovations for offices, retail, and restaurants.',
      zh: '专业的商业空间装修，包括办公室、零售店和餐厅。',
    },
    long_description: {
      en: 'Elevate your business space with our commercial renovation expertise. We handle office build-outs, retail store renovations, restaurant redesigns, and more, delivering professional results that enhance your brand and customer experience.',
      zh: '通过我们的商业装修专业知识提升您的商业空间。我们处理办公室建设、零售店装修、餐厅重新设计等，提供专业成果，提升您的品牌和客户体验。',
    },
    icon: 'Building2',
    image: 'https://reno-stars.com/wp-content/uploads/2025/04/from-1-skin-lab-granville-commercial-renovation.jpg',
  },
];

export function getServices(): Service[] {
  return services;
}

export function getServiceBySlug(slug: ServiceType): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getLocalizedService(service: Service, locale: Locale) {
  return {
    slug: service.slug,
    title: service.title[locale],
    description: service.description[locale],
    long_description: service.long_description?.[locale],
    icon: service.icon,
    image: service.image,
  };
}

export function getAllServicesLocalized(locale: Locale) {
  return services.map((s) => getLocalizedService(s, locale));
}

// Map service types to category names
export const serviceTypeToCategory: Record<ServiceType, { en: string; zh: string }> = {
  kitchen: { en: 'Kitchen', zh: '厨房' },
  bathroom: { en: 'Bathroom', zh: '卫浴' },
  'whole-house': { en: 'Whole House', zh: '全屋' },
  basement: { en: 'Basement', zh: '地下室' },
  cabinet: { en: 'Cabinet', zh: '橱柜' },
  commercial: { en: 'Commercial', zh: '商业' },
};

export const categoryToServiceType: Record<string, ServiceType> = {
  'Kitchen': 'kitchen',
  'Bathroom': 'bathroom',
  'Whole House': 'whole-house',
  'Basement': 'basement',
  'Cabinet': 'cabinet',
  'Commercial': 'commercial',
  '厨房': 'kitchen',
  '卫浴': 'bathroom',
  '全屋': 'whole-house',
  '地下室': 'basement',
  '橱柜': 'cabinet',
  '商业': 'commercial',
};
