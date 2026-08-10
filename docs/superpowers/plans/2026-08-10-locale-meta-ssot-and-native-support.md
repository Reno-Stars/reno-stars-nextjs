# Locale SSOT Table + Native Language Support Notice — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse six scattered `Record<Locale, X>` maps into one `LOCALE_META` table in `i18n/config.ts`, then add a `nativeSupport` field that drives a plain notice on the contact page for the 11 locales Reno Stars cannot yet serve natively.

**Architecture:** `locales` stays the ordered SSOT list. `LOCALE_META: Record<Locale, LocaleMeta>` hangs off it (exhaustiveness-checked by the compiler). Every export in use today — `ogLocaleMap`, `LOCALE_TO_SUFFIX`, `LOCALE_TARGETS`, all of them — keeps its exact name and value, now computed from the table. That is what keeps a 12-field consolidation from becoming a 50-file rewrite: only 5 files are re-pointed. Correctness is proven by a characterization test written first, pinning every derived value as a literal before any code moves.

**Tech Stack:** Next.js 15 App Router, TypeScript, next-intl, Vitest + Testing Library, `Intl.DisplayNames` / `Intl.ListFormat` (no new dependencies).

**Spec:** `docs/superpowers/specs/2026-08-10-locale-meta-ssot-and-native-support-design.md`
**Branch:** `feat/locale-meta-ssot` (already created, spec already committed)
**Working directory:** `~/workspace/reno-stars-nextjs-prod`

## Global Constraints

- **Zero behavior change in Tasks 1–6.** Every derived export must keep its exact current value. The characterization test from Task 1 must stay green through every one of these tasks.
- **Do not edit the characterization test after Task 1** except to add coverage. If it fails, the refactor is wrong — not the test.
- **All 14 locales, always:** `en, zh, zh-Hant, ja, ko, es, pa, tl, fa, vi, ru, ar, hi, fr`. A missing namespace file 500s an entire locale.
- **`i18n/config.ts` may import only `next-intl/routing` and `import type` statements.** A value import from `lib/` creates a runtime cycle.
- **Preserve every existing doc comment.** The `INDEXABLE_LEAF_LOCALES` block (the 2026-07-07 GSC finding, the `locale_readiness.py` gate) and the `matrix.ts` per-row rationale are the most valuable content in those files. They move with their data; they are never deleted.
- **Gate before every commit:** `pnpm typecheck && pnpm lint && pnpm test:run`.
- **Never use `--no-verify`.** Never weaken a lint or test config to make something pass.
- **Commit message trailer** on every commit: `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`
- **Run tests with `pnpm test:run` (never `pnpm test`)** — `pnpm test` starts vitest in watch mode and will hang. Never pipe test output through `head`/`tail`.

## File Structure

**Modified — Commit 1 (refactor):**
- `i18n/config.ts` — gains `LocaleMeta` + `LOCALE_META`; all local maps become derived. ~140 → ~280 lines.
- `lib/admin/locale-keys.ts` — `LOCALE_TO_SUFFIX` derived; `isNativeLocale` renamed `hasDedicatedColumn`.
- `lib/admin/gtx-translate.ts` — `GTX_LANG` derived and exported.
- `lib/utils.ts` — `LOCALE_FALLBACKS` derived; rename call site.
- `lib/share/matrix.ts` — `LOCALE_TARGETS` derived; keeps `UNIVERSAL_TAIL` + `VISIBLE_CAP`.
- `lib/company-config.ts` — `LOCALIZED_BRAND_NAMES` derived.
- `components/admin/{LocalizedInput,LocalizedTextarea,LocalizedFormContext,TranslateAllButton}.tsx` — rename only.

**Created — Commit 1:**
- `tests/unit/i18n/locale-meta-characterization.test.ts` — the safety net.

**Created — Commit 2 (feature):**
- `lib/i18n/language-names.ts` — `Intl`-driven language naming.
- `components/LanguageSupportNotice.tsx` — the notice.
- `tests/unit/lib/language-names.test.ts`
- `tests/unit/components/LanguageSupportNotice.test.tsx`

**Modified — Commit 2:**
- `i18n/config.ts` — add the `nativeSupport` field.
- `components/pages/ContactPage.tsx` — mount the notice.
- `messages/<locale>/contact.json` × 14 — one new key.

## Commit Shape

Tasks 1–6 each commit separately so a regression is bisectable to a single map. The spec approved a **two-commit** shape; if you want that exactly, squash 1–6 into one `refactor(i18n): single LOCALE_META table` before merge. Tasks 7–10 are the feature.

## Critical Codebase Facts

Read these before starting — they are non-obvious and each one has already caused a wrong assumption:

1. **`tests/setup.ts` globally mocks `next-intl`:** `useLocale: () => 'en'` and `useTranslations: () => (key) => key`. A component that reads its locale from `useLocale()` is untestable per-locale. The codebase's answer, which this plan follows, is `components/ZhTrustSignals.tsx` — `WeChatContactCard` takes `locale` as a **prop** and its test uses `renderToStaticMarkup`.
2. **`tests/unit/i18n/message-parity.test.ts`** fails unless all 14 locales carry every EN key. New keys land in all 14 files in the same commit.
3. **`tests/unit/i18n/message-icu.test.ts`** already asserts every message compiles as ICU *and* consumes the same argument set as EN. The new 2-argument key is auto-gated — no extra ICU test needed.
4. **`lib/share/types.ts` imports only `react` types.** `import type { PlatformId }` into `i18n/config.ts` is cycle-free and erased at compile time.
5. **`GTX_LANG` and `LOCALE_FALLBACKS` are module-private today.** `GTX_LANG` gets exported in Task 4 so it can be characterized; that widening is intentional and noted there.
6. **`messages/` is one directory per locale with one file per namespace** (`messages/en/contact.json`), not one JSON per locale. The registry is `i18n/namespaces.ts`; `contact` is already listed, so no registry edit is needed.

---

## Task 1: Characterization test — the safety net

Pins every derived export as literal data. **Must pass against today's unrefactored code.** A test that only passes after the refactor proves nothing.

**Files:**
- Create: `tests/unit/i18n/locale-meta-characterization.test.ts`

**Interfaces:**
- Consumes: current exports — `locales`, `localeNames`, `ogLocaleMap`, `rtlLocales`, `isRtl`, `INDEXABLE_LEAF_LOCALES`, `isIndexableLeafLocale`, `PRERENDERED_LOCALES` from `@/i18n/config`; `LOCALE_TO_SUFFIX`, `localeSuffix`, `fieldKey`, `isNativeLocale` from `@/lib/admin/locale-keys`; `LOCALE_TO_DB_SUFFIX`, `pickLocale` from `@/lib/utils`; `LOCALE_TARGETS` from `@/lib/share/matrix`; `LOCALIZED_BRAND_NAMES`, `brandName`, `brandDisplay` from `@/lib/company-config`.
- Produces: nothing. Pure guard for Tasks 2–6.

- [ ] **Step 1: Write the characterization test**

