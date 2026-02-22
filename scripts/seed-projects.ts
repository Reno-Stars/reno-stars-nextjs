/**
 * Seed projects by crawling the old WordPress site.
 *
 * Usage:
 *   pnpm db:seed:projects                     # Full pipeline (crawl + AI + seed)
 *   pnpm db:seed:projects -- --skip-ai        # Crawl + placeholder metadata + seed
 *   pnpm db:seed:projects -- --dry-run        # Crawl only, print summary (no DB/AI)
 *   pnpm db:seed:projects -- --dry-run --skip-ai  # Fastest: crawl + summary
 *
 * Pipeline: DISCOVER → CRAWL (EN+ZH) → PAIR IMAGES → AI ENRICH → GROUP INTO SITES → SEED DB
 *
 * NOTE: Run with NEXT_PUBLIC_STORAGE_PROVIDER unset so that raw
 * production URLs are stored in the database. getAssetUrl() is
 * applied at query-time, not at insert-time.
 */

// Load environment variables from .env.local (must be first)
import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../lib/db';
import {
  projects as projectsTable,
  projectImagePairs,
  projectScopes,
  projectExternalProducts,
  projectSites,
  siteImagePairs,
  services as servicesTable,
} from '../lib/db/schema';
import { z } from 'zod';
import { getOpenAIClient, parseJsonResponse, AI_CONFIG } from '../lib/ai/openai';
import {
  STANDALONE_SITE_SLUG,
  SERVICE_TYPE_TO_CATEGORY,
  SERVICE_TYPES,
  type ServiceTypeKey,
} from '../lib/admin/constants';

// ============================================================================
// CLI FLAGS
// ============================================================================

const SKIP_AI = process.argv.includes('--skip-ai');
const DRY_RUN = process.argv.includes('--dry-run');

// ============================================================================
// CONSTANTS
// ============================================================================

const WP_BASE = 'https://reno-stars.com';
const WP_HOSTNAME = new URL(WP_BASE).hostname;
const WP_API_PROJECTS = `${WP_BASE}/wp-json/wp/v2/project`;
const CONCURRENCY = 3;
const FETCH_TIMEOUT = 30_000;
const PAIR_BATCH = 5;

/** Category listing pages on the old WP site (Elementor) — may contain projects not in REST API.
 * NOTE: The site was restructured — old /vancouver-renovation-projects/* URLs return 404.
 * The current category pages live under /projects/*. We also keep the legacy main page as fallback. */
const CATEGORY_PAGES: { url: string; inferredServiceType: ServiceTypeKey | 'whole-house' }[] = [
  // Current category pages
  { url: `${WP_BASE}/projects/kitchen/`, inferredServiceType: 'kitchen' },
  { url: `${WP_BASE}/projects/bathroom/`, inferredServiceType: 'bathroom' },
  { url: `${WP_BASE}/projects/full-house/`, inferredServiceType: 'whole-house' },
  { url: `${WP_BASE}/projects/home-installation/`, inferredServiceType: 'cabinet' },
  { url: `${WP_BASE}/projects/commercial/`, inferredServiceType: 'commercial' },
  // Legacy main page (still has some project links)
  { url: `${WP_BASE}/vancouver-renovation-projects/`, inferredServiceType: 'kitchen' },
];

/** WP category term ID → service type (discovered by inspecting WP REST API responses) */
const WP_CATEGORY_MAP: Record<number, ServiceTypeKey | 'whole-house'> = {
  20: 'kitchen',
  22: 'bathroom',
  23: 'basement',
  24: 'cabinet',
  77: 'whole-house',
  79: 'commercial',
};

/** BC cities for location inference — ordered longest-first to avoid partial matches */
const BC_CITIES = [
  'Port Coquitlam', 'Port Moody', 'New Westminster', 'North Vancouver',
  'West Vancouver', 'White Rock', 'Maple Ridge',
  'Vancouver', 'Burnaby', 'Richmond', 'Surrey', 'Coquitlam',
  'Delta', 'Langley', 'Abbotsford', 'Chilliwack', 'Squamish', 'Victoria',
];

/** Known non-project slugs to skip when scraping category pages */
const NON_PROJECT_SLUGS = new Set([
  'about', 'contact', 'services', 'blog', 'news', 'faq', 'privacy-policy',
  'terms-of-service', 'have-a-project', 'vancouver-renovation-projects',
  'kitchen-renovations', 'bathroom-renovations', 'whole-house-renovations',
  'commercial-renovations', 'design', 'benefits', 'process', 'areas',
  'wp-admin', 'wp-login', 'wp-content', 'wp-json', 'feed',
  'projects', 'vancouver-renovation-blog', 'renovation-blog',
  'sample-page', 'my-account', 'cart', 'checkout', 'shop',
  // New-style category page slugs (these are listing pages, not projects)
  'kitchen', 'bathroom', 'full-house', 'home-installation', 'commercial',
  // Site pages that appear in project listings but aren't projects
  'features-benefits',
  // Listing / gallery pages (not individual projects)
  'kitchen-renovation-section',
  // Duplicate shorter slugs — same projects exist under longer canonical slugs
  'whole-house-renovation-from-kitchen', // → richmond-whole-house-renovation-from-kitchen-to-bedroom
  'whole-house-renovation-from-kitchen-to-bathroom', // → richmond-whole-house-renovation-from-kitchen-to-bedroom
  'vancouver-whole-house-renovation',    // → vancouver-whole-house-renovation-full-home-remodel-and-interior-upgrade
  'kitchen-bathroom-cabinet-refacing-in-coquitlam', // → customized-kitchen-and-bathroom-cabinet-refacing-in-coquitlam
  'richmond-townhouse-whole-house',      // → richmond-townhouse-makeover-kitchen-bathroom-laundry-room
  'condo-renovation-in-surrey-kitchen-bathroom', // → surrey-condo-renovation-kitchen-bathroom-cabinet-pending-light
]);

// ============================================================================
// TYPES
// ============================================================================

interface WPProjectResponse {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  link: string;
  categories?: number[];
  /** Custom taxonomy: WP project_category term IDs */
  project_category?: number[];
}

interface DiscoveredProject {
  slug: string;
  url: string;
  source: 'rest-api' | 'elementor';
  wpCategories: number[];
  wpData?: WPProjectResponse;
  inferredServiceType?: ServiceTypeKey | 'whole-house';
}

