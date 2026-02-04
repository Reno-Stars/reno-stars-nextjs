import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// NOTE: `updatedAt` columns use `defaultNow()` for INSERT only. PostgreSQL
// does not auto-update on UPDATE. Set `updatedAt: new Date()` explicitly in
// application update queries, or create a database trigger if preferred.

// ============================================================================
// ENUMS
// ============================================================================

/** Available service types for renovation projects */
export const serviceTypeEnum = pgEnum('service_type', [
  'kitchen',
  'bathroom',
  'whole-house',
  'basement',
  'cabinet',
  'commercial',
]);

/** Status tracking for contact form submissions */
export const contactStatusEnum = pgEnum('contact_status', [
  'new',
  'contacted',
  'converted',
  'rejected',
]);

/** Supported social media platforms */
export const socialPlatformEnum = pgEnum('social_platform', [
  'facebook',
  'instagram',
  'youtube',
  'linkedin',
  'twitter',
  'xiaohongshu',
  'wechat',
  'whatsapp',
]);

/** Gallery categories matching service types */
export const galleryCategoryEnum = pgEnum('gallery_category', [
  'kitchen',
  'bathroom',
  'whole-house',
  'commercial',
]);

// ============================================================================
// SERVICES
// ============================================================================

/** Service offerings (Kitchen, Bathroom, etc.) */
export const services = pgTable(
  'services',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 50 }).notNull().unique(),
    titleEn: varchar('title_en', { length: 100 }).notNull(),
    titleZh: varchar('title_zh', { length: 100 }).notNull(),
    descriptionEn: text('description_en').notNull(),
    descriptionZh: text('description_zh').notNull(),
    longDescriptionEn: text('long_description_en'),
    longDescriptionZh: text('long_description_zh'),
    iconName: varchar('icon_name', { length: 50 }),
    imageUrl: varchar('image_url', { length: 500 }),
    displayOrder: integer('display_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('services_slug_idx').on(table.slug)]
);

export const servicesRelations = relations(services, ({ many }) => ({
  projects: many(projects),
}));

// ============================================================================
// SERVICE AREAS
// ============================================================================

/** Geographic service coverage locations */
export const serviceAreas = pgTable(
  'service_areas',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 50 }).notNull().unique(),
    nameEn: varchar('name_en', { length: 100 }).notNull(),
    nameZh: varchar('name_zh', { length: 100 }).notNull(),
    descriptionEn: text('description_en'),
    descriptionZh: text('description_zh'),
    isActive: boolean('is_active').default(true).notNull(),
    displayOrder: integer('display_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('service_areas_slug_idx').on(table.slug)]
);

// ============================================================================
// PROJECTS
// ============================================================================

/** Portfolio projects showcasing renovation work */
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),

    // Localized titles and descriptions
    titleEn: varchar('title_en', { length: 200 }).notNull(),
    titleZh: varchar('title_zh', { length: 200 }).notNull(),
    descriptionEn: text('description_en').notNull(),
    descriptionZh: text('description_zh').notNull(),
    excerptEn: text('excerpt_en'),
    excerptZh: text('excerpt_zh'),
    projectStoryEn: text('project_story_en'),
    projectStoryZh: text('project_story_zh'),

    // Service and category
    serviceId: uuid('service_id').references(() => services.id, {
      onDelete: 'set null',
    }),
    serviceType: serviceTypeEnum('service_type').notNull(),
    categoryEn: varchar('category_en', { length: 100 }),
    categoryZh: varchar('category_zh', { length: 100 }),

    // Location and specs
    locationCity: varchar('location_city', { length: 100 }),
    budgetRange: varchar('budget_range', { length: 50 }),
    durationEn: varchar('duration_en', { length: 100 }),
    durationZh: varchar('duration_zh', { length: 100 }),
    spaceTypeEn: varchar('space_type_en', { length: 100 }),
    spaceTypeZh: varchar('space_type_zh', { length: 100 }),

    // Media
    heroImageUrl: varchar('hero_image_url', { length: 500 }),

    // Challenge and solution
    challengeEn: text('challenge_en'),
    challengeZh: text('challenge_zh'),
    solutionEn: text('solution_en'),
    solutionZh: text('solution_zh'),

    // Badge (e.g., "New", "Featured")
    badgeEn: varchar('badge_en', { length: 50 }),
    badgeZh: varchar('badge_zh', { length: 50 }),

    // Flags
    featured: boolean('featured').default(false).notNull(),
    isPublished: boolean('is_published').default(true).notNull(),

    // Timestamps
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('projects_slug_idx').on(table.slug),
    index('projects_service_type_idx').on(table.serviceType),
    index('projects_location_city_idx').on(table.locationCity),
    index('projects_featured_idx').on(table.featured),
  ]
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  service: one(services, {
    fields: [projects.serviceId],
    references: [services.id],
  }),
  images: many(projectImages),
  scopes: many(projectScopes),
}));

// ============================================================================
// PROJECT IMAGES
// ============================================================================

