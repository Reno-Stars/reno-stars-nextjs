import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { db } from '@/lib/db';
import {
  batchUploadJobs,
  projectSites,
  siteImagePairs,
  siteExternalProducts,
  projects,
  projectImagePairs,
  projectScopes,
  projectExternalProducts,
} from '@/lib/db/schema';
import type { BatchJobStatus, BatchJobOptions } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getS3Client, S3_BUCKET } from '@/lib/admin/s3';
import {
  optimizeSiteDescription,
  optimizeProjectDescription,
} from '@/lib/ai/content-optimizer';
import type { SiteDescription, ProjectDescription } from '@/lib/ai/content-optimizer';
import { generateBlogFromSite, generateBlogFromProject } from '@/app/actions/admin/generate-blog';
import { ensureUniqueSlug, formatSlug } from '@/lib/utils';
import { ensureStandaloneSite } from '@/lib/db/queries';
import { SERVICE_TYPE_TO_CATEGORY, SERVICE_SCOPES, SPACE_TYPE_TO_ZH } from '@/lib/admin/constants';
import type { ServiceTypeKey } from '@/lib/admin/constants';
import { parseZip, parseZipStandalone } from './zip-parser';
import {
  batchZipKey,
  type ParsedZipStructure,
  type ParsedStandaloneStructure,
  type ParsedProject,
  type ParsedExternalProduct,
  type ExtractedImage,
  type BatchError,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Max concurrent S3 uploads per batch */
const UPLOAD_BATCH_SIZE = 15;

/** Max concurrent AI metadata calls */
const AI_METADATA_BATCH_SIZE = 10;

/** Fallback alt text when AI generation fails */
const FALLBACK_ALT = { en: 'Renovation project image', zh: '装修项目图片' } as const;

// ============================================================================
// JOB STATUS HELPERS
// ============================================================================

async function updateJob(
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
// S3 UPLOAD
// ============================================================================

/** Total attempts per image upload (1 initial + retries) */
const UPLOAD_MAX_ATTEMPTS = 3;
const UPLOAD_RETRY_BASE_MS = 500;

async function uploadImageToS3(
  image: ExtractedImage,
  keyPrefix: string,
  client: import('@aws-sdk/client-s3').S3Client,
  publicUrl: string
): Promise<string> {
  const ext = image.path.split('.').pop()?.toLowerCase() || 'jpg';
  const ts = Date.now().toString(36);
  const key = `uploads/admin/${keyPrefix}-${ts}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: image.data,
    ContentType: image.mimeType,
  });

  for (let attempt = 0; attempt < UPLOAD_MAX_ATTEMPTS; attempt++) {
    try {
      await client.send(command);
      return `${publicUrl}/${key}`;
    } catch (err) {
      if (attempt === UPLOAD_MAX_ATTEMPTS - 1) throw err;
      // Retry on transient SSL/network errors
      const msg = err instanceof Error ? err.message : '';
      const isTransient =
        msg.includes('ssl') ||
        msg.includes('SSL') ||
        msg.includes('ECONNRESET') ||
        msg.includes('socket hang up') ||
        msg.includes('ETIMEDOUT');
      if (!isTransient) throw err;
      await new Promise((r) => setTimeout(r, UPLOAD_RETRY_BASE_MS * 2 ** attempt));
    }
  }

  throw new Error('Unreachable');
}

/**
 * Upload images to S3 in parallel batches (max UPLOAD_BATCH_SIZE concurrent).
 * Returns a map of ExtractedImage → uploaded URL.
 */
async function uploadAllImages(opts: {
  images: ExtractedImage[];
  slugPrefix: string;
  jobId: string;
  startCount: number;
  totalImages: number;
  errors: BatchError[];
  s3Client: import('@aws-sdk/client-s3').S3Client;
  s3PublicUrl: string;
}): Promise<Map<ExtractedImage, string>> {
  const { images, slugPrefix, jobId, startCount, totalImages, errors, s3Client, s3PublicUrl } = opts;
  const urlMap = new Map<ExtractedImage, string>();
  let processed = startCount;

  for (let i = 0; i < images.length; i += UPLOAD_BATCH_SIZE) {
    const batch = images.slice(i, i + UPLOAD_BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((img, batchIdx) => {
        const idx = i + batchIdx;
        const basename = img.path.split('/').pop()?.replace(/\.[^.]+$/, '') || `img-${idx}`;
        const safeBasename = basename.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
        return uploadImageToS3(img, `${slugPrefix}-${safeBasename}`, s3Client, s3PublicUrl);
      })
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === 'fulfilled') {
        urlMap.set(batch[j], result.value);
      } else {
        errors.push({ message: `Upload failed: ${batch[j].path} - ${result.reason}`, severity: 'warning' });
      }
    }

    processed += batch.length;
    await updateJob(jobId, { processedImages: processed });
  }

  return urlMap;
}

// ============================================================================
// AI METADATA GENERATION
// ============================================================================

async function generateSiteMetadata(
  folderName: string,
  notes: string | null
): Promise<SiteDescription | null> {
  try {
    const prompt = notes
      ? `Whole house renovation project: ${folderName}.\n\nProject details:\n${notes}`
      : `Whole house renovation project: ${folderName}. This is a renovation site.`;
    return await optimizeSiteDescription(prompt);
  } catch {
    return null;
  }
}

async function generateProjectMetadata(
  folderName: string,
  serviceType: ServiceTypeKey,
  notes: string | null
): Promise<ProjectDescription | null> {
  try {
    const category = SERVICE_TYPE_TO_CATEGORY[serviceType];
    // When notes exist, let AI detect the service type from the notes content
    // (folder names like "3787-burnaby" don't indicate the service type).
    // Only include the folder-detected service type when there are no notes.
    const prompt = notes
      ? `Renovation project: ${folderName}.\n\nProject details:\n${notes}`
      : `${category.en} renovation project: ${folderName}. Service type: ${category.en}.`;
    // Pass all scopes for the detected service type so AI can select relevant ones
    const scopes = SERVICE_SCOPES[serviceType] ?? [];
    return await optimizeProjectDescription(prompt, scopes);
  } catch {
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

// ============================================================================
// EXTERNAL PRODUCTS DB INSERTION
// ============================================================================

/**
 * Insert external products parsed from products.txt into the database.
 * Matches product-N images (1-based) to Nth product entry by index.
 */
async function insertExternalProducts(opts: {
  table: typeof siteExternalProducts | typeof projectExternalProducts;
  fkColumn: 'siteId' | 'projectId';
  fkValue: string;
  productsText: string | null;
  productImages: Map<number, ExtractedImage>;
  urlMap: Map<ExtractedImage, string>;
  errors: BatchError[];
  label: string;
}): Promise<void> {
  const { table, fkColumn, fkValue, productsText, productImages, urlMap, errors, label } = opts;

  // Warn if product images exist but no products.txt to reference them
  if (productImages.size > 0 && !productsText) {
    errors.push({ message: `"${label}": ${productImages.size} product image(s) found but no products.txt — images will not be used`, severity: 'warning' });
  }

  if (!productsText) return;

  const products = parseProductsFile(productsText);
  if (products.length === 0) return;

  try {
    await db.insert(table).values(
      products.map((ep, idx) => {
        const productImg = productImages.get(idx + 1);
        const productImgUrl = productImg ? urlMap.get(productImg) ?? null : null;
        return {
          [fkColumn]: fkValue,
          url: ep.url,
          imageUrl: productImgUrl ?? ep.imageUrl,
          labelEn: ep.labelEn,
          labelZh: ep.labelZh,
          displayOrder: idx,
        };
      })
    );
  } catch (error) {
    errors.push({
      message: `External products for "${label}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'warning',
    });
  }
}

