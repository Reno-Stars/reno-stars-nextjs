/**
 * Type definitions for the Reno Stars application.
 * @module lib/types
 */

/** Supported locales for internationalization. Source of truth is i18n/config.ts. */
export type { Locale } from '@/i18n/config';
import type { Locale } from '@/i18n/config';

/**
 * Helper type for multilingual content. EN is required (source-of-truth);
 * other locales are optional and fall back to EN at read time via pickLocale().
 * Existing legacy code that does `field.zh` directly continues to work because
 * all current rows have ZH; new locales (ja/ko/es) start as undefined and get
 * back-filled by translation runs.
 */
export type Localized<T> = { en: T } & Partial<Record<Exclude<Locale, 'en'>, T>>;

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
 * At least one of beforeImage, afterImage, beforeVideo, or afterVideo must be present.
 */
export interface ImagePair {
  /** Before image (optional if afterImage exists) */
  beforeImage?: ImageWithAlt;
  /** After image (optional if beforeImage exists) */
  afterImage?: ImageWithAlt;
  /** Before video URL (optional) */
  beforeVideo?: string;
  /** After video URL (optional) */
  afterVideo?: string;
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
  beforeVideo?: string;
  afterVideo?: string;
  title?: string;
  caption?: string;
  photographerCredit?: string;
  keywords?: string;
}

/** Available service types for renovation projects (DB-driven via `services` table). */
export type ServiceType = string;

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
  /** Hero video URL (optional) */
  hero_video?: string;
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
  /** Type of space (e.g., Condo, House, Townhouse) */
  space_type?: Localized<string>;
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
  /** External product links (site-level) */
  external_products?: { url: string; image_url?: string; label: Localized<string> }[];
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
  /** Type of renovation service (null if not assigned) */
  service_type?: ServiceType;
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
  /** Hero video URL (optional) */
  hero_video?: string;
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
  /** Service slug identifier */
  slug: string;
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
  /** Sub-service tags (e.g., "Floor Installation", "Cooking Equipment") */
  tags?: Localized<string[]>;
  /** Per-service "Why Us" benefits (overrides hardcoded defaults when present) */
  benefits?: Localized<string[]>;
  /** Whether this service appears on /services, homepage services, and footer */
  showOnServicesPage?: boolean;
  /** Whether this service appears as a project filtering category (navbar, project filters) */
  isProjectType?: boolean;
}

/**
 * A geographic service area.
 */
export interface ServiceArea {
  /** Unique identifier (UUID) */
  id: string;
  /** URL-friendly area identifier */
  slug: string;
  /** Area name */
  name: Localized<string>;
  /** Area description */
  description?: Localized<string>;
  /** Rich unique intro copy per area (multiple paragraphs) */
  content?: Localized<string>;
  /** Custom area benefits (replaces hardcoded areaBenefits when present) */
  highlights?: Localized<string[]>;
  /** Custom SEO meta title per area */
  metaTitle?: Localized<string>;
  /** Custom SEO meta description per area */
  metaDescription?: Localized<string>;
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
  /** Chinese translation of review text (generated by AI) */
  textZh?: string;
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
 * A design gallery image item (3D renderings, design concepts).
 */
export interface DesignItem {
  /** Image URL */
  image: string;
  /** Image title */
  title: Localized<string>;
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
  /** Years of experience (computed from foundingYear in config) */
  yearsExperience: string;
  /** Year company was founded */
  foundingYear: number;
  /** Number of team members */
  teamSize: number;
  /** Projects completed count (e.g. "700+") */
  projectsCompleted: string;
  /** Liability insurance coverage dollar amount (e.g. "$5M") */
  liabilityCoverage: string;
  /** Hero video URL (admin-managed, optional) */
  heroVideoUrl: string;
  /** Hero poster image URL (admin-managed, optional) */
  heroImageUrl: string;
  /** Geographic coordinates for structured data */
  geo: { latitude: number; longitude: number };
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
  hero_video?: string;
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
  hero_video?: string;
  badge?: string;
  budget_range?: string;
  duration?: string;
  space_type?: string;
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
  tags?: string[];
  benefits?: string[];
}

/** A service area with content resolved to a single locale */
export interface LocalizedArea {
  id: string;
  slug: string;
  name: string;
  description?: string;
  content?: string;
  highlights?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * A social media profile link.
 */
export interface SocialLink {
  /** Social platform name */
  platform: 'facebook' | 'instagram' | 'youtube' | 'linkedin' | 'twitter' | 'xiaohongshu' | 'wechat' | 'whatsapp' | 'linktree';
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
