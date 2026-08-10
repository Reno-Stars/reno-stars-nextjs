# Locale SSOT Table + Native Language Support Notice — Design

**Date:** 2026-08-10
**Status:** Approved, ready for implementation plan
**Scope:** `i18n/config.ts` and the five modules that keep their own per-locale
maps; the contact page.

## Goal

Two things, in two commits.

**One:** collapse the six scattered `Record<Locale, X>` maps into a single
`LOCALE_META` table in `i18n/config.ts`. Today a locale's attributes live in
five files — its endonym and og code in `i18n/config.ts`, its DB field suffix in
`lib/admin/locale-keys.ts`, its Google Translate code in
`lib/admin/gtx-translate.ts`, its translation fallback chain in `lib/utils.ts`,
its share platforms in `lib/share/matrix.ts`, its brand name in
`lib/company-config.ts`. Adding a locale means finding all six. After this
change it means adding one row.

**Two:** add a `nativeSupport` field to that table, and show a plain notice on
the contact page for locales where it is `false`.

## Why the notice exists

All 14 locales are fully translated and, since 2026-08-07, all 14 are indexed
(see `INDEXABLE_LEAF_LOCALES`). A translated page is not a person who can answer
the phone. Customers are arriving through the non-English locales expecting
service in that language, and Reno Stars staffs English, Mandarin and Cantonese
only. The honest fix is to say so before they write their message, not after.

Hiring is under way. `nativeSupport` is the flag that gets flipped when someone
joins — one field, and the notice, the language list inside it, and the tests all
follow.

## Non-goals

- **No notice in the footer or on other pages.** It belongs at the moment of
  contact, not as a site-wide apology banner.
- **No notice on `/contact/thank-you`.** Considered and cut for scope.
- **No call to action in the notice.** Considered "write in your own language
  anyway, we'll reply in English" and rejected: it is a service commitment
  nobody has agreed to staff. The notice states the fact and thanks the reader.
- **No hiring promise in the notice.** "We're expanding soon" is a public
  commitment with no date behind it.
- **No language-switcher change.** The switcher lists locales the site is
  *translated* into, which is still all 14. Native support is a different fact.
- **No new locales, and no locale removed.**

---

# Commit 1 — `refactor(i18n): single LOCALE_META table`

Zero behavior change. Every existing export keeps its name and its value.

## The table

`locales` stays exactly as it is. It defines **order** — `en` first, and the
sequence the language switcher renders in — and keying the table off it makes
the table exhaustiveness-checked by the compiler: a 15th locale will not compile
until every field is answered for it.

```ts
export const locales = ['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa',
                        'tl', 'fa', 'vi', 'ru', 'ar', 'hi', 'fr'] as const;
export type Locale = (typeof locales)[number];

export interface LocaleMeta {
  /** Endonym, as shown in the language switcher. */
  name: string;
  /** og:locale — BCP 47 with region. */
  ogLocale: string;
  /** Writing direction. Drives <html dir> and logical CSS properties. */
  dir: 'ltr' | 'rtl';
  /** Leaf pages (project/site, video, service×city) may be indexed.
   *  A CONTENT decision — see the note on INDEXABLE_LEAF_LOCALES below. */
  indexableLeaf: boolean;
  /** Prerendered at build time. All false: the site is force-dynamic SSR. */
  prerender: boolean;
  /** A Reno Stars team member communicates natively. A STAFFING fact. */
  nativeSupport: boolean;          // ← added in commit 2
  /** camelCase suffix for per-locale fields: 'ZhHant' → titleZhHant. */
  dbSuffix: string;
  /** Has dedicated *_en / *_zh DB columns rather than living in the
   *  `localizations` jsonb. */
  dbColumn: boolean;
  /** Google Translate gtx code. Google wants zh-CN / zh-TW. */
  gtxLang: string;
  /** Translation fallback chain, tried before falling back to en.
   *  Omitted means straight to en. */
  fallback?: readonly Locale[];
  /** Share platforms this audience sees, in render order. */
  shareTargets: readonly PlatformId[];
  /** Owner-confirmed localized trade name. Omitted means the English brand. */
  brandName?: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = { /* 14 rows */ };
```

`PlatformId` is a **type-only** import from `@/lib/share/types`. Verified safe:
`lib/share/types.ts` imports nothing but `react` types, so there is no import
cycle, and a type-only import is erased at compile time — `i18n/config.ts` gains
no runtime dependency. `matrix.ts` and `resolve.ts` are today the only files in
`lib/share/` importing `Locale`, and `matrix.ts` stops needing it.

Brand needs no import at all. The table carries `brandName`, while `brandName()`
and `brandDisplay()` stay in `lib/company-config.ts`, which already imports from
`i18n/config`.

