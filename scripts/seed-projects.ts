/**
 * Seed projects and sites from the production WordPress site into the database.
 * Usage: pnpm db:seed:projects
 *
 * NOTE: Run with NEXT_PUBLIC_STORAGE_PROVIDER unset so that raw
 * production URLs are stored in the database. getAssetUrl() is
 * applied at query-time, not at insert-time.
 */

// Load environment variables from .env.local (must be first)
import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../lib/db';
import {
  projects as projectsTable,
  projectImages,
  projectScopes,
  projectExternalProducts,
  projectSites,
  siteImages,
  services as servicesTable,
} from '../lib/db/schema';

// Valid service types (no 'whole-house' - that's represented by Sites)
type ServiceType = 'kitchen' | 'bathroom' | 'basement' | 'cabinet' | 'commercial';

interface ProjectData {
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  serviceType: ServiceType;
  categoryEn: string;
  categoryZh: string;
  locationCity: string;
  budgetRange: string;
  durationEn: string;
  durationZh: string;
  spaceTypeEn: string;
  spaceTypeZh: string;
  heroImageUrl: string;
  challengeEn?: string;
  challengeZh?: string;
  solutionEn?: string;
  solutionZh?: string;
  featured?: boolean;
  badgeEn?: string;
  badgeZh?: string;
  images: { url: string; altEn: string; altZh: string; isBefore?: boolean }[];
  scopes: { en: string; zh: string }[];
  externalProducts?: { url: string; imageUrl?: string; labelEn: string; labelZh: string }[];
}

interface SiteData {
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  locationCity: string;
  heroImageUrl: string;
  showAsProject: boolean;
  featured: boolean;
  badgeEn?: string;
  badgeZh?: string;
  // Project slugs to associate with this site
  projectSlugs: string[];
  // Site-level images (exterior/overview shots)
  images?: { imageUrl: string; altTextEn: string; altTextZh: string; isBefore: boolean }[];
}

