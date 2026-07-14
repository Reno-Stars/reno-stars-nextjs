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
// colon — nothing else may precede the first link. Group 1 captures the
// emphasis tag name (if any) so a bolded/italic label keeps its emphasis;
// group 2 captures the label text.
const LABEL_RE = /^\s*(?:<(strong|em|b|i)>)?\s*([^<>]*?:)\s*(?:<\/(?:strong|em|b|i)>)?\s*$/;

const ANCHOR_GLOBAL_RE = new RegExp(ANCHOR_SRC, 'gi');
const PARAGRAPH_RE = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;

// Upper bounds guarding LINK_LIST_RE (a tempered-greedy pattern inside a `+`
// quantifier) from pathological backtracking. Real chip lists are a handful of
// links; anything larger is left inline instead of fed to the vulnerable regex.
const MAX_LINKS_PART_LEN = 4000;
const MAX_CHIP_ANCHORS = 20;

// Add the `rs-chip` hook to an anchor's opening tag. If the tag already carries
// a `class` attribute, `rs-chip` is MERGED into it (avoids emitting a second,
// invalid `class=` attribute); otherwise a fresh `class="rs-chip"` is injected.
function addChipClass(anchor: string): string {
  const closeIdx = anchor.indexOf('>');
  const openTag = closeIdx >= 0 ? anchor.slice(0, closeIdx + 1) : anchor;
  const rest = closeIdx >= 0 ? anchor.slice(closeIdx + 1) : '';
  if (/\sclass\s*=\s*["']/i.test(openTag)) {
    return openTag.replace(
      /(\sclass\s*=\s*["'])([^"']*)(["'])/i,
      (_m, pre: string, val: string, quote: string) => `${pre}${val.trim()} rs-chip${quote}`,
    ) + rest;
  }
  return openTag.replace(/^<a\b/i, '<a class="rs-chip"') + rest;
}

function buildChipGroup(inner: string): string | null {
  const firstAnchor = inner.search(/<a\b/i);
  if (firstAnchor < 0) return null;

  const labelMatch = inner.slice(0, firstAnchor).match(LABEL_RE);
  if (!labelMatch) return null;
  const labelText = labelMatch[2].trim();
  if (!labelText) return null;
  // Preserve the label's emphasis wrapper (<strong>/<em>/<b>/<i>) when present.
  const emphasis = labelMatch[1];
  const label = emphasis ? `<${emphasis}>${labelText}</${emphasis}>` : labelText;

  const linksPart = inner.slice(firstAnchor);
  // Cheap ReDoS guards before the tempered-greedy LINK_LIST_RE — bail to inline
  // for anything past a sane length or anchor count.
  if (linksPart.length > MAX_LINKS_PART_LEN) return null;
  if ((linksPart.match(/<a\b/gi) || []).length > MAX_CHIP_ANCHORS) return null;
  if (!LINK_LIST_RE.test(linksPart)) return null;

  const anchors = linksPart.match(ANCHOR_GLOBAL_RE);
  if (!anchors || anchors.length < 2) return null;

  const chips = anchors.map(addChipClass).join('');

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

/**
 * Tailwind Typography classes shared by the area-content (`AreaPage`) and
 * combo-slice (`ServiceLocationPage`) prose blocks that host chip groups.
 * Extracted so the long modifier string lives in one place; each page appends
 * its own size/heading-spacing tweaks (e.g. `prose-base` vs `prose-lg`). The
 * class names are literal here so Tailwind's source scanner still sees them.
 */
export const PROSE_CHIP_CONTENT_CLASSES =
  'prose max-w-none prose-headings:text-[#1B365D] prose-h2:text-2xl prose-h3:text-xl prose-h3:mt-6 prose-p:leading-relaxed prose-li:my-1 prose-a:text-[#C8922A] prose-a:font-medium prose-a:underline prose-a:decoration-1 prose-a:underline-offset-2 prose-strong:text-[#1B365D]';