Create `tests/unit/i18n/locale-meta-characterization.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  locales, localeNames, ogLocaleMap, rtlLocales, isRtl,
  INDEXABLE_LEAF_LOCALES, isIndexableLeafLocale, PRERENDERED_LOCALES,
} from '@/i18n/config';
import { LOCALE_TO_SUFFIX, localeSuffix, fieldKey, isNativeLocale } from '@/lib/admin/locale-keys';
import { LOCALE_TO_DB_SUFFIX, pickLocale } from '@/lib/utils';
import { LOCALE_TARGETS } from '@/lib/share/matrix';
import { LOCALIZED_BRAND_NAMES, brandName, brandDisplay } from '@/lib/company-config';

// Characterization test for the LOCALE_META consolidation (2026-08-10).
//
// Every value below is the value these exports had BEFORE the refactor,
// transcribed as a literal. The refactor moves all of them into one table in
// i18n/config.ts and re-derives the exports; this file is the proof that the
// move changed nothing. It passed against the pre-refactor code, and it must
// keep passing after every step.
//
// If this fails during the refactor, the refactor is wrong. Do not edit the
// expectations to match new output — that defeats the entire purpose of the
// file. The only legitimate edit is ADDING coverage.
//
// Literals, deliberately, not toMatchSnapshot(): a snapshot regenerated
// mid-refactor silently blesses whatever the broken code produced.

describe('locales list', () => {
  it('is the 14 locales, en first', () => {
    expect(locales).toEqual([
      'en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa',
      'tl', 'fa', 'vi', 'ru', 'ar', 'hi', 'fr',
    ]);
  });
});

describe('localeNames', () => {
  it('matches the pre-refactor endonyms exactly', () => {
    expect(localeNames).toEqual({
      en: 'English',
      zh: '简体中文',
      'zh-Hant': '繁體中文',
      ja: '日本語',
      ko: '한국어',
      es: 'Español',
      pa: 'ਪੰਜਾਬੀ',
      tl: 'Tagalog',
      fa: 'فارسی',
      vi: 'Tiếng Việt',
      ru: 'Русский',
      ar: 'العربية',
      hi: 'हिन्दी',
      fr: 'Français',
    });
  });
});

describe('ogLocaleMap', () => {
  it('matches the pre-refactor og:locale codes exactly', () => {
    expect(ogLocaleMap).toEqual({
      en: 'en_US',
      zh: 'zh_CN',
      'zh-Hant': 'zh_TW',
      ja: 'ja_JP',
      ko: 'ko_KR',
      es: 'es_ES',
      pa: 'pa_IN',
      tl: 'tl_PH',
      fa: 'fa_IR',
      vi: 'vi_VN',
      ru: 'ru_RU',
      ar: 'ar_AE',
      hi: 'hi_IN',
      fr: 'fr_CA',
    });
  });
});

describe('writing direction', () => {
  it('rtlLocales is exactly fa and ar', () => {
    expect([...rtlLocales].sort()).toEqual(['ar', 'fa']);
  });

  it('isRtl agrees with rtlLocales for all 14', () => {
    for (const loc of locales) {
      expect(isRtl(loc)).toBe(loc === 'fa' || loc === 'ar');
    }
  });
});

describe('indexability', () => {
  it('all 14 leaf locales are indexable (opened 2026-08-07)', () => {
    expect([...INDEXABLE_LEAF_LOCALES].sort()).toEqual([...locales].sort());
  });

  it('isIndexableLeafLocale is true for all 14 and false for an unknown code', () => {
    for (const loc of locales) expect(isIndexableLeafLocale(loc)).toBe(true);
    expect(isIndexableLeafLocale('de')).toBe(false);
  });

  it('PRERENDERED_LOCALES is empty — the site is force-dynamic SSR', () => {
    expect([...PRERENDERED_LOCALES]).toEqual([]);
  });
});

describe('DB field suffixes', () => {
  it('LOCALE_TO_SUFFIX matches the pre-refactor map exactly', () => {
    expect(LOCALE_TO_SUFFIX).toEqual({
      en: 'En',
      zh: 'Zh',
      'zh-Hant': 'ZhHant',
      ja: 'Ja',
      ko: 'Ko',
      es: 'Es',
      pa: 'Pa',
      tl: 'Tl',
      fa: 'Fa',
      vi: 'Vi',
      ru: 'Ru',
      ar: 'Ar',
      hi: 'Hi',
      fr: 'Fr',
    });
  });

  it('localeSuffix and fieldKey are unchanged', () => {
    expect(localeSuffix('zh-Hant')).toBe('ZhHant');
    expect(fieldKey('title', 'ja')).toBe('titleJa');
    expect(fieldKey('description', 'zh-Hant')).toBe('descriptionZhHant');
    expect(fieldKey('title', 'en')).toBe('titleEn');
  });

  it('only en and zh have dedicated DB columns', () => {
    for (const loc of locales) {
      expect(isNativeLocale(loc)).toBe(loc === 'en' || loc === 'zh');
    }
  });

  it('LOCALE_TO_DB_SUFFIX covers the 12 jsonb locales and omits en/zh', () => {
    expect(LOCALE_TO_DB_SUFFIX).toEqual({
      'zh-Hant': 'ZhHant',
      ja: 'Ja',
      ko: 'Ko',
      es: 'Es',
      pa: 'Pa',
      tl: 'Tl',
      fa: 'Fa',
      vi: 'Vi',
      ru: 'Ru',
      ar: 'Ar',
      hi: 'Hi',
      fr: 'Fr',
    });
  });
});

describe('translation fallback chain (observable via pickLocale)', () => {
  it('zh-Hant falls back to zh before en', () => {
    expect(pickLocale({ en: 'EN', zh: 'ZH' }, 'zh-Hant')).toBe('ZH');
  });

  it('zh-Hant falls back to en when zh is absent', () => {
    expect(pickLocale({ en: 'EN' }, 'zh-Hant')).toBe('EN');
  });

  it('zh-Hant prefers its own value over the chain', () => {
    expect(pickLocale({ en: 'EN', zh: 'ZH', 'zh-Hant': 'HANT' }, 'zh-Hant')).toBe('HANT');
  });

  it('every other locale falls straight back to en', () => {
    for (const loc of locales) {
      if (loc === 'en' || loc === 'zh-Hant') continue;
      expect(pickLocale({ en: 'EN', zh: 'ZH' }, loc)).toBe(loc === 'zh' ? 'ZH' : 'EN');
    }
  });
});

describe('LOCALE_TARGETS — share platforms per locale, order significant', () => {
  it('matches the pre-refactor matrix exactly', () => {
    expect(LOCALE_TARGETS).toEqual({
      en: ['facebook', 'x', 'linkedin', 'pinterest', 'whatsapp', 'reddit', 'threads', 'bluesky', 'messenger', 'tumblr', 'sms'],
      fr: ['facebook', 'x', 'linkedin', 'whatsapp', 'pinterest', 'telegram', 'threads', 'messenger', 'sms'],
      es: ['whatsapp', 'facebook', 'x', 'messenger', 'telegram', 'pinterest', 'threads', 'sms'],
      tl: ['facebook', 'messenger', 'whatsapp', 'x', 'viber', 'telegram', 'pinterest', 'sms'],
      zh: ['wechat', 'weibo', 'qzone', 'x', 'facebook', 'line'],
      'zh-Hant': ['wechat', 'line', 'facebook', 'x', 'weibo', 'threads', 'telegram'],
      ja: ['line', 'x', 'facebook', 'threads', 'pinterest', 'tumblr'],
      ko: ['x', 'facebook', 'line', 'threads', 'pinterest'],
      hi: ['whatsapp', 'facebook', 'telegram', 'x', 'messenger', 'pinterest', 'sms'],
      pa: ['whatsapp', 'facebook', 'telegram', 'x', 'messenger', 'pinterest', 'sms'],
      ar: ['whatsapp', 'telegram', 'facebook', 'x', 'viber', 'pinterest', 'sms'],
      fa: ['whatsapp', 'telegram', 'facebook', 'x', 'viber', 'pinterest', 'sms'],
      ru: ['telegram', 'vk', 'whatsapp', 'viber', 'x', 'facebook'],
      vi: ['facebook', 'zalo', 'messenger', 'telegram', 'x', 'viber', 'pinterest'],
    });
  });

  it('covers every locale', () => {
    expect(Object.keys(LOCALE_TARGETS).sort()).toEqual([...locales].sort());
  });
});

describe('localized brand names', () => {
  it('only zh and zh-Hant have one', () => {
    expect(LOCALIZED_BRAND_NAMES).toEqual({
      zh: '聚星装修',
      'zh-Hant': '聚星裝修',
    });
  });

  it('brandName falls back to the English brand', () => {
    expect(brandName('zh')).toBe('聚星装修');
    expect(brandName('zh-Hant')).toBe('聚星裝修');
    expect(brandName('en')).toBe('Reno Stars');
    expect(brandName('ko')).toBe('Reno Stars');
  });

  it('brandDisplay surfaces both names — owner rule 2026-07-09', () => {
    expect(brandDisplay('zh')).toBe('聚星装修 (Reno Stars)');
    expect(brandDisplay('zh-Hant')).toBe('聚星裝修 (Reno Stars)');
    expect(brandDisplay('en')).toBe('Reno Stars');
  });
});
```

- [ ] **Step 2: Run it against the UNREFACTORED code**

```bash
pnpm test:run tests/unit/i18n/locale-meta-characterization.test.ts
```

Expected: **PASS**, all assertions green.

This is the critical step. If anything fails now, a literal above was transcribed wrong — fix the *literal* to match today's real value, not the source code. Do not proceed until green.

- [ ] **Step 3: Commit**

```bash
git add tests/unit/i18n/locale-meta-characterization.test.ts
git commit -m "$(cat <<'EOF'
test(i18n): characterize every per-locale map before consolidation

Pins the current value of all 14 locales' endonym, og code, direction,
indexability, DB suffix, fallback behavior, share targets and brand name
as literals. Green against the pre-refactor code; the LOCALE_META
consolidation must keep it green.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `LOCALE_META` table + the five in-file maps

**Files:**
- Modify: `i18n/config.ts`

**Interfaces:**
- Produces: `LocaleMeta` interface; `LOCALE_META: Record<Locale, LocaleMeta>`. Tasks 3–6 add fields to `LocaleMeta`; Tasks 7–10 read `LOCALE_META[locale].nativeSupport`.
- Preserves: `locales`, `Locale`, `defaultLocale`, `localeNames`, `ogLocaleMap`, `rtlLocales`, `isRtl`, `INDEXABLE_LEAF_LOCALES`, `isIndexableLeafLocale`, `PRERENDERED_LOCALES`, `localePrefix`, `routing` — same names, same values.

This task introduces the 5 fields that already live in `i18n/config.ts`. Later tasks add the cross-file ones. Splitting this way keeps each task's blast radius to one concern.

- [ ] **Step 1: Add the interface and table above the existing exports**

In `i18n/config.ts`, keep `locales`, `Locale` and `defaultLocale` exactly as they are (including the demographics comment above `locales`). After `defaultLocale`, insert:

```ts
/**
 * Everything the site knows about one locale, in one row.
 *
 * Before 2026-08-10 these fields were six separate `Record<Locale, X>` maps in
 * five files — endonym and og code here, DB suffix in lib/admin/locale-keys,
 * Google Translate code in lib/admin/gtx-translate, fallback chain in
 * lib/utils, share platforms in lib/share/matrix, brand name in
 * lib/company-config. Adding a locale meant finding all six, and nothing
 * failed loudly if you missed one.
 *
 * Now: one row. Every one of those exports still exists under its old name and
 * is derived from this table, so no consumer had to change.
 */
