/**
 * Seed blog posts from the old WordPress site.
 * Usage: pnpm db:seed:blog
 *
 * - English content: fetched via WP REST API (structured JSON)
 * - Chinese content: crawled from /zh/ HTML pages (WPML doesn't expose ZH via REST API)
 *
 * Idempotent: uses onConflictDoUpdate to refresh content on re-run.
 */

import { db } from '../lib/db';
import { blogPosts } from '../lib/db/schema';

const WP_API = 'https://reno-stars.com/wp-json/wp/v2/renovation_article';
const WP_BASE = 'https://reno-stars.com';
const PER_PAGE = 100;
const CONCURRENCY = 3;

interface WPPost {
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
}

/** Strip HTML tags for plain-text excerpt. */
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
    .replace(/&#\d+;/g, '') // remaining numeric entities
    .replace(/\s+/g, ' ')
    .trim();
}

/** Clean up WP content HTML — remove inline styles, scripts, shortcodes. */
function cleanContent(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\[\/?\w+[^\]]*\]/g, '') // shortcodes
    .replace(/ style="[^"]*"/g, '')
    .replace(/ class="[^"]*"/g, '')
    .replace(/ data-[\w-]+="[^"]*"/g, '') // data attributes
    .replace(/ id="[^"]*"/g, '')
    .replace(/<div>\s*<\/div>/g, '') // empty divs
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Decode URL-encoded slug characters and sanitize invalid characters. */
function decodeSlug(slug: string): string {
  try {
    let decoded = decodeURIComponent(slug);
    // Sanitize: keep only alphanumeric and hyphens, normalize format
    decoded = decoded
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-') // Replace any non-alphanumeric/hyphen chars with hyphen
      .replace(/-+/g, '-')          // Collapse multiple consecutive hyphens
      .replace(/(^-|-$)/g, '');     // Remove leading/trailing hyphens
    return decoded;
  } catch {
    return slug;
  }
}

/**
 * Extract article content from a WordPress HTML page.
 * Tries several common content selectors.
 */
/** Check if a string contains Chinese characters. */
function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

function extractArticleContent(html: string): { title: string; content: string; excerpt: string } | null {
  // Collect title candidates, prefer the one with Chinese characters
  const candidates: string[] = [];

  // Candidate 1: og:title meta tag
  const ogMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i)
    || html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:title"[^>]*>/i);
  if (ogMatch) candidates.push(stripHtml(ogMatch[1]).replace(/\s*[-–|].*$/, ''));

  // Candidate 2: <title> tag
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) candidates.push(stripHtml(titleMatch[1]).replace(/\s*[-–|].*$/, ''));

  // Candidate 3: first <h1> in the page body
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) candidates.push(stripHtml(h1Match[1]));

  // Pick the first candidate that contains Chinese, or the first non-empty one
  const title = candidates.find((c) => c && hasChinese(c)) || candidates.find((c) => c) || '';

  // Try to find article content in common WordPress/Elementor containers
  let content = '';

  // Method 1: Look for entry-content div
  const entryMatch = html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>|<div[^>]*class="[^"]*(?:post-|entry-|comment))/i);
  if (entryMatch) {
    content = entryMatch[1];
  }

  // Method 2: Look for the main article content between the title and a footer/sidebar marker
  if (!content) {
    // Extract all <p>, <h1>-<h6>, <ul>, <ol>, <li>, <table> tags from the body
    const bodyMatch = html.match(/<body[\s\S]*<\/body>/i);
    if (bodyMatch) {
      const body = bodyMatch[0];
      // Remove header and footer
      const cleaned = body
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<aside[\s\S]*?<\/aside>/gi, '');

      // Collect content tags
      const contentTags: string[] = [];
      const tagRegex = /<(p|h[1-6]|ul|ol|li|table|tr|td|th|blockquote|figcaption)[^>]*>([\s\S]*?)<\/\1>/gi;
      let match;
      while ((match = tagRegex.exec(cleaned)) !== null) {
        const text = stripHtml(match[0]);
        // Skip very short fragments (likely nav items) and known non-content
        if (text.length > 20 && !text.includes('©') && !text.includes('Cookie') && !text.includes('Privacy Policy')) {
          contentTags.push(match[0]);
        }
      }
      if (contentTags.length > 0) {
        content = contentTags.join('\n');
      }
    }
  }

  if (!content && !title) return null;

  const cleanedContent = cleanContent(content);
  const excerpt = stripHtml(content).slice(0, 200).trim();

  return { title, content: cleanedContent, excerpt };
}