// ============================================================================
// FALLBACK METADATA
// ============================================================================

/** Build shared fallback SEO fields from a name and bilingual type labels. */
function buildFallbackSeo(name: string, typeEn: string, typeZh: string) {
  return {
    slug: formatSlug(name),
    locationCity: '',
    poNumber: '',
    budgetRange: '',
    durationEn: '',
    durationZh: '',
    badgeEn: typeEn,
    badgeZh: typeZh,
    excerptEn: `${typeEn} renovation at ${name}.`,
    excerptZh: `${name}${typeZh}装修。`,
    metaTitleEn: `${name} ${typeEn} | Reno Stars`,
    metaTitleZh: `${name}${typeZh} | Reno Stars`,
    metaDescriptionEn: `${typeEn} renovation project at ${name}.`,
    metaDescriptionZh: `${name}${typeZh}装修项目。`,
    focusKeywordEn: `${typeEn.toLowerCase()} renovation`,
    focusKeywordZh: `${typeZh}装修`,
    seoKeywordsEn: `${typeEn.toLowerCase()}, renovation`,
    seoKeywordsZh: `${typeZh}, 装修`,
  };
}

function fallbackSiteData(folderName: string) {
  return {
    ...buildFallbackSeo(folderName, 'Whole House', '全屋'),
    titleEn: folderName,
    titleZh: folderName,
    descriptionEn: `Whole house renovation project at ${folderName}.`,
    descriptionZh: `${folderName}全屋装修项目。`,
    spaceTypeEn: 'House' as const,
  };
}

