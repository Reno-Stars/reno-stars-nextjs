import DOMPurify from 'isomorphic-dompurify';
import OptimizedImage from '@/components/OptimizedImage';
import { NAVY, GOLD, GOLD_PALE, NAVY_90, TEXT, TEXT_MID, CARD, SURFACE_ALT } from '@/lib/theme';
import {
  type Block,
  type LocalizedString,
  pickBlockLocale,
} from '@/lib/blocks/types';

interface BlockRendererProps {
  blocks: Block[] | undefined | null;
  locale: string;
}

/**
 * Server-renderable renderer for `projects.dynamic_blocks`.
 * Picks EN/ZH per locale, renders bilingual blocks as proper semantic HTML
 * (headings, paragraphs, lists, etc.) so screen readers and Google can
 * parse the content. Pair with `lib/blocks/json-ld.ts` to also emit
 * structured-data JSON-LD for FAQ/HowTo/ItemList blocks.
 */
export default function BlockRenderer({ blocks, locale }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-8">
      {blocks.map((block, idx) => (
        <BlockNode key={idx} block={block} locale={locale} index={idx} />
      ))}
    </div>
  );
}

function BlockNode({ block, locale, index }: { block: Block; locale: string; index: number }) {
  switch (block.type) {
    case 'heading':
      return <Heading block={block} locale={locale} />;
    case 'paragraph':
      return <Paragraph block={block} locale={locale} />;
    case 'list':
      return <List block={block} locale={locale} />;
    case 'faq':
      return <Faq block={block} locale={locale} />;
    case 'howto':
      return <HowTo block={block} locale={locale} />;
    case 'image':
      return <ImageBlockView block={block} locale={locale} index={index} />;
    case 'video':
      return <VideoBlockView block={block} locale={locale} />;
    case 'callout':
      return <Callout block={block} locale={locale} />;
    case 'quote':
      return <Quote block={block} locale={locale} />;
    case 'html':
      return <Html block={block} locale={locale} />;
    default: {
      // Unknown block type — render nothing rather than crash. Add new types
      // to lib/blocks/types.ts + a case above when needed.
      const _exhaustive: never = block;
      void _exhaustive;
      return null;
    }
  }
}

function Heading({ block, locale }: { block: Extract<Block, { type: 'heading' }>; locale: string }) {
  const text = pickBlockLocale(block, locale);
  const Tag = block.level === 2 ? 'h2' : 'h3';
  const size = block.level === 2 ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl';
  return (
    <Tag className={`${size} font-semibold leading-tight`} style={{ color: NAVY }}>
      {text}
    </Tag>
  );
}

function Paragraph({ block, locale }: { block: Extract<Block, { type: 'paragraph' }>; locale: string }) {
  const text = pickBlockLocale(block, locale);
  return (
    <p className="text-base sm:text-lg leading-relaxed" style={{ color: TEXT }}>
      {text}
    </p>
  );
}

function List({ block, locale }: { block: Extract<Block, { type: 'list' }>; locale: string }) {
  const Tag = block.ordered ? 'ol' : 'ul';
  const listClass = block.ordered ? 'list-decimal' : 'list-disc';
  return (
    <Tag className={`${listClass} pl-6 space-y-2 text-base sm:text-lg`} style={{ color: TEXT }}>
      {block.items.map((item, i) => (
        <li key={i}>{pickBlockLocale(item, locale)}</li>
      ))}
    </Tag>
  );
}

