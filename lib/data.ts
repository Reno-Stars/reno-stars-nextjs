export interface Company {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  logo: string;
  quoteUrl: string;
  experience: string;
  yearsExperience: string;
  teamSize: number;
  warranty: string;
  liabilityCoverage: string;
  rating: string;
  ratingSource: string;
  stats: { yearsExperience: string };
}

export interface Service {
  title: string;
  description: string;
}

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'youtube';
  url: string;
  label: string;
}

export interface GalleryItem {
  image: string;
  title: string;
  category: string;
}

export interface Testimonial {
  name: string;
  text: string;
  rating: number;
  location: string;
}

export interface BlogPost {
  title: string;
  url: string;
}

export interface Showroom {
  address: string;
  appointmentText: string;
  phone: string;
  email: string;
}

export interface AboutSections {
  ourJourney: string;
  whatWeOffer: string;
  ourValues: string;
  whyChooseUs: string;
  letsBuildTogether: string;
}

export const company: Company = {
  name: "Reno Stars",
  tagline: "Where Renovation Starts",
  phone: "778-960-7999",
  email: "info@reno-stars.com",
  address: "21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2",
  logo: "https://reno-stars.com/wp-content/uploads/2024/04/reno-stars-1-e1752023284333-1024x294.jpg",
  quoteUrl: "https://reno-stars.com/have-a-project",
  experience: "27",
  yearsExperience: "27",
  teamSize: 17,
  warranty: "3 Years",
  liabilityCoverage: "$5M",
  rating: "10/10",
  ratingSource: "HomeStars",
  stats: { yearsExperience: "27" },
};

export const services: Service[] = [
  { title: "Kitchen Renovation", description: "Complete kitchen remodeling with modern designs, custom cabinetry, and premium countertops." },
  { title: "Bathroom Renovation", description: "Transform your bathroom into a spa-like retreat with luxury fixtures and finishes." },
  { title: "Whole House Renovation", description: "Full-scale home transformations from concept to completion." },
  { title: "Basement Remodeling", description: "Convert your basement into functional living space. Ranked 3rd in Best of Vancouver." },
  { title: "Cabinet Refacing", description: "Refresh your kitchen look with professional cabinet refacing services." },
  { title: "Commercial Renovation", description: "Professional commercial space renovations for offices, retail, and restaurants." },
];

export const socialLinks: SocialLink[] = [
  { platform: 'facebook', url: 'https://facebook.com/renostars', label: 'Facebook' },
  { platform: 'instagram', url: 'https://instagram.com/renostars', label: 'Instagram' },
  { platform: 'youtube', url: 'https://youtube.com/@renostars', label: 'YouTube' },
];

export const video = {
  hero: "https://reno-stars.com/wp-content/uploads/2024/07/Untitled-design-1.mp4#t=10,77",
};

export const images = {
  hero: "https://reno-stars.com/wp-content/uploads/2025/04/modern-white-kitchen-renovation.jpg",
  bathroom: "https://reno-stars.com/wp-content/uploads/2025/04/luxury-modern-bathroom-renovation.jpg",
  living: "https://reno-stars.com/wp-content/uploads/2025/04/modern-open-concept-living-and-dining-room.jpg",
  dining: "https://reno-stars.com/wp-content/uploads/2025/04/bright-and-cozy-dining-living-room.jpg",
  commercial: "https://reno-stars.com/wp-content/uploads/2025/04/from-1-skin-lab-granville-commercial-renovation.jpg",
  wholeHouse: "https://reno-stars.com/wp-content/uploads/2025/04/brightened-whole-house-renovation-living-room.jpg",
  vancouver: "https://reno-stars.com/wp-content/uploads/2025/04/vancouver-whole-house-renovation-rental-ready-upgrade.jpg",
  richmond: "https://reno-stars.com/wp-content/uploads/2025/04/richmond-kitchen-remodel-and-bathroom-renovation.jpg",
  surrey: "https://reno-stars.com/wp-content/uploads/2025/04/surrey-home-renovation-before-and-after.jpg",
  minimalist: "https://reno-stars.com/wp-content/uploads/2025/04/minimalist-living-room-with-arched-windows-768x493.jpg",
  warmModern: "https://reno-stars.com/wp-content/uploads/2025/04/warm-modern-living-dining-room-renovation-768x493.jpg",
  minDining: "https://reno-stars.com/wp-content/uploads/2025/04/modern-minimalist-dining-room-design-768x496.jpg",
  floatingVanity: "https://reno-stars.com/wp-content/uploads/2025/04/minimalist-bathroom-with-floating-vanity-and-tub-768x493.jpg",
  cultural: "https://reno-stars.com/wp-content/uploads/2024/04/contemporary-cultural-space-natural-materials-open-design-768x494.webp",
  industrial: "https://reno-stars.com/wp-content/uploads/2024/04/nature-infused-industrial-interior-commercial-design-768x494.webp",
  doubleVanity: "https://reno-stars.com/wp-content/uploads/2024/04/modern-double-vanity-bathroom-with-freestanding-tub-768x494.webp",
  softTone: "https://reno-stars.com/wp-content/uploads/2024/04/soft-tone-commercial-interior-768x494.webp",
  kitchen1: "https://reno-stars.com/wp-content/uploads/2024/04/Kitchen-3_6-768x494.webp",
  washroom1: "https://reno-stars.com/wp-content/uploads/2024/04/Main-Washroom-3-1-768x494.webp",
  washroom2: "https://reno-stars.com/wp-content/uploads/2024/04/WASHROOM6-1-768x494.webp",
  seniorDining: "https://reno-stars.com/wp-content/uploads/2024/04/SENIOR-DINING-2-1-768x494.webp",
  retail: "https://reno-stars.com/wp-content/uploads/2024/04/RETAIL-WHOLE-SPACE-1-768x494.webp",
  kitchen2: "https://reno-stars.com/wp-content/uploads/2024/04/Kitchen-3_4-1-768x494.webp",
};