/** Fetch all EN posts from WP REST API. */
async function fetchEnPosts(): Promise<WPPost[]> {
  const posts: WPPost[] = [];
  let page = 1;

  while (true) {
    const url = `${WP_API}?per_page=${PER_PAGE}&page=${page}&_fields=slug,title,content,excerpt,date`;
    console.log(`  Fetching EN page ${page}...`);

    const res = await fetch(url);
    if (!res.ok) break;

    const data: WPPost[] = await res.json();
    if (data.length === 0) break;

    posts.push(...data);
    if (data.length < PER_PAGE) break;
    page++;
  }

  return posts;
}

/** Fetch Chinese content for a single post by crawling the /zh/ page. */
async function fetchZhContent(slug: string): Promise<{ title: string; content: string; excerpt: string } | null> {
  const url = `${WP_BASE}/zh/renovation_article/${slug}/`;
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' },
    });
    if (!res.ok) return null;
    const html = await res.text();
    return extractArticleContent(html);
  } catch {
    return null;
  }
}

/** Run tasks in batches of given concurrency. */
async function batchProcess<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

async function seed() {
  console.log('Fetching blog posts from WordPress...\n');

  // Step 1: Get EN posts from REST API
  const enPosts = await fetchEnPosts();
  console.log(`\nFound ${enPosts.length} EN posts\n`);

  if (enPosts.length === 0) {
    console.log('No posts found, skipping');
    return;
  }

  // Step 2: Fetch ZH content by crawling /zh/ pages
  console.log('Fetching ZH content from HTML pages...');
  const zhResults = await batchProcess(enPosts, CONCURRENCY, async (post) => {
    const zh = await fetchZhContent(post.slug);
    if (zh) {
      console.log(`  ✓ ZH: ${post.slug.slice(0, 50)}`);
    } else {
      console.log(`  ✗ ZH: ${post.slug.slice(0, 50)} (will use EN)`);
    }
    return { slug: post.slug, zh };
  });

  const zhBySlug = new Map(zhResults.map((r) => [r.slug, r.zh]));

  // Step 3: Build values
  const values = enPosts.map((enPost) => {
    const zh = zhBySlug.get(enPost.slug);
    const slug = decodeSlug(enPost.slug);

    const titleEn = stripHtml(enPost.title.rendered);
    const titleZh = zh?.title || titleEn;
    const excerptEn = stripHtml(enPost.excerpt.rendered);
    const excerptZh = zh?.excerpt || excerptEn;
    const contentEn = cleanContent(enPost.content.rendered);
    const contentZh = zh?.content || contentEn;

    return {
      slug,
      titleEn,
      titleZh,
      excerptEn: excerptEn || null,
      excerptZh: excerptZh || null,
      contentEn,
      contentZh,
      isPublished: true,
      publishedAt: new Date(enPost.date),
    };
  });

  // Step 4: Upsert into database
  console.log('\nInserting into database...');
  for (const val of values) {
    await db
      .insert(blogPosts)
      .values(val)
      .onConflictDoUpdate({
        target: blogPosts.slug,
        set: {
          titleEn: val.titleEn,
          titleZh: val.titleZh,
          excerptEn: val.excerptEn,
          excerptZh: val.excerptZh,
          contentEn: val.contentEn,
          contentZh: val.contentZh,
          publishedAt: val.publishedAt,
          isPublished: val.isPublished,
        },
      });
  }

  console.log(`\nSeeded ${values.length} blog posts:`);
  for (const v of values) {
    const enLen = v.contentEn.length;
    const zhLen = v.contentZh.length;
    const zhLabel = zhLen !== enLen ? `ZH:${zhLen}` : 'ZH:=EN';
    console.log(`  ${v.slug.slice(0, 55).padEnd(57)} EN:${String(enLen).padStart(6)} ${zhLabel}`);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error seeding blog posts:', error);
    process.exit(1);
  });
