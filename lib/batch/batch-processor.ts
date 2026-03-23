import { db } from '@/lib/db';
import {
  batchUploadJobs,
  projectSites,
  siteImagePairs,
  projects,
  projectImagePairs,
  projectScopes,
  projectExternalProducts,
} from '@/lib/db/schema';
import type { BatchJobStatus } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  optimizeSiteDescription,
  optimizeProjectDescription,
} from '@/lib/ai/content-optimizer';
import type { SiteDescription, ProjectDescription } from '@/lib/ai/content-optimizer';
import { ensureUniqueSlug, formatSlug } from '@/lib/utils';
import { SERVICE_SCOPES, ALL_SCOPES, SCOPE_EN_TO_ZH, SCOPE_ZH_TO_EN, SPACE_TYPE_TO_ZH } from '@/lib/admin/constants';
import type {
  ParsedExternalProduct,
  BatchError,
} from './types';

// ============================================================================
// JOB STATUS HELPERS
// ============================================================================

export async function updateJob(
  jobId: string,
  data: Partial<{
    status: BatchJobStatus;
    currentStepLabel: string;
    processedImages: number;
    totalImages: number;
    createdSiteIds: string[];
    createdProjectIds: string[];
    createdBlogPostIds: string[];
    errors: string[];
    startedAt: Date;
    completedAt: Date;
  }>
) {
  await db.update(batchUploadJobs).set(data).where(eq(batchUploadJobs.id, jobId));
}

// ============================================================================
// AI METADATA GENERATION
// ============================================================================

export async function generateSiteMetadata(
  folderName: string,
  notes: string | null
): Promise<SiteDescription | null> {
  try {
    // When notes exist, rely on notes content for all details. Folder names
    // can be internal codes and should NOT influence the AI output.
    const prompt = notes
      ? `Whole house renovation project.\n\nProject details:\n${notes}`
      : `Whole house renovation project: ${folderName}. This is a renovation site.`;
    return await optimizeSiteDescription(prompt);
  } catch (error) {
    console.error(`[Batch AI] generateSiteMetadata FAILED for "${folderName}":`, error instanceof Error ? error.message : error);
    return null;
  }
}

export async function generateProjectMetadata(
  folderName: string,
  serviceType: string | null,
  notes: string | null,
  serviceTypeMap: Record<string, { en: string; zh: string }>,
  /** Skip folder name in prompt — root folders can be internal codes like "1171-van" */
  skipFolderName = false,
  /** ZIP filename hint (e.g., "2828-van") for PO number / location context */
  zipBaseName?: string
): Promise<ProjectDescription | null> {
  try {
    const category = serviceType ? (serviceTypeMap[serviceType] ?? { en: serviceType, zh: serviceType }) : null;
    // When notes exist and skipFolderName is set, rely only on notes content.
    // Sub-folder names like "Kitchen" are still useful context so we keep them.
    const folderContext = skipFolderName ? '' : `: ${folderName}`;
    // Build context hint from zip filename (PO number)
    const hintsBlock = zipBaseName ? `\nReference/PO number: ${zipBaseName}\n` : '';
    const prompt = notes
      ? `Renovation project${folderContext}.${hintsBlock}\nProject details:\n${notes}`
      : `${category ? category.en : 'Renovation'} project${folderContext}.${hintsBlock}${category ? `\nService type: ${category.en}.` : ''}`;
    // Pass scopes for the service type, or ALL (deduplicated) scopes if type unknown
    const scopes = serviceType
      ? (SERVICE_SCOPES[serviceType] ?? [])
      : ALL_SCOPES;
    const availableTypes = Object.keys(serviceTypeMap);
    const result = await optimizeProjectDescription(prompt, scopes, availableTypes);
    if (result.corrections && result.corrections.length > 0) {
      console.warn(`[Batch AI] Corrections for "${folderName}":`, result.corrections.join(' | '));
    }
    return result;
  } catch (error) {
    console.error(`[Batch AI] generateProjectMetadata failed for "${folderName}":`, error instanceof Error ? error.message : error);
    return null;
  }
}

// ============================================================================
// EXTERNAL PRODUCTS PARSING
// ============================================================================

/**
 * Validate a URL using the same logic as admin form validation.
 * Returns true for valid http/https URLs.
 */
export function isValidProductUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Parse a products.txt file into external product entries.
 * Format: one product per line, pipe-separated:
 *   URL | Label EN | Label ZH (optional)
 * Lines starting with # are comments. Blank lines are skipped.
 */