export interface LocaleMeta {
  /** Endonym, as shown in the language switcher. */
  name: string;
  /** og:locale — BCP 47 with region. */
  ogLocale: string;
  /** Writing direction. Drives <html dir> and logical CSS properties. */
  dir: 'ltr' | 'rtl';
  /**
   * Leaf pages (project/site detail, video detail, service×city) may be
   * indexed. When false the page gets `robots: noindex, follow`, is dropped
   * from that route's hreflang set, and is omitted from the sitemap.
   *
   * Why a gate exists: on 2026-07-07 GSC reported ~750 project-leaf and ~1,800
   * service×city URLs as "Crawled - currently not indexed". Google had already
   * judged the minor-locale variants low-value, so they were noindexed to stop
   * burning crawl budget re-fetching them.
   *
   * Turning one on is a CONTENT decision, not a config one. All 14 were opened
   * 2026-08-07 after every locale cleared the measured gate in
   * `agent-skills/marketing-all/scripts/locale_readiness.py` (hub repo):
   * project cover >=.90, blog body >=.85, link health >=.90, zero known
   * mistranslations, English meta <=.10. Re-run it before flipping another one
   * or after any bulk translation — it is cheap, and it is the only thing
   * standing between this flag and indexing machine-translation damage.
   *
   * Blog posts are gated separately and more strictly, on having a NATIVE body
   * (app/[locale]/blog/[slug]/page.tsx + the nativeLocales filter in
   * app/sitemap.ts). That gate stays: an untranslated post renders the English
   * body under a foreign-language URL, which is genuine duplicate content.
   */
  indexableLeaf: boolean;
  /**
   * Prerendered at build time. All false since 2026-06-08: the whole site is
   * force-dynamic SSR (see app/[locale]/layout.tsx), so nothing is prerendered
   * and every `generateStaticParams` returns []. Flip one to true to
   * reintroduce build-time prerendering for a high-traffic locale.
   */
  prerender: boolean;
}

/**
 * The table. Keyed by `Locale`, so a 15th locale added to `locales` above will
 * NOT compile until every field here is answered for it. That failure is the
 * feature.
 */
export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en:        { name: 'English',   ogLocale: 'en_US', dir: 'ltr', indexableLeaf: true, prerender: false },
  zh:        { name: '简体中文',   ogLocale: 'zh_CN', dir: 'ltr', indexableLeaf: true, prerender: false },
  'zh-Hant': { name: '繁體中文',   ogLocale: 'zh_TW', dir: 'ltr', indexableLeaf: true, prerender: false },
  ja:        { name: '日本語',     ogLocale: 'ja_JP', dir: 'ltr', indexableLeaf: true, prerender: false },
  ko:        { name: '한국어',     ogLocale: 'ko_KR', dir: 'ltr', indexableLeaf: true, prerender: false },
  es:        { name: 'Español',   ogLocale: 'es_ES', dir: 'ltr', indexableLeaf: true, prerender: false },
  pa:        { name: 'ਪੰਜਾਬੀ',     ogLocale: 'pa_IN', dir: 'ltr', indexableLeaf: true, prerender: false },
  tl:        { name: 'Tagalog',   ogLocale: 'tl_PH', dir: 'ltr', indexableLeaf: true, prerender: false },
  fa:        { name: 'فارسی',     ogLocale: 'fa_IR', dir: 'rtl', indexableLeaf: true, prerender: false },
  vi:        { name: 'Tiếng Việt', ogLocale: 'vi_VN', dir: 'ltr', indexableLeaf: true, prerender: false },
  ru:        { name: 'Русский',   ogLocale: 'ru_RU', dir: 'ltr', indexableLeaf: true, prerender: false },
  ar:        { name: 'العربية',   ogLocale: 'ar_AE', dir: 'rtl', indexableLeaf: true, prerender: false },
  hi:        { name: 'हिन्दी',      ogLocale: 'hi_IN', dir: 'ltr', indexableLeaf: true, prerender: false },
  fr:        { name: 'Français',  ogLocale: 'fr_CA', dir: 'ltr', indexableLeaf: true, prerender: false },
};

/** Build a `Record<Locale, T>` by reading one field off every row. */
export function mapMeta<T>(pick: (meta: LocaleMeta) => T): Record<Locale, T> {
  return Object.fromEntries(
    locales.map((loc) => [loc, pick(LOCALE_META[loc])]),
  ) as Record<Locale, T>;
}

/** Locales where `pick` holds, in `locales` order. */
function localesWhere(pick: (meta: LocaleMeta) => boolean): readonly Locale[] {
  return locales.filter((loc) => pick(LOCALE_META[loc]));
}
```

- [ ] **Step 2: Replace the five hand-written maps with derived ones**

Delete the literal `localeNames`, `ogLocaleMap`, `rtlLocales`, `INDEXABLE_LEAF_LOCALES` and `PRERENDERED_LOCALES` declarations (their doc comments have already moved onto the `LocaleMeta` fields) and put in their place:

```ts
/** Endonyms for the language switcher. Derived from LOCALE_META. */
export const localeNames: Record<Locale, string> = mapMeta((m) => m.name);

/** OpenGraph locale codes (BCP 47 with region). Derived from LOCALE_META. */
export const ogLocaleMap: Record<Locale, string> = mapMeta((m) => m.ogLocale);

/** Locales that render right-to-left. Used in <html dir="rtl"> and CSS layout. */
export const rtlLocales: readonly Locale[] = localesWhere((m) => m.dir === 'rtl');

export function isRtl(locale: Locale): boolean {
  return LOCALE_META[locale].dir === 'rtl';
}

/** Locales whose LEAF pages are indexable. See LocaleMeta.indexableLeaf. */
export const INDEXABLE_LEAF_LOCALES: readonly Locale[] = localesWhere((m) => m.indexableLeaf);

/** True when this locale's leaf pages may be indexed. */
export function isIndexableLeafLocale(locale: string): boolean {
  return (INDEXABLE_LEAF_LOCALES as readonly string[]).includes(locale);
}

/** Locales prerendered at build time. See LocaleMeta.prerender. */
export const PRERENDERED_LOCALES: readonly Locale[] = localesWhere((m) => m.prerender);
```

Leave `localePrefix` and the `routing` block untouched, including the two long comments explaining `localeCookie: false` and `alternateLinks: false`.

- [ ] **Step 3: Check the two consumers whose TYPE narrowed**

`INDEXABLE_LEAF_LOCALES` and `PRERENDERED_LOCALES` were const tuples (`as const satisfies readonly Locale[]`) and are now `readonly Locale[]`. Read every consumer and confirm none depends on the literal tuple type:

```bash
grep -rn "INDEXABLE_LEAF_LOCALES\|PRERENDERED_LOCALES" --include='*.ts' --include='*.tsx' . \
  | grep -v node_modules | grep -v '.claude/worktrees' | grep -v tests/
```

Expected: `.includes()` calls and spreads, for which this is inert. `pnpm typecheck` in Step 4 is the real arbiter — if it errors on one of these, add `as const` back at the derived declaration rather than changing the consumer.

- [ ] **Step 4: Run the full gate**

```bash
pnpm test:run tests/unit/i18n/locale-meta-characterization.test.ts
pnpm typecheck && pnpm lint && pnpm test:run
```

Expected: all PASS. The characterization test proves the five maps still hold identical values.

- [ ] **Step 5: Commit**

```bash
git add i18n/config.ts
git commit -m "$(cat <<'EOF'
refactor(i18n): introduce LOCALE_META, derive the in-file locale maps

localeNames, ogLocaleMap, rtlLocales, INDEXABLE_LEAF_LOCALES and
PRERENDERED_LOCALES now read off one table instead of being five
hand-maintained lists. Same names, same values — no consumer changed.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Absorb `dbSuffix` + `dbColumn`, rename `isNativeLocale`

**Files:**
- Modify: `i18n/config.ts` (add 2 fields)
- Modify: `lib/admin/locale-keys.ts`
- Modify: `lib/utils.ts:8,106`
- Modify: `components/admin/LocalizedInput.tsx:4,89,98`
- Modify: `components/admin/LocalizedTextarea.tsx:4,60,65`
- Modify: `components/admin/LocalizedFormContext.tsx:5,100`
- Modify: `components/admin/TranslateAllButton.tsx:4,33`
- Modify: `tests/unit/i18n/locale-meta-characterization.test.ts` (rename the import only)