function Faq({ block, locale }: { block: Extract<Block, { type: 'faq' }>; locale: string }) {
  const heading = block.heading ? pickBlockLocale(block.heading, locale) : null;
  const defaultHeading = locale === 'zh' || locale === 'zh-CN' ? '常见问题' : 'Frequently Asked Questions';
  return (
    <section className="space-y-4">
      <h2 className="text-2xl sm:text-3xl font-semibold" style={{ color: NAVY }}>
        {heading || defaultHeading}
      </h2>
      <dl className="space-y-4">
        {block.items.map((item, i) => {
          const override = item.translations?.[locale];
          const q = override
            ? override.q
            : locale === 'zh' || locale === 'zh-CN'
              ? item.questionZh || item.questionEn
              : item.questionEn;
          const a = override
            ? override.a
            : locale === 'zh' || locale === 'zh-CN'
              ? item.answerZh || item.answerEn
              : item.answerEn;
          return (
            <details
              key={i}
              className="rounded-xl px-5 py-4"
              style={{ backgroundColor: CARD, border: `1px solid ${SURFACE_ALT}` }}
            >
              <summary
                className="cursor-pointer text-lg font-medium list-none [&::-webkit-details-marker]:hidden flex justify-between items-center gap-3"
                style={{ color: NAVY }}
              >
                <span>{q}</span>
                <span aria-hidden className="text-xl flex-shrink-0" style={{ color: GOLD }}>
                  +
                </span>
              </summary>
              <dd className="mt-3 text-base leading-relaxed" style={{ color: TEXT_MID }}>
                {a}
              </dd>
            </details>
          );
        })}
      </dl>
    </section>
  );
}