interface CrawledImage {
  url: string;
  alt: string;
  role: 'before' | 'after' | 'unknown';
}

interface CrawledProject {
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  heroImageUrl: string;
  images: CrawledImage[];
  inferredServiceType: ServiceTypeKey | 'whole-house';
  wpCategories: number[];
  isWholeHouse: boolean;
}

interface ImagePairData {
  beforeUrl?: string;
  beforeAltEn?: string;
  beforeAltZh?: string;
  afterUrl?: string;
  afterAltEn?: string;
  afterAltZh?: string;
  titleEn?: string;
  titleZh?: string;
}

interface EnrichedProject {
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  serviceType: ServiceTypeKey;
  categoryEn: string;
  categoryZh: string;
  locationCity: string;
  budgetRange?: string;
  durationEn: string;
  durationZh: string;
  spaceTypeEn: string;
  spaceTypeZh: string;
  heroImageUrl: string;
  challengeEn: string;
  challengeZh: string;
  solutionEn: string;
  solutionZh: string;
  badgeEn: string;
  badgeZh: string;
  imagePairs: ImagePairData[];
  scopes: { en: string; zh: string }[];
  isWholeHouse: boolean;
  metaTitleEn?: string;
  metaTitleZh?: string;
  metaDescriptionEn?: string;
  metaDescriptionZh?: string;
  focusKeywordEn?: string;
  focusKeywordZh?: string;
  seoKeywordsEn?: string;
  seoKeywordsZh?: string;
}

interface SiteGroup {
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  locationCity: string;
  heroImageUrl: string;
  projectSlugs: string[];
}

// ============================================================================
// UTILITY FUNCTIONS (patterns copied from seed-blog.ts — scripts are standalone)
// ============================================================================

/** Strip HTML tags and decode common entities. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Remove WordPress boilerplate (comment forms, contact info, JSON metadata) from plain text. */
function stripBoilerplate(text: string): string {
  return text
    // WP comment form boilerplate (EN)
    .replace(/Leave a Reply.*$/i, '')
    .replace(/Cancel reply.*$/i, '')
    // WP comment form boilerplate (ZH)
    .replace(/您的电子邮箱地址不会被公开。.*$/, '')
    .replace(/必填项已用.*$/, '')
    .replace(/在此浏览器中保存我的显示名称.*$/, '')
    .replace(/以便下次评论时使用.*$/, '')
    .replace(/发表评论.*$/, '')
    .replace(/取消回复.*$/, '')
    // Leaked JSON metadata (e.g. ARInfo, FaceliftInfo from beauty plugins)
    .replace(/\{"\w+Info":\{[\s\S]*$/i, '')
    // WP footer contact info that leaks into content
    .replace(/📞\s*Phone:.*$/i, '')
    .replace(/✉\s*Email:.*$/i, '')
    // "Save my name, email..." checkbox label (EN + ZH)
    .replace(/Save my name,?\s*email.*$/i, '')
    .replace(/保存我的显示名称.*$/i, '')
    // Common WP sidebar/widget text
    .replace(/Recent Posts.*$/i, '')
    .replace(/Recent Comments.*$/i, '')
    .trim();
}

/** Check if a string contains Chinese characters. */
function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

/** Decode URL-encoded slug and sanitize to [a-z0-9-]. Truncates to 100 chars (DB varchar limit). */
function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 100);
  } catch {
    return slug.slice(0, 100);
  }
}

/** Run tasks in batches of given concurrency. */
async function batchProcess<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    results.push(...await Promise.all(batch.map(fn)));
  }
  return results;
}

/** Extract article title + content from a WordPress HTML page. */
function extractArticleContent(html: string): { title: string; content: string } | null {
  // Collect title candidates, prefer Chinese text
  const candidates: string[] = [];

  const ogMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i)
    || html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:title"[^>]*>/i);
  if (ogMatch) candidates.push(stripHtml(ogMatch[1]).replace(/\s*[-–|].*$/, ''));

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) candidates.push(stripHtml(titleMatch[1]).replace(/\s*[-–|].*$/, ''));

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) candidates.push(stripHtml(h1Match[1]));

  const title = candidates.find((c) => c && hasChinese(c)) || candidates.find((c) => c) || '';

  // Try entry-content div (assumes standard WP theme structure; Elementor pages may differ)
  let content = '';
  const entryMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>|<div[^>]*class="[^"]*(?:post-|entry-|comment))/i);
  if (entryMatch) content = entryMatch[1];

  // Fallback: extract content tags from body
  if (!content) {
    const bodyMatch = html.match(/<body[\s\S]*<\/body>/i);
    if (bodyMatch) {
      const cleaned = bodyMatch[0]
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<aside[\s\S]*?<\/aside>/gi, '');
      const tags: string[] = [];
      const tagRe = /<(p|h[1-6]|ul|ol|li|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi;
      let m;
      while ((m = tagRe.exec(cleaned)) !== null) {
        const text = stripHtml(m[0]);
        if (text.length > 20 && !text.includes('©') && !text.includes('Cookie')) tags.push(m[0]);
      }
      if (tags.length) content = tags.join('\n');
    }
  }

  if (!content && !title) return null;
  // Clean WP content: remove comment forms, scripts, styles, shortcodes, inline attributes
  const cleaned = content
    // Strip WP comment form and respond section (HTML-level, before tag stripping)
    .replace(/<div[^>]*id="respond"[\s\S]*$/i, '')
    .replace(/<section[^>]*id="respond"[\s\S]*$/i, '')
    .replace(/<form[^>]*class="[^"]*comment-form[\s\S]*?<\/form>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\[\/?\w+[^\]]*\]/g, '')
    .replace(/ style="[^"]*"/g, '')
    .replace(/ class="[^"]*"/g, '')
    .replace(/ data-[\w-]+="[^"]*"/g, '')
    .replace(/ id="[^"]*"/g, '')
    .replace(/<div>\s*<\/div>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { title, content: cleaned };
}