**Interfaces:**
- Consumes: `LOCALE_META`, `mapMeta` from Task 2.
- Produces: `LocaleMeta.dbSuffix: string`, `LocaleMeta.dbColumn: boolean`; `hasDedicatedColumn(loc: Locale): boolean` exported from `@/lib/admin/locale-keys` (replaces `isNativeLocale`, identical behavior).

**Why the rename:** `isNativeLocale` means "has a dedicated `*_en`/`*_zh` DB column". Task 7 adds `nativeSupport`, meaning "a human speaks it". Two unrelated senses of *native* one import apart is a live trap. Pure rename, no behavior change.

- [ ] **Step 1: Add the two fields to `LocaleMeta` and every row**

In `i18n/config.ts`, add to the `LocaleMeta` interface after `prerender`:

```ts
  /**
   * camelCase suffix for this locale's per-locale field key:
   * ('title', 'zh-Hant') → `titleZhHant`.
   */
  dbSuffix: string;
  /**
   * Has dedicated `*_en` / `*_zh` DB columns. The other 12 locales live in the
   * `localizations` jsonb under `${fieldName}${dbSuffix}` keys.
   */
  dbColumn: boolean;
```

Add to each row (`dbColumn: true` for `en` and `zh` only). **`…` below stands for the fields already on that row from Task 2 — leave them exactly as they are; never type the ellipsis:**

```ts
  en:        { …, dbSuffix: 'En',     dbColumn: true  },
  zh:        { …, dbSuffix: 'Zh',     dbColumn: true  },
  'zh-Hant': { …, dbSuffix: 'ZhHant', dbColumn: false },
  ja:        { …, dbSuffix: 'Ja',     dbColumn: false },
  ko:        { …, dbSuffix: 'Ko',     dbColumn: false },
  es:        { …, dbSuffix: 'Es',     dbColumn: false },
  pa:        { …, dbSuffix: 'Pa',     dbColumn: false },
  tl:        { …, dbSuffix: 'Tl',     dbColumn: false },
  fa:        { …, dbSuffix: 'Fa',     dbColumn: false },
  vi:        { …, dbSuffix: 'Vi',     dbColumn: false },
  ru:        { …, dbSuffix: 'Ru',     dbColumn: false },
  ar:        { …, dbSuffix: 'Ar',     dbColumn: false },
  hi:        { …, dbSuffix: 'Hi',     dbColumn: false },
  fr:        { …, dbSuffix: 'Fr',     dbColumn: false },
```

- [ ] **Step 2: Derive in `lib/admin/locale-keys.ts` and rename**

Replace the literal `LOCALE_TO_SUFFIX` and the `isNativeLocale` function:

```ts
import { locales, LOCALE_META, mapMeta, type Locale } from '@/i18n/config';

/**
 * Map a locale code to the camelCase suffix used as the per-locale field key.
 *
 * en/zh use 'En'/'Zh' but live in dedicated `*_en` / `*_zh` DB columns with
 * form fields `titleEn` / `titleZh`. The other 12 locales live in the
 * `localizations` jsonb under `${fieldName}${Suffix}` keys (e.g. `titleJa`,
 * `descriptionZhHant`).
 *
 * SSOT is LOCALE_META.dbSuffix in i18n/config.ts — edit suffixes there.
 */
export const LOCALE_TO_SUFFIX: Record<Locale, string> = mapMeta((m) => m.dbSuffix);

/** All 14 locale codes, EN first. */
export const ADMIN_LOCALES = locales;

/**
 * True for locales that map to a dedicated `*_en` / `*_zh` DB column, as
 * opposed to living in the `localizations` jsonb.
 *
 * Named `hasDedicatedColumn`, not `isNativeLocale`: `LOCALE_META.nativeSupport`
 * means something completely different (a team member speaks the language), and
 * two senses of "native" one import apart is how a wrong call site gets written.
 */
export function hasDedicatedColumn(loc: Locale): boolean {
  return LOCALE_META[loc].dbColumn;
}
```

`mapMeta` is already exported from `i18n/config.ts` (Task 2).

Then update the two internal uses further down the same file — `localizationKeys` (line ~53) and any other — replacing `isNativeLocale(loc)` with `hasDedicatedColumn(loc)`. `fieldKey` and `localeSuffix` are unchanged.

- [ ] **Step 3: Rename at the other 5 call sites**

```bash
grep -rln "isNativeLocale" --include='*.ts' --include='*.tsx' . \
  | grep -v node_modules | grep -v '.claude/worktrees' \
  | xargs sed -i '' 's/\bisNativeLocale\b/hasDedicatedColumn/g'
grep -rn "isNativeLocale" --include='*.ts' --include='*.tsx' . \
  | grep -v node_modules | grep -v '.claude/worktrees'
```

The second command must print nothing. This also rewrites the characterization test's import and the assertion inside `it('only en and zh have dedicated DB columns')`, which is correct — it is a rename, not a change of expectation.

- [ ] **Step 4: Run the gate**

```bash
pnpm typecheck && pnpm lint && pnpm test:run
```

Expected: all PASS. Pay attention to the characterization test's `LOCALE_TO_SUFFIX`, `fieldKey` and `LOCALE_TO_DB_SUFFIX` blocks — those are what prove the derivation is right.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor(i18n): move DB field suffixes into LOCALE_META

LOCALE_TO_SUFFIX now derives from LOCALE_META.dbSuffix, and the en/zh
dedicated-column test becomes the dbColumn field.

Renames isNativeLocale -> hasDedicatedColumn across 6 files. It meant
"has a *_en/*_zh column", which collides with the nativeSupport field
landing next ("a team member speaks it").

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Absorb `gtxLang` + `fallback`

**Files:**
- Modify: `i18n/config.ts` (add 2 fields)
- Modify: `lib/admin/gtx-translate.ts:8-22`
- Modify: `lib/utils.ts:27-29`
- Modify: `tests/unit/i18n/locale-meta-characterization.test.ts` (add `GTX_LANG` coverage)

**Interfaces:**
- Consumes: `LOCALE_META`, `mapMeta` from Task 2.
- Produces: `LocaleMeta.gtxLang: string`, `LocaleMeta.fallback?: readonly Locale[]`; `GTX_LANG` becomes an **exported** `Record<Locale, string>` from `@/lib/admin/gtx-translate`.

**Note on the export:** `GTX_LANG` is module-private today. Exporting it is a deliberate, minimal widening so the characterization test can pin its 14 values. It is derived data, so there is nothing to keep private.

- [ ] **Step 1: Add the two fields**

In `i18n/config.ts`, add to `LocaleMeta`:

```ts
  /**
   * Google Translate (gtx endpoint) language code. Google wants 'zh-CN' for
   * Simplified and 'zh-TW' for Traditional; every other locale passes through.
   */
  gtxLang: string;
  /**
   * Fallback chain tried before falling back to en, for missing translations.
   * Omitted means straight to en. zh-Hant prefers Simplified because
   * script-conversion is closer to the reader than English is.
   */
  fallback?: readonly Locale[];
```

Add `gtxLang` to all 14 rows (`zh: 'zh-CN'`, `'zh-Hant': 'zh-TW'`, every other locale its own code), and `fallback: ['zh']` to the `zh-Hant` row only.

- [ ] **Step 2: Derive `GTX_LANG`**

In `lib/admin/gtx-translate.ts`, replace the literal map (lines 8–22) with:

```ts
import { mapMeta, type Locale } from '@/i18n/config';

/**
 * Locale → Google Translate locale code. Derived from LOCALE_META.gtxLang.
 * Exported so the locale-meta characterization test can pin it.
 */
export const GTX_LANG: Record<Locale, string> = mapMeta((m) => m.gtxLang);
```

Keep the existing `import { BRAND } from '@/lib/company-config';` and everything below (`DO_NOT_TRANSLATE`, `mask`, `protectGlossary`, `gtxTranslate`) untouched.

- [ ] **Step 3: Derive `LOCALE_FALLBACKS`**

In `lib/utils.ts`, replace lines 27–29 (the literal `LOCALE_FALLBACKS`) with:

```ts
// Fallback chain for missing translations, derived from LOCALE_META.fallback.
// zh-Hant prefers Simplified (script-conversion is closer than English) before
// falling back to en. All other locales fall back directly to en.
const LOCALE_FALLBACKS: Partial<Record<Locale, ReadonlyArray<Locale>>> =
  Object.fromEntries(
    locales
      .map((loc) => [loc, LOCALE_META[loc].fallback] as const)
      .filter(([, chain]) => chain !== undefined),
  );
```

Add `LOCALE_META` to the existing `@/i18n/config` import at the top of the file. `pickLocale` is unchanged: it already appends `en` as the final fallback, so `fallback: ['zh']` reproduces the old `['zh', 'en']` exactly — and the characterization test's four `pickLocale` assertions are what prove it.