function HowTo({ block, locale }: { block: Extract<Block, { type: 'howto' }>; locale: string }) {
  const name = locale === 'zh' || locale === 'zh-CN' ? block.nameZh : block.nameEn;
  const description =
    locale === 'zh' || locale === 'zh-CN' ? block.descriptionZh : block.descriptionEn;
  return (
    <section className="space-y-5">
      <header>
        <h2 className="text-2xl sm:text-3xl font-semibold" style={{ color: NAVY }}>
          {name}
        </h2>
        {description && (
          <p className="mt-2 text-base sm:text-lg" style={{ color: TEXT_MID }}>
            {description}
          </p>
        )}
      </header>
      <ol className="space-y-4">
        {block.steps.map((step, i) => {
          const stepName = locale === 'zh' || locale === 'zh-CN' ? step.nameZh : step.nameEn;
          const stepText = locale === 'zh' || locale === 'zh-CN' ? step.textZh : step.textEn;
          return (
            <li key={i} className="flex gap-4 rounded-xl p-4" style={{ backgroundColor: CARD }}>
              <div
                className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full font-semibold text-sm"
                style={{ backgroundColor: GOLD_PALE, color: GOLD }}
                aria-hidden
              >
                {i + 1}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-base sm:text-lg" style={{ color: NAVY }}>
                  {stepName}
                </h3>
                <p className="text-base leading-relaxed" style={{ color: TEXT_MID }}>
                  {stepText}
                </p>
                {step.image && (
                  <div className="mt-2 rounded-lg overflow-hidden" style={{ maxWidth: '320px' }}>
                    <OptimizedImage
                      src={step.image}
                      alt={stepName}
                      width={320}
                      height={240}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ImageBlockView({
  block,
  locale,
  index,
}: {
  block: Extract<Block, { type: 'image' }>;
  locale: string;
  index: number;
}) {
  const alt = locale === 'zh' || locale === 'zh-CN' ? block.altZh : block.altEn;
  const caption =
    locale === 'zh' || locale === 'zh-CN' ? block.captionZh : block.captionEn;
  return (
    <figure id={`block-image-${index}`} className="space-y-2">
      <div className="rounded-2xl overflow-hidden">
        <OptimizedImage
          src={block.url}
          alt={alt}
          width={1600}
          height={1200}
          className="w-full h-auto object-cover"
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-center" style={{ color: TEXT_MID }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function VideoBlockView({ block, locale }: { block: Extract<Block, { type: 'video' }>; locale: string }) {
  const title =
    locale === 'zh' || locale === 'zh-CN'
      ? block.titleZh || block.titleEn
      : block.titleEn || block.titleZh;

  // YouTube URL? embed as iframe (no controls JS needed)
  const ytMatch = block.url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/);
  if (ytMatch) {
    const id = ytMatch[1];
    return (
      <figure className="space-y-2">
        <div className="aspect-video rounded-2xl overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        {title && (
          <figcaption className="text-sm text-center" style={{ color: TEXT_MID }}>
            {title}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="space-y-2">
      <video
        controls
        playsInline
        preload="metadata"
        poster={block.thumbnailUrl}
        className="w-full rounded-2xl bg-black"
      >
        <source src={block.url} />
        {title && <track kind="captions" />}
      </video>
      {title && (
        <figcaption className="text-sm text-center" style={{ color: TEXT_MID }}>
          {title}
        </figcaption>
      )}
    </figure>
  );
}

function Callout({ block, locale }: { block: Extract<Block, { type: 'callout' }>; locale: string }) {
  const text = pickBlockLocale(block, locale);
  const palette: Record<string, { bg: string; border: string; icon: string; iconBg: string }> = {
    info: { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.25)', icon: '#3b82f6', iconBg: 'rgba(59, 130, 246, 0.12)' },
    warning: { bg: 'rgba(234, 179, 8, 0.10)', border: 'rgba(234, 179, 8, 0.30)', icon: '#a16207', iconBg: 'rgba(234, 179, 8, 0.18)' },
    success: { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.25)', icon: '#16a34a', iconBg: 'rgba(34, 197, 94, 0.12)' },
    tip: { bg: GOLD_PALE, border: 'rgba(200,146,42,0.25)', icon: GOLD, iconBg: 'rgba(200,146,42,0.20)' },
  };
  const c = palette[block.variant] || palette.info;
  const labels: Record<string, { en: string; zh: string }> = {
    info: { en: 'Note', zh: '说明' },
    warning: { en: 'Heads up', zh: '注意' },
    success: { en: 'Good to know', zh: '小贴士' },
    tip: { en: 'Pro tip', zh: '专业建议' },
  };
  const label = labels[block.variant] || labels.info;
  const labelText = locale === 'zh' || locale === 'zh-CN' ? label.zh : label.en;
  return (
    <aside
      className="rounded-xl p-4 sm:p-5 flex gap-3"
      style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ backgroundColor: c.iconBg, color: c.icon }}
        aria-hidden
      >
        i
      </div>
      <div className="flex-1 space-y-1">
        <div className="font-semibold text-sm uppercase tracking-wide" style={{ color: c.icon }}>
          {labelText}
        </div>
        <p className="text-base leading-relaxed" style={{ color: TEXT }}>
          {text}
        </p>
      </div>
    </aside>
  );
}

function Quote({ block, locale }: { block: Extract<Block, { type: 'quote' }>; locale: string }) {
  const text = pickBlockLocale(block, locale);
  return (
    <blockquote
      className="border-l-4 pl-5 py-2 italic text-lg sm:text-xl"
      style={{ borderColor: GOLD, color: NAVY_90 }}
    >
      <p>{text}</p>
      {block.attribution && (
        <footer className="mt-2 text-sm not-italic" style={{ color: TEXT_MID }}>
          — {block.attribution}
        </footer>
      )}
    </blockquote>
  );
}

function Html({ block, locale }: { block: Extract<Block, { type: 'html' }>; locale: string }) {
  const raw = locale === 'zh' || locale === 'zh-CN' ? block.zh : block.en;
  const sanitized = DOMPurify.sanitize(raw, {
    // Conservative allowlist — no <script>, no <style>, no event handlers
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li',
      'h2', 'h3', 'h4', 'blockquote', 'code', 'pre', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'figure', 'figcaption',
    ],
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class', 'rel', 'target', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
  });
  return (
    <div
      className="prose-block text-base sm:text-lg leading-relaxed [&_a]:underline [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1"
      style={{ color: TEXT }}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