// ============================================================================
// SITES DATA - These appear as "Whole House" projects in the listing
// ============================================================================
const SITES_RAW: SiteData[] = [
  {
    slug: 'langley-home-renovation',
    titleEn: 'A Stunning Home Renovation in Langley',
    titleZh: 'BC省兰里的惊艳家居翻新',
    descriptionEn: 'This comprehensive home renovation in Langley transforms a kitchen, bathroom, and basement into modern, functional spaces featuring white cabinetry, quartz countertops, and a central island with seating.',
    descriptionZh: '这个兰里的全面家居翻新项目将厨房、浴室和地下室改造成现代实用的空间，配备白色橱柜、石英台面和带座位的中央岛台。',
    locationCity: 'Langley',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/68.jpg',
    showAsProject: true,
    featured: true,
    badgeEn: 'Featured',
    badgeZh: '精选',
    projectSlugs: ['langley-kitchen-renovation', 'langley-bathroom-renovation', 'langley-basement-renovation'],
    images: [
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/68.jpg', altTextEn: 'Langley home kitchen after renovation', altTextZh: '兰里住宅厨房装修后', isBefore: false },
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/55.png', altTextEn: 'Langley home kitchen before renovation', altTextZh: '兰里住宅厨房装修前', isBefore: true },
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/73.jpg', altTextEn: 'Langley basement renovation', altTextZh: '兰里地下室装修', isBefore: false },
    ],
  },
  {
    slug: 'surrey-full-house-renovation',
    titleEn: 'Surrey Home Renovation Before and After',
    titleZh: '素里住宅装修前后对比',
    descriptionEn: 'Complete home renovation featuring customized kitchen cabinets, bathroom updates, staircase refinishing, and lighting upgrades throughout.',
    descriptionZh: '全面的住宅装修，包括定制厨房橱柜、浴室更新、楼梯翻新和全屋灯光升级。',
    locationCity: 'Surrey',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/richmond-kitchen-after-p1.png',
    showAsProject: true,
    featured: false,
    projectSlugs: ['surrey-customized-kitchen', 'surrey-bathroom-renovation', 'surrey-staircase-renovation'],
    images: [
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/richmond-kitchen-after-p1.png', altTextEn: 'Surrey home kitchen after', altTextZh: '素里住宅厨房装修后', isBefore: false },
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/richmond-kitchen-before-p1.png', altTextEn: 'Surrey home kitchen before', altTextZh: '素里住宅厨房装修前', isBefore: true },
    ],
  },
  {
    slug: 'richmond-full-house-renovation',
    titleEn: 'Modern House Full Renovation in Richmond',
    titleZh: '列治文现代全屋翻新',
    descriptionEn: 'Comprehensive full-house renovation featuring a modern kitchen redesign as the centerpiece, including updates to bathrooms, staircase, flooring, and fireplace.',
    descriptionZh: '全面的全屋翻新，以现代厨房改造为中心，包括浴室、楼梯、地板和壁炉的更新。',
    locationCity: 'Richmond',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/76.jpg',
    showAsProject: true,
    featured: true,
    badgeEn: 'Featured',
    badgeZh: '精选',
    projectSlugs: ['richmond-modern-kitchen', 'richmond-bathroom-update', 'richmond-flooring-staircase'],
    images: [
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/76.jpg', altTextEn: 'Richmond modern home overview', altTextZh: '列治文现代住宅概览', isBefore: false },
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p6-kitchen-after.png', altTextEn: 'Richmond kitchen after', altTextZh: '列治文厨房装修后', isBefore: false },
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p6-kitchen-before.png', altTextEn: 'Richmond kitchen before', altTextZh: '列治文厨房装修前', isBefore: true },
    ],
  },
  {
    slug: 'richmond-family-home',
    titleEn: 'Richmond Kitchen and Bathroom Remodel',
    titleZh: '列治文厨房和浴室改造',
    descriptionEn: 'Multi-room renovation utilizing warm toned white based materials, featuring kitchen and dining area remodeling alongside bathroom renovations, ceiling work, staircase updates, and closet installations.',
    descriptionZh: '采用暖色调白色基础材料的多房间装修，包括厨房和餐厅改造、浴室翻新、天花板工程、楼梯更新和衣柜安装。',
    locationCity: 'Richmond',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/richmond-kitchen-remodel-project-after-renovation.png',
    showAsProject: true,
    featured: false,
    projectSlugs: ['richmond-kitchen-remodel', 'richmond-bathrooms-remodel', 'richmond-ceiling-staircase'],
    images: [
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/richmond-kitchen-remodel-project-after-renovation.png', altTextEn: 'Richmond kitchen remodel after', altTextZh: '列治文厨房改造后', isBefore: false },
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/06/微信图片_20221125115328.jpg', altTextEn: 'Richmond kitchen before', altTextZh: '列治文厨房改造前', isBefore: true },
    ],
  },
  {
    slug: 'whole-house-kitchen-bedroom-site',
    titleEn: 'Whole House Renovation - From Kitchen to Bedroom',
    titleZh: '全屋翻新 - 从厨房到卧室',
    descriptionEn: 'A comprehensive home transformation project that modernized outdated interiors into a contemporary living space across kitchen, living/dining, and bathrooms.',
    descriptionZh: '全面的住宅改造项目，将过时的室内改造成现代生活空间，跨越厨房、客厅/餐厅和浴室。',
    locationCity: 'Richmond',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/03/whole-house-renovation-open-living-and-dining-space.jpg',
    showAsProject: true,
    featured: true,
    badgeEn: 'Featured',
    badgeZh: '精选',
    projectSlugs: ['whole-house-kitchen-to-bedroom'],
    images: [
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/03/whole-house-renovation-open-living-and-dining-space.jpg', altTextEn: 'Whole house renovation', altTextZh: '全屋翻新', isBefore: false },
    ],
  },
  {
    slug: 'coquitlam-modern-home-site',
    titleEn: 'Coquitlam Modern Home Renovation',
    titleZh: '高贵林现代住宅翻新',
    descriptionEn: 'Complete home renovation featuring cabinet refacing, wainscoting, custom cabinetry, and modern finishes throughout.',
    descriptionZh: '全面的住宅翻新，包括橱柜翻新、护墙板、定制橱柜和全屋现代饰面。',
    locationCity: 'Coquitlam',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p9-kitchen-after.png',
    showAsProject: true,
    featured: false,
    projectSlugs: ['coquitlam-cabinet-refacing', 'coquitlam-wainscoting-cabinet'],
    images: [
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p9-kitchen-after.png', altTextEn: 'Coquitlam kitchen after', altTextZh: '高贵林厨房装修后', isBefore: false },
    ],
  },
  {
    slug: 'delta-townhouse-site',
    titleEn: 'Delta Townhouse Kitchen and Bathroom Renovation',
    titleZh: 'Delta联排别墅厨房和浴室翻新',
    descriptionEn: 'Comprehensive dual-room renovation transforming an outdated kitchen and bathrooms into modern spaces with two-tone shaker cabinets and walk-in glass showers.',
    descriptionZh: '全面的双房间翻新，将过时的厨房和浴室改造成配备双色摇门橱柜和步入式玻璃淋浴的现代空间。',
    locationCity: 'Delta',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/90-2.png',
    showAsProject: true,
    featured: false,
    projectSlugs: ['delta-townhouse-kitchen', 'delta-townhouse-bathroom'],
    images: [
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/90-2.png', altTextEn: 'Delta kitchen after', altTextZh: 'Delta厨房装修后', isBefore: false },
      { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/88-2.png', altTextEn: 'Delta bathroom after', altTextZh: 'Delta浴室装修后', isBefore: false },
    ],
  },
];

// ============================================================================
// PROJECTS DATA - Individual room/area renovations
// ============================================================================
const PROJECTS_RAW: ProjectData[] = [
  // ===== COQUITLAM WHITE SHAKER KITCHEN (Standalone) =====
  {
    slug: 'coquitlam-white-shaker-kitchen',
    titleEn: 'Elegant White Shaker Kitchens in Coquitlam',
    titleZh: '高贵林优雅的白色摇门厨房',
    descriptionEn: 'A comprehensive kitchen remodel addressing outdated cabinetry, poor lighting, and limited spatial flow. The project involved removing the unnecessary dividing wall above the island to enhance natural light and create visual connectivity between kitchen and living spaces.',
    descriptionZh: '全面的厨房改造，解决过时橱柜、采光不足和空间流动性差的问题。项目拆除了岛台上方不必要的隔墙，增强自然光线并创造厨房与起居空间的视觉连通性。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Coquitlam',
    budgetRange: '$25,000 - $40,000',
    durationEn: '4 weeks', durationZh: '4周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/03/微信图片_20250303161101-mfrh-original-scaled.jpg',
    challengeEn: 'The existing kitchen had outdated, dark cabinets that made the space feel cramped. A wall obstruction above the island blocked natural light and outdoor views, while limited square footage created a confined feel with poor spatial flow.',
    challengeZh: '原有厨房配备过时的深色橱柜，使空间显得狭窄。岛台上方的墙体阻挡了自然光和户外视野，有限的面积造成局促感和不良的空间流动性。',
    solutionEn: 'We removed the dividing wall for enhanced brightness and openness, installed White Shaker cabinets with minimalist design for light reflection, added quartz countertops with marble veining for durability, and improved lighting and spatial connectivity throughout.',
    solutionZh: '我们拆除了隔墙以增强明亮度和开放感，安装了极简设计的白色摇门橱柜以反射光线，添加了带大理石纹理的石英台面以保证耐用性，并改善了整体照明和空间连通性。',
    featured: true,
    badgeEn: 'New', badgeZh: '新',
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/微信图片_20250303161101-mfrh-original-scaled.jpg', altEn: 'White Shaker kitchen after renovation', altZh: '白色摇门厨房装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/02/微信图片_20250228114131-1-scaled.jpg', altEn: 'Kitchen island with quartz countertop', altZh: '配备石英台面的厨房岛台' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/02/微信图片_20250228114139-mfrh-original-scaled.jpg', altEn: 'White cabinets with modern hardware', altZh: '配备现代五金的白色橱柜' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/02/微信图片_20250228114429-mfrh-original-scaled.jpg', altEn: 'Kitchen backsplash detail', altZh: '厨房后挡板细节' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/02/微信图片_20250228114441-mfrh-original-scaled.jpg', altEn: 'Open concept kitchen view', altZh: '开放式厨房视角' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/02/微信图片_20250228114455-mfrh-original-scaled.jpg', altEn: 'Kitchen storage cabinets', altZh: '厨房储物柜' },
    ],
    scopes: [
      { en: 'Wall Removal', zh: '拆墙' },
      { en: 'White Shaker Cabinetry', zh: '白色摇门橱柜' },
      { en: 'Quartz Countertops', zh: '石英台面' },
      { en: 'Backsplash', zh: '后挡板' },
      { en: 'Lighting', zh: '照明' },
    ],
  },

  // ===== SURREY WHITE TONED KITCHEN (Part of Surrey Whole House #3) =====
  {
    slug: 'surrey-white-toned-kitchen',
    titleEn: 'Kitchen Renovation in Surrey: White Toned Kitchen',
    titleZh: '素里厨房翻新：白色基调厨房',
    descriptionEn: 'The renovation transformed an outdated kitchen into a contemporary space. The original kitchen featured dark wooden cabinets, aging appliances, and a poorly optimized layout with inadequate lighting.',
    descriptionZh: '这次翻新将过时的厨房改造成现代空间。原有厨房配有深色木质橱柜、老旧家电，以及采光不足的不合理布局。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Surrey',
    budgetRange: '$20,000 - $35,000',
    durationEn: '3 weeks', durationZh: '3周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p3kiitchen-new.png',
    challengeEn: 'Dark wooden cabinets made the space feel cramped and outdated. Aging appliances reduced functionality, and the poorly optimized layout with inadequate lighting created an uninviting atmosphere.',
    challengeZh: '深色木质橱柜让空间显得局促过时。老旧家电降低了功能性，采光不足的不合理布局营造出不友好的氛围。',
    solutionEn: 'We replaced dark cabinets with sleek white cabinet systems that brighten the space and maximize storage. Energy-efficient stainless steel appliances were installed, along with comprehensive lighting including recessed ceiling fixtures and under-cabinet lighting.',
    solutionZh: '我们用简洁的白色橱柜系统替换了深色橱柜，使空间更明亮并最大化储物空间。安装了节能的不锈钢家电，以及包括嵌入式天花灯和橱柜下照明的综合照明系统。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p3kiitchen-new.png', altEn: 'Surrey white kitchen after', altZh: '素里白色厨房装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/35.png', altEn: 'Kitchen cabinets detail', altZh: '厨房橱柜细节' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/36.png', altEn: 'Modern appliances', altZh: '现代家电' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/37.png', altEn: 'Kitchen lighting', altZh: '厨房照明' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/38.png', altEn: 'Kitchen countertops', altZh: '厨房台面' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/39.png', altEn: 'Kitchen overview', altZh: '厨房全景' },
    ],
    scopes: [
      { en: 'White Cabinetry', zh: '白色橱柜' },
      { en: 'Stainless Steel Appliances', zh: '不锈钢家电' },
      { en: 'Recessed Lighting', zh: '嵌入式照明' },
      { en: 'Under-Cabinet Lighting', zh: '橱柜下照明' },
      { en: 'Countertops', zh: '台面' },
    ],
  },

  // ===== DELTA TOWNHOUSE KITCHEN =====
  {
    slug: 'delta-townhouse-kitchen',
    titleEn: 'Delta Townhouse Kitchen - Grey and White Shaker Cabinet',
    titleZh: 'Delta联排别墅厨房 - 灰白色摇门橱柜',
    descriptionEn: 'A comprehensive kitchen renovation in a Delta townhouse transforming an outdated space into a modern kitchen. The design features grey lower cabinets with white upper cabinets, creating a stylish two-tone effect.',
    descriptionZh: 'Delta联排别墅的全面厨房翻新，将过时的空间改造成现代厨房。设计采用灰色下柜配白色上柜，营造时尚的双色效果。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Delta',
    budgetRange: '$18,000 - $28,000',
    durationEn: '3 weeks', durationZh: '3周',
    spaceTypeEn: 'Townhouse', spaceTypeZh: '联排别墅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/90-2.png',
    challengeEn: 'Outdated wooden cabinets with laminate countertops gave the kitchen a dated look. The space lacked modern design cohesion and had inadequate lighting.',
    challengeZh: '过时的木质橱柜配层压板台面使厨房看起来陈旧。空间缺乏现代设计统一性，照明也不足。',
    solutionEn: 'We installed a two-tone shaker cabinet design with grey lower and white upper cabinets, added white subway tile backsplash with white brick countertops, and upgraded to black hardware and water fittings with LED under-cabinet lighting.',
    solutionZh: '我们安装了双色摇门橱柜设计，灰色下柜配白色上柜，添加了白色地铁砖后挡板和白砖台面，升级为黑色五金和水龙头配LED橱柜下照明。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/90-2.png', altEn: 'Delta kitchen after renovation', altZh: 'Delta厨房装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/delta-townhouse-before.png', altEn: 'Delta kitchen before renovation', altZh: 'Delta厨房装修前', isBefore: true },
    ],
    scopes: [
      { en: 'Two-Tone Shaker Cabinets', zh: '双色摇门橱柜' },
      { en: 'Subway Tile Backsplash', zh: '地铁砖后挡板' },
      { en: 'Black Hardware', zh: '黑色五金' },
      { en: 'LED Under-Cabinet Lighting', zh: 'LED橱柜下照明' },
      { en: 'Countertops', zh: '台面' },
    ],
  },

  // ===== DELTA TOWNHOUSE BATHROOM =====
  {
    slug: 'delta-townhouse-bathroom',
    titleEn: 'Comprehensive Bathroom Renovation in Delta',
    titleZh: 'Delta全面浴室翻新',
    descriptionEn: 'Complete bathroom renovation in a Delta townhouse featuring walk-in glass shower enclosure with modern fixtures, updated vanities, and improved lighting in previously dim areas.',
    descriptionZh: 'Delta联排别墅的全面浴室翻新，配备步入式玻璃淋浴房和现代设备、更新的洗手台以及改善原本昏暗区域的照明。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'Delta',
    budgetRange: '$12,000 - $20,000',
    durationEn: '2 weeks', durationZh: '2周',
    spaceTypeEn: 'Townhouse', spaceTypeZh: '联排别墅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/88-2.png',
    challengeEn: 'Cramped, poorly-lit bathroom layouts with aging fixtures and lack of modern design cohesion throughout the space.',
    challengeZh: '局促、采光不良的浴室布局，配有老化的设备，整个空间缺乏现代设计统一性。',
    solutionEn: 'Installed walk-in glass shower enclosure with modern fixtures, replaced outdated vanities with updated storage solutions, added new tile selections reflecting the grey-and-white design theme, and improved lighting throughout.',
    solutionZh: '安装了配有现代设备的步入式玻璃淋浴房，用更新的储物方案替换了过时的洗手台，添加了反映灰白设计主题的新瓷砖选择，并改善了整体照明。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/88-2.png', altEn: 'Delta bathroom main after', altZh: 'Delta主浴室装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/43-3.png', altEn: 'Delta small bathroom after', altZh: 'Delta小浴室装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p7-bath-before.png', altEn: 'Delta bathroom before', altZh: 'Delta浴室装修前', isBefore: true },
    ],
    scopes: [
      { en: 'Walk-in Glass Shower', zh: '步入式玻璃淋浴房' },
      { en: 'Modern Vanity', zh: '现代洗手台' },
      { en: 'Tile Work', zh: '瓷砖工程' },
      { en: 'Lighting', zh: '照明' },
      { en: 'Plumbing Fixtures', zh: '水暖设备' },
    ],
  },

  // ===== WEST VANCOUVER FLOATING BATHROOM VANITY =====
  {
    slug: 'west-vancouver-floating-vanity',
    titleEn: 'Stunning Floating Bathroom Vanity Renovation in West Vancouver',
    titleZh: '西温哥华惊艳的悬浮浴室洗手台翻新',
    descriptionEn: 'This bathroom renovation project features a modern floating vanity design with minimalist aesthetics, clean lines, and high-gloss finish, paired with marble tiles and contemporary fixtures.',
    descriptionZh: '这个浴室翻新项目采用现代悬浮洗手台设计，具有极简美学、简洁线条和高光饰面，搭配大理石瓷砖和现代设备。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'West Vancouver',
    budgetRange: '$15,000 - $25,000',
    durationEn: '2 weeks', durationZh: '2周',
    spaceTypeEn: 'Luxury Residential', spaceTypeZh: '豪华住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p4-bath-after.png',
    challengeEn: 'The existing bathroom needed a modern update that would maximize visual space while providing ample storage for daily use. The homeowner wanted a sophisticated, streamlined look.',
    challengeZh: '现有浴室需要现代化更新，既要最大化视觉空间，又要为日常使用提供充足储物。业主想要精致、流线型的外观。',
    solutionEn: 'We designed and installed a wall-mounted floating vanity that exposes floor space, creating visual spaciousness. The vanity features spacious drawers for storage with open shelving design, paired with marble tile installation and modern lighting.',
    solutionZh: '我们设计并安装了壁挂式悬浮洗手台，露出地面空间，创造视觉宽敞感。洗手台配备宽敞抽屉储物和开放式搁板设计，搭配大理石瓷砖安装和现代照明。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p4-bath-after.png', altEn: 'West Vancouver bathroom after', altZh: '西温浴室装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p4-bath-before.png', altEn: 'West Vancouver bathroom before', altZh: '西温浴室装修前', isBefore: true },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p4-bath-wash-after.png', altEn: 'Floating vanity detail', altZh: '悬浮洗手台细节' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/43.png', altEn: 'Marble tile detail', altZh: '大理石瓷砖细节' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/44.png', altEn: 'Bathroom fixtures', altZh: '浴室设备' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p4-bath-after-2.png', altEn: 'Bathroom overview', altZh: '浴室全景' },
    ],
    scopes: [
      { en: 'Floating Vanity', zh: '悬浮洗手台' },
      { en: 'Marble Tiles', zh: '大理石瓷砖' },
      { en: 'Modern Lighting', zh: '现代照明' },
      { en: 'Plumbing Fixtures', zh: '水暖设备' },
      { en: 'Storage Solutions', zh: '储物方案' },
    ],
  },

  // ===== LANGLEY KITCHEN (Part of Langley Whole House) =====
  {
    slug: 'langley-kitchen-renovation',
    titleEn: 'Kitchen Renovation in Langley',
    titleZh: '兰里厨房翻新',
    descriptionEn: 'The kitchen features white cabinetry, quartz countertops, and a sleek backsplash with stainless steel appliances and a central island with seating for meal preparation and dining.',
    descriptionZh: '厨房配备白色橱柜、石英台面和时尚后挡板，搭配不锈钢家电和带座位的中央岛台，可用于备餐和用餐。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Langley',
    budgetRange: '$30,000 - $45,000',
    durationEn: '4 weeks', durationZh: '4周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/68.jpg',
    challengeEn: 'The original kitchen was outdated with poor functionality, inadequate storage, and lack of a proper workspace for cooking and entertaining.',
    challengeZh: '原有厨房过时，功能性差，储物不足，缺乏适合烹饪和招待客人的工作空间。',
    solutionEn: 'We installed premium quartz countertops with custom white cabinetry, added a central island with seating for dual-purpose meal preparation and dining, upgraded to stainless steel appliances, and incorporated strategic lighting design.',
    solutionZh: '我们安装了高端石英台面和定制白色橱柜，添加了带座位的中央岛台用于备餐和用餐双重用途，升级为不锈钢家电，并融入了策略性照明设计。',
    featured: true,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/68.jpg', altEn: 'Langley kitchen after', altZh: '兰里厨房装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/55.png', altEn: 'Langley kitchen before', altZh: '兰里厨房装修前', isBefore: true },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/33.png', altEn: 'Kitchen island', altZh: '厨房岛台' },
    ],
    scopes: [
      { en: 'White Cabinetry', zh: '白色橱柜' },
      { en: 'Quartz Countertops', zh: '石英台面' },
      { en: 'Central Island', zh: '中央岛台' },
      { en: 'Stainless Steel Appliances', zh: '不锈钢家电' },
      { en: 'Backsplash', zh: '后挡板' },
    ],
  },

  // ===== LANGLEY BATHROOM (Part of Langley Whole House) =====
  {
    slug: 'langley-bathroom-renovation',
    titleEn: 'Bathroom Renovation in Langley',
    titleZh: '兰里浴室翻新',
    descriptionEn: 'Multiple bathrooms redesigned as spa-like retreats with emphasis on elegance, comfort and practicality. Features include rainfall showerheads, double vanities with modern faucets, and freestanding bathtubs with natural stone tile finishes.',
    descriptionZh: '多个浴室被重新设计为水疗式休息室，强调优雅、舒适和实用性。配备雨淋花洒、配现代水龙头的双洗手台，以及采用天然石材瓷砖饰面的独立浴缸。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'Langley',
    budgetRange: '$20,000 - $35,000',
    durationEn: '3 weeks', durationZh: '3周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/70.jpg',
    challengeEn: 'The existing bathrooms were dated and lacked the spa-like atmosphere the homeowners desired. Storage was inadequate and lighting was poor.',
    challengeZh: '现有浴室过时，缺乏业主期望的水疗式氛围。储物不足，照明也差。',
    solutionEn: 'We installed high-quality fixtures including rainfall showerheads, double vanities with modern faucets, and freestanding soaking tubs. Natural stone tiles were used throughout with LED mirrors and dimmable ambient lighting systems.',
    solutionZh: '我们安装了高品质设备，包括雨淋花洒、配现代水龙头的双洗手台和独立泡澡浴缸。全程使用天然石材瓷砖，配备LED镜子和可调光环境照明系统。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/70.jpg', altEn: 'Langley bathroom after', altZh: '兰里浴室装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/72.jpg', altEn: 'Luxury bathroom with tub', altZh: '带浴缸的豪华浴室' },
    ],
    scopes: [
      { en: 'Rainfall Showerhead', zh: '雨淋花洒' },
      { en: 'Double Vanity', zh: '双洗手台' },
      { en: 'Freestanding Tub', zh: '独立浴缸' },
      { en: 'Natural Stone Tiles', zh: '天然石材瓷砖' },
      { en: 'LED Mirrors', zh: 'LED镜子' },
      { en: 'Dimmable Lighting', zh: '可调光照明' },
    ],
  },

  // ===== LANGLEY BASEMENT (Part of Langley Whole House) =====
  {
    slug: 'langley-basement-renovation',
    titleEn: 'Basement Transformation in Langley',
    titleZh: '兰里地下室改造',
    descriptionEn: 'The basement was converted into a modern family room with neutral color palettes, stylish furniture, and practical layouts. Features custom-built storage units, modern flooring, and ample lighting design.',
    descriptionZh: '地下室被改造成现代家庭活动室，采用中性色调、时尚家具和实用布局。配备定制储物单元、现代地板和充足的照明设计。',
    serviceType: 'basement',
    categoryEn: 'Basement', categoryZh: '地下室',
    locationCity: 'Langley',
    budgetRange: '$25,000 - $40,000',
    durationEn: '5 weeks', durationZh: '5周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/73.jpg',
    challengeEn: 'The unfinished basement needed complete transformation into a functional living space with proper insulation, lighting, and storage solutions.',
    challengeZh: '未完工的地下室需要完全改造成功能性生活空间，配备适当的隔热、照明和储物方案。',
    solutionEn: 'We created a modern family room with neutral color schemes and stylish furnishings. Custom storage solutions including shelving units and multi-functional furniture were installed, along with modern flooring and comprehensive lighting design.',
    solutionZh: '我们打造了采用中性色调和时尚家具的现代家庭活动室。安装了包括搁架单元和多功能家具的定制储物方案，以及现代地板和综合照明设计。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/73.jpg', altEn: 'Langley basement after', altZh: '兰里地下室装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/57.png', altEn: 'Basement living area', altZh: '地下室生活区' },
    ],
    scopes: [
      { en: 'Framing & Drywall', zh: '框架和石膏板' },
      { en: 'Modern Flooring', zh: '现代地板' },
      { en: 'Custom Storage', zh: '定制储物' },
      { en: 'Lighting Design', zh: '照明设计' },
      { en: 'Painting', zh: '油漆' },
    ],
  },

  // ===== SURREY CUSTOMIZED KITCHEN (Part of Surrey Whole House) =====
  {
    slug: 'surrey-customized-kitchen',
    titleEn: 'Surrey Customized Kitchen Cabinet',
    titleZh: '素里定制厨房橱柜',
    descriptionEn: 'Complete kitchen renovation featuring customized cabinetry as a central element, demonstrating full-house renovation capabilities across multiple rooms and finishes.',
    descriptionZh: '以定制橱柜为核心元素的全面厨房翻新，展示跨多个房间和饰面的全屋翻新能力。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Surrey',
    budgetRange: '$25,000 - $40,000',
    durationEn: '4 weeks', durationZh: '4周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/richmond-kitchen-after-p1.png',
    challengeEn: 'The existing kitchen had outdated finishes and inadequate storage, requiring a complete overhaul to meet modern standards.',
    challengeZh: '现有厨房饰面过时，储物不足，需要全面改造以达到现代标准。',
    solutionEn: 'We designed and installed custom kitchen cabinetry with modern finishes, optimized storage solutions, and updated all fixtures and appliances to create a functional, contemporary kitchen space.',
    solutionZh: '我们设计并安装了现代饰面的定制厨房橱柜，优化了储物方案，并更新了所有设备和家电，打造功能性的现代厨房空间。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/richmond-kitchen-after-p1.png', altEn: 'Surrey kitchen after', altZh: '素里厨房装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/richmond-kitchen-before-p1.png', altEn: 'Surrey kitchen before', altZh: '素里厨房装修前', isBefore: true },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/18-1.png', altEn: 'Kitchen cabinets', altZh: '厨房橱柜' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/19-1.png', altEn: 'Kitchen countertops', altZh: '厨房台面' },
    ],
    scopes: [
      { en: 'Custom Cabinetry', zh: '定制橱柜' },
      { en: 'Countertops', zh: '台面' },
      { en: 'Appliances', zh: '家电' },
      { en: 'Lighting', zh: '照明' },
      { en: 'Backsplash', zh: '后挡板' },
    ],
  },

  // ===== SURREY BATHROOM (Part of Surrey Whole House) =====
  {
    slug: 'surrey-bathroom-renovation',
    titleEn: 'Bathroom Renovation in Surrey',
    titleZh: '素里浴室翻新',
    descriptionEn: 'Complete bathroom renovation as part of the Surrey full-house project, featuring modern fixtures, updated tile work, and improved lighting.',
    descriptionZh: '作为素里全屋项目一部分的全面浴室翻新，配备现代设备、更新的瓷砖工程和改善的照明。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'Surrey',
    budgetRange: '$12,000 - $20,000',
    durationEn: '2 weeks', durationZh: '2周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/21.png',
    challengeEn: 'Outdated bathroom with aging fixtures and poor lighting required a complete modernization.',
    challengeZh: '配有老化设备和较差照明的过时浴室需要全面现代化。',
    solutionEn: 'We installed modern fixtures, updated all tile work with contemporary designs, and improved the lighting system throughout the bathroom.',
    solutionZh: '我们安装了现代设备，用现代设计更新了所有瓷砖工程，并改善了整个浴室的照明系统。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/21.png', altEn: 'Surrey bathroom after', altZh: '素里浴室装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/22.png', altEn: 'Bathroom vanity', altZh: '浴室洗手台' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/23.png', altEn: 'Shower area', altZh: '淋浴区' },
    ],
    scopes: [
      { en: 'Modern Fixtures', zh: '现代设备' },
      { en: 'Tile Work', zh: '瓷砖工程' },
      { en: 'Vanity', zh: '洗手台' },
      { en: 'Lighting', zh: '照明' },
      { en: 'Plumbing', zh: '水暖' },
    ],
  },

  // ===== SURREY STAIRCASE (Part of Surrey Whole House) =====
  {
    slug: 'surrey-staircase-renovation',
    titleEn: 'Staircase and Walls Renovation in Surrey',
    titleZh: '素里楼梯和墙面翻新',
    descriptionEn: 'Comprehensive staircase refinishing and wall updates as part of the Surrey full-house renovation project.',
    descriptionZh: '作为素里全屋翻新项目一部分的全面楼梯翻新和墙面更新。',
    serviceType: 'cabinet',
    categoryEn: 'Finishing', categoryZh: '饰面',
    locationCity: 'Surrey',
    budgetRange: '$8,000 - $15,000',
    durationEn: '2 weeks', durationZh: '2周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/24.png',
    challengeEn: 'The existing staircase and walls were dated and worn, requiring refinishing to match the renovated spaces.',
    challengeZh: '现有楼梯和墙面过时磨损，需要翻新以配合装修后的空间。',
    solutionEn: 'We refinished the staircase with fresh paint and updated hardware, along with comprehensive wall painting and ceiling updates throughout.',
    solutionZh: '我们用新油漆和更新的五金件翻新了楼梯，同时进行了全面的墙面涂装和天花板更新。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/24.png', altEn: 'Surrey staircase after', altZh: '素里楼梯装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/25.png', altEn: 'Wall updates', altZh: '墙面更新' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/26.png', altEn: 'Ceiling work', altZh: '天花板工程' },
    ],
    scopes: [
      { en: 'Staircase Refinishing', zh: '楼梯翻新' },
      { en: 'Wall Painting', zh: '墙面涂装' },
      { en: 'Ceiling Updates', zh: '天花板更新' },
      { en: 'Lighting', zh: '照明' },
    ],
  },

  // ===== RICHMOND MODERN KITCHEN (Part of Richmond Full House) =====
  {
    slug: 'richmond-modern-kitchen',
    titleEn: 'Modern Kitchen Renovation in Richmond',
    titleZh: '列治文现代厨房翻新',
    descriptionEn: 'The kitchen features sleek, handleless glossy white cabinetry with generous storage, durable quartz countertops resistant to stains and scratches, ceiling spotlights and pendant lighting above the island.',
    descriptionZh: '厨房配备时尚的无把手高光白色橱柜和充足储物空间，耐污耐刮的耐用石英台面，天花板射灯和岛台上方的吊灯。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Richmond',
    budgetRange: '$35,000 - $50,000',
    durationEn: '5 weeks', durationZh: '5周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p6-kitchen-after.png',
    challengeEn: 'Coordinating multiple renovation phases across different rooms simultaneously while ensuring design consistency throughout the residence.',
    challengeZh: '协调多个不同房间的翻新阶段同时进行，同时确保整个住宅的设计一致性。',
    solutionEn: 'We installed stylish handleless white cabinets that reflect light and enhance spatial perception, paired with durable quartz countertops and strategic lighting placement including ceiling spotlights and pendant fixtures above the island.',
    solutionZh: '我们安装了时尚的无把手白色橱柜，能反射光线并增强空间感，搭配耐用的石英台面和策略性的照明布置，包括天花板射灯和岛台上方的吊灯。',
    featured: true,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p6-kitchen-after.png', altEn: 'Richmond modern kitchen after', altZh: '列治文现代厨房装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p6-kitchen-before.png', altEn: 'Richmond modern kitchen before', altZh: '列治文现代厨房装修前', isBefore: true },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/61.png', altEn: 'Kitchen cabinets', altZh: '厨房橱柜' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/63.png', altEn: 'Kitchen island', altZh: '厨房岛台' },
    ],
    scopes: [
      { en: 'Handleless Cabinetry', zh: '无把手橱柜' },
      { en: 'Quartz Countertops', zh: '石英台面' },
      { en: 'Ceiling Spotlights', zh: '天花板射灯' },
      { en: 'Pendant Lighting', zh: '吊灯' },
      { en: 'SPC Vinyl Flooring', zh: 'SPC乙烯基地板' },
    ],
  },

  // ===== RICHMOND BATHROOM UPDATE (Part of Richmond Full House) =====
  {
    slug: 'richmond-bathroom-update',
    titleEn: 'Bathroom Upgrade in Richmond',
    titleZh: '列治文浴室升级',
    descriptionEn: 'New floor tiles and wall tiles, modern shower fixtures and updated lighting, space-saving fixtures and storage solutions in a compact modern bathroom.',
    descriptionZh: '新地砖和墙砖，现代淋浴设备和更新的照明，紧凑型现代浴室中的节省空间设备和储物方案。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'Richmond',
    budgetRange: '$12,000 - $20,000',
    durationEn: '2 weeks', durationZh: '2周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p6-bath-after.png',
    challengeEn: 'Managing efficient space utilization in smaller bathroom areas while maintaining design consistency with the rest of the house.',
    challengeZh: '在较小的浴室区域管理高效的空间利用，同时保持与房屋其他部分的设计一致性。',
    solutionEn: 'We installed compact modern bathrooms with new tile throughout, contemporary fixtures, and optimized storage solutions that respect the spatial constraints while maintaining high-end aesthetics.',
    solutionZh: '我们安装了紧凑型现代浴室，全程使用新瓷砖、现代设备和优化的储物方案，在尊重空间限制的同时保持高端美感。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p6-bath-after.png', altEn: 'Richmond bathroom after', altZh: '列治文浴室装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/62.png', altEn: 'Bathroom tiles', altZh: '浴室瓷砖' },
    ],
    scopes: [
      { en: 'Floor Tiles', zh: '地砖' },
      { en: 'Wall Tiles', zh: '墙砖' },
      { en: 'Shower Fixtures', zh: '淋浴设备' },
      { en: 'Lighting', zh: '照明' },
      { en: 'Storage Solutions', zh: '储物方案' },
    ],
  },

  // ===== RICHMOND FLOORING & STAIRCASE (Part of Richmond Full House) =====
  {
    slug: 'richmond-flooring-staircase',
    titleEn: 'Flooring and Staircase Renovation in Richmond',
    titleZh: '列治文地板和楼梯翻新',
    descriptionEn: 'SPC Vinyl Plank flooring throughout the entryway and common areas, refinished staircase woodwork with fresh paint, and updated fireplace with sleek white frame and neutral stone tiles.',
    descriptionZh: '入口和公共区域全铺SPC乙烯基木板地板，用新油漆翻新的楼梯木工，以及用简洁白框和中性石材瓷砖更新的壁炉。',
    serviceType: 'cabinet',
    categoryEn: 'Flooring & Finishing', categoryZh: '地板与饰面',
    locationCity: 'Richmond',
    budgetRange: '$15,000 - $25,000',
    durationEn: '3 weeks', durationZh: '3周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p6-stair-floorings-after.png',
    challengeEn: 'Creating visual continuity between the kitchen, entryway, and staircase while updating the fireplace to match the modern aesthetic.',
    challengeZh: '在厨房、入口和楼梯之间创造视觉连续性，同时更新壁炉以匹配现代美学。',
    solutionEn: 'We installed SPC Vinyl Plank flooring throughout for visual flow, refinished the staircase with fresh paint, and updated the fireplace with a sleek white frame and improved lighting.',
    solutionZh: '我们全程安装SPC乙烯基木板地板以实现视觉流畅，用新油漆翻新了楼梯，并用简洁的白框和改进的照明更新了壁炉。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p6-stair-floorings-after.png', altEn: 'Richmond flooring and staircase', altZh: '列治文地板和楼梯' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/64.png', altEn: 'Fireplace update', altZh: '壁炉更新' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/66.png', altEn: 'Flooring detail', altZh: '地板细节' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/68.png', altEn: 'Staircase detail', altZh: '楼梯细节' },
    ],
    scopes: [
      { en: 'SPC Vinyl Flooring', zh: 'SPC乙烯基地板' },
      { en: 'Staircase Refinishing', zh: '楼梯翻新' },
      { en: 'Fireplace Update', zh: '壁炉更新' },
      { en: 'Painting', zh: '油漆' },
    ],
  },

  // ===== RICHMOND KITCHEN REMODEL (Part of Richmond Family Home) =====
  {
    slug: 'richmond-kitchen-remodel',
    titleEn: 'Kitchen Remodel in Richmond',
    titleZh: '列治文厨房改造',
    descriptionEn: 'Kitchen and dining area remodeling utilizing warm toned white based materials, featuring comprehensive renovation with modern finishes.',
    descriptionZh: '采用暖色调白色基础材料的厨房和餐厅改造，配备现代饰面的全面翻新。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Richmond',
    budgetRange: '$28,000 - $42,000',
    durationEn: '4 weeks', durationZh: '4周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/richmond-kitchen-remodel-project-after-renovation.png',
    challengeEn: 'The existing kitchen and dining area needed modernization while maintaining a warm, inviting atmosphere.',
    challengeZh: '现有厨房和餐厅需要现代化改造，同时保持温馨宜人的氛围。',
    solutionEn: 'We utilized warm toned white based materials throughout the kitchen and dining area remodel, creating a cohesive modern look with excellent functionality.',
    solutionZh: '我们在厨房和餐厅改造中全程使用暖色调白色基础材料，创造出功能出色的统一现代外观。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/richmond-kitchen-remodel-project-after-renovation.png', altEn: 'Richmond kitchen after', altZh: '列治文厨房装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/06/微信图片_20221125115328.jpg', altEn: 'Richmond kitchen before', altZh: '列治文厨房装修前', isBefore: true },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/10-1.png', altEn: 'Kitchen cabinets', altZh: '厨房橱柜' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/11-1.png', altEn: 'Dining area', altZh: '餐厅区' },
    ],
    scopes: [
      { en: 'Kitchen Remodel', zh: '厨房改造' },
      { en: 'Dining Area', zh: '餐厅区' },
      { en: 'Warm-Toned Cabinetry', zh: '暖色调橱柜' },
      { en: 'Countertops', zh: '台面' },
      { en: 'Lighting', zh: '照明' },
    ],
  },

  // ===== RICHMOND BATHROOMS REMODEL (Part of Richmond Family Home) =====
  {
    slug: 'richmond-bathrooms-remodel',
    titleEn: 'Bathrooms Remodel in Richmond',
    titleZh: '列治文浴室改造',
    descriptionEn: 'Multiple bathroom renovations across two floors, including first floor bathroom, second floor bathrooms, and small bathroom updates.',
    descriptionZh: '两层楼的多个浴室翻新，包括一楼浴室、二楼浴室和小浴室更新。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'Richmond',
    budgetRange: '$25,000 - $40,000',
    durationEn: '4 weeks', durationZh: '4周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/7-1.png',
    challengeEn: 'Multiple bathrooms across two floors needed coordinated renovation while maintaining design consistency.',
    challengeZh: '两层楼的多个浴室需要协调翻新，同时保持设计一致性。',
    solutionEn: 'We renovated all bathrooms with cohesive design elements, modern fixtures, and updated tile work throughout both floors.',
    solutionZh: '我们用统一的设计元素、现代设备和更新的瓷砖工程翻新了所有浴室。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/7-1.png', altEn: 'Richmond bathroom after', altZh: '列治文浴室装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/06/一楼卫生间.jpg', altEn: 'First floor bathroom', altZh: '一楼卫生间' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/06/一楼卫生间旧图-1.jpg', altEn: 'First floor bathroom before', altZh: '一楼卫生间装修前', isBefore: true },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/06/二楼小卫生间1.jpg', altEn: 'Second floor small bathroom', altZh: '二楼小卫生间' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/06/二楼小卫生间2-1-scaled.jpg', altEn: 'Second floor bathroom detail', altZh: '二楼浴室细节' },
    ],
    scopes: [
      { en: 'Multiple Bathroom Renovation', zh: '多浴室翻新' },
      { en: 'Tile Work', zh: '瓷砖工程' },
      { en: 'Modern Fixtures', zh: '现代设备' },
      { en: 'Vanities', zh: '洗手台' },
      { en: 'Lighting', zh: '照明' },
    ],
  },

  // ===== RICHMOND CEILING & STAIRCASE (Part of Richmond Family Home) =====
  {
    slug: 'richmond-ceiling-staircase',
    titleEn: 'Ceiling and Staircase Renovation in Richmond',
    titleZh: '列治文天花板和楼梯翻新',
    descriptionEn: 'First floor and second floor ceiling work, staircase updates, closet and wardrobe installation, and laundry room updates.',
    descriptionZh: '一楼和二楼天花板工程、楼梯更新、衣柜安装和洗衣房更新。',
    serviceType: 'cabinet',
    categoryEn: 'Finishing', categoryZh: '饰面',
    locationCity: 'Richmond',
    budgetRange: '$15,000 - $25,000',
    durationEn: '3 weeks', durationZh: '3周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/06/一楼天花after.jpg',
    challengeEn: 'Coordinating ceiling work across multiple floors while updating the staircase and adding storage solutions.',
    challengeZh: '协调多层楼的天花板工程，同时更新楼梯和添加储物方案。',
    solutionEn: 'We completed comprehensive ceiling renovations on both floors, updated the staircase with modern finishes, installed custom closets and wardrobes, and renovated the laundry room.',
    solutionZh: '我们完成了两层楼的全面天花板翻新，用现代饰面更新了楼梯，安装了定制衣柜，并翻新了洗衣房。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/06/一楼天花after.jpg', altEn: 'First floor ceiling after', altZh: '一楼天花板装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/06/一楼天花.jpg', altEn: 'First floor ceiling before', altZh: '一楼天花板装修前', isBefore: true },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/06/二楼楼梯.jpg', altEn: 'Second floor staircase', altZh: '二楼楼梯' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/06/二楼楼梯旧图.jpg', altEn: 'Staircase before', altZh: '楼梯装修前', isBefore: true },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/06/衣柜.jpg', altEn: 'Closet installation', altZh: '衣柜安装' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/06/洗衣房.jpg', altEn: 'Laundry room', altZh: '洗衣房' },
    ],
    scopes: [
      { en: 'Ceiling Work', zh: '天花板工程' },
      { en: 'Staircase Update', zh: '楼梯更新' },
      { en: 'Closet Installation', zh: '衣柜安装' },
      { en: 'Laundry Room', zh: '洗衣房' },
      { en: 'Lighting', zh: '照明' },
    ],
  },

  // ===== STUNNING BATHROOM RENOVATION =====
  {
    slug: 'stunning-bathroom-renovation',
    titleEn: 'Stunning Bathroom Renovation',
    titleZh: '惊艳浴室翻新',
    descriptionEn: 'A comprehensive bathroom renovation project showcasing modern design and high-quality finishes. The project demonstrates professional renovation expertise in transforming bathroom spaces into luxurious retreats.',
    descriptionZh: '全面的浴室翻新项目，展示现代设计和高品质饰面。该项目展示了将浴室空间改造成豪华休息室的专业翻新能力。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'Vancouver',
    budgetRange: '$25,000 - $40,000',
    durationEn: '3 weeks', durationZh: '3周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/luxury-modern-bathroom-renovation.jpg',
    featured: true,
    badgeEn: 'New', badgeZh: '新',
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/luxury-modern-bathroom-renovation.jpg', altEn: 'Luxury modern bathroom', altZh: '豪华现代浴室' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/VCT_VCT07508_Large-1-scaled.jpg', altEn: 'Bathroom detail', altZh: '浴室细节' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/vct_vct07481_large-1-scaled.jpg', altEn: 'Bathroom fixtures', altZh: '浴室设备' },
    ],
    scopes: [
      { en: 'Modern Design', zh: '现代设计' },
      { en: 'High-End Fixtures', zh: '高端设备' },
      { en: 'Tile Work', zh: '瓷砖工程' },
      { en: 'Lighting', zh: '照明' },
    ],
  },

  // ===== COQUITLAM CABINET REFACING =====
  {
    slug: 'coquitlam-cabinet-refacing',
    titleEn: 'Customized Kitchen & Bathroom Cabinet Refacing in Coquitlam',
    titleZh: '高贵林定制厨房和浴室橱柜翻新',
    descriptionEn: 'Cabinet refacing project involving kitchen and bathroom renovations. The work included removing old cabinet doors and drawer fronts, applying new veneer to existing cabinet boxes, and installing new doors and hardware.',
    descriptionZh: '橱柜翻新项目，涉及厨房和浴室装修。工作包括拆除旧柜门和抽屉面板，在现有柜体上涂覆新贴面，并安装新门和五金件。',
    serviceType: 'cabinet',
    categoryEn: 'Cabinet', categoryZh: '橱柜',
    locationCity: 'Coquitlam',
    budgetRange: '$12,000 - $20,000',
    durationEn: '2 weeks', durationZh: '2周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p9-kitchen-after.png',
    challengeEn: 'Updating outdated kitchen and bathroom cabinets without extensive demolition while maintaining functionality.',
    challengeZh: '在不进行大规模拆除的情况下更新过时的厨房和浴室橱柜，同时保持功能性。',
    solutionEn: 'Cabinet refacing rather than full replacement, modern lighting upgrades, contemporary fixture selections, and staged renovation approach minimizing disruption.',
    solutionZh: '采用橱柜翻新而非完全更换，现代照明升级，当代设备选择，以及分阶段翻新方法最小化干扰。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p9-kitchen-after.png', altEn: 'Coquitlam kitchen after', altZh: '高贵林厨房装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p9-kitchen-before.png', altEn: 'Coquitlam kitchen before', altZh: '高贵林厨房装修前', isBefore: true },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/90.png', altEn: 'Bathroom after', altZh: '浴室装修后' },
    ],
    scopes: [
      { en: 'Cabinet Refacing', zh: '橱柜翻新' },
      { en: 'New Hardware', zh: '新五金件' },
      { en: 'Kitchen Lighting', zh: '厨房照明' },
      { en: 'Flooring', zh: '地板' },
    ],
  },

  // ===== SURREY CONDO KITCHEN BATHROOM =====
  {
    slug: 'surrey-condo-renovation',
    titleEn: 'Condo Renovation in Surrey: Stunning Kitchen & Bathroom',
    titleZh: '素里公寓翻新：惊艳厨房和浴室',
    descriptionEn: 'A comprehensive condo transformation featuring kitchen and bathroom upgrades focused on modernization and improved functionality in a Surrey property.',
    descriptionZh: '全面的公寓改造，以素里物业的厨房和浴室升级为重点，注重现代化和功能改善。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Surrey',
    budgetRange: '$20,000 - $35,000',
    durationEn: '4 weeks', durationZh: '4周',
    spaceTypeEn: 'Condo', spaceTypeZh: '公寓',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p13-kitchen-after.png',
    challengeEn: 'Dark and dated kitchen with small, uninviting atmosphere. Cramped bathroom with inefficient layout. Limited condo space requiring smart design solutions and compliance with strata regulations.',
    challengeZh: '昏暗过时的厨房，气氛不友好。局促的浴室布局不合理。有限的公寓空间需要智能设计方案并符合物业管理规定。',
    solutionEn: 'White upper and gray lower cabinetry to brighten spaces, quartz countertops for durability, modern lighting including recessed lights and LED-lit mirrors, sliding-door shower replacing built-in tub for space efficiency.',
    solutionZh: '白色上柜和灰色下柜使空间更明亮，石英台面保证耐用性，现代照明包括嵌入式灯和LED镜子，滑动门淋浴替代内置浴缸以提高空间效率。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p13-kitchen-after.png', altEn: 'Surrey condo kitchen after', altZh: '素里公寓厨房装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p13-bath.jpg', altEn: 'Surrey condo bathroom', altZh: '素里公寓浴室' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/17-2.png', altEn: 'Kitchen detail', altZh: '厨房细节' },
    ],
    scopes: [
      { en: 'Two-Tone Cabinetry', zh: '双色橱柜' },
      { en: 'Quartz Countertops', zh: '石英台面' },
      { en: 'Sliding Shower Door', zh: '滑动淋浴门' },
      { en: 'LED Lighting', zh: 'LED照明' },
    ],
  },

  // ===== BURNABY KITCHEN =====
  {
    slug: 'burnaby-kitchen-renovation',
    titleEn: 'Burnaby Kitchen Renovation',
    titleZh: '本拿比厨房翻新',
    descriptionEn: 'A complete kitchen renovation in Burnaby featuring modern cabinetry, updated appliances, and contemporary finishes.',
    descriptionZh: '本拿比的全面厨房翻新，配备现代橱柜、更新的家电和当代饰面。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Burnaby',
    budgetRange: '$25,000 - $40,000',
    durationEn: '4 weeks', durationZh: '4周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/03/0c986c5d-d8cf-4ce8-bed7-6f1736a8d916-1.jpg',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/0c986c5d-d8cf-4ce8-bed7-6f1736a8d916-1.jpg', altEn: 'Burnaby kitchen after', altZh: '本拿比厨房装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/2dc54065-997c-47b3-97e7-50eff87b4ec4-1.jpg', altEn: 'Kitchen cabinets', altZh: '厨房橱柜' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/41fafa63-e37b-4f06-8dc3-73e91555c73f-1.jpg', altEn: 'Kitchen countertops', altZh: '厨房台面' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/43df5ebc-9f93-4376-ab84-e332f8ab143c.jpg', altEn: 'Kitchen overview', altZh: '厨房全景' },
    ],
    scopes: [
      { en: 'Modern Cabinetry', zh: '现代橱柜' },
      { en: 'Countertops', zh: '台面' },
      { en: 'Appliances', zh: '家电' },
      { en: 'Lighting', zh: '照明' },
    ],
  },

  // ===== COQUITLAM WAINSCOTING =====
  {
    slug: 'coquitlam-wainscoting-cabinet',
    titleEn: 'Home Renovation in Coquitlam - Wainscoting and Custom Cabinet',
    titleZh: '高贵林住宅翻新 - 护墙板和定制橱柜',
    descriptionEn: 'A comprehensive home renovation featuring bedroom design, custom cabinetry, kitchen modernization, and living room enhancements including a custom TV stand and chandelier installation.',
    descriptionZh: '全面的住宅翻新，包括卧室设计、定制橱柜、厨房现代化和客厅升级，包括定制电视柜和吊灯安装。',
    serviceType: 'cabinet',
    categoryEn: 'Custom Cabinet', categoryZh: '定制橱柜',
    locationCity: 'Coquitlam',
    budgetRange: '$30,000 - $50,000',
    durationEn: '6 weeks', durationZh: '6周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/3-4.png',
    challengeEn: 'Maximizing storage space effectively, creating a serene bedroom retreat, and developing functional yet aesthetic living areas.',
    challengeZh: '有效最大化储物空间，创造宁静的卧室休息区，以及开发功能性和美观性兼具的生活区域。',
    solutionEn: 'Custom wardrobes, stylish lighting, and modern design elements combined with tailored storage solutions and high-quality materials throughout the home.',
    solutionZh: '定制衣柜、时尚照明和现代设计元素，结合量身定制的储物方案和全屋高品质材料。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/3-4.png', altEn: 'Coquitlam bedroom design', altZh: '高贵林卧室设计' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p10-kitchen.png', altEn: 'Kitchen renovation', altZh: '厨房翻新' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p10-cabinet.png', altEn: 'Custom cabinet', altZh: '定制橱柜' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/51.png', altEn: 'TV stand', altZh: '电视柜' },
    ],
    scopes: [
      { en: 'Wainscoting', zh: '护墙板' },
      { en: 'Custom Cabinetry', zh: '定制橱柜' },
      { en: 'Kitchen Modernization', zh: '厨房现代化' },
      { en: 'Chandelier Installation', zh: '吊灯安装' },
    ],
  },

  // ===== RICHMOND WHITE SHAKER LIGHTING =====
  {
    slug: 'richmond-white-shaker-lighting',
    titleEn: 'Modern Renovation: Kitchen and Bathroom in Richmond',
    titleZh: '列治文现代翻新：厨房和浴室',
    descriptionEn: 'A comprehensive modern renovation project that transformed an outdated kitchen and bathroom in Richmond into contemporary spaces featuring sleek design, improved functionality, and enhanced aesthetics.',
    descriptionZh: '全面的现代翻新项目，将列治文过时的厨房和浴室改造成具有时尚设计、改进功能和增强美感的现代空间。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Richmond',
    budgetRange: '$30,000 - $45,000',
    durationEn: '5 weeks', durationZh: '5周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/13-3.png',
    challengeEn: 'Dark wooden cabinets creating heavy, dated appearance. Outdated appliances and limited lighting. Poor space utilization and cluttered layouts. Cramped, inefficient bathroom designs.',
    challengeZh: '深色木质橱柜造成沉重过时的外观。过时的家电和有限的照明。空间利用率差和杂乱的布局。局促、低效的浴室设计。',
    solutionEn: 'White cabinets replaced the old wooden ones, opening up the room and reflecting light. Quartz countertops for durability and aesthetics. Recessed and track lighting systems. Custom-built cabinetry for optimized storage.',
    solutionZh: '白色橱柜替换了旧的木质橱柜，使房间更开阔并反射光线。石英台面保证耐用性和美感。嵌入式和轨道照明系统。定制橱柜优化储物。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/13-3.png', altEn: 'Richmond modern kitchen', altZh: '列治文现代厨房' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/14.png', altEn: 'Kitchen after', altZh: '厨房装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/55-1.png', altEn: 'Modern sink', altZh: '现代水槽' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/54-1.png', altEn: 'Bathroom detail', altZh: '浴室细节' },
    ],
    scopes: [
      { en: 'White Shaker Cabinets', zh: '白色摇门橱柜' },
      { en: 'Quartz Countertops', zh: '石英台面' },
      { en: 'Track Lighting', zh: '轨道照明' },
      { en: 'Undermount Sink', zh: '台下盆' },
    ],
  },

  // ===== WHITE ROCK KITCHEN =====
  {
    slug: 'white-rock-kitchen-countertop',
    titleEn: 'Kitchen Renovation in White Rock - Modern Countertop',
    titleZh: '白石镇厨房翻新 - 现代台面',
    descriptionEn: 'A comprehensive kitchen transformation converting an outdated space with dark cabinetry into a bright, functional modern kitchen through strategic design and layout improvements.',
    descriptionZh: '全面的厨房改造，通过策略性设计和布局改进，将深色橱柜的过时空间转变为明亮、实用的现代厨房。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'White Rock',
    budgetRange: '$25,000 - $40,000',
    durationEn: '4 weeks', durationZh: '4周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/28-1.png',
    challengeEn: 'Dark, heavy cabinetry creating dated aesthetic. Cramped, inefficient layout with limited workspace and storage.',
    challengeZh: '深色厚重橱柜造成过时的美感。局促、低效的布局，工作空间和储物有限。',
    solutionEn: 'White shaker-style upper cabinets paired with soft gray lower cabinets for brightness and contrast. Central island addition for workspace, storage, and seating. Custom storage solutions with pull-out pantry drawers and soft-close cabinets.',
    solutionZh: '白色摇门式上柜搭配柔和灰色下柜，增加明亮度和对比度。添加中央岛台用于工作空间、储物和座位。拉出式储物抽屉和缓冲柜等定制储物方案。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/28-1.png', altEn: 'White Rock kitchen countertops', altZh: '白石镇厨房台面' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/27-1.png', altEn: 'Mono-toned design', altZh: '单色调设计' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/26-2.png', altEn: 'Kitchen cabinets', altZh: '厨房橱柜' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/25-2.png', altEn: 'Kitchen island', altZh: '厨房岛台' },
    ],
    scopes: [
      { en: 'Two-Tone Cabinetry', zh: '双色橱柜' },
      { en: 'Central Island', zh: '中央岛台' },
      { en: 'Quartz Countertops', zh: '石英台面' },
      { en: 'Pull-Out Storage', zh: '拉出式储物' },
    ],
  },

  // ===== MAPLE RIDGE BATHROOM =====
  {
    slug: 'maple-ridge-bathroom',
    titleEn: 'Maple Ridge Bathroom Renovation - Double Vanity',
    titleZh: '枫树岭浴室翻新 - 双洗手台',
    descriptionEn: 'Modern bathroom renovation featuring a double vanity design and frameless glass shower enclosure for enhanced functionality and elegance.',
    descriptionZh: '现代浴室翻新，采用双洗手台设计和无框玻璃淋浴房，增强功能性和优雅感。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'Maple Ridge',
    budgetRange: '$18,000 - $30,000',
    durationEn: '3 weeks', durationZh: '3周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/03/maple-ridge-double-vanity-glass-shower.jpg',
    challengeEn: 'The homeowners required a more functional and elegant space with improved practicality and visual appeal.',
    challengeZh: '业主需要更实用、更优雅的空间，提高实用性和视觉吸引力。',
    solutionEn: 'Sealed one shower door side to create spacious dual-shower layout. Installed new tiles throughout. Added custom-built double vanity for increased storage. Incorporated frameless glass shower enclosure for minimalist aesthetics.',
    solutionZh: '密封一侧淋浴门，创造宽敞的双淋浴布局。全程安装新瓷砖。添加定制双洗手台增加储物。采用无框玻璃淋浴房打造极简美学。',
    featured: false,
    badgeEn: 'New', badgeZh: '新',
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/maple-ridge-double-vanity-glass-shower.jpg', altEn: 'Maple Ridge bathroom', altZh: '枫树岭浴室' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/double-vanity-with-round-mirrors-and-wall-mounted-lighting-in-modern-bathroom.jpg', altEn: 'Double vanity with mirrors', altZh: '带镜子的双洗手台' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/modern-double-shower-with-built-in-shelf-dual-showerheads-and-glass-enclosure.jpg', altEn: 'Modern shower', altZh: '现代淋浴' },
    ],
    scopes: [
      { en: 'Double Vanity', zh: '双洗手台' },
      { en: 'Frameless Glass Shower', zh: '无框玻璃淋浴房' },
      { en: 'Tile Work', zh: '瓷砖工程' },
      { en: 'Dual Showerheads', zh: '双花洒' },
    ],
  },

  // ===== RICHMOND FULL HOUSE WITH BATH =====
  {
    slug: 'richmond-full-house-bath',
    titleEn: 'Richmond Whole House Renovation',
    titleZh: '列治文全屋翻新',
    descriptionEn: 'Comprehensive renovation project transforming an older residential property by modernizing multiple spaces. The work encompassed removing a wall to create an open-concept design in the kitchen area, along with significant upgrades throughout the home.',
    descriptionZh: '全面的翻新项目，通过现代化多个空间来改造老旧住宅物业。工作包括拆除墙壁在厨房区域创造开放式设计，以及全屋的重大升级。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Richmond',
    budgetRange: '$45,000 - $70,000',
    durationEn: '8 weeks', durationZh: '8周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p8-kitchen.png',
    challengeEn: 'The original kitchen featured a closed layout limiting functionality. The original bathroom had inefficient layout and outdated fixtures.',
    challengeZh: '原有厨房采用封闭式布局，限制了功能性。原有浴室布局低效，设备过时。',
    solutionEn: 'Removed structural walls to achieve an open-concept space that improved workflow and aesthetics. Modern design repositioned fixtures and added contemporary elements like frameless glass shower doors. Installed 12mm laminate flooring throughout.',
    solutionZh: '拆除结构墙实现开放式空间，改善工作流程和美感。现代设计重新定位设备，添加无框玻璃淋浴门等现代元素。全程安装12mm强化地板。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p8-kitchen.png', altEn: 'Richmond kitchen', altZh: '列治文厨房' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p8-living-after.png', altEn: 'Living area after', altZh: '客厅装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/flooring-in-vancouver.png', altEn: 'Flooring', altZh: '地板' },
    ],
    scopes: [
      { en: 'Wall Removal', zh: '拆墙' },
      { en: 'Open-Concept Kitchen', zh: '开放式厨房' },
      { en: 'Laminate Flooring', zh: '强化地板' },
      { en: 'Frameless Shower', zh: '无框淋浴' },
    ],
  },

  // ===== SURREY WASHROOM WALK-IN SHOWER =====
  {
    slug: 'surrey-washroom-walkin-shower',
    titleEn: 'Bathroom Renovation in Surrey - Freestanding Tub and Walk-in Shower',
    titleZh: '素里浴室翻新 - 独立浴缸和步入式淋浴',
    descriptionEn: 'A washroom transformation featuring a freestanding bathtub and customized glass shower, converting an outdated, dark space into a modern, spa-like retreat.',
    descriptionZh: '浴室改造，配备独立浴缸和定制玻璃淋浴房，将过时昏暗的空间转变为现代水疗式休息室。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'Surrey',
    budgetRange: '$22,000 - $35,000',
    durationEn: '3 weeks', durationZh: '3周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/spacious-modern-bathroom-with-freestanding-tub-and-glass-shower.webp',
    challengeEn: 'Original bathroom featured cramped layout with built-in bathtub surrounded by dark brown tiles. Dated floral tile accents felt outdated and inefficient. Space lacked the elegant aesthetic homeowners desired.',
    challengeZh: '原有浴室布局局促，内置浴缸被深棕色瓷砖包围。过时的花卉瓷砖装饰显得陈旧低效。空间缺乏业主期望的优雅美感。',
    solutionEn: 'Installed freestanding bathtub positioned near windows for an open and airy feel. Added customized glass shower enclosure with chrome finishes. Incorporated built-in niches for organizing toiletries.',
    solutionZh: '安装靠近窗户的独立浴缸，营造开放通风的感觉。添加带镀铬饰面的定制玻璃淋浴房。融入内置壁龛用于整理洗漱用品。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/spacious-modern-bathroom-with-freestanding-tub-and-glass-shower.webp', altEn: 'Surrey bathroom with tub and shower', altZh: '素里浴室配浴缸和淋浴' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/e03c6eaa8e5f4bab6055afb1d790a96.webp', altEn: 'Bathroom detail', altZh: '浴室细节' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/21-2.png', altEn: 'Walk-in shower', altZh: '步入式淋浴' },
    ],
    scopes: [
      { en: 'Freestanding Bathtub', zh: '独立浴缸' },
      { en: 'Glass Shower Enclosure', zh: '玻璃淋浴房' },
      { en: 'Built-in Niches', zh: '内置壁龛' },
      { en: 'Chrome Fixtures', zh: '镀铬设备' },
    ],
  },

  // ===== MODERN BATHROOM VANCOUVER =====
  {
    slug: 'modern-bathroom-vancouver',
    titleEn: 'Modern Bathroom Renovation in Vancouver',
    titleZh: '温哥华现代浴室翻新',
    descriptionEn: 'A comprehensive bathroom modernization featuring updated fixtures, improved lighting, and contemporary finishes. The project transformed an outdated bathroom with dated pink walls into a sleek, contemporary space.',
    descriptionZh: '全面的浴室现代化，配备更新的设备、改进的照明和当代饰面。项目将过时的粉红墙浴室改造成时尚的现代空间。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'Vancouver',
    budgetRange: '$15,000 - $25,000',
    durationEn: '2 weeks', durationZh: '2周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p16-bath.png',
    challengeEn: 'The original bathroom had several outdated features that made it both inefficient and unappealing. Poor lighting made the space feel small and dim. Mismatched fixtures lacking cohesive design.',
    challengeZh: '原有浴室有几个过时的特点，使其既低效又不吸引人。较差的照明使空间感觉狭小昏暗。不匹配的设备缺乏统一设计。',
    solutionEn: 'Installed white cabinetry with minimalist design for storage and brightness. Added wall-mounted sconces and recessed lighting for layered illumination. Integrated matte black fixtures for design cohesion.',
    solutionZh: '安装极简设计的白色橱柜用于储物和增加亮度。添加壁灯和嵌入式照明实现分层照明。整合哑光黑色设备实现设计统一。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p16-bath.png', altEn: 'Vancouver bathroom after', altZh: '温哥华浴室装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/61-1.png', altEn: 'Bathroom before', altZh: '浴室装修前', isBefore: true },
    ],
    scopes: [
      { en: 'White Cabinetry', zh: '白色橱柜' },
      { en: 'Layered Lighting', zh: '分层照明' },
      { en: 'Matte Black Fixtures', zh: '哑光黑色设备' },
      { en: 'Glass Shower Enclosure', zh: '玻璃淋浴房' },
    ],
  },

  // ===== COQUITLAM CONDO BLACK =====
  {
    slug: 'coquitlam-condo-black',
    titleEn: 'Coquitlam Condo Bathroom and Kitchen Renovation',
    titleZh: '高贵林公寓浴室和厨房翻新',
    descriptionEn: 'A comprehensive condo renovation featuring two bathrooms and a complete kitchen transformation. The project demonstrates modern design principles combined with practical functionality, emphasizing clean aesthetics and user-friendly features.',
    descriptionZh: '全面的公寓翻新，包括两个浴室和完整的厨房改造。项目展示了现代设计原则与实用功能的结合，强调简洁美学和用户友好功能。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'Coquitlam',
    budgetRange: '$28,000 - $42,000',
    durationEn: '5 weeks', durationZh: '5周',
    spaceTypeEn: 'Condo', spaceTypeZh: '公寓',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/p17-bath-after.png',
    challengeEn: 'Limited natural light in kitchen and bathrooms requiring creative solutions to maximize brightness.',
    challengeZh: '厨房和浴室自然光有限，需要创意方案最大化亮度。',
    solutionEn: 'Selected white cabinetry and fixtures to maximize the light and create a fresh, airy environment. Black brick shower wall with white mosaic floor tiles. LED-lit mirror with front and rear illumination.',
    solutionZh: '选择白色橱柜和设备最大化光线，创造清新通透的环境。黑色砖块淋浴墙配白色马赛克地砖。带前后照明的LED镜子。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p17-bath-after.png', altEn: 'Coquitlam condo bathroom after', altZh: '高贵林公寓浴室装修后' },
      { url: 'https://reno-stars.com/wp-content/uploads/2024/04/p17-bath-before.png', altEn: 'Bathroom before', altZh: '浴室装修前', isBefore: true },
    ],
    scopes: [
      { en: 'Black Brick Shower Wall', zh: '黑色砖块淋浴墙' },
      { en: 'LED-Lit Mirror', zh: 'LED镜子' },
      { en: 'White Mosaic Tiles', zh: '白色马赛克瓷砖' },
      { en: 'Shower Seat', zh: '淋浴座椅' },
    ],
  },

  // ===== BEAUTY CLINIC VANCOUVER (COMMERCIAL) =====
  {
    slug: 'beauty-clinic-vancouver',
    titleEn: 'Beauty Clinic Remodel in Vancouver - Commercial Renovation',
    titleZh: '温哥华美容诊所改造 - 商业翻新',
    descriptionEn: 'A comprehensive commercial renovation project for a beauty clinic featuring modern minimalist design with soft lighting and updated interior spaces.',
    descriptionZh: '美容诊所的全面商业翻新项目，采用现代极简设计，配备柔和照明和更新的室内空间。',
    serviceType: 'commercial',
    categoryEn: 'Commercial', categoryZh: '商业',
    locationCity: 'Vancouver',
    budgetRange: '$50,000 - $80,000',
    durationEn: '8 weeks', durationZh: '8周',
    spaceTypeEn: 'Commercial', spaceTypeZh: '商业',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2024/09/modern-minimalist-commercial-interior-design-with-soft-lighting.png',
    challengeEn: 'Transforming dated commercial spaces into modern, professional environments suitable for a beauty clinic.',
    challengeZh: '将过时的商业空间改造成适合美容诊所的现代专业环境。',
    solutionEn: 'Custom cabinet installations in treatment areas, innovative hallway design with integrated shelving, professional indirect lighting systems, and modern minimalist aesthetic implementation.',
    solutionZh: '治疗区定制橱柜安装，创新走廊设计配集成搁架，专业间接照明系统，以及现代极简美学实施。',
    featured: true,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2024/06/1.jpg', altEn: 'Beauty clinic reception', altZh: '美容诊所接待区' },
    ],
    scopes: [
      { en: 'Reception Design', zh: '接待区设计' },
      { en: 'Treatment Rooms', zh: '治疗室' },
      { en: 'Custom Millwork', zh: '定制木工' },
      { en: 'Indirect Lighting', zh: '间接照明' },
    ],
  },

  // ===== RICHMOND TOWNHOUSE WHOLE HOUSE =====
  {
    slug: 'richmond-townhouse-whole-house',
    titleEn: 'Richmond Townhouse - Kitchen, Bathroom, Laundry Room Whole House Renovation',
    titleZh: '列治文联排别墅 - 厨房、浴室、洗衣房全屋翻新',
    descriptionEn: 'A warm-toned whole house renovation project completed in Richmond, featuring updates to the kitchen, bathroom, and laundry room areas.',
    descriptionZh: '列治文完成的暖色调全屋翻新项目，包括厨房、浴室和洗衣房区域的更新。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Richmond',
    budgetRange: '$40,000 - $60,000',
    durationEn: '6 weeks', durationZh: '6周',
    spaceTypeEn: 'Townhouse', spaceTypeZh: '联排别墅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/03/dji_20241210_143240_085.jpg',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/dji_20241210_143240_085.jpg', altEn: 'Richmond townhouse kitchen', altZh: '列治文联排别墅厨房' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/dji_20241210_143308_670.jpg', altEn: 'Kitchen detail', altZh: '厨房细节' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/dji_20241210_143635_841.jpg', altEn: 'Bathroom', altZh: '浴室' },
    ],
    scopes: [
      { en: 'Kitchen Redesign', zh: '厨房重新设计' },
      { en: 'Bathroom Update', zh: '浴室更新' },
      { en: 'Laundry Room', zh: '洗衣房' },
      { en: 'Warm-Toned Finishes', zh: '暖色调饰面' },
    ],
  },

  // ===== VANCOUVER WHOLE HOUSE REFRESH =====
  {
    slug: 'vancouver-whole-house-refresh',
    titleEn: 'Vancouver Whole House Renovation - Refresh for Rent',
    titleZh: '温哥华全屋翻新 - 出租房刷新',
    descriptionEn: 'A comprehensive home renovation project showcasing kitchen, bathroom, and interior finishing work in Vancouver, preparing the property for rental.',
    descriptionZh: '温哥华的全面住宅翻新项目，展示厨房、浴室和室内装饰工程，准备物业出租。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Vancouver',
    budgetRange: '$35,000 - $55,000',
    durationEn: '5 weeks', durationZh: '5周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/03/img_3051-2-mfrh-original-scaled.jpg',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/img_3051-2-mfrh-original-scaled.jpg', altEn: 'Vancouver whole house renovation', altZh: '温哥华全屋翻新' },
    ],
    scopes: [
      { en: 'Kitchen Renovation', zh: '厨房翻新' },
      { en: 'Bathroom Upgrades', zh: '浴室升级' },
      { en: 'Interior Finishes', zh: '室内饰面' },
      { en: 'Lighting', zh: '照明' },
    ],
  },

  // ===== WHOLE HOUSE FROM KITCHEN TO BEDROOM =====
  {
    slug: 'whole-house-kitchen-to-bedroom',
    titleEn: 'Whole House Renovation - From Kitchen to Bedroom',
    titleZh: '全屋翻新 - 从厨房到卧室',
    descriptionEn: 'A comprehensive home transformation project that modernized outdated interiors into a contemporary living space across multiple rooms including kitchen, living/dining, and bathrooms.',
    descriptionZh: '全面的住宅改造项目，将过时的室内改造成现代生活空间，跨越多个房间包括厨房、客厅/餐厅和浴室。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Richmond',
    budgetRange: '$50,000 - $80,000',
    durationEn: '8 weeks', durationZh: '8周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/03/whole-house-renovation-open-living-and-dining-space.jpg',
    featured: true,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/03/whole-house-renovation-open-living-and-dining-space.jpg', altEn: 'Whole house kitchen', altZh: '全屋厨房' },
    ],
    scopes: [
      { en: 'Kitchen Renovation', zh: '厨房翻新' },
      { en: 'Living Room', zh: '客厅' },
      { en: 'Dining Area', zh: '餐厅' },
      { en: 'Bathroom', zh: '浴室' },
      { en: 'Marble Finishes', zh: '大理石饰面' },
    ],
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function clearExistingData() {
  console.log('Clearing existing project data...');

  // Delete in order to respect foreign keys
  await db.delete(projectExternalProducts);
  await db.delete(projectScopes);
  await db.delete(projectImages);
  await db.delete(projectsTable);
  await db.delete(siteImages);
  await db.delete(projectSites);

  console.log('  Cleared all projects, images, scopes, external products, site images, and sites');
}