/** Before/after images for projects */
export const projectImages = pgTable(
  'project_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    imageUrl: varchar('image_url', { length: 500 }).notNull(),
    altTextEn: varchar('alt_text_en', { length: 255 }),
    altTextZh: varchar('alt_text_zh', { length: 255 }),
    isBefore: boolean('is_before').default(false).notNull(),
    displayOrder: integer('display_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('project_images_project_id_idx').on(table.projectId)]
);

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));

// ============================================================================
// PROJECT SCOPES
// ============================================================================

/** Service scope items per project */
export const projectScopes = pgTable(
  'project_scopes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    scopeEn: varchar('scope_en', { length: 100 }).notNull(),
    scopeZh: varchar('scope_zh', { length: 100 }).notNull(),
    displayOrder: integer('display_order').default(0).notNull(),
  },
  (table) => [index('project_scopes_project_id_idx').on(table.projectId)]
);

export const projectScopesRelations = relations(projectScopes, ({ one }) => ({
  project: one(projects, {
    fields: [projectScopes.projectId],
    references: [projects.id],
  }),
}));

// ============================================================================
// BLOG POSTS
// ============================================================================

/** Blog content with i18n support */
export const blogPosts = pgTable(
  'blog_posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    titleEn: varchar('title_en', { length: 255 }).notNull(),
    titleZh: varchar('title_zh', { length: 255 }).notNull(),
    excerptEn: text('excerpt_en'),
    excerptZh: text('excerpt_zh'),
    contentEn: text('content_en').notNull(),
    contentZh: text('content_zh').notNull(),
    featuredImageUrl: varchar('featured_image_url', { length: 500 }),
    author: varchar('author', { length: 100 }),
    seoKeywords: text('seo_keywords'),
    isPublished: boolean('is_published').default(false).notNull(),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('blog_posts_slug_idx').on(table.slug),
    index('blog_posts_published_at_idx').on(table.publishedAt),
  ]
);

// ============================================================================
// TESTIMONIALS
// ============================================================================

/** Customer reviews and ratings (1-5 scale) */
export const testimonials = pgTable(
  'testimonials',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    textEn: text('text_en').notNull(),
    textZh: text('text_zh').notNull(),
    /** Rating from 1-5 (constrained at database level) */
    rating: integer('rating').notNull(),
    location: varchar('location', { length: 100 }),
    imageUrl: varchar('image_url', { length: 500 }),
    projectId: uuid('project_id').references(() => projects.id, {
      onDelete: 'set null',
    }),
    isFeatured: boolean('is_featured').default(false).notNull(),
    verified: boolean('verified').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('testimonials_featured_idx').on(table.isFeatured),
    // Rating must be between 1 and 5
    check('rating_range', sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  ]
);

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  project: one(projects, {
    fields: [testimonials.projectId],
    references: [projects.id],
  }),
}));

// ============================================================================
// GALLERY ITEMS
// ============================================================================

/** Portfolio gallery images */
export const galleryItems = pgTable(
  'gallery_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    imageUrl: varchar('image_url', { length: 500 }).notNull(),
    titleEn: varchar('title_en', { length: 200 }),
    titleZh: varchar('title_zh', { length: 200 }),
    category: galleryCategoryEnum('category').notNull(),
    projectId: uuid('project_id').references(() => projects.id, {
      onDelete: 'set null',
    }),
    displayOrder: integer('display_order').default(0).notNull(),
    isPublished: boolean('is_published').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('gallery_items_category_idx').on(table.category)]
);

export const galleryItemsRelations = relations(galleryItems, ({ one }) => ({
  project: one(projects, {
    fields: [galleryItems.projectId],
    references: [projects.id],
  }),
}));

// ============================================================================
// CONTACT SUBMISSIONS
// ============================================================================

/** Contact form submissions for CRM */
export const contactSubmissions = pgTable(
  'contact_submissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 30 }),
    message: text('message').notNull(),
    preferredServiceId: uuid('preferred_service_id').references(
      () => services.id
    ),
    preferredAreaId: uuid('preferred_area_id').references(() => serviceAreas.id),
    status: contactStatusEnum('status').default('new').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('contact_submissions_status_idx').on(table.status),
    index('contact_submissions_created_at_idx').on(table.createdAt),
  ]
);

export const contactSubmissionsRelations = relations(
  contactSubmissions,
  ({ one }) => ({
    preferredService: one(services, {
      fields: [contactSubmissions.preferredServiceId],
      references: [services.id],
    }),
    preferredArea: one(serviceAreas, {
      fields: [contactSubmissions.preferredAreaId],
      references: [serviceAreas.id],
    }),
  })
);

// ============================================================================
// COMPANY INFO (Singleton)
// ============================================================================