export function parseProductsFile(text: string): ParsedExternalProduct[] {
  const products: ParsedExternalProduct[] = [];
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    // Split on first two pipes only (URL may contain pipes in query strings)
    const firstPipe = line.indexOf('|');
    const url = (firstPipe === -1 ? line : line.slice(0, firstPipe)).trim();
    if (!url || !isValidProductUrl(url)) continue;
    let labelEn = '';
    let labelZh = '';
    if (firstPipe !== -1) {
      const rest = line.slice(firstPipe + 1);
      const secondPipe = rest.indexOf('|');
      labelEn = (secondPipe === -1 ? rest : rest.slice(0, secondPipe)).trim();
      if (secondPipe !== -1) {
        labelZh = rest.slice(secondPipe + 1).trim();
      }
    }
    if (!labelEn) labelEn = url.split('/').pop()?.replace(/[-_]/g, ' ') || 'Product';
    if (!labelZh) labelZh = labelEn;
    products.push({ url, imageUrl: null, labelEn, labelZh });
  }
  return products;
}

/** Push a warning about unsupported image formats (HEIC, TIFF, etc.) that were skipped. */
export function pushSkippedFilesWarning(skippedFiles: string[], errors: BatchError[]): void {
  if (skippedFiles.length === 0) return;
  const MAX_LISTED = 10;
  const listed = skippedFiles.slice(0, MAX_LISTED).map((f) => f.split('/').pop()).join(', ');
  const suffix = skippedFiles.length > MAX_LISTED ? ` and ${skippedFiles.length - MAX_LISTED} more` : '';
  errors.push({
    message: `${skippedFiles.length} unsupported image(s) skipped (HEIC/TIFF not supported by browsers): ${listed}${suffix}`,
    severity: 'warning',
  });
}

// ============================================================================
// FALLBACK METADATA
// ============================================================================

/**
 * Ensure the label includes an action word (Renovation/装修).
 * DB service labels already contain it (e.g., "Kitchen Renovation", "厨房装修"),
 * but synthetic labels (e.g., "Whole House", "全屋") do not.
 */
export function ensureActionSuffix(label: string, zh = false): string {
  if (zh) return /装修|翻新|改造/.test(label) ? label : `${label}装修`;
  return /\b(renovation|refacing|remodel)\b/i.test(label) ? label : `${label} Renovation`;
}

/**
 * Build shared fallback SEO fields.
 * Callers must pass pre-computed `fullEn`/`fullZh` (via `ensureActionSuffix`)
 * so the suffix logic runs once per call site instead of being duplicated.
 */
function buildFallbackSeo(fullEn: string, fullZh: string) {
  return {
    slug: formatSlug(fullEn),
    locationCity: '',
    poNumber: '',
    budgetRange: '',
    durationEn: '',
    durationZh: '',
    badgeEn: fullEn,
    badgeZh: fullZh,
    excerptEn: `${fullEn} project.`,
    excerptZh: `${fullZh}项目。`,
    metaTitleEn: `${fullEn} | Reno Stars`,
    metaTitleZh: `${fullZh} | Reno Stars`,
    metaDescriptionEn: `${fullEn} project.`,
    metaDescriptionZh: `${fullZh}项目。`,
    focusKeywordEn: fullEn.toLowerCase(),
    focusKeywordZh: fullZh,
    seoKeywordsEn: `${fullEn.toLowerCase()}, renovation`,
    seoKeywordsZh: `${fullZh}, 装修`,
  };
}

export function fallbackSiteData(folderName: string) {
  const fullEn = ensureActionSuffix('Whole House');
  const fullZh = ensureActionSuffix('全屋', true);
  return {
    ...buildFallbackSeo(fullEn, fullZh),
    titleEn: folderName,
    titleZh: folderName,
    descriptionEn: `Whole house renovation project.`,
    descriptionZh: `全屋装修项目。`,
    spaceTypeEn: 'House' as const,
  };
}

