import type { Locale, Localized, Showroom, GalleryItem, BlogPost } from '../types';
import { getAssetUrl } from '../storage';

// Re-export types
export type {
  Locale, Localized, Company, Showroom, AboutSections, GalleryItem, Testimonial, BlogPost, SocialLink,
  LocalizedProject, LocalizedService, LocalizedArea,
} from '../types';

// Localized return types (ones that live only in this barrel file)
export interface LocalizedTestimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  location: string;
}

export interface LocalizedGalleryItem {
  image: string;
  title: string;
  category: string;
}

export interface LocalizedBlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  published_at?: Date;
  url?: string;
}

export interface LocalizedShowroom {
  address: string;
  appointmentText: string;
  phone: string;
  email: string;
}

export interface LocalizedAboutSections {
  ourJourney: string;
  whatWeOffer: string;
  ourValues: string;
  whyChooseUs: string;
  letsBuildTogether: string;
}

// Re-export from other data files.
// Named exports only to avoid ambiguity with db/schema exports (e.g. `services`).
export { getLocalizedService, serviceTypeToCategory, categoryToServiceType } from './services';
export {
  projects, getProjects, getProjectBySlug, getLocalizedProject, getAllProjectsLocalized,
  getProjectsByServiceType, getProjectsByLocation, getFeaturedProjects, getProjectSlugs,
  getCategories, getCategoriesLocalized, CATEGORY_SLUGS, getProjectLocations,
  getProjectSpaceTypes, getProjectBudgetRanges,
} from './projects';
export { serviceAreas, getServiceAreas, getServiceAreaBySlug, getLocalizedArea, getAllAreasLocalized, getAreaNames, getAreaSlugs } from './areas';

export const video = {
  hero: getAssetUrl("https://reno-stars.com/wp-content/uploads/2024/07/Untitled-design-1.mp4") + "#t=10,77",
};

export const images = {
  hero: getAssetUrl("https://reno-stars.com/wp-content/uploads/2025/04/modern-white-kitchen-renovation.jpg"),
  bathroom: getAssetUrl("https://reno-stars.com/wp-content/uploads/2025/04/luxury-modern-bathroom-renovation.jpg"),
  living: getAssetUrl("https://reno-stars.com/wp-content/uploads/2025/04/modern-open-concept-living-and-dining-room.jpg"),
  dining: getAssetUrl("https://reno-stars.com/wp-content/uploads/2025/04/bright-and-cozy-dining-living-room.jpg"),
  commercial: getAssetUrl("https://reno-stars.com/wp-content/uploads/2025/04/from-1-skin-lab-granville-commercial-renovation.jpg"),
  wholeHouse: getAssetUrl("https://reno-stars.com/wp-content/uploads/2025/04/brightened-whole-house-renovation-living-room.jpg"),
};

// Showroom data
export const showroom: Showroom = {
  address: "21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2",
  appointmentText: {
    en: "Welcome to schedule a visit to our Renovation showroom by appointment!",
    zh: "欢迎预约参观我们的装修展厅！",
  },
  phone: "778-960-7999",
  email: "info@reno-stars.com",
};

// Gallery items
export const gallery: GalleryItem[] = [
  { image: images.hero, title: { en: "Modern Kitchen", zh: "现代厨房" }, category: "Kitchen" },
  { image: images.bathroom, title: { en: "Luxury Bathroom", zh: "豪华浴室" }, category: "Bathroom" },
  { image: images.living, title: { en: "Open Concept Living", zh: "开放式客厅" }, category: "Whole House" },
  { image: images.dining, title: { en: "Cozy Dining Room", zh: "温馨餐厅" }, category: "Whole House" },
  { image: images.commercial, title: { en: "Commercial Space", zh: "商业空间" }, category: "Commercial" },
  { image: images.wholeHouse, title: { en: "Bright Living Room", zh: "明亮客厅" }, category: "Whole House" },
];

// Blog posts
export const blogPosts: BlogPost[] = [
  {
    slug: 'top-10-kitchen-renovation-trends-vancouver-2025',
    title: {
      en: "Top 10 Kitchen Renovation Trends in Vancouver for 2025",
      zh: "2025年温哥华十大厨房装修趋势",
    },
    excerpt: {
      en: "Discover the latest kitchen design trends that Vancouver homeowners are embracing this year.",
      zh: "发现今年温哥华房主正在采用的最新厨房设计趋势。",
    },
  },
  {
    slug: 'how-to-plan-basement-remodel-complete-guide',
    title: {
      en: "How to Plan Your Basement Remodel: A Complete Guide",
      zh: "如何规划地下室改造：完整指南",
    },
    excerpt: {
      en: "Everything you need to know about planning a successful basement renovation project.",
      zh: "关于规划成功地下室装修项目所需了解的一切。",
    },
  },
  {
    slug: 'bathroom-renovation-costs-vancouver-what-to-expect',
    title: {
      en: "Bathroom Renovation Costs in Vancouver: What to Expect",
      zh: "温哥华浴室装修费用：预期成本",
    },
    excerpt: {
      en: "A comprehensive breakdown of bathroom renovation costs in the Vancouver area.",
      zh: "温哥华地区浴室装修费用的全面分析。",
    },
  },
  {
    slug: 'before-after-stunning-whole-house-renovations',
    title: {
      en: "Before & After: Stunning Whole House Renovations",
      zh: "前后对比：令人惊叹的全屋装修",
    },
    excerpt: {
      en: "See the dramatic transformations we've achieved for homeowners across the Lower Mainland.",
      zh: "查看我们为低陆平原地区房主实现的令人惊叹的改造。",
    },
  },
  {
    slug: 'choosing-right-contractor-home-renovation',
    title: {
      en: "Choosing the Right Contractor for Your Home Renovation",
      zh: "如何为您的家居装修选择合适的承包商",
    },
    excerpt: {
      en: "Tips and advice for selecting the best renovation contractor for your project.",
      zh: "为您的项目选择最佳装修承包商的技巧和建议。",
    },
  },
];

// Trust badges
export const trustBadges: Localized<string[]> = {
  en: [
    "Ranking 3rd in Best of Vancouver",
    "3 Best Basement Remodeling Companies",
    "10/10 HomeStars",
  ],
  zh: [
    "温哥华最佳排名第三",
    "三大最佳地下室改造公司",
    "HomeStars 10/10 评分",
  ],
};

// Helper functions for localized data
export function getLocalizedGalleryItem(item: GalleryItem, locale: Locale): LocalizedGalleryItem {
  return {
    image: item.image,
    title: item.title[locale],
    category: item.category,
  };
}

export function getAllGalleryItemsLocalized(locale: Locale): LocalizedGalleryItem[] {
  return gallery.map((g) => getLocalizedGalleryItem(g, locale));
}

export function getLocalizedBlogPost(post: BlogPost, locale: Locale): LocalizedBlogPost {
  return {
    slug: post.slug,
    title: post.title[locale],
    excerpt: post.excerpt?.[locale],
    content: post.content?.[locale],
    published_at: post.published_at,
    url: post.url,
  };
}

export function getAllBlogPostsLocalized(locale: Locale): LocalizedBlogPost[] {
  return blogPosts.map((p) => getLocalizedBlogPost(p, locale));
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getTrustBadges(locale: Locale): string[] {
  return trustBadges[locale];
}

export function getShowroomLocalized(locale: Locale): LocalizedShowroom {
  return {
    address: showroom.address,
    appointmentText: showroom.appointmentText[locale],
    phone: showroom.phone,
    email: showroom.email,
  };
}