- [ ] **Step 4: Add `GTX_LANG` to the characterization test**

Add the import `import { GTX_LANG } from '@/lib/admin/gtx-translate';` and this block:

```ts
describe('GTX_LANG', () => {
  it('matches the pre-refactor Google Translate codes exactly', () => {
    expect(GTX_LANG).toEqual({
      en: 'en',
      zh: 'zh-CN',
      'zh-Hant': 'zh-TW',
      ja: 'ja',
      ko: 'ko',
      es: 'es',
      pa: 'pa',
      tl: 'tl',
      fa: 'fa',
      vi: 'vi',
      ru: 'ru',
      ar: 'ar',
      hi: 'hi',
      fr: 'fr',
    });
  });
});
```

- [ ] **Step 5: Run the gate**

```bash
pnpm typecheck && pnpm lint && pnpm test:run
```

Expected: all PASS, including the four `pickLocale` fallback assertions and the new `GTX_LANG` block.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor(i18n): move Google Translate codes and fallback chains into LOCALE_META

GTX_LANG derives from LOCALE_META.gtxLang (and is now exported so it can
be characterized); LOCALE_FALLBACKS derives from LOCALE_META.fallback.
pickLocale still appends en itself, so fallback: ['zh'] reproduces the
old ['zh','en'] exactly.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Absorb `shareTargets`

The largest single move: 14 rows of share platforms plus their editorial rationale.

**Files:**
- Modify: `i18n/config.ts` (add 1 field + a type-only import)
- Modify: `lib/share/matrix.ts`

**Interfaces:**
- Consumes: `LOCALE_META`, `mapMeta` from Task 2.
- Produces: `LocaleMeta.shareTargets: readonly PlatformId[]`.
- Preserves: `LOCALE_TARGETS`, `UNIVERSAL_TAIL`, `VISIBLE_CAP` from `@/lib/share/matrix`.

- [ ] **Step 1: Add the type-only import and the field**

At the top of `i18n/config.ts`, below the existing `next-intl/routing` import:

```ts
// Type-only: erased at compile time, so i18n/config gains no runtime
// dependency on lib/share. Verified cycle-free — lib/share/types.ts imports
// nothing but react types.
import type { PlatformId } from '@/lib/share/types';
```

Add to `LocaleMeta`:

```ts
  /**
   * Share platforms this audience sees, in render order — the array index IS
   * the order. `lib/share/platforms.ts` deliberately carries no `locales` or
   * `priority` field; two sources of truth for ordering is how a matrix rots.
   *
   * Each row is a bet on how that audience actually shares, not a translation
   * of the English row. A LinkedIn button is dead weight to a zh reader who
   * wants WeChat, and that asymmetry is the entire point of a 14-locale site
   * having a locale-aware share bar. Platforms a row omits are unreachable for
   * that locale — a deliberate cut, not an oversight.
   */
  shareTargets: readonly PlatformId[];
```

- [ ] **Step 2: Move all 14 rows in, comments included**

Add `shareTargets` to each row. Because these arrays are long, give each row a multi-line shape. Transcribe **exactly** — order is behavior. As in Task 3, `…` stands for the fields already on that row; leave them in place and never type the ellipsis:

```ts
  en: {
    …,
    shareTargets: ['facebook', 'x', 'linkedin', 'pinterest', 'whatsapp', 'reddit',
                   'threads', 'bluesky', 'messenger', 'tumblr', 'sms'],
  },
  // Mainland: WeChat/Weibo/QQ are the whole game. X and Facebook are here for
  // overseas Mandarin readers, who are a real slice of this site's zh traffic.
  zh: {
    …,
    shareTargets: ['wechat', 'weibo', 'qzone', 'x', 'facebook', 'line'],
  },
  // HK/TW: LINE is dominant, Weibo much less so than mainland.
  'zh-Hant': {
    …,
    shareTargets: ['wechat', 'line', 'facebook', 'x', 'weibo', 'threads', 'telegram'],
  },
  ja: {
    …,
    shareTargets: ['line', 'x', 'facebook', 'threads', 'pinterest', 'tumblr'],
  },
  // No KakaoTalk: it needs the Kakao JS SDK + a registered app key. Korean
  // readers reach it through the native sheet meanwhile. Tracked as a follow-up.
  ko: {
    …,
    shareTargets: ['x', 'facebook', 'line', 'threads', 'pinterest'],
  },
  es: {
    …,
    shareTargets: ['whatsapp', 'facebook', 'x', 'messenger', 'telegram', 'pinterest',
                   'threads', 'sms'],
  },
  pa: {
    …,
    shareTargets: ['whatsapp', 'facebook', 'telegram', 'x', 'messenger', 'pinterest', 'sms'],
  },
  // Philippines skews hard to Facebook/Messenger; Viber is still widely used.
  tl: {
    …,
    shareTargets: ['facebook', 'messenger', 'whatsapp', 'x', 'viber', 'telegram',
                   'pinterest', 'sms'],
  },
  fa: {
    …,
    shareTargets: ['whatsapp', 'telegram', 'facebook', 'x', 'viber', 'pinterest', 'sms'],
  },
  vi: {
    …,
    shareTargets: ['facebook', 'zalo', 'messenger', 'telegram', 'x', 'viber', 'pinterest'],
  },
  ru: {
    …,
    shareTargets: ['telegram', 'vk', 'whatsapp', 'viber', 'x', 'facebook'],
  },
  ar: {
    …,
    shareTargets: ['whatsapp', 'telegram', 'facebook', 'x', 'viber', 'pinterest', 'sms'],
  },
  hi: {
    …,
    shareTargets: ['whatsapp', 'facebook', 'telegram', 'x', 'messenger', 'pinterest', 'sms'],
  },
  fr: {
    …,
    shareTargets: ['facebook', 'x', 'linkedin', 'whatsapp', 'pinterest', 'telegram',
                   'threads', 'messenger', 'sms'],
  },
```

- [ ] **Step 3: Derive `LOCALE_TARGETS`**

Replace the literal map in `lib/share/matrix.ts` with:

```ts
import { mapMeta, type Locale } from '@/i18n/config';
import type { PlatformId } from './types';

/**
 * Who sees which platforms, and in what order. Derived from
 * LOCALE_META.shareTargets in i18n/config.ts — edit the rows there; the
 * rationale for each audience's row lives with it.
 *
 * Spread into a mutable array: the table's rows are `readonly PlatformId[]`
 * and this export's existing type is not, so callers keep the type they had.
 */
export const LOCALE_TARGETS: Record<Locale, PlatformId[]> = mapMeta(
  (m) => [...m.shareTargets],
);
```

Keep `UNIVERSAL_TAIL` and `VISIBLE_CAP` exactly as they are, with their comments. The existing `import type { Locale } from '@/i18n/config'` at line 1 is replaced by the combined import above — do not leave both, lint will flag the duplicate.

- [ ] **Step 4: Run the gate**

```bash
pnpm typecheck && pnpm lint && pnpm test:run
```

Expected: all PASS. The characterization test's `LOCALE_TARGETS` block compares all 14 arrays element-by-element — a single transposed platform fails it.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor(share): move the locale share matrix into LOCALE_META

All 14 rows and their per-audience rationale move into the locale table;
matrix.ts keeps UNIVERSAL_TAIL and VISIBLE_CAP and derives LOCALE_TARGETS.
Order is behavior, and the characterization test compares every array
element-by-element.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Absorb `brandName`

**Files:**
- Modify: `i18n/config.ts` (add 1 field)
- Modify: `lib/company-config.ts:29-37`

**Interfaces:**
- Consumes: `LOCALE_META` from Task 2.
- Produces: `LocaleMeta.brandName?: string`.
- Preserves: `LOCALIZED_BRAND_NAMES`, `brandName(locale)`, `brandDisplay(locale)`.

Note the name collision: the *field* is `LocaleMeta.brandName`, the *function* is `brandName()` in `lib/company-config.ts`. They live in different modules and both keep their names — the function's body reads the field.

- [ ] **Step 1: Add the field**

In `i18n/config.ts`, add to `LocaleMeta`:

```ts
  /**
   * Owner-confirmed localized trade name. Omitted means this locale renders
   * the English brand. The brand is NEVER machine-translated — zh/zh-Hant were
   * confirmed by Hongming 2026-07-09, re-confirmed 2026-08-05.
   */
  brandName?: string;
```

Add `brandName: '聚星装修'` to the `zh` row and `brandName: '聚星裝修'` to the `zh-Hant` row. No other row gets it.

Note the character: 聚 (not 集). Confirm before ever changing it.

- [ ] **Step 2: Derive in `lib/company-config.ts`**

Replace `LOCALIZED_BRAND_NAMES` (lines 29–37) with:

