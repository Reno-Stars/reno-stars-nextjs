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
  generateAltText,
} from '@/lib/ai/content-optimizer';
import type { SiteDescription, ProjectDescription } from '@/lib/ai/content-optimizer';
import { generateBlogFromSite, generateBlogFromProject } from '@/app/actions/admin/generate-blog';
import { ensureUniqueSlug, formatSlug } from '@/lib/utils';
import { ensureStandaloneSite } from '@/lib/db/queries';
import { SERVICE_TYPE_TO_CATEGORY, DEFAULT_SCOPES } from '@/lib/admin/constants';
import type { ServiceTypeKey } from '@/lib/admin/constants';
import { parseZip, parseZipStandalone } from './zip-parser';
import type {
  ParsedZipStructure,
  ParsedStandaloneStructure,
  ParsedProject,
  ParsedExternalProduct,
  ExtractedImage,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Max concurrent S3 uploads */
const UPLOAD_BATCH_SIZE = 3;

/** Max concurrent alt text AI calls */
const ALT_TEXT_BATCH_SIZE = 5;

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

async function uploadImageToS3(
  image: ExtractedImage,
  keyPrefix: string
): Promise<string> {
  const client = getS3Client();
  if (!client) throw new Error('S3 not configured');

  const publicUrl = process.env.S3_PUBLIC_URL;
  if (!publicUrl) throw new Error('S3_PUBLIC_URL not configured');

  const ext = image.path.split('.').pop()?.toLowerCase() || 'jpg';
  const ts = Date.now().toString(36);
  const key = `uploads/admin/${keyPrefix}-${ts}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: image.data,
      ContentType: image.mimeType,
    })
  );

  return `${publicUrl}/${key}`;
}

/**
 * Upload images in batches to avoid overwhelming S3.
 * Returns a map of ExtractedImage → uploaded URL.
 */
async function uploadImagesInBatches(opts: {
  images: ExtractedImage[];
  slugPrefix: string;
  jobId: string;
  startCount: number;
  totalImages: number;
  errors: string[];
}): Promise<Map<ExtractedImage, string>> {
  const { images, slugPrefix, jobId, startCount, totalImages, errors } = opts;
  const urlMap = new Map<ExtractedImage, string>();
  let processed = startCount;

  for (let i = 0; i < images.length; i += UPLOAD_BATCH_SIZE) {
    const batch = images.slice(i, i + UPLOAD_BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((img, batchIdx) => {
        const idx = i + batchIdx;
        const basename = img.path.split('/').pop()?.replace(/\.[^.]+$/, '') || `img-${idx}`;
        const safeBasename = basename.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
        return uploadImageToS3(img, `${slugPrefix}-${safeBasename}`);
      })
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === 'fulfilled') {
        urlMap.set(batch[j], result.value);
      } else {
        errors.push(`Upload failed: ${batch[j].path} - ${result.reason}`);
      }
      processed++;
    }

    await updateJob(jobId, {
      processedImages: processed,
      currentStepLabel: `Uploading image ${processed} of ${totalImages}...`,
    });
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
  } catch (error) {
    console.error('AI site metadata failed:', error);
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
    return await optimizeProjectDescription(prompt);
  } catch (error) {
    console.error('AI project metadata failed:', error);
    return null;
  }
}

/**
 * Generate alt text for multiple image URLs in parallel batches.
 * Returns a map of URL → { altEn, altZh }.
 */
async function generateAltTextsInBatches(
  imageUrls: string[]
): Promise<Map<string, { altEn: string; altZh: string }>> {
  const altMap = new Map<string, { altEn: string; altZh: string }>();
  const fallback = { altEn: FALLBACK_ALT.en, altZh: FALLBACK_ALT.zh };

  for (let i = 0; i < imageUrls.length; i += ALT_TEXT_BATCH_SIZE) {
    const batch = imageUrls.slice(i, i + ALT_TEXT_BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((url) => generateAltText({ url }))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === 'fulfilled') {
        altMap.set(batch[j], { altEn: result.value.altEn, altZh: result.value.altZh });
      } else {
        altMap.set(batch[j], fallback);
      }
    }
  }

  return altMap;
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
  errors: string[];
  label: string;
}): Promise<void> {
  const { table, fkColumn, fkValue, productsText, productImages, urlMap, errors, label } = opts;

  // Warn if product images exist but no products.txt to reference them
  if (productImages.size > 0 && !productsText) {
    errors.push(`"${label}": ${productImages.size} product image(s) found but no products.txt — images will not be used`);
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
    errors.push(
      `External products for "${label}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// FALLBACK METADATA
// ============================================================================

function fallbackSiteData(folderName: string) {
  const slug = formatSlug(folderName);
  return {
    slug,
    titleEn: folderName,
    titleZh: folderName,
    descriptionEn: `Whole house renovation project at ${folderName}.`,
    descriptionZh: `${folderName}全屋装修项目。`,
    locationCity: '',
    poNumber: '',
    budgetRange: '',
    durationEn: '',
    durationZh: '',
    badgeEn: 'Whole House',
    badgeZh: '全屋装修',
    excerptEn: `Whole house renovation at ${folderName}.`,
    excerptZh: `${folderName}全屋装修。`,
    metaTitleEn: `${folderName} Renovation | Reno Stars`,
    metaTitleZh: `${folderName}装修 | Reno Stars`,
    metaDescriptionEn: `View the whole house renovation project at ${folderName}.`,
    metaDescriptionZh: `查看${folderName}全屋装修项目。`,
    focusKeywordEn: `${folderName.toLowerCase()} renovation`,
    focusKeywordZh: `${folderName}装修`,
    seoKeywordsEn: 'renovation, whole house, remodeling',
    seoKeywordsZh: '装修, 全屋, 翻新',
  };
}

function fallbackProjectData(folderName: string, serviceType: ServiceTypeKey) {
  const slug = formatSlug(folderName);
  const category = SERVICE_TYPE_TO_CATEGORY[serviceType];
  return {
    serviceType,
    slug,
    titleEn: `${folderName} ${category.en} Renovation`,
    titleZh: `${folderName}${category.zh}装修`,
    descriptionEn: `${category.en} renovation project.`,
    descriptionZh: `${category.zh}装修项目。`,
    locationCity: '',
    poNumber: '',
    budgetRange: '',
    durationEn: '',
    durationZh: '',
    challengeEn: '',
    challengeZh: '',
    solutionEn: '',
    solutionZh: '',
    badgeEn: category.en,
    badgeZh: category.zh,
    excerptEn: `${category.en} renovation at ${folderName}.`,
    excerptZh: `${folderName}${category.zh}装修。`,
    metaTitleEn: `${folderName} ${category.en} | Reno Stars`,
    metaTitleZh: `${folderName}${category.zh} | Reno Stars`,
    metaDescriptionEn: `${category.en} renovation project at ${folderName}.`,
    metaDescriptionZh: `${folderName}${category.zh}装修项目。`,
    focusKeywordEn: `${category.en.toLowerCase()} renovation`,
    focusKeywordZh: `${category.zh}装修`,
    seoKeywordsEn: `${category.en.toLowerCase()}, renovation`,
    seoKeywordsZh: `${category.zh}, 装修`,
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

/** Collect after-image URLs from project image pairs for alt text generation. */
function collectAfterImageUrls(
  projectList: ParsedProject[],
  urlMap: Map<ExtractedImage, string>
): string[] {
  const urls: string[] = [];
  for (const project of projectList) {
    for (const pair of project.imagePairs) {
      const url = pair.after ? urlMap.get(pair.after) : pair.before ? urlMap.get(pair.before) : undefined;
      if (url) urls.push(url);
    }
  }
  return urls;
}

/** Generate blog posts for a list of entity IDs using the given generator function. */
async function generateBlogsForEntities(opts: {
  ids: string[];
  generator: (id: string) => Promise<{ blogPostId?: string; error?: string }>;
  entityLabel: string;
  jobId: string;
  errors: string[];
  createdBlogPostIds: string[];
}): Promise<void> {
  const { ids, generator, entityLabel, jobId, errors, createdBlogPostIds } = opts;

  await updateJob(jobId, {
    status: 'generating_blog',
    currentStepLabel: 'Generating blog posts...',
  });

  for (const id of ids) {
    try {
      const result = await generator(id);
      if (result.blogPostId) {
        createdBlogPostIds.push(result.blogPostId);
      } else if (result.error) {
        errors.push(`Blog generation for ${entityLabel} ${id}: ${result.error}`);
      }
    } catch (error) {
      errors.push(
        `Blog generation failed for ${entityLabel} ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/** Delete the temp ZIP from S3 (non-critical). */
async function cleanupTempZip(jobId: string): Promise<void> {
  try {
    const client = getS3Client();
    if (client) {
      await client.send(
        new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: `temp/batch/${jobId}.zip` })
      );
    }
  } catch {
    // Non-critical cleanup
  }
}

/** Finalize a batch job: set terminal status, timestamps, and clean up temp ZIP. */
async function finalizeJob(opts: {
  jobId: string;
  errors: string[];
  createdSiteIds: string[];
  createdProjectIds: string[];
  createdBlogPostIds: string[];
}): Promise<void> {
  const { jobId, errors, createdSiteIds, createdProjectIds, createdBlogPostIds } = opts;
  const hasErrors = errors.length > 0;
  const hasCreations = createdSiteIds.length > 0 || createdProjectIds.length > 0;

  await updateJob(jobId, {
    status: hasErrors && hasCreations ? 'partial' : hasErrors ? 'failed' : 'completed',
    currentStepLabel: hasErrors
      ? `Completed with ${errors.length} error(s)`
      : 'Completed successfully',
    completedAt: new Date(),
    createdSiteIds: [...createdSiteIds],
    createdProjectIds: [...createdProjectIds],
    createdBlogPostIds: [...createdBlogPostIds],
    errors: [...errors],
  });

  await cleanupTempZip(jobId);
}

// ============================================================================
// MAIN PROCESSOR
// ============================================================================

export async function processBatchUpload(jobId: string): Promise<void> {
  const errors: string[] = [];
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

    // ---- STEP 2: Extract ZIP from S3 temp ----
    await updateJob(jobId, {
      status: 'extracting',
      currentStepLabel: 'Extracting ZIP file...',
      startedAt: new Date(),
    });

    const client = getS3Client();
    if (!client) throw new Error('S3 not configured');

    const zipObj = await client.send(
      new GetObjectCommand({ Bucket: S3_BUCKET, Key: `temp/batch/${jobId}.zip` })
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

      await updateJob(jobId, {
        totalImages: parsedStandalone.totalImages,
        currentStepLabel: `Found ${parsedStandalone.totalImages} images in ${parsedStandalone.projects.length} project(s)`,
      });

      await processStandaloneMode({
        parsedStandalone,
        jobId,
        options,
        errors,
        createdProjectIds,
        createdBlogPostIds,
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

    await updateJob(jobId, {
      totalImages: parsed.totalImages,
      currentStepLabel: `Found ${parsed.totalImages} images in ${parsed.sites.length} site(s)`,
    });

    // ---- STEP 3: Upload images to S3 (per-site slug prefix) ----
    await updateJob(jobId, {
      status: 'uploading',
      currentStepLabel: 'Uploading images...',
    });

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

      const siteUrls = await uploadImagesInBatches({
        images: siteImages,
        slugPrefix: siteSlugPrefix,
        jobId,
        startCount: uploadedCount,
        totalImages: parsed.totalImages,
        errors,
      });

      for (const [img, url] of siteUrls) {
        urlMap.set(img, url);
      }
      uploadedCount += siteImages.length;
    }

    // ---- STEP 4: AI metadata generation ----
    await updateJob(jobId, {
      status: 'generating',
      currentStepLabel: 'Generating metadata with AI...',
    });

    // Pre-generate AI metadata for all sites and projects
    const siteMetadataMap = new Map<string, SiteDescription | null>();
    const projectMetadataMap = new Map<string, ProjectDescription | null>();

    for (const parsedSite of parsed.sites) {
      const siteMeta = await generateSiteMetadata(parsedSite.folderName, parsedSite.notes);
      siteMetadataMap.set(parsedSite.folderName, siteMeta);

      for (const parsedProject of parsedSite.projects) {
        const projectKey = `${parsedSite.folderName}/${parsedProject.folderName}`;
        const projMeta = await generateProjectMetadata(
          parsedProject.folderName,
          parsedProject.serviceType,
          parsedProject.notes
        );
        projectMetadataMap.set(projectKey, projMeta);
      }

      await updateJob(jobId, {
        currentStepLabel: `Generated metadata for: ${parsedSite.folderName}`,
      });
    }

    // Pre-generate alt text for all after images (parallel batched)
    const afterImageUrls: string[] = [];
    for (const site of parsed.sites) {
      // Site-level image pairs
      for (const pair of site.imagePairs) {
        const url = pair.after ? urlMap.get(pair.after) : pair.before ? urlMap.get(pair.before) : undefined;
        if (url) afterImageUrls.push(url);
      }
      afterImageUrls.push(...collectAfterImageUrls(site.projects, urlMap));
    }

    const altTextMap = await generateAltTextsInBatches(afterImageUrls);

    // ---- STEP 5: Save to DB ----
    await updateJob(jobId, {
      status: 'saving',
      currentStepLabel: 'Saving to database...',
    });

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
            poNumber: siteData.poNumber || null,
            showAsProject: true,
            featured: false,
            isPublished: false,
          })
          .returning({ id: projectSites.id });

        const siteId = insertedSite.id;
        insertedSiteId = siteId;
        createdSiteIds.push(siteId);

        await updateJob(jobId, {
          currentStepLabel: `Created site: ${siteData.titleEn}`,
          createdSiteIds: [...createdSiteIds],
        });

        // Insert site-level image pairs
        let siteImagePairsCreated = 0;
        for (let pairIdx = 0; pairIdx < parsedSite.imagePairs.length; pairIdx++) {
          const pair = parsedSite.imagePairs[pairIdx];
          const beforeUrl = pair.before ? urlMap.get(pair.before) ?? null : null;
          const afterUrl = pair.after ? urlMap.get(pair.after) ?? null : null;
          if (!beforeUrl && !afterUrl) continue;

          const altImageUrl = afterUrl || beforeUrl;
          const alt = altImageUrl ? altTextMap.get(altImageUrl) : null;
          const altEn = alt?.altEn || FALLBACK_ALT.en;
          const altZh = alt?.altZh || FALLBACK_ALT.zh;

          try {
            await db.insert(siteImagePairs).values({
              siteId,
              beforeImageUrl: beforeUrl,
              beforeAltTextEn: beforeUrl ? `${siteData.titleEn} - Before Renovation ${pairIdx + 1}` : null,
              beforeAltTextZh: beforeUrl ? `${siteData.titleZh} - 装修前 ${pairIdx + 1}` : null,
              afterImageUrl: afterUrl,
              afterAltTextEn: afterUrl ? altEn : null,
              afterAltTextZh: afterUrl ? altZh : null,
              displayOrder: pairIdx,
            });
            siteImagePairsCreated++;
          } catch (error) {
            errors.push(
              `Site image pair ${pairIdx} for "${parsedSite.folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`
            );
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
              altTextMap,
              existingProjectSlugs,
              createdProjectIds,
              errors,
              jobId,
            });
            projectsCreatedForSite++;
          } catch (error) {
            errors.push(
              `Project "${parsedProject.folderName}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }

        // Clean up orphaned site if no projects and no site image pairs were created
        if (projectsCreatedForSite === 0 && siteImagePairsCreated === 0 && insertedSiteId) {
          await cleanupOrphanedSite(insertedSiteId);
          createdSiteIds.pop();
          errors.push(`Site "${parsedSite.folderName}" removed: all child projects failed.`);
        }
      } catch (error) {
        errors.push(
          `Site "${parsedSite.folderName}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
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
    errors.push(message);
    await updateJob(jobId, {
      status: 'failed',
      currentStepLabel: `Failed: ${message}`,
      completedAt: new Date(),
      errors: [...errors],
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
  errors: string[];
  createdProjectIds: string[];
  createdBlogPostIds: string[];
}): Promise<void> {
  const { parsedStandalone, jobId, options, errors, createdProjectIds, createdBlogPostIds } = opts;

  // Find or create the standalone site container
  const standaloneSiteId = await ensureStandaloneSite();

  // Get current max display order for the standalone site
  const [maxRow] = await db
    .select({ max: sql<number>`coalesce(max(${projects.displayOrderInSite}), -1)` })
    .from(projects)
    .where(eq(projects.siteId, standaloneSiteId));
  let nextDisplayOrder = Number(maxRow?.max ?? -1) + 1;

  // ---- Upload images ----
  await updateJob(jobId, {
    status: 'uploading',
    currentStepLabel: 'Uploading images...',
  });

  const urlMap = new Map<ExtractedImage, string>();
  let uploadedCount = 0;

  for (const project of parsedStandalone.projects) {
    const slugPrefix = formatSlug(project.folderName || 'batch');
    const projectImages = collectProjectImages(project);

    const projectUrls = await uploadImagesInBatches({
      images: projectImages,
      slugPrefix,
      jobId,
      startCount: uploadedCount,
      totalImages: parsedStandalone.totalImages,
      errors,
    });

    for (const [img, url] of projectUrls) {
      urlMap.set(img, url);
    }
    uploadedCount += projectImages.length;
  }

  // ---- AI metadata generation ----
  await updateJob(jobId, {
    status: 'generating',
    currentStepLabel: 'Generating metadata with AI...',
  });

  const projectMetadataMap = new Map<string, ProjectDescription | null>();

  for (const parsedProject of parsedStandalone.projects) {
    const projMeta = await generateProjectMetadata(
      parsedProject.folderName,
      parsedProject.serviceType,
      parsedProject.notes
    );
    projectMetadataMap.set(parsedProject.folderName, projMeta);

    await updateJob(jobId, {
      currentStepLabel: `Generated metadata for: ${parsedProject.folderName}`,
    });
  }

  // Pre-generate alt text for after images
  const afterImageUrls = collectAfterImageUrls(parsedStandalone.projects, urlMap);
  const altTextMap = await generateAltTextsInBatches(afterImageUrls);

  // ---- Save to DB ----
  await updateJob(jobId, {
    status: 'saving',
    currentStepLabel: 'Saving to database...',
  });

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
        altTextMap,
        existingProjectSlugs,
        createdProjectIds,
        errors,
        jobId,
      });
    } catch (error) {
      errors.push(
        `Project "${parsedProject.folderName}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
  altTextMap: Map<string, { altEn: string; altZh: string }>;
  existingProjectSlugs: string[];
  createdProjectIds: string[];
  errors: string[];
  jobId: string;
}): Promise<void> {
  const {
    parsedProject, aiProject, siteId, displayOrder,
    urlMap, altTextMap, existingProjectSlugs,
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

  await updateJob(jobId, {
    currentStepLabel: `Created project: ${projectData.titleEn}`,
    createdProjectIds: [...createdProjectIds],
  });

  // Insert default service scopes
  const defaultScopes = DEFAULT_SCOPES[parsedProject.serviceType] ?? [];
  if (defaultScopes.length > 0) {
    try {
      await db.insert(projectScopes).values(
        defaultScopes.map((scope, idx) => ({
          projectId: insertedProject.id,
          scopeEn: scope.en,
          scopeZh: scope.zh,
          displayOrder: idx,
        }))
      );
    } catch (error) {
      errors.push(
        `Scopes for "${parsedProject.folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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

    // Look up pre-generated alt text
    const altImageUrl = afterUrl || beforeUrl;
    const alt = altImageUrl ? altTextMap.get(altImageUrl) : null;
    const altEn = alt?.altEn || FALLBACK_ALT.en;
    const altZh = alt?.altZh || FALLBACK_ALT.zh;

    try {
      await db.insert(projectImagePairs).values({
        projectId: insertedProject.id,
        beforeImageUrl: beforeUrl,
        beforeAltTextEn: beforeUrl ? `${projectData.titleEn} - Before Renovation ${pairIdx + 1}` : null,
        beforeAltTextZh: beforeUrl ? `${projectData.titleZh} - 装修前 ${pairIdx + 1}` : null,
        afterImageUrl: afterUrl,
        afterAltTextEn: afterUrl ? altEn : null,
        afterAltTextZh: afterUrl ? altZh : null,
        displayOrder: pairIdx,
      });
    } catch (error) {
      errors.push(
        `Image pair ${pairIdx} for "${parsedProject.folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