export function fallbackProjectData(
  serviceType: string | null,
  serviceTypeMap: Record<string, { en: string; zh: string }>
) {
  const validType = serviceType && serviceTypeMap[serviceType] ? serviceType : null;
  const category = validType ? serviceTypeMap[validType] : { en: 'Renovation', zh: '装修' };
  const fullEn = ensureActionSuffix(category.en);
  const fullZh = ensureActionSuffix(category.zh, true);
  return {
    ...buildFallbackSeo(fullEn, fullZh),
    serviceType: validType,
    titleEn: fullEn,
    titleZh: fullZh,
    descriptionEn: `Professional ${fullEn.toLowerCase()} project by Reno Stars.`,
    descriptionZh: `Reno Stars专业${fullZh}项目。`,
    challengeEn: '',
    challengeZh: '',
    solutionEn: '',
    solutionZh: '',
    spaceTypeEn: 'House' as const,
  };
}

// ============================================================================
// DB HELPERS
// ============================================================================

export async function getExistingSlugs(
  table: 'sites' | 'projects'
): Promise<string[]> {
  if (table === 'sites') {
    const rows = await db.select({ slug: projectSites.slug }).from(projectSites);
    return rows.map((r: { slug: string }) => r.slug);
  }
  const rows = await db.select({ slug: projects.slug }).from(projects);
  return rows.map((r: { slug: string }) => r.slug);
}

/** Delete orphaned site (no child projects or site image pairs) on failure.
 * Note: siteExternalProducts are not checked separately — they CASCADE delete with the site. */
export async function cleanupOrphanedSite(siteId: string): Promise<void> {
  try {
    const childProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.siteId, siteId))
      .limit(1);
    if (childProjects.length > 0) return;

    const childPairs = await db
      .select({ id: siteImagePairs.id })
      .from(siteImagePairs)
      .where(eq(siteImagePairs.siteId, siteId))
      .limit(1);
    if (childPairs.length > 0) return;

    await db.delete(projectSites).where(eq(projectSites.id, siteId));
  } catch {
    // Non-critical cleanup
  }
}

// ============================================================================
// PROJECT SAVE (uses pre-uploaded URLs from client-orchestrated flow)
// ============================================================================

/** Input for saving a project from client-orchestrated flow (URLs already resolved) */
export interface SaveProjectInput {
  folderName: string;
  serviceType: string | null;
  heroImageUrl: string | null;
  imagePairs: { index: number; beforeUrl: string | null; afterUrl: string | null }[];
  notes: string | null;
  productsText: string | null;
  /** Product images keyed by 1-based index, values are uploaded URLs */
  productImageUrls: Record<number, string>;
}

/**
 * Save a project to DB using pre-uploaded URLs (client-orchestrated flow).
 * Returns the inserted project ID.
 */