```ts
/**
 * Owner-confirmed localized trade names, derived from LOCALE_META.brandName.
 * Locales without one render the English brand as-is.
 */
export const LOCALIZED_BRAND_NAMES: Partial<Record<Locale, string>> =
  Object.fromEntries(
    locales
      .map((loc) => [loc, LOCALE_META[loc].brandName] as const)
      .filter(([, name]) => name !== undefined),
  );
```

Add `locales` and `LOCALE_META` to the existing `@/i18n/config` import (currently `import type { Locale }` — it becomes a value import plus the type). Leave `brandName()` and `brandDisplay()` and their comments exactly as they are; they read `LOCALIZED_BRAND_NAMES` and keep working.

- [ ] **Step 3: Run the gate**

```bash
pnpm typecheck && pnpm lint && pnpm test:run
```

Expected: all PASS, including the characterization test's `brandDisplay('zh') === '聚星装修 (Reno Stars)'` assertion and the existing `tests/unit/components/ZhTrustSignals.test.tsx`, which asserts the same string independently.

- [ ] **Step 4: Verify the refactor is complete**

```bash
grep -rn "Record<Locale" --include='*.ts' --include='*.tsx' i18n/ lib/ components/ \
  | grep -v node_modules | grep -v '.claude/worktrees'
```

Expected: the remaining hits are the *derived* declarations (`localeNames`, `ogLocaleMap`, `LOCALE_TO_SUFFIX`, `GTX_LANG`, `LOCALE_FALLBACKS`, `LOCALIZED_BRAND_NAMES`, `LOCALE_TARGETS`) plus unrelated maps (`TIER_H1`, `COST_GUIDE_LINK_COPY`, `LOCALE_TO_DB_SUFFIX`, `lib/types.ts`). No hand-written per-locale attribute table should remain outside `LOCALE_META`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor(brand): move localized trade names into LOCALE_META

LOCALIZED_BRAND_NAMES derives from LOCALE_META.brandName; brandName() and
brandDisplay() are unchanged. Completes the consolidation — six per-locale
maps across five files are now one table.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: The `nativeSupport` field

First task of the feature. Behavior change starts here.

**Files:**
- Modify: `i18n/config.ts`
- Create: `tests/unit/i18n/native-support.test.ts`

**Interfaces:**
- Produces: `LocaleMeta.nativeSupport: boolean`; `hasNativeSupport(locale: Locale): boolean` exported from `@/i18n/config`. Tasks 8 and 10 consume both.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/i18n/native-support.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { locales, LOCALE_META, hasNativeSupport } from '@/i18n/config';

// nativeSupport is a STAFFING fact, not a translation-quality one. All 14
// locales are fully translated and all 14 are indexed — but Reno Stars staffs
// English, Mandarin and Cantonese only. Hiring is under way; when someone
// joins, their row flips here and the contact-page notice follows.

const SUPPORTED = ['en', 'zh', 'zh-Hant'];

