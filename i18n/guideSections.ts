// Sections of the `guides` namespace, split into per-section files under
// messages/<locale>/guides/<section>.json. The runtime loader merges them
// into a single `guides` namespace at request time. Splitting keeps each
// file small (<10KB) so translation agents can handle one section at a
// time without stalling.
export const guideSections = [
  'index',
  'kitchenCost',
  'bathroomCost',
  'wholeHouseCost',
  'basementCost',
  'commercialCost',
  'cabinetCost',
  'basementSuiteCost',
  'relatedGuides',
] as const;

export type GuideSection = (typeof guideSections)[number];