export async function saveProjectFromUrls(opts: {
  project: SaveProjectInput;
  aiProject: ProjectDescription | null;
  siteId: string;
  displayOrder: number;
  existingProjectSlugs: string[];
  errors: BatchError[];
  serviceTypeMap: Record<string, { en: string; zh: string }>;
  zipBaseName?: string;
}): Promise<string> {
  const {
    project, aiProject, siteId, displayOrder,
    existingProjectSlugs, errors, serviceTypeMap, zipBaseName,
  } = opts;

  const projectData = aiProject ?? fallbackProjectData(project.serviceType, serviceTypeMap);

  const projectSlug = ensureUniqueSlug(
    formatSlug(projectData.slug || project.folderName),
    existingProjectSlugs
  );
  existingProjectSlugs.push(projectSlug);

  const serviceType = aiProject
    ? (aiProject.serviceType || null)
    : project.serviceType;
  const category = serviceType
    ? (serviceTypeMap[serviceType] ?? { en: serviceType, zh: serviceType })
    : null;

  const [insertedProject] = await db
    .insert(projects)
    .values({
      slug: projectSlug,
      titleEn: projectData.titleEn,
      titleZh: projectData.titleZh,
      descriptionEn: projectData.descriptionEn,
      descriptionZh: projectData.descriptionZh,
      serviceType: serviceType || null,
      categoryEn: category?.en ?? null,
      categoryZh: category?.zh ?? null,
      locationCity: projectData.locationCity || null,
      budgetRange: projectData.budgetRange || null,
      durationEn: projectData.durationEn || null,
      durationZh: projectData.durationZh || null,
      spaceTypeEn: projectData.spaceTypeEn || null,
      spaceTypeZh: (projectData.spaceTypeEn && SPACE_TYPE_TO_ZH[projectData.spaceTypeEn]) || null,
      heroImageUrl: project.heroImageUrl,
      challengeEn: projectData.challengeEn || null,
      challengeZh: projectData.challengeZh || null,
      solutionEn: projectData.solutionEn || null,
      solutionZh: projectData.solutionZh || null,
      badgeEn: projectData.badgeEn || null,
      badgeZh: projectData.badgeZh || null,
      excerptEn: projectData.excerptEn || null,
      excerptZh: projectData.excerptZh || null,
      metaTitleEn: projectData.metaTitleEn || null,
      metaTitleZh: projectData.metaTitleZh || null,
      metaDescriptionEn: projectData.metaDescriptionEn || null,
      metaDescriptionZh: projectData.metaDescriptionZh || null,
      focusKeywordEn: projectData.focusKeywordEn || null,
      focusKeywordZh: projectData.focusKeywordZh || null,
      seoKeywordsEn: projectData.seoKeywordsEn || null,
      seoKeywordsZh: projectData.seoKeywordsZh || null,
      poNumber: projectData.poNumber || zipBaseName || null,
      siteId,
      displayOrderInSite: displayOrder,
      featured: false,
      isPublished: false,
    })
    .returning({ id: projects.id });

  const projectId = insertedProject.id;

  // Insert service scopes
  const resolvedType = serviceType ?? project.serviceType;
  const typeScopes = resolvedType ? (SERVICE_SCOPES[resolvedType] ?? []) : [];
  const aiSelected = aiProject?.selectedScopes ?? [];

  let scopesToInsert: { en: string; zh: string }[];
  if (aiSelected.length > 0) {
    // Use shared lookup so AI-selected names resolve across all service types
    // Supports both EN names and ZH names (AI may return either from Chinese notes)
    scopesToInsert = aiSelected
      .map((name) => {
        if (SCOPE_EN_TO_ZH.has(name)) return { en: name, zh: SCOPE_EN_TO_ZH.get(name)! };
        if (SCOPE_ZH_TO_EN.has(name)) { const en = SCOPE_ZH_TO_EN.get(name)!; return { en, zh: SCOPE_EN_TO_ZH.get(en)! }; }
        return null;
      })
      .filter((s): s is { en: string; zh: string } => s !== null);
    // If all AI-selected names were invalid, fall back to all scopes for this type
    if (scopesToInsert.length === 0) scopesToInsert = typeScopes;
  } else {
    scopesToInsert = typeScopes;
  }

  if (scopesToInsert.length > 0) {
    try {
      await db.insert(projectScopes).values(
        scopesToInsert.map((scope, idx) => ({
          projectId,
          scopeEn: scope.en,
          scopeZh: scope.zh,
          displayOrder: idx,
        }))
      );
    } catch (error) {
      errors.push({
        message: `Scopes for "${project.folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'warning',
      });
    }
  }

  // Insert external products from products.txt
  if (project.productsText) {
    const products = parseProductsFile(project.productsText);
    if (products.length > 0) {
      try {
        await db.insert(projectExternalProducts).values(
          products.map((ep, idx) => ({
            projectId,
            url: ep.url,
            imageUrl: project.productImageUrls[idx + 1] ?? ep.imageUrl,
            labelEn: ep.labelEn,
            labelZh: ep.labelZh,
            displayOrder: idx,
          }))
        );
      } catch (error) {
        errors.push({
          message: `External products for "${project.folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'warning',
        });
      }
    }
  }

  // Insert image pairs (batched)
  const pairValues = project.imagePairs
    .map((pair, pairIdx) => {
      if (!pair.beforeUrl && !pair.afterUrl) return null;
      return {
        projectId,
        beforeImageUrl: pair.beforeUrl,
        beforeAltTextEn: pair.beforeUrl ? `${projectData.titleEn} - Before ${pairIdx + 1}` : null,
        beforeAltTextZh: pair.beforeUrl ? `${projectData.titleZh} - 改造前 ${pairIdx + 1}` : null,
        afterImageUrl: pair.afterUrl,
        afterAltTextEn: pair.afterUrl ? `${projectData.titleEn} - After ${pairIdx + 1}` : null,
        afterAltTextZh: pair.afterUrl ? `${projectData.titleZh} - 改造后 ${pairIdx + 1}` : null,
        displayOrder: pairIdx,
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  if (pairValues.length > 0) {
    try {
      await db.insert(projectImagePairs).values(pairValues);
    } catch (error) {
      errors.push({
        message: `Image pairs for "${project.folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'warning',
      });
    }
  }

  return projectId;
}
