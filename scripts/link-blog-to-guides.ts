/**
 * Blog → cost-guide internal-link audit + patch.
 *
 * Scans every published blog post body. For each cost-guide topic, if the
 * body mentions a topic phrase but doesn't already link to the guide URL,
 * patches the markdown to add ONE contextual link at the first mention.
 *
 * Run with:
 *   pnpm tsx scripts/link-blog-to-guides.ts            # dry run (default)
 *   pnpm tsx scripts/link-blog-to-guides.ts --apply    # write changes
 */
import 'dotenv/config';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface GuideRule {
  slug: string;          // guide route segment after /guides/
  patterns: RegExp[];    // first-match wins
  zhPatterns: RegExp[];
}

const GUIDES: GuideRule[] = [
  {
    slug: 'kitchen-renovation-cost-vancouver',
    patterns: [
      /\bkitchen renovation cost(s)?\b/i,
      /\bkitchen reno(vation)? budget\b/i,
      /\bcost of (a |the )?kitchen reno(vation)?\b/i,
    ],
    zhPatterns: [
      /厨房装修费用/, /厨房装修预算/, /厨房翻新成本/, /厨房翻新费用/,
    ],
  },
  {
    slug: 'bathroom-renovation-cost-vancouver',
    patterns: [
      /\bbathroom renovation cost(s)?\b/i,
      /\bbathroom reno(vation)? budget\b/i,
      /\bcost of (a |the )?bathroom reno(vation)?\b/i,
    ],
    zhPatterns: [
      /浴室装修费用/, /浴室装修预算/, /卫生间装修费用/, /卫浴装修费用/,
    ],
  },
  {
    slug: 'whole-house-renovation-cost-vancouver',
    patterns: [
      /\bwhole(-| )house renovation cost(s)?\b/i,
      /\bfull(-| )home reno(vation)? cost(s)?\b/i,
      /\bcost of (a |the )?whole(-| )house reno(vation)?\b/i,
    ],
    zhPatterns: [
      /全屋装修费用/, /整屋装修费用/, /全屋翻新成本/, /整屋翻新成本/,
    ],
  },
  {
    slug: 'basement-renovation-cost-vancouver',
    patterns: [
      /\bbasement renovation cost(s)?\b/i,
      /\bbasement reno(vation)? budget\b/i,
      /\bbasement finishing cost(s)?\b/i,
    ],
    zhPatterns: [
      /地下室装修费用/, /地下室翻新费用/, /地下室预算/,
    ],
  },
  {
    slug: 'commercial-renovation-cost-vancouver',
    patterns: [
      /\bcommercial renovation cost(s)?\b/i,
      /\boffice reno(vation)? cost(s)?\b/i,
      /\brestaurant build(-| )out cost(s)?\b/i,
    ],
    zhPatterns: [/商业装修费用/, /办公室装修费用/, /餐厅装修费用/],
  },
  {
    slug: 'cabinet-refinishing-cost-vancouver',
    patterns: [
      /\bcabinet refinishing cost(s)?\b/i,
      /\bcabinet refacing cost(s)?\b/i,
      /\bcabinet painting cost(s)?\b/i,
    ],
    zhPatterns: [/橱柜翻新费用/, /柜门更换费用/, /橱柜重新喷漆/],
  },
  {
    slug: 'basement-suite-cost-vancouver',
    patterns: [
      /\blegal basement suite cost(s)?\b/i,
      /\bbasement suite conversion cost(s)?\b/i,
      /\brental suite cost(s)?\b/i,
    ],
    zhPatterns: [/合法地下室套间/, /出租套间费用/, /地下室套间改造/],
  },
];

type Lang = 'en' | 'zh';

interface Change {
  slug: string;
  field: 'contentEn' | 'contentZh';
  guideSlug: string;
  before: string;   // 60-char snippet around the match
  after: string;    // 60-char snippet showing the inserted link
}

const APPLY = process.argv.includes('--apply');

function alreadyLinks(body: string, guideSlug: string): boolean {
  return body.includes(`/guides/${guideSlug}`);
}