/** Fetch with AbortController timeout. */
async function crawlFetch(url: string, timeout = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Strip WordPress dimension suffixes (-300x200), ensure absolute URL, enforce HTTPS, encode non-ASCII chars. */
function normalizeImageUrl(url: string): string {
  if (url.startsWith('/')) url = WP_BASE + url;
  if (url.startsWith('//')) url = 'https:' + url;
  // Enforce HTTPS (next/image remotePatterns requires https for reno-stars.com)
  url = url.replace(/^http:\/\//i, 'https://');
  // Strip WP thumbnail dimension suffixes (-300x200 or -300×200) and -scaled / -mfrh-original-scaled
  // WordPress uses both 'x' and '×' (U+00D7 multiplication sign), and may have double extensions (.png.webp)
  url = url.replace(/-\d+[x\u00d7]\d+(\.[a-z]+(?:\.[a-z]+)?)$/i, '$1');
  url = url.replace(/-(?:mfrh-original-)?scaled(\.[a-z]+(?:\.[a-z]+)?)$/i, '$1');
  // Encode non-ASCII characters (Chinese filenames etc.) for safe DB storage
  // encodeURI keeps /:?#[]@!$&'()*+,;= intact but encodes multibyte chars
  try { url = encodeURI(decodeURI(url)); } catch { url = encodeURI(url); }
  return url;
}

/**
 * Sanitize text for safe insertion via Neon HTTP driver.
 * Neon sends queries as JSON over HTTP. Invalid escape sequences break parsing.
 * Strip all backslashes — renovation project content has no legitimate use for them.
 */
function sanitizeText(text: string): string {
  return text
    .replace(/\\/g, '')  // Remove all backslashes
    // eslint-disable-next-line no-control-regex
    .replace(/\x00/g, '') // Remove null bytes
    // eslint-disable-next-line no-control-regex
    .replace(/[\x01-\x08\x0b\x0c\x0e-\x1f]/g, '') // Remove control characters
    // Remove lone surrogates (can appear when .slice() splits a surrogate pair / emoji)
    .replace(/[\ud800-\udbff](?![\udc00-\udfff])/g, '')  // lone high surrogate
    .replace(/(?<![\ud800-\udbff])[\udc00-\udfff]/g, ''); // lone low surrogate
}

/** Extract project slug from a WP page URL. Returns null for non-project URLs. */
function extractSlugFromUrl(href: string): string | null {
  try {
    const u = new URL(href, WP_BASE);
    if (u.hostname !== WP_HOSTNAME) return null;
    // Strip locale prefixes and known path prefixes
    let path = u.pathname.replace(/^\/(en|zh)\//, '/');
    path = path.replace(/^\/project\//, '/');
    path = path.replace(/^\/projects\//, '/');
    const segments = path.split('/').filter(Boolean);
    // Accept last segment as slug (handles /projects/category/slug/ and /slug/)
    if (segments.length === 0 || segments.length > 2) return null;
    const slug = decodeSlug(segments[segments.length - 1]);
    if (!slug || slug.length < 4 || NON_PROJECT_SLUGS.has(slug)) return null;
    return slug;
  } catch {
    return null;
  }
}

/** Classify image role from filename patterns. */
function classifyImageRole(url: string): 'before' | 'after' | 'unknown' {
  const filename = (url.split('/').pop() || '').toLowerCase();
  if (/before/i.test(filename)) return 'before';
  if (/after/i.test(filename)) return 'after';
  return 'unknown';
}

/** Infer service type from WP categories, title keywords, or fallback. */
function inferServiceType(
  wpCategories: number[],
  title: string,
  fallback?: ServiceTypeKey | 'whole-house',
): ServiceTypeKey | 'whole-house' {
  // Try WP categories first
  for (const catId of wpCategories) {
    const mapped = WP_CATEGORY_MAP[catId];
    if (mapped) return mapped;
  }
  // Title keyword inference
  if (/kitchen|cabinet/i.test(title)) return 'kitchen';
  if (/bath|shower|vanit/i.test(title)) return 'bathroom';
  if (/basement|下/i.test(title)) return 'basement';
  if (/commercial|商业|office|store/i.test(title)) return 'commercial';
  if (/whole[\s-]house|full[\s-]house|full[\s-]home|全屋/i.test(title)) return 'whole-house';
  return fallback || 'kitchen';
}

/** Infer location city from title and description text. */
function inferLocationCity(title: string, description: string): string {
  const text = `${title} ${description}`;
  for (const city of BC_CITIES) {
    if (text.toLowerCase().includes(city.toLowerCase())) return city;
  }
  return 'Vancouver';
}

/** Filename patterns for non-project images (logos, headers, placeholders, stock photos). */
const NON_PROJECT_IMAGE_RE = /logo|favicon|banner|header|placeholder|loading|spinner|avatar|icon|social|facebook|instagram|whatsapp|wechat|xiaohongshu|\.svg|renostars|\.psd|2x2/i;

/** Known stock photo filenames to exclude (after normalization strips dimensions). */
const STOCK_PHOTO_STEMS = new Set(['11-3']);

/** Check if a normalized URL is a non-project image (stock photo, icon, logo, etc.) */
function isNonProjectImage(normalizedUrl: string): boolean {
  const filename = normalizedUrl.split('/').pop() || '';
  // Decode percent-encoded chars for accurate filename matching
  let decoded = filename;
  try { decoded = decodeURIComponent(filename); } catch { /* keep encoded */ }
  if (NON_PROJECT_IMAGE_RE.test(decoded)) return true;
  // Check against known stock photo stems (filename without extensions)
  const stem = decoded.replace(/\.[a-z]+(\.[a-z]+)?$/i, '');
  return STOCK_PHOTO_STEMS.has(stem.toLowerCase());
}

/** Extract all project images from HTML content, filtering out site chrome images.
 * Parses Happy Addons gallery filter buttons (After/Before tabs) to classify
 * images by role when available, falling back to filename-based classification. */
function extractImages(html: string): CrawledImage[] {
  // Parse Happy Addons gallery filter buttons to map __fltr-N → role
  // e.g. <button data-filter=".__fltr-1">After</button>
  //      <button data-filter=".__fltr-2">Before</button>
  const galleryBeforeFilters = new Set<string>();
  const galleryAfterFilters = new Set<string>();
  const filterBtnRe = /data-filter="\.__fltr-(\d+)">(After|Before|之后|之前)<\/button/gi;
  let fm;
  while ((fm = filterBtnRe.exec(html)) !== null) {
    if (fm[2] === 'Before' || fm[2] === '之前') galleryBeforeFilters.add(fm[1]);
    else galleryAfterFilters.add(fm[1]);
  }
  const hasGalleryFilters = galleryBeforeFilters.size > 0 || galleryAfterFilters.size > 0;

  // Build sets of image URLs tagged by their gallery container's filter class
  const beforeUrlsFromGallery = new Set<string>();
  const afterUrlsFromGallery = new Set<string>();
  if (hasGalleryFilters) {
    // Match: <div/a class="...ha-justified-grid__item...__fltr-N...">...<img data-lazy-src="URL">
    const galleryItemRe = /class="[^"]*ha-justified-grid__item[^"]*__fltr-(\d+)[^"]*"[\s\S]*?data-lazy-src="([^"]+)"/g;
    let gm;
    while ((gm = galleryItemRe.exec(html)) !== null) {
      const normalized = normalizeImageUrl(gm[2]);
      if (isNonProjectImage(normalized)) continue;
      if (galleryBeforeFilters.has(gm[1])) beforeUrlsFromGallery.add(normalized);
      else if (galleryAfterFilters.has(gm[1])) afterUrlsFromGallery.add(normalized);
    }
  }

  // When galleries exist, ONLY extract images from gallery containers.
  // This excludes CTA stock photos, related-website images, and other non-project content.
  if (beforeUrlsFromGallery.size > 0 || afterUrlsFromGallery.size > 0) {
    const images: CrawledImage[] = [];
    for (const url of beforeUrlsFromGallery) {
      images.push({ url, alt: '', role: 'before' });
    }
    for (const url of afterUrlsFromGallery) {
      images.push({ url, alt: '', role: 'after' });
    }
    return images;
  }

  // Fallback for pages without gallery filters (REST API / Gutenberg pages):
  // extract all wp-content/uploads images from the content area.
  const cleaned = html
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '');

  const images: CrawledImage[] = [];
  const seen = new Set<string>();
  const imgRe = /<img[^>]+>/gi;
  let m;
  while ((m = imgRe.exec(cleaned)) !== null) {
    const tag = m[0];
    const dataSrc = tag.match(/data-(?:lazy-)?src="([^"]*)"/i);
    const src = tag.match(/\bsrc="([^"]*)"/i);
    const rawUrl = dataSrc?.[1] || src?.[1];
    if (!rawUrl || !rawUrl.includes('wp-content/uploads')) continue;

    // Classify role from raw URL before percent-encoding
    const role = classifyImageRole(rawUrl);
    const url = normalizeImageUrl(rawUrl);
    if (seen.has(url)) continue;
    if (isNonProjectImage(url)) continue;
    seen.add(url);

    const altMatch = tag.match(/alt="([^"]*)"/i);
    images.push({ url, alt: altMatch ? stripHtml(altMatch[1]) : '', role });
  }
  return images;
}

// ============================================================================
// PHASE 1: DISCOVERY
// ============================================================================

async function discoverProjects(): Promise<Map<string, DiscoveredProject>> {
  const map = new Map<string, DiscoveredProject>();

  // Step A — REST API (higher priority, richer metadata)
  console.log('Discovering projects via REST API...');
  let page = 1;
  let restCount = 0;
  while (true) {
    try {
      const url = `${WP_API_PROJECTS}?per_page=100&page=${page}`;
      const res = await crawlFetch(url);
      if (!res.ok) break;
      const data: WPProjectResponse[] = await res.json();
      if (data.length === 0) break;

      for (const wp of data) {
        const slug = decodeSlug(wp.slug);
        if (!slug || NON_PROJECT_SLUGS.has(slug)) continue;
        // Extract categories from standard and custom taxonomy fields
        const cats: number[] = [];
        if (Array.isArray(wp.categories)) cats.push(...wp.categories);
        if (Array.isArray(wp.project_category)) cats.push(...wp.project_category);
        map.set(slug, {
          slug,
          url: wp.link || `${WP_BASE}/project/${slug}/`,
          source: 'rest-api',
          wpCategories: [...new Set(cats)],
          wpData: wp,
        });
        restCount++;
      }
      if (data.length < 100) break;
      page++;
    } catch (err) {
      console.log(`  REST API page ${page} failed: ${err instanceof Error ? err.message : err}`);
      break;
    }
  }
  console.log(`  Found ${restCount} projects via REST API`);

  // Step B — Category listing pages (Elementor-only projects, fetched in parallel)
  console.log('Discovering projects from category pages...');
  let elementorCount = 0;
  const categoryResults = await Promise.all(
    CATEGORY_PAGES.map(async ({ url, inferredServiceType }) => {
      try {
        const res = await crawlFetch(url);
        if (!res.ok) return [];
        const html = await res.text();
        const found: { slug: string; href: string; inferredServiceType: ServiceTypeKey | 'whole-house' }[] = [];
        const linkRe = /<a[^>]*href="([^"]*)"[^>]*>/gi;
        let lm;
        while ((lm = linkRe.exec(html)) !== null) {
          const slug = extractSlugFromUrl(lm[1]);
          if (slug) found.push({ slug, href: lm[1], inferredServiceType });
        }
        return found;
      } catch { return []; }
    }),
  );
  for (const entries of categoryResults) {
    for (const { slug, href, inferredServiceType } of entries) {
      if (!map.has(slug)) {
        map.set(slug, {
          slug,
          url: href.startsWith('http') ? href : `${WP_BASE}${href}`,
          source: 'elementor',
          wpCategories: [],
          inferredServiceType,
        });
        elementorCount++;
      }
    }
  }
  console.log(`  Found ${elementorCount} additional projects from category pages`);

  // Step C — Post sitemap (catches regular WP posts that are project pages but not in category listings)
  console.log('Discovering projects from post sitemap...');
  let sitemapCount = 0;
  try {
    const sitemapRes = await crawlFetch(`${WP_BASE}/post-sitemap.xml`);
    if (sitemapRes.ok) {
      const xml = await sitemapRes.text();
      // Extract <loc> URLs from sitemap XML
      const locRe = /<loc>([^<]+)<\/loc>/gi;
      let sm;
      while ((sm = locRe.exec(xml)) !== null) {
        const slug = extractSlugFromUrl(sm[1]);
        if (slug && !map.has(slug)) {
          map.set(slug, {
            slug,
            url: sm[1],
            source: 'elementor',
            wpCategories: [],
          });
          sitemapCount++;
        }
      }
    }
  } catch { /* sitemap fetch is supplementary */ }
  console.log(`  Found ${sitemapCount} additional projects from post sitemap`);

  console.log(`  Total discovered: ${map.size} unique projects\n`);
  return map;
}

