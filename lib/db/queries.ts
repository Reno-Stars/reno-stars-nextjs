import { cache } from 'react';
import { eq, asc, desc, and, inArray, count } from 'drizzle-orm';
import { db } from './index';
import {
  companyInfo,
  socialLinks as socialLinksTable,
  services as servicesTable,
  aboutSections as aboutSectionsTable,
  projectSites as sitesTable,
  siteImagePairs as siteImagePairsTable,
  projects as projectsTable,
  projectImagePairs as projectImagePairsTable,
  projectScopes as projectScopesTable,
  projectExternalProducts as projectExternalProductsTable,
  blogPosts as blogPostsTable,
  contactSubmissions as contactSubmissionsTable,
  serviceAreas as serviceAreasTable,
  galleryItems as galleryItemsTable,
  trustBadges as trustBadgesTable,
  showroomInfo as showroomInfoTable,
  faqs as faqsTable,
  partners as partnersTable,
} from './schema';
import { getAssetUrl } from '../storage';
import { calculateCombinedBudget, aggregateDurations, mergeServiceScopes, collectAllImages, collectAllExternalProducts } from './helpers';
import type { Company, SocialLink, Service, AboutSections, ServiceType, Project, ServiceArea, BlogPost, BlogRelatedProject, GalleryItem, Showroom, Faq, Site, SiteWithProjects, ImagePair, Partner } from '../types';

// ============================================================================
// HELPERS
// ============================================================================

/** Helper to sort arrays by displayOrder field */
function sortByDisplayOrder<T extends { displayOrder: number }>(arr: T[]): T[] {
  return arr.slice().sort((a, b) => a.displayOrder - b.displayOrder);
}

/** Helper to group array items by a key field into a Map */
function groupBy<T, K extends string | number>(arr: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of arr) {
    const key = keyFn(item);
    const group = map.get(key) ?? [];
    group.push(item);
    map.set(key, group);
  }
  return map;
}

// ============================================================================
// COMPANY QUERIES
// ============================================================================

/**
 * Fetch company info from DB and map to the `Company` type.
 * `yearsExperience` is computed from `foundingYear` so it stays current.
 */
