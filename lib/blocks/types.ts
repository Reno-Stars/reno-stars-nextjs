/**
 * Dynamic content blocks for project pages.
 *
 * Stored as a JSONB array on `projects.dynamic_blocks`. Rendered server-side
 * by `<BlockRenderer>` (components/blocks/BlockRenderer.tsx). Walked by
 * `lib/blocks/json-ld.ts` to auto-emit FAQ/HowTo/ItemList structured data
 * for SEO + AI-search citations.
 *
 * Every block is bilingual EN+ZH; the renderer picks one based on the
 * current locale. Additional locales are filled by the translation cron
 * via the `translations` object on each block (optional).
 */

export type LocalizedString = {
  en: string;
  zh: string;
  /**
   * Optional per-locale overrides for other languages. Translator cron
   * writes into this; renderer falls back to en if a locale is missing.
   */
  translations?: Record<string, string>;
};

export type HeadingBlock = {
  type: 'heading';
  level: 2 | 3;
} & LocalizedString;

export type ParagraphBlock = {
  type: 'paragraph';
} & LocalizedString;

export type ListBlock = {
  type: 'list';
  ordered: boolean;
  items: LocalizedString[];
};

export type FaqBlock = {
  type: 'faq';
  /** Optional heading rendered above the FAQ list (defaults to localized "FAQ"). */
  heading?: LocalizedString;
  items: Array<{
    questionEn: string;
    questionZh: string;
    answerEn: string;
    answerZh: string;
    /** Optional per-locale overrides keyed like "fr": { q: ..., a: ... } */
    translations?: Record<string, { q: string; a: string }>;
  }>;
};

export type HowToBlock = {
  type: 'howto';
  nameEn: string;
  nameZh: string;
  descriptionEn?: string;
  descriptionZh?: string;
  /** ISO 8601 duration, e.g. "P1W" for one week. Becomes schema.totalTime. */
  totalTimeISO?: string;
  steps: Array<{
    nameEn: string;
    nameZh: string;
    textEn: string;
    textZh: string;
    image?: string;
  }>;
};

export type ImageBlock = {
  type: 'image';
  url: string;
  altEn: string;
  altZh: string;
  captionEn?: string;
  captionZh?: string;
};

export type VideoBlock = {
  type: 'video';
  url: string;
  /** Optional thumbnail for non-YouTube videos. */
  thumbnailUrl?: string;
  titleEn?: string;
  titleZh?: string;
};

export type CalloutBlock = {
  type: 'callout';
  variant: 'info' | 'warning' | 'success' | 'tip';
} & LocalizedString;

export type QuoteBlock = {
  type: 'quote';
  attribution?: string;
} & LocalizedString;

export type HtmlBlock = {
  type: 'html';
  /** Raw HTML — sanitized at render time with isomorphic-dompurify. */
  en: string;
  zh: string;
};

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | FaqBlock
  | HowToBlock
  | ImageBlock
  | VideoBlock
  | CalloutBlock
  | QuoteBlock
  | HtmlBlock;

/**
 * Pick the locale-appropriate string from a bilingual block. Falls back to
 * EN if the requested locale isn't set.
 */
export function pickBlockLocale(
  block: LocalizedString,
  locale: string,
): string {
  if (locale === 'zh-CN' || locale === 'zh') return block.zh || block.en;
  const override = block.translations?.[locale];
  if (override) return override;
  return block.en;
}
