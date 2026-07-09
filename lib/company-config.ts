import type { Locale } from '@/i18n/config';

/**
 * Hardcoded company stats — no longer stored in the database.
 * Edit these values directly when they change.
 *
 * Display strings for warranty / liabilityCoverage come from
 * translation files (messages/en.json & zh.json) under "stats.*".
 * WCB (WorkSafeBC) coverage is handled via translations, not a config value.
 */
export const COMPANY_STATS = {
  /** When the team started in renovation — drives the "20+ years experience" stat. */
  foundingYear: 2007,
  /** When the legal entity Reno Stars Construction Inc. was incorporated.
   *  Used for schema.org Organization.foundingDate (which means corporate
   *  founding, not aggregate team experience). Keeps schema honest while
   *  the marketing "years experience" still reflects team-level expertise. */
  companyFoundingYear: 2020,
  teamSize: 17,
  projectsCompleted: "700+",
  /** Up to N-year workmanship warranty ("up to 3 years workmanship warranty") */
  warrantyYears: 3,
  /** Dollar amount with "Up to" qualifier — full label comes from translations */
  liabilityCoverage: "$5M",
} as const;

/** The brand, SSOT — lib/utils re-exports this as SITE_NAME. */
export const BRAND = 'Reno Stars';

/**
 * Owner-confirmed localized trade names, keyed by locale. The brand is NEVER
 * machine-translated: locales not listed here render the English brand as-is.
 * (zh/zh-Hant = 聚星装修/聚星裝修, confirmed by Hongming 2026-07-09.)
 */
export const LOCALIZED_BRAND_NAMES: Partial<Record<Locale, string>> = {
  zh: '聚星装修',
  'zh-Hant': '聚星裝修',
};

/** Brand display name for a locale — falls back to the English brand. */
export function brandName(locale: Locale): string {
  return LOCALIZED_BRAND_NAMES[locale] ?? BRAND;
}

/**
 * Brand-variant capture for schema.org alternateName — Google reconciles
 * user queries for the singular "Reno Star", concatenated "RenoStars",
 * lowercase "renostars", and the localized trade names with this entity.
 * (GSC 2026-05-04: "reno star" ranked pos 7 with 99 imp — should be pos 1.)
 * Single source for LocalBusinessSchema + WebSiteSchema. Dedupe guards
 * against a locale entry that equals the English brand.
 */
export const BRAND_ALTERNATE_NAMES = [
  ...new Set([BRAND, 'Reno Star', 'RenoStars', 'Renostars', ...Object.values(LOCALIZED_BRAND_NAMES)]),
];

/**
 * Business opening hours — MUST match the Google Business Profile exactly
 * (Google cross-checks schema hours against GBP for local-pack trust).
 * GBP as of 2026-07: Mon–Sat 9:30–21:00, Sun 11:00–19:00.
 * Consumed by LocalBusinessSchema + LocalBusinessAreaSchema.
 */
export const OPENING_HOURS = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:30',
    closes: '21:00',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Sunday'],
    opens: '11:00',
    closes: '19:00',
  },
] as const;

/** Years of experience rounded up to nearest 5 for cleaner display */
export function getYearsExperience(): string {
  const rawYears = new Date().getFullYear() - COMPANY_STATS.foundingYear;
  return String(Math.ceil(rawYears / 5) * 5);
}