export const getCompanyFromDb = cache(async (): Promise<Company> => {
  const rows = await db.select().from(companyInfo).limit(1);
  const row = rows[0];
  if (!row) throw new Error('Company info not found in database');

  const foundingYear = row.foundingYear ?? 1997;
  // Round years to nearest 5 for cleaner display (e.g., 27 -> 25, 28 -> 30)
  const rawYears = new Date().getFullYear() - foundingYear;
  const yearsExperience = String(Math.round(rawYears / 5) * 5);

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
type DbImagePairRow = typeof projectImagePairsTable.$inferSelect;
type DbScopeRow = typeof projectScopesTable.$inferSelect;
type DbExternalProductRow = typeof projectExternalProductsTable.$inferSelect;
type DbSiteImagePairRow = typeof siteImagePairsTable.$inferSelect;

/** Generic interface for image pair DB rows (works for both project and site image pairs) */
interface DbImagePairBase {
  beforeImageUrl: string | null;
  beforeAltTextEn: string | null;
  beforeAltTextZh: string | null;
  afterImageUrl: string | null;
  afterAltTextEn: string | null;
  afterAltTextZh: string | null;
  titleEn: string | null;
  titleZh: string | null;
  captionEn: string | null;
  captionZh: string | null;
  photographerCredit: string | null;
  keywords: string | null;
}

/** Convert a DB image pair row to the ImagePair type (generic for project/site) */
function mapDbImagePairRowToImagePair(row: DbImagePairBase): ImagePair {
  const pair: ImagePair = {};

  if (row.beforeImageUrl) {
    pair.beforeImage = {
      src: getAssetUrl(row.beforeImageUrl),
      alt: {
        en: row.beforeAltTextEn ?? '',
        zh: row.beforeAltTextZh ?? '',
      },
    };
  }

  if (row.afterImageUrl) {
    pair.afterImage = {
      src: getAssetUrl(row.afterImageUrl),
      alt: {
        en: row.afterAltTextEn ?? '',
        zh: row.afterAltTextZh ?? '',
      },
    };
  }

  if (row.titleEn || row.titleZh) {
    pair.title = { en: row.titleEn ?? '', zh: row.titleZh ?? '' };
  }

  if (row.captionEn || row.captionZh) {
    pair.caption = { en: row.captionEn ?? '', zh: row.captionZh ?? '' };
  }

  if (row.photographerCredit) {
    pair.photographerCredit = row.photographerCredit;
  }

  if (row.keywords) {
    pair.keywords = row.keywords;
  }

  return pair;
}

function mapDbProjectToProject(
  row: DbProjectRow,
  scopes: DbScopeRow[],
  externalProducts: DbExternalProductRow[] = [],
  imagePairs: DbImagePairRow[] = []
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
    images: [], // Legacy field - kept for type compatibility (removal planned for v2.0)
    image_pairs: sortByDisplayOrder(imagePairs).map(mapDbImagePairRowToImagePair),
    service_scope:
      scopes.length > 0
        ? {
            en: sortByDisplayOrder(scopes).map((s) => s.scopeEn),
            zh: sortByDisplayOrder(scopes).map((s) => s.scopeZh),
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
    external_products:
      externalProducts.length > 0
        ? sortByDisplayOrder(externalProducts).map((ep) => ({
            url: ep.url,
            image_url: ep.imageUrl ? getAssetUrl(ep.imageUrl) : undefined,
            label: { en: ep.labelEn, zh: ep.labelZh },
          }))
        : undefined,
    // Site relationship (mandatory)
    site_id: row.siteId,
    display_order_in_site: row.displayOrderInSite,
  };
}

async function fetchProjectRelations(projectIds: string[]): Promise<{
  imagePairs: DbImagePairRow[];
  scopes: DbScopeRow[];
  externalProducts: DbExternalProductRow[];
}> {
  if (projectIds.length === 0) return { imagePairs: [], scopes: [], externalProducts: [] };
  const [imagePairs, scopes, externalProducts] = await Promise.all([
    db.select().from(projectImagePairsTable).where(inArray(projectImagePairsTable.projectId, projectIds)) as Promise<DbImagePairRow[]>,
    db.select().from(projectScopesTable).where(inArray(projectScopesTable.projectId, projectIds)) as Promise<DbScopeRow[]>,
    db.select().from(projectExternalProductsTable).where(inArray(projectExternalProductsTable.projectId, projectIds)) as Promise<DbExternalProductRow[]>,
  ]);
  return { imagePairs, scopes, externalProducts };
}

/** Fetch all published projects from DB, mapped to `Project[]`. */
export const getProjectsFromDb = cache(async (): Promise<Project[]> => {
  const rows: DbProjectRow[] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.isPublished, true))
    .orderBy(desc(projectsTable.createdAt));

  const ids = rows.map((r: DbProjectRow) => r.id);
  const { imagePairs, scopes, externalProducts } = await fetchProjectRelations(ids);

  // Pre-group relations by projectId for O(1) lookup (avoids O(n*m) filtering)
  const imagePairsByProject = groupBy(imagePairs, (ip: DbImagePairRow) => ip.projectId);
  const scopesByProject = groupBy(scopes, (s: DbScopeRow) => s.projectId);
  const epByProject = groupBy(externalProducts, (ep: DbExternalProductRow) => ep.projectId);

  return rows.map((row: DbProjectRow) =>
    mapDbProjectToProject(
      row,
      scopesByProject.get(row.id) ?? [],
      epByProject.get(row.id) ?? [],
      imagePairsByProject.get(row.id) ?? []
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

    const { imagePairs, scopes, externalProducts } = await fetchProjectRelations([row.id]);
    return mapDbProjectToProject(row, scopes, externalProducts, imagePairs);
  }
);

/** Fetch all projects including unpublished (for admin). */
export async function getAllProjectsAdmin() {
  const rows: DbProjectRow[] = await db
    .select()
    .from(projectsTable)
    .orderBy(desc(projectsTable.createdAt));

  const ids = rows.map((r: DbProjectRow) => r.id);
  const { imagePairs, scopes, externalProducts } = await fetchProjectRelations(ids);

  // Pre-group relations by projectId for O(1) lookup (avoids O(n*m) filtering)
  const imagePairsByProject = groupBy(imagePairs, (ip: DbImagePairRow) => ip.projectId);
  const scopesByProject = groupBy(scopes, (s: DbScopeRow) => s.projectId);
  const epByProject = groupBy(externalProducts, (ep: DbExternalProductRow) => ep.projectId);

  return rows.map((row: DbProjectRow) => ({
    ...row,
    imagePairs: sortByDisplayOrder(imagePairsByProject.get(row.id) ?? []),
    scopes: sortByDisplayOrder(scopesByProject.get(row.id) ?? []),
    externalProducts: sortByDisplayOrder(epByProject.get(row.id) ?? []),
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
// SITE QUERIES
// ============================================================================

type DbSiteRow = typeof sitesTable.$inferSelect;

function mapDbSiteToSite(row: DbSiteRow, siteImagePairRows?: DbSiteImagePairRow[]): Site {
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
    excerpt:
      row.excerptEn || row.excerptZh
        ? { en: row.excerptEn ?? '', zh: row.excerptZh ?? '' }
        : undefined,
    meta_title:
      row.metaTitleEn || row.metaTitleZh
        ? { en: row.metaTitleEn ?? '', zh: row.metaTitleZh ?? '' }
        : undefined,
    meta_description:
      row.metaDescriptionEn || row.metaDescriptionZh
        ? { en: row.metaDescriptionEn ?? '', zh: row.metaDescriptionZh ?? '' }
        : undefined,
    focus_keyword:
      row.focusKeywordEn || row.focusKeywordZh
        ? { en: row.focusKeywordEn ?? '', zh: row.focusKeywordZh ?? '' }
        : undefined,
    seo_keywords:
      row.seoKeywordsEn || row.seoKeywordsZh
        ? { en: row.seoKeywordsEn ?? '', zh: row.seoKeywordsZh ?? '' }
        : undefined,
    show_as_project: row.showAsProject,
    featured: row.featured,
    published_at: row.publishedAt ?? undefined,
    images: undefined, // Legacy field - kept for type compatibility, always empty
    image_pairs: siteImagePairRows && siteImagePairRows.length > 0
      ? sortByDisplayOrder(siteImagePairRows).map(mapDbImagePairRowToImagePair)
      : undefined,
  };
}

/** Fetch all published sites (listing only — omits site images for performance). */
export const getSitesFromDb = cache(async (): Promise<Site[]> => {
  const rows = await db
    .select()
    .from(sitesTable)
    .where(eq(sitesTable.isPublished, true))
    .orderBy(desc(sitesTable.createdAt));

  return rows.map(mapDbSiteToSite);
});

/** Fetch projects for a given site ID. */
export const getProjectsOfSite = cache(async (siteId: string): Promise<Project[]> => {
  const rows: DbProjectRow[] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.siteId, siteId), eq(projectsTable.isPublished, true)))
    .orderBy(asc(projectsTable.displayOrderInSite));

  if (rows.length === 0) return [];

  const ids = rows.map((r: DbProjectRow) => r.id);
  const { imagePairs, scopes, externalProducts } = await fetchProjectRelations(ids);

  // Pre-group relations by projectId for O(1) lookup (avoids O(n*m) filtering)
  const imagePairsByProject = groupBy(imagePairs, (ip: DbImagePairRow) => ip.projectId);
  const scopesByProject = groupBy(scopes, (s: DbScopeRow) => s.projectId);
  const epByProject = groupBy(externalProducts, (ep: DbExternalProductRow) => ep.projectId);

  return rows.map((row: DbProjectRow) =>
    mapDbProjectToProject(
      row,
      scopesByProject.get(row.id) ?? [],
      epByProject.get(row.id) ?? [],
      imagePairsByProject.get(row.id) ?? []
    )
  );
});

/** Fetch a site by slug with its projects and aggregated data. */
export const getSiteBySlugFromDb = cache(
  async (slug: string): Promise<SiteWithProjects | null> => {
    const rows = await db
      .select()
      .from(sitesTable)
      .where(and(eq(sitesTable.slug, slug), eq(sitesTable.isPublished, true)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    // Fetch site image pairs and projects in parallel
    const [siteImagePairRows, projects] = await Promise.all([
      db.select().from(siteImagePairsTable).where(eq(siteImagePairsTable.siteId, row.id)) as Promise<DbSiteImagePairRow[]>,
      getProjectsOfSite(row.id),
    ]);

    const site = mapDbSiteToSite(row, siteImagePairRows);

    // Build aggregated data
    const aggregated: SiteWithProjects['aggregated'] = {
      totalBudget: calculateCombinedBudget(projects),
      totalDuration: aggregateDurations(projects),
      allServiceScopes: mergeServiceScopes(projects),
      allImages: collectAllImages(projects, site),
      allExternalProducts: collectAllExternalProducts(projects),
    };

    return {
      ...site,
      projects,
      aggregated,
    };
  }
);

/** Fetch all published sites that should show as projects, with projects and aggregated data. */
export const getSitesAsProjectsFromDb = cache(async (): Promise<SiteWithProjects[]> => {
  const rows = await db
    .select()
    .from(sitesTable)
    .where(and(eq(sitesTable.isPublished, true), eq(sitesTable.showAsProject, true)))
    .orderBy(desc(sitesTable.createdAt));

  const siteIds = rows.map((r: DbSiteRow) => r.id);
  if (siteIds.length === 0) return [];

  // Fetch all site image pairs and all projects for these sites in parallel (avoids N+1)
  const [allSiteImagePairs, allProjects] = await Promise.all([
    db.select().from(siteImagePairsTable).where(inArray(siteImagePairsTable.siteId, siteIds)) as Promise<DbSiteImagePairRow[]>,
    db
      .select()
      .from(projectsTable)
      .where(and(inArray(projectsTable.siteId, siteIds), eq(projectsTable.isPublished, true)))
      .orderBy(asc(projectsTable.displayOrderInSite)) as Promise<DbProjectRow[]>,
  ]);

  // Fetch relations for all projects in one batch
  const projectIds = allProjects.map((p: DbProjectRow) => p.id);
  const { imagePairs: allProjectImagePairs, scopes: allScopes, externalProducts: allExternalProducts } = await fetchProjectRelations(projectIds);

  // Pre-group relations by projectId for O(1) lookup (avoids O(n*m) filtering)
  const imagePairsByProject = groupBy(allProjectImagePairs, (ip: DbImagePairRow) => ip.projectId);
  const scopesByProject = groupBy(allScopes, (s: DbScopeRow) => s.projectId);
  const epByProject = groupBy(allExternalProducts, (ep: DbExternalProductRow) => ep.projectId);
  const siteImagePairsBySite = groupBy(allSiteImagePairs, (ip: DbSiteImagePairRow) => ip.siteId);

  // Group projects by siteId for efficient lookup
  const projectsBySite = new Map<string, Project[]>();
  for (const row of allProjects) {
    const project = mapDbProjectToProject(
      row,
      scopesByProject.get(row.id) ?? [],
      epByProject.get(row.id) ?? [],
      imagePairsByProject.get(row.id) ?? []
    );
    const arr = projectsBySite.get(row.siteId) ?? [];
    arr.push(project);
    projectsBySite.set(row.siteId, arr);
  }

  // Build results
  const results: SiteWithProjects[] = [];
  for (const row of rows) {
    const rowImagePairs = siteImagePairsBySite.get(row.id) ?? [];
    const site = mapDbSiteToSite(row, rowImagePairs);
    const projects = projectsBySite.get(row.id) ?? [];

    const aggregated: SiteWithProjects['aggregated'] = {
      totalBudget: calculateCombinedBudget(projects),
      totalDuration: aggregateDurations(projects),
      allServiceScopes: mergeServiceScopes(projects),
      allImages: collectAllImages(projects, site),
      allExternalProducts: collectAllExternalProducts(projects),
    };

    results.push({
      ...site,
      project_count: projects.length,
      projects,
      aggregated,
    });
  }

  return results;
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

/** Default number of blog posts per page */
export const BLOG_POSTS_PER_PAGE = 10;

/** Result of paginated blog posts query */
export interface PaginatedBlogPosts {
  posts: BlogPost[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

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
    updated_at: row.updatedAt ?? undefined,
  }));
});

/** Fetch paginated published blog posts ordered by publishedAt desc. */
export const getBlogPostsPaginatedFromDb = cache(
  async (page: number = 1, perPage: number = BLOG_POSTS_PER_PAGE): Promise<PaginatedBlogPosts> => {
    // Get total count using SQL COUNT for efficiency
    const countResult = await db
      .select({ value: count() })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.isPublished, true));

    const totalCount = countResult[0]?.value ?? 0;
    const totalPages = Math.ceil(totalCount / perPage);
    const currentPage = Math.max(1, Math.min(page, totalPages || 1));
    const offset = (currentPage - 1) * perPage;

    const rows = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.isPublished, true))
      .orderBy(desc(blogPostsTable.publishedAt))
      .limit(perPage)
      .offset(offset);

    const posts = rows.map((row: typeof blogPostsTable.$inferSelect) => ({
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
      updated_at: row.updatedAt ?? undefined,
    }));

    return { posts, totalCount, totalPages, currentPage };
  }
);

