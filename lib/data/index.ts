import type { Locale, BlogPost } from '../types';
import { getAssetUrl } from '../storage';
import { pickLocale, pickLocaleOptional } from '../utils';

// Re-export types
export type {
  Locale, Localized, Company, DesignItem, GoogleReview, GooglePlaceRating, BlogPost, SocialLink,
  LocalizedProject, LocalizedService, LocalizedArea,
} from '../types';

export interface LocalizedDesignItem {
  image: string;
  title: string;
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


// Re-export from other data files.
// Named exports only to avoid ambiguity with db/schema exports (e.g. `services`).
export { getLocalizedService, WHOLE_HOUSE_CATEGORY } from './services';
export {
  projects, getProjects, getProjectBySlug, getLocalizedProject, getAllProjectsLocalized,
  getProjectsByServiceType, getProjectsByLocation, getFeaturedProjects, getProjectSlugs,
  getCategories, getProjectLocations,
  getProjectSpaceTypes, getProjectBudgetRanges,
} from './projects';
export { getLocalizedArea } from './areas';

export const video = {
  hero: getAssetUrl("https://reno-stars.com/wp-content/uploads/2024/07/Untitled-design-1.mp4") + "#t=10,77",
};

/** WorkSafe BC logo for trust badges (hero, stats, footer) */
export const WORKSAFE_BC_LOGO = '/worksafe-bc-logo.jpg';

/** Free Google Maps embed pinned to the Reno Stars business listing (no API key needed). */
export const MAP_EMBED_URL =
  'https://www.google.com/maps?q=Reno+Stars+Local+Renovation+Company,+21300+Gordon+Way+unit+188,+Richmond,+BC&output=embed';

export const images = {
  // Hero source moved to R2 with pre-processed WebP variants (320/640/828/1080/1200w)
  // so HeroSection can serve responsive images and avoid the mobile LCP penalty.
  // Mobile now fetches a 21KB 640w variant instead of the 173KB legacy WordPress JPG.
  hero: getAssetUrl("https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/hero-modern-white-kitchen-renovation.jpg"),
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
      title: pickLocale(rp.title, locale),
      hero_image: rp.hero_image,
      external_products: rp.external_products?.map((ep) => ({
        url: ep.url,
        image_url: ep.image_url,
        label: pickLocale(ep.label, locale),
      })),
    };
  }

  return {
    slug: post.slug,
    title: pickLocale(post.title, locale),
    excerpt: pickLocaleOptional(post.excerpt, locale),
    content: pickLocaleOptional(post.content, locale),
    published_at: post.published_at,
    url: post.url,
    related_project: localizedRelatedProject,
  };
}
