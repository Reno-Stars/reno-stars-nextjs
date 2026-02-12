/**
 * Seed project sites and their projects into the database.
 * Usage: pnpm db:seed:sites
 *
 * Creates proper sites grouping projects by property, then inserts
 * projects with their images and scopes.
 *
 * Sites with 3+ projects get showAsProject: true (whole-house display).
 * Sites with 1-2 projects get showAsProject: false (individual display).
 *
 * Idempotent: skips sites/projects that already exist (matched by slug).
 *
 * NOTE: Run with NEXT_PUBLIC_STORAGE_PROVIDER unset so that raw
 * production URLs are stored in the database. getAssetUrl() is
 * applied at query-time, not at insert-time.
 */

import { db } from '../lib/db';
import {
  projects as projectsTable,
  projectImagePairs,
  projectScopes,
  projectSites,
  services as servicesTable,
} from '../lib/db/schema';
import { eq } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProjectImage {
  url: string;
  altEn: string;
  altZh: string;
  isBefore?: boolean;
}

interface ProjectScope {
  en: string;
  zh: string;
}

interface ProjectData {
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  serviceType: 'kitchen' | 'bathroom' | 'whole-house' | 'basement' | 'cabinet' | 'commercial';
  categoryEn: string;
  categoryZh: string;
  locationCity: string;
  budgetRange: string;
  durationEn: string;
  durationZh: string;
  spaceTypeEn: string;
  spaceTypeZh: string;
  heroImageUrl: string;
  challengeEn: string;
  challengeZh: string;
  solutionEn: string;
  solutionZh: string;
  featured: boolean;
  badgeEn?: string;
  badgeZh?: string;
  excerptEn?: string;
  excerptZh?: string;
  projectStoryEn?: string;
  projectStoryZh?: string;
  images: ProjectImage[];
  scopes: ProjectScope[];
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
  projects: ProjectData[];
}

// ---------------------------------------------------------------------------
// Shared image URL prefix
// ---------------------------------------------------------------------------
const WP = 'https://reno-stars.com/wp-content/uploads';

// ---------------------------------------------------------------------------
// Seed data — sites with their projects (images scraped from reno-stars.com)
// ---------------------------------------------------------------------------

