/**
 * Replace stale `/blog/<old>` cost-guide URLs in blog body with direct
 * `/guides/<canonical>` URLs. Avoids 301-redirect-chain link equity loss.
 *
 * The redirects in next.config.ts already 301 these old URLs to the guide,
 * so end users hit the right page either way — but search engines pass
 * less equity through 301s than through direct links, and every redirect
 * is a wasted round-trip.
 *
 * Usage:
 *   pnpm tsx scripts/rewrite-legacy-cost-redirects.ts            # dry run
 *   pnpm tsx scripts/rewrite-legacy-cost-redirects.ts --apply    # write
 */
import 'dotenv/config';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface RedirectRule {
  oldSlug: string;       // e.g. 'average-bathroom-renovation-cost-vancouver'
  newGuideSlug: string;  // e.g. 'bathroom-renovation-cost-vancouver'
}

// Mirror of the static redirects in next.config.ts:524-636.
// Keep this list in sync with next.config.ts when redirects are added.
const REDIRECTS: RedirectRule[] = [
  // Bathroom variants → bathroom-renovation-cost-vancouver
  { oldSlug: 'average-bathroom-renovation-cost-vancouver', newGuideSlug: 'bathroom-renovation-cost-vancouver' },
  { oldSlug: 'bathroom-renovation-cost-vancouver-by-size', newGuideSlug: 'bathroom-renovation-cost-vancouver' },
  { oldSlug: 'bathroom-renovation-cost-vancouver-by-style', newGuideSlug: 'bathroom-renovation-cost-vancouver' },
  // Basement variants → basement-renovation-cost-vancouver
  { oldSlug: 'basement-renovation-cost-vancouver-2026', newGuideSlug: 'basement-renovation-cost-vancouver' },
  // Basement-suite variants → basement-suite-cost-vancouver
  { oldSlug: 'basement-suite-renovation-cost-vancouver', newGuideSlug: 'basement-suite-cost-vancouver' },
  { oldSlug: 'basement-suite-renovation-cost-vancouver-zh', newGuideSlug: 'basement-suite-cost-vancouver' },
  // Whole-house variants → whole-house-renovation-cost-vancouver
  { oldSlug: 'renovation-cost-vancouver-2026-complete-guide', newGuideSlug: 'whole-house-renovation-cost-vancouver' },
];

const APPLY = process.argv.includes('--apply');

interface Change {
  slug: string;
  field: 'contentEn' | 'contentZh';
  oldUrl: string;
  newUrl: string;
  count: number;
}

function rewriteBody(body: string, rules: RedirectRule[]): { newBody: string; rewrites: { oldSlug: string; newSlug: string; count: number }[] } {
  let out = body;
  const rewrites: { oldSlug: string; newSlug: string; count: number }[] = [];
  for (const r of rules) {
    // Match /<locale>/blog/<oldSlug> with locale being any 2-7 char alphanum-hyphen segment.
    // Allow optional trailing slash + capture trailing path/anchor only if no extra segment after slug.
    const re = new RegExp(`(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/${r.oldSlug}(?=[\\s)\\]'"#?]|/[\\s)\\]'"#?])`, 'g');
    let count = 0;
    out = out.replace(re, (_match, localePrefix) => {
      count++;
      return `${localePrefix}/guides/${r.newGuideSlug}/`;
    });
    if (count > 0) rewrites.push({ oldSlug: r.oldSlug, newSlug: r.newGuideSlug, count });
  }
  return { newBody: out, rewrites };
}

type Localizations = Record<string, string>;

function rewriteLocalizations(loc: Localizations, rules: RedirectRule[]): { newLoc: Localizations; rewriteCount: number; touchedKeys: string[] } {
  let rewriteCount = 0;
  const touchedKeys: string[] = [];
  const out: Localizations = { ...loc };
  for (const [key, val] of Object.entries(loc)) {
    if (typeof val !== 'string') continue;
    if (!key.startsWith('content')) continue; // only rewrite body fields, not titles/excerpts (URLs don't appear there)
    const { newBody, rewrites } = rewriteBody(val, rules);
    if (rewrites.length > 0) {
      out[key] = newBody;
      rewriteCount += rewrites.reduce((s, r) => s + r.count, 0);
      touchedKeys.push(key);
    }
  }
  return { newLoc: out, rewriteCount, touchedKeys };
}

async function main() {
  const posts = await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true));
  console.log(`Loaded ${posts.length} published blog posts.\n`);

  const changes: Change[] = [];
  const updates: { id: string; contentEn?: string; contentZh?: string; localizations?: Localizations }[] = [];

  for (const post of posts) {
    const en = rewriteBody(post.contentEn, REDIRECTS);
    const zh = rewriteBody(post.contentZh, REDIRECTS);
    const loc = rewriteLocalizations((post.localizations ?? {}) as Localizations, REDIRECTS);

    const update: { id: string; contentEn?: string; contentZh?: string; localizations?: Localizations } = { id: post.id };
    if (en.rewrites.length > 0) {
      update.contentEn = en.newBody;
      for (const r of en.rewrites) {
        changes.push({ slug: post.slug, field: 'contentEn', oldUrl: `/blog/${r.oldSlug}`, newUrl: `/guides/${r.newSlug}/`, count: r.count });
      }
    }
    if (zh.rewrites.length > 0) {
      update.contentZh = zh.newBody;
      for (const r of zh.rewrites) {
        changes.push({ slug: post.slug, field: 'contentZh', oldUrl: `/blog/${r.oldSlug}`, newUrl: `/guides/${r.newSlug}/`, count: r.count });
      }
    }
    if (loc.rewriteCount > 0) {
      update.localizations = loc.newLoc;
      changes.push({ slug: post.slug, field: ('localizations:' + loc.touchedKeys.join(',')) as 'contentEn', oldUrl: '(legacy)', newUrl: '(canonical)', count: loc.rewriteCount });
    }
    if (Object.keys(update).length > 1) updates.push(update);
  }

  for (const c of changes) {
    console.log(`  [${c.slug}].${c.field} ×${c.count}: ${c.oldUrl} → ${c.newUrl}`);
  }
  console.log(`\nProposed rewrites: ${changes.reduce((s, c) => s + c.count, 0)} URL replacements across ${updates.length} posts.\n`);

  if (!APPLY) {
    console.log('Dry run — pass --apply to write changes.');
    process.exit(0);
  }

  console.log(`Applying ${updates.length} updates…`);
  for (const u of updates) {
    const set: { contentEn?: string; contentZh?: string; localizations?: Localizations; updatedAt: Date } = { updatedAt: new Date() };
    if (u.contentEn) set.contentEn = u.contentEn;
    if (u.contentZh) set.contentZh = u.contentZh;
    if (u.localizations) set.localizations = u.localizations;
    await db.update(blogPosts).set(set).where(eq(blogPosts.id, u.id));
  }
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
