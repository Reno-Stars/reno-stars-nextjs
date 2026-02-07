import type { Locale, BlogPost } from '../types';
import { getAssetUrl } from '../storage';

// Re-export types
export type {
  Locale, Localized, Company, Showroom, AboutSections, GalleryItem, GoogleReview, GooglePlaceRating, BlogPost, SocialLink,
  LocalizedProject, LocalizedService, LocalizedArea,
} from '../types';

export interface LocalizedGalleryItem {
  image: string;
  title: string;
  category: string;
}

/** Localized related project info for blog posts */
export interface LocalizedBlogRelatedProject {
  slug: string;
  title: string;
  hero_image?: string;
  external_products?: { url: string; image_url?: string; label: string }[];
}

export interface LocalizedBlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  published_at?: Date;
  url?: string;
  related_project?: LocalizedBlogRelatedProject;
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
export { getLocalizedArea } from './areas';

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

// Helper function for localized blog post (takes data as input, no static dependency)
export function getLocalizedBlogPost(post: BlogPost, locale: Locale): LocalizedBlogPost {
  let localizedRelatedProject: LocalizedBlogRelatedProject | undefined;

  if (post.related_project) {
    const rp = post.related_project;
    localizedRelatedProject = {
      slug: rp.slug,
      title: rp.title[locale],
      hero_image: rp.hero_image,
      external_products: rp.external_products?.map((ep) => ({
        url: ep.url,
        image_url: ep.image_url,
        label: ep.label[locale],
      })),
    };
  }

  return {
    slug: post.slug,
    title: post.title[locale],
    excerpt: post.excerpt?.[locale],
    content: post.content?.[locale],
    published_at: post.published_at,
    url: post.url,
    related_project: localizedRelatedProject,
  };
}