const SITES: SiteData[] = [
  // ══════════════════════════════════════════════════════════════════════
  // WHOLE-HOUSE SITES (3+ projects → showAsProject: true)
  // ══════════════════════════════════════════════════════════════════════

  // ── Site 1: Langley Whole House (5 projects) ────────────────────────
  {
    slug: 'langley-whole-house-renovation',
    titleEn: 'Stunning Home Renovation in Langley',
    titleZh: '兰里全屋翻新',
    descriptionEn: 'Full-scale home transformation including kitchen, bathrooms, basement, and living spaces in Langley.',
    descriptionZh: '兰里全方位家居改造，包括厨房、浴室、地下室和起居空间。',
    locationCity: 'Langley',
    heroImageUrl: `${WP}/2024/04/68.jpg`,
    showAsProject: true,
    featured: true,
    projects: [
      {
        slug: 'langley-kitchen-renovation',
        titleEn: 'Kitchen Renovation',
        titleZh: '厨房翻新',
        descriptionEn: 'Complete kitchen redesign with modern cabinetry, quartz countertops, and updated appliances.',
        descriptionZh: '全面厨房重新设计，配备现代橱柜、石英台面和升级家电。',
        serviceType: 'kitchen',
        categoryEn: 'Kitchen', categoryZh: '厨房',
        locationCity: 'Langley',
        budgetRange: '$25,000 - $35,000',
        durationEn: '3 weeks', durationZh: '3周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2024/04/68.jpg`,
        challengeEn: 'The 30-year-old kitchen had outdated cabinetry, worn laminate countertops, and inefficient workflow layout.',
        challengeZh: '30年老旧厨房配备过时橱柜、磨损层压台面和低效动线布局。',
        solutionEn: 'We redesigned the layout for optimal workflow, installed shaker-style cabinets with soft-close hardware, and added quartz countertops with an undermount sink.',
        solutionZh: '我们重新设计布局以优化动线，安装了摇门式橱柜配缓冲五金件，并增加了石英台面搭配下嵌式水槽。',
        featured: true,
        images: [
          { url: `${WP}/2024/04/55.png`, altEn: 'Kitchen before renovation', altZh: '厨房装修前', isBefore: true },
          { url: `${WP}/2024/04/68.jpg`, altEn: 'Modern kitchen renovation in Langley', altZh: '兰里现代厨房翻新' },
          { url: `${WP}/2024/04/33.png`, altEn: 'Kitchen countertops and cabinets', altZh: '厨房台面和橱柜' },
        ],
        scopes: [
          { en: 'Cabinetry', zh: '橱柜' }, { en: 'Countertops', zh: '台面' },
          { en: 'Backsplash', zh: '后挡板' }, { en: 'Appliances', zh: '家电' },
        ],
      },
      {
        slug: 'langley-master-bathroom',
        titleEn: 'Master Bathroom Renovation',
        titleZh: '主卫翻新',
        descriptionEn: 'Luxurious master bathroom with double vanity, freestanding tub, and walk-in shower.',
        descriptionZh: '豪华主卫配备双盆洗手台、独立浴缸和步入式淋浴。',
        serviceType: 'bathroom',
        categoryEn: 'Bathroom', categoryZh: '卫浴',
        locationCity: 'Langley',
        budgetRange: '$18,000 - $25,000',
        durationEn: '2 weeks', durationZh: '2周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2024/04/70.jpg`,
        challengeEn: 'The master bathroom had a cramped layout with an outdated built-in tub and single vanity.',
        challengeZh: '主卫布局狭窄，配备过时的内嵌浴缸和单盆洗手台。',
        solutionEn: 'We reconfigured the space to include a double vanity, frameless glass walk-in shower, and elegant tile work throughout.',
        solutionZh: '我们重新规划空间，增加了双盆洗手台、无框玻璃步入式淋浴和全面精美瓷砖。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/57.png`, altEn: 'Master bathroom before renovation', altZh: '主卫装修前', isBefore: true },
          { url: `${WP}/2024/04/70.jpg`, altEn: 'Master bathroom with double vanity', altZh: '双盆洗手台主卫' },
          { url: `${WP}/2024/04/72.jpg`, altEn: 'Luxurious corner double vanity', altZh: '豪华转角双盆洗手台' },
        ],
        scopes: [
          { en: 'Tile Work', zh: '瓷砖' }, { en: 'Double Vanity', zh: '双盆洗手台' },
          { en: 'Walk-in Shower', zh: '步入式淋浴' }, { en: 'Plumbing', zh: '水管' },
        ],
      },
      {
        slug: 'langley-guest-bathroom',
        titleEn: 'Guest Bathroom Renovation',
        titleZh: '客卫翻新',
        descriptionEn: 'Updated guest bathroom with modern fixtures, new tile, and floating vanity.',
        descriptionZh: '客卫更新，配备现代洁具、新瓷砖和悬浮洗手台。',
        serviceType: 'bathroom',
        categoryEn: 'Bathroom', categoryZh: '卫浴',
        locationCity: 'Langley',
        budgetRange: '$8,000 - $12,000',
        durationEn: '1.5 weeks', durationZh: '1.5周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2024/04/32-1.png`,
        challengeEn: 'The guest bathroom was functional but severely dated with old tile and worn fixtures.',
        challengeZh: '客卫功能正常但严重过时，瓷砖老旧洁具磨损。',
        solutionEn: 'We replaced all surfaces with modern large-format tile, installed a floating vanity, and upgraded to contemporary fixtures.',
        solutionZh: '我们用现代大尺寸瓷砖替换所有表面，安装悬浮洗手台，并升级为时尚洁具。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/32-1.png`, altEn: 'Guest bathroom renovation', altZh: '客卫翻新' },
          { url: `${WP}/2024/04/31-1.png`, altEn: 'Bathroom fixtures detail', altZh: '浴室洁具细节' },
        ],
        scopes: [
          { en: 'Tile Work', zh: '瓷砖' }, { en: 'Vanity', zh: '洗手台' },
          { en: 'Fixtures', zh: '洁具' }, { en: 'Lighting', zh: '灯光' },
        ],
      },
      {
        slug: 'langley-basement-family-room',
        titleEn: 'Basement Family Room',
        titleZh: '地下室家庭房',
        descriptionEn: 'Unfinished basement converted into a cozy family room with entertainment area.',
        descriptionZh: '未完工地下室改造为温馨家庭房，配备娱乐区。',
        serviceType: 'basement',
        categoryEn: 'Basement', categoryZh: '地下室',
        locationCity: 'Langley',
        budgetRange: '$20,000 - $30,000',
        durationEn: '2.5 weeks', durationZh: '2.5周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2024/04/73.jpg`,
        challengeEn: 'An unfinished concrete basement with low ceilings and no natural light needed a full build-out.',
        challengeZh: '未完工的混凝土地下室层高低且无自然光，需要全面装修。',
        solutionEn: 'We framed and drywalled the space, installed recessed lighting, added engineered hardwood flooring, and created a dedicated entertainment zone.',
        solutionZh: '我们对空间进行了框架和石膏板装修，安装嵌入式灯光，铺设工程硬木地板，并打造了专属娱乐区。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/73.jpg`, altEn: 'Basement transformation into family room', altZh: '地下室改造为家庭房' },
          { url: `${WP}/2024/04/30-1.png`, altEn: 'Basement entertainment area', altZh: '地下室娱乐区' },
        ],
        scopes: [
          { en: 'Framing', zh: '框架' }, { en: 'Drywall', zh: '石膏板' },
          { en: 'Flooring', zh: '地板' }, { en: 'Electrical', zh: '电气' },
        ],
      },
      {
        slug: 'langley-flooring-painting',
        titleEn: 'Flooring & Painting',
        titleZh: '地板和油漆',
        descriptionEn: 'New engineered hardwood flooring and fresh interior painting throughout the main living areas.',
        descriptionZh: '主要生活区域全新工程硬木地板和室内油漆翻新。',
        serviceType: 'whole-house',
        categoryEn: 'Whole House', categoryZh: '全屋',
        locationCity: 'Langley',
        budgetRange: '$12,000 - $18,000',
        durationEn: '1.5 weeks', durationZh: '1.5周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2024/04/33.png`,
        challengeEn: 'Worn carpet and scuffed paint throughout the main and upper floors made the home feel tired.',
        challengeZh: '主层和上层磨损的地毯和刮花的油漆使整栋房屋显得陈旧。',
        solutionEn: 'We installed matching engineered hardwood throughout all living areas and applied a fresh, modern neutral palette to walls and trim.',
        solutionZh: '我们在所有生活区域铺设了统一的工程硬木地板，并对墙面和装饰线条涂刷了清新的现代中性色调。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/33.png`, altEn: 'Living area with new flooring', altZh: '新地板生活区' },
        ],
        scopes: [
          { en: 'Hardwood Flooring', zh: '硬木地板' }, { en: 'Interior Painting', zh: '室内油漆' },
          { en: 'Trim Work', zh: '装饰线条' },
        ],
      },
    ],
  },

  // ── Site 2: Surrey Whole House Before & After (5 projects) ──────────
  {
    slug: 'surrey-whole-house-before-after',
    titleEn: 'Surrey Home Before and After',
    titleZh: '素里住宅前后对比',
    descriptionEn: 'Dramatic whole house renovation showcasing complete transformation of kitchen, living areas, and multiple bathrooms.',
    descriptionZh: '震撼的全屋装修，展示厨房、起居区域和多个浴室的完整蜕变。',
    locationCity: 'Surrey',
    heroImageUrl: `${WP}/2025/03/contemporary-kitchen-remodel-marble-island-and-wood-cabinets.jpg`,
    showAsProject: true,
    featured: true,
    badgeEn: 'Featured',
    badgeZh: '精选',
    projects: [
      {
        slug: 'surrey-ba-kitchen',
        titleEn: 'Kitchen Renovation',
        titleZh: '厨房翻新',
        descriptionEn: 'Contemporary kitchen remodel with marble waterfall island, wood cabinets, and built-in fireplace.',
        descriptionZh: '现代厨房改造，配备大理石瀑布岛台、木质橱柜和嵌入式壁炉。',
        serviceType: 'kitchen',
        categoryEn: 'Kitchen', categoryZh: '厨房',
        locationCity: 'Surrey',
        budgetRange: '$25,000 - $35,000',
        durationEn: '3 weeks', durationZh: '3周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2025/03/contemporary-kitchen-remodel-marble-island-and-wood-cabinets.jpg`,
        challengeEn: 'A severely dated kitchen with dark cabinetry, worn countertops, and poor layout flow.',
        challengeZh: '严重过时的厨房，深色橱柜、磨损台面和不良动线。',
        solutionEn: 'We installed a stunning marble waterfall island as the centerpiece, paired with warm wood cabinets, integrated a built-in fireplace feature wall, and modernized all appliances.',
        solutionZh: '我们安装了令人惊叹的大理石瀑布岛台作为焦点，搭配温暖的木质橱柜，集成嵌入式壁炉特色墙，并升级了所有家电。',
        featured: true,
        images: [
          { url: `${WP}/2025/03/kitchen-renovation-before.jpeg`, altEn: 'Kitchen before renovation', altZh: '厨房装修前', isBefore: true },
          { url: `${WP}/2025/03/contemporary-kitchen-remodel-marble-island-and-wood-cabinets.jpg`, altEn: 'Contemporary kitchen with marble island', altZh: '大理石岛台现代厨房' },
          { url: `${WP}/2025/03/contemporary-kitchen-remode.jpg`, altEn: 'Kitchen remodel overview', altZh: '厨房改造全景' },
          { url: `${WP}/2025/03/contemporary-kitchen-renovation-with-marble-island-built-in-fireplace.jpg`, altEn: 'Kitchen with built-in fireplace', altZh: '带壁炉厨房' },
        ],
        scopes: [
          { en: 'Cabinetry', zh: '橱柜' }, { en: 'Marble Countertops', zh: '大理石台面' },
          { en: 'Island', zh: '岛台' }, { en: 'Appliances', zh: '家电' },
        ],
      },
      {
        slug: 'surrey-ba-living-dining',
        titleEn: 'Living & Dining Room',
        titleZh: '客厅和餐厅',
        descriptionEn: 'Open-concept living and dining renovation with marble fireplace and minimalist furniture.',
        descriptionZh: '开放式客厅和餐厅翻新，配备大理石壁炉和极简家具。',
        serviceType: 'whole-house',
        categoryEn: 'Whole House', categoryZh: '全屋',
        locationCity: 'Surrey',
        budgetRange: '$15,000 - $20,000',
        durationEn: '2 weeks', durationZh: '2周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2025/03/whole-house-renovation-open-living-and-dining-space.jpg`,
        challengeEn: 'Closed-off, dark living and dining areas with outdated finishes and poor flow between rooms.',
        challengeZh: '封闭阴暗的客厅和餐厅，装修过时且房间之间动线不畅。',
        solutionEn: 'We opened up the floor plan, installed a statement marble fireplace, added modern flooring, and created a bright, airy living space.',
        solutionZh: '我们打通了楼层平面，安装了标志性大理石壁炉，铺设了现代地板，打造了明亮通风的生活空间。',
        featured: false,
        images: [
          { url: `${WP}/2025/03/living-room-renovation-before.jpeg`, altEn: 'Living room before renovation', altZh: '客厅装修前', isBefore: true },
          { url: `${WP}/2025/03/living-room-before-makeover.jpg`, altEn: 'Dining area before makeover', altZh: '餐厅改造前', isBefore: true },
          { url: `${WP}/2025/03/whole-house-renovation-open-living-and-dining-space.jpg`, altEn: 'Open living and dining space', altZh: '开放式客厅和餐厅' },
          { url: `${WP}/2025/03/modern-living-and-dining-room-renovation-with-marble-fireplace-and-minimalist-furniture.jpg`, altEn: 'Modern living room with marble fireplace', altZh: '大理石壁炉现代客厅' },
          { url: `${WP}/2025/04/contemporary-open-kitchen-and-living-area-renovation.jpg`, altEn: 'Open kitchen and living area', altZh: '开放式厨房和客厅' },
          { url: `${WP}/2025/04/aerial-view-of-renovated-living-and-dining-area.jpg`, altEn: 'Aerial view of living area', altZh: '客厅俯瞰' },
        ],
        scopes: [
          { en: 'Flooring', zh: '地板' }, { en: 'Fireplace', zh: '壁炉' },
          { en: 'Painting', zh: '油漆' }, { en: 'Lighting', zh: '灯光' },
        ],
      },
      {
        slug: 'surrey-ba-master-bathroom',
        titleEn: 'Master Bathroom',
        titleZh: '主卫',
        descriptionEn: 'Modern master bathroom with walk-in shower, matte black fixtures, and wall niche.',
        descriptionZh: '现代主卫，配备步入式淋浴、哑光黑洁具和壁龛。',
        serviceType: 'bathroom',
        categoryEn: 'Bathroom', categoryZh: '卫浴',
        locationCity: 'Surrey',
        budgetRange: '$12,000 - $18,000',
        durationEn: '1.5 weeks', durationZh: '1.5周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2025/03/sleek-modern-shower-with-wall-niche-and-matte-black-fixtures.jpg`,
        challengeEn: 'The master bathroom had an outdated tub-shower combo with dated tile and brass fixtures.',
        challengeZh: '主卫配备过时的浴缸淋浴组合、老旧瓷砖和铜质洁具。',
        solutionEn: 'We removed the tub for a spacious walk-in shower with a built-in niche, installed matte black fixtures, and used large-format porcelain tiles.',
        solutionZh: '我们拆除浴缸改为宽敞的步入式淋浴配内置壁龛，安装哑光黑洁具，使用大尺寸瓷质瓷砖。',
        featured: false,
        images: [
          { url: `${WP}/2025/03/shower-renovation-before.jpg`, altEn: 'Shower before renovation', altZh: '淋浴装修前', isBefore: true },
          { url: `${WP}/2025/03/bathroom-renovation-before.jpg`, altEn: 'Bathroom before renovation', altZh: '浴室装修前', isBefore: true },
          { url: `${WP}/2025/03/sleek-modern-shower-with-wall-niche-and-matte-black-fixtures.jpg`, altEn: 'Modern shower with matte black fixtures', altZh: '哑光黑洁具现代淋浴' },
          { url: `${WP}/2025/03/spacious-contemporary-bathroom-with-double-vanity.jpg`, altEn: 'Spacious bathroom with double vanity', altZh: '宽敞双盆洗手台浴室' },
        ],
        scopes: [
          { en: 'Walk-in Shower', zh: '步入式淋浴' }, { en: 'Tile Work', zh: '瓷砖' },
          { en: 'Fixtures', zh: '洁具' }, { en: 'Plumbing', zh: '水管' },
        ],
      },
      {
        slug: 'surrey-ba-ensuite',
        titleEn: 'Ensuite Bathroom',
        titleZh: '套间浴室',
        descriptionEn: 'Ensuite bathroom with integrated sink vanity and ambient lighting.',
        descriptionZh: '套间浴室配备一体式水槽洗手台和氛围灯光。',
        serviceType: 'bathroom',
        categoryEn: 'Bathroom', categoryZh: '卫浴',
        locationCity: 'Surrey',
        budgetRange: '$10,000 - $15,000',
        durationEn: '1 week', durationZh: '1周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2025/03/modern-bathroom-vanity-with-integrated-sink.jpg`,
        challengeEn: 'A small ensuite bathroom with a single outdated vanity and poor lighting.',
        challengeZh: '小套间浴室配备一个过时的洗手台和不良照明。',
        solutionEn: 'We installed a modern integrated sink vanity with LED backlighting, added a backlit mirror, and used warm ambient lighting throughout.',
        solutionZh: '我们安装了带LED背光的现代一体式水槽洗手台，增加背光镜，全面采用温暖氛围灯光。',
        featured: false,
        images: [
          { url: `${WP}/2025/03/modern-bathroom-vanity-with-integrated-sink-before.jpg`, altEn: 'Vanity before renovation', altZh: '洗手台装修前', isBefore: true },
          { url: `${WP}/2025/03/modern-bathroom-vanity-with-integrated-sink.jpg`, altEn: 'Modern vanity with integrated sink', altZh: '一体式水槽现代洗手台' },
          { url: `${WP}/2025/03/sleek-modern-bathroom-with-ambient-lighting.jpg`, altEn: 'Bathroom with ambient lighting', altZh: '氛围灯浴室' },
        ],
        scopes: [
          { en: 'Vanity', zh: '洗手台' }, { en: 'Lighting', zh: '灯光' },
          { en: 'Mirror', zh: '镜子' }, { en: 'Tile Work', zh: '瓷砖' },
        ],
      },
      {
        slug: 'surrey-ba-powder-room',
        titleEn: 'Powder Room',
        titleZh: '化妆间',
        descriptionEn: 'Double sink powder room with warm lighting and contemporary design.',
        descriptionZh: '双盆化妆间，配备暖光照明和现代设计。',
        serviceType: 'bathroom',
        categoryEn: 'Bathroom', categoryZh: '卫浴',
        locationCity: 'Surrey',
        budgetRange: '$6,000 - $10,000',
        durationEn: '1 week', durationZh: '1周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2025/03/contemporary-double-sink-vanity-with-warm-lighting.jpg`,
        challengeEn: 'An outdated powder room with a single small vanity and dated wallpaper.',
        challengeZh: '过时的化妆间配备一个小洗手台和老旧壁纸。',
        solutionEn: 'We installed a double-sink vanity with warm under-cabinet lighting, modern faucets, and a clean contemporary aesthetic.',
        solutionZh: '我们安装了双盆洗手台配温暖的柜下灯光、现代水龙头和简洁的现代美学。',
        featured: false,
        images: [
          { url: `${WP}/2025/03/contemporary-double-sink-vanity-with-warm-lighting-before.jpg`, altEn: 'Powder room before renovation', altZh: '化妆间装修前', isBefore: true },
          { url: `${WP}/2025/03/before-makeover.jpg`, altEn: 'Room before makeover', altZh: '房间改造前', isBefore: true },
          { url: `${WP}/2025/03/contemporary-double-sink-vanity-with-warm-lighting.jpg`, altEn: 'Double sink vanity with warm lighting', altZh: '暖光双盆洗手台' },
          { url: `${WP}/2025/03/微信图片_20250324162608.jpg`, altEn: 'Powder room overview', altZh: '化妆间全景' },
        ],
        scopes: [
          { en: 'Double Vanity', zh: '双盆洗手台' }, { en: 'Fixtures', zh: '洁具' },
          { en: 'Lighting', zh: '灯光' }, { en: 'Painting', zh: '油漆' },
        ],
      },
    ],
  },

  // ── Site 3: Richmond Condo Remodel (3 projects) ─────────────────────
  {
    slug: 'richmond-condo-remodel',
    titleEn: 'Richmond Condo Remodel',
    titleZh: '列治文公寓改造',
    descriptionEn: 'Complete condo renovation including kitchen, bathrooms, stairs, and closets.',
    descriptionZh: '公寓全面改造，包括厨房、浴室、楼梯和衣柜。',
    locationCity: 'Richmond',
    heroImageUrl: `${WP}/2024/04/richmond-kitchen-remodel-project-after-renovation.png`,
    showAsProject: true,
    featured: false,
    projects: [
      {
        slug: 'richmond-condo-kitchen',
        titleEn: 'Kitchen Remodel',
        titleZh: '厨房改造',
        descriptionEn: 'Complete kitchen transformation with contemporary finishes and quartz surfaces.',
        descriptionZh: '采用现代风格和石英台面完成厨房全面改造。',
        serviceType: 'kitchen',
        categoryEn: 'Kitchen', categoryZh: '厨房',
        locationCity: 'Richmond',
        budgetRange: '$18,000 - $25,000',
        durationEn: '2 weeks', durationZh: '2周',
        spaceTypeEn: 'Condo', spaceTypeZh: '公寓',
        heroImageUrl: `${WP}/2024/04/richmond-kitchen-remodel-project-after-renovation.png`,
        challengeEn: 'A dated condo kitchen with worn cabinets and insufficient counter space.',
        challengeZh: '过时公寓厨房，橱柜磨损且台面空间不足。',
        solutionEn: 'We replaced all cabinetry with modern shaker-style units, installed quartz countertops, and added a tile backsplash for a fresh modern look.',
        solutionZh: '我们用现代摇门式橱柜替换了所有橱柜，安装石英台面并增加瓷砖后挡板，打造清新现代外观。',
        featured: false,
        images: [
          { url: `${WP}/2024/06/一楼天花.jpg`, altEn: '1st floor before renovation', altZh: '一楼装修前', isBefore: true },
          { url: `${WP}/2024/04/richmond-kitchen-remodel-project-after-renovation.png`, altEn: 'Kitchen after renovation', altZh: '厨房装修后' },
          { url: `${WP}/2024/04/10-1.png`, altEn: 'Kitchen remodel detail', altZh: '厨房改造细节' },
          { url: `${WP}/2024/06/一楼天花after.jpg`, altEn: '1st floor ceiling after', altZh: '一楼天花装修后' },
        ],
        scopes: [
          { en: 'Cabinetry', zh: '橱柜' }, { en: 'Countertops', zh: '台面' },
          { en: 'Backsplash', zh: '后挡板' }, { en: 'Ceiling', zh: '天花板' },
        ],
      },
      {
        slug: 'richmond-condo-main-bathroom',
        titleEn: 'Main Bathroom',
        titleZh: '主浴室',
        descriptionEn: 'First floor bathroom renovation with modern tile and vanity.',
        descriptionZh: '一楼浴室翻新，配备现代瓷砖和洗手台。',
        serviceType: 'bathroom',
        categoryEn: 'Bathroom', categoryZh: '卫浴',
        locationCity: 'Richmond',
        budgetRange: '$10,000 - $15,000',
        durationEn: '1.5 weeks', durationZh: '1.5周',
        spaceTypeEn: 'Condo', spaceTypeZh: '公寓',
        heroImageUrl: `${WP}/2024/06/一楼卫生间.jpg`,
        challengeEn: 'The first floor bathroom was outdated with old tile and worn fixtures.',
        challengeZh: '一楼卫生间过时，瓷砖老旧洁具磨损。',
        solutionEn: 'We gutted the bathroom and installed new tile flooring, a modern vanity, updated fixtures, and fresh paint.',
        solutionZh: '我们拆除了浴室并安装了新瓷砖地板、现代洗手台、升级洁具和新鲜油漆。',
        featured: false,
        images: [
          { url: `${WP}/2024/06/一楼卫生间旧图-1.jpg`, altEn: '1st floor bathroom before', altZh: '一楼卫生间装修前', isBefore: true },
          { url: `${WP}/2024/06/一楼卫生间.jpg`, altEn: '1st floor bathroom after', altZh: '一楼卫生间装修后' },
          { url: `${WP}/2024/06/微信图片_20221124163759.jpg`, altEn: '2nd floor small bathroom', altZh: '二楼小卫生间' },
          { url: `${WP}/2024/06/二楼小卫生间2-1-scaled.jpg`, altEn: 'Small bathroom detail', altZh: '小卫生间细节' },
        ],
        scopes: [
          { en: 'Tile Work', zh: '瓷砖' }, { en: 'Vanity', zh: '洗手台' },
          { en: 'Plumbing', zh: '水管' }, { en: 'Fixtures', zh: '洁具' },
        ],
      },
      {
        slug: 'richmond-condo-stairs-closet',
        titleEn: 'Stairs, Closet & Laundry',
        titleZh: '楼梯、衣柜和洗衣房',
        descriptionEn: 'Staircase renovation, custom closet build-out, and laundry room update.',
        descriptionZh: '楼梯翻新、定制衣柜和洗衣房更新。',
        serviceType: 'whole-house',
        categoryEn: 'Whole House', categoryZh: '全屋',
        locationCity: 'Richmond',
        budgetRange: '$8,000 - $12,000',
        durationEn: '1 week', durationZh: '1周',
        spaceTypeEn: 'Condo', spaceTypeZh: '公寓',
        heroImageUrl: `${WP}/2024/06/二楼楼梯.jpg`,
        challengeEn: 'The staircase had worn carpet, the closet lacked organization, and the laundry area was cramped.',
        challengeZh: '楼梯铺有磨损地毯，衣柜缺乏整理空间，洗衣区域狭窄。',
        solutionEn: 'We refinished the staircase with hardwood treads, built a custom closet system, and reorganized the laundry room with new shelving.',
        solutionZh: '我们用硬木踏板重新装修了楼梯，打造了定制衣柜系统，并用新搁架重新整理了洗衣房。',
        featured: false,
        images: [
          { url: `${WP}/2024/06/二楼楼梯旧图.jpg`, altEn: '2nd floor stairs before', altZh: '二楼楼梯装修前', isBefore: true },
          { url: `${WP}/2024/06/二楼楼梯.jpg`, altEn: '2nd floor stairs after', altZh: '二楼楼梯装修后' },
          { url: `${WP}/2024/06/衣柜.jpg`, altEn: 'Custom closet', altZh: '定制衣柜' },
          { url: `${WP}/2024/06/洗衣房.jpg`, altEn: 'Laundry room', altZh: '洗衣房' },
        ],
        scopes: [
          { en: 'Staircase', zh: '楼梯' }, { en: 'Custom Closet', zh: '定制衣柜' },
          { en: 'Laundry Room', zh: '洗衣房' }, { en: 'Flooring', zh: '地板' },
        ],
      },
    ],
  },

  // ── Site 4: Richmond Modern Full House (3 projects) ─────────────────
  {
    slug: 'richmond-modern-full-house',
    titleEn: 'Modern Full House Renovation in Richmond',
    titleZh: '列治文现代全屋翻新',
    descriptionEn: 'Comprehensive renovation including chef-grade kitchen, bathroom, and staircase with flooring throughout.',
    descriptionZh: '全面翻新，包括专业级厨房、浴室和楼梯及全屋地板。',
    locationCity: 'Richmond',
    heroImageUrl: `${WP}/2024/04/76.jpg`,
    showAsProject: true,
    featured: false,
    projects: [
      {
        slug: 'richmond-modern-kitchen',
        titleEn: 'Modern Kitchen with Island',
        titleZh: '带岛台的现代厨房',
        descriptionEn: 'Chef-grade kitchen with waterfall-edge island and premium cabinetry.',
        descriptionZh: '专业级厨房，配备瀑布边岛台和高端橱柜。',
        serviceType: 'kitchen',
        categoryEn: 'Kitchen', categoryZh: '厨房',
        locationCity: 'Richmond',
        budgetRange: '$25,000 - $35,000',
        durationEn: '3 weeks', durationZh: '3周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2024/04/76.jpg`,
        challengeEn: 'Load-bearing walls limited the kitchen layout, and the homeowners wanted a large island for entertaining.',
        challengeZh: '承重墙限制了厨房布局，业主想要一个大岛台用于招待客人。',
        solutionEn: 'We worked with a structural engineer to safely open the space, then installed a waterfall-edge island, premium cabinetry, and professional-grade fixtures.',
        solutionZh: '我们与结构工程师合作安全打通空间，安装了瀑布边岛台、高端橱柜和专业级洁具。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/p6-kitchen-before.png`, altEn: 'Kitchen before renovation', altZh: '厨房装修前', isBefore: true },
          { url: `${WP}/2024/04/76.jpg`, altEn: 'Modern kitchen in Richmond', altZh: '列治文现代厨房' },
          { url: `${WP}/2024/04/p6-kitchen-after.png`, altEn: 'Kitchen after renovation', altZh: '厨房装修后' },
          { url: `${WP}/2024/04/61.png`, altEn: 'Kitchen detail', altZh: '厨房细节' },
          { url: `${WP}/2024/04/68.png`, altEn: 'Kitchen overview', altZh: '厨房全景' },
        ],
        scopes: [
          { en: 'Kitchen Design', zh: '厨房设计' }, { en: 'Cabinetry', zh: '橱柜' },
          { en: 'Countertops', zh: '台面' }, { en: 'Island', zh: '岛台' },
        ],
      },
      {
        slug: 'richmond-full-house-bathroom',
        titleEn: 'Bathroom Renovation',
        titleZh: '浴室翻新',
        descriptionEn: 'Modern bathroom renovation with new tile, vanity, and fixtures.',
        descriptionZh: '现代浴室翻新，配备新瓷砖、洗手台和洁具。',
        serviceType: 'bathroom',
        categoryEn: 'Bathroom', categoryZh: '卫浴',
        locationCity: 'Richmond',
        budgetRange: '$10,000 - $15,000',
        durationEn: '1.5 weeks', durationZh: '1.5周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2024/04/p6-bath-after.png`,
        challengeEn: 'The bathroom had old fixtures, dated tile, and poor ventilation.',
        challengeZh: '浴室洁具老旧、瓷砖过时、通风不良。',
        solutionEn: 'We installed large-format tile, a modern floating vanity, updated all fixtures to brushed nickel, and improved ventilation.',
        solutionZh: '我们安装了大尺寸瓷砖、现代悬浮洗手台，将所有洁具升级为拉丝镍材质，并改善了通风。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/p6-bath-after.png`, altEn: 'Bathroom after renovation', altZh: '浴室装修后' },
          { url: `${WP}/2024/04/62.png`, altEn: 'Bathroom detail', altZh: '浴室细节' },
        ],
        scopes: [
          { en: 'Tile Work', zh: '瓷砖' }, { en: 'Vanity', zh: '洗手台' },
          { en: 'Fixtures', zh: '洁具' }, { en: 'Ventilation', zh: '通风' },
        ],
      },
      {
        slug: 'richmond-staircase-flooring',
        titleEn: 'Staircase & Flooring',
        titleZh: '楼梯和地板',
        descriptionEn: 'Staircase refinishing and new hardwood flooring throughout the home.',
        descriptionZh: '楼梯翻新和全屋新硬木地板。',
        serviceType: 'whole-house',
        categoryEn: 'Whole House', categoryZh: '全屋',
        locationCity: 'Richmond',
        budgetRange: '$8,000 - $12,000',
        durationEn: '1 week', durationZh: '1周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2024/04/63.png`,
        challengeEn: 'Worn carpet on the stairs and scratched laminate flooring throughout the home.',
        challengeZh: '楼梯磨损地毯和全屋刮花的层压地板。',
        solutionEn: 'We installed hardwood stair treads with painted risers and matching engineered hardwood throughout all living areas.',
        solutionZh: '我们安装了硬木楼梯踏板配漆面立板，并在所有生活区域铺设了配套的工程硬木地板。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/63.png`, altEn: 'Staircase renovation', altZh: '楼梯翻新' },
          { url: `${WP}/2024/04/p6-stair-floorings-after.png`, altEn: 'Staircase and flooring after', altZh: '楼梯和地板装修后' },
          { url: `${WP}/2024/04/64.png`, altEn: 'Living area flooring', altZh: '生活区地板' },
          { url: `${WP}/2024/04/66.png`, altEn: 'Flooring detail', altZh: '地板细节' },
        ],
        scopes: [
          { en: 'Staircase', zh: '楼梯' }, { en: 'Hardwood Flooring', zh: '硬木地板' },
          { en: 'Painting', zh: '油漆' },
        ],
      },
    ],
  },

  // ── Site 5: Skin Lab Granville (3 projects) ─────────────────────────
  {
    slug: 'skin-lab-granville',
    titleEn: 'Commercial Renovation - Skin Lab Granville',
    titleZh: '商业装修 - Skin Lab Granville',
    descriptionEn: 'Premium skincare clinic build-out including reception, treatment rooms, and hallways.',
    descriptionZh: '高端护肤诊所全面装修，包括接待区、治疗室和走廊。',
    locationCity: 'Vancouver',
    heroImageUrl: `${WP}/2024/06/1.jpg`,
    showAsProject: true,
    featured: true,
    projects: [
      {
        slug: 'skin-lab-reception',
        titleEn: 'Reception & Lobby',
        titleZh: '接待区和大厅',
        descriptionEn: 'Welcoming reception area and lobby reflecting the luxury brand aesthetic.',
        descriptionZh: '体现奢华品牌美学的温馨接待区和大厅。',
        serviceType: 'commercial',
        categoryEn: 'Commercial', categoryZh: '商业',
        locationCity: 'Vancouver',
        budgetRange: '$15,000 - $25,000',
        durationEn: '2 weeks', durationZh: '2周',
        spaceTypeEn: 'Commercial', spaceTypeZh: '商业',
        heroImageUrl: `${WP}/2024/06/4.jpg`,
        challengeEn: 'A raw commercial shell that needed to project a luxurious, welcoming first impression for clinic clients.',
        challengeZh: '毛坯商业空间需要为诊所客户营造奢华温馨的第一印象。',
        solutionEn: 'We designed a clean, elegant reception area with custom millwork, a branded accent wall, ambient lighting, and premium finishes.',
        solutionZh: '我们设计了简洁优雅的接待区，配备定制木工、品牌特色墙、氛围灯光和高端装饰。',
        featured: true,
        images: [
          { url: `${WP}/2024/06/5.jpg`, altEn: 'Reception area before', altZh: '接待区装修前', isBefore: true },
          { url: `${WP}/2024/06/1.jpg`, altEn: 'Clinic exterior after', altZh: '诊所外观装修后' },
          { url: `${WP}/2024/06/4.jpg`, altEn: 'Reception area after', altZh: '接待区装修后' },
          { url: `${WP}/2024/06/6.jpg`, altEn: 'Lobby detail', altZh: '大厅细节' },
        ],
        scopes: [
          { en: 'Custom Millwork', zh: '定制木工' }, { en: 'Lighting', zh: '灯光' },
          { en: 'Painting', zh: '油漆' }, { en: 'Flooring', zh: '地板' },
        ],
      },
      {
        slug: 'skin-lab-treatment-rooms',
        titleEn: 'Treatment Rooms',
        titleZh: '治疗室',
        descriptionEn: 'Specialized treatment rooms with clinical-grade plumbing and serene design.',
        descriptionZh: '专业治疗室，配备医疗级水管和宁静设计。',
        serviceType: 'commercial',
        categoryEn: 'Commercial', categoryZh: '商业',
        locationCity: 'Vancouver',
        budgetRange: '$20,000 - $30,000',
        durationEn: '2.5 weeks', durationZh: '2.5周',
        spaceTypeEn: 'Commercial', spaceTypeZh: '商业',
        heroImageUrl: `${WP}/2024/06/after-medical-spa-remodel-in-vancouver.jpg`,
        challengeEn: 'Treatment rooms required specialized plumbing for treatment stations while meeting health code requirements.',
        challengeZh: '治疗室需要为治疗台配备专业水管设施，同时满足卫生规范。',
        solutionEn: 'We built individual treatment rooms with soundproofing, specialized plumbing for each station, adjustable lighting, and calming interior finishes.',
        solutionZh: '我们打造了独立治疗室，配备隔音、每个工位的专业水管、可调灯光和宁静的室内装饰。',
        featured: false,
        images: [
          { url: `${WP}/2024/06/9.jpg`, altEn: 'Treatment room', altZh: '治疗室' },
          { url: `${WP}/2024/06/10.jpg`, altEn: 'Treatment station', altZh: '治疗台' },
          { url: `${WP}/2024/06/after-medical-spa-remodel-in-vancouver.jpg`, altEn: 'Serene treatment room', altZh: '宁静治疗室' },
          { url: `${WP}/2024/06/7.jpg`, altEn: 'Treatment room detail', altZh: '治疗室细节' },
        ],
        scopes: [
          { en: 'Plumbing', zh: '水管' }, { en: 'Electrical', zh: '电气' },
          { en: 'Soundproofing', zh: '隔音' }, { en: 'Interior Finishes', zh: '室内装饰' },
        ],
      },
      {
        slug: 'skin-lab-hallway',
        titleEn: 'Hallway & Common Areas',
        titleZh: '走廊和公共区域',
        descriptionEn: 'Innovative hallway design with wall shelving and indirect lighting.',
        descriptionZh: '创新走廊设计，配备墙面搁架和间接灯光。',
        serviceType: 'commercial',
        categoryEn: 'Commercial', categoryZh: '商业',
        locationCity: 'Vancouver',
        budgetRange: '$10,000 - $15,000',
        durationEn: '1.5 weeks', durationZh: '1.5周',
        spaceTypeEn: 'Commercial', spaceTypeZh: '商业',
        heroImageUrl: `${WP}/2024/06/19.jpg`,
        challengeEn: 'Plain commercial hallways needed to maintain the luxury aesthetic and wayfinding for clients.',
        challengeZh: '普通商业走廊需要保持奢华美学并为客户提供导向。',
        solutionEn: 'We designed hallways with integrated wall shelving for product display, indirect LED strip lighting, and premium wall finishes.',
        solutionZh: '我们设计了带有集成墙面搁架展示产品、间接LED灯带和高端墙面装饰的走廊。',
        featured: false,
        images: [
          { url: `${WP}/2024/06/before-renovation-innovative-hallway-design-with-wall-shelf-and-indirect-lighting-in-commercial-renovation-in-vancouver.jpg`, altEn: 'Hallway before renovation', altZh: '走廊装修前', isBefore: true },
          { url: `${WP}/2024/06/19.jpg`, altEn: 'Innovative hallway design after', altZh: '创新走廊设计装修后' },
          { url: `${WP}/2024/06/12.jpg`, altEn: 'Hallway lighting', altZh: '走廊灯光' },
          { url: `${WP}/2024/06/14.jpg`, altEn: 'Common area detail', altZh: '公共区域细节' },
        ],
        scopes: [
          { en: 'Wall Shelving', zh: '墙面搁架' }, { en: 'LED Lighting', zh: 'LED灯光' },
          { en: 'Wall Finishes', zh: '墙面装饰' },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  // SINGLE / DUAL PROJECT SITES (1-2 projects → showAsProject: false)
  // ══════════════════════════════════════════════════════════════════════

  // ── Site 6: Coquitlam White Shaker Kitchen (1 project) ──────────────
  {
    slug: 'coquitlam-white-shaker-kitchen',
    titleEn: 'Coquitlam - White Shaker Cabinets',
    titleZh: '高贵林 - 白色摇门橱柜',
    descriptionEn: 'Modern white shaker cabinet installation with premium countertops and backsplash.',
    descriptionZh: '现代白色摇门橱柜安装，配备高端台面和后挡板。',
    locationCity: 'Coquitlam',
    heroImageUrl: `${WP}/2025/02/微信图片_20250228114131-1-scaled.jpg`,
    showAsProject: false,
    featured: true,
    badgeEn: 'New',
    badgeZh: '新',
    projects: [
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
        heroImageUrl: `${WP}/2025/02/微信图片_20250228114131-1-scaled.jpg`,
        challengeEn: 'The existing kitchen had outdated oak cabinets and limited counter space, making the kitchen feel cramped and dark.',
        challengeZh: '原有厨房配备过时的橡木橱柜，台面空间有限，使厨房显得狭窄而阴暗。',
        solutionEn: 'We installed bright white shaker cabinets with soft-close hardware, paired with quartz countertops and a modern tile backsplash to open up the space.',
        solutionZh: '我们安装了明亮的白色摇门橱柜配备缓冲五金件，搭配石英台面和现代瓷砖后挡板，使空间更加开阔。',
        featured: true,
        badgeEn: 'New', badgeZh: '新',
        images: [
          { url: `${WP}/2025/02/微信图片_20250228114139-mfrh-original-scaled.jpg`, altEn: 'Kitchen before renovation', altZh: '厨房装修前', isBefore: true },
          { url: `${WP}/2025/02/微信图片_20250228114131-1-scaled.jpg`, altEn: 'White shaker cabinets after', altZh: '白色摇门橱柜装修后' },
          { url: `${WP}/2025/02/微信图片_20250228114429-mfrh-original-scaled.jpg`, altEn: 'Kitchen renovation detail', altZh: '厨房装修细节' },
          { url: `${WP}/2025/02/微信图片_20250228114441-mfrh-original-scaled.jpg`, altEn: 'Kitchen countertops', altZh: '厨房台面' },
          { url: `${WP}/2025/02/微信图片_20250228114451.jpg`, altEn: 'Cabinet hardware detail', altZh: '橱柜五金细节' },
          { url: `${WP}/2025/02/微信图片_20250228114455-mfrh-original-scaled.jpg`, altEn: 'Kitchen backsplash', altZh: '厨房后挡板' },
          { url: `${WP}/2025/02/微信图片_20250228114434-mfrh-original-scaled.jpg`, altEn: 'Shaker cabinet close-up', altZh: '摇门橱柜特写' },
          { url: `${WP}/2025/02/微信图片_20250228114446.jpg`, altEn: 'Kitchen island area', altZh: '厨房岛台区域' },
          { url: `${WP}/2025/02/微信图片_20250228114506.jpg`, altEn: 'Completed kitchen overview', altZh: '厨房完工全景' },
        ],
        scopes: [
          { en: 'Cabinetry', zh: '橱柜' }, { en: 'Countertops', zh: '台面' }, { en: 'Backsplash', zh: '后挡板' },
        ],
      },
    ],
  },

  // ── Site 7: Surrey Home Renovation (1 project) ──────────────────────
  {
    slug: 'surrey-home-renovation',
    titleEn: 'Surrey Home Renovation',
    titleZh: '素里住宅装修',
    descriptionEn: 'Full home renovation including a stunning kitchen redesign in Surrey.',
    descriptionZh: '素里全屋装修，包括令人惊叹的厨房重新设计。',
    locationCity: 'Surrey',
    heroImageUrl: `${WP}/2024/04/richmond-kitchen-after-p1.png`,
    showAsProject: false,
    featured: false,
    projects: [
      {
        slug: 'surrey-home-renovation-kitchen',
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
        heroImageUrl: `${WP}/2024/04/richmond-kitchen-after-p1.png`,
        challengeEn: 'An aging Surrey home required a complete kitchen overhaul while maintaining the structural integrity and flow of the open-concept living area.',
        challengeZh: '一栋老旧的素里住宅需要全面翻新厨房，同时保持开放式客厅的结构完整性和动线。',
        solutionEn: 'We redesigned the kitchen layout for better workflow, installed custom cabinetry, and chose durable yet stylish materials that complement the open-concept design.',
        solutionZh: '我们重新设计了厨房布局以优化工作流程，安装了定制橱柜，选择了耐用又美观的材料来配合开放式设计。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/richmond-kitchen-before-p1.png`, altEn: 'Kitchen before renovation', altZh: '厨房装修前', isBefore: true },
          { url: `${WP}/2024/04/richmond-kitchen-after-p1.png`, altEn: 'Kitchen after renovation', altZh: '厨房装修后' },
          { url: `${WP}/2024/04/16.png`, altEn: 'Bathroom renovation', altZh: '浴室装修' },
          { url: `${WP}/2024/04/17.png`, altEn: 'Living space detail', altZh: '起居空间细节' },
          { url: `${WP}/2024/04/18.png`, altEn: 'Stairway renovation', altZh: '楼梯装修' },
          { url: `${WP}/2024/04/19.png`, altEn: 'Home renovation detail', altZh: '住宅装修细节' },
          { url: `${WP}/2024/04/20.png`, altEn: 'Room transformation', altZh: '房间改造' },
          { url: `${WP}/2024/04/21.png`, altEn: 'Interior renovation', altZh: '室内装修' },
          { url: `${WP}/2024/04/22.png`, altEn: 'Home renovation overview', altZh: '住宅装修全景' },
        ],
        scopes: [
          { en: 'Kitchen Design', zh: '厨房设计' }, { en: 'Cabinetry', zh: '橱柜' },
          { en: 'Countertops', zh: '台面' }, { en: 'Flooring', zh: '地板' }, { en: 'Painting', zh: '油漆' },
        ],
      },
    ],
  },

  // ── Site 8: Surrey White Kitchen (1 project) ────────────────────────
  {
    slug: 'white-toned-kitchen-surrey',
    titleEn: 'White Toned Kitchen in Surrey',
    titleZh: '素里白色调厨房',
    descriptionEn: 'Elegant white-toned kitchen renovation with clean lines and modern appliances.',
    descriptionZh: '优雅的白色调厨房装修，线条简洁，配备现代家电。',
    locationCity: 'Surrey',
    heroImageUrl: `${WP}/2024/04/p3kiitchen-new.png`,
    showAsProject: false,
    featured: false,
    projects: [
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
        heroImageUrl: `${WP}/2024/04/p3kiitchen-new.png`,
        challengeEn: 'The homeowner wanted a bright, airy kitchen but the existing layout had poor lighting and dark-toned finishes.',
        challengeZh: '业主想要一个明亮通风的厨房，但现有布局采光不足且装饰色调偏暗。',
        solutionEn: 'We implemented an all-white palette with under-cabinet LED lighting, reflective quartz countertops, and strategically placed pot lights to maximize brightness.',
        solutionZh: '我们采用全白色调搭配橱柜下方LED灯带、反光石英台面和合理布置的筒灯，最大限度提升亮度。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/35.png`, altEn: 'Kitchen before renovation', altZh: '厨房装修前', isBefore: true },
          { url: `${WP}/2024/04/p3kiitchen-new.png`, altEn: 'After kitchen renovation', altZh: '厨房装修后' },
          { url: `${WP}/2024/04/36.png`, altEn: 'Enhanced lighting', altZh: '增强照明' },
          { url: `${WP}/2024/04/37.png`, altEn: 'White kitchen cabinets', altZh: '白色厨房橱柜' },
          { url: `${WP}/2024/04/38.png`, altEn: 'Kitchen countertops', altZh: '厨房台面' },
          { url: `${WP}/2024/04/39.png`, altEn: 'Kitchen appliances', altZh: '厨房家电' },
          { url: `${WP}/2024/04/21-1.png`, altEn: 'Kitchen detail', altZh: '厨房细节' },
          { url: `${WP}/2024/04/22-1.png`, altEn: 'Backsplash detail', altZh: '后挡板细节' },
          { url: `${WP}/2024/04/23-1.png`, altEn: 'Sink area', altZh: '水槽区域' },
          { url: `${WP}/2024/04/24-1.png`, altEn: 'Lighting detail', altZh: '灯光细节' },
          { url: `${WP}/2024/04/25-1.png`, altEn: 'Cabinet storage', altZh: '橱柜储物' },
          { url: `${WP}/2024/04/26-1.png`, altEn: 'Kitchen overview', altZh: '厨房全景' },
        ],
        scopes: [
          { en: 'Cabinetry', zh: '橱柜' }, { en: 'Countertops', zh: '台面' },
          { en: 'Appliance Installation', zh: '家电安装' }, { en: 'Lighting', zh: '灯光' },
        ],
      },
    ],
  },

  // ── Site 9: Delta Kitchen & Bathroom (2 projects) ───────────────────
  {
    slug: 'delta-kitchen-bathroom-renovation',
    titleEn: 'Delta Kitchen & Bathroom Renovation',
    titleZh: '三角洲厨房和浴室装修',
    descriptionEn: 'Kitchen and bathroom renovation for a Delta family home.',
    descriptionZh: '三角洲家庭住宅厨房和浴室装修。',
    locationCity: 'Delta',
    heroImageUrl: `${WP}/2024/04/90-2.png`,
    showAsProject: false,
    featured: false,
    projects: [
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
        heroImageUrl: `${WP}/2024/04/90-2.png`,
        challengeEn: 'Limited counter space and outdated appliances made the kitchen inefficient for a family of five.',
        challengeZh: '台面空间有限且家电过时，对于五口之家来说厨房效率低下。',
        solutionEn: 'We reconfigured the layout to include an island with extra storage, installed quartz countertops, and added a modern tile backsplash.',
        solutionZh: '我们重新规划布局，增加了带储物空间的岛台，安装了石英台面和现代瓷砖后挡板。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/delta-townhouse-before.png`, altEn: 'Delta kitchen before', altZh: '三角洲厨房装修前', isBefore: true },
          { url: `${WP}/2024/04/90-2.png`, altEn: 'Modern kitchen in Delta', altZh: '三角洲现代厨房' },
        ],
        scopes: [
          { en: 'Cabinetry', zh: '橱柜' }, { en: 'Countertops', zh: '台面' },
          { en: 'Backsplash', zh: '后挡板' }, { en: 'Plumbing', zh: '水管' },
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
        heroImageUrl: `${WP}/2024/04/88-2.png`,
        challengeEn: 'A small bathroom with water damage and an inefficient layout.',
        challengeZh: '小浴室存在水损问题，布局不合理。',
        solutionEn: 'We repaired water damage, reconfigured the layout for a walk-in shower, and installed large-format tiles and a floating vanity.',
        solutionZh: '我们修复了水损，重新规划布局改为步入式淋浴，安装了大尺寸瓷砖和悬浮洗手台。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/p7-bath-before.png`, altEn: 'Main bathroom before', altZh: '主浴室装修前', isBefore: true },
          { url: `${WP}/2024/04/36-1.png`, altEn: 'Small bathroom before', altZh: '小浴室装修前', isBefore: true },
          { url: `${WP}/2024/04/88-2.png`, altEn: 'Modern bathroom with walk-in shower', altZh: '步入式淋浴现代浴室' },
          { url: `${WP}/2024/04/43-3.png`, altEn: 'Small bathroom renovation', altZh: '小浴室装修' },
        ],
        scopes: [
          { en: 'Tile Work', zh: '瓷砖' }, { en: 'Vanity', zh: '洗手台' },
          { en: 'Plumbing', zh: '水管' }, { en: 'Lighting', zh: '灯光' },
        ],
      },
    ],
  },

  // ── Site 10: Richmond Spa Bathroom (1 project) ──────────────────────
  {
    slug: 'richmond-spa-bathroom',
    titleEn: 'Richmond Bathroom Remodel',
    titleZh: '列治文浴室改造',
    descriptionEn: 'Spa-inspired bathroom remodel with freestanding tub and walk-in shower.',
    descriptionZh: '水疗风格浴室改造，配备独立浴缸和步入式淋浴。',
    locationCity: 'Richmond',
    heroImageUrl: `${WP}/2025/04/luxury-modern-bathroom-renovation.jpg`,
    showAsProject: false,
    featured: false,
    projects: [
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
        heroImageUrl: `${WP}/2025/04/luxury-modern-bathroom-renovation.jpg`,
        challengeEn: 'The master bathroom felt cramped and outdated, with a bulky built-in tub taking up too much space.',
        challengeZh: '主卫感觉局促过时，笨重的内嵌浴缸占用了太多空间。',
        solutionEn: 'We replaced the built-in tub with an elegant freestanding soaker tub, added a frameless glass walk-in shower, and used spa-inspired natural stone tiles.',
        solutionZh: '我们用优雅的独立泡澡浴缸替换了内嵌浴缸，增加了无框玻璃步入式淋浴，采用水疗风格天然石材瓷砖。',
        featured: false,
        images: [
          { url: `${WP}/2025/03/微信图片_20250310174743.jpg`, altEn: 'Bathroom renovation overview', altZh: '浴室装修全景' },
          { url: `${WP}/2025/04/luxury-modern-bathroom-renovation.jpg`, altEn: 'Luxury modern bathroom', altZh: '豪华现代浴室' },
          { url: `${WP}/2025/04/VCT_VCT07508_Large-1-scaled.jpg`, altEn: 'Vanity detail', altZh: '洗手台细节' },
          { url: `${WP}/2025/03/vct_vct07481_large-1-scaled.jpg`, altEn: 'Walk-in shower', altZh: '步入式淋浴' },
          { url: `${WP}/2025/03/img_72272.jpeg`, altEn: 'Freestanding tub', altZh: '独立浴缸' },
          { url: `${WP}/2025/03/vct_vct07484_large.jpg`, altEn: 'Tile work detail', altZh: '瓷砖工艺细节' },
          { url: `${WP}/2025/03/vct_vct07487_large.jpg`, altEn: 'Shower niche detail', altZh: '淋浴壁龛细节' },
          { url: `${WP}/2025/03/vct_vct07490_large.jpg`, altEn: 'Bathroom lighting', altZh: '浴室灯光' },
          { url: `${WP}/2025/03/img_72642-1-scaled.jpeg`, altEn: 'Spa-inspired design', altZh: '水疗风格设计' },
          { url: `${WP}/2025/03/vct_vct07509_large.jpg`, altEn: 'Vanity close-up', altZh: '洗手台特写' },
          { url: `${WP}/2025/03/vct_vct07475_large.jpg`, altEn: 'Natural stone tiles', altZh: '天然石材瓷砖' },
          { url: `${WP}/2025/03/vct_vct07501_large.jpg`, altEn: 'Mirror and vanity', altZh: '镜子和洗手台' },
        ],
        scopes: [
          { en: 'Tile Work', zh: '瓷砖' }, { en: 'Plumbing', zh: '水管' },
          { en: 'Freestanding Tub', zh: '独立浴缸' }, { en: 'Walk-in Shower', zh: '步入式淋浴' }, { en: 'Vanity', zh: '洗手台' },
        ],
      },
    ],
  },

  // ── Site 11: West Vancouver Luxury Bathroom (1 project) ─────────────
  {
    slug: 'west-vancouver-luxury-bathroom',
    titleEn: 'Bathroom Vanity Renovation in West Vancouver',
    titleZh: '西温浴室洗手台装修',
    descriptionEn: 'Custom vanity installation with premium fixtures in a luxury home.',
    descriptionZh: '豪宅中的定制洗手台安装，配备高端洁具。',
    locationCity: 'West Vancouver',
    heroImageUrl: `${WP}/2024/04/p4-bath-after.png`,
    showAsProject: false,
    featured: false,
    projects: [
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
        heroImageUrl: `${WP}/2024/04/p4-bath-after.png`,
        challengeEn: 'The luxury home required a custom vanity that matched the high-end aesthetic while providing ample storage.',
        challengeZh: '豪宅需要一个与高端美学相匹配的定制洗手台，同时提供充足储物空间。',
        solutionEn: 'We designed and built a custom double-sink vanity with solid wood construction, paired with designer fixtures and a backlit mirror.',
        solutionZh: '我们设计并制作了实木双盆定制洗手台，搭配设计师洁具和背光镜。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/p4-bath-before.png`, altEn: 'Bathroom before renovation', altZh: '浴室装修前', isBefore: true },
          { url: `${WP}/2024/04/p4-bath-before-2.png`, altEn: 'Bathroom alternate angle before', altZh: '浴室另一角度装修前', isBefore: true },
          { url: `${WP}/2024/04/p4-bath-after.png`, altEn: 'Bathroom after renovation', altZh: '浴室装修后' },
          { url: `${WP}/2024/04/p4-bath-wash-after.png`, altEn: 'Floating vanity close-up', altZh: '悬浮洗手台特写' },
          { url: `${WP}/2024/04/p4-bath-after-2.png`, altEn: 'Bathroom alternate angle after', altZh: '浴室另一角度装修后' },
          { url: `${WP}/2024/07/64-project-photos.jpg`, altEn: 'Modern bathroom with marble tiles', altZh: '大理石瓷砖现代浴室' },
        ],
        scopes: [
          { en: 'Custom Vanity', zh: '定制洗手台' }, { en: 'Fixtures', zh: '洁具' },
          { en: 'Mirror', zh: '镜子' }, { en: 'Lighting', zh: '灯光' },
        ],
      },
    ],
  },

  // ── Site 12: Richmond Cabinet Refacing (1 project) ──────────────────
  {
    slug: 'richmond-cabinet-refacing',
    titleEn: 'Cabinet Refacing in Richmond',
    titleZh: '列治文橱柜翻新',
    descriptionEn: 'Professional cabinet refacing with new shaker-style doors and modern hardware.',
    descriptionZh: '专业橱柜翻新，配备新摇门式柜门和现代拉手。',
    locationCity: 'Richmond',
    heroImageUrl: `${WP}/2024/04/p9-kitchen-after.png`,
    showAsProject: false,
    featured: false,
    projects: [
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
        heroImageUrl: `${WP}/2024/04/p9-kitchen-after.png`,
        challengeEn: 'The existing kitchen cabinets were structurally sound but the dated oak finish and worn hardware made the kitchen feel old.',
        challengeZh: '现有厨房橱柜结构完好，但过时的橡木饰面和磨损的五金件让厨房显得陈旧。',
        solutionEn: 'We replaced all door and drawer fronts with modern white shaker-style panels, upgraded to soft-close hinges and sleek brushed-nickel pulls.',
        solutionZh: '我们将所有柜门和抽屉面板更换为现代白色摇门式面板，升级为缓冲铰链和拉丝镍拉手。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/p9-kitchen-before.png`, altEn: 'Cabinets before refacing', altZh: '橱柜翻新前', isBefore: true },
          { url: `${WP}/2024/04/p9-kitchen-after.png`, altEn: 'Renovated kitchen', altZh: '翻新后厨房' },
          { url: `${WP}/2024/04/84.png`, altEn: 'Cabinet detail', altZh: '橱柜细节' },
          { url: `${WP}/2024/04/85.png`, altEn: 'New cabinet doors', altZh: '新柜门' },
          { url: `${WP}/2024/04/86.png`, altEn: 'Hardware upgrade', altZh: '五金升级' },
          { url: `${WP}/2024/04/92.png`, altEn: 'Cabinet refacing result', altZh: '橱柜翻新效果' },
          { url: `${WP}/2024/04/90.png`, altEn: 'Bathroom vanity', altZh: '洗手台' },
          { url: `${WP}/2024/04/88.png`, altEn: 'Bathroom renovation', altZh: '浴室装修' },
          { url: `${WP}/2024/04/83-1.png`, altEn: 'Kitchen overview', altZh: '厨房全景' },
          { url: `${WP}/2024/04/87-1.png`, altEn: 'Cabinet close-up', altZh: '橱柜特写' },
          { url: `${WP}/2024/04/89-1.png`, altEn: 'Drawer fronts', altZh: '抽屉面板' },
          { url: `${WP}/2024/04/91-1.png`, altEn: 'Hardware detail', altZh: '五金件细节' },
        ],
        scopes: [
          { en: 'Cabinet Doors', zh: '柜门' }, { en: 'Drawer Fronts', zh: '抽屉面板' },
          { en: 'Hardware', zh: '五金件' }, { en: 'Hinges', zh: '铰链' },
        ],
      },
    ],
  },

  // ── Site 13: Richmond Kitchen & Bath (2 projects) ───────────────────
  {
    slug: 'richmond-kitchen-bath-upgrade',
    titleEn: 'Richmond Kitchen Remodel & Bath',
    titleZh: '列治文厨房和浴室改造',
    descriptionEn: 'Combined kitchen remodel and bathroom renovation in Richmond.',
    descriptionZh: '列治文厨房和浴室联合改造。',
    locationCity: 'Richmond',
    heroImageUrl: `${WP}/2024/04/13-3.png`,
    showAsProject: false,
    featured: false,
    projects: [
      {
        slug: 'richmond-kb-kitchen',
        titleEn: 'Kitchen Remodel',
        titleZh: '厨房改造',
        descriptionEn: 'Modern kitchen remodel with new cabinetry, countertops, and sink.',
        descriptionZh: '现代厨房改造，配备新橱柜、台面和水槽。',
        serviceType: 'kitchen',
        categoryEn: 'Kitchen', categoryZh: '厨房',
        locationCity: 'Richmond',
        budgetRange: '$20,000 - $30,000',
        durationEn: '3 weeks', durationZh: '3周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2024/04/13-3.png`,
        challengeEn: 'The kitchen needed a full update on a moderate budget without compromising quality.',
        challengeZh: '厨房需要在有限预算内进行全面更新，且不降低质量。',
        solutionEn: 'We sourced high-quality materials at competitive prices, installed new cabinetry with soft-close hardware, quartz countertops, and a modern undermount sink.',
        solutionZh: '我们以有竞争力的价格采购优质材料，安装了带缓冲五金的新橱柜、石英台面和现代下嵌式水槽。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/14.png`, altEn: 'Kitchen before renovation', altZh: '厨房装修前', isBefore: true },
          { url: `${WP}/2024/04/54-1.png`, altEn: 'Sink before renovation', altZh: '水槽装修前', isBefore: true },
          { url: `${WP}/2024/04/13-3.png`, altEn: 'Modern kitchen in Richmond', altZh: '列治文现代厨房' },
          { url: `${WP}/2024/04/12-4.png`, altEn: 'Kitchen detail', altZh: '厨房细节' },
          { url: `${WP}/2024/04/55-1.png`, altEn: 'Modern sink after', altZh: '现代水槽装修后' },
        ],
        scopes: [
          { en: 'Cabinetry', zh: '橱柜' }, { en: 'Countertops', zh: '台面' },
          { en: 'Sink', zh: '水槽' }, { en: 'Flooring', zh: '地板' },
        ],
      },
      {
        slug: 'richmond-kb-bathroom',
        titleEn: 'Bathroom Renovation',
        titleZh: '浴室翻新',
        descriptionEn: 'Bathroom renovation with modern tile and updated fixtures.',
        descriptionZh: '浴室翻新，配备现代瓷砖和升级洁具。',
        serviceType: 'bathroom',
        categoryEn: 'Bathroom', categoryZh: '卫浴',
        locationCity: 'Richmond',
        budgetRange: '$10,000 - $18,000',
        durationEn: '2 weeks', durationZh: '2周',
        spaceTypeEn: 'Residential', spaceTypeZh: '住宅',
        heroImageUrl: `${WP}/2024/04/57-1.png`,
        challengeEn: 'The bathroom needed modernizing to match the updated kitchen aesthetic.',
        challengeZh: '浴室需要现代化改造以配合更新后的厨房美学。',
        solutionEn: 'We installed new tile, a modern vanity, updated fixtures, and coordinated the design palette with the kitchen renovation.',
        solutionZh: '我们安装了新瓷砖、现代洗手台、升级洁具，并协调设计色调与厨房翻新一致。',
        featured: false,
        images: [
          { url: `${WP}/2024/04/57-1.png`, altEn: 'Bathroom renovation', altZh: '浴室装修' },
          { url: `${WP}/2024/04/56-1.png`, altEn: 'Bathroom detail', altZh: '浴室细节' },
        ],
        scopes: [
          { en: 'Tile Work', zh: '瓷砖' }, { en: 'Vanity', zh: '洗手台' },
          { en: 'Fixtures', zh: '洁具' }, { en: 'Plumbing', zh: '水管' },
        ],
      },
    ],
  },

  // ── Site 14: Vancouver Basement (1 project) ─────────────────────────
  {
    slug: 'vancouver-basement-renovation',
    titleEn: 'Basement Renovation in Vancouver',
    titleZh: '温哥华地下室装修',
    descriptionEn: 'Full basement conversion into a modern living space with home theater and guest suite.',
    descriptionZh: '地下室全面改造为现代生活空间，配备家庭影院和客房。',
    locationCity: 'Vancouver',
    heroImageUrl: `${WP}/2025/04/49.png`,
    showAsProject: false,
    featured: false,
    projects: [
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
        heroImageUrl: `${WP}/2025/04/49.png`,
        challengeEn: 'An unfinished concrete basement with low ceilings, moisture issues, and no natural light.',
        challengeZh: '未完工的混凝土地下室，层高低、有潮湿问题且没有自然光。',
        solutionEn: 'We waterproofed the foundation, installed recessed lighting, added engineered hardwood flooring, and created a home theater and guest suite.',
        solutionZh: '我们进行了防水处理，安装嵌入式照明，铺设工程硬木地板，并打造了家庭影院和客房。',
        featured: false,
        images: [
          { url: `${WP}/2025/04/49.png`, altEn: 'Vancouver basement renovation', altZh: '温哥华地下室装修' },
          { url: `${WP}/2025/04/53.png`, altEn: 'Basement living area', altZh: '地下室生活区' },
          { url: `${WP}/2025/04/52.png`, altEn: 'Basement guest suite', altZh: '地下室客房' },
        ],
        scopes: [
          { en: 'Framing', zh: '框架' }, { en: 'Drywall', zh: '石膏板' }, { en: 'Flooring', zh: '地板' },
          { en: 'Electrical', zh: '电气' }, { en: 'Plumbing', zh: '水管' }, { en: 'Home Theater', zh: '家庭影院' },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Seeding sites and projects...\n');

  // Look up service IDs for linking
  const serviceRows = await db
    .select({ slug: servicesTable.slug, id: servicesTable.id })
    .from(servicesTable);
  const serviceMap = new Map(serviceRows.map((s: { slug: string; id: string }) => [s.slug, s.id]));

  if (serviceMap.size === 0) {
    console.error('No services found in database. Run `pnpm db:seed` first.');
    process.exit(1);
  }

  let sitesSeeded = 0;
  let sitesSkipped = 0;
  let projectsSeeded = 0;
  let projectsSkipped = 0;
  let failed = 0;

  for (const site of SITES) {
    try {
      // --- Upsert site ---
      let siteId: string;
      const existingSite = await db
        .select({ id: projectSites.id })
        .from(projectSites)
        .where(eq(projectSites.slug, site.slug))
        .limit(1);

      if (existingSite.length > 0) {
        siteId = existingSite[0].id;
        console.log(`  Site "${site.slug}" already exists — using existing`);
        sitesSkipped++;
      } else {
        const [newSite] = await db
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
        siteId = newSite.id;
        console.log(`  Created site "${site.slug}" (${site.projects.length} projects, showAsProject: ${site.showAsProject})`);
        sitesSeeded++;
      }

      // --- Insert projects for this site ---
      for (let i = 0; i < site.projects.length; i++) {
        const p = site.projects[i];

        const existingProject = await db
          .select({ id: projectsTable.id })
          .from(projectsTable)
          .where(eq(projectsTable.slug, p.slug))
          .limit(1);

        if (existingProject.length > 0) {
          console.log(`    Skipping project "${p.slug}" (already exists)`);
          projectsSkipped++;
          continue;
        }

        const serviceId = serviceMap.get(p.serviceType) ?? null;
        if (!serviceId) {
          console.warn(`    Warning: No service found for type "${p.serviceType}"`);
        }

        const [inserted] = await db
          .insert(projectsTable)
          .values({
            slug: p.slug,
            titleEn: p.titleEn,
            titleZh: p.titleZh,
            descriptionEn: p.descriptionEn,
            descriptionZh: p.descriptionZh,
            excerptEn: p.excerptEn ?? null,
            excerptZh: p.excerptZh ?? null,
            projectStoryEn: p.projectStoryEn ?? null,
            projectStoryZh: p.projectStoryZh ?? null,
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
            featured: p.featured,
            badgeEn: p.badgeEn ?? null,
            badgeZh: p.badgeZh ?? null,
            isPublished: true,
            publishedAt: new Date(),
            siteId,
            displayOrderInSite: i,
          })
          .returning({ id: projectsTable.id });

        const projectId = inserted.id;

        // Batch insert images as pairs (after images only - no before images in seed data)
        if (p.images.length > 0) {
          await db.insert(projectImagePairs).values(
            p.images.map((img, idx) => ({
              projectId,
              beforeImageUrl: img.isBefore ? img.url : null,
              beforeAltTextEn: img.isBefore ? img.altEn : null,
              beforeAltTextZh: img.isBefore ? img.altZh : null,
              afterImageUrl: img.isBefore ? null : img.url,
              afterAltTextEn: img.isBefore ? null : img.altEn,
              afterAltTextZh: img.isBefore ? null : img.altZh,
              displayOrder: idx,
            }))
          );
        }

        // Batch insert scopes
        if (p.scopes.length > 0) {
          await db.insert(projectScopes).values(
            p.scopes.map((scope, idx) => ({
              projectId,
              scopeEn: scope.en,
              scopeZh: scope.zh,
              displayOrder: idx,
            }))
          );
        }

        console.log(`    Seeded project "${p.slug}"`);
        projectsSeeded++;
      }
    } catch (err) {
      console.error(`  Failed to seed site "${site.slug}":`, err);
      failed++;
    }
  }

  console.log(
    `\nDone.` +
      `\n  Sites:    ${sitesSeeded} created, ${sitesSkipped} skipped` +
      `\n  Projects: ${projectsSeeded} created, ${projectsSkipped} skipped` +
      `\n  Failed:   ${failed}`
  );
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Failed to seed sites:', err);
  process.exit(1);
});