// ============================================================================
// PHASE 2: CRAWL
// ============================================================================

/** Extract og:image URL from HTML page. */
function extractOgImage(html: string): string {
  const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i)
    || html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"[^>]*>/i);
  return ogMatch ? normalizeImageUrl(ogMatch[1]) : '';
}

/** Crawl a project from the REST API (structured JSON + supplementary page HTML). */
async function crawlFromRestApi(
  wp: WPProjectResponse,
  pageUrl: string,
): Promise<{ titleEn: string; descriptionEn: string; heroImageUrl: string; images: CrawledImage[] }> {
  const titleEn = stripHtml(wp.title.rendered);
  const descriptionEn = stripBoilerplate(stripHtml(wp.content.rendered)).slice(0, 500);
  let heroImageUrl = '';

  // Fetch featured media URL
  if (wp.featured_media) {
    try {
      const mediaRes = await crawlFetch(`${WP_BASE}/wp-json/wp/v2/media/${wp.featured_media}?_fields=source_url`);
      if (mediaRes.ok) {
        const media = await mediaRes.json() as { source_url?: string };
        heroImageUrl = media.source_url ? normalizeImageUrl(media.source_url) : '';
      }
    } catch { /* will fall back to first image */ }
  }

  // Fetch the rendered page HTML — prefer gallery-extracted images over content.rendered
  // because content.rendered includes CTA stock photos that galleries filter out.
  let images: CrawledImage[] = [];
  try {
    const pageRes = await crawlFetch(pageUrl);
    if (pageRes.ok) {
      const pageHtml = await pageRes.text();
      images = extractImages(pageHtml);
      if (!heroImageUrl) heroImageUrl = extractOgImage(pageHtml);
    }
  } catch { /* page fetch is supplementary */ }

  // Fallback to content.rendered images only if page fetch yielded nothing
  if (images.length === 0) {
    images = extractImages(wp.content.rendered);
  }

  return { titleEn, descriptionEn, heroImageUrl, images };
}

