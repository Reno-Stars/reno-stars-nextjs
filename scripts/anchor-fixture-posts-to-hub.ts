/**
 * Adds a contextual in-body anchor near the H1 of each fixture-cost post
 * pointing UP to the parent /guides/bathroom-renovation-cost-vancouver/ hub.
 *
 * Each post already has the parent guide listed in the "Related cost guides"
 * footer section, but a contextual anchor in the lead paragraph signals the
 * topic-cluster relationship more strongly to Google.
 *
 * Pattern: appends one line at the end of the .lead paragraph reading
 *   "Part of our [bathroom renovation cost guide](href) — see the full
 *    breakdown by piece count and design tier."
 *
 * Idempotent: if the anchor href already appears in the lead paragraph,
 * the script skips the post.
 */
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

const HUB_HREF_EN = '/en/guides/bathroom-renovation-cost-vancouver/';
const HUB_HREF_ZH = '/zh/guides/bathroom-renovation-cost-vancouver/';

const ANCHOR_EN = ` Part of our <a href="${HUB_HREF_EN}">bathroom renovation cost guide</a> — see the full breakdown by piece count, design style, and the rest of the bathroom-cost cluster.`;
const ANCHOR_ZH = ` 本文是<a href="${HUB_HREF_ZH}">温哥华浴室装修费用总指南</a>的一部分——完整指南按件数、风格分层，覆盖浴室费用全集群。`;

/**
 * Inserts the anchor line at the END of the first <p class="lead">...</p>
 * paragraph. Returns the (possibly unchanged) html.
 */
function insertHubAnchor(html: string, anchor: string, hubHref: string): string {
  // Skip if hub href already appears in the lead paragraph (idempotent re-run).
  const leadMatch = html.match(/<p class="lead">([\s\S]*?)<\/p>/);
  if (!leadMatch) return html;
  if (leadMatch[1].includes(hubHref)) return html;
  // Append anchor inside the closing </p>.
  const replaced = html.replace(
    /<p class="lead">([\s\S]*?)<\/p>/,
    (_match: string, body: string) => `<p class="lead">${body}${anchor}</p>`,
  );
  return replaced;
}

async function run() {
  const slugs = [
    'vanity-renovation-cost-vancouver',
    'bathtub-renovation-cost-vancouver',
    'toilet-renovation-cost-vancouver',
  ];

  for (const slug of slugs) {
    const r = await pool.query(
      'SELECT content_en, content_zh FROM blog_posts WHERE slug = $1',
      [slug],
    );
    if (r.rows.length === 0) {
      console.log(`SKIP (not found): ${slug}`);
      continue;
    }
    const { content_en, content_zh } = r.rows[0];

    const newEn = insertHubAnchor(content_en, ANCHOR_EN, HUB_HREF_EN);
    const newZh = insertHubAnchor(content_zh, ANCHOR_ZH, HUB_HREF_ZH);

    if (newEn === content_en && newZh === content_zh) {
      console.log(`NOOP (already anchored): ${slug}`);
      continue;
    }

    await pool.query(
      'UPDATE blog_posts SET content_en = $1, content_zh = $2, updated_at = NOW() WHERE slug = $3',
      [newEn, newZh, slug],
    );
    console.log(`UPDATED ${slug}: hub anchor inserted (EN=${newEn !== content_en}, ZH=${newZh !== content_zh})`);
  }

  await pool.end();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
