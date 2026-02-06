/**
 * Type definitions for the Reno Stars application.
 * @module lib/types
 */

/** Supported locales for internationalization */
export type Locale = 'en' | 'zh';

/** Helper type for bilingual content */
export type Localized<T> = Record<Locale, T>;

/** Available service types for renovation projects */
export type ServiceType =
  | 'kitchen'
  | 'bathroom'
  | 'whole-house'
  | 'basement'
  | 'cabinet'
  | 'commercial';

/**
 * A project site entity that groups multiple renovation projects.
 * Represents a single property with various renovated areas.
 * Projects MUST belong to a site (mandatory container).
 */
export interface Site {
  /** Unique identifier (UUID) */
  id: string;
  /** URL-friendly identifier */
  slug: string;
  /** Site title in both languages */
  title: Localized<string>;
  /** Site description */
  description: Localized<string>;
  /** City where site is located */
  location_city?: string;
  /** Primary display image URL */
  hero_image?: string;
  /** Optional badge text (e.g., "New", "Featured") */
  badge?: Localized<string>;
  /** Whether to show this site as a project in listings */
  show_as_project: boolean;
  /** Whether to feature on homepage */
  featured: boolean;
  /** Publication date */
  published_at?: Date;
}

/**
 * A site with all its associated projects and aggregated data.
 */
export interface SiteWithProjects extends Site {
  /** Projects belonging to this site */
  projects: Project[];
  /** Aggregated data from all projects */
  aggregated: SiteAggregated;
}

/**
 * Aggregated data for a site combining all its projects.
 */
export interface SiteAggregated {
  /** Combined budget from all projects */
  totalBudget?: string;
  /** Combined timeline from all projects */
  totalDuration?: Localized<string>;
  /** Merged unique service scopes from all projects */
  allServiceScopes: Localized<string[]>;
  /** All images from all projects with project attribution */
  allImages: SiteImage[];
}

/**
 * Image with attribution to project (for site aggregation)
 */
export interface SiteImage {
  src: string;
  alt: Localized<string>;
  is_before?: boolean;
  projectSlug: string;
  projectTitle: Localized<string>;
}

/**
 * A renovation project in the portfolio.
 * Contains bilingual content and project details.
 */
export interface Project {
  /** Unique identifier (UUID) */
  id?: string;
  /** URL-friendly identifier */
  slug: string;
  /** Project title in both languages */
  title: Localized<string>;
  /** Short description */
  description: Localized<string>;
  /** Extended project narrative */
  project_story?: Localized<string>;
  /** Brief summary for listings */
  excerpt?: Localized<string>;
  /** Type of renovation service */
  service_type: ServiceType;
  /** Display category name */
  category: Localized<string>;
  /** City where project is located */
  location_city: string;
  /** Budget range (e.g., "$15,000 - $25,000") */
  budget_range?: string;
  /** Project timeline */
  duration?: Localized<string>;
  /** Type of space (Residential, Commercial, etc.) */
  space_type?: Localized<string>;
  /** Project images with before/after indicators */
  images: { src: string; alt: Localized<string>; is_before?: boolean }[];
  /** Primary display image URL */
  hero_image: string;
  /** List of work scope items */
  service_scope?: Localized<string[]>;
  /** Problem statement */
  challenge?: Localized<string>;
  /** How the challenge was addressed */
  solution?: Localized<string>;
  /** Publication date */
  published_at?: Date;
  /** Whether to feature on homepage */
  featured?: boolean;
  /** Optional badge text (e.g., "New", "Featured") */
  badge?: Localized<string>;
  /** Site ID - project belongs to a site (required for DB projects) */
  site_id?: string;
  /** Display order within a site */
  display_order_in_site?: number;
}

/**
 * A renovation service offering.
 */
export interface Service {
  /** Service type identifier */
  slug: ServiceType;
  /** Service name */
  title: Localized<string>;
  /** Short service description */
  description: Localized<string>;
  /** Detailed service explanation */
  long_description?: Localized<string>;
  /** Lucide icon name */
  icon?: string;
  /** Service showcase image URL */
  image?: string;
}

/**
 * A geographic service area.
 */
export interface ServiceArea {
  /** URL-friendly area identifier */
  slug: string;
  /** Area name */
  name: Localized<string>;
  /** Area description */
  description?: Localized<string>;
}

/**
 * A single Google review from the Places API.
 */
export interface GoogleReview {
  authorName: string;
  authorUri: string;
  authorPhotoUri: string;
  rating: number;
  text: string;
  languageCode: string;
  publishTime: string;
  relativePublishTime: string;
}

/**
 * Aggregate Google Place rating data with reviews.
 */
