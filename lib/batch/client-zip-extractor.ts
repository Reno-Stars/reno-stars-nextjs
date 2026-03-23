/**
 * Client-side ZIP extraction for batch upload.
 * Runs in the browser — uses fflate (already a dependency via zip-parser.ts).
 * Returns a JSON-serializable manifest + a Map of s3Key → Uint8Array for upload.
 */
import { parseZip, parseZipStandalone } from './zip-parser';
import { formatSlug } from '@/lib/utils';
import type {
  BatchUploadMode,
  ClientImage,
  ClientImagePair,
  ClientManifest,
  ClientProject,
  ClientSite,
  ExtractedImage,
  ImagePairEntry,
  ParsedProject,
  ParsedSite,
} from './types';

// ============================================================================
// S3 KEY GENERATION (client-side)
// ============================================================================

function createKeyGenerator() {
  let counter = 0;
  const ts = Date.now().toString(36);
  const rand = crypto.getRandomValues(new Uint8Array(4)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
  return function generateS3Key(slugPrefix: string, image: ExtractedImage): string {
    const ext = image.path.split('.').pop()?.toLowerCase() || 'jpg';
    const basename = image.path.split('/').pop()?.replace(/\.[^.]+$/, '') || 'img';
    const safeBasename = basename.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const seq = (counter++).toString(36);
    return `uploads/admin/${slugPrefix}-${safeBasename}-${ts}${rand}-${seq}.${ext}`;
  };
}

function formatSlugClient(name: string): string {
  return formatSlug(name) || 'batch';
}

// ============================================================================
// CONVERSION HELPERS
// ============================================================================

type KeyGen = (slugPrefix: string, image: ExtractedImage) => string;

function toClientImage(
  image: ExtractedImage,
  slugPrefix: string,
  imageDataMap: Map<string, Uint8Array>,
  genKey: KeyGen,
): ClientImage {
  const s3Key = genKey(slugPrefix, image);
  imageDataMap.set(s3Key, image.data);
  return {
    path: image.path,
    mimeType: image.mimeType,
    size: image.data.length,
    s3Key,
  };
}

function toClientImagePairs(
  pairs: ImagePairEntry[],
  slugPrefix: string,
  imageDataMap: Map<string, Uint8Array>,
  genKey: KeyGen,
): ClientImagePair[] {
  return pairs.map((pair) => ({
    index: pair.index,
    before: pair.before ? toClientImage(pair.before, slugPrefix, imageDataMap, genKey) : null,
    after: pair.after ? toClientImage(pair.after, slugPrefix, imageDataMap, genKey) : null,
  }));
}

function toClientProject(
  project: ParsedProject,
  slugPrefix: string,
  imageDataMap: Map<string, Uint8Array>,
  genKey: KeyGen,
): ClientProject {
  const entries: [number, ClientImage][] = [];
  for (const [idx, img] of project.productImages) {
    entries.push([idx, toClientImage(img, slugPrefix, imageDataMap, genKey)]);
  }
  return {
    folderName: project.folderName,
    serviceType: project.serviceType,
    heroImage: project.heroImage
      ? toClientImage(project.heroImage, slugPrefix, imageDataMap, genKey)
      : null,
    imagePairs: toClientImagePairs(project.imagePairs, slugPrefix, imageDataMap, genKey),
    notes: project.notes,
    productsText: project.productsText,
    productImageEntries: entries,
  };
}

function toClientSite(
  site: ParsedSite,
  imageDataMap: Map<string, Uint8Array>,
  genKey: KeyGen,
): ClientSite {
  const siteSlug = formatSlugClient(site.folderName);
  const siteEntries: [number, ClientImage][] = [];
  for (const [idx, img] of site.productImages) {
    siteEntries.push([idx, toClientImage(img, siteSlug, imageDataMap, genKey)]);
  }
  return {
    folderName: site.folderName,
    heroImage: site.heroImage
      ? toClientImage(site.heroImage, siteSlug, imageDataMap, genKey)
      : null,
    imagePairs: toClientImagePairs(site.imagePairs, siteSlug, imageDataMap, genKey),
    projects: site.projects.map((p) => toClientProject(p, siteSlug, imageDataMap, genKey)),
    notes: site.notes,
    productsText: site.productsText,
    productImageEntries: siteEntries,
  };
}

// ============================================================================
// IMAGE COLLECTION
// ============================================================================

/** Collect all images from a client project into a flat array. */
function collectProjectImages(proj: ClientProject): ClientImage[] {
  const images: ClientImage[] = [];
  if (proj.heroImage) images.push(proj.heroImage);
  for (const pair of proj.imagePairs) {
    if (pair.before) images.push(pair.before);
    if (pair.after) images.push(pair.after);
  }
  for (const [, img] of proj.productImageEntries) {
    images.push(img);
  }
  return images;
}

/** Collect all images from a client site (including child projects) into a flat array. */
function collectSiteImages(site: ClientSite): ClientImage[] {
  const images: ClientImage[] = [];
  if (site.heroImage) images.push(site.heroImage);
  for (const pair of site.imagePairs) {
    if (pair.before) images.push(pair.before);
    if (pair.after) images.push(pair.after);
  }
  for (const [, img] of site.productImageEntries) {
    images.push(img);
  }
  for (const proj of site.projects) {
    images.push(...collectProjectImages(proj));
  }
  return images;
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export interface ExtractResult {
  manifest: ClientManifest;
  imageDataMap: Map<string, Uint8Array>;
}

/**
 * Extract a ZIP file in the browser and return a manifest + image data map.
 * @param file - The ZIP File from the file input
 * @param mode - 'sites' or 'standalone'
 * @param validServiceTypes - Set of valid service type slugs from the DB
 */
export async function extractZipInBrowser(
  file: File,
  mode: BatchUploadMode,
  validServiceTypes?: Set<string>,
): Promise<ExtractResult> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const imageDataMap = new Map<string, Uint8Array>();
  const genKey = createKeyGenerator();

  if (mode === 'standalone') {
    const parsed = await parseZipStandalone(buffer, validServiceTypes);
    const clientProjects = parsed.projects.map((p) => {
      const slug = formatSlugClient(p.folderName);
      return toClientProject(p, slug, imageDataMap, genKey);
    });

    const allImages = clientProjects.flatMap(collectProjectImages);

    return {
      manifest: {
        mode,
        sites: [],
        projects: clientProjects,
        totalImages: parsed.totalImages,
        skippedFiles: parsed.skippedFiles,
        allImages,
      },
      imageDataMap,
    };
  }

  // Sites mode
  const parsed = await parseZip(buffer, validServiceTypes);
  const clientSites = parsed.sites.map((s) => toClientSite(s, imageDataMap, genKey));

  const allImages = clientSites.flatMap(collectSiteImages);

  return {
    manifest: {
      mode,
      sites: clientSites,
      projects: [],
      totalImages: parsed.totalImages,
      skippedFiles: parsed.skippedFiles,
      allImages,
    },
    imageDataMap,
  };
}
