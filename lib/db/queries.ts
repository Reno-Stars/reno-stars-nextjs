import { cache } from 'react';
import { eq, asc, desc, and, inArray } from 'drizzle-orm';
import { db } from './index';
import {
  companyInfo,
  socialLinks as socialLinksTable,
  services as servicesTable,
  testimonials as testimonialsTable,
  aboutSections as aboutSectionsTable,
  houses as housesTable,
  projects as projectsTable,
  projectImages as projectImagesTable,
  projectScopes as projectScopesTable,
  blogPosts as blogPostsTable,
  contactSubmissions as contactSubmissionsTable,
  serviceAreas as serviceAreasTable,
  galleryItems as galleryItemsTable,
  trustBadges as trustBadgesTable,
  showroomInfo as showroomInfoTable,
  faqs as faqsTable,
} from './schema';
import { getAssetUrl } from '../storage';
import { calculateCombinedBudget, aggregateDurations, mergeServiceScopes, collectAllImages } from './helpers';
import type { Company, SocialLink, Service, Testimonial, AboutSections, ServiceType, Project, ServiceArea, BlogPost, GalleryItem, Showroom, Faq, House, HouseWithProjects } from '../types';

/**
 * Fetch company info from DB and map to the `Company` type.
 * `yearsExperience` is computed from `foundingYear` so it stays current.
 */
export const getCompanyFromDb = cache(async (): Promise<Company> => {
  const rows = await db.select().from(companyInfo).limit(1);
  const row = rows[0];
  if (!row) throw new Error('Company info not found in database');

  const foundingYear = row.foundingYear ?? 1997;
  const yearsExperience = String(new Date().getFullYear() - foundingYear);

  return {
    name: row.name,
    tagline: row.tagline ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    address: row.address ?? '',
    logo: getAssetUrl(row.logoUrl ?? ''),
    quoteUrl: row.quoteUrl ?? '/contact/',
    yearsExperience,
    foundingYear,
    teamSize: row.teamSize ?? 0,
    warranty: row.warranty ?? '',
    liabilityCoverage: row.liabilityCoverage ?? '',
    rating: row.rating ?? '',
    reviewCount: row.reviewCount ?? 0,
    ratingSource: row.ratingSource ?? '',
    geo: {
      latitude: row.geoLatitude ? Number(row.geoLatitude) : 0,
      longitude: row.geoLongitude ? Number(row.geoLongitude) : 0,
    },
  };
});

/**
 * Fetch active social links ordered by display_order.
 */
export const getSocialLinksFromDb = cache(async (): Promise<SocialLink[]> => {
  const rows = await db
    .select()
    .from(socialLinksTable)
    .where(eq(socialLinksTable.isActive, true))
    .orderBy(asc(socialLinksTable.displayOrder));

  return rows.map((row: typeof socialLinksTable.$inferSelect) => ({
    platform: row.platform as SocialLink['platform'],
    url: row.url,
    label: row.label ?? row.platform,
  }));
});

/**
 * Fetch services from DB, mapped to the `Service` type with bilingual content.
 */
export const getServicesFromDb = cache(async (): Promise<Service[]> => {
  const rows = await db
    .select()
    .from(servicesTable)
    .orderBy(asc(servicesTable.displayOrder));

  return rows.map((row: typeof servicesTable.$inferSelect) => ({
    slug: row.slug as ServiceType,
    title: { en: row.titleEn, zh: row.titleZh },
    description: { en: row.descriptionEn, zh: row.descriptionZh },
    long_description:
      row.longDescriptionEn && row.longDescriptionZh
        ? { en: row.longDescriptionEn, zh: row.longDescriptionZh }
        : undefined,
    icon: row.iconName ?? undefined,
    image: row.imageUrl ? getAssetUrl(row.imageUrl) : undefined,
  }));
});

/**
 * Fetch featured testimonials from DB, mapped to `Testimonial[]`.
 */
export const getTestimonialsFromDb = cache(async (): Promise<Testimonial[]> => {
  const rows = await db
    .select()
    .from(testimonialsTable)
    .where(eq(testimonialsTable.isFeatured, true));

  return rows.map((row: typeof testimonialsTable.$inferSelect) => ({
    id: row.id,
    name: row.name,
    text: { en: row.textEn, zh: row.textZh },
    rating: row.rating,
    location: row.location ?? '',
  }));
});

/**
 * Fetch about sections from DB, mapped to `AboutSections`.
 * The `{yearsExperience}` placeholder in ourJourney is replaced with the
 * computed value from company's founding year.
 */
