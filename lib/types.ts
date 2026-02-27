/**
 * Type definitions for the Reno Stars application.
 * @module lib/types
 */

/** Supported locales for internationalization */
export type Locale = 'en' | 'zh';

/** Helper type for bilingual content */
export type Localized<T> = Record<Locale, T>;

// ============================================================================
// IMAGE PAIR TYPES
// ============================================================================

/** An image with bilingual alt text */
export interface ImageWithAlt {
  src: string;
  alt: Localized<string>;
}

/** A localized image with resolved alt text */
export interface LocalizedImageWithAlt {
  src: string;
  alt: string;
}

/**
 * A before/after image pair with comprehensive SEO metadata.
 * At least one of beforeImage or afterImage must be present.
 */
export interface ImagePair {
  /** Before image (optional if afterImage exists) */
  beforeImage?: ImageWithAlt;
  /** After image (optional if beforeImage exists) */
  afterImage?: ImageWithAlt;
  /** Pair title for SEO */
  title?: Localized<string>;
  /** Pair caption/description */
  caption?: Localized<string>;
  /** Photographer credit */
  photographerCredit?: string;
  /** SEO keywords (comma-separated) */
  keywords?: string;
}

/**
 * Localized image pair with resolved locale-specific content.
 */
export interface LocalizedImagePair {
  beforeImage?: LocalizedImageWithAlt;
  afterImage?: LocalizedImageWithAlt;
  title?: string;
  caption?: string;
  photographerCredit?: string;
  keywords?: string;
}

/** Available service types for renovation projects.
 * 'whole-house' is kept for DB compatibility but hidden from admin forms —
 * whole-house renovations are now represented by Sites, not individual projects. */
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
  /** Short excerpt for listings/previews */
  excerpt?: Localized<string>;
  /** SEO meta title (max 70 chars) */
  meta_title?: Localized<string>;
  /** SEO meta description (max 155 chars) */
  meta_description?: Localized<string>;
  /** Primary focus keyword for SEO */
  focus_keyword?: Localized<string>;
  /** Additional SEO keywords (comma-separated) */
  seo_keywords?: Localized<string>;
  /** Budget range for the whole site (e.g., "$80,000 - $120,000") */
  budget_range?: string;
  /** Duration for the whole site */
  duration?: Localized<string>;
  /** Internal purchase order number for sales tracking */
  po_number?: string;
  /** Whether to show this site as a project in listings */
  show_as_project: boolean;
  /** Whether to feature on homepage */
  featured: boolean;
  /** Publication date */
  published_at?: Date;
  /** Number of projects belonging to this site */
  project_count?: number;
  /** @deprecated Use image_pairs instead. Will be removed in v2.0. */
  images?: { src: string; alt: Localized<string>; is_before?: boolean }[];
  /** Before/after image pairs with SEO metadata */
  image_pairs?: ImagePair[];
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
 * Budget and duration are site-level fields, not aggregated from projects.
 */
export interface SiteAggregated {
  /** Merged unique service scopes from all projects */
  allServiceScopes: Localized<string[]>;
  /** All images from all projects with project attribution */
  allImages: SiteImage[];
  /** All external products from all projects */
  allExternalProducts: { url: string; image_url?: string; label: Localized<string> }[];
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
  /** @deprecated Use image_pairs instead. Will be removed in v2.0. */
  images: { src: string; alt: Localized<string>; is_before?: boolean }[];
  /** Before/after image pairs with SEO metadata */
  image_pairs?: ImagePair[];
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
  /** External product links (tiles, countertops, fixtures, etc.) */
  external_products?: { url: string; image_url?: string; label: Localized<string> }[];
  /** SEO meta title (max 70 chars) */
  meta_title?: Localized<string>;
  /** SEO meta description (max 155 chars) */
  meta_description?: Localized<string>;
  /** Primary focus keyword for SEO */
  focus_keyword?: Localized<string>;
  /** Additional SEO keywords (comma-separated) */
  seo_keywords?: Localized<string>;
  /** Internal purchase order number for sales tracking */
  po_number?: string;
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
  /** Icon image URL (SVG or image) */
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
 * Related project info included in blog posts.
 */
export interface BlogRelatedProject {
  /** URL-friendly identifier */
  slug: string;
  /** Project title */
  title: Localized<string>;
  /** Primary display image URL */
  hero_image?: string;
  /** External product links */
  external_products?: { url: string; image_url?: string; label: Localized<string> }[];
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
  /** Author name */
  author?: string;
  /** Publication date */
  published_at?: Date;
  /** Last updated date */
  updated_at?: Date;
  /** SEO meta title (max 70 chars) */
  meta_title?: Localized<string>;
  /** SEO meta description (max 155 chars) */
  meta_description?: Localized<string>;
  /** Primary focus keyword for SEO */
  focus_keyword?: Localized<string>;
  /** Additional SEO keywords (comma-separated) */
  seo_keywords?: Localized<string>;
  /** External URL (if linking elsewhere) */
  url?: string;
  /** Related project with external products */
  related_project?: BlogRelatedProject;
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
  service_type?: ServiceType; // Optional: Sites displayed as projects don't have a single service type
  location_city: string;
  budget_range?: string;
  duration?: string;
  space_type?: string;
  hero_image: string;
  /** @deprecated Use image_pairs instead. Will be removed in v2.0. */
  images: { src: string; alt: string; is_before?: boolean }[];
  /** Before/after image pairs with localized SEO metadata */
  image_pairs?: LocalizedImagePair[];
  service_scope?: string[];
  challenge?: string;
  solution?: string;
  featured?: boolean;
  badge?: string;
  external_products?: { url: string; image_url?: string; label: string }[];
  po_number?: string;
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
  budget_range?: string;
  duration?: string;
  show_as_project: boolean;
  featured: boolean;
  /** @deprecated Use image_pairs instead. Will be removed in v2.0. */
  images?: { src: string; alt: string; is_before?: boolean }[];
  /** Before/after image pairs with localized SEO metadata */
  image_pairs?: LocalizedImagePair[];
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
  allServiceScopes: string[];
  allImages: LocalizedSiteImage[];
  allExternalProducts: { url: string; image_url?: string; label: string }[];
}

/** A localized site with projects and aggregated data */
export interface LocalizedSiteWithProjects extends LocalizedSite {
  projects: LocalizedProject[];
  aggregated: LocalizedSiteAggregated;
}

/**
 * Extended project type for display purposes.
 * Can represent either a regular project or a site displayed as a "Whole House" project.
 */
export interface DisplayProject extends LocalizedProject {
  isSiteProject?: boolean;
  projectCount?: number;
  // Site-specific fields for whole house projects
  childAreas?: string[];
  totalBudget?: string;
  totalDuration?: string;
  allServiceScopes?: string[];
  allExternalProducts?: { url: string; image_url?: string; label: string }[];
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

/**
 * A partner company/brand for the homepage carousel.
 */
export interface Partner {
  /** Partner name */
  name: Localized<string>;
  /** Logo image URL */
  logo: string;
  /** Optional website URL */
  url?: string;
  /** Whether to hide visually but keep in DOM for SEO */
  isHiddenVisually: boolean;
}
