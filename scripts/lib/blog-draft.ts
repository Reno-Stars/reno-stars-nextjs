/**
 * Validation for a blog draft before it becomes a row in blog_posts.
 *
 * The agent writes drafts as JSON under blog-drafts/. Nothing published them:
 * the site renders from the blog_posts table, so a markdown or JSON file in the
 * repo is invisible no matter how many are written. This is the missing half.
 *
 * The checks below are the ones that actually bit when a draft was inserted by
 * hand on 2026-09-02: two missing values silently shifted every column after
 * them, and two fields exceeded their varchar limits.
 */

/** column -> varchar limit in blog_posts. Anything longer is rejected by Postgres. */
export const LIMITS: Record<string, number> = {
  slug: 200,
  titleEn: 255,
  titleZh: 255,
  metaTitleEn: 70,
  metaTitleZh: 70,
  metaDescriptionEn: 155,
  metaDescriptionZh: 155,
  focusKeywordEn: 50,
  focusKeywordZh: 50,
  featuredImageUrl: 500,
};

export const REQUIRED = [
  'slug', 'titleEn', 'titleZh', 'contentEn', 'contentZh',
  'excerptEn', 'excerptZh', 'metaTitleEn', 'metaTitleZh',
  'metaDescriptionEn', 'metaDescriptionZh',
  // seo_keywords are required at insert, not backfilled later. Two posts went
  // live on 2026-09-04 without them and each had to be patched by hand
  // afterwards; a field that is always fixed after the fact belongs in the
  // gate, or it just becomes recurring manual work.
  'seoKeywordsEn', 'seoKeywordsZh',
] as const;

export interface DraftProblem {
  field: string;
  problem: string;
}

export function validateDraft(draft: Record<string, unknown>): DraftProblem[] {
  const problems: DraftProblem[] = [];

  for (const field of REQUIRED) {
    const v = draft[field];
    if (typeof v !== 'string' || v.trim() === '') {
      problems.push({ field, problem: 'required and must be a non-empty string' });
    }
  }

  for (const [field, max] of Object.entries(LIMITS)) {
    const v = draft[field];
    if (typeof v === 'string' && v.length > max) {
      problems.push({ field, problem: `${v.length} chars exceeds the varchar(${max}) column` });
    }
  }

  if (typeof draft.slug === 'string' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) {
    problems.push({ field: 'slug', problem: 'must be lowercase kebab-case' });
  }

  // The company's Chinese trade name is 聚星装修 / 聚星裝修. Machine translation
  // invents literal renderings, which read as a different company entirely.
  for (const field of ['titleZh', 'contentZh', 'excerptZh', 'metaTitleZh', 'metaDescriptionZh']) {
    const v = draft[field];
    if (typeof v === 'string' && /雷諾之星|雷诺之星|里诺明星/.test(v)) {
      problems.push({ field, problem: 'uses a transliterated brand name; the Chinese trade name is 聚星装修 / 聚星裝修' });
    }
  }

  return problems;
}