## Derived exports — the reason this is a small diff

Every name in use today survives, now computed from the table:

| Export | Home | Consumers | Becomes |
|---|---|---|---|
| `localeNames` | i18n/config.ts | 7 files | derived from `.name` |
| `ogLocaleMap` | i18n/config.ts | 38 files | derived from `.ogLocale` |
| `rtlLocales` / `isRtl` | i18n/config.ts | 1 / 3 files | derived from `.dir` |
| `INDEXABLE_LEAF_LOCALES` / `isIndexableLeafLocale` | i18n/config.ts | 5 / 4 files | derived from `.indexableLeaf` |
| `PRERENDERED_LOCALES` | i18n/config.ts | 1 file | derived from `.prerender` |
| `LOCALE_TO_SUFFIX` / `localeSuffix` / `fieldKey` | lib/admin/locale-keys.ts | 2 / 1 / 5 files | derived from `.dbSuffix` |
| `isNativeLocale` → `hasDedicatedColumn` | lib/admin/locale-keys.ts | 6 files | derived from `.dbColumn` |
| `GTX_LANG` | lib/admin/gtx-translate.ts | 1 file (private) | derived from `.gtxLang` |
| `LOCALE_FALLBACKS` | lib/utils.ts | 1 file (private) | derived from `.fallback` |
| `LOCALE_TO_DB_SUFFIX` | lib/utils.ts | 5 files | still derived; its `isNativeLocale` call picks up the rename |
| `LOCALE_TARGETS` | lib/share/matrix.ts | 3 files | derived from `.shareTargets` |
| `LOCALIZED_BRAND_NAMES` / `brandName()` / `brandDisplay()` | lib/company-config.ts | 3 files | derived from `.brandName` |

Five files are re-pointed. `ogLocaleMap`'s 38 consumers, `fieldKey`'s 5 and
`LOCALE_TARGETS`' 3 do not change at all.

This extends a habit the codebase already has rather than introducing one:
`LOCALE_TO_DB_SUFFIX` at `lib/utils.ts:105` is already derived from
`LOCALE_TO_SUFFIX`, with a comment reading "so the two maps can't drift."

## The rename

`isNativeLocale` → `hasDedicatedColumn`, across 6 files
(`components/admin/LocalizedInput.tsx`, `LocalizedTextarea.tsx`,
`LocalizedFormContext.tsx`, `TranslateAllButton.tsx`, `lib/utils.ts`,
`lib/admin/locale-keys.ts`).

It currently means "has an `*_en`/`*_zh` DB column." Once `nativeSupport` exists
one import away and means "a human speaks it," two unrelated senses of *native*
sit side by side in the same files. Mechanical rename, no behavior change.

## Comments move with the data

The per-row editorial rationale in `matrix.ts` — the Philippines/Facebook note,
the mainland-vs-HK/TW split, the KakaoTalk explanation — moves into the table
rows. Same for the `INDEXABLE_LEAF_LOCALES` doc block, which records *why* the
gate exists (the 2026-07-07 GSC "Crawled - currently not indexed" finding) and
the rule that adding a locale is a content decision gated on
`locale_readiness.py`. That text is the most valuable thing in the file and must
not be lost in the move.

**Known cost:** `i18n/config.ts` grows from ~140 to ~280 lines and each row
becomes a multi-line block. It stops being readable in one screen. Accepted —
still well inside the 800-line limit, and the alternative is the scatter this
change exists to remove.

## How zero-behavior-change is proven

A **characterization test written first**, before any refactoring:
`tests/unit/i18n/locale-meta-characterization.test.ts`.

It pins the current value of every derived export as literal expected data —
all 14 `ogLocale`s, all 14 `dbSuffix`es, all 14 share-target arrays in order,
both brand names, the one fallback chain, the two RTL locales. Literals, not a
generated snapshot: a snapshot regenerated mid-refactor proves nothing.

Sequence: write it, run it green against today's code, then refactor, then run
it green again. That is what makes a 12-field consolidation across 6 files a
mechanical change rather than a leap of faith.

## Risk

`INDEXABLE_LEAF_LOCALES` is currently `as const satisfies readonly Locale[]` — a
literal tuple type. Derived, it becomes `Locale[]`. Its 5 consumers appear to
use `.includes()`, for which this is inert, but **each of the 5 gets read during
implementation** rather than assumed. Same check for `PRERENDERED_LOCALES`,
which feeds `generateStaticParams`.

## Gate

`pnpm typecheck && pnpm lint && pnpm test:run`, plus the characterization test
green. No behavior change means no visual check is needed for this commit.

---

# Commit 2 — `feat(contact): language support notice`

## Data

`nativeSupport: true` for `en`, `zh`, `zh-Hant`; `false` for the other 11.