export interface GooglePlaceRating {
  rating: number;
  userRatingCount: number;
  reviews: GoogleReview[];
}

/**
 * A blog post entry.
 */
export interface BlogPost {
  /** URL-friendly identifier */
  slug: string;
  /** Post title */
  title: Localized<string>;
  /** Preview text */
  excerpt?: Localized<string>;
  /** Full post content (HTML/Markdown) */
  content?: Localized<string>;
  /** Featured image URL for OG/social sharing */
  featured_image?: string;
  /** Publication date */
  published_at?: Date;
  /** External URL (if linking elsewhere) */
  url?: string;
}

/**
 * A gallery image item.
 */
export interface GalleryItem {
  /** Image URL */
  image: string;
  /** Image title */
  title: Localized<string>;
  /** Gallery category (Kitchen, Bathroom, etc.) */
  category: string;
}

/**
 * Company information and metadata.
 */
export interface Company {
  /** Company name */
  name: string;
  /** Company tagline */
  tagline: string;
  /** Contact phone number */
  phone: string;
  /** Contact email */
  email: string;
  /** Physical address */
  address: string;
  /** Logo image URL */
  logo: string;
  /** Quote request form URL */
  quoteUrl: string;
  /** Years of experience */
  yearsExperience: string;
  /** Year company was founded */
  foundingYear: number;
  /** Number of team members */
  teamSize: number;
  /** Warranty period */
  warranty: string;
  /** Liability insurance coverage */
  liabilityCoverage: string;
  /** Customer rating */
  rating: string;
  /** Number of customer reviews */
  reviewCount: number;
  /** Rating platform source */
  ratingSource: string;
  /** Geographic coordinates for structured data */
  geo: { latitude: number; longitude: number };
}

/**
 * Showroom location and scheduling info.
 */
export interface Showroom {
  /** Showroom address */
  address: string;
  /** Appointment booking text */
  appointmentText: Localized<string>;
  /** Showroom phone */
  phone: string;
  /** Showroom email */
  email: string;
}

/**
 * About page content sections.
 */
export interface AboutSections {
  /** Company history/journey */
  ourJourney: Localized<string>;
  /** Services overview */
  whatWeOffer: Localized<string>;
  /** Company values */
  ourValues: Localized<string>;
  /** Differentiators */
  whyChooseUs: Localized<string>;
  /** Call to action */
  letsBuildTogether: Localized<string>;
}

// Localized (single-locale) return types for data accessor functions

/** A project with content resolved to a single locale */
export interface LocalizedProject {
  id?: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  service_type: ServiceType;
  location_city: string;
  budget_range?: string;
  duration?: string;
  space_type?: string;
  hero_image: string;
  images: { src: string; alt: string; is_before?: boolean }[];
  service_scope?: string[];
  challenge?: string;
  solution?: string;
  featured?: boolean;
  badge?: string;
  site_id?: string;
  display_order_in_site?: number;
}

/** A site with content resolved to a single locale */
export interface LocalizedSite {
  id: string;
  slug: string;
  title: string;
  description: string;
  location_city?: string;
  hero_image?: string;
  badge?: string;
  show_as_project: boolean;
  featured: boolean;
}

/** A localized image with project attribution (for site views) */
export interface LocalizedSiteImage {
  src: string;
  alt: string;
  is_before?: boolean;
  projectSlug: string;
  projectTitle: string;
}

/** Localized aggregated data for a site */
export interface LocalizedSiteAggregated {
  totalBudget?: string;
  totalDuration?: string;
  allServiceScopes: string[];
  allImages: LocalizedSiteImage[];
}

/** A localized site with projects and aggregated data */
export interface LocalizedSiteWithProjects extends LocalizedSite {
  projects: LocalizedProject[];
  aggregated: LocalizedSiteAggregated;
}

/** A service with content resolved to a single locale */
export interface LocalizedService {
  slug: string;
  title: string;
  description: string;
  long_description?: string;
  icon?: string;
  image?: string;
}

/** A service area with content resolved to a single locale */
export interface LocalizedArea {
  slug: string;
  name: string;
  description?: string;
}

/**
 * A social media profile link.
 */
export interface SocialLink {
  /** Social platform name */
  platform: 'facebook' | 'instagram' | 'youtube' | 'linkedin' | 'twitter' | 'xiaohongshu' | 'wechat' | 'whatsapp';
  /** Profile URL */
  url: string;
  /** Display label */
  label: string;
}

/**
 * A frequently asked question.
 */
export interface Faq {
  /** Unique identifier */
  id: string;
  /** Question text */
  question: Localized<string>;
  /** Answer text */
  answer: Localized<string>;
}