/** Crawl a project from an Elementor page (raw HTML only). */
async function crawlFromElementorPage(
  url: string,
  slug: string,
): Promise<{ titleEn: string; descriptionEn: string; heroImageUrl: string; images: CrawledImage[] } | null> {
  const res = await crawlFetch(url);
  if (!res.ok) {
    console.log(`  ✗ ${slug} (HTTP ${res.status})`);
    return null;
  }
  const html = await res.text();
  const extracted = extractArticleContent(html);
  if (!extracted) {
    console.log(`  ✗ ${slug} (no content found)`);
    return null;
  }
  return {
    titleEn: extracted.title,
    descriptionEn: stripBoilerplate(stripHtml(extracted.content)).slice(0, 500),
    heroImageUrl: extractOgImage(html),
    images: extractImages(html),
  };
}

/** Crawl ZH content for a project, trying multiple URL paths. */
async function crawlZhContent(
  slug: string,
  source: 'rest-api' | 'elementor',
  fallbackTitleZh: string,
  fallbackDescZh: string,
): Promise<{ titleZh: string; descriptionZh: string }> {
  const zhPaths = source === 'rest-api'
    ? [`/zh/project/${slug}/`, `/zh/${slug}/`]
    : [`/zh/${slug}/`, `/zh/project/${slug}/`];

  for (const path of zhPaths) {
    try {
      const zhRes = await crawlFetch(`${WP_BASE}${path}`);
      if (!zhRes.ok) continue;
      const zhHtml = await zhRes.text();
      const zhExtracted = extractArticleContent(zhHtml);
      if (zhExtracted && hasChinese(zhExtracted.title)) {
        return {
          titleZh: zhExtracted.title,
          descriptionZh: stripBoilerplate(stripHtml(zhExtracted.content)).slice(0, 500),
        };
      }
    } catch { /* try next ZH URL */ }
  }
  return { titleZh: fallbackTitleZh, descriptionZh: fallbackDescZh };
}

async function crawlProject(discovered: DiscoveredProject): Promise<CrawledProject | null> {
  try {
    let result: { titleEn: string; descriptionEn: string; heroImageUrl: string; images: CrawledImage[] } | null;

    if (discovered.source === 'rest-api' && discovered.wpData) {
      result = await crawlFromRestApi(discovered.wpData, discovered.url);
    } else {
      result = await crawlFromElementorPage(discovered.url, discovered.slug);
    }
    if (!result) return null;

    const { titleEn, descriptionEn, images } = result;
    let { heroImageUrl } = result;
    // If the hero image (from og:image or featured_media) is a stock/non-project image, discard it
    if (heroImageUrl && isNonProjectImage(heroImageUrl)) heroImageUrl = '';
    if (!heroImageUrl && images.length > 0) heroImageUrl = images[0].url;

    const { titleZh, descriptionZh } = await crawlZhContent(
      discovered.slug, discovered.source, titleEn, descriptionEn,
    );

    const inferredServiceType = inferServiceType(discovered.wpCategories, titleEn, discovered.inferredServiceType);
    const isWholeHouse = discovered.wpCategories.includes(77)
      || /whole[\s-]house|full[\s-]house|full[\s-]home|全屋/i.test(`${titleEn} ${titleZh}`);

    console.log(`  ✓ ${discovered.slug} (${images.length} imgs, ${hasChinese(titleZh) ? 'ZH' : 'EN only'}, ${inferredServiceType})`);

    return {
      slug: discovered.slug,
      titleEn, titleZh,
      descriptionEn, descriptionZh,
      heroImageUrl,
      images,
      inferredServiceType,
      wpCategories: discovered.wpCategories,
      isWholeHouse,
    };
  } catch (err) {
    console.log(`  ✗ ${discovered.slug} (${err instanceof Error ? err.message : 'error'})`);
    return null;
  }
}

// ============================================================================
// PHASE 3: IMAGE PAIRING
// ============================================================================

