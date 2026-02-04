import type { ServiceArea, Locale, LocalizedArea } from '../types';

export const serviceAreas: ServiceArea[] = [
  {
    slug: 'vancouver',
    name: { en: 'Vancouver', zh: '温哥华' },
    description: {
      en: 'Premier renovation services in Vancouver, BC. From downtown condos to East Vancouver homes.',
      zh: '温哥华BC省首选装修服务。从市中心公寓到东温哥华住宅。',
    },
  },
  {
    slug: 'richmond',
    name: { en: 'Richmond', zh: '列治文' },
    description: {
      en: 'Quality home renovations in Richmond. Serving single-family homes and townhouses.',
      zh: '列治文优质家居装修。服务独立屋和联排别墅。',
    },
  },
  {
    slug: 'burnaby',
    name: { en: 'Burnaby', zh: '本拿比' },
    description: {
      en: 'Professional renovation contractor in Burnaby. Kitchen, bathroom, and whole house services.',
      zh: '本拿比专业装修承包商。厨房、卫浴和全屋服务。',
    },
  },
  {
    slug: 'north-vancouver',
    name: { en: 'North Vancouver', zh: '北温哥华' },
    description: {
      en: 'Trusted renovations in North Vancouver. Specializing in mountain-view home upgrades.',
      zh: '北温哥华值得信赖的装修服务。专注于山景住宅升级。',
    },
  },
  {
    slug: 'west-vancouver',
    name: { en: 'West Vancouver', zh: '西温哥华' },
    description: {
      en: 'Luxury home renovations in West Vancouver. Premium finishes and custom designs.',
      zh: '西温哥华豪宅装修。高端饰面和定制设计。',
    },
  },
  {
    slug: 'surrey',
    name: { en: 'Surrey', zh: '素里' },
    description: {
      en: 'Comprehensive renovation services across Surrey. From Cloverdale to South Surrey.',
      zh: '素里全面装修服务。从Cloverdale到南素里。',
    },
  },
  {
    slug: 'coquitlam',
    name: { en: 'Coquitlam', zh: '高贵林' },
    description: {
      en: 'Expert renovations in Coquitlam. Serving Burke Mountain to Town Centre.',
      zh: '高贵林专业装修。服务Burke Mountain到市中心。',
    },
  },
  {
    slug: 'langley',
    name: { en: 'Langley', zh: '兰里' },
    description: {
      en: 'Home renovation specialists in Langley. Quality craftsmanship for your home.',
      zh: '兰里家居装修专家。为您的家提供优质工艺。',
    },
  },
  {
    slug: 'new-westminster',
    name: { en: 'New Westminster', zh: '新西敏' },
    description: {
      en: 'Renovation services in New Westminster. Heritage and modern home specialists.',
      zh: '新西敏装修服务。传统和现代住宅专家。',
    },
  },
  {
    slug: 'delta',
    name: { en: 'Delta', zh: '三角洲' },
    description: {
      en: 'Trusted renovation contractor in Delta. Serving Ladner, Tsawwassen, and North Delta.',
      zh: '三角洲值得信赖的装修承包商。服务Ladner、Tsawwassen和北三角洲。',
    },
  },
  {
    slug: 'port-coquitlam',
    name: { en: 'Port Coquitlam', zh: '高贵林港' },
    description: {
      en: 'Professional home renovations in Port Coquitlam. Transform your living space.',
      zh: '高贵林港专业家居装修。焕新您的生活空间。',
    },
  },
  {
    slug: 'port-moody',
    name: { en: 'Port Moody', zh: '满地宝' },
    description: {
      en: 'Renovation services in Port Moody. From modern updates to complete transformations.',
      zh: '满地宝装修服务。从现代更新到完整改造。',
    },
  },
  {
    slug: 'maple-ridge',
    name: { en: 'Maple Ridge', zh: '枫树岭' },
    description: {
      en: 'Home renovation experts in Maple Ridge. Quality work for growing families.',
      zh: '枫树岭家居装修专家。为成长中的家庭提供优质工作。',
    },
  },
  {
    slug: 'white-rock',
    name: { en: 'White Rock', zh: '白石镇' },
    description: {
      en: 'Coastal home renovations in White Rock. Beach-inspired designs and upgrades.',
      zh: '白石镇海滨住宅装修。海滩风格设计和升级。',
    },
  },
];

export function getServiceAreas(): ServiceArea[] {
  return serviceAreas;
}

export function getServiceAreaBySlug(slug: string): ServiceArea | undefined {
  return serviceAreas.find((a) => a.slug === slug);
}

export function getLocalizedArea(area: ServiceArea, locale: Locale): LocalizedArea {
  return {
    slug: area.slug,
    name: area.name[locale],
    description: area.description?.[locale],
  };
}

export function getAllAreasLocalized(locale: Locale): LocalizedArea[] {
  return serviceAreas.map((a) => getLocalizedArea(a, locale));
}

export function getAreaNames(locale: Locale): string[] {
  return serviceAreas.map((a) => a.name[locale]);
}

// Get area slugs for static params
export function getAreaSlugs(): string[] {
  return serviceAreas.map((a) => a.slug);
}
