/**
 * Seed projects and sites from static data into the database.
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
}

// ============================================================================
// SITES DATA - These appear as "Whole House" projects in the listing
// ============================================================================
const SITES_RAW: SiteData[] = [
  {
    slug: 'oak-street-vancouver',
    titleEn: 'Oak Street Whole House Renovation',
    titleZh: '橡树街全屋装修',
    descriptionEn: 'Complete home transformation including kitchen, bathrooms, and living spaces in Vancouver.',
    descriptionZh: '温哥华全面的家居改造，包括厨房、浴室和起居空间。',
    locationCity: 'Vancouver',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/49.png',
    showAsProject: true,
    featured: true,
    badgeEn: 'Featured',
    badgeZh: '精选',
    projectSlugs: ['stunning-home-renovation-langley', 'surrey-home-before-after', 'richmond-kitchen-remodel-bath'],
  },
  {
    slug: 'richmond-family-home',
    titleEn: 'Richmond Family Home Renovation',
    titleZh: '列治文家庭住宅装修',
    descriptionEn: 'Multi-room renovation for a growing family including kitchen and multiple bathrooms.',
    descriptionZh: '为成长中的家庭进行多房间装修，包括厨房和多个浴室。',
    locationCity: 'Richmond',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/53.png',
    showAsProject: true,
    featured: false,
    projectSlugs: ['richmond-kitchen-bathroom-remodel', 'richmond-bathroom-remodel'],
  },
  {
    slug: 'surrey-modern-makeover',
    titleEn: 'Surrey Modern Makeover',
    titleZh: '素里现代风格改造',
    descriptionEn: 'Contemporary whole house update with modern finishes throughout.',
    descriptionZh: '采用现代风格装饰的全屋更新。',
    locationCity: 'Surrey',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/52.png',
    showAsProject: true,
    featured: false,
    projectSlugs: ['surrey-home-renovation', 'white-toned-kitchen-surrey'],
  },
];

// ============================================================================
// PROJECTS DATA - Individual room/area renovations
// ============================================================================
const PROJECTS_RAW: ProjectData[] = [
  {
    slug: 'coquitlam-white-shaker-cabinets',
    titleEn: 'Coquitlam - White Shaker Cabinets',
    titleZh: '高贵林 - 白色摇门橱柜',
    descriptionEn: 'Modern white shaker cabinet installation with premium countertops and backsplash.',
    descriptionZh: '现代白色摇门橱柜安装，配备高端台面和后挡板。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Coquitlam',
    budgetRange: '$15,000 - $25,000',
    durationEn: '3 weeks', durationZh: '3周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/微信图片_20250228155837.jpg',
    challengeEn: 'The existing kitchen had outdated oak cabinets and limited counter space, making the kitchen feel cramped and dark.',
    challengeZh: '原有厨房配备过时的橡木橱柜，台面空间有限，使厨房显得狭窄而阴暗。',
    solutionEn: 'We installed bright white shaker cabinets with soft-close hardware, paired with quartz countertops and a modern tile backsplash to open up the space.',
    solutionZh: '我们安装了明亮的白色摇门橱柜配备缓冲五金件，搭配石英台面和现代瓷砖后挡板，使空间更加开阔。',
    featured: true,
    badgeEn: 'New', badgeZh: '新',
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/02/微信图片_20250228155837.jpg', altEn: 'White shaker kitchen cabinets', altZh: '白色摇门厨房橱柜' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/340.png', altEn: 'Kitchen renovation detail', altZh: '厨房装修细节' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/35.png', altEn: 'Kitchen countertops', altZh: '厨房台面' },
    ],
    scopes: [
      { en: 'Cabinetry', zh: '橱柜' },
      { en: 'Countertops', zh: '台面' },
      { en: 'Backsplash', zh: '后挡板' },
    ],
    externalProducts: [
      { url: 'https://www.rona.ca/en/product/belanger-laminates-stretta-72-in-white-marble-look-right-hand-miter-laminate-kitchen-countertop-6010225733-58166958', imageUrl: 'https://cdn.shopify.com/s/files/1/0797/4682/6545/files/VT-STRE-STRAIGHT-06.jpg?v=1740521373', labelEn: 'Belanger Stretta 72-in White Marble-Look Countertop', labelZh: 'Belanger Stretta 72英寸白色仿大理石台面' },
      { url: 'https://www.rona.ca/en/product/kohler-simplice-touchless-pull-down-kitchen-sink-faucet-w-3-function-sprayhead-in-polished-chrome-22036-cp-332069940', imageUrl: 'https://cdn.shopify.com/s/files/1/0312/4104/4099/files/zac74608_rgb.jpg?v=1731734955', labelEn: 'KOHLER Simplice Touchless Pull-Down Kitchen Faucet', labelZh: 'KOHLER Simplice 感应式下拉厨房水龙头' },
      { url: 'https://www.rona.ca/en/product/kraus-kore-24-in-farmhouse-stainless-steel-single-bowl-kitchen-sink-kwf210-24-330949271', imageUrl: 'https://cdn.shopify.com/s/files/1/2568/3480/products/KRAUS-Kore-24-Apron-Front-Workstation-16-Gauge-Stainless-Steel-Single-Bowl-Kitchen-Sink-with-Accessories.jpg?v=1664285853', labelEn: 'Kraus Kore 24-in Farmhouse Stainless Steel Kitchen Sink', labelZh: 'Kraus Kore 24英寸农舍风格不锈钢厨房水槽' },
    ],
  },
  {
    slug: 'richmond-kitchen-bathroom-remodel',
    titleEn: 'Richmond Kitchen and Bathroom Remodel',
    titleZh: '列治文厨房和浴室改造',
    descriptionEn: 'Complete kitchen and bathroom transformation with contemporary finishes.',
    descriptionZh: '采用现代风格完成厨房和浴室全面改造。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Richmond',
    budgetRange: '$30,000 - $45,000',
    durationEn: '5 weeks', durationZh: '5周',
    spaceTypeEn: 'Condo', spaceTypeZh: '公寓',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/35.png',
    challengeEn: 'A dated condo with separate outdated kitchen and bathroom needing a cohesive modern update within a tight timeline.',
    challengeZh: '一套过时的公寓，厨房和浴室都需要在紧迫的时间内进行统一的现代化更新。',
    solutionEn: 'We coordinated kitchen and bathroom trades simultaneously, using a unified modern palette with quartz surfaces and contemporary fixtures throughout.',
    solutionZh: '我们协调厨房和浴室的施工同步进行，采用统一的现代色调搭配石英台面和时尚洁具。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/35.png', altEn: 'Richmond kitchen remodel', altZh: '列治文厨房改造' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/75-1.png', altEn: 'Modern kitchen design', altZh: '现代厨房设计' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/52.png', altEn: 'Kitchen and bathroom renovation', altZh: '厨房和浴室装修' },
    ],
    scopes: [
      { en: 'Cabinetry', zh: '橱柜' }, { en: 'Countertops', zh: '台面' },
      { en: 'Flooring', zh: '地板' }, { en: 'Plumbing', zh: '水管' }, { en: 'Tile Work', zh: '瓷砖' },
    ],
    externalProducts: [
      { url: 'https://www.rona.ca/en/product/pfister-ceylon-pull-down-kitchen-faucet-1-handle-with-soap-dispenser-stainless-steel-f5297clo2gs-56305366', imageUrl: 'https://images.pfisterfaucets.com/is/image/WebAssets/pf_ceylon_f-529-7cloc_c1-dp-sp?wid=600&qlt=80&resMode=sharp&fmt=png-alpha', labelEn: 'Pfister Ceylon Pull-Down Kitchen Faucet with Soap Dispenser', labelZh: 'Pfister Ceylon 下拉式厨房水龙头配皂液器' },
      { url: 'https://www.rona.ca/en/product/procore-flex-vinyl-flooring-river-oak-9-in-x-5972-in-6-pieces-lwd6906rcb-45885003', labelEn: 'Procore Flex Vinyl Flooring - River Oak', labelZh: 'Procore Flex 乙烯基地板 - 河橡木色' },
      { url: 'https://www.rona.ca/en/product/vanity-art-36-in-w-single-sink-bathroom-vanity-w-engineered-marble-top-and-brushed-gold-handle-natural-oak-va9036-no-gb-332066601', imageUrl: 'https://cdn.shopify.com/s/files/1/0554/4614/2999/files/CVI36-G-GB-3.webp?v=1763315870', labelEn: 'Vanity Art 36-in Single Sink Bathroom Vanity - Natural Oak', labelZh: 'Vanity Art 36英寸单盆浴室柜 - 天然橡木' },
    ],
  },
  {
    slug: 'surrey-home-renovation',
    titleEn: 'Surrey Home Renovation',
    titleZh: '素里住宅装修',
    descriptionEn: 'Full home renovation including a stunning kitchen redesign.',
    descriptionZh: '全屋装修，包括令人惊叹的厨房重新设计。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Surrey',
    budgetRange: '$40,000 - $60,000',
    durationEn: '6 weeks', durationZh: '6周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/15.png',
    challengeEn: 'An aging Surrey home required a complete kitchen overhaul while maintaining the structural integrity and flow of the open-concept living area.',
    challengeZh: '一栋老旧的素里住宅需要全面翻新厨房，同时保持开放式客厅的结构完整性和动线。',
    solutionEn: 'We redesigned the kitchen layout for better workflow, installed custom cabinetry, and chose durable yet stylish materials that complement the open-concept design.',
    solutionZh: '我们重新设计了厨房布局以优化工作流程，安装了定制橱柜，选择了耐用又美观的材料来配合开放式设计。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/15.png', altEn: 'Surrey home renovation', altZh: '素里住宅装修' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/49.png', altEn: 'Living space renovation', altZh: '起居空间装修' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/53.png', altEn: 'Home transformation', altZh: '住宅改造' },
    ],
    scopes: [
      { en: 'Kitchen Design', zh: '厨房设计' }, { en: 'Cabinetry', zh: '橱柜' },
      { en: 'Countertops', zh: '台面' }, { en: 'Flooring', zh: '地板' }, { en: 'Painting', zh: '油漆' },
    ],
    externalProducts: [
      { url: 'https://www.rona.ca/en/product/goodfellow-engineered-hardwood-flooring-prefinished-natural-acacia-75-in-x-12-mm-708553000-50905286', imageUrl: 'https://cdn.shopify.com/s/files/1/0053/7575/4338/files/Specification.jpg?v=1704261079', labelEn: 'Goodfellow Engineered Hardwood Flooring - Natural Acacia', labelZh: 'Goodfellow 工程实木地板 - 天然相思木' },
      { url: 'https://www.rona.ca/en/product/sico-378-l-pure-white-pearl-latex-interior-paint-for-doors-and-trim-50316662', imageUrl: 'https://www.bmr.ca/media/catalog/product/cache/4d338e88f705b4164ea551ad342bc06e/0/6/062-6905_001_3.jpg', labelEn: 'SICO 3.78L Pure White Pearl Interior Paint', labelZh: 'SICO 3.78升纯白珍珠乳胶内墙漆' },
      { url: 'https://www.rona.ca/en/product/belanger-laminates-formica-countertop-walnut-wood-grain-stain-resistant-8-ft-l-x-25-1-2-in-d-x-1-1-4-in-t-12322490899479-58166850', imageUrl: 'https://cdn.shopify.com/s/files/1/0670/7442/5131/files/9479-wide-planked-walnut.jpg?v=1717092506', labelEn: 'Belanger Formica Countertop - Walnut Wood Grain', labelZh: 'Belanger Formica 台面 - 胡桃木纹' },
    ],
  },
  {
    slug: 'white-toned-kitchen-surrey',
    titleEn: 'White Toned Kitchen in Surrey',
    titleZh: '素里白色调厨房',
    descriptionEn: 'Elegant white-toned kitchen renovation with clean lines and modern appliances.',
    descriptionZh: '优雅的白色调厨房装修，线条简洁，配备现代家电。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Surrey',
    budgetRange: '$20,000 - $35,000',
    durationEn: '4 weeks', durationZh: '4周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/340.png',
    challengeEn: 'The homeowner wanted a bright, airy kitchen but the existing layout had poor lighting and dark-toned finishes.',
    challengeZh: '业主想要一个明亮通风的厨房，但现有布局采光不足且装饰色调偏暗。',
    solutionEn: 'We implemented an all-white palette with under-cabinet LED lighting, reflective quartz countertops, and strategically placed pot lights to maximize brightness.',
    solutionZh: '我们采用全白色调搭配橱柜下方LED灯带、反光石英台面和合理布置的筒灯，最大限度提升亮度。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/340.png', altEn: 'White kitchen Surrey', altZh: '素里白色厨房' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/02/微信图片_20250228155837.jpg', altEn: 'Kitchen details', altZh: '厨房细节' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/15.png', altEn: 'Modern kitchen', altZh: '现代厨房' },
    ],
    scopes: [
      { en: 'Cabinetry', zh: '橱柜' }, { en: 'Countertops', zh: '台面' },
      { en: 'Appliance Installation', zh: '家电安装' }, { en: 'Lighting', zh: '灯光' },
    ],
  },
  {
    slug: 'kitchen-renovation-delta',
    titleEn: 'Kitchen Renovation in Delta BC',
    titleZh: '三角洲厨房装修',
    descriptionEn: 'Modern kitchen renovation featuring custom cabinetry and quartz countertops.',
    descriptionZh: '现代厨房装修，配备定制橱柜和石英台面。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Delta',
    budgetRange: '$25,000 - $40,000',
    durationEn: '4 weeks', durationZh: '4周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/73.png',
    challengeEn: 'Limited counter space and outdated appliances made the kitchen inefficient for a family of five.',
    challengeZh: '台面空间有限且家电过时，对于五口之家来说厨房效率低下。',
    solutionEn: 'We reconfigured the layout to include an island with extra storage, installed quartz countertops, and added a modern tile backsplash for a functional family kitchen.',
    solutionZh: '我们重新规划布局，增加了带额外储物空间的岛台，安装了石英台面和现代瓷砖后挡板，打造实用的家庭厨房。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/73.png', altEn: 'Delta kitchen renovation', altZh: '三角洲厨房装修' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/75-1.png', altEn: 'Kitchen countertops', altZh: '厨房台面' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/340.png', altEn: 'Custom cabinetry', altZh: '定制橱柜' },
    ],
    scopes: [
      { en: 'Cabinetry', zh: '橱柜' }, { en: 'Countertops', zh: '台面' },
      { en: 'Backsplash', zh: '后挡板' }, { en: 'Plumbing', zh: '水管' },
    ],
  },
  {
    slug: 'modern-kitchen-richmond',
    titleEn: 'Modern Kitchen Renovation in Richmond',
    titleZh: '列治文现代厨房装修',
    descriptionEn: 'Comprehensive modern kitchen renovation with island and premium fixtures.',
    descriptionZh: '全面的现代厨房装修，配备岛台和高端设备。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Richmond',
    budgetRange: '$35,000 - $50,000',
    durationEn: '5 weeks', durationZh: '5周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/75-1.png',
    challengeEn: 'The homeowners wanted a chef-grade kitchen with an island but the existing space had load-bearing walls limiting the layout options.',
    challengeZh: '业主想要一个带岛台的专业级厨房，但现有空间有承重墙限制了布局选择。',
    solutionEn: 'We worked with a structural engineer to safely open up the space, then installed a large waterfall-edge island, premium cabinetry, and professional-grade fixtures.',
    solutionZh: '我们与结构工程师合作安全地打通空间，然后安装了大型瀑布边岛台、高端橱柜和专业级洁具。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/75-1.png', altEn: 'Richmond modern kitchen', altZh: '列治文现代厨房' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/35.png', altEn: 'Kitchen island', altZh: '厨房岛台' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/73.png', altEn: 'Premium fixtures', altZh: '高端设备' },
    ],
    scopes: [
      { en: 'Kitchen Design', zh: '厨房设计' }, { en: 'Cabinetry', zh: '橱柜' },
      { en: 'Countertops', zh: '台面' }, { en: 'Island', zh: '岛台' }, { en: 'Fixtures', zh: '洁具' },
    ],
  },
  {
    slug: 'bathroom-renovation-delta',
    titleEn: 'Bathroom Renovation in Delta',
    titleZh: '三角洲浴室装修',
    descriptionEn: 'Complete bathroom renovation with luxury tile work and modern vanity.',
    descriptionZh: '完整的浴室装修，配备豪华瓷砖和现代洗手台。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'Delta',
    budgetRange: '$12,000 - $20,000',
    durationEn: '2 weeks', durationZh: '2周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/71.png',
    challengeEn: 'A small bathroom with water damage and an inefficient layout that wasted valuable floor space.',
    challengeZh: '小浴室存在水损问题，布局不合理浪费了宝贵的地面空间。',
    solutionEn: 'We repaired the water damage, reconfigured the layout for a walk-in shower, and installed large-format tiles and a floating vanity to create a spacious feel.',
    solutionZh: '我们修复了水损，重新规划布局改为步入式淋浴，安装了大尺寸瓷砖和悬浮洗手台，营造宽敞感。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/71.png', altEn: 'Delta bathroom renovation', altZh: '三角洲浴室装修' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/16.png', altEn: 'Modern vanity', altZh: '现代洗手台' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/主卫.jpg', altEn: 'Tile work', altZh: '瓷砖工艺' },
    ],
    scopes: [
      { en: 'Tile Work', zh: '瓷砖' }, { en: 'Vanity', zh: '洗手台' },
      { en: 'Plumbing', zh: '水管' }, { en: 'Lighting', zh: '灯光' },
    ],
    externalProducts: [
      { url: 'https://www.rona.ca/en/product/style-selections-ellenbee-30-in-white-bathroom-vanity-bv-8382-30w-31915078', imageUrl: 'https://cdn.shopify.com/s/files/1/0830/3499/7051/files/e69fd6e489e74826cd3cd925dcef4a73.jpg?v=1763302836', labelEn: 'Style Selections Ellenbee 30-in White Bathroom Vanity', labelZh: 'Style Selections Ellenbee 30英寸白色浴室柜' },
      { url: 'https://www.rona.ca/en/product/american-standard-tofino-toilet-with-elongated-bowl-one-piece-dual-flush-41-lpf-white-2996c203020-00535178', imageUrl: 'https://www.lapennaco.com/5979-large_default/american-standard-tofino-1pc-dual-flush-toilet.jpg', labelEn: 'American Standard Tofino Dual Flush Toilet - White', labelZh: 'American Standard Tofino 双冲马桶 - 白色' },
      { url: 'https://www.rona.ca/en/product/ore-international-luminere-8-light-gold-traditional-led-crystal-chandelier-k-5806h-330998032', labelEn: 'Ore International Luminere 8-Light LED Crystal Chandelier', labelZh: 'Ore International Luminere 8头LED水晶吊灯' },
    ],
  },
  {
    slug: 'richmond-bathroom-remodel',
    titleEn: 'Richmond Bathroom Remodel',
    titleZh: '列治文浴室改造',
    descriptionEn: 'Spa-inspired bathroom remodel with freestanding tub and walk-in shower.',
    descriptionZh: '水疗风格浴室改造，配备独立浴缸和步入式淋浴。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'Richmond',
    budgetRange: '$18,000 - $28,000',
    durationEn: '3 weeks', durationZh: '3周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/主卫.jpg',
    challengeEn: 'The master bathroom felt cramped and outdated, with a bulky built-in tub taking up too much space.',
    challengeZh: '主卫感觉局促过时，笨重的内嵌浴缸占用了太多空间。',
    solutionEn: 'We replaced the built-in tub with an elegant freestanding soaker tub, added a frameless glass walk-in shower, and used spa-inspired natural stone tiles.',
    solutionZh: '我们用优雅的独立泡澡浴缸替换了内嵌浴缸，增加了无框玻璃步入式淋浴，采用水疗风格天然石材瓷砖。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/主卫.jpg', altEn: 'Richmond bathroom remodel', altZh: '列治文浴室改造' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/71.png', altEn: 'Freestanding tub', altZh: '独立浴缸' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/16.png', altEn: 'Walk-in shower', altZh: '步入式淋浴' },
    ],
    scopes: [
      { en: 'Tile Work', zh: '瓷砖' }, { en: 'Plumbing', zh: '水管' },
      { en: 'Freestanding Tub', zh: '独立浴缸' }, { en: 'Walk-in Shower', zh: '步入式淋浴' }, { en: 'Vanity', zh: '洗手台' },
    ],
    externalProducts: [
      { url: 'https://www.rona.ca/en/product/landon-co-landon-co-aqualine-clear-glass-sliding-alcove-shower-door-with-chrome-hardware-60-in-lv-8001-60245452', labelEn: 'Landon & Co. Aqualine 60-in Glass Sliding Shower Door', labelZh: 'Landon & Co. Aqualine 60英寸玻璃滑动淋浴门' },
      { url: 'https://www.rona.ca/en/product/diamond-now-masterbrand-vada-36-in-sandy-engineered-wood-bathroom-vanity-with-single-sink-white-cultured-marble-top-13847774', labelEn: 'Diamond Now Vada 36-in Bathroom Vanity with Marble Top', labelZh: 'Diamond Now Vada 36英寸浴室柜配大理石台面' },
      { url: 'https://www.rona.ca/en/product/deervalley-white-elongated-smart-toilet-bidet-dv-1s0029-332064471', imageUrl: 'https://cdn.shopify.com/s/files/1/0526/3536/9660/files/DV-1S0029V3-0624_19.jpg?v=1762168409', labelEn: 'DeerValley Smart Toilet Bidet with Heated Seat', labelZh: 'DeerValley 智能马桶盖一体机 - 带加热座圈' },
    ],
  },
  {
    slug: 'bathroom-vanity-west-vancouver',
    titleEn: 'Bathroom Vanity Renovation in West Vancouver',
    titleZh: '西温浴室洗手台装修',
    descriptionEn: 'Custom vanity installation with premium fixtures in a luxury home.',
    descriptionZh: '豪宅中的定制洗手台安装，配备高端洁具。',
    serviceType: 'bathroom',
    categoryEn: 'Bathroom', categoryZh: '卫浴',
    locationCity: 'West Vancouver',
    budgetRange: '$10,000 - $18,000',
    durationEn: '2 weeks', durationZh: '2周',
    spaceTypeEn: 'Luxury Residential', spaceTypeZh: '豪华住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/16.png',
    challengeEn: 'The luxury home required a custom vanity that matched the high-end aesthetic while providing ample storage for a busy family.',
    challengeZh: '豪宅需要一个与高端美学相匹配的定制洗手台，同时为繁忙的家庭提供充足的储物空间。',
    solutionEn: 'We designed and built a custom double-sink vanity with solid wood construction, paired with designer fixtures and a backlit mirror for a sophisticated look.',
    solutionZh: '我们设计并制作了实木双盆定制洗手台，搭配设计师洁具和背光镜，打造精致外观。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/16.png', altEn: 'West Vancouver bathroom vanity', altZh: '西温浴室洗手台' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/主卫.jpg', altEn: 'Custom vanity', altZh: '定制洗手台' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/71.png', altEn: 'Premium fixtures', altZh: '高端洁具' },
    ],
    scopes: [
      { en: 'Custom Vanity', zh: '定制洗手台' }, { en: 'Fixtures', zh: '洁具' },
      { en: 'Mirror', zh: '镜子' }, { en: 'Lighting', zh: '灯光' },
    ],
  },
  {
    slug: 'stunning-home-renovation-langley',
    titleEn: 'Langley Kitchen Renovation',
    titleZh: '兰里厨房翻新',
    descriptionEn: 'Beautiful kitchen transformation as part of a larger home renovation project.',
    descriptionZh: '作为大型家居装修项目一部分的美丽厨房改造。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Langley',
    budgetRange: '$35,000 - $50,000',
    durationEn: '4 weeks', durationZh: '4周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/49.png',
    challengeEn: 'A 30-year-old home with an outdated kitchen requiring complete modernization.',
    challengeZh: '一栋30年老屋，厨房过时需要全面现代化改造。',
    solutionEn: 'We redesigned the kitchen with modern cabinetry, quartz countertops, and new appliances for a fresh, contemporary look.',
    solutionZh: '我们用现代橱柜、石英台面和新家电重新设计了厨房，打造清新现代的外观。',
    featured: true,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/49.png', altEn: 'Langley kitchen renovation', altZh: '兰里厨房装修' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/53.png', altEn: 'Kitchen transformation', altZh: '厨房改造' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/52.png', altEn: 'Modern kitchen', altZh: '现代厨房' },
    ],
    scopes: [
      { en: 'Kitchen Design', zh: '厨房设计' }, { en: 'Cabinetry', zh: '橱柜' },
      { en: 'Countertops', zh: '台面' }, { en: 'Appliances', zh: '家电' }, { en: 'Lighting', zh: '灯光' },
    ],
  },
  {
    slug: 'surrey-home-before-after',
    titleEn: 'Surrey Kitchen Transformation',
    titleZh: '素里厨房蜕变',
    descriptionEn: 'Dramatic kitchen renovation showcasing a complete transformation.',
    descriptionZh: '震撼的厨房装修，展示完整的蜕变过程。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Surrey',
    budgetRange: '$28,000 - $42,000',
    durationEn: '4 weeks', durationZh: '4周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/53.png',
    challengeEn: 'A neglected kitchen with severely dated interiors requiring both cosmetic and functional updates.',
    challengeZh: '一个被忽视的厨房，室内严重过时，需要外观和功能两方面的更新。',
    solutionEn: 'We completely refreshed the kitchen with new flooring, modern fixtures, fresh paint, and updated electrical.',
    solutionZh: '我们对厨房进行全面翻新——新地板、现代洁具、新鲜油漆和电气升级。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/53.png', altEn: 'Surrey kitchen before and after', altZh: '素里厨房前后对比' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/49.png', altEn: 'Kitchen transformation', altZh: '厨房改造' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/15.png', altEn: 'Renovation results', altZh: '装修成果' },
    ],
    scopes: [
      { en: 'Cabinetry', zh: '橱柜' }, { en: 'Countertops', zh: '台面' },
      { en: 'Flooring', zh: '地板' }, { en: 'Painting', zh: '油漆' }, { en: 'Electrical', zh: '电气' },
    ],
  },
  {
    slug: 'commercial-renovation-skin-lab-granville',
    titleEn: 'Commercial Renovation - Skin Lab Granville',
    titleZh: '商业装修 - Skin Lab Granville',
    descriptionEn: 'Professional commercial space renovation for a skincare clinic on Granville.',
    descriptionZh: 'Granville街护肤诊所的专业商业空间装修。',
    serviceType: 'commercial',
    categoryEn: 'Commercial', categoryZh: '商业',
    locationCity: 'Vancouver',
    budgetRange: '$50,000 - $75,000',
    durationEn: '6 weeks', durationZh: '6周',
    spaceTypeEn: 'Commercial', spaceTypeZh: '商业',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/84.jpg',
    challengeEn: 'Converting a raw commercial shell into a premium skincare clinic that meets health code requirements while projecting a luxurious brand image.',
    challengeZh: '将一个毛坯商业空间改造成符合卫生规范要求的高端护肤诊所，同时展现奢华品牌形象。',
    solutionEn: 'We designed a clean, clinical yet luxurious interior with custom treatment rooms, specialized plumbing for treatment stations, and a welcoming reception area that reflects the brand.',
    solutionZh: '我们设计了简洁临床又不失奢华的室内空间，包含定制治疗室、专业水管设施和体现品牌特色的温馨接待区。',
    featured: true,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/84.jpg', altEn: 'Skin Lab Granville commercial renovation', altZh: 'Skin Lab Granville商业装修' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/49.png', altEn: 'Commercial interior', altZh: '商业内部' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/52.png', altEn: 'Clinic design', altZh: '诊所设计' },
    ],
    scopes: [
      { en: 'Interior Build-out', zh: '室内装修' }, { en: 'Plumbing', zh: '水管' },
      { en: 'Electrical', zh: '电气' }, { en: 'Custom Millwork', zh: '定制木工' }, { en: 'Painting', zh: '油漆' },
    ],
  },
  {
    slug: 'basement-renovation-vancouver',
    titleEn: 'Basement Renovation in Vancouver',
    titleZh: '温哥华地下室装修',
    descriptionEn: 'Full basement conversion into a modern living space with home theater and guest suite.',
    descriptionZh: '地下室全面改造为现代生活空间，配备家庭影院和客房。',
    serviceType: 'basement',
    categoryEn: 'Basement', categoryZh: '地下室',
    locationCity: 'Vancouver',
    budgetRange: '$40,000 - $60,000',
    durationEn: '8 weeks', durationZh: '8周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/49.png',
    challengeEn: 'An unfinished concrete basement with low ceilings, moisture issues, and no natural light — needing a complete transformation into usable living space.',
    challengeZh: '一个未完工的混凝土地下室，层高低、有潮湿问题且没有自然光——需要完全改造为可用的生活空间。',
    solutionEn: 'We waterproofed the foundation, installed recessed lighting to maximize headroom, added engineered hardwood flooring, and created a cozy home theater and guest suite with a full bathroom.',
    solutionZh: '我们对基础进行了防水处理，安装嵌入式照明以最大化净高，铺设工程硬木地板，并打造了舒适的家庭影院和配备独立卫浴的客房。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/49.png', altEn: 'Vancouver basement renovation', altZh: '温哥华地下室装修' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/53.png', altEn: 'Basement living area', altZh: '地下室生活区' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/52.png', altEn: 'Basement guest suite', altZh: '地下室客房' },
    ],
    scopes: [
      { en: 'Framing', zh: '框架' }, { en: 'Drywall', zh: '石膏板' }, { en: 'Flooring', zh: '地板' },
      { en: 'Electrical', zh: '电气' }, { en: 'Plumbing', zh: '水管' }, { en: 'Home Theater', zh: '家庭影院' },
    ],
    externalProducts: [
      { url: 'https://www.rona.ca/en/product/procore-flex-vinyl-flooring-river-oak-9-in-x-5972-in-6-pieces-lwd6906rcb-45885003', labelEn: 'Procore Flex Vinyl Flooring - River Oak', labelZh: 'Procore Flex 乙烯基地板 - 河橡木色' },
      { url: 'https://www.rona.ca/en/product/sico-378-l-pure-white-pearl-latex-interior-paint-for-doors-and-trim-50316662', imageUrl: 'https://www.bmr.ca/media/catalog/product/cache/4d338e88f705b4164ea551ad342bc06e/0/6/062-6905_001_3.jpg', labelEn: 'SICO 3.78L Pure White Pearl Interior Paint', labelZh: 'SICO 3.78升纯白珍珠乳胶内墙漆' },
    ],
  },
  {
    slug: 'cabinet-refacing-richmond',
    titleEn: 'Cabinet Refacing in Richmond',
    titleZh: '列治文橱柜翻新',
    descriptionEn: 'Professional cabinet refacing with new shaker-style doors, soft-close hardware, and modern pulls.',
    descriptionZh: '专业橱柜翻新，配备新摇门式柜门、缓冲五金件和现代拉手。',
    serviceType: 'cabinet',
    categoryEn: 'Cabinet', categoryZh: '橱柜',
    locationCity: 'Richmond',
    budgetRange: '$8,000 - $15,000',
    durationEn: '1 week', durationZh: '1周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/340.png',
    challengeEn: 'The existing kitchen cabinets were structurally sound but the dated oak finish and worn hardware made the kitchen feel old and uninviting.',
    challengeZh: '现有厨房橱柜结构完好，但过时的橡木饰面和磨损的五金件让厨房显得陈旧缺乏吸引力。',
    solutionEn: 'We replaced all door and drawer fronts with modern white shaker-style panels, upgraded to soft-close hinges and sleek brushed-nickel pulls, giving the kitchen a brand-new look at a fraction of full renovation cost.',
    solutionZh: '我们将所有柜门和抽屉面板更换为现代白色摇门式面板，升级为缓冲铰链和时尚的拉丝镍拉手，以远低于全面翻新的成本为厨房焕然一新。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/340.png', altEn: 'Richmond cabinet refacing', altZh: '列治文橱柜翻新' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/35.png', altEn: 'New cabinet doors', altZh: '新柜门' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/75-1.png', altEn: 'Cabinet hardware upgrade', altZh: '橱柜五金升级' },
    ],
    scopes: [
      { en: 'Cabinet Doors', zh: '柜门' }, { en: 'Drawer Fronts', zh: '抽屉面板' },
      { en: 'Hardware', zh: '五金件' }, { en: 'Hinges', zh: '铰链' },
    ],
  },
  {
    slug: 'richmond-kitchen-remodel-bath',
    titleEn: 'Richmond Kitchen Remodel',
    titleZh: '列治文厨房改造',
    descriptionEn: 'Complete kitchen remodel with modern finishes and efficient layout.',
    descriptionZh: '现代风格完整厨房改造，布局高效。',
    serviceType: 'kitchen',
    categoryEn: 'Kitchen', categoryZh: '厨房',
    locationCity: 'Richmond',
    budgetRange: '$35,000 - $55,000',
    durationEn: '5 weeks', durationZh: '5周',
    spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
    heroImageUrl: 'https://reno-stars.com/wp-content/uploads/2025/04/52.png',
    challengeEn: 'The homeowner needed a complete kitchen update on a moderate budget without compromising on quality.',
    challengeZh: '业主需要在有限预算内完成厨房更新，且不降低质量标准。',
    solutionEn: 'We sourced high-quality materials at competitive prices and delivered premium results within the budget.',
    solutionZh: '我们以有竞争力的价格采购优质材料，在预算内交付高品质成果。',
    featured: false,
    images: [
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/52.png', altEn: 'Richmond kitchen remodel', altZh: '列治文厨房改造' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/35.png', altEn: 'Kitchen remodel', altZh: '厨房改造' },
      { url: 'https://reno-stars.com/wp-content/uploads/2025/04/主卫.jpg', altEn: 'Modern finishes', altZh: '现代饰面' },
    ],
    scopes: [
      { en: 'Kitchen Remodel', zh: '厨房改造' }, { en: 'Cabinetry', zh: '橱柜' },
      { en: 'Flooring', zh: '地板' }, { en: 'Countertops', zh: '台面' },
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
  await db.delete(projectSites);

  console.log('  Cleared all projects, images, scopes, external products, and sites');
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
    console.log(`  Created site: ${site.slug}`);
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
