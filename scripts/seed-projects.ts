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
const WP_API_PROJECTS = `${WP_BASE}/wp-json/wp/v2/project`;
const CONCURRENCY = 3;
const FETCH_TIMEOUT = 30_000;

/** Category listing pages on the old WP site (Elementor) — may contain projects not in REST API */
const CATEGORY_PAGES: { url: string; inferredServiceType: ServiceTypeKey | 'whole-house' }[] = [
  { url: `${WP_BASE}/vancouver-renovation-projects/`, inferredServiceType: 'kitchen' },
  { url: `${WP_BASE}/vancouver-renovation-projects/kitchen-renovations/`, inferredServiceType: 'kitchen' },
  { url: `${WP_BASE}/vancouver-renovation-projects/bathroom-renovations/`, inferredServiceType: 'bathroom' },
  { url: `${WP_BASE}/vancouver-renovation-projects/whole-house-renovations/`, inferredServiceType: 'whole-house' },
  { url: `${WP_BASE}/vancouver-renovation-projects/commercial-renovations/`, inferredServiceType: 'commercial' },
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

/** City name → Chinese translation */
const CITY_ZH: Record<string, string> = {
  Vancouver: '温哥华', Burnaby: '本拿比', Richmond: '列治文',
  Surrey: '素里', Coquitlam: '高贵林', 'Port Coquitlam': '高贵林港',
  'Port Moody': '穆迪港', 'New Westminster': '新威斯敏斯特',
  Delta: 'Delta', Langley: '兰里', 'White Rock': '白石',
  'Maple Ridge': '枫树岭', 'North Vancouver': '北温哥华',
  'West Vancouver': '西温哥华', Abbotsford: '阿伯茨福德',
};

/** Known non-project slugs to skip when scraping category pages */
const NON_PROJECT_SLUGS = new Set([
  'about', 'contact', 'services', 'blog', 'news', 'faq', 'privacy-policy',
  'terms-of-service', 'have-a-project', 'vancouver-renovation-projects',
  'kitchen-renovations', 'bathroom-renovations', 'whole-house-renovations',
  'commercial-renovations', 'design', 'benefits', 'process', 'areas',
  'wp-admin', 'wp-login', 'wp-content', 'wp-json', 'feed',
  'projects', 'vancouver-renovation-blog', 'renovation-blog', 'commercial-pokin',
  'sample-page', 'my-account', 'cart', 'checkout', 'shop',
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
  // Custom taxonomies may appear under their own field names
  [key: string]: unknown;
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
  budgetRange: string;
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

/** Clean WP content HTML — remove inline styles, scripts, shortcodes. */
function cleanContent(html: string): string {
  return html
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
}

/** Check if a string contains Chinese characters. */
function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

/** Decode URL-encoded slug and sanitize to [a-z0-9-]. */
function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '');
  } catch {
    return slug;
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

  // Try entry-content div
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
  return { title, content: cleanContent(content) };
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

/** Strip WordPress dimension suffixes (-300x200), ensure absolute URL, encode non-ASCII chars. */
function normalizeImageUrl(url: string): string {
  if (url.startsWith('/')) url = WP_BASE + url;
  if (url.startsWith('//')) url = 'https:' + url;
  // Strip WP thumbnail dimension suffixes: -300x200, -1024x768, etc.
  url = url.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
  // Encode non-ASCII characters (Chinese filenames etc.) for safe DB storage
  // encodeURI keeps /:?#[]@!$&'()*+,;= intact but encodes multibyte chars
  try { url = encodeURI(decodeURI(url)); } catch { url = encodeURI(url); }
  return url;
}

/** Sanitize text for safe insertion via Neon HTTP driver — removes stray backslashes. */
function sanitizeText(text: string): string {
  // Remove lone backslashes that could create invalid escape sequences in HTTP transport
  return text.replace(/\\(?![\\nrt"/])/g, '');
}

/** Extract project slug from a WP page URL. Returns null for non-project URLs. */
function extractSlugFromUrl(href: string): string | null {
  try {
    const u = new URL(href, WP_BASE);
    if (u.hostname !== new URL(WP_BASE).hostname) return null;
    // Strip /en/, /zh/, /project/ prefixes
    const path = u.pathname.replace(/^\/(en|zh)\//, '/').replace(/^\/project\//, '/');
    const segments = path.split('/').filter(Boolean);
    if (segments.length !== 1) return null;
    const slug = decodeSlug(segments[0]);
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
  const t = title.toLowerCase();
  if (/kitchen|cabinet/i.test(t)) return 'kitchen';
  if (/bath|shower|vanit/i.test(t)) return 'bathroom';
  if (/basement|下/i.test(t)) return 'basement';
  if (/commercial|商业|office|store/i.test(t)) return 'commercial';
  if (/whole.house|full.house|full.home|全屋/i.test(t)) return 'whole-house';
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

/** Convert text to a slug: lowercase, hyphens, no consecutive hyphens. */
function formatSlug(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}

/** Extract all images from HTML content. */
function extractImages(html: string): CrawledImage[] {
  const images: CrawledImage[] = [];
  const seen = new Set<string>();
  const imgRe = /<img[^>]+>/gi;
  let m;
  while ((m = imgRe.exec(html)) !== null) {
    const tag = m[0];
    const dataSrc = tag.match(/data-(?:lazy-)?src="([^"]*)"/i);
    const src = tag.match(/\bsrc="([^"]*)"/i);
    const rawUrl = dataSrc?.[1] || src?.[1];
    if (!rawUrl || !rawUrl.includes('wp-content/uploads')) continue;

    const url = normalizeImageUrl(rawUrl);
    if (seen.has(url)) continue;
    seen.add(url);

    const altMatch = tag.match(/alt="([^"]*)"/i);
    images.push({ url, alt: altMatch ? stripHtml(altMatch[1]) : '', role: classifyImageRole(url) });
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
        // Extract categories from all possible taxonomy fields
        const cats: number[] = [];
        if (Array.isArray(wp.categories)) cats.push(...wp.categories);
        // Some WP setups use project_category or other custom taxonomy names
        for (const key of Object.keys(wp)) {
          if (key !== 'categories' && Array.isArray(wp[key]) && (wp[key] as unknown[]).every(v => typeof v === 'number')) {
            cats.push(...(wp[key] as number[]));
          }
        }
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

  // Step B — Category listing pages (Elementor-only projects)
  console.log('Discovering projects from category pages...');
  let elementorCount = 0;
  for (const { url, inferredServiceType } of CATEGORY_PAGES) {
    try {
      const res = await crawlFetch(url);
      if (!res.ok) continue;
      const html = await res.text();

      const linkRe = /<a[^>]*href="([^"]*)"[^>]*>/gi;
      let lm;
      while ((lm = linkRe.exec(html)) !== null) {
        const slug = extractSlugFromUrl(lm[1]);
        if (slug && !map.has(slug)) {
          map.set(slug, {
            slug,
            url: lm[1].startsWith('http') ? lm[1] : `${WP_BASE}${lm[1]}`,
            source: 'elementor',
            wpCategories: [],
            inferredServiceType,
          });
          elementorCount++;
        }
      }
    } catch { /* skip failed category pages */ }
  }
  console.log(`  Found ${elementorCount} additional projects from category pages`);

  console.log(`  Total discovered: ${map.size} unique projects\n`);
  return map;
}

// ============================================================================
// PHASE 2: CRAWL
// ============================================================================

async function crawlProject(discovered: DiscoveredProject): Promise<CrawledProject | null> {
  try {
    let titleEn = '';
    let descriptionEn = '';
    let heroImageUrl = '';
    let images: CrawledImage[] = [];

    if (discovered.source === 'rest-api' && discovered.wpData) {
      const wp = discovered.wpData;
      titleEn = stripHtml(wp.title.rendered);
      const contentText = stripHtml(wp.content.rendered);
      descriptionEn = contentText.slice(0, 500);

      // Fetch featured media URL
      if (wp.featured_media) {
        try {
          const mediaRes = await crawlFetch(`${WP_BASE}/wp-json/wp/v2/media/${wp.featured_media}?_fields=source_url`);
          if (mediaRes.ok) {
            const media = await mediaRes.json() as { source_url?: string };
            heroImageUrl = media.source_url || '';
          }
        } catch { /* will fall back to first image */ }
      }

      // Extract images from content HTML
      images = extractImages(wp.content.rendered);

      // Also fetch the page HTML for additional images Elementor might inject
      try {
        const pageRes = await crawlFetch(discovered.url);
        if (pageRes.ok) {
          const pageHtml = await pageRes.text();
          const pageImages = extractImages(pageHtml);
          const existingUrls = new Set(images.map(i => i.url));
          for (const img of pageImages) {
            if (!existingUrls.has(img.url)) {
              images.push(img);
              existingUrls.add(img.url);
            }
          }
          // Get hero from og:image if API didn't provide one
          if (!heroImageUrl) {
            const ogMatch = pageHtml.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i)
              || pageHtml.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"[^>]*>/i);
            if (ogMatch) heroImageUrl = ogMatch[1];
          }
        }
      } catch { /* page fetch is supplementary */ }
    } else {
      // Elementor page — crawl HTML
      const res = await crawlFetch(discovered.url);
      if (!res.ok) {
        console.log(`  ✗ ${discovered.slug} (HTTP ${res.status})`);
        return null;
      }
      const html = await res.text();
      const extracted = extractArticleContent(html);
      if (!extracted) {
        console.log(`  ✗ ${discovered.slug} (no content found)`);
        return null;
      }
      titleEn = extracted.title;
      descriptionEn = stripHtml(extracted.content).slice(0, 500);
      images = extractImages(html);

      const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i)
        || html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"[^>]*>/i);
      heroImageUrl = ogMatch ? ogMatch[1] : '';
    }

    if (!heroImageUrl && images.length > 0) heroImageUrl = images[0].url;

    // Fetch ZH content
    let titleZh = titleEn;
    let descriptionZh = descriptionEn;
    const zhPaths = discovered.source === 'rest-api'
      ? [`/zh/project/${discovered.slug}/`, `/zh/${discovered.slug}/`]
      : [`/zh/${discovered.slug}/`, `/zh/project/${discovered.slug}/`];

    for (const path of zhPaths) {
      try {
        const zhRes = await crawlFetch(`${WP_BASE}${path}`);
        if (!zhRes.ok) continue;
        const zhHtml = await zhRes.text();
        const zhExtracted = extractArticleContent(zhHtml);
        if (zhExtracted && hasChinese(zhExtracted.title)) {
          titleZh = zhExtracted.title;
          descriptionZh = stripHtml(zhExtracted.content).slice(0, 500);
          break;
        }
      } catch { /* try next ZH URL */ }
    }

    const inferredServiceType = inferServiceType(discovered.wpCategories, titleEn, discovered.inferredServiceType);
    const isWholeHouse = discovered.wpCategories.includes(77)
      || /whole.house|full.house|full.home|全屋/i.test(`${titleEn} ${titleZh}`);

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
  const used = new Set<number>();

  // Strategy 1: Match by before/after filename keywords
  const befores = images.map((img, i) => ({ img, i })).filter(({ img }) => img.role === 'before');
  for (const { img: beforeImg, i: bi } of befores) {
    const stem = beforeImg.url.replace(/before/i, 'after');
    const afterIdx = images.findIndex((img, i) => !used.has(i) && i !== bi && img.url === stem);
    if (afterIdx >= 0) {
      pairs.push({
        beforeUrl: beforeImg.url, beforeAltEn: beforeImg.alt || undefined,
        afterUrl: images[afterIdx].url, afterAltEn: images[afterIdx].alt || undefined,
      });
      used.add(bi);
      used.add(afterIdx);
    }
  }

  // Strategy 2: Match a/b suffix pairs (e.g., image-a.jpg / image-b.jpg)
  for (let i = 0; i < images.length; i++) {
    if (used.has(i)) continue;
    const url = images[i].url;
    const aMatch = url.match(/(.+)-a(\.[a-z]+)$/i);
    if (!aMatch) continue;
    const bUrl = `${aMatch[1]}-b${aMatch[2]}`;
    const bIdx = images.findIndex((img, j) => !used.has(j) && j !== i && img.url === bUrl);
    if (bIdx >= 0) {
      pairs.push({
        beforeUrl: url, beforeAltEn: images[i].alt || undefined,
        afterUrl: images[bIdx].url, afterAltEn: images[bIdx].alt || undefined,
      });
      used.add(i);
      used.add(bIdx);
    }
  }

  // Strategy 3: Remaining images → after-only pairs (valid per DB CHECK constraint)
  for (let i = 0; i < images.length; i++) {
    if (used.has(i)) continue;
    pairs.push({
      afterUrl: images[i].url,
      afterAltEn: images[i].alt || undefined,
    });
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
    budgetRange: '$15,000 - $30,000',
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

    return {
      slug: crawled.slug,
      titleEn: parsed.titleEn,
      titleZh: parsed.titleZh,
      descriptionEn: parsed.descriptionEn,
      descriptionZh: parsed.descriptionZh,
      serviceType: parsed.serviceType,
      categoryEn: SERVICE_TYPE_TO_CATEGORY[parsed.serviceType].en,
      categoryZh: SERVICE_TYPE_TO_CATEGORY[parsed.serviceType].zh,
      locationCity: parsed.locationCity,
      budgetRange: parsed.budgetRange,
      durationEn: parsed.durationEn,
      durationZh: parsed.durationZh,
      spaceTypeEn: parsed.spaceTypeEn,
      spaceTypeZh: parsed.spaceTypeZh,
      heroImageUrl: crawled.heroImageUrl,
      challengeEn: parsed.challengeEn,
      challengeZh: parsed.challengeZh,
      solutionEn: parsed.solutionEn,
      solutionZh: parsed.solutionZh,
      badgeEn: parsed.badgeEn,
      badgeZh: parsed.badgeZh,
      imagePairs,
      scopes: parsed.scopes,
      isWholeHouse: crawled.isWholeHouse,
      metaTitleEn: parsed.metaTitleEn,
      metaTitleZh: parsed.metaTitleZh,
      metaDescriptionEn: parsed.metaDescriptionEn,
      metaDescriptionZh: parsed.metaDescriptionZh,
      focusKeywordEn: parsed.focusKeywordEn,
      focusKeywordZh: parsed.focusKeywordZh,
      seoKeywordsEn: parsed.seoKeywordsEn,
      seoKeywordsZh: parsed.seoKeywordsZh,
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
  // Find cities that have at least one whole-house project
  const wholeHouseCities = new Set<string>();
  for (const p of enriched) {
    if (p.isWholeHouse) wholeHouseCities.add(p.locationCity);
  }

  // Group projects by city for whole-house cities
  const cityProjects = new Map<string, EnrichedProject[]>();
  const standalone: EnrichedProject[] = [];

  for (const p of enriched) {
    if (wholeHouseCities.has(p.locationCity)) {
      const existing = cityProjects.get(p.locationCity) || [];
      existing.push(p);
      cityProjects.set(p.locationCity, existing);
    } else {
      standalone.push(p);
    }
  }

  // Create site groups
  const sites: SiteGroup[] = [];
  for (const [city, projects] of cityProjects) {
    const slug = formatSlug(`${city}-home-renovation`);
    const first = projects[0];
    const cityZh = CITY_ZH[city] || city;
    sites.push({
      slug,
      titleEn: `${city} Home Renovation`,
      titleZh: `${cityZh}住宅翻新`,
      descriptionEn: `Complete home renovation in ${city} featuring ${projects.map(p => p.categoryEn.toLowerCase()).join(', ')} updates.`,
      descriptionZh: `${cityZh}全面住宅翻新，包括${projects.map(p => p.categoryZh).join('、')}更新。`,
      locationCity: city,
      heroImageUrl: first.heroImageUrl,
      projectSlugs: projects.map(p => p.slug),
    });
  }

  return { sites, standalone };
}

// ============================================================================
// PHASE 6: DATABASE SEEDING
// ============================================================================

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
  for (const p of enriched) {
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
        budgetRange: p.budgetRange,
        durationEn: p.durationEn,
        durationZh: p.durationZh,
        spaceTypeEn: p.spaceTypeEn,
        spaceTypeZh: p.spaceTypeZh,
        heroImageUrl: p.heroImageUrl,
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

    // Insert child records in parallel
    const insertions: Promise<unknown>[] = [];

    if (p.imagePairs.length > 0) {
      insertions.push(db.insert(projectImagePairs).values(
        p.imagePairs.map((pair, i) => ({
          projectId,
          beforeImageUrl: pair.beforeUrl ?? null,
          beforeAltTextEn: pair.beforeAltEn ? s(pair.beforeAltEn) : null,
          beforeAltTextZh: pair.beforeAltZh ? s(pair.beforeAltZh) : null,
          afterImageUrl: pair.afterUrl ?? null,
          afterAltTextEn: pair.afterAltEn ? s(pair.afterAltEn) : null,
          afterAltTextZh: pair.afterAltZh ? s(pair.afterAltZh) : null,
          titleEn: pair.titleEn ? s(pair.titleEn) : null,
          titleZh: pair.titleZh ? s(pair.titleZh) : null,
          displayOrder: i,
        })),
      ));
    }

    if (p.scopes.length > 0) {
      insertions.push(db.insert(projectScopes).values(
        p.scopes.map((scope, i) => ({
          projectId,
          scopeEn: scope.en,
          scopeZh: scope.zh,
          displayOrder: i,
        })),
      ));
    }

    await Promise.all(insertions);

    const inSite = siteId !== defaultSiteId;
    console.log(`  Seeded: ${p.slug} (${p.imagePairs.length} pairs${inSite ? ', in site' : ''})`);
    seeded++;
  }

  console.log(`\nSeeded ${seeded} projects`);
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