export const getAboutSectionsFromDb = cache(async (): Promise<AboutSections> => {
  const rows = await db.select().from(aboutSectionsTable).limit(1);
  const row = rows[0];
  if (!row) throw new Error('About sections not found in database');

  // Compute years for placeholder replacement — reuse cached getCompanyFromDb
  const company = await getCompanyFromDb();
  const yearsExperience = company.yearsExperience;

  const replaceYears = (text: string | null) =>
    (text ?? '').replace(/\{yearsExperience\}/g, yearsExperience);

  return {
    ourJourney: {
      en: replaceYears(row.ourJourneyEn),
      zh: replaceYears(row.ourJourneyZh),
    },
    whatWeOffer: {
      en: row.whatWeOfferEn ?? '',
      zh: row.whatWeOfferZh ?? '',
    },
    ourValues: {
      en: row.ourValuesEn ?? '',
      zh: row.ourValuesZh ?? '',
    },
    whyChooseUs: {
      en: row.whyChooseUsEn ?? '',
      zh: row.whyChooseUsZh ?? '',
    },
    letsBuildTogether: {
      en: row.letsBuildTogetherEn ?? '',
      zh: row.letsBuildTogetherZh ?? '',
    },
  };
});

// ============================================================================
// PROJECT QUERIES
// ============================================================================

type DbProjectRow = typeof projectsTable.$inferSelect;
type DbImageRow = typeof projectImagesTable.$inferSelect;
type DbScopeRow = typeof projectScopesTable.$inferSelect;

function mapDbProjectToProject(
  row: DbProjectRow,
  images: DbImageRow[],
  scopes: DbScopeRow[]
): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: { en: row.titleEn, zh: row.titleZh },
    description: { en: row.descriptionEn, zh: row.descriptionZh },
    project_story:
      row.projectStoryEn && row.projectStoryZh
        ? { en: row.projectStoryEn, zh: row.projectStoryZh }
        : undefined,
    excerpt:
      row.excerptEn && row.excerptZh
        ? { en: row.excerptEn, zh: row.excerptZh }
        : undefined,
    service_type: row.serviceType as ServiceType,
    category: {
      en: row.categoryEn ?? '',
      zh: row.categoryZh ?? '',
    },
    location_city: row.locationCity ?? '',
    budget_range: row.budgetRange ?? undefined,
    duration:
      row.durationEn && row.durationZh
        ? { en: row.durationEn, zh: row.durationZh }
        : undefined,
    space_type:
      row.spaceTypeEn && row.spaceTypeZh
        ? { en: row.spaceTypeEn, zh: row.spaceTypeZh }
        : undefined,
    hero_image: getAssetUrl(row.heroImageUrl ?? ''),
    images: images
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((img) => ({
        src: getAssetUrl(img.imageUrl),
        alt: {
          en: img.altTextEn ?? '',
          zh: img.altTextZh ?? '',
        },
        is_before: img.isBefore,
      })),
    service_scope:
      scopes.length > 0
        ? {
            en: scopes.sort((a, b) => a.displayOrder - b.displayOrder).map((s) => s.scopeEn),
            zh: scopes.sort((a, b) => a.displayOrder - b.displayOrder).map((s) => s.scopeZh),
          }
        : undefined,
    challenge:
      row.challengeEn && row.challengeZh
        ? { en: row.challengeEn, zh: row.challengeZh }
        : undefined,
    solution:
      row.solutionEn && row.solutionZh
        ? { en: row.solutionEn, zh: row.solutionZh }
        : undefined,
    published_at: row.publishedAt ?? undefined,
    featured: row.featured,
    badge:
      row.badgeEn && row.badgeZh
        ? { en: row.badgeEn, zh: row.badgeZh }
        : undefined,
    // House relationship
    house_id: row.houseId ?? undefined,
    display_order_in_house: row.displayOrderInHouse,
  };
}

async function fetchProjectRelations(projectIds: string[]): Promise<{
  images: DbImageRow[];
  scopes: DbScopeRow[];
}> {
  if (projectIds.length === 0) return { images: [], scopes: [] };
  const [images, scopes] = await Promise.all([
    db.select().from(projectImagesTable).where(inArray(projectImagesTable.projectId, projectIds)) as Promise<DbImageRow[]>,
    db.select().from(projectScopesTable).where(inArray(projectScopesTable.projectId, projectIds)) as Promise<DbScopeRow[]>,
  ]);
  return { images, scopes };
}