const galleryData: GalleryItem[] = [
  { image: images.hero, title: "Modern Kitchen", category: "Kitchen" },
  { image: images.bathroom, title: "Luxury Bathroom", category: "Bathroom" },
  { image: images.living, title: "Open Concept Living", category: "Whole House" },
  { image: images.dining, title: "Cozy Dining Room", category: "Whole House" },
  { image: images.commercial, title: "Commercial Space", category: "Commercial" },
  { image: images.wholeHouse, title: "Bright Living Room", category: "Whole House" },
  { image: images.vancouver, title: "Vancouver Renovation", category: "Whole House" },
  { image: images.richmond, title: "Richmond Remodel", category: "Kitchen" },
  { image: images.minimalist, title: "Minimalist Living", category: "Whole House" },
  { image: images.warmModern, title: "Warm Modern Design", category: "Whole House" },
  { image: images.floatingVanity, title: "Floating Vanity Bath", category: "Bathroom" },
  { image: images.kitchen1, title: "Designer Kitchen", category: "Kitchen" },
];

export const gallery: GalleryItem[] = galleryData;

export const testimonials: Testimonial[] = [
  { name: "Sarah M.", text: "Reno Stars transformed our outdated kitchen into a modern masterpiece. The attention to detail was incredible!", rating: 5, location: "Vancouver, BC" },
  { name: "David L.", text: "Professional team from start to finish. Our bathroom renovation exceeded all expectations.", rating: 5, location: "Richmond, BC" },
  { name: "Jennifer K.", text: "Best renovation experience we've had. On time, on budget, and the quality is outstanding.", rating: 5, location: "Burnaby, BC" },
];

export const areas: string[] = [
  "Vancouver", "Richmond", "Burnaby", "North Vancouver", "West Vancouver",
  "Surrey", "Coquitlam", "Langley", "Delta", "Tsawwassen",
  "Port Coquitlam", "Port Moody", "Maple Ridge", "White Rock",
];

export const blogPosts: BlogPost[] = [
  { title: "Top 10 Kitchen Renovation Trends in Vancouver for 2025", url: "#" },
  { title: "How to Plan Your Basement Remodel: A Complete Guide", url: "#" },
  { title: "Bathroom Renovation Costs in Vancouver: What to Expect", url: "#" },
  { title: "Before & After: Stunning Whole House Renovations", url: "#" },
  { title: "Choosing the Right Contractor for Your Home Renovation", url: "#" },
];

export const trustBadges: string[] = [
  "Ranking 3rd in Best of Vancouver",
  "3 Best Basement Remodeling Companies",
  "10/10 HomeStars",
];

export const showroom: Showroom = {
  address: "21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2",
  appointmentText: "Welcome to schedule a visit to our Renovation showroom by appointment!",
  phone: "778-960-7999",
  email: "info@reno-stars.com",
};

export const aboutSections: AboutSections = {
  ourJourney: "With over 27 years of combined experience, Reno Stars has grown from a small family operation into one of Vancouver's most trusted renovation companies, delivering quality craftsmanship to hundreds of satisfied homeowners.",
  whatWeOffer: "From kitchen and bathroom renovations to full-scale whole house remodels, we provide end-to-end renovation services including design consultation, project management, and expert construction.",
  ourValues: "Integrity, quality, and client satisfaction drive everything we do. We believe in transparent communication, fair pricing, and standing behind our work with a comprehensive warranty.",
  whyChooseUs: "Licensed, insured with $5M liability coverage, and backed by a 3-year warranty. Our 10/10 HomeStars rating and dedicated team of 17 professionals ensure your project is in expert hands.",
  letsBuildTogether: "Your dream home is just a conversation away. Whether you're planning a minor update or a major transformation, we'd love to bring your vision to life.",
};

