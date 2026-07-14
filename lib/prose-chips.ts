/**
 * Prose "chip group" transform for service-area / combo body content.
 *
 * Area content authors write inline pipe-delimited link lists such as:
 *
 *   Related cost guides: [Kitchen renovation costs](/en/guides/…) |
 *   [Bathroom renovation costs](/…) | [Basement renovation costs](/…)
 *
 * `marked` renders the literal `|` between blue links, producing a dense,
 * unstyled pipe-separated blob (the owner's "link-soup" complaint). This
 * transform runs on the ALREADY-SANITIZED HTML — so the injected `class`
 * hooks survive sanitize-html, which strips `class` — and rewrites any
 * paragraph shaped exactly like `LABEL: <a>…</a> | <a>…</a> | …` (a text label
 * ending in a colon, then 2+ links joined by " | " and nothing else) into a
 * labelled row of neumorphic pills.
 *
 * The link `<a>` tags — and therefore their hrefs — are preserved verbatim;
 * only a `class="rs-chip"` hook is added and the wrapping `<p>` is replaced by
 * a `.rs-chip-group.not-prose` container. `not-prose` opts the group out of
 * Tailwind Typography so the `.rs-chip*` rules in `app/globals.css` (colours
 * mirror lib/theme.ts: CARD pill, NAVY text, GOLD hover, neu() shadow) fully
 * own the look.
 *
 * Anything that does NOT match the pattern is returned untouched: normal
 * paragraphs, headings, lists, a paragraph with a single link, and a labelled
 * line that has trailing prose after the links.
 */

// A single anchor tag, e.g. `<a href="…">text</a>`. Tolerant of any attributes
// and of inline emphasis inside the link text; the tempered `(?!</a>)` token
// stops at the first closing tag so adjacent anchors are matched individually.
const ANCHOR_SRC = '<a\\b[^>]*>(?:(?!</a>)[\\s\\S])*</a>';

// The links portion must be EXACTLY 2+ anchors joined by " | " (optional
// surrounding whitespace) and nothing else. The `(?:…)+` guarantees a second
// link, so a single-link paragraph fails and is left inline.
const LINK_LIST_RE = new RegExp(`^(?:${ANCHOR_SRC})(?:\\s*\\|\\s*(?:${ANCHOR_SRC}))+\\s*$`);

// A label is plain text (optionally wrapped in ONE emphasis tag) ending in a
// colon — nothing else may precede the first link.
const LABEL_RE = /^\s*(?:<(?:strong|em|b|i)>)?\s*([^<>]*?:)\s*(?:<\/(?:strong|em|b|i)>)?\s*$/;

const ANCHOR_GLOBAL_RE = new RegExp(ANCHOR_SRC, 'gi');
const PARAGRAPH_RE = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;

function buildChipGroup(inner: string): string | null {
  const firstAnchor = inner.search(/<a\b/i);
  if (firstAnchor < 0) return null;

  const labelMatch = inner.slice(0, firstAnchor).match(LABEL_RE);
  if (!labelMatch) return null;
  const label = labelMatch[1].trim();
  if (!label) return null;

  const linksPart = inner.slice(firstAnchor);
  if (!LINK_LIST_RE.test(linksPart)) return null;

  const anchors = linksPart.match(ANCHOR_GLOBAL_RE);
  if (!anchors || anchors.length < 2) return null;

  const chips = anchors
    .map((anchor) => anchor.replace(/^<a\b/i, '<a class="rs-chip"'))
    .join('');

  return (
    '<div class="rs-chip-group not-prose">' +
    `<span class="rs-chip-group-label">${label}</span>` +
    `<div class="rs-chip-row">${chips}</div>` +
    '</div>'
  );
}

/**
 * Convert qualifying "LABEL: link | link | …" paragraphs in a sanitized HTML
 * string into styled chip groups. Idempotent for non-matching input.
 */
export function renderProseChips(html: string): string {
  return html.replace(PARAGRAPH_RE, (full, inner: string) => buildChipGroup(inner) ?? full);
}
