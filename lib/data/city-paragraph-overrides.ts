/**
 * City-specific paragraphs for the featured-project card on the EN
 * /services/{service}/{city} pages (`components/FeaturedCityProject.tsx`).
 *
 * The card's short intro is the featured project's own DB `description`, which
 * is shared by every locale and by the project page itself — there is no
 * per-page, per-locale field for it. This table supplies an approved,
 * city-written paragraph for exactly the pages keyed below and nothing else:
 * the lookup requires `locale === 'en'`, so the zh / zh-Hant siblings of these
 * pages keep the DB description, as does every other service×city page.
 *
 * Each value is the paragraph text supplied in the 2026-11-12 P3 instruction
 * (Mark), copied verbatim — do not edit, translate or add facts here. It ends
 * with one markdown link `[title](url)` to the project the card already links
 * to; the card is a single anchor, so the component renders that link as the
 * project title inside the card rather than nesting a second `<a>`.
 *
 * Only the five pages whose LIVE featured project is the same case the
 * paragraph describes are listed. The four drafted pages whose featured
 * project differs (kitchen/coquitlam, basement/north-vancouver,
 * bathroom/burnaby, bathroom/vancouver) are deliberately absent until the
 * featured-project choice is settled — a paragraph about one project next to a
 * card for another would misstate the work.
 *
 * Owner approval: Ryan, 2026-11-13 (via Captain). Test-A control pages
 * (kitchen/delta, kitchen/north-vancouver, basement/burnaby,
 * basement/port-moody, cabinet/port-moody, bathroom/white-rock,
 * critical-load-panel/langley) must never gain an entry while the test runs.
 * Cover: `tests/unit/components/FeaturedCityProject.overrides.test.tsx`.
 */
export const CITY_PARAGRAPH_OVERRIDES: Readonly<Record<string, string>> = {
  'en/services/kitchen/richmond':
    "After we completed their daughter's bathroom, this Richmond family asked us back to renovate the kitchen in their townhouse. They lived in the home during construction, so the work was planned around a compressed 2–3 week schedule that still covered the full scope. We installed full white shaker cabinets and, at the homeowners' request, left the space above the upper cabinets open rather than closing it with bulkheads, so the ceiling line stays open. The original U-shape peninsula was kept in place but rebuilt with full-height white quartz waterfall panels and new full-depth drawers. A beige stone backsplash runs through to the range wall, with under-cabinet LED lighting and recessed lights in place of the single ceiling fixture. New LVP flooring replaced the orange cork, and we fitted a new sink and faucet. See the project: [Returning Customer Kitchen Renovation in Richmond — White Shaker + Quartz](https://www.reno-stars.com/en/projects/returning-customer-kitchen-renovation-richmond-white-shaker/).",
  'en/services/basement/langley':
    "We do not yet have a published basement project in Langley, so this section features a recent kitchen we completed in the same city. This Langley townhouse kitchen was rebuilt around a waterfall quartz island as the centrepiece. The family wanted a bright, open feel that worked with their eclectic decor, so we used a cohesive palette of soft whites and natural wood tones. Custom shaker-style cabinets maximize storage, and pendant lighting over the island sets up the space for cooking and entertaining. The waterfall edge on the island is the main visual detail and, as the project page describes it, adds a touch of luxury that elevates the room. Scope also included demolition, countertop installation, plumbing, electrical, flooring, painting, and lighting, completed over 4–6 weeks. See the project: [Kitchen Renovation with Waterfall Island Design](https://www.reno-stars.com/en/projects/langley-kitchen-renovation-waterfall-island-design/).",
  'en/services/cabinet/delta':
    "This is not a cabinet refinishing or refacing job. It is a recent kitchen and bathroom renovation in a Delta house, and it is the closest published local project we can show while a dedicated cabinet-refinishing case is still outstanding. Over 4–5 weeks we installed white shaker cabinets and a quartz countertop in the kitchen, with white tile on the walls. The bathroom work included replacing the bathtub and shower faucets, waterproofing the bathtub walls, and tiling around the windows. The project page describes a complete overhaul of the kitchen, aimed at a modern, functional space, and a fresh, inviting finish once the bathroom tile and fixtures were in place. See the project: [Kitchen and Bathroom Renovation with White Shaker Cabinets in Delta](https://www.reno-stars.com/en/projects/delta-kitchen-bathroom-renovation-white-shaker-cabinets/).",
  'en/services/bathroom/richmond':
    "This Richmond townhouse project renovated two bathrooms in 3–4 weeks, with a shared grey tile palette and matte black fixtures so the two rooms feel related but not identical. The first bathroom went from a dated bathtub layout to a walk-in shower with large-format grey porcelain tile, a frameless glass door, and matte black fixtures. The second bathroom kept its bathtub for family use and received new tile surrounds, a modern vanity with a quartz countertop, and updated plumbing fixtures in the same matte black finish. Both rooms received custom-finished bases, recessed LED lighting, improved ventilation, and new waterproofing behind the tile. The grey tile was chosen, as the project page explains, to keep visual continuity between the two bathrooms while still giving each room its own character. See the project: [Two Bathroom Renovation with Modern Finishes](https://www.reno-stars.com/en/projects/two-bathroom-renovation-richmond/).",
  'en/services/bathroom/surrey':
    "This project renovated two bathrooms in a Surrey house over 5–7 weeks, with each room tailored to a different family use, as described on the project page. The first became a four-piece bathroom with floor-to-ceiling white tile, gold fixtures including a rain showerhead and towel bars, and a freestanding soaker tub. The second received a frameless glass shower enclosure, a floating vanity with a custom quartz countertop, and a coordinating neutral tile scheme. Both bathrooms received new waterproofing, updated plumbing, and energy-efficient LED lighting so the two rooms read as one modern finish package. The published scope lists tile work, vanity installation, shower and tub work, plumbing, and lighting. The Location field on the project page is Surrey, and the space type is a house. See the project: [Two Bathroom Renovation with Modern Style](https://www.reno-stars.com/en/projects/two-bathroom-renovation-modern-style-surrey/).",
};

/**
 * The approved paragraph for one page, or `undefined` when the page has none.
 * EN only by construction — a zh / zh-Hant page can never match a key.
 */
export function getCityParagraphOverride(
  locale?: string,
  serviceSlug?: string,
  citySlug?: string,
): string | undefined {
  if (locale !== 'en' || !serviceSlug || !citySlug) return undefined;
  return CITY_PARAGRAPH_OVERRIDES[`${locale}/services/${serviceSlug}/${citySlug}`];
}

export interface TextSegment {
  text: string;
  /** Present on the segments that were `[text](href)` in the source. */
  href?: string;
}

/** Splits plain text with markdown links into verbatim text + link segments. */
export function splitMarkdownLinks(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) segments.push({ text: text.slice(last, m.index) });
    segments.push({ text: m[1], href: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}