/** Fetch all published projects from DB, mapped to `Project[]`. */
export const getProjectsFromDb = cache(async (): Promise<Project[]> => {
  const rows: DbProjectRow[] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.isPublished, true))
    .orderBy(desc(projectsTable.createdAt));

  const ids = rows.map((r: DbProjectRow) => r.id);
  const { images, scopes } = await fetchProjectRelations(ids);

  return rows.map((row: DbProjectRow) =>
    mapDbProjectToProject(
      row,
      images.filter((i: DbImageRow) => i.projectId === row.id),
      scopes.filter((s: DbScopeRow) => s.projectId === row.id)
    )
  );
});

/** Fetch a single published project by slug from DB. */
export const getProjectBySlugFromDb = cache(
  async (slug: string): Promise<Project | null> => {
    const rows = await db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.slug, slug), eq(projectsTable.isPublished, true)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    const { images, scopes } = await fetchProjectRelations([row.id]);
    return mapDbProjectToProject(row, images, scopes);
  }
);

/** Fetch all projects including unpublished (for admin). */
export async function getAllProjectsAdmin() {
  const rows: DbProjectRow[] = await db
    .select()
    .from(projectsTable)
    .orderBy(desc(projectsTable.createdAt));

  const ids = rows.map((r: DbProjectRow) => r.id);
  const { images, scopes } = await fetchProjectRelations(ids);

  return rows.map((row: DbProjectRow) => ({
    ...row,
    images: images.filter((i: DbImageRow) => i.projectId === row.id).sort((a: DbImageRow, b: DbImageRow) => a.displayOrder - b.displayOrder),
    scopes: scopes.filter((s: DbScopeRow) => s.projectId === row.id).sort((a: DbScopeRow, b: DbScopeRow) => a.displayOrder - b.displayOrder),
  }));
}

/** Fetch all published project slugs (for sitemap). */
export async function getProjectSlugsFromDb(): Promise<string[]> {
  const rows: { slug: string }[] = await db
    .select({ slug: projectsTable.slug })
    .from(projectsTable)
    .where(eq(projectsTable.isPublished, true));
  return rows.map((r: { slug: string }) => r.slug);
}

// ============================================================================
// HOUSE QUERIES
// ============================================================================

type DbHouseRow = typeof housesTable.$inferSelect;

function mapDbHouseToHouse(row: DbHouseRow): House {
  return {
    id: row.id,
    slug: row.slug,
    title: { en: row.titleEn, zh: row.titleZh },
    description: { en: row.descriptionEn, zh: row.descriptionZh },
    location_city: row.locationCity ?? undefined,
    hero_image: row.heroImageUrl ? getAssetUrl(row.heroImageUrl) : undefined,
    badge:
      row.badgeEn && row.badgeZh
        ? { en: row.badgeEn, zh: row.badgeZh }
        : undefined,
    show_as_project: row.showAsProject,
    featured: row.featured,
    published_at: row.publishedAt ?? undefined,
  };
}

/** Fetch all published houses. */
export const getHousesFromDb = cache(async (): Promise<House[]> => {
  const rows = await db
    .select()
    .from(housesTable)
    .where(eq(housesTable.isPublished, true))
    .orderBy(desc(housesTable.createdAt));

  return rows.map(mapDbHouseToHouse);
});

/** Fetch projects for a given house ID. */
export const getProjectsOfHouse = cache(async (houseId: string): Promise<Project[]> => {
  const rows: DbProjectRow[] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.houseId, houseId), eq(projectsTable.isPublished, true)))
    .orderBy(asc(projectsTable.displayOrderInHouse));

  if (rows.length === 0) return [];

  const ids = rows.map((r: DbProjectRow) => r.id);
  const { images, scopes } = await fetchProjectRelations(ids);

  return rows.map((row: DbProjectRow) =>
    mapDbProjectToProject(
      row,
      images.filter((i: DbImageRow) => i.projectId === row.id),
      scopes.filter((s: DbScopeRow) => s.projectId === row.id)
    )
  );
});

