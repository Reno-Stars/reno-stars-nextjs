/**
 * Pure decision logic for the area-FAQ seed guard in
 * `scripts/seed-area-content.ts`, split into its own side-effect-free module
 * so it can be unit tested without a DATABASE_URL — the script itself opens
 * a Neon connection at module load and can't be imported directly in tests.
 *
 * `faqs` is one FLAT list mixing every area, so a per-iteration `continue`
 * only skips a single FAQ, not "the rest of this area". This decides, for
 * the whole pass, which entries are skipped: every FAQ belonging to an
 * already-seeded area (any displayOrder), not only the first one seen with
 * displayOrder === 0. `hasExistingFaqs` is expected to be memoized by the
 * caller (one DB check per area, not per FAQ) so a row this same run just
 * inserted is never mistaken for pre-existing seed data.
 */
export function selectFaqsToInsert<T extends { areaSlug: string }>(
  faqs: T[],
  slugToId: Map<string, string>,
  hasExistingFaqs: (areaId: string) => boolean,
): T[] {
  return faqs.filter((faq) => {
    const areaId = slugToId.get(faq.areaSlug);
    if (!areaId) return false;
    return !hasExistingFaqs(areaId);
  });
}