async function seedSites(): Promise<Map<string, string>> {
  console.log('Seeding sites...');
  const siteIdMap = new Map<string, string>();

  for (const site of SITES_RAW) {
    const [inserted] = await db
      .insert(projectSites)
      .values({
        slug: site.slug,
        titleEn: site.titleEn,
        titleZh: site.titleZh,
        descriptionEn: site.descriptionEn,
        descriptionZh: site.descriptionZh,
        locationCity: site.locationCity,
        heroImageUrl: site.heroImageUrl,
        showAsProject: site.showAsProject,
        featured: site.featured,
        badgeEn: site.badgeEn ?? null,
        badgeZh: site.badgeZh ?? null,
        isPublished: true,
        publishedAt: new Date(),
      })
      .returning({ id: projectSites.id });

    siteIdMap.set(site.slug, inserted.id);

    // Insert site images
    if (site.images && site.images.length > 0) {
      await db.insert(siteImages).values(
        site.images.map((img, i) => ({
          siteId: inserted.id,
          imageUrl: img.imageUrl,
          altTextEn: img.altTextEn,
          altTextZh: img.altTextZh,
          isBefore: img.isBefore,
          displayOrder: i,
        }))
      );
    }

    console.log(`  Created site: ${site.slug} (${site.images?.length ?? 0} images)`);
  }

  return siteIdMap;
}