/** Fetch a house by slug with its projects and aggregated data. */
export const getHouseBySlugFromDb = cache(
  async (slug: string): Promise<HouseWithProjects | null> => {
    const rows = await db
      .select()
      .from(housesTable)
      .where(and(eq(housesTable.slug, slug), eq(housesTable.isPublished, true)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    const house = mapDbHouseToHouse(row);

    // Fetch projects belonging to this house
    const projects = await getProjectsOfHouse(row.id);

    // Build aggregated data
    const aggregated: HouseWithProjects['aggregated'] = {
      totalBudget: calculateCombinedBudget(projects),
      totalDuration: aggregateDurations(projects),
      allServiceScopes: mergeServiceScopes(projects),
      allImages: collectAllImages(projects),
    };

    return {
      ...house,
      projects,
      aggregated,
    };
  }
);

/** Fetch all published houses that should show as projects. */
export const getHousesAsProjectsFromDb = cache(async (): Promise<House[]> => {
  const rows = await db
    .select()
    .from(housesTable)
    .where(and(eq(housesTable.isPublished, true), eq(housesTable.showAsProject, true)))
    .orderBy(desc(housesTable.createdAt));

  return rows.map(mapDbHouseToHouse);
});

// ============================================================================
// SERVICE AREA QUERIES
// ============================================================================

/** Fetch active service areas ordered by display_order. */
export const getServiceAreasFromDb = cache(async (): Promise<ServiceArea[]> => {
  const rows = await db
    .select()
    .from(serviceAreasTable)
    .where(eq(serviceAreasTable.isActive, true))
    .orderBy(asc(serviceAreasTable.displayOrder));

  return rows.map((row: typeof serviceAreasTable.$inferSelect) => ({
    slug: row.slug,
    name: { en: row.nameEn, zh: row.nameZh },
    description:
      row.descriptionEn && row.descriptionZh
        ? { en: row.descriptionEn, zh: row.descriptionZh }
        : undefined,
  }));
});

// ============================================================================
// BLOG POST QUERIES
// ============================================================================

/** Fetch all published blog posts ordered by publishedAt desc. */
export const getBlogPostsFromDb = cache(async (): Promise<BlogPost[]> => {
  const rows = await db
    .select()
    .from(blogPostsTable)
    .where(eq(blogPostsTable.isPublished, true))
    .orderBy(desc(blogPostsTable.publishedAt));

  return rows.map((row: typeof blogPostsTable.$inferSelect) => ({
    slug: row.slug,
    title: { en: row.titleEn, zh: row.titleZh },
    excerpt:
      row.excerptEn && row.excerptZh
        ? { en: row.excerptEn, zh: row.excerptZh }
        : undefined,
    content:
      row.contentEn && row.contentZh
        ? { en: row.contentEn, zh: row.contentZh }
        : undefined,
    featured_image: row.featuredImageUrl ? getAssetUrl(row.featuredImageUrl) : undefined,
    published_at: row.publishedAt ?? undefined,
  }));
});

/** Fetch a single published blog post by slug. */
export const getBlogPostBySlugFromDb = cache(
  async (slug: string): Promise<BlogPost | null> => {
    const rows = await db
      .select()
      .from(blogPostsTable)
      .where(and(eq(blogPostsTable.slug, slug), eq(blogPostsTable.isPublished, true)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return {
      slug: row.slug,
      title: { en: row.titleEn, zh: row.titleZh },
      excerpt:
        row.excerptEn && row.excerptZh
          ? { en: row.excerptEn, zh: row.excerptZh }
          : undefined,
      content:
        row.contentEn && row.contentZh
          ? { en: row.contentEn, zh: row.contentZh }
          : undefined,
      featured_image: row.featuredImageUrl ? getAssetUrl(row.featuredImageUrl) : undefined,
      published_at: row.publishedAt ?? undefined,
    };
  }
);

/** Fetch all published blog post slugs (for sitemap). */
export async function getBlogPostSlugsFromDb(): Promise<string[]> {
  const rows: { slug: string }[] = await db
    .select({ slug: blogPostsTable.slug })
    .from(blogPostsTable)
    .where(eq(blogPostsTable.isPublished, true));
  return rows.map((r: { slug: string }) => r.slug);
}

// ============================================================================
// GALLERY QUERIES
// ============================================================================

/** Fetch published gallery items ordered by display_order. */
export const getGalleryItemsFromDb = cache(async (): Promise<GalleryItem[]> => {
  const rows = await db
    .select()
    .from(galleryItemsTable)
    .where(eq(galleryItemsTable.isPublished, true))
    .orderBy(asc(galleryItemsTable.displayOrder));

  return rows.map((row: typeof galleryItemsTable.$inferSelect) => ({
    image: getAssetUrl(row.imageUrl),
    title: { en: row.titleEn ?? '', zh: row.titleZh ?? '' },
    category: row.category.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  }));
});

// ============================================================================
// TRUST BADGE QUERIES
// ============================================================================

/** Fetch active trust badges ordered by display_order. */
export const getTrustBadgesFromDb = cache(async (): Promise<{ en: string; zh: string }[]> => {
  const rows = await db
    .select()
    .from(trustBadgesTable)
    .where(eq(trustBadgesTable.isActive, true))
    .orderBy(asc(trustBadgesTable.displayOrder));

  return rows.map((row: typeof trustBadgesTable.$inferSelect) => ({
    en: row.badgeEn,
    zh: row.badgeZh,
  }));
});

// ============================================================================
// SHOWROOM QUERIES
// ============================================================================

/** Fetch showroom info (singleton row). */
export const getShowroomFromDb = cache(async (): Promise<Showroom> => {
  const rows = await db.select().from(showroomInfoTable).limit(1);
  const row = rows[0];
  if (!row) throw new Error('Showroom info not found in database');

  return {
    address: row.address ?? '',
    appointmentText: {
      en: row.appointmentTextEn ?? '',
      zh: row.appointmentTextZh ?? '',
    },
    phone: row.phone ?? '',
    email: row.email ?? '',
  };
});

// ============================================================================
// FAQ QUERIES
// ============================================================================

/**
 * Fetch active FAQs ordered by display_order.
 * Replaces `{yearsExperience}` placeholder with computed value from company info.
 */
export const getFaqsFromDb = cache(async (): Promise<Faq[]> => {
  const rows = await db
    .select()
    .from(faqsTable)
    .where(eq(faqsTable.isActive, true))
    .orderBy(asc(faqsTable.displayOrder));

  // Get years experience for placeholder replacement
  const company = await getCompanyFromDb();
  const yearsExperience = company.yearsExperience;

  const replaceYears = (text: string) =>
    text.replace(/\{yearsExperience\}/g, yearsExperience);

  return rows.map((row: typeof faqsTable.$inferSelect) => ({
    id: row.id,
    question: { en: row.questionEn, zh: row.questionZh },
    answer: { en: replaceYears(row.answerEn), zh: replaceYears(row.answerZh) },
  }));
});

// ============================================================================
// ADMIN-ONLY QUERIES
// ============================================================================

/** Fetch all social links (admin — includes inactive). */
export async function getAllSocialLinksAdmin(): Promise<(typeof socialLinksTable.$inferSelect)[]> {
  return db.select().from(socialLinksTable).orderBy(asc(socialLinksTable.displayOrder));
}

/** Fetch all services (admin — includes all fields). */
export async function getAllServicesAdmin() {
  return db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder));
}

/** Fetch all testimonials (admin — includes non-featured). */
export async function getAllTestimonialsAdmin() {
  return db.select().from(testimonialsTable).orderBy(desc(testimonialsTable.createdAt));
}

/** Fetch all blog posts (admin — includes unpublished). */
export async function getAllBlogPostsAdmin() {
  return db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt));
}