function fallbackProjectData(folderName: string, serviceType: ServiceTypeKey) {
  const category = SERVICE_TYPE_TO_CATEGORY[serviceType];
  return {
    ...buildFallbackSeo(folderName, category.en, category.zh),
    serviceType,
    titleEn: `${folderName} ${category.en} Renovation`,
    titleZh: `${folderName}${category.zh}装修`,
    descriptionEn: `${category.en} renovation project.`,
    descriptionZh: `${category.zh}装修项目。`,
    challengeEn: '',
    challengeZh: '',
    solutionEn: '',
    solutionZh: '',
  };
}

// ============================================================================
// DB HELPERS
// ============================================================================

async function getExistingSlugs(
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
async function cleanupOrphanedSite(siteId: string): Promise<void> {
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
// SHARED PIPELINE HELPERS
// ============================================================================

/** Collect all images from a parsed project for upload. */
function collectProjectImages(project: ParsedProject): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  if (project.heroImage) images.push(project.heroImage);
  for (const pair of project.imagePairs) {
    if (pair.before) images.push(pair.before);
    if (pair.after) images.push(pair.after);
  }
  for (const img of project.productImages.values()) {
    images.push(img);
  }
  return images;
}

/** Generate blog posts for a list of entity IDs using the given generator function. */
async function generateBlogsForEntities(opts: {
  ids: string[];
  generator: (id: string) => Promise<{ blogPostId?: string; error?: string }>;
  entityLabel: string;
  jobId: string;
  errors: BatchError[];
  createdBlogPostIds: string[];
}): Promise<void> {
  const { ids, generator, entityLabel, jobId, errors, createdBlogPostIds } = opts;

  await updateJob(jobId, { status: 'generating_blog' });

  for (const id of ids) {
    try {
      const result = await generator(id);
      if (result.blogPostId) {
        createdBlogPostIds.push(result.blogPostId);
      } else if (result.error) {
        errors.push({ message: `Blog generation for ${entityLabel} ${id}: ${result.error}`, severity: 'warning' });
      }
    } catch (error) {
      errors.push({
        message: `Blog generation failed for ${entityLabel} ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'warning',
      });
    }
  }
}

/** Delete the temp ZIP from S3 (non-critical). */
async function cleanupTempZip(jobId: string): Promise<void> {
  try {
    const client = getS3Client();
    if (client) {
      await client.send(
        new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: batchZipKey(jobId) })
      );
    }
  } catch {
    // Non-critical cleanup
  }
}

/** Finalize a batch job: set terminal status, timestamps, and clean up temp ZIP. */
async function finalizeJob(opts: {
  jobId: string;
  errors: BatchError[];
  createdSiteIds: string[];
  createdProjectIds: string[];
  createdBlogPostIds: string[];
}): Promise<void> {
  const { jobId, errors, createdSiteIds, createdProjectIds, createdBlogPostIds } = opts;
  const hasCreations = createdSiteIds.length > 0 || createdProjectIds.length > 0;
  const hasCriticalErrors = errors.some((e) => e.severity === 'critical');

  await updateJob(jobId, {
    status: hasCriticalErrors && hasCreations ? 'partial' : hasCriticalErrors ? 'failed' : 'completed',
    completedAt: new Date(),
    createdSiteIds: [...createdSiteIds],
    createdProjectIds: [...createdProjectIds],
    createdBlogPostIds: [...createdBlogPostIds],
    errors: errors.map((e) => e.message),
  });

  await cleanupTempZip(jobId);
}

// ============================================================================
// MAIN PROCESSOR
// ============================================================================

export async function processBatchUpload(jobId: string): Promise<void> {
  const errors: BatchError[] = [];
  const createdSiteIds: string[] = [];
  const createdProjectIds: string[] = [];
  const createdBlogPostIds: string[] = [];

  try {
    // ---- STEP 1: Fetch job ----
    const [job] = await db
      .select()
      .from(batchUploadJobs)
      .where(eq(batchUploadJobs.id, jobId))
      .limit(1);

    if (!job) throw new Error('Job not found');
    if (job.status !== 'pending') throw new Error(`Job already in status: ${job.status}`);

    const options: BatchJobOptions = {
      generateBlog: false,
      mode: 'sites',
      ...job.options,
    };

    // ---- Validate S3 upfront ----
    const client = getS3Client();
    if (!client) throw new Error('S3 not configured');
    const s3PublicUrl = process.env.S3_PUBLIC_URL;
    if (!s3PublicUrl) throw new Error('S3_PUBLIC_URL not configured');

    // ---- STEP 2: Extract ZIP from S3 temp ----
    await updateJob(jobId, {
      status: 'extracting',
      startedAt: new Date(),
    });

    const zipObj = await client.send(
      new GetObjectCommand({ Bucket: S3_BUCKET, Key: batchZipKey(jobId) })
    );
    if (!zipObj.Body) throw new Error('Failed to download ZIP from S3');
    const zipBuffer = new Uint8Array(await zipObj.Body.transformToByteArray());

    // Parse ZIP based on mode — branch early to avoid dual-nullable pattern
    if (options.mode === 'standalone') {
      let parsedStandalone: ParsedStandaloneStructure;
      try {
        parsedStandalone = await parseZipStandalone(zipBuffer);
      } catch (error) {
        throw new Error(
          `ZIP extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      if (parsedStandalone.projects.length === 0) {
        throw new Error('No image files found in the ZIP archive.');
      }

      await updateJob(jobId, { totalImages: parsedStandalone.totalImages });

      await processStandaloneMode({
        parsedStandalone,
        jobId,
        options,
        errors,
        createdProjectIds,
        createdBlogPostIds,
        s3Client: client,
        s3PublicUrl,
      });

      await finalizeJob({ jobId, errors, createdSiteIds, createdProjectIds, createdBlogPostIds });
      return;
    }

    // Sites mode
    let parsed: ParsedZipStructure;
    try {
      parsed = await parseZip(zipBuffer);
    } catch (error) {
      throw new Error(
        `ZIP extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    if (parsed.sites.length === 0) {
      throw new Error('No image files found in the ZIP archive.');
    }

    await updateJob(jobId, { totalImages: parsed.totalImages });

    // ---- STEP 3: Upload images to S3 (per-site slug prefix) ----
    await updateJob(jobId, { status: 'uploading' });

    // Upload images per site with site-specific slug prefixes
    const urlMap = new Map<ExtractedImage, string>();
    let uploadedCount = 0;

    for (const site of parsed.sites) {
      const siteSlugPrefix = formatSlug(site.folderName || 'batch');
      const siteImages: ExtractedImage[] = [];

      if (site.heroImage) siteImages.push(site.heroImage);
      // Site-level image pairs
      for (const pair of site.imagePairs) {
        if (pair.before) siteImages.push(pair.before);
        if (pair.after) siteImages.push(pair.after);
      }
      // Site-level product images
      for (const img of site.productImages.values()) {
        siteImages.push(img);
      }
      for (const project of site.projects) {
        siteImages.push(...collectProjectImages(project));
      }

      const siteUrls = await uploadAllImages({
        images: siteImages,
        slugPrefix: siteSlugPrefix,
        jobId,
        startCount: uploadedCount,
        totalImages: parsed.totalImages,
        errors,
        s3Client: client,
        s3PublicUrl,
      });

      for (const [img, url] of siteUrls) {
        urlMap.set(img, url);
      }
      uploadedCount += siteImages.length;
    }

    // ---- STEP 4: AI metadata generation ----
    await updateJob(jobId, { status: 'generating' });

    // Pre-generate AI metadata for all sites and projects (parallel batches)
    const siteMetadataMap = new Map<string, SiteDescription | null>();
    const projectMetadataMap = new Map<string, ProjectDescription | null>();

    const aiTasks: (() => Promise<void>)[] = [];

    for (const parsedSite of parsed.sites) {
      const siteKey = parsedSite.folderName;
      aiTasks.push(async () => {
        siteMetadataMap.set(siteKey, await generateSiteMetadata(parsedSite.folderName, parsedSite.notes));
      });
      for (const parsedProject of parsedSite.projects) {
        const projectKey = `${parsedSite.folderName}/${parsedProject.folderName}`;
        aiTasks.push(async () => {
          projectMetadataMap.set(projectKey, await generateProjectMetadata(parsedProject.folderName, parsedProject.serviceType, parsedProject.notes));
        });
      }
    }

    for (let i = 0; i < aiTasks.length; i += AI_METADATA_BATCH_SIZE) {
      const batch = aiTasks.slice(i, i + AI_METADATA_BATCH_SIZE);
      await Promise.allSettled(batch.map((fn) => fn()));
    }

    // ---- STEP 5: Save to DB ----
    await updateJob(jobId, { status: 'saving' });

    const existingSiteSlugs = await getExistingSlugs('sites');
    const existingProjectSlugs = await getExistingSlugs('projects');

    for (const parsedSite of parsed.sites) {
      let insertedSiteId: string | null = null;
      try {
        // Use pre-generated AI metadata
        const aiSite = siteMetadataMap.get(parsedSite.folderName);
        const siteData = aiSite ?? fallbackSiteData(parsedSite.folderName);

        const siteSlug = ensureUniqueSlug(
          formatSlug(siteData.slug || parsedSite.folderName),
          existingSiteSlugs
        );
        existingSiteSlugs.push(siteSlug);

        const heroUrl = parsedSite.heroImage
          ? urlMap.get(parsedSite.heroImage) ?? null
          : null;

        const [insertedSite] = await db
          .insert(projectSites)
          .values({
            slug: siteSlug,
            titleEn: siteData.titleEn,
            titleZh: siteData.titleZh,
            descriptionEn: siteData.descriptionEn,
            descriptionZh: siteData.descriptionZh,
            locationCity: siteData.locationCity || null,
            heroImageUrl: heroUrl,
            badgeEn: siteData.badgeEn || null,
            badgeZh: siteData.badgeZh || null,
            excerptEn: siteData.excerptEn || null,
            excerptZh: siteData.excerptZh || null,
            metaTitleEn: siteData.metaTitleEn || null,
            metaTitleZh: siteData.metaTitleZh || null,
            metaDescriptionEn: siteData.metaDescriptionEn || null,
            metaDescriptionZh: siteData.metaDescriptionZh || null,
            focusKeywordEn: siteData.focusKeywordEn || null,
            focusKeywordZh: siteData.focusKeywordZh || null,
            seoKeywordsEn: siteData.seoKeywordsEn || null,
            seoKeywordsZh: siteData.seoKeywordsZh || null,
            budgetRange: siteData.budgetRange || null,
            durationEn: siteData.durationEn || null,
            durationZh: siteData.durationZh || null,
            spaceTypeEn: siteData.spaceTypeEn || null,
            spaceTypeZh: (siteData.spaceTypeEn && SPACE_TYPE_TO_ZH[siteData.spaceTypeEn]) || siteData.spaceTypeEn || null,
            poNumber: siteData.poNumber || null,
            showAsProject: true,
            featured: false,
            isPublished: false,
          })
          .returning({ id: projectSites.id });

        const siteId = insertedSite.id;
        insertedSiteId = siteId;
        createdSiteIds.push(siteId);

        await updateJob(jobId, { createdSiteIds: [...createdSiteIds] });

        // Insert site-level image pairs
        let siteImagePairsCreated = 0;
        for (let pairIdx = 0; pairIdx < parsedSite.imagePairs.length; pairIdx++) {
          const pair = parsedSite.imagePairs[pairIdx];
          const beforeUrl = pair.before ? urlMap.get(pair.before) ?? null : null;
          const afterUrl = pair.after ? urlMap.get(pair.after) ?? null : null;
          if (!beforeUrl && !afterUrl) continue;

          try {
            await db.insert(siteImagePairs).values({
              siteId,
              beforeImageUrl: beforeUrl,
              beforeAltTextEn: beforeUrl ? `${siteData.titleEn} - Before Renovation ${pairIdx + 1}` : null,
              beforeAltTextZh: beforeUrl ? `${siteData.titleZh} - 装修前 ${pairIdx + 1}` : null,
              afterImageUrl: afterUrl,
              afterAltTextEn: afterUrl ? FALLBACK_ALT.en : null,
              afterAltTextZh: afterUrl ? FALLBACK_ALT.zh : null,
              displayOrder: pairIdx,
            });
            siteImagePairsCreated++;
          } catch (error) {
            errors.push({
              message: `Site image pair ${pairIdx} for "${parsedSite.folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
              severity: 'warning',
            });
          }
        }

        // Insert site-level external products from products.txt
        await insertExternalProducts({
          table: siteExternalProducts,
          fkColumn: 'siteId',
          fkValue: siteId,
          productsText: parsedSite.productsText,
          productImages: parsedSite.productImages,
          urlMap,
          errors,
          label: parsedSite.folderName,
        });

        // Process projects under this site
        let projectsCreatedForSite = 0;
        for (let pIdx = 0; pIdx < parsedSite.projects.length; pIdx++) {
          const parsedProject = parsedSite.projects[pIdx];
          try {
            const projectKey = `${parsedSite.folderName}/${parsedProject.folderName}`;
            const aiProject = projectMetadataMap.get(projectKey);
            await saveProject({
              parsedProject,
              aiProject: aiProject ?? null,
              siteId,
              displayOrder: pIdx,
              urlMap,
              existingProjectSlugs,
              createdProjectIds,
              errors,
              jobId,
            });
            projectsCreatedForSite++;
          } catch (error) {
            errors.push({
              message: `Project "${parsedProject.folderName}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              severity: 'critical',
            });
          }
        }

        // Clean up orphaned site if no projects and no site image pairs were created
        if (projectsCreatedForSite === 0 && siteImagePairsCreated === 0 && insertedSiteId) {
          await cleanupOrphanedSite(insertedSiteId);
          const popIdx = createdSiteIds.indexOf(insertedSiteId);
          if (popIdx !== -1) createdSiteIds.splice(popIdx, 1);
          errors.push({ message: `Site "${parsedSite.folderName}" removed: all child projects failed.`, severity: 'critical' });
        }
      } catch (error) {
        errors.push({
          message: `Site "${parsedSite.folderName}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'critical',
        });
        // Clean up orphaned site on failure
        if (insertedSiteId) {
          await cleanupOrphanedSite(insertedSiteId);
          const idx = createdSiteIds.indexOf(insertedSiteId);
          if (idx !== -1) createdSiteIds.splice(idx, 1);
        }
      }
    }

    // ---- STEP 6: Blog generation (optional) ----
    if (options.generateBlog && createdSiteIds.length > 0) {
      await generateBlogsForEntities({
        ids: createdSiteIds,
        generator: generateBlogFromSite,
        entityLabel: 'site',
        jobId,
        errors,
        createdBlogPostIds,
      });
    }

    // ---- DONE ----
    await finalizeJob({ jobId, errors, createdSiteIds, createdProjectIds, createdBlogPostIds });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    errors.push({ message, severity: 'critical' });
    await updateJob(jobId, {
      status: 'failed',
      completedAt: new Date(),
      errors: errors.map((e) => e.message),
      createdSiteIds: [...createdSiteIds],
      createdProjectIds: [...createdProjectIds],
      createdBlogPostIds: [...createdBlogPostIds],
    });
  }
}

// ============================================================================
// STANDALONE MODE PROCESSOR
// ============================================================================

async function processStandaloneMode(opts: {
  parsedStandalone: ParsedStandaloneStructure;
  jobId: string;
  options: BatchJobOptions;
  errors: BatchError[];
  createdProjectIds: string[];
  createdBlogPostIds: string[];
  s3Client: import('@aws-sdk/client-s3').S3Client;
  s3PublicUrl: string;
}): Promise<void> {
  const { parsedStandalone, jobId, options, errors, createdProjectIds, createdBlogPostIds, s3Client, s3PublicUrl } = opts;

  // Find or create the standalone site container
  const standaloneSiteId = await ensureStandaloneSite();

  // Get current max display order for the standalone site
  const [maxRow] = await db
    .select({ max: sql<number>`coalesce(max(${projects.displayOrderInSite}), -1)` })
    .from(projects)
    .where(eq(projects.siteId, standaloneSiteId));
  let nextDisplayOrder = Number(maxRow?.max ?? -1) + 1;

  // ---- Upload images ----
  await updateJob(jobId, { status: 'uploading' });

  const urlMap = new Map<ExtractedImage, string>();
  let uploadedCount = 0;

  for (const project of parsedStandalone.projects) {
    const slugPrefix = formatSlug(project.folderName || 'batch');
    const projectImages = collectProjectImages(project);

    const projectUrls = await uploadAllImages({
      images: projectImages,
      slugPrefix,
      jobId,
      startCount: uploadedCount,
      totalImages: parsedStandalone.totalImages,
      errors,
      s3Client,
      s3PublicUrl,
    });

    for (const [img, url] of projectUrls) {
      urlMap.set(img, url);
    }
    uploadedCount += projectImages.length;
  }

  // ---- AI metadata generation (parallel) ----
  await updateJob(jobId, { status: 'generating' });

  const projectMetadataMap = new Map<string, ProjectDescription | null>();

  for (let i = 0; i < parsedStandalone.projects.length; i += AI_METADATA_BATCH_SIZE) {
    const batch = parsedStandalone.projects.slice(i, i + AI_METADATA_BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((p) => generateProjectMetadata(p.folderName, p.serviceType, p.notes))
    );
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      projectMetadataMap.set(batch[j].folderName, r.status === 'fulfilled' ? r.value : null);
    }
  }

  // ---- Save to DB ----
  await updateJob(jobId, { status: 'saving' });

  const existingProjectSlugs = await getExistingSlugs('projects');

  for (const parsedProject of parsedStandalone.projects) {
    try {
      const aiProject = projectMetadataMap.get(parsedProject.folderName);
      await saveProject({
        parsedProject,
        aiProject: aiProject ?? null,
        siteId: standaloneSiteId,
        displayOrder: nextDisplayOrder++,
        urlMap,
        existingProjectSlugs,
        createdProjectIds,
        errors,
        jobId,
      });
    } catch (error) {
      errors.push({
        message: `Project "${parsedProject.folderName}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'critical',
      });
    }
  }

  // ---- Blog generation (optional) ----
  if (options.generateBlog && createdProjectIds.length > 0) {
    await generateBlogsForEntities({
      ids: createdProjectIds,
      generator: generateBlogFromProject,
      entityLabel: 'project',
      jobId,
      errors,
      createdBlogPostIds,
    });
  }
}

// ============================================================================
// PROJECT SAVE (DB insertion with pre-generated metadata)
// ============================================================================

async function saveProject(opts: {
  parsedProject: ParsedProject;
  aiProject: ProjectDescription | null;
  siteId: string;
  displayOrder: number;
  urlMap: Map<ExtractedImage, string>;
  existingProjectSlugs: string[];
  createdProjectIds: string[];
  errors: BatchError[];
  jobId: string;
}): Promise<void> {
  const {
    parsedProject, aiProject, siteId, displayOrder,
    urlMap, existingProjectSlugs,
    createdProjectIds, errors, jobId,
  } = opts;
  const projectData = aiProject ?? fallbackProjectData(
    parsedProject.folderName,
    parsedProject.serviceType
  );

  const projectSlug = ensureUniqueSlug(
    formatSlug(projectData.slug || parsedProject.folderName),
    existingProjectSlugs
  );
  existingProjectSlugs.push(projectSlug);

  const heroUrl = parsedProject.heroImage
    ? urlMap.get(parsedProject.heroImage) ?? null
    : null;

  // Prefer AI-detected service type over folder-name heuristic
  const serviceType = aiProject?.serviceType ?? parsedProject.serviceType;
  const category = SERVICE_TYPE_TO_CATEGORY[serviceType];

  const [insertedProject] = await db
    .insert(projects)
    .values({
      slug: projectSlug,
      titleEn: projectData.titleEn,
      titleZh: projectData.titleZh,
      descriptionEn: projectData.descriptionEn,
      descriptionZh: projectData.descriptionZh,
      serviceType,
      categoryEn: category.en,
      categoryZh: category.zh,
      locationCity: projectData.locationCity || null,
      budgetRange: projectData.budgetRange || null,
      durationEn: projectData.durationEn || null,
      durationZh: projectData.durationZh || null,
      heroImageUrl: heroUrl,
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
      poNumber: projectData.poNumber || null,
      siteId,
      displayOrderInSite: displayOrder,
      featured: false,
      isPublished: false,
    })
    .returning({ id: projects.id });

  createdProjectIds.push(insertedProject.id);

  await updateJob(jobId, { createdProjectIds: [...createdProjectIds] });

  // Insert service scopes — use AI-selected scopes if available, else all scopes for the type
  const allScopes = SERVICE_SCOPES[parsedProject.serviceType] ?? [];
  const aiSelected = aiProject?.selectedScopes ?? [];
  const scopesToInsert = aiSelected.length > 0
    ? allScopes.filter((s) => aiSelected.includes(s.en))
    : allScopes;

  if (scopesToInsert.length > 0) {
    try {
      await db.insert(projectScopes).values(
        scopesToInsert.map((scope, idx) => ({
          projectId: insertedProject.id,
          scopeEn: scope.en,
          scopeZh: scope.zh,
          displayOrder: idx,
        }))
      );
    } catch (error) {
      errors.push({
        message: `Scopes for "${parsedProject.folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'warning',
      });
    }
  }

  // Insert external products from products.txt
  await insertExternalProducts({
    table: projectExternalProducts,
    fkColumn: 'projectId',
    fkValue: insertedProject.id,
    productsText: parsedProject.productsText,
    productImages: parsedProject.productImages,
    urlMap,
    errors,
    label: parsedProject.folderName,
  });

  // Insert image pairs with pre-generated alt text
  for (let pairIdx = 0; pairIdx < parsedProject.imagePairs.length; pairIdx++) {
    const pair = parsedProject.imagePairs[pairIdx];
    const beforeUrl = pair.before ? urlMap.get(pair.before) ?? null : null;
    const afterUrl = pair.after ? urlMap.get(pair.after) ?? null : null;

    // Skip pairs where both images failed upload
    if (!beforeUrl && !afterUrl) continue;

    try {
      await db.insert(projectImagePairs).values({
        projectId: insertedProject.id,
        beforeImageUrl: beforeUrl,
        beforeAltTextEn: beforeUrl ? `${projectData.titleEn} - Before Renovation ${pairIdx + 1}` : null,
        beforeAltTextZh: beforeUrl ? `${projectData.titleZh} - 装修前 ${pairIdx + 1}` : null,
        afterImageUrl: afterUrl,
        afterAltTextEn: afterUrl ? FALLBACK_ALT.en : null,
        afterAltTextZh: afterUrl ? FALLBACK_ALT.zh : null,
        displayOrder: pairIdx,
      });
    } catch (error) {
      errors.push({
        message: `Image pair ${pairIdx} for "${parsedProject.folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'warning',
      });
    }
  }
}