/** Fetch a single published blog post by slug, with related project if linked. */
export const getBlogPostBySlugFromDb = cache(
  async (slug: string): Promise<BlogPost | null> => {
    const rows = await db
      .select()
      .from(blogPostsTable)
      .where(and(eq(blogPostsTable.slug, slug), eq(blogPostsTable.isPublished, true)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    // Fetch related project and external products if projectId is set
    let relatedProject: BlogRelatedProject | undefined;
    if (row.projectId) {
      const projectRows = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, row.projectId))
        .limit(1);

      const project = projectRows[0];
      if (project) {
        const externalProducts: DbExternalProductRow[] = await db
          .select()
          .from(projectExternalProductsTable)
          .where(eq(projectExternalProductsTable.projectId, project.id))
          .orderBy(asc(projectExternalProductsTable.displayOrder));

        relatedProject = {
          slug: project.slug,
          title: { en: project.titleEn, zh: project.titleZh },
          hero_image: project.heroImageUrl ? getAssetUrl(project.heroImageUrl) : undefined,
          external_products:
            externalProducts.length > 0
              ? externalProducts.map((ep) => ({
                  url: ep.url,
                  image_url: ep.imageUrl ? getAssetUrl(ep.imageUrl) : undefined,
                  label: { en: ep.labelEn, zh: ep.labelZh },
                }))
              : undefined,
        };
      }
    }

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
      updated_at: row.updatedAt ?? undefined,
      related_project: relatedProject,
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

/** Fetch all sites (admin — includes unpublished). */
export async function getAllSitesAdmin(): Promise<(typeof sitesTable.$inferSelect & { siteImagePairs: DbSiteImagePairRow[] })[]> {
  const rows: DbSiteRow[] = await db.select().from(sitesTable).orderBy(desc(sitesTable.createdAt));
  const siteIds = rows.map((r: DbSiteRow) => r.id);
  const allImagePairs: DbSiteImagePairRow[] = siteIds.length > 0
    ? await db.select().from(siteImagePairsTable).where(inArray(siteImagePairsTable.siteId, siteIds))
    : [];

  // Pre-group image pairs by siteId for O(1) lookup
  const imagePairsBySite = groupBy(allImagePairs, (ip: DbSiteImagePairRow) => ip.siteId);

  return rows.map((row: DbSiteRow) => ({
    ...row,
    siteImagePairs: sortByDisplayOrder(imagePairsBySite.get(row.id) ?? []),
  }));
}

export interface ProjectSummary {
  id: string;
  slug: string;
  siteId: string;
  titleEn: string;
  titleZh: string;
  serviceType: string;
  isPublished: boolean;
  displayOrderInSite: number;
}

/** Fetch all projects grouped by siteId for the sites list (admin). Lightweight — no images/scopes. */
export async function getAllProjectsBySiteAdmin(): Promise<Record<string, ProjectSummary[]>> {
  const rows = await db
    .select({
      id: projectsTable.id,
      slug: projectsTable.slug,
      siteId: projectsTable.siteId,
      titleEn: projectsTable.titleEn,
      titleZh: projectsTable.titleZh,
      serviceType: projectsTable.serviceType,
      isPublished: projectsTable.isPublished,
      displayOrderInSite: projectsTable.displayOrderInSite,
    })
    .from(projectsTable)
    .orderBy(asc(projectsTable.displayOrderInSite));

  const bySite = new Map<string, typeof rows>();
  for (const row of rows) {
    const arr = bySite.get(row.siteId) ?? [];
    arr.push(row);
    bySite.set(row.siteId, arr);
  }
  return Object.fromEntries(bySite);
}

/** Fetch all projects for a site with image pairs and scopes (admin). */
export async function getProjectsWithDetailsBySite(siteId: string) {
  const rows: DbProjectRow[] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.siteId, siteId))
    .orderBy(asc(projectsTable.displayOrderInSite));

  if (rows.length === 0) return [];

  const ids = rows.map((r: DbProjectRow) => r.id);
  const { imagePairs, scopes, externalProducts } = await fetchProjectRelations(ids);

  // Build Maps for O(1) lookup per project
  const imagePairsByProject = new Map<string, DbImagePairRow[]>();
  for (const ip of imagePairs) {
    const arr = imagePairsByProject.get(ip.projectId) ?? [];
    arr.push(ip);
    imagePairsByProject.set(ip.projectId, arr);
  }
  const scopesByProject = new Map<string, DbScopeRow[]>();
  for (const s of scopes) {
    const arr = scopesByProject.get(s.projectId) ?? [];
    arr.push(s);
    scopesByProject.set(s.projectId, arr);
  }
  const epByProject = new Map<string, DbExternalProductRow[]>();
  for (const ep of externalProducts) {
    const arr = epByProject.get(ep.projectId) ?? [];
    arr.push(ep);
    epByProject.set(ep.projectId, arr);
  }

  return rows.map((row: DbProjectRow) => ({
    ...row,
    imagePairs: sortByDisplayOrder(imagePairsByProject.get(row.id) ?? []),
    scopes: sortByDisplayOrder(scopesByProject.get(row.id) ?? []),
    externalProducts: sortByDisplayOrder(epByProject.get(row.id) ?? []),
  }));
}