const servicesZh: Service[] = [
  { title: "厨房装修", description: "全面的厨房改造，融合现代设计、定制橱柜和高端台面。" },
  { title: "卫浴装修", description: "将您的浴室打造成水疗般的休憩空间，配备豪华洁具和精美饰面。" },
  { title: "全屋装修", description: "从概念到完工的全方位家居改造。" },
  { title: "地下室改造", description: "将地下室改造为功能性生活空间。温哥华最佳排名第三。" },
  { title: "橱柜翻新", description: "通过专业的橱柜翻新服务焕新您的厨房面貌。" },
  { title: "商业装修", description: "专业的商业空间装修，包括办公室、零售店和餐厅。" },
];

const testimonialsZh: Testimonial[] = [
  { name: "Sarah M.", text: "Reno Stars 将我们过时的厨房改造成了现代杰作。对细节的关注令人难以置信！", rating: 5, location: "Vancouver, BC" },
  { name: "David L.", text: "从头到尾都非常专业。我们的浴室装修超出了所有期望。", rating: 5, location: "Richmond, BC" },
  { name: "Jennifer K.", text: "我们最好的装修体验。准时、不超预算，质量出众。", rating: 5, location: "Burnaby, BC" },
];

const aboutSectionsZh: AboutSections = {
  ourJourney: "凭借超过27年的综合经验，Reno Stars 从一个小型家族企业发展成为温哥华最受信赖的装修公司之一，为数百位满意的房主提供优质工艺。",
  whatWeOffer: "从厨房和浴室装修到全屋改造，我们提供端到端的装修服务，包括设计咨询、项目管理和专业施工。",
  ourValues: "诚信、品质和客户满意是我们一切工作的驱动力。我们坚持透明沟通、公平定价，并以全面的保修为我们的工作提供保障。",
  whyChooseUs: "持证经营，拥有500万美元责任保险和3年保修。我们的 HomeStars 10/10 评分和17人专业团队确保您的项目由专家负责。",
  letsBuildTogether: "您的梦想之家只需一次对话。无论您是计划小幅更新还是大规模改造，我们都乐意将您的愿景变为现实。",
};

const blogPostsZh: BlogPost[] = [
  { title: "2025年温哥华十大厨房装修趋势", url: "#" },
  { title: "如何规划地下室改造：完整指南", url: "#" },
  { title: "温哥华浴室装修费用：预期成本", url: "#" },
  { title: "前后对比：令人惊叹的全屋装修", url: "#" },
  { title: "如何为您的家居装修选择合适的承包商", url: "#" },
];

const trustBadgesZh: string[] = [
  "温哥华最佳排名第三",
  "三大最佳地下室改造公司",
  "HomeStars 10/10 评分",
];

const showroomZh: Showroom = {
  address: "21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2",
  appointmentText: "欢迎预约参观我们的装修展厅！",
  phone: "778-960-7999",
  email: "info@reno-stars.com",
};

const galleryDataZh: GalleryItem[] = [
  { image: images.hero, title: "现代厨房", category: "Kitchen" },
  { image: images.bathroom, title: "豪华浴室", category: "Bathroom" },
  { image: images.living, title: "开放式客厅", category: "Whole House" },
  { image: images.dining, title: "温馨餐厅", category: "Whole House" },
  { image: images.commercial, title: "商业空间", category: "Commercial" },
  { image: images.wholeHouse, title: "明亮客厅", category: "Whole House" },
  { image: images.vancouver, title: "温哥华装修", category: "Whole House" },
  { image: images.richmond, title: "列治文改造", category: "Kitchen" },
  { image: images.minimalist, title: "极简主义客厅", category: "Whole House" },
  { image: images.warmModern, title: "温暖现代设计", category: "Whole House" },
  { image: images.floatingVanity, title: "悬浮洗手台浴室", category: "Bathroom" },
  { image: images.kitchen1, title: "设计师厨房", category: "Kitchen" },
];

export interface LocalizedData {
  company: Company;
  services: Service[];
  images: typeof images;
  video: typeof video;
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  areas: string[];
  blogPosts: BlogPost[];
  trustBadges: string[];
  showroom: Showroom;
  aboutSections: AboutSections;
}

export function getLocalizedData(lang: string): LocalizedData {
  if (lang === 'zh') {
    return {
      company,
      services: servicesZh,
      images,
      video,
      gallery: galleryDataZh,
      testimonials: testimonialsZh,
      areas,
      blogPosts: blogPostsZh,
      trustBadges: trustBadgesZh,
      showroom: showroomZh,
      aboutSections: aboutSectionsZh,
    };
  }
  return {
    company,
    services,
    images,
    video,
    gallery,
    testimonials,
    areas,
    blogPosts,
    trustBadges,
    showroom,
    aboutSections,
  };
}