describe('hasNativeSupport', () => {
  it('is true for exactly English, Simplified and Traditional Chinese', () => {
    const supported = locales.filter((loc) => LOCALE_META[loc].nativeSupport);
    expect([...supported].sort()).toEqual([...SUPPORTED].sort());
  });

  it('agrees with the field for all 14 locales', () => {
    for (const loc of locales) {
      expect(hasNativeSupport(loc)).toBe(SUPPORTED.includes(loc));
    }
  });

  it('leaves 11 locales needing the contact-page notice', () => {
    expect(locales.filter((loc) => !hasNativeSupport(loc))).toHaveLength(11);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
pnpm test:run tests/unit/i18n/native-support.test.ts
```

Expected: FAIL — `hasNativeSupport is not a function`.

- [ ] **Step 3: Add the field and the predicate**

In `i18n/config.ts`, add to `LocaleMeta`:

```ts
  /**
   * A Reno Stars team member communicates natively in this locale.
   *
   * A STAFFING fact, not a translation-quality one — every locale is fully
   * translated and, since 2026-08-07, every locale is indexed. A translated
   * page is not a person who can answer the phone, and customers have been
   * arriving through the minor locales expecting service in that language.
   *
   * `false` puts a plain notice on the contact page naming the languages the
   * team does cover. Hiring is under way: flip the field when someone joins and
   * the notice, the language list inside it, and the tests all follow.
   */
  nativeSupport: boolean;
```

Set `nativeSupport: true` on `en`, `zh` and `zh-Hant`; `false` on the other 11. zh-Hant is true because Mandarin and Cantonese are both spoken on the team and HK/TW readers — largely Cantonese — read Traditional.

Then, next to `isRtl`:

```ts
/** True when a team member communicates natively in this locale. */
export function hasNativeSupport(locale: Locale): boolean {
  return LOCALE_META[locale].nativeSupport;
}
```

- [ ] **Step 4: Run the gate**

```bash
pnpm test:run tests/unit/i18n/native-support.test.ts
pnpm typecheck && pnpm lint && pnpm test:run
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add i18n/config.ts tests/unit/i18n/native-support.test.ts
git commit -m "$(cat <<'EOF'
feat(i18n): add nativeSupport to LOCALE_META

Records which locales a team member actually speaks: en, zh, zh-Hant.
The other 11 are translated and indexed but unstaffed.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: `lib/i18n/language-names.ts`

**Files:**
- Create: `lib/i18n/language-names.ts`
- Create: `tests/unit/lib/language-names.test.ts`

**Interfaces:**
- Consumes: `locales`, `LOCALE_META`, `hasNativeSupport`, `Locale` from `@/i18n/config`.
- Produces: `nativeSupportLanguageList(readerLocale: Locale): string` and `localeSelfName(readerLocale: Locale): string`. Task 10 calls both.

**Why `Intl` rather than 14 hand-translated strings:** the list derives from the flag, so hiring a Korean speaker updates the sentence in all 14 locales with no translation work.

**Why not "Mandarin":** CLDR has no distinct name for `cmn` — it renders as "Chinese"/中文/chino everywhere, giving the awkward "Chinese and Cantonese". Deriving from the supported locales (with `zh → zh-Hans` so CLDR says "Simplified") reads correctly in all 14.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/language-names.test.ts`. Every expected string below was generated on Node v22.22.3 and verified:

```ts
import { describe, it, expect } from 'vitest';
import { locales, hasNativeSupport, type Locale } from '@/i18n/config';
import { nativeSupportLanguageList, localeSelfName } from '@/lib/i18n/language-names';

// Expected strings come from ICU/CLDR via Intl, not from us. Pinning them as
// literals means a Node or ICU upgrade that changes CLDR wording fails here
// loudly instead of silently changing what 11 locales read on the contact page.
const EXPECTED: Record<string, { self: string; list: string }> = {
  ja: { self: '日本語', list: '英語、簡体中国語、繁体中国語' },
  ko: { self: '한국어', list: '영어, 중국어(간체) 및 중국어(번체)' },
  es: { self: 'español', list: 'inglés, chino simplificado y chino tradicional' },
  pa: { self: 'ਪੰਜਾਬੀ', list: 'ਅੰਗਰੇਜ਼ੀ, ਚੀਨੀ (ਸਰਲ) ਅਤੇ ਚੀਨੀ (ਰਵਾਇਤੀ)' },
  tl: { self: 'Filipino', list: 'Ingles, Pinasimpleng Chinese, at Tradisyonal na Chinese' },
  fa: { self: 'فارسی', list: 'انگلیسی،‏ چینی ساده‌شده، و چینی سنتی' },
  vi: { self: 'Tiếng Việt', list: 'Tiếng Anh, Tiếng Trung (Giản thể) và Tiếng Trung (Phồn thể)' },
  ru: { self: 'русский', list: 'английский, китайский, упрощенное письмо и китайский, традиционное письмо' },
  ar: { self: 'العربية', list: 'الإنجليزية والصينية المبسطة والصينية التقليدية' },
  hi: { self: 'हिन्दी', list: 'अंग्रेज़ी, सरलीकृत चीनी, और पारंपरिक चीनी' },
  fr: { self: 'français', list: 'anglais, chinois simplifié et chinois traditionnel' },
};

const NEEDS_NOTICE = locales.filter((loc) => !hasNativeSupport(loc));

describe('localeSelfName', () => {
  it.each(NEEDS_NOTICE)('names %s in its own language', (loc) => {
    expect(localeSelfName(loc)).toBe(EXPECTED[loc].self);
  });

  it('never returns an empty string for any of the 14', () => {
    for (const loc of locales) expect(localeSelfName(loc).length).toBeGreaterThan(0);
  });
});

describe('nativeSupportLanguageList', () => {
  it.each(NEEDS_NOTICE)('lists the supported languages in %s', (loc) => {
    expect(nativeSupportLanguageList(loc)).toBe(EXPECTED[loc].list);
  });

  it('reads correctly in English', () => {
    expect(nativeSupportLanguageList('en'))
      .toBe('English, Simplified Chinese, and Traditional Chinese');
  });

  it('names three languages for every locale — one per supported locale', () => {
    const supportedCount = locales.filter(hasNativeSupport).length;
    expect(supportedCount).toBe(3);
    for (const loc of locales) {
      expect(nativeSupportLanguageList(loc).length).toBeGreaterThan(0);
    }
  });

  it('never leaks a raw BCP 47 tag into the prose', () => {
    for (const loc of locales) {
      const list = nativeSupportLanguageList(loc);
      expect(list).not.toContain('zh-Hans');
      expect(list).not.toContain('zh-Hant');
    }
  });
});

describe('ICU failure path', () => {
  it('falls back to endonyms instead of throwing when Intl.DisplayNames is unavailable', () => {
    const original = Intl.DisplayNames;
    // @ts-expect-error — deliberately breaking Intl to exercise the catch branch
    delete Intl.DisplayNames;
    try {
      expect(() => nativeSupportLanguageList('pa' as Locale)).not.toThrow();
      expect(nativeSupportLanguageList('pa' as Locale)).toBe('English, 简体中文, 繁體中文');
      expect(localeSelfName('pa' as Locale)).toBe('ਪੰਜਾਬੀ');
    } finally {
      Intl.DisplayNames = original;
    }
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
pnpm test:run tests/unit/lib/language-names.test.ts
```

Expected: FAIL — cannot resolve `@/lib/i18n/language-names`.

- [ ] **Step 3: Write the implementation**

Create `lib/i18n/language-names.ts`:

```ts
import { locales, LOCALE_META, hasNativeSupport, type Locale } from '@/i18n/config';

/**
 * Language names rendered in the READER's language, from CLDR via Intl —
 * never hand-translated. A Punjabi visitor sees Punjabi names; an Arabic
 * visitor gets Arabic names joined with و.
 *
 * Both functions derive their content from LOCALE_META.nativeSupport, so
 * hiring someone and flipping one boolean updates the sentence in all 14
 * locales with no translation work.
 */

/**
 * CLDR needs a script subtag to say "Simplified" — bare 'zh' renders as plain
 * "Chinese", which is indistinguishable from 'zh-Hant' in the same sentence.
 */
const DISPLAY_TAG: Partial<Record<Locale, string>> = { zh: 'zh-Hans' };

const displayTag = (loc: Locale): string => DISPLAY_TAG[loc] ?? loc;

/** Locales a team member speaks, in `locales` order. */
function supportedLocales(): Locale[] {
  return locales.filter(hasNativeSupport);
}

/**
 * The supported languages, named and joined in the reader's own language.
 * e.g. for a Punjabi reader: "ਅੰਗਰੇਜ਼ੀ, ਚੀਨੀ (ਸਰਲ) ਅਤੇ ਚੀਨੀ (ਰਵਾਇਤੀ)".
 *
 * Not "Mandarin and Cantonese": CLDR has no distinct name for `cmn`, so it
 * renders as plain "Chinese" in all 14 locales and pairs awkwardly with
 * "Cantonese". The audience for this list does not speak Chinese, so the
 * spoken-variety distinction is detail they cannot act on anyway.
 */
export function nativeSupportLanguageList(readerLocale: Locale): string {
  const supported = supportedLocales();
  try {
    const names = new Intl.DisplayNames([readerLocale], {
      type: 'language',
      languageDisplay: 'dialect',
    });
    const list = new Intl.ListFormat(readerLocale, {
      style: 'long',
      type: 'conjunction',
    });
    return list.format(
      supported.map((loc) => names.of(displayTag(loc)) ?? LOCALE_META[loc].name),
    );
  } catch {
    // An unusual runtime ICU build must not 500 the contact page.
    return supported.map((loc) => LOCALE_META[loc].name).join(', ');
  }
}

/** The reader's own language, named in their own language: 'pa' → 'ਪੰਜਾਬੀ'. */
export function localeSelfName(readerLocale: Locale): string {
  try {
    const names = new Intl.DisplayNames([readerLocale], { type: 'language' });
    return names.of(readerLocale) ?? LOCALE_META[readerLocale].name;
  } catch {
    return LOCALE_META[readerLocale].name;
  }
}
```

- [ ] **Step 4: Run the gate**

```bash
pnpm test:run tests/unit/lib/language-names.test.ts
pnpm typecheck && pnpm lint && pnpm test:run
```

Expected: all PASS.

If a CLDR literal mismatches, the local Node's ICU differs from v22.22.3. Do **not** loosen the assertion to `toContain`. Re-generate the true values and update `EXPECTED`, noting the Node version in a comment:

```bash
node -e "
const nonNative=['ja','ko','es','pa','tl','fa','vi','ru','ar','hi','fr'];
const supported=['en','zh-Hans','zh-Hant'];
for(const l of nonNative){
  const dn=new Intl.DisplayNames([l],{type:'language',languageDisplay:'dialect'});
  const plain=new Intl.DisplayNames([l],{type:'language'});
  const lf=new Intl.ListFormat(l,{style:'long',type:'conjunction'});
  console.log(JSON.stringify(l)+': { self: '+JSON.stringify(plain.of(l))+', list: '+JSON.stringify(lf.format(supported.map(s=>dn.of(s))))+' },');
}"
```

- [ ] **Step 5: Commit**

```bash
git add lib/i18n/language-names.ts tests/unit/lib/language-names.test.ts
git commit -m "$(cat <<'EOF'
feat(i18n): render supported-language names in the reader's language

nativeSupportLanguageList and localeSelfName use Intl.DisplayNames +
Intl.ListFormat, so the list derives from LOCALE_META.nativeSupport and
needs no hand-translated strings in any of the 14 message files. Falls
back to endonyms rather than throwing if ICU is unavailable.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: The message key in all 14 locales

**Files:**
- Modify: `messages/en/contact.json` and the other 13 `messages/<locale>/contact.json`

**Interfaces:**
- Produces: `contact.languageSupportNotice`, an ICU message taking exactly `{language}` and `{supported}`. Task 10 renders it.

`contact.json` already exists in all 14 locales, so there is no missing-namespace risk. But `message-parity.test.ts` fails unless all 14 carry the key, so all 14 land here together.

- [ ] **Step 1: Add the EN source string**

In `messages/en/contact.json`, inside the top-level `"contact"` object, after `"returnHome"`:

```json
"languageSupportNotice": "Native {language} communication is not currently supported. We do support {supported}. Thank you for your understanding.",
```

Exactly two ICU arguments, `{language}` and `{supported}`, both supplied by `lib/i18n/language-names.ts` — never hardcoded in a message file.

- [ ] **Step 2: Confirm parity fails before the backfill**

```bash
pnpm test:run tests/unit/i18n/message-parity.test.ts
```

Expected: FAIL — 13 locales are missing `contact.languageSupportNotice`. This confirms the guard works before you rely on it.

- [ ] **Step 3: Backfill the other 13**

```bash
node scripts/translate-locale-messages.mjs --dry-run --all
node scripts/translate-locale-messages.mjs --all
```

The script is key-level idempotent — existing translations are never re-translated or clobbered, so hand-corrected strings survive.

- [ ] **Step 4: Hand-check zh and zh-Hant, and verify the placeholders survived**

Machine translation is known to translate ICU *keywords and argument names*, not just prose (see the comment block in `message-icu.test.ts`). Confirm every locale kept both placeholders verbatim:

```bash
for f in messages/*/contact.json; do
  printf '%s: ' "$f"
  python3 -c "
import json,sys
s=json.load(open(sys.argv[1]))['contact'].get('languageSupportNotice','<MISSING>')
print(('OK  ' if '{language}' in s and '{supported}' in s else 'BAD ')+s)" "$f"
done
```

Every line must start with `OK`. Any `BAD` line means MT mangled a placeholder — fix that file by hand.

Then read `messages/zh/contact.json` and `messages/zh-Hant/contact.json` yourself. These two are shown to the locales that *do* have native support, so they will never actually render — but they must still be correct Chinese, and the brand rule applies: 聚星装修 / 聚星裝修, never a machine-translated brand.

- [ ] **Step 5: Run the gate**

```bash
pnpm test:run tests/unit/i18n/message-parity.test.ts tests/unit/i18n/message-icu.test.ts
pnpm typecheck && pnpm lint && pnpm test:run
```

Expected: all PASS. `message-icu` is what proves no locale's copy of the key lost or renamed an argument.

- [ ] **Step 6: Commit**

```bash
git add messages/
git commit -m "$(cat <<'EOF'
feat(i18n): add contact.languageSupportNotice to all 14 locales

One ICU key taking {language} and {supported}, both supplied at render
time from LOCALE_META. All 14 land together — message-parity fails
otherwise, and message-icu guards the placeholders against MT damage.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: The notice component, mounted on the contact page

**Files:**
- Create: `components/LanguageSupportNotice.tsx`
- Create: `tests/unit/components/LanguageSupportNotice.test.tsx`
- Modify: `components/pages/ContactPage.tsx` (import + mount around line 139)

**Interfaces:**
- Consumes: `hasNativeSupport` from `@/i18n/config`; `nativeSupportLanguageList`, `localeSelfName` from `@/lib/i18n/language-names`; `contact.languageSupportNotice` from Task 9; `CARD`, `TEXT_MID`, `neu` from `@/lib/theme`.
- Produces: `export default function LanguageSupportNotice({ locale, className }: { locale: Locale; className?: string })`.

**Locale is a prop, not `useLocale()`** — `tests/setup.ts` hard-mocks `useLocale: () => 'en'`, so a hook-read locale cannot be tested per-locale. This mirrors `WeChatContactCard` in `components/ZhTrustSignals.tsx`, the sibling it renders beside.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/components/LanguageSupportNotice.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import LanguageSupportNotice from '@/components/LanguageSupportNotice';
import { locales, hasNativeSupport } from '@/i18n/config';

// renderToStaticMarkup + a locale PROP, matching ZhTrustSignals.test.tsx:
// tests/setup.ts mocks useLocale() to always return 'en', so a component that
// read its own locale from the hook could not be tested per-locale at all.
//
// That same setup mocks useTranslations to the identity function (key => key),
// so the rendered text is the message KEY, not the formatted sentence. This
// file therefore asserts render-vs-null and the structural/RTL properties;
// the sentence's content is covered by language-names.test.ts and its ICU
// validity by message-icu.test.ts.

const SUPPORTED = locales.filter(hasNativeSupport);
const NEEDS_NOTICE = locales.filter((loc) => !hasNativeSupport(loc));

describe('LanguageSupportNotice', () => {
  it.each(SUPPORTED)('renders nothing for %s — the team speaks it', (loc) => {
    expect(renderToStaticMarkup(<LanguageSupportNotice locale={loc} />)).toBe('');
  });

  it.each(NEEDS_NOTICE)('renders the notice for %s', (loc) => {
    const html = renderToStaticMarkup(<LanguageSupportNotice locale={loc} />);
    expect(html).not.toBe('');
    expect(html).toContain('languageSupportNotice');
  });

  it('covers exactly 11 locales', () => {
    expect(NEEDS_NOTICE).toHaveLength(11);
  });

  it('uses borderInlineStart so the accent bar flips in RTL', () => {
    // fa and ar both see this notice and both render right-to-left. A
    // hardcoded borderLeft would put the bar on the wrong edge for them.
    const html = renderToStaticMarkup(<LanguageSupportNotice locale="fa" />);
    expect(html).toContain('border-inline-start');
    expect(html).not.toMatch(/border-left/);
  });

  it('passes through an extra className', () => {
    const html = renderToStaticMarkup(<LanguageSupportNotice locale="ko" className="mb-6" />);
    expect(html).toContain('mb-6');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
pnpm test:run tests/unit/components/LanguageSupportNotice.test.tsx
```

Expected: FAIL — cannot resolve `@/components/LanguageSupportNotice`.

- [ ] **Step 3: Write the component**

Create `components/LanguageSupportNotice.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { Languages } from 'lucide-react';
import { hasNativeSupport, type Locale } from '@/i18n/config';
import { localeSelfName, nativeSupportLanguageList } from '@/lib/i18n/language-names';
import { CARD, TEXT_MID, neu } from '@/lib/theme';

interface LanguageSupportNoticeProps {
  locale: Locale;
  className?: string;
}

/**
 * Tells a visitor, in their own language, that nobody on the team speaks it —
 * and which languages the team does cover. Renders nothing for en/zh/zh-Hant.
 *
 * Honesty before the form, not after: every locale is fully translated and
 * indexed, which reads as a promise of service in that language. This is the
 * correction, placed where the visitor is about to act on that assumption.
 *
 * `locale` is a prop rather than useLocale() to match WeChatContactCard next to
 * it, and because tests/setup.ts hard-mocks useLocale() to 'en'.
 *
 * Neutral TEXT_MID, not GOLD: gold is this design system's promotional accent
 * and this is not a promotion.
 */
export default function LanguageSupportNotice({
  locale,
  className = '',
}: LanguageSupportNoticeProps) {
  const t = useTranslations('contact');

  if (hasNativeSupport(locale)) return null;

  return (
    <div
      className={`rounded-xl p-5 mb-6 flex items-start gap-3 ${className}`}
      style={{
        boxShadow: neu(4),
        backgroundColor: CARD,
        // Logical property, not borderLeft — fa and ar render RTL.
        borderInlineStart: `4px solid ${TEXT_MID}`,
      }}
    >
      <Languages
        size={20}
        aria-hidden="true"
        style={{ color: TEXT_MID, flexShrink: 0, marginTop: '0.15rem' }}
      />
      <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>
        {t('languageSupportNotice', {
          language: localeSelfName(locale),
          supported: nativeSupportLanguageList(locale),
        })}
      </p>
    </div>
  );
}
```

`useTranslations` is called before the early return — React requires hooks to run unconditionally.

- [ ] **Step 4: Run the component test**

```bash
pnpm test:run tests/unit/components/LanguageSupportNotice.test.tsx
```

Expected: PASS.

If the `border-inline-start` assertion fails, React may have serialized the property differently. Inspect the actual markup (`console.log` the html in a scratch run) and match the real attribute — but never change it to `borderLeft`.

- [ ] **Step 5: Mount it on the contact page**

In `components/pages/ContactPage.tsx`, add to the imports:

```tsx
import LanguageSupportNotice from '@/components/LanguageSupportNotice';
```

Then inside the form card — after the `section.contactSubtitle3` paragraph and immediately before `<ContactForm`, currently at line 139:

```tsx
              <p className="text-base mb-6" style={{ color: TEXT_MID }}>
                {t('section.contactSubtitle3')}
              </p>
              <LanguageSupportNotice locale={locale} />
              <ContactForm
```

The card is `order-1` on mobile, so this lands in the first screen on a phone; being inside the card, it cannot drift away from the form at any breakpoint. `locale` is already in scope at line 36 (`const locale = useLocale() as Locale`).

- [ ] **Step 6: Run the full gate**

```bash
pnpm typecheck && pnpm lint && pnpm test:run
```

Expected: all PASS.

- [ ] **Step 7: Verify in the running app**

```bash
pnpm dev
```

Check all four:
1. `http://localhost:3000/pa/contact/` — notice renders above the form, in Punjabi, listing the three languages in Punjabi.
2. `http://localhost:3000/fa/contact/` — page is RTL and the accent bar is on the **right** edge.
3. `http://localhost:3000/en/contact/` — **no notice**.
4. `http://localhost:3000/zh/contact/` — **no notice**, and the WeChat card still renders.

Take a screenshot of `/pa/contact/` and `/fa/contact/` and confirm by eye rather than by assuming the render succeeded.

- [ ] **Step 8: Commit**

```bash
git add components/LanguageSupportNotice.tsx \
        tests/unit/components/LanguageSupportNotice.test.tsx \
        components/pages/ContactPage.tsx
git commit -m "$(cat <<'EOF'
feat(contact): tell visitors when we can't serve their language natively

Renders above the form for the 11 locales with nativeSupport: false,
naming their language and the three we do cover — both in their own
language, from CLDR. Nothing renders for en/zh/zh-Hant.

Accent bar uses borderInlineStart: fa and ar both see this notice and
both render RTL.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Final verification

- [ ] **Full gate from a clean build**

```bash
rm -rf .next/cache
pnpm typecheck && pnpm lint && pnpm test:run
```

- [ ] **Confirm the consolidation actually happened**

```bash
grep -c "nativeSupport\|dbSuffix\|shareTargets\|gtxLang" i18n/config.ts
git diff --stat main...HEAD
```

Expected: one table in `i18n/config.ts`; the diff touches `i18n/config.ts`, 4 `lib/` files, 4 admin components, `ContactPage.tsx`, 2 new `lib`/`components` files, 14 message files, and 4 test files.

- [ ] **Push and open a PR**

```bash
git push -u origin feat/locale-meta-ssot
```

Note in the PR body that `reno-stars.com` is **self-hosted** (launchd on :3000 + Cloudflare tunnel) — merging does **not** deploy. Deployment is a separate step.

---

## Notes for the implementer

- **`tl` self-names as "Filipino", not "Tagalog".** `localeNames.tl` is `'Tagalog'` but `Intl.DisplayNames(['tl']).of('tl')` returns `'Filipino'`. Both are defensible and the test pins the Intl value. Not a bug — do not "fix" it.
- **`es`, `ru`, `fr` self-name in lowercase** (`español`, `русский`, `français`). Correct: those languages don't capitalize language names mid-sentence, and the name appears mid-sentence here.
- **The Russian list is the clumsiest output** ("китайский, упрощенное письмо и китайский, традиционное письмо"). It is what CLDR gives and it is correct. Accepted in the spec.
- **Never run `pnpm test`** — it starts watch mode and hangs. Always `pnpm test:run`.
- **Never pipe test output through `head`/`tail`** — it orphans test children and produces phantom "flaky" failures.
- **If 3 fixes for the same failure fail, stop and reassess.** You are likely treating a symptom.