/** Company-wide metadata and contact info */
export const companyInfo = pgTable('company_info', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  tagline: varchar('tagline', { length: 200 }),
  phone: varchar('phone', { length: 30 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  logoUrl: varchar('logo_url', { length: 500 }),
  quoteUrl: varchar('quote_url', { length: 500 }),
  yearsExperience: varchar('years_experience', { length: 10 }),
  foundingYear: integer('founding_year'),
  teamSize: integer('team_size'),
  warranty: varchar('warranty', { length: 50 }),
  liabilityCoverage: varchar('liability_coverage', { length: 50 }),
  rating: varchar('rating', { length: 20 }),
  reviewCount: integer('review_count'),
  ratingSource: varchar('rating_source', { length: 50 }),
  geoLatitude: varchar('geo_latitude', { length: 20 }),
  geoLongitude: varchar('geo_longitude', { length: 20 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// SHOWROOM INFO (Singleton)
// ============================================================================

/** Showroom location and scheduling info */
export const showroomInfo = pgTable('showroom_info', {
  id: uuid('id').defaultRandom().primaryKey(),
  address: text('address'),
  appointmentTextEn: text('appointment_text_en'),
  appointmentTextZh: text('appointment_text_zh'),
  phone: varchar('phone', { length: 30 }),
  email: varchar('email', { length: 255 }),
  hoursOpen: varchar('hours_open', { length: 20 }),
  hoursClose: varchar('hours_close', { length: 20 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// ABOUT SECTIONS (Singleton)
// ============================================================================

/** About page content sections with i18n */
export const aboutSections = pgTable('about_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  ourJourneyEn: text('our_journey_en'),
  ourJourneyZh: text('our_journey_zh'),
  whatWeOfferEn: text('what_we_offer_en'),
  whatWeOfferZh: text('what_we_offer_zh'),
  ourValuesEn: text('our_values_en'),
  ourValuesZh: text('our_values_zh'),
  whyChooseUsEn: text('why_choose_us_en'),
  whyChooseUsZh: text('why_choose_us_zh'),
  letsBuildTogetherEn: text('lets_build_together_en'),
  letsBuildTogetherZh: text('lets_build_together_zh'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// TRUST BADGES
// ============================================================================

/** Achievement and certification badges */
export const trustBadges = pgTable(
  'trust_badges',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    badgeEn: varchar('badge_en', { length: 100 }).notNull().unique(),
    badgeZh: varchar('badge_zh', { length: 100 }).notNull(),
    displayOrder: integer('display_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
  },
  (table) => [uniqueIndex('trust_badges_badge_en_idx').on(table.badgeEn)]
);

// ============================================================================
// SOCIAL LINKS
// ============================================================================

/** Social media profile links */
export const socialLinks = pgTable(
  'social_links',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    platform: socialPlatformEnum('platform').notNull().unique(),
    url: varchar('url', { length: 500 }).notNull(),
    label: varchar('label', { length: 50 }),
    displayOrder: integer('display_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
  },
  (table) => [uniqueIndex('social_links_platform_idx').on(table.platform)]
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================
// Prefixed with "Db" to avoid conflicts with the localized types in lib/types.ts.
// lib/types.ts defines application-level types with Localized<T> fields (nested i18n).
// These types represent flat database row shapes.

export type DbService = typeof services.$inferSelect;
export type NewDbService = typeof services.$inferInsert;

export type DbServiceArea = typeof serviceAreas.$inferSelect;
export type NewDbServiceArea = typeof serviceAreas.$inferInsert;

export type DbProject = typeof projects.$inferSelect;
export type NewDbProject = typeof projects.$inferInsert;

export type DbProjectImage = typeof projectImages.$inferSelect;
export type NewDbProjectImage = typeof projectImages.$inferInsert;

export type DbProjectScope = typeof projectScopes.$inferSelect;
export type NewDbProjectScope = typeof projectScopes.$inferInsert;

export type DbBlogPost = typeof blogPosts.$inferSelect;
export type NewDbBlogPost = typeof blogPosts.$inferInsert;

export type DbTestimonial = typeof testimonials.$inferSelect;
export type NewDbTestimonial = typeof testimonials.$inferInsert;

export type DbGalleryItem = typeof galleryItems.$inferSelect;
export type NewDbGalleryItem = typeof galleryItems.$inferInsert;

export type DbContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewDbContactSubmission = typeof contactSubmissions.$inferInsert;

export type DbCompanyInfo = typeof companyInfo.$inferSelect;
export type NewDbCompanyInfo = typeof companyInfo.$inferInsert;

export type DbShowroomInfo = typeof showroomInfo.$inferSelect;
export type NewDbShowroomInfo = typeof showroomInfo.$inferInsert;

export type DbAboutSections = typeof aboutSections.$inferSelect;
export type NewDbAboutSections = typeof aboutSections.$inferInsert;

export type DbTrustBadge = typeof trustBadges.$inferSelect;
export type NewDbTrustBadge = typeof trustBadges.$inferInsert;

export type DbSocialLink = typeof socialLinks.$inferSelect;
export type NewDbSocialLink = typeof socialLinks.$inferInsert;