/** Fetch all contact submissions (admin). */
export async function getAllContactsAdmin() {
  return db.select().from(contactSubmissionsTable).orderBy(desc(contactSubmissionsTable.createdAt));
}

/** Fetch all service areas (admin — includes inactive). */
export async function getAllServiceAreasAdmin(): Promise<(typeof serviceAreasTable.$inferSelect)[]> {
  return db.select().from(serviceAreasTable).orderBy(asc(serviceAreasTable.displayOrder));
}

/** Fetch all gallery items (admin — includes unpublished). */
export async function getAllGalleryItemsAdmin(): Promise<(typeof galleryItemsTable.$inferSelect)[]> {
  return db.select().from(galleryItemsTable).orderBy(asc(galleryItemsTable.displayOrder));
}

/** Fetch all trust badges (admin — includes inactive). */
export async function getAllTrustBadgesAdmin(): Promise<(typeof trustBadgesTable.$inferSelect)[]> {
  return db.select().from(trustBadgesTable).orderBy(asc(trustBadgesTable.displayOrder));
}

/** Fetch about sections (admin — singleton row). */
export async function getAboutSectionsAdmin(): Promise<(typeof aboutSectionsTable.$inferSelect) | null> {
  const rows = await db.select().from(aboutSectionsTable).limit(1);
  return rows[0] ?? null;
}

/** Fetch showroom info (admin — singleton row). */
export async function getShowroomInfoAdmin(): Promise<(typeof showroomInfoTable.$inferSelect) | null> {
  const rows = await db.select().from(showroomInfoTable).limit(1);
  return rows[0] ?? null;
}

/** Fetch all FAQs (admin — includes inactive). */
export async function getAllFaqsAdmin(): Promise<(typeof faqsTable.$inferSelect)[]> {
  return db.select().from(faqsTable).orderBy(asc(faqsTable.displayOrder));
}

/** Fetch all houses (admin — includes unpublished). */
export async function getAllHousesAdmin(): Promise<(typeof housesTable.$inferSelect)[]> {
  return db.select().from(housesTable).orderBy(desc(housesTable.createdAt));
}
