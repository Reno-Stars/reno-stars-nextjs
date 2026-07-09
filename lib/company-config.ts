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