function pairImages(images: CrawledImage[]): ImagePairData[] {
  const pairs: ImagePairData[] = [];

  const befores = images.filter(img => img.role === 'before');
  const afters = images.filter(img => img.role === 'after');
  const unknowns = images.filter(img => img.role === 'unknown');

  // Pair before/after by index (1st before ↔ 1st after, etc.)
  const pairedCount = Math.min(befores.length, afters.length);
  for (let k = 0; k < pairedCount; k++) {
    pairs.push({
      beforeUrl: befores[k].url, beforeAltEn: befores[k].alt || undefined,
      afterUrl: afters[k].url, afterAltEn: afters[k].alt || undefined,
    });
  }

  // Leftover befores → before-only
  for (let k = pairedCount; k < befores.length; k++) {
    pairs.push({ beforeUrl: befores[k].url, beforeAltEn: befores[k].alt || undefined });
  }

  // Leftover afters → after-only
  for (let k = pairedCount; k < afters.length; k++) {
    pairs.push({ afterUrl: afters[k].url, afterAltEn: afters[k].alt || undefined });
  }

  // Unknown-role images → after-only
  for (const img of unknowns) {
    pairs.push({ afterUrl: img.url, afterAltEn: img.alt || undefined });
  }

  return pairs;
}

// ============================================================================
// PHASE 4: AI ENRICHMENT
// ============================================================================

const CrawlerEnrichmentSchema = z.object({
  serviceType: z.enum(SERVICE_TYPES),
  budgetRange: z.string(),
  durationEn: z.string(),
  durationZh: z.string(),
  spaceTypeEn: z.string(),
  spaceTypeZh: z.string(),
  challengeEn: z.string(),
  challengeZh: z.string(),
  solutionEn: z.string(),
  solutionZh: z.string(),
  scopes: z.array(z.object({ en: z.string(), zh: z.string() })).min(3).max(7),
  badgeEn: z.string(),
  badgeZh: z.string(),
  titleEn: z.string(),
  titleZh: z.string(),
  descriptionEn: z.string(),
  descriptionZh: z.string(),
  locationCity: z.string(),
  metaTitleEn: z.string(),
  metaTitleZh: z.string(),
  metaDescriptionEn: z.string(),
  metaDescriptionZh: z.string(),
  focusKeywordEn: z.string(),
  focusKeywordZh: z.string(),
  seoKeywordsEn: z.string(),
  seoKeywordsZh: z.string(),
});

function buildPlaceholderEnrichment(crawled: CrawledProject): EnrichedProject {
  const serviceType: ServiceTypeKey = crawled.inferredServiceType === 'whole-house'
    ? 'kitchen' : crawled.inferredServiceType;
  const cat = SERVICE_TYPE_TO_CATEGORY[serviceType];
  const city = inferLocationCity(crawled.titleEn, crawled.descriptionEn);
  const imagePairs = pairImages(crawled.images);

  return {
    slug: crawled.slug,
    titleEn: crawled.titleEn || `${city} ${cat.en} Renovation`,
    titleZh: crawled.titleZh || crawled.titleEn,
    descriptionEn: crawled.descriptionEn || `${cat.en} renovation project in ${city}.`,
    descriptionZh: crawled.descriptionZh || crawled.descriptionEn,
    serviceType,
    categoryEn: cat.en,
    categoryZh: cat.zh,
    locationCity: city,
    budgetRange: undefined,
    durationEn: '3-4 weeks',
    durationZh: '3-4周',
    spaceTypeEn: 'Residential',
    spaceTypeZh: '住宅',
    heroImageUrl: crawled.heroImageUrl,
    challengeEn: `Outdated ${cat.en.toLowerCase()} space requiring modernization.`,
    challengeZh: `过时的${cat.zh}空间需要现代化改造。`,
    solutionEn: `Complete ${cat.en.toLowerCase()} renovation with modern fixtures and finishes.`,
    solutionZh: `全面的${cat.zh}翻新，配备现代设备和饰面。`,
    badgeEn: '',
    badgeZh: '',
    imagePairs,
    scopes: [
      { en: 'Demolition & Prep', zh: '拆除和准备' },
      { en: 'Installation', zh: '安装' },
      { en: 'Finishing', zh: '装饰收尾' },
    ],
    isWholeHouse: crawled.isWholeHouse,
  };
}