/**
 * Build a mask string the same length as `body` where every byte that is
 * inside an existing markdown link `[...](...)` or HTML `<a>...</a>` is
 * replaced with a non-letter sentinel. Regex matches against the mask
 * mean the match falls in plain text safe to wrap.
 */
function maskExistingLinks(body: string): string {
  const chars = body.split('');
  // Mask <a ...>...</a> spans (HTML)
  const htmlRe = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = htmlRe.exec(body)) !== null) {
    for (let i = m.index; i < m.index + m[0].length; i++) chars[i] = '';
  }
  // Mask markdown [text](url) spans
  const mdRe = /\[[^\]]+\]\([^)]+\)/g;
  while ((m = mdRe.exec(body)) !== null) {
    for (let i = m.index; i < m.index + m[0].length; i++) chars[i] = '';
  }
  return chars.join('');
}

/** Insert a markdown link at the first phrase match in plain text. Returns null if no safe insertion was made. */
function patchBodyOnce(body: string, rule: GuideRule, lang: Lang, locale: string): { newBody: string; before: string; after: string } | null {
  if (alreadyLinks(body, rule.slug)) return null;
  const masked = maskExistingLinks(body);
  const patterns = lang === 'en' ? rule.patterns : rule.zhPatterns;
  for (const re of patterns) {
    const match = re.exec(masked);
    if (!match) continue;
    const start = match.index;
    const phrase = body.slice(start, start + match[0].length); // use original casing
    const linkUrl = `/${locale}/guides/${rule.slug}/`;
    const md = `[${phrase}](${linkUrl})`;
    const newBody = body.slice(0, start) + md + body.slice(start + phrase.length);
    const ctxStart = Math.max(0, start - 30);
    const ctxEnd = Math.min(body.length, start + phrase.length + 30);
    return {
      newBody,
      before: body.slice(ctxStart, ctxEnd),
      after: newBody.slice(ctxStart, ctxStart + (ctxEnd - ctxStart) + md.length - phrase.length),
    };
  }
  return null;
}

async function main() {
  const posts = await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true));
  console.log(`Loaded ${posts.length} published blog posts.\n`);

  const changes: Change[] = [];
  const updates: { id: string; contentEn?: string; contentZh?: string }[] = [];

  for (const post of posts) {
    let contentEn = post.contentEn;
    let contentZh = post.contentZh;
    let touchedEn = false;
    let touchedZh = false;

    for (const rule of GUIDES) {
      const en = patchBodyOnce(contentEn, rule, 'en', 'en');
      if (en) {
        contentEn = en.newBody;
        touchedEn = true;
        changes.push({ slug: post.slug, field: 'contentEn', guideSlug: rule.slug, before: en.before, after: en.after });
      }
      const zh = patchBodyOnce(contentZh, rule, 'zh', 'zh');
      if (zh) {
        contentZh = zh.newBody;
        touchedZh = true;
        changes.push({ slug: post.slug, field: 'contentZh', guideSlug: rule.slug, before: zh.before, after: zh.after });
      }
    }

    if (touchedEn || touchedZh) {
      updates.push({ id: post.id, contentEn: touchedEn ? contentEn : undefined, contentZh: touchedZh ? contentZh : undefined });
    }
  }

  console.log(`Proposed changes: ${changes.length} (across ${updates.length} posts)\n`);
  for (const c of changes) {
    console.log(`  [${c.slug}].${c.field} → /guides/${c.guideSlug}/`);
    console.log(`    before: …${c.before}…`);
    console.log(`    after:  …${c.after}…`);
  }

  if (!APPLY) {
    console.log('\nDry run — pass --apply to write changes.');
    return;
  }

  console.log(`\nApplying ${updates.length} updates…`);
  for (const u of updates) {
    const set: Record<string, string> = {};
    if (u.contentEn !== undefined) set.contentEn = u.contentEn;
    if (u.contentZh !== undefined) set.contentZh = u.contentZh;
    await db.update(blogPosts).set(set).where(eq(blogPosts.id, u.id));
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