`zh-Hant` is `true`: Mandarin and Cantonese are both spoken on the team, and
HK/TW readers — largely Cantonese — read Traditional.

## Language names — `lib/i18n/language-names.ts` (new, ~40 lines)

Two functions, both driven by `Intl`, so no hand-translated language names in
any message file:

- `nativeSupportLanguageList(readerLocale)` — takes
  `locales.filter((l) => LOCALE_META[l].nativeSupport)`, maps `zh → 'zh-Hans'`
  for display, then `Intl.DisplayNames(readerLocale, { type: 'language',
  languageDisplay: 'dialect' })` and `Intl.ListFormat` for the reader's own
  conjunction and comma glyphs (Arabic uses و, Chinese uses 、).
- `localeSelfName(readerLocale)` — the reader's own language in their own
  language: `ਪੰਜਾਬੀ`, `فارسی`, `Tiếng Việt`.

Deriving the list from the flag means hiring a Korean speaker updates the
sentence in all 14 locales automatically.

Both wrap in try/catch and fall back to the `LOCALE_META` endonyms, so an
unusual runtime ICU build degrades instead of throwing on the contact page.

Verified output on Node v22.22.3:

| Reader | `nativeSupportLanguageList` |
|---|---|
| en | English, Simplified Chinese, and Traditional Chinese |
| es | inglés, chino simplificado y chino tradicional |
| pa | ਅੰਗਰੇਜ਼ੀ, ਚੀਨੀ (ਸਰਲ) ਅਤੇ ਚੀਨੀ (ਰਵਾਇਤੀ) |
| fa | انگلیسی، چینی ساده‌شده، و چینی سنتی |
| ru | английский, китайский, упрощенное письмо и китайский, традиционное письмо |

**Why not "Mandarin and Cantonese":** CLDR has no distinct name for `cmn` — it
renders as "Chinese" / 中文 / chino in all 14 locales, producing the awkward
pairing "Chinese and Cantonese". Deriving from the supported *locales* instead
reads correctly everywhere and keeps one source of truth. The audience for this
notice does not speak Chinese, so the Mandarin/Cantonese distinction is detail
they cannot act on. Russian is the clumsiest output but is correct.

## Copy — one key × 14 files

In `messages/<locale>/contact.json`, under `contact`:

```json
"languageSupportNotice": "Native {language} communication is not currently supported. We do support {supported}. Thank you for your understanding."
```

`contact.json` already exists in all 14 locales, so there is no
missing-namespace risk (a missing namespace file 500s the entire locale, not
just the page). But `tests/unit/i18n/message-parity.test.ts` fails unless all 14
carry the key, so all 14 land in the same commit via
`scripts/translate-locale-messages.mjs`, with zh and zh-Hant hand-checked.

Both ICU arguments are supplied by `language-names.ts`, never by the message
file.

## Component — `components/LanguageSupportNotice.tsx` (new)

Client component. Reads `useLocale()`, returns `null` when the locale's
`nativeSupport` is `true` — so 3 of 14 locales render nothing.

**Placement:** inside the form card in `components/pages/ContactPage.tsx`,
between the `section.contactSubtitle3` paragraph and `<ContactForm>` (currently
line 139). That card is `order-1` on mobile, so the notice is in the first
screen on a phone, and being inside the card it cannot drift away from the form
at any breakpoint.

**Styling:** follows the existing "Free Consultation Callout" pattern directly
above it — `rounded-xl p-5`, `boxShadow: neu(4)`, `backgroundColor: CARD`, left
accent bar — but in neutral `TEXT_MID`, not `GOLD`. Gold is the promotional
accent in this design system and this is not a promotion. One `Languages` icon
from lucide.

**RTL:** the accent bar uses `borderInlineStart`, not `borderLeft`. Both `fa`
and `ar` see this notice and both render right-to-left; a hardcoded `borderLeft`
would put the bar on the wrong edge for 2 of the 11 locales that display it.

## Tests

- `nativeSupport` across all 14 locales — 3 true, 11 false.
- `language-names`: all 14 rendered lists pinned as literals. Catches a Node or
  ICU upgrade silently changing CLDR wording.
- `language-names`: the ICU-failure path falls back to endonyms rather than
  throwing.
- Component: renders `null` for en/zh/zh-Hant; renders with both substitutions
  filled for the other 11.
- `message-parity` already covers the new key across all 14 files.

## Gate

`pnpm typecheck && pnpm lint && pnpm test:run`, then eyeball the rendered notice
on at least `/pa/contact/` and one RTL locale (`/fa/contact/` or `/ar/contact/`)
to confirm the accent bar sits on the correct edge and the list reads correctly.

---

## Open questions

None.
