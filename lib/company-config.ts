/**
 * Hardcoded company stats — no longer stored in the database.
 * Edit these values directly when they change.
 *
 * Display strings for warranty / liabilityCoverage come from
 * translation files (messages/en.json & zh.json) under "stats.*".
 * WCB (WorkSafeBC) coverage is handled via translations, not a config value.
 */
export const COMPANY_STATS = {
  foundingYear: 2007,
  teamSize: 17,
  projectsCompleted: "700+",
  /** Dollar amount with "Up to" qualifier — full label comes from translations */
  liabilityCoverage: "$5M",
} as const;

/** Years of experience rounded up to nearest 5 for cleaner display */
export function getYearsExperience(): string {
  const rawYears = new Date().getFullYear() - COMPANY_STATS.foundingYear;
  return String(Math.ceil(rawYears / 5) * 5);
}
