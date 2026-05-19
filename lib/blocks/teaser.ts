/**
 * Pull a card-sized teaser string out of a project's dynamic_blocks.
 *
 * Strategy:
 *   1. Find the first `paragraph` block — if present, use it (capped).
 *   2. Otherwise fall back to the first `callout` block (callouts are
 *      naturally tight, also great teaser fodder).
 *   3. Otherwise return undefined; caller falls back to project.description.
 *
 * Caps the teaser at MAX_TEASER_CHARS so a long paragraph doesn't blow
 * out card layout. Trims trailing whitespace, then appends "…" if the
 * source was truncated.
 *
 * Caller picks the locale: extractTeaser(project.dynamic_blocks, "en").
 */

import type { Block, LocalizedString } from './types';

const MAX_TEASER_CHARS = 180;

function pickLocale(block: LocalizedString, locale: string): string {
  if (locale === 'zh' || locale === 'zh-CN') return (block.zh || block.en || '').trim();
  const override = block.translations?.[locale];
  if (override) return override.trim();
  return (block.en || '').trim();
}

function cap(text: string): string {
  if (text.length <= MAX_TEASER_CHARS) return text;
  // Try to break on a word boundary in the last 30 chars
  const slice = text.slice(0, MAX_TEASER_CHARS);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > MAX_TEASER_CHARS - 30 ? lastSpace : MAX_TEASER_CHARS;
  return slice.slice(0, cut).trimEnd() + '…';
}

/**
 * Returns a short teaser string for use on project listing cards, or
 * `undefined` if the project has no usable block to teaser from.
 */
export function extractTeaser(
  blocks: unknown[] | undefined | null,
  locale: string,
): string | undefined {
  if (!Array.isArray(blocks) || blocks.length === 0) return undefined;

  const typedBlocks = blocks as Block[];

  // Primary: first paragraph
  for (const b of typedBlocks) {
    if (b && b.type === 'paragraph') {
      const text = pickLocale(b, locale);
      if (text) return cap(text);
    }
  }

  // Fallback: first callout (tip / info / warning / success)
  for (const b of typedBlocks) {
    if (b && b.type === 'callout') {
      const text = pickLocale(b, locale);
      if (text) return cap(text);
    }
  }

  return undefined;
}