async function seedProjects(siteIdMap: Map<string, string>) {
  console.log('Seeding projects...');

  // Look up service IDs for linking
  const serviceRows = await db.select({ slug: servicesTable.slug, id: servicesTable.id }).from(servicesTable);
  const serviceMap = new Map(serviceRows.map((s: { slug: string; id: string }) => [s.slug, s.id]));

  // Build a map of project slug -> site ID based on SITES_RAW
  const projectToSiteMap = new Map<string, string>();
  for (const site of SITES_RAW) {
    const siteId = siteIdMap.get(site.slug);
    if (siteId) {
      for (const projectSlug of site.projectSlugs) {
        projectToSiteMap.set(projectSlug, siteId);
      }
    }
  }

  // Create a default site for projects not assigned to any site
  const [defaultSite] = await db
    .insert(projectSites)
    .values({
      slug: 'individual-projects',
      titleEn: 'Individual Projects',
      titleZh: '独立项目',
      descriptionEn: 'Collection of individual renovation projects.',
      descriptionZh: '独立装修项目集合。',
      showAsProject: false,
      featured: false,
      isPublished: true,
      publishedAt: new Date(),
    })
    .returning({ id: projectSites.id });

  const defaultSiteId = defaultSite.id;

  // Build reverse lookup: siteId -> site slug (for logging)
  const siteIdToSlug = new Map<string, string>();
  for (const [slug, id] of siteIdMap) siteIdToSlug.set(id, slug);

  let seeded = 0;

  for (const p of PROJECTS_RAW) {
    const serviceId = serviceMap.get(p.serviceType) ?? null;
    const siteId = projectToSiteMap.get(p.slug) ?? defaultSiteId;

    const [inserted] = await db
      .insert(projectsTable)
      .values({
        slug: p.slug,
        titleEn: p.titleEn,
        titleZh: p.titleZh,
        descriptionEn: p.descriptionEn,
        descriptionZh: p.descriptionZh,
        serviceType: p.serviceType,
        serviceId,
        categoryEn: p.categoryEn,
        categoryZh: p.categoryZh,
        locationCity: p.locationCity,
        budgetRange: p.budgetRange,
        durationEn: p.durationEn,
        durationZh: p.durationZh,
        spaceTypeEn: p.spaceTypeEn,
        spaceTypeZh: p.spaceTypeZh,
        heroImageUrl: p.heroImageUrl,
        challengeEn: p.challengeEn,
        challengeZh: p.challengeZh,
        solutionEn: p.solutionEn,
        solutionZh: p.solutionZh,
        featured: p.featured ?? false,
        badgeEn: p.badgeEn ?? null,
        badgeZh: p.badgeZh ?? null,
        isPublished: true,
        publishedAt: new Date(),
        siteId,
      })
      .returning({ id: projectsTable.id });

    const projectId = inserted.id;

    // Insert images and scopes in parallel
    const insertions: Promise<unknown>[] = [];
    if (p.images.length > 0) {
      insertions.push(db.insert(projectImages).values(
        p.images.map((img, i) => ({
          projectId,
          imageUrl: img.url,
          altTextEn: img.altEn,
          altTextZh: img.altZh,
          isBefore: img.isBefore ?? false,
          displayOrder: i,
        }))
      ));
    }
    if (p.scopes.length > 0) {
      insertions.push(db.insert(projectScopes).values(
        p.scopes.map((scope, i) => ({
          projectId,
          scopeEn: scope.en,
          scopeZh: scope.zh,
          displayOrder: i,
        }))
      ));
    }
    if (p.externalProducts && p.externalProducts.length > 0) {
      insertions.push(db.insert(projectExternalProducts).values(
        p.externalProducts.map((ep, i) => ({
          projectId,
          url: ep.url,
          imageUrl: ep.imageUrl ?? null,
          labelEn: ep.labelEn,
          labelZh: ep.labelZh,
          displayOrder: i,
        }))
      ));
    }
    await Promise.all(insertions);

    const siteSlug = siteIdToSlug.get(siteId);
    const siteLabel = siteId !== defaultSiteId && siteSlug ? ` (site: ${siteSlug})` : '';
    console.log(`  Seeded project: ${p.slug}${siteLabel}`);
    seeded++;
  }

  console.log(`\nSeeded ${seeded} projects`);
}

async function main() {
  console.log('=== Seeding Projects and Sites ===\n');

  await clearExistingData();
  const siteIdMap = await seedSites();
  await seedProjects(siteIdMap);

  console.log('\n=== Seeding Complete ===');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to seed:', err);
  process.exit(1);
});
