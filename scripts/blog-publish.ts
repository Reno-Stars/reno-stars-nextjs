/**
 * Publish a blog draft JSON into blog_posts.
 *
 * The agent writes drafts under blog-drafts/*.json. The site renders from the
 * blog_posts table, so until now those files could never appear on the site —
 * the same shape of gap as migrations nothing applied.
 *
 * Usage:
 *   pnpm blog:publish -f blog-drafts/<slug>.json            # insert as a DRAFT
 *   pnpm blog:publish -f blog-drafts/<slug>.json --publish  # insert and publish
 */
import { readFileSync } from 'node:fs';
import { Client } from 'pg';
import { validateDraft } from './lib/blog-draft';

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1];
}

const COLUMNS: Array<[string, string]> = [
  ['slug', 'slug'], ['title_en', 'titleEn'], ['title_zh', 'titleZh'],
  ['content_en', 'contentEn'], ['content_zh', 'contentZh'],
  ['excerpt_en', 'excerptEn'], ['excerpt_zh', 'excerptZh'],
  ['meta_title_en', 'metaTitleEn'], ['meta_title_zh', 'metaTitleZh'],
  ['meta_description_en', 'metaDescriptionEn'], ['meta_description_zh', 'metaDescriptionZh'],
  ['focus_keyword_en', 'focusKeywordEn'], ['focus_keyword_zh', 'focusKeywordZh'],
  ['seo_keywords_en', 'seoKeywordsEn'], ['seo_keywords_zh', 'seoKeywordsZh'],
  ['featured_image_url', 'featuredImageUrl'], ['reading_time_minutes', 'readingTimeMinutes'],
  ['localizations', 'localizations'],
];

async function main(): Promise<void> {
  const file = arg('-f') ?? arg('--file');
  const publish = process.argv.includes('--publish');
  if (!file) {
    console.error('usage: pnpm blog:publish -f <draft.json> [--publish]');
    process.exit(2);
  }

  const draft = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;

  const problems = validateDraft(draft);
  if (problems.length > 0) {
    console.error(`REFUSED ${file} — ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  ${p.field}: ${p.problem}`);
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set (expected via dotenv -e .env.local)');
    process.exit(2);
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    const dup = await client.query('SELECT 1 FROM blog_posts WHERE slug = $1', [draft.slug]);
    if (dup.rowCount) {
      console.error(`REFUSED — slug "${draft.slug}" already exists. Edit the row instead.`);
      process.exitCode = 1;
      return;
    }

    // Build columns and values together so they cannot drift apart — the
    // hand-written INSERT that failed on 2026-09-02 declared 18 columns and
    // supplied 16 values, silently shifting every field after the gap.
    const cols: string[] = [];
    const vals: unknown[] = [];
    for (const [column, key] of COLUMNS) {
      if (draft[key] === undefined || draft[key] === null) continue;
      cols.push(column);
      vals.push(key === 'localizations' ? JSON.stringify(draft[key]) : draft[key]);
    }
    cols.push('is_published', 'created_at', 'updated_at');
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');

    await client.query('BEGIN');
    await client.query(
      `INSERT INTO blog_posts (${cols.join(', ')}) VALUES (${placeholders}, ${publish}, NOW(), NOW())`,
      vals,
    );
    await client.query('COMMIT');
    console.log(
      `${publish ? 'PUBLISHED' : 'INSERTED AS DRAFT'} ${draft.slug} — ${cols.length} columns, ${vals.length} values`,
    );
    if (!publish) console.log('  set is_published with --publish when it has been reviewed');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`FAILED ${file} — rolled back`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void main();