async function enrichProject(crawled: CrawledProject): Promise<EnrichedProject> {
  if (SKIP_AI) return buildPlaceholderEnrichment(crawled);

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: AI_CONFIG.model,
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokensProjectDescription,
      messages: [
        {
          role: 'system',
          content: `You are a renovation project metadata generator. Given crawled project data, produce structured JSON with improved bilingual (EN/ZH) content and metadata. Service types: ${SERVICE_TYPES.join(', ')}. Output JSON only, no markdown.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            slug: crawled.slug,
            titleEn: crawled.titleEn,
            titleZh: crawled.titleZh,
            descriptionExcerptEn: crawled.descriptionEn.slice(0, 300),
            descriptionExcerptZh: crawled.descriptionZh.slice(0, 300),
            imageCount: crawled.images.length,
            inferredServiceType: crawled.inferredServiceType,
            wpCategories: crawled.wpCategories,
            instruction: 'Generate: serviceType (from enum), budgetRange ($X,000-$Y,000), durationEn/Zh, spaceTypeEn/Zh, challengeEn/Zh, solutionEn/Zh, scopes (3-7 bilingual), badgeEn/Zh (2-3 words or empty), improved titleEn/Zh, descriptionEn/Zh, locationCity (BC city), SEO fields (metaTitleEn/Zh max 70 chars, metaDescriptionEn/Zh max 155 chars, focusKeywordEn/Zh max 50 chars, seoKeywordsEn/Zh comma-separated).',
          }),
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    const parsed = CrawlerEnrichmentSchema.parse(parseJsonResponse(content));
    const imagePairs = pairImages(crawled.images);
    const s = sanitizeText; // sanitize AI output for safe Neon HTTP insertion

    return {
      slug: crawled.slug,
      titleEn: s(parsed.titleEn),
      titleZh: s(parsed.titleZh),
      descriptionEn: s(parsed.descriptionEn),
      descriptionZh: s(parsed.descriptionZh),
      serviceType: parsed.serviceType,
      categoryEn: SERVICE_TYPE_TO_CATEGORY[parsed.serviceType].en,
      categoryZh: SERVICE_TYPE_TO_CATEGORY[parsed.serviceType].zh,
      locationCity: parsed.locationCity,
      budgetRange: parsed.budgetRange,
      durationEn: s(parsed.durationEn),
      durationZh: s(parsed.durationZh),
      spaceTypeEn: s(parsed.spaceTypeEn),
      spaceTypeZh: s(parsed.spaceTypeZh),
      heroImageUrl: crawled.heroImageUrl,
      challengeEn: s(parsed.challengeEn),
      challengeZh: s(parsed.challengeZh),
      solutionEn: s(parsed.solutionEn),
      solutionZh: s(parsed.solutionZh),
      badgeEn: s(parsed.badgeEn),
      badgeZh: s(parsed.badgeZh),
      imagePairs,
      scopes: parsed.scopes.map(sc => ({ en: s(sc.en), zh: s(sc.zh) })),
      isWholeHouse: crawled.isWholeHouse,
      metaTitleEn: s(parsed.metaTitleEn),
      metaTitleZh: s(parsed.metaTitleZh),
      metaDescriptionEn: s(parsed.metaDescriptionEn),
      metaDescriptionZh: s(parsed.metaDescriptionZh),
      focusKeywordEn: s(parsed.focusKeywordEn),
      focusKeywordZh: s(parsed.focusKeywordZh),
      seoKeywordsEn: s(parsed.seoKeywordsEn),
      seoKeywordsZh: s(parsed.seoKeywordsZh),
    };
  } catch (err) {
    console.log(`  ⚠ AI enrichment failed for ${crawled.slug}: ${err instanceof Error ? err.message : err}`);
    console.log(`    Falling back to placeholder enrichment`);
    return buildPlaceholderEnrichment(crawled);
  }
}

// ============================================================================
// PHASE 5: SITE GROUPING
// ============================================================================

function groupIntoSites(enriched: EnrichedProject[]): { sites: SiteGroup[]; standalone: EnrichedProject[] } {
  const sites: SiteGroup[] = [];
  const standalone: EnrichedProject[] = [];

  for (const p of enriched) {
    if (p.isWholeHouse) {
      // Each whole-house project is a specific renovation job → its own site
      sites.push({
        slug: p.slug,
        titleEn: p.titleEn,
        titleZh: p.titleZh,
        descriptionEn: p.descriptionEn,
        descriptionZh: p.descriptionZh,
        locationCity: p.locationCity,
        heroImageUrl: p.heroImageUrl,
        projectSlugs: [p.slug],
      });
    } else {
      standalone.push(p);
    }
  }

  return { sites, standalone };
}

// ============================================================================
// PHASE 6: DATABASE SEEDING
// ============================================================================

/** WARNING: Deletes ALL projects and sites. Any manually-added admin content will be lost. */
async function clearExistingData() {
  console.log('Clearing existing project data...');
  // Delete in FK order
  await db.delete(projectExternalProducts);
  await db.delete(projectScopes);
  await db.delete(projectImagePairs);
  await db.delete(projectsTable);
  await db.delete(siteImagePairs);
  await db.delete(projectSites);
  console.log('  Cleared all projects, sites, and related data');
}

async function seedSites(siteGroups: SiteGroup[]): Promise<Map<string, string>> {
  console.log('Seeding sites...');
  const siteIdMap = new Map<string, string>();

  for (const site of siteGroups) {
    const [inserted] = await db
      .insert(projectSites)
      .values({
        slug: site.slug,
        titleEn: sanitizeText(site.titleEn),
        titleZh: sanitizeText(site.titleZh),
        descriptionEn: sanitizeText(site.descriptionEn),
        descriptionZh: sanitizeText(site.descriptionZh),
        locationCity: site.locationCity,
        heroImageUrl: site.heroImageUrl,
        showAsProject: true,
        featured: false,
        isPublished: true,
        publishedAt: new Date(),
      })
      .returning({ id: projectSites.id });

    siteIdMap.set(site.slug, inserted.id);

    // Map each project slug to the site ID for lookup during project seeding
    for (const pSlug of site.projectSlugs) {
      siteIdMap.set(`project:${pSlug}`, inserted.id);
    }

    console.log(`  Created site: ${site.slug} (${site.projectSlugs.length} projects)`);
  }

  return siteIdMap;
}

async function seedDefaultSite(): Promise<string> {
  const [defaultSite] = await db
    .insert(projectSites)
    .values({
      slug: STANDALONE_SITE_SLUG,
      titleEn: 'Individual Projects',
      titleZh: '独立项目',
      descriptionEn: 'Collection of individual renovation projects.',
      descriptionZh: '独立装修项目集合。',
      showAsProject: false,
      featured: false,
      isPublished: true,
      publishedAt: new Date(),
    })
    .returning({ id: projectSites.id });

  console.log(`  Created default site: ${STANDALONE_SITE_SLUG}`);
  return defaultSite.id;
}

async function seedProjects(
  enriched: EnrichedProject[],
  siteIdMap: Map<string, string>,
  defaultSiteId: string,
) {
  console.log('Seeding projects...');

  // Look up service IDs
  const serviceRows = await db.select({ slug: servicesTable.slug, id: servicesTable.id }).from(servicesTable);
  const serviceMap = new Map(serviceRows.map((s: { slug: string; id: string }) => [s.slug, s.id]));

  let seeded = 0;
  let failed = 0;
  for (const p of enriched) {
    try {
      const serviceId = serviceMap.get(p.serviceType) ?? null;
      const siteId = siteIdMap.get(`project:${p.slug}`) ?? defaultSiteId;

      const s = sanitizeText; // alias
      const [inserted] = await db
        .insert(projectsTable)
        .values({
          slug: p.slug,
          titleEn: s(p.titleEn),
          titleZh: s(p.titleZh),
          descriptionEn: s(p.descriptionEn),
          descriptionZh: s(p.descriptionZh),
          serviceType: p.serviceType,
          serviceId,
          categoryEn: p.categoryEn,
          categoryZh: p.categoryZh,
          locationCity: p.locationCity,
          budgetRange: p.budgetRange || null,
          durationEn: p.durationEn,
          durationZh: p.durationZh,
          spaceTypeEn: p.spaceTypeEn,
          spaceTypeZh: p.spaceTypeZh,
          heroImageUrl: s(p.heroImageUrl),
          challengeEn: s(p.challengeEn),
          challengeZh: s(p.challengeZh),
          solutionEn: s(p.solutionEn),
          solutionZh: s(p.solutionZh),
          featured: false,
          badgeEn: p.badgeEn || null,
          badgeZh: p.badgeZh || null,
          metaTitleEn: p.metaTitleEn ? s(p.metaTitleEn) : null,
          metaTitleZh: p.metaTitleZh ? s(p.metaTitleZh) : null,
          metaDescriptionEn: p.metaDescriptionEn ? s(p.metaDescriptionEn) : null,
          metaDescriptionZh: p.metaDescriptionZh ? s(p.metaDescriptionZh) : null,
          focusKeywordEn: p.focusKeywordEn || null,
          focusKeywordZh: p.focusKeywordZh || null,
          seoKeywordsEn: p.seoKeywordsEn || null,
          seoKeywordsZh: p.seoKeywordsZh || null,
          isPublished: true,
          publishedAt: new Date(),
          siteId,
        })
        .returning({ id: projectsTable.id });

      const projectId = inserted.id;

      // Insert child records in parallel. Note: if one batch fails, others may
      // have already committed — re-run the full seed to fix inconsistencies.
      const insertions: Promise<unknown>[] = [];

      if (p.imagePairs.length > 0) {
        // Truncation helpers to respect DB varchar limits
        const url500 = (v?: string) => v ? s(v).slice(0, 500) : null;
        const alt255 = (v?: string) => v ? s(v).slice(0, 255) : null;
        const title200 = (v?: string) => v ? s(v).slice(0, 200) : null;

        // Insert image pairs in batches to avoid Neon HTTP body size limits
        for (let i = 0; i < p.imagePairs.length; i += PAIR_BATCH) {
          const batch = p.imagePairs.slice(i, i + PAIR_BATCH);
          insertions.push(db.insert(projectImagePairs).values(
            batch.map((pair, j) => ({
              projectId,
              beforeImageUrl: url500(pair.beforeUrl),
              beforeAltTextEn: alt255(pair.beforeAltEn),
              beforeAltTextZh: alt255(pair.beforeAltZh),
              afterImageUrl: url500(pair.afterUrl),
              afterAltTextEn: alt255(pair.afterAltEn),
              afterAltTextZh: alt255(pair.afterAltZh),
              titleEn: title200(pair.titleEn),
              titleZh: title200(pair.titleZh),
              displayOrder: i + j,
            })),
          ));
        }
      }

      if (p.scopes.length > 0) {
        insertions.push(db.insert(projectScopes).values(
          p.scopes.map((scope, i) => ({
            projectId,
            scopeEn: s(scope.en),
            scopeZh: s(scope.zh),
            displayOrder: i,
          })),
        ));
      }

      await Promise.all(insertions);

      const inSite = siteId !== defaultSiteId;
      console.log(`  Seeded: ${p.slug} (${p.imagePairs.length} pairs${inSite ? ', in site' : ''})`);
      seeded++;
    } catch (err) {
      console.error(`  ✗ Failed to seed ${p.slug}: ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log(`\nSeeded ${seeded} projects${failed > 0 ? ` (${failed} failed)` : ''}`);
}

// ============================================================================
// DRY RUN SUMMARY
// ============================================================================

function printDryRunSummary(
  enriched: EnrichedProject[],
  sites: SiteGroup[],
  standalone: EnrichedProject[],
) {
  console.log('\n========================================');
  console.log('DRY RUN SUMMARY (no DB changes made)');
  console.log('========================================\n');

  console.log(`Total projects: ${enriched.length}`);
  console.log(`Sites: ${sites.length}`);
  console.log(`Standalone projects: ${standalone.length}\n`);

  // Service type breakdown
  const byType = new Map<string, number>();
  for (const p of enriched) {
    byType.set(p.serviceType, (byType.get(p.serviceType) ?? 0) + 1);
  }
  console.log('Service types:');
  for (const [type, count] of byType) {
    console.log(`  ${type}: ${count}`);
  }

  // Sites with their projects
  if (sites.length > 0) {
    console.log('\nSites:');
    for (const site of sites) {
      console.log(`  ${site.slug} (${site.locationCity})`);
      for (const pSlug of site.projectSlugs) {
        const p = enriched.find(e => e.slug === pSlug);
        console.log(`    └ ${pSlug} (${p?.serviceType ?? '?'}, ${p?.imagePairs.length ?? 0} pairs)`);
      }
    }
  }

  // Standalone projects
  if (standalone.length > 0) {
    console.log('\nStandalone projects:');
    for (const p of standalone) {
      console.log(`  ${p.slug} (${p.serviceType}, ${p.locationCity}, ${p.imagePairs.length} pairs)`);
    }
  }

  // Image stats
  const totalPairs = enriched.reduce((sum, p) => sum + p.imagePairs.length, 0);
  const pairsWithBefore = enriched.reduce((sum, p) => sum + p.imagePairs.filter(ip => ip.beforeUrl).length, 0);
  console.log(`\nImages: ${totalPairs} total pairs (${pairsWithBefore} with before/after, ${totalPairs - pairsWithBefore} after-only)`);
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

async function main() {
  console.log('=== Seed Projects from WordPress ===');
  if (DRY_RUN) console.log('  Mode: DRY RUN (no DB changes)');
  if (SKIP_AI) console.log('  Mode: SKIP AI (placeholder metadata)');
  console.log('');

  // 1. Discover
  const discovered = await discoverProjects();
  if (discovered.size === 0) {
    console.log('No projects discovered. Is the WordPress site accessible?');
    process.exit(1);
  }

  // 2. Crawl
  console.log('Crawling project pages...');
  const crawledRaw = await batchProcess([...discovered.values()], CONCURRENCY, crawlProject);
  const crawled = crawledRaw.filter((p): p is CrawledProject => p !== null);
  console.log(`\nSuccessfully crawled ${crawled.length}/${discovered.size} projects\n`);

  if (crawled.length === 0) {
    console.log('No projects crawled successfully. Check network connectivity.');
    process.exit(1);
  }

  // 3. Enrich
  console.log('Enriching project metadata...');
  const enriched = await batchProcess(crawled, SKIP_AI ? 10 : CONCURRENCY, enrichProject);
  console.log(`\nEnriched ${enriched.length} projects\n`);

  // 4. Group into sites
  const { sites, standalone } = groupIntoSites(enriched);

  // 5. Dry run → print and exit
  if (DRY_RUN) {
    printDryRunSummary(enriched, sites, standalone);
    process.exit(0);
  }

  // 6. Seed database
  await clearExistingData();
  const siteIdMap = await seedSites(sites);
  const defaultSiteId = await seedDefaultSite();
  await seedProjects(enriched, siteIdMap, defaultSiteId);

  console.log('\n=== Seeding Complete ===');
  console.log(`  ${sites.length} sites + ${STANDALONE_SITE_SLUG}`);
  console.log(`  ${enriched.length} projects`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to seed projects:', err);
  process.exit(1);
});
