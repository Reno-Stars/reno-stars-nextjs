import type { Project, ServiceType, Locale } from '../types';
import { categoryToServiceType } from './services';

export const projects: Project[] = [
  {
    slug: 'coquitlam-white-shaker-cabinets',
    title: {
      en: 'Coquitlam - White Shaker Cabinets',
      zh: '高贵林 - 白色摇门橱柜',
    },
    description: {
      en: 'Modern white shaker cabinet installation with premium countertops and backsplash.',
      zh: '现代白色摇门橱柜安装，配备高端台面和后挡板。',
    },
    service_type: 'kitchen',
    category: { en: 'Kitchen', zh: '厨房' },
    location_city: 'Coquitlam',
    budget_range: '$15,000 - $25,000',
    duration: { en: '3 weeks', zh: '3周' },
    space_type: { en: 'Residential', zh: '住宅' },
    hero_image: 'https://reno-stars.com/wp-content/uploads/2025/02/微信图片_20250228155837.jpg',
    images: [
      { src: 'https://reno-stars.com/wp-content/uploads/2025/02/微信图片_20250228155837.jpg', alt: { en: 'White shaker kitchen cabinets', zh: '白色摇门厨房橱柜' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/340.png', alt: { en: 'Kitchen renovation detail', zh: '厨房装修细节' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/35.png', alt: { en: 'Kitchen countertops', zh: '厨房台面' } },
    ],
    service_scope: {
      en: ['Cabinetry', 'Countertops', 'Backsplash'],
      zh: ['橱柜', '台面', '后挡板'],
    },
    challenge: {
      en: 'The existing kitchen had outdated oak cabinets and limited counter space, making the kitchen feel cramped and dark.',
      zh: '原有厨房配备过时的橡木橱柜，台面空间有限，使厨房显得狭窄而阴暗。',
    },
    solution: {
      en: 'We installed bright white shaker cabinets with soft-close hardware, paired with quartz countertops and a modern tile backsplash to open up the space.',
      zh: '我们安装了明亮的白色摇门橱柜配备缓冲五金件，搭配石英台面和现代瓷砖后挡板，使空间更加开阔。',
    },
    featured: true,
    badge: { en: 'New', zh: '新' },
  },
  {
    slug: 'richmond-kitchen-bathroom-remodel',
    title: {
      en: 'Richmond Kitchen and Bathroom Remodel',
      zh: '列治文厨房和浴室改造',
    },
    description: {
      en: 'Complete kitchen and bathroom transformation with contemporary finishes.',
      zh: '采用现代风格完成厨房和浴室全面改造。',
    },
    service_type: 'kitchen',
    category: { en: 'Kitchen', zh: '厨房' },
    location_city: 'Richmond',
    budget_range: '$30,000 - $45,000',
    duration: { en: '5 weeks', zh: '5周' },
    space_type: { en: 'Condo', zh: '公寓' },
    hero_image: 'https://reno-stars.com/wp-content/uploads/2025/04/35.png',
    images: [
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/35.png', alt: { en: 'Richmond kitchen remodel', zh: '列治文厨房改造' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/75-1.png', alt: { en: 'Modern kitchen design', zh: '现代厨房设计' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/52.png', alt: { en: 'Kitchen and bathroom renovation', zh: '厨房和浴室装修' } },
    ],
    service_scope: {
      en: ['Cabinetry', 'Countertops', 'Flooring', 'Plumbing', 'Tile Work'],
      zh: ['橱柜', '台面', '地板', '水管', '瓷砖'],
    },
    challenge: {
      en: 'A dated condo with separate outdated kitchen and bathroom needing a cohesive modern update within a tight timeline.',
      zh: '一套过时的公寓，厨房和浴室都需要在紧迫的时间内进行统一的现代化更新。',
    },
    solution: {
      en: 'We coordinated kitchen and bathroom trades simultaneously, using a unified modern palette with quartz surfaces and contemporary fixtures throughout.',
      zh: '我们协调厨房和浴室的施工同步进行，采用统一的现代色调搭配石英台面和时尚洁具。',
    },
  },
  {
    slug: 'surrey-home-renovation',
    title: {
      en: 'Surrey Home Renovation',
      zh: '素里住宅装修',
    },
    description: {
      en: 'Full home renovation including a stunning kitchen redesign.',
      zh: '全屋装修，包括令人惊叹的厨房重新设计。',
    },
    service_type: 'kitchen',
    category: { en: 'Kitchen', zh: '厨房' },
    location_city: 'Surrey',
    budget_range: '$40,000 - $60,000',
    duration: { en: '6 weeks', zh: '6周' },
    space_type: { en: 'Residential', zh: '住宅' },
    hero_image: 'https://reno-stars.com/wp-content/uploads/2025/04/15.png',
    images: [
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/15.png', alt: { en: 'Surrey home renovation', zh: '素里住宅装修' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/49.png', alt: { en: 'Living space renovation', zh: '起居空间装修' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/53.png', alt: { en: 'Home transformation', zh: '住宅改造' } },
    ],
    service_scope: {
      en: ['Kitchen Design', 'Cabinetry', 'Countertops', 'Flooring', 'Painting'],
      zh: ['厨房设计', '橱柜', '台面', '地板', '油漆'],
    },
    challenge: {
      en: 'An aging Surrey home required a complete kitchen overhaul while maintaining the structural integrity and flow of the open-concept living area.',
      zh: '一栋老旧的素里住宅需要全面翻新厨房，同时保持开放式客厅的结构完整性和动线。',
    },
    solution: {
      en: 'We redesigned the kitchen layout for better workflow, installed custom cabinetry, and chose durable yet stylish materials that complement the open-concept design.',
      zh: '我们重新设计了厨房布局以优化工作流程，安装了定制橱柜，选择了耐用又美观的材料来配合开放式设计。',
    },
  },
  {
    slug: 'white-toned-kitchen-surrey',
    title: {
      en: 'White Toned Kitchen in Surrey',
      zh: '素里白色调厨房',
    },
    description: {
      en: 'Elegant white-toned kitchen renovation with clean lines and modern appliances.',
      zh: '优雅的白色调厨房装修，线条简洁，配备现代家电。',
    },
    service_type: 'kitchen',
    category: { en: 'Kitchen', zh: '厨房' },
    location_city: 'Surrey',
    budget_range: '$20,000 - $35,000',
    duration: { en: '4 weeks', zh: '4周' },
    space_type: { en: 'Residential', zh: '住宅' },
    hero_image: 'https://reno-stars.com/wp-content/uploads/2025/04/340.png',
    images: [
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/340.png', alt: { en: 'White kitchen Surrey', zh: '素里白色厨房' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/02/微信图片_20250228155837.jpg', alt: { en: 'Kitchen details', zh: '厨房细节' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/15.png', alt: { en: 'Modern kitchen', zh: '现代厨房' } },
    ],
    service_scope: {
      en: ['Cabinetry', 'Countertops', 'Appliance Installation', 'Lighting'],
      zh: ['橱柜', '台面', '家电安装', '灯光'],
    },
    challenge: {
      en: 'The homeowner wanted a bright, airy kitchen but the existing layout had poor lighting and dark-toned finishes.',
      zh: '业主想要一个明亮通风的厨房，但现有布局采光不足且装饰色调偏暗。',
    },
    solution: {
      en: 'We implemented an all-white palette with under-cabinet LED lighting, reflective quartz countertops, and strategically placed pot lights to maximize brightness.',
      zh: '我们采用全白色调搭配橱柜下方LED灯带、反光石英台面和合理布置的筒灯，最大限度提升亮度。',
    },
  },
  {
    slug: 'kitchen-renovation-delta',
    title: {
      en: 'Kitchen Renovation in Delta BC',
      zh: '三角洲厨房装修',
    },
    description: {
      en: 'Modern kitchen renovation featuring custom cabinetry and quartz countertops.',
      zh: '现代厨房装修，配备定制橱柜和石英台面。',
    },
    service_type: 'kitchen',
    category: { en: 'Kitchen', zh: '厨房' },
    location_city: 'Delta',
    budget_range: '$25,000 - $40,000',
    duration: { en: '4 weeks', zh: '4周' },
    space_type: { en: 'Residential', zh: '住宅' },
    hero_image: 'https://reno-stars.com/wp-content/uploads/2025/04/73.png',
    images: [
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/73.png', alt: { en: 'Delta kitchen renovation', zh: '三角洲厨房装修' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/75-1.png', alt: { en: 'Kitchen countertops', zh: '厨房台面' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/340.png', alt: { en: 'Custom cabinetry', zh: '定制橱柜' } },
    ],
    service_scope: {
      en: ['Cabinetry', 'Countertops', 'Backsplash', 'Plumbing'],
      zh: ['橱柜', '台面', '后挡板', '水管'],
    },
    challenge: {
      en: 'Limited counter space and outdated appliances made the kitchen inefficient for a family of five.',
      zh: '台面空间有限且家电过时，对于五口之家来说厨房效率低下。',
    },
    solution: {
      en: 'We reconfigured the layout to include an island with extra storage, installed quartz countertops, and added a modern tile backsplash for a functional family kitchen.',
      zh: '我们重新规划布局，增加了带额外储物空间的岛台，安装了石英台面和现代瓷砖后挡板，打造实用的家庭厨房。',
    },
  },
  {
    slug: 'modern-kitchen-richmond',
    title: {
      en: 'Modern Kitchen Renovation in Richmond',
      zh: '列治文现代厨房装修',
    },
    description: {
      en: 'Comprehensive modern kitchen renovation with island and premium fixtures.',
      zh: '全面的现代厨房装修，配备岛台和高端设备。',
    },
    service_type: 'kitchen',
    category: { en: 'Kitchen', zh: '厨房' },
    location_city: 'Richmond',
    budget_range: '$35,000 - $50,000',
    duration: { en: '5 weeks', zh: '5周' },
    space_type: { en: 'Residential', zh: '住宅' },
    hero_image: 'https://reno-stars.com/wp-content/uploads/2025/04/75-1.png',
    images: [
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/75-1.png', alt: { en: 'Richmond modern kitchen', zh: '列治文现代厨房' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/35.png', alt: { en: 'Kitchen island', zh: '厨房岛台' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/73.png', alt: { en: 'Premium fixtures', zh: '高端设备' } },
    ],
    service_scope: {
      en: ['Kitchen Design', 'Cabinetry', 'Countertops', 'Island', 'Fixtures'],
      zh: ['厨房设计', '橱柜', '台面', '岛台', '洁具'],
    },
    challenge: {
      en: 'The homeowners wanted a chef-grade kitchen with an island but the existing space had load-bearing walls limiting the layout options.',
      zh: '业主想要一个带岛台的专业级厨房，但现有空间有承重墙限制了布局选择。',
    },
    solution: {
      en: 'We worked with a structural engineer to safely open up the space, then installed a large waterfall-edge island, premium cabinetry, and professional-grade fixtures.',
      zh: '我们与结构工程师合作安全地打通空间，然后安装了大型瀑布边岛台、高端橱柜和专业级洁具。',
    },
  },
  {
    slug: 'bathroom-renovation-delta',
    title: {
      en: 'Bathroom Renovation in Delta',
      zh: '三角洲浴室装修',
    },
    description: {
      en: 'Complete bathroom renovation with luxury tile work and modern vanity.',
      zh: '完整的浴室装修，配备豪华瓷砖和现代洗手台。',
    },
    service_type: 'bathroom',
    category: { en: 'Bathroom', zh: '卫浴' },
    location_city: 'Delta',
    budget_range: '$12,000 - $20,000',
    duration: { en: '2 weeks', zh: '2周' },
    space_type: { en: 'Residential', zh: '住宅' },
    hero_image: 'https://reno-stars.com/wp-content/uploads/2025/04/71.png',
    images: [
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/71.png', alt: { en: 'Delta bathroom renovation', zh: '三角洲浴室装修' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/16.png', alt: { en: 'Modern vanity', zh: '现代洗手台' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/主卫.jpg', alt: { en: 'Tile work', zh: '瓷砖工艺' } },
    ],
    service_scope: {
      en: ['Tile Work', 'Vanity', 'Plumbing', 'Lighting'],
      zh: ['瓷砖', '洗手台', '水管', '灯光'],
    },
    challenge: {
      en: 'A small bathroom with water damage and an inefficient layout that wasted valuable floor space.',
      zh: '小浴室存在水损问题，布局不合理浪费了宝贵的地面空间。',
    },
    solution: {
      en: 'We repaired the water damage, reconfigured the layout for a walk-in shower, and installed large-format tiles and a floating vanity to create a spacious feel.',
      zh: '我们修复了水损，重新规划布局改为步入式淋浴，安装了大尺寸瓷砖和悬浮洗手台，营造宽敞感。',
    },
  },
  {
    slug: 'richmond-bathroom-remodel',
    title: {
      en: 'Richmond Bathroom Remodel',
      zh: '列治文浴室改造',
    },
    description: {
      en: 'Spa-inspired bathroom remodel with freestanding tub and walk-in shower.',
      zh: '水疗风格浴室改造，配备独立浴缸和步入式淋浴。',
    },
    service_type: 'bathroom',
    category: { en: 'Bathroom', zh: '卫浴' },
    location_city: 'Richmond',
    budget_range: '$18,000 - $28,000',
    duration: { en: '3 weeks', zh: '3周' },
    space_type: { en: 'Residential', zh: '住宅' },
    hero_image: 'https://reno-stars.com/wp-content/uploads/2025/04/主卫.jpg',
    images: [
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/主卫.jpg', alt: { en: 'Richmond bathroom remodel', zh: '列治文浴室改造' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/71.png', alt: { en: 'Freestanding tub', zh: '独立浴缸' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/16.png', alt: { en: 'Walk-in shower', zh: '步入式淋浴' } },
    ],
    service_scope: {
      en: ['Tile Work', 'Plumbing', 'Freestanding Tub', 'Walk-in Shower', 'Vanity'],
      zh: ['瓷砖', '水管', '独立浴缸', '步入式淋浴', '洗手台'],
    },
    challenge: {
      en: 'The master bathroom felt cramped and outdated, with a bulky built-in tub taking up too much space.',
      zh: '主卫感觉局促过时，笨重的内嵌浴缸占用了太多空间。',
    },
    solution: {
      en: 'We replaced the built-in tub with an elegant freestanding soaker tub, added a frameless glass walk-in shower, and used spa-inspired natural stone tiles.',
      zh: '我们用优雅的独立泡澡浴缸替换了内嵌浴缸，增加了无框玻璃步入式淋浴，采用水疗风格天然石材瓷砖。',
    },
  },
  {
    slug: 'bathroom-vanity-west-vancouver',
    title: {
      en: 'Bathroom Vanity Renovation in West Vancouver',
      zh: '西温浴室洗手台装修',
    },
    description: {
      en: 'Custom vanity installation with premium fixtures in a luxury home.',
      zh: '豪宅中的定制洗手台安装，配备高端洁具。',
    },
    service_type: 'bathroom',
    category: { en: 'Bathroom', zh: '卫浴' },
    location_city: 'West Vancouver',
    budget_range: '$10,000 - $18,000',
    duration: { en: '2 weeks', zh: '2周' },
    space_type: { en: 'Luxury Residential', zh: '豪华住宅' },
    hero_image: 'https://reno-stars.com/wp-content/uploads/2025/04/16.png',
    images: [
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/16.png', alt: { en: 'West Vancouver bathroom vanity', zh: '西温浴室洗手台' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/主卫.jpg', alt: { en: 'Custom vanity', zh: '定制洗手台' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/71.png', alt: { en: 'Premium fixtures', zh: '高端洁具' } },
    ],
    service_scope: {
      en: ['Custom Vanity', 'Fixtures', 'Mirror', 'Lighting'],
      zh: ['定制洗手台', '洁具', '镜子', '灯光'],
    },
    challenge: {
      en: 'The luxury home required a custom vanity that matched the high-end aesthetic while providing ample storage for a busy family.',
      zh: '豪宅需要一个与高端美学相匹配的定制洗手台，同时为繁忙的家庭提供充足的储物空间。',
    },
    solution: {
      en: 'We designed and built a custom double-sink vanity with solid wood construction, paired with designer fixtures and a backlit mirror for a sophisticated look.',
      zh: '我们设计并制作了实木双盆定制洗手台，搭配设计师洁具和背光镜，打造精致外观。',
    },
  },
  {
    slug: 'stunning-home-renovation-langley',
    title: {
      en: 'Stunning Home Renovation in Langley',
      zh: '兰里全屋翻新',
    },
    description: {
      en: 'Full-scale home transformation including kitchen, bathrooms, and living spaces.',
      zh: '全方位家居改造，包括厨房、浴室和起居空间。',
    },
    service_type: 'whole-house',
    category: { en: 'Whole House', zh: '全屋' },
    location_city: 'Langley',
    budget_range: '$80,000 - $120,000',
    duration: { en: '10 weeks', zh: '10周' },
    space_type: { en: 'Residential', zh: '住宅' },
    hero_image: 'https://reno-stars.com/wp-content/uploads/2025/04/49.png',
    images: [
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/49.png', alt: { en: 'Langley home renovation', zh: '兰里住宅装修' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/53.png', alt: { en: 'Living space transformation', zh: '起居空间改造' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/52.png', alt: { en: 'Kitchen and bathroom', zh: '厨房和浴室' } },
    ],
    service_scope: {
      en: ['Kitchen', 'Bathrooms', 'Flooring', 'Painting', 'Lighting', 'Living Spaces'],
      zh: ['厨房', '浴室', '地板', '油漆', '灯光', '起居空间'],
    },
    challenge: {
      en: 'A 30-year-old home with outdated finishes throughout, requiring a complete modernization while the family continued to live on-site.',
      zh: '一栋30年老屋，全屋装修过时，需要在家庭继续居住的情况下进行全面现代化改造。',
    },
    solution: {
      en: 'We phased the renovation room by room, starting with the kitchen and bathrooms, then moving to living areas — minimizing disruption while delivering a cohesive modern transformation.',
      zh: '我们分阶段逐房间施工，从厨房和浴室开始，再到起居空间——最大限度减少干扰，同时实现统一的现代化改造。',
    },
    featured: true,
  },
  {
    slug: 'surrey-home-before-after',
    title: {
      en: 'Surrey Home Before and After',
      zh: '素里住宅前后对比',
    },
    description: {
      en: 'Dramatic whole house renovation showcasing the complete transformation.',
      zh: '震撼的全屋装修，展示完整的蜕变过程。',
    },
    service_type: 'whole-house',
    category: { en: 'Whole House', zh: '全屋' },
    location_city: 'Surrey',
    budget_range: '$60,000 - $90,000',
    duration: { en: '8 weeks', zh: '8周' },
    space_type: { en: 'Residential', zh: '住宅' },
    hero_image: 'https://reno-stars.com/wp-content/uploads/2025/04/53.png',
    images: [
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/53.png', alt: { en: 'Surrey home before and after', zh: '素里住宅前后对比' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/49.png', alt: { en: 'Home transformation', zh: '住宅改造' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/15.png', alt: { en: 'Renovation results', zh: '装修成果' } },
    ],
    service_scope: {
      en: ['Kitchen', 'Bathrooms', 'Flooring', 'Painting', 'Electrical'],
      zh: ['厨房', '浴室', '地板', '油漆', '电气'],
    },
    challenge: {
      en: 'A neglected property with severely dated interiors, requiring both cosmetic and structural updates to bring it up to modern standards.',
      zh: '一处被忽视的房产，室内严重过时，需要外观和结构两方面的更新才能达到现代标准。',
    },
    solution: {
      en: 'We addressed structural issues first, then completely refreshed every room with new flooring, modern fixtures, fresh paint, and updated electrical throughout.',
      zh: '我们先处理结构问题，然后对每个房间进行全面翻新——新地板、现代洁具、新鲜油漆和全屋电气升级。',
    },
  },
  {
    slug: 'commercial-renovation-skin-lab-granville',
    title: {
      en: 'Commercial Renovation - Skin Lab Granville',
      zh: '商业装修 - Skin Lab Granville',
    },
    description: {
      en: 'Professional commercial space renovation for a skincare clinic on Granville.',
      zh: 'Granville街护肤诊所的专业商业空间装修。',
    },
    service_type: 'commercial',
    category: { en: 'Commercial', zh: '商业' },
    location_city: 'Vancouver',
    budget_range: '$50,000 - $75,000',
    duration: { en: '6 weeks', zh: '6周' },
    space_type: { en: 'Commercial', zh: '商业' },
    hero_image: 'https://reno-stars.com/wp-content/uploads/2025/04/84.jpg',
    images: [
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/84.jpg', alt: { en: 'Skin Lab Granville commercial renovation', zh: 'Skin Lab Granville商业装修' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/49.png', alt: { en: 'Commercial interior', zh: '商业内部' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/52.png', alt: { en: 'Clinic design', zh: '诊所设计' } },
    ],
    service_scope: {
      en: ['Interior Build-out', 'Plumbing', 'Electrical', 'Custom Millwork', 'Painting'],
      zh: ['室内装修', '水管', '电气', '定制木工', '油漆'],
    },
    challenge: {
      en: 'Converting a raw commercial shell into a premium skincare clinic that meets health code requirements while projecting a luxurious brand image.',
      zh: '将一个毛坯商业空间改造成符合卫生规范要求的高端护肤诊所，同时展现奢华品牌形象。',
    },
    solution: {
      en: 'We designed a clean, clinical yet luxurious interior with custom treatment rooms, specialized plumbing for treatment stations, and a welcoming reception area that reflects the brand.',
      zh: '我们设计了简洁临床又不失奢华的室内空间，包含定制治疗室、专业水管设施和体现品牌特色的温馨接待区。',
    },
    featured: true,
  },
  {
    slug: 'richmond-kitchen-remodel-bath',
    title: {
      en: 'Richmond Kitchen Remodel & Bath',
      zh: '列治文厨房和浴室改造',
    },
    description: {
      en: 'Combined kitchen remodel and bathroom renovation for a complete home upgrade.',
      zh: '厨房和浴室联合改造，实现全屋升级。',
    },
    service_type: 'whole-house',
    category: { en: 'Whole House', zh: '全屋' },
    location_city: 'Richmond',
    budget_range: '$35,000 - $55,000',
    duration: { en: '6 weeks', zh: '6周' },
    space_type: { en: 'Residential', zh: '住宅' },
    hero_image: 'https://reno-stars.com/wp-content/uploads/2025/04/52.png',
    images: [
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/52.png', alt: { en: 'Richmond kitchen and bath', zh: '列治文厨房和浴室' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/35.png', alt: { en: 'Kitchen remodel', zh: '厨房改造' } },
      { src: 'https://reno-stars.com/wp-content/uploads/2025/04/主卫.jpg', alt: { en: 'Bathroom renovation', zh: '浴室装修' } },
    ],
    service_scope: {
      en: ['Kitchen Remodel', 'Bathroom Renovation', 'Flooring', 'Countertops'],
      zh: ['厨房改造', '浴室装修', '地板', '台面'],
    },
    challenge: {
      en: 'The homeowner needed both the kitchen and bathroom updated on a moderate budget without compromising on quality.',
      zh: '业主需要在有限预算内同时更新厨房和浴室，且不降低质量标准。',
    },
    solution: {
      en: 'We sourced high-quality materials at competitive prices and coordinated both renovations to run in parallel, delivering premium results within the budget.',
      zh: '我们以有竞争力的价格采购优质材料，并协调两项装修同步进行，在预算内交付高品质成果。',
    },
  },
];

export function getProjects(): Project[] {
  return projects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectsByServiceType(serviceType: ServiceType): Project[] {
  return projects.filter((p) => p.service_type === serviceType);
}

export function getProjectsByLocation(city: string): Project[] {
  return projects.filter((p) => p.location_city.toLowerCase() === city.toLowerCase());
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getLocalizedProject(project: Project, locale: Locale) {
  return {
    slug: project.slug,
    title: project.title[locale],
    description: project.description[locale],
    category: project.category[locale],
    service_type: project.service_type,
    location_city: project.location_city,
    budget_range: project.budget_range,
    duration: project.duration?.[locale],
    space_type: project.space_type?.[locale],
    hero_image: project.hero_image,
    images: project.images.map((img) => ({
      src: img.src,
      alt: img.alt[locale],
      is_before: img.is_before,
    })),
    service_scope: project.service_scope?.[locale],
    challenge: project.challenge?.[locale],
    solution: project.solution?.[locale],
    featured: project.featured,
    badge: project.badge?.[locale],
  };
}

export function getAllProjectsLocalized(locale: Locale) {
  return projects.map((p) => getLocalizedProject(p, locale));
}

export function getProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}

// Get unique categories for filtering
export function getCategories(locale: Locale): string[] {
  const categories = new Set(projects.map((p) => p.category[locale]));
  return ['All', ...Array.from(categories)];
}

export function getCategoriesLocalized(): { en: string; zh: string }[] {
  return [
    { en: 'All', zh: '全部' },
    { en: 'Kitchen', zh: '厨房' },
    { en: 'Bathroom', zh: '卫浴' },
    { en: 'Whole House', zh: '全屋' },
    { en: 'Commercial', zh: '商业' },
  ];
}

// Get unique locations for filtering
export function getProjectLocations(): string[] {
  const locations = new Set(projects.map((p) => p.location_city));
  return Array.from(locations).sort();
}
