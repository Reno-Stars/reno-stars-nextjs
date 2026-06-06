/**
 * Locale-scoped cache invalidation for blog edits.
 *
 * A blog post is one DB row whose 14 locale pages all render from it, with
 * per-locale overrides in the `localizations` jsonb (`titleJa`, `contentZhHant`,
 * …) falling back to the EN/ZH base columns. The fallback chain (lib/utils
 * `pickLocale`) is: most locales → `en`; `zh-Hant` → `zh` → `en`.
 *
 * Previously every blog edit regenerated all 14 locale pages — even a
 * single-locale MT backfill (e.g. writing `contentJa`). That 14× fan-out is
 * the dominant write source on `/[locale]/blog/[slug]`. `blogChangedLocales`
 * returns only the locales whose *rendered* output actually changed, so the
 * admin action can invalidate just those (per-locale cache tag + path).
 *
 * Correctness over savings: when in doubt we include the locale (a missed
 * inclusion would leave stale content; an extra inclusion only costs one
 * regeneration). Global field changes (image, publish state, slug, …) return
 * all locales.
 */
import { locales as ALL_LOCALES, type Locale } from '@/i18n/config';
import { LOCALE_TO_DB_SUFFIX } from '@/lib/utils';

type Row = Record<string, unknown>;

function norm(v: unknown): unknown {
  if (v instanceof Date) return v.getTime();
  if (v === undefined || v === null || v === '') return null;
  return v;
}
function neq(a: unknown, b: unknown): boolean {
  return norm(a) !== norm(b);
}

// Fields that appear on the rendered page / its metadata and are localized
// via `${field}En` / `${field}Zh` base columns + `${field}${Suffix}` overrides.
// `focusKeyword` is intentionally excluded — it's an admin-only SEO field that
// never reaches the output, so changing it shouldn't regenerate anything.
const RENDER_FIELDS = [
  'title',
  'excerpt',
  'content',
  'metaTitle',
  'metaDescription',
  'seoKeywords',
] as const;

// Non-localized fields — a change affects every locale's page.
const GLOBAL_FIELDS = [
  'slug',
  'isPublished',
  'publishedAt',
  'featuredImageUrl',
  'author',
  'readingTimeMinutes',
  'projectId',
] as const;

/**
 * Returns the set of locales whose rendered blog page changed between `oldRow`
 * and `newRow`. Both must carry the base columns (`titleEn`, `contentZh`, …),
 * `localizations`, `metaOverrides`, and the GLOBAL_FIELDS.
 */
export function blogChangedLocales(oldRow: Row, newRow: Row): Locale[] {
  // Any non-localized change → every locale page changed.
  if (GLOBAL_FIELDS.some((f) => neq(oldRow[f], newRow[f]))) {
    return [...ALL_LOCALES];
  }

  const oldLoc = (oldRow.localizations ?? {}) as Record<string, unknown>;
  const newLoc = (newRow.localizations ?? {}) as Record<string, unknown>;
  const changed = new Set<Locale>();

  for (const field of RENDER_FIELDS) {
    const enChanged = neq(oldRow[`${field}En`], newRow[`${field}En`]);
    const zhChanged = neq(oldRow[`${field}Zh`], newRow[`${field}Zh`]);

    for (const locale of ALL_LOCALES) {
      if (changed.has(locale)) continue;

      if (locale === 'en') {
        if (enChanged) changed.add('en');
        continue;
      }
      if (locale === 'zh') {
        if (zhChanged) changed.add('zh');
        continue;
      }

      const suffix = LOCALE_TO_DB_SUFFIX[locale];
      const key = suffix ? `${field}${suffix}` : undefined;

      // The locale has its own override for this field that changed.
      if (key && neq(oldLoc[key], newLoc[key])) {
        changed.add(locale);
        continue;
      }
      // It has a (current) override → renders its own value, immune to base changes.
      if (key && norm(newLoc[key]) !== null) continue;

      // No override → it falls back.
      if (locale === 'zh-Hant') {
        // zh-Hant → zh → en
        if (zhChanged) {
          changed.add(locale);
        } else if (norm(newRow[`${field}Zh`]) === null && enChanged) {
          changed.add(locale);
        }
      } else if (enChanged) {
        // every other locale falls back to en
        changed.add(locale);
      }
    }
  }

  // meta_overrides only carries `en`/`zh` SERP title/description overrides.
  if (neq(oldRow.metaOverrides, newRow.metaOverrides)) {
    changed.add('en');
    changed.add('zh');
  }

  return [...changed];
}