/** Get project by ID with image pairs and scopes (admin). */
export async function getProjectByIdAdmin(id: string) {
  const rows = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const { imagePairs, scopes, externalProducts } = await fetchProjectRelations([row.id]);

  return {
    ...row,
    imagePairs: sortByDisplayOrder(imagePairs),
    scopes: sortByDisplayOrder(scopes),
    externalProducts: sortByDisplayOrder(externalProducts),
  };
}

// ============================================================================
// PARTNER QUERIES
// ============================================================================

/** Fetch active partners ordered by display_order. */
export const getPartnersFromDb = cache(async (): Promise<Partner[]> => {
  const rows = await db
    .select()
    .from(partnersTable)
    .where(eq(partnersTable.isActive, true))
    .orderBy(asc(partnersTable.displayOrder));

  return rows.map((row: typeof partnersTable.$inferSelect) => ({
    name: { en: row.nameEn, zh: row.nameZh },
    logo: getAssetUrl(row.logoUrl),
    url: row.websiteUrl ?? undefined,
    isHiddenVisually: row.isHiddenVisually,
  }));
});

/** Fetch all partners (admin — includes inactive). */
export async function getAllPartnersAdmin(): Promise<(typeof partnersTable.$inferSelect)[]> {
  return db.select().from(partnersTable).orderBy(asc(partnersTable.displayOrder));
}
