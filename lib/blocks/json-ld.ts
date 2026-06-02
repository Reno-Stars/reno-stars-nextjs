/**
 * JSON-LD auto-emission from project dynamic blocks.
 *
 * Walks the blocks array and returns prop objects that map 1:1 to
 * existing structured-data components:
 *   - `faq` blocks  -> FAQSchema
 *   - `howto` blocks -> HowToSchema
 *   - `image` blocks (any count >= 1) -> ItemListSchema (combined)
 *
 * The page component should call `getJsonLdFromBlocks(blocks, locale)`
 * and spread the returned arrays into the existing schema components.
 *
 * No JSON-LD emitted for heading/paragraph/list/callout/quote/html/video
 * — those are pure presentational/narrative content with no
 * Schema.org type that benefits SEO at the AI-search level.
 */

import type { Block, FaqBlock, HowToBlock, ImageBlock } from './types';

export type FaqSchemaInput = {
  faqs: Array<{ question: string; answer: string }>;
  locale: string;
};

export type HowToSchemaInput = {
  name: string;
  description: string;
  totalTime?: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  image?: string;
  /** BCP-47 locale, e.g. 'en' / 'zh'. Populated by howtoToInput from
   *  the parent block-conversion locale; consumed by HowToSchema to
   *  emit Schema.org `inLanguage` at HowTo + per-step. Mirrors the
   *  FaqSchemaInput.locale pattern shipped in PR #102. */
  locale: string;
};

export type ItemListSchemaInput = {
  items: Array<{ name: string; url: string; image?: string }>;
  name?: string;
  description?: string;
  locale: string;
};

export type BlockJsonLd = {
  faqs: FaqSchemaInput[];
  howtos: HowToSchemaInput[];
  imageList: ItemListSchemaInput | null;
};

function pickEnZh(en: string, zh: string, locale: string): string {
  if (locale === 'zh-CN' || locale === 'zh') return zh || en;
  return en;
}

function faqToInput(block: FaqBlock, locale: string): FaqSchemaInput {
  return {
    locale,
    faqs: block.items.map((item) => {
      const override = item.translations?.[locale];
      if (override) {
        return { question: override.q, answer: override.a };
      }
      return {
        question: pickEnZh(item.questionEn, item.questionZh, locale),
        answer: pickEnZh(item.answerEn, item.answerZh, locale),
      };
    }),
  };
}

function howtoToInput(block: HowToBlock, locale: string): HowToSchemaInput {
  return {
    name: pickEnZh(block.nameEn, block.nameZh, locale),
    description:
      pickEnZh(block.descriptionEn ?? '', block.descriptionZh ?? '', locale) ||
      pickEnZh(block.nameEn, block.nameZh, locale),
    totalTime: block.totalTimeISO,
    steps: block.steps.map((step) => ({
      name: pickEnZh(step.nameEn, step.nameZh, locale),
      text: pickEnZh(step.textEn, step.textZh, locale),
      image: step.image,
    })),
    locale,
  };
}

function imageBlocksToList(
  blocks: ImageBlock[],
  locale: string,
  projectUrl: string,
): ItemListSchemaInput {
  return {
    locale,
    items: blocks.map((b, idx) => ({
      name: pickEnZh(b.altEn, b.altZh, locale) || `Image ${idx + 1}`,
      url: `${projectUrl}#block-image-${idx}`,
      image: b.url,
    })),
  };
}

/**
 * Returns prop arrays ready to spread into existing structured-data
 * components in `components/structured-data/*`.
 *
 * @param blocks      The project.dynamicBlocks array (may be empty/undefined)
 * @param locale      Current page locale (e.g. "en", "zh-CN")
 * @param projectUrl  Canonical project URL (for ItemList items)
 */
export function getJsonLdFromBlocks(
  blocks: Block[] | undefined | null,
  locale: string,
  projectUrl: string,
): BlockJsonLd {
  const out: BlockJsonLd = {
    faqs: [],
    howtos: [],
    imageList: null,
  };

  if (!blocks || blocks.length === 0) return out;

  const imageBlocks: ImageBlock[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'faq':
        if (block.items.length > 0) out.faqs.push(faqToInput(block, locale));
        break;
      case 'howto':
        if (block.steps.length > 0) out.howtos.push(howtoToInput(block, locale));
        break;
      case 'image':
        imageBlocks.push(block);
        break;
      default:
        // No JSON-LD for heading/paragraph/list/callout/quote/html/video
        break;
    }
  }

  if (imageBlocks.length >= 1) {
    out.imageList = imageBlocksToList(imageBlocks, locale, projectUrl);
  }

  return out;
}
