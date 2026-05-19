'use client';

import { useState, useMemo, useCallback } from 'react';
import { NAVY, GOLD, GOLD_PALE, CARD, SURFACE_ALT, TEXT, TEXT_MID, TEXT_MUTED } from '@/lib/theme';

interface DynamicBlocksEditorProps {
  /** Initial JSON-serialized blocks array. Default '[]'. */
  initialValue?: string;
  /** Hidden input name — server-side parser reads from FormData by this key. */
  name?: string;
  /** Mark form as dirty when user changes blocks. */
  onChange?: () => void;
  /** Whether the form is in edit mode (false = view-only). */
  editing?: boolean;
}

type BlockTemplate = {
  type: string;
  label: string;
  description: string;
  template: Record<string, unknown>;
};

const TEMPLATES: BlockTemplate[] = [
  {
    type: 'heading',
    label: 'Heading',
    description: 'H2 or H3 section title',
    template: { type: 'heading', level: 2, en: 'Heading EN', zh: '标题中文' },
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    description: 'Plain prose, bilingual',
    template: { type: 'paragraph', en: 'Paragraph in English.', zh: '中文段落。' },
  },
  {
    type: 'list',
    label: 'List',
    description: 'Bulleted or numbered list',
    template: {
      type: 'list',
      ordered: false,
      items: [
        { en: 'First item', zh: '第一项' },
        { en: 'Second item', zh: '第二项' },
      ],
    },
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Q&A list — auto-emits FAQPage JSON-LD for Google + AI search',
    template: {
      type: 'faq',
      items: [
        {
          questionEn: 'Question in English?',
          questionZh: '中文问题？',
          answerEn: 'Answer in English.',
          answerZh: '中文回答。',
        },
      ],
    },
  },
  {
    type: 'howto',
    label: 'How-To',
    description: 'Step-by-step instructions — auto-emits HowTo JSON-LD',
    template: {
      type: 'howto',
      nameEn: 'How to do X',
      nameZh: '如何做 X',
      descriptionEn: 'Brief description of the process.',
      descriptionZh: '过程简要说明。',
      totalTimeISO: 'P1W',
      steps: [
        {
          nameEn: 'Step 1',
          nameZh: '第1步',
          textEn: 'What happens in step 1.',
          textZh: '第1步说明。',
        },
      ],
    },
  },
  {
    type: 'image',
    label: 'Image',
    description: 'Inline image with caption (also goes into ItemList JSON-LD)',
    template: {
      type: 'image',
      url: 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/your-image.jpg',
      altEn: 'Descriptive alt text',
      altZh: '图片描述',
    },
  },
  {
    type: 'video',
    label: 'Video',
    description: 'YouTube URL (auto-embed) or self-hosted mp4',
    template: {
      type: 'video',
      url: 'https://youtu.be/VIDEO_ID',
      titleEn: 'Video title',
      titleZh: '视频标题',
    },
  },
  {
    type: 'callout',
    label: 'Callout',
    description: 'Tip / info / warning box for emphasis',
    template: {
      type: 'callout',
      variant: 'tip',
      en: 'Pro tip in English.',
      zh: '专业建议中文。',
    },
  },
  {
    type: 'quote',
    label: 'Quote',
    description: 'Pull quote with optional attribution',
    template: {
      type: 'quote',
      en: 'Quoted text in English.',
      zh: '中文引言。',
      attribution: 'Source name',
    },
  },
  {
    type: 'html',
    label: 'Raw HTML',
    description: 'Sanitized HTML for advanced layouts (no scripts allowed)',
    template: {
      type: 'html',
      en: '<p>HTML in English.</p>',
      zh: '<p>中文 HTML。</p>',
    },
  },
];

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: '0.5rem',
  border: `1px solid ${SURFACE_ALT}`,
  background: '#fff',
  color: TEXT,
  fontSize: '0.875rem',
  fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
};

export default function DynamicBlocksEditor({
  initialValue = '[]',
  name = 'dynamicBlocks',
  onChange,
  editing = true,
}: DynamicBlocksEditorProps) {
  const [raw, setRaw] = useState(() => {
    try {
      return JSON.stringify(JSON.parse(initialValue), null, 2);
    } catch {
      return '[]';
    }
  });

  const { parsed, error, blockCount } = useMemo(() => {
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return { parsed: null, error: 'Top-level must be an array of block objects.', blockCount: 0 };
      }
      // Quick shape validation per block
      for (let i = 0; i < parsed.length; i++) {
        const b = parsed[i];
        if (!b || typeof b !== 'object' || typeof b.type !== 'string') {
          return { parsed: null, error: `Block ${i + 1}: missing or invalid "type" field.`, blockCount: 0 };
        }
      }
      return { parsed, error: null, blockCount: parsed.length };
    } catch (e) {
      return { parsed: null, error: (e as Error).message, blockCount: 0 };
    }
  }, [raw]);

  const handleRawChange = useCallback(
    (next: string) => {
      setRaw(next);
      onChange?.();
    },
    [onChange],
  );

  const addBlock = useCallback(
    (template: BlockTemplate) => {
      let current: unknown[];
      try {
        const parsed = JSON.parse(raw);
        current = Array.isArray(parsed) ? parsed : [];
      } catch {
        current = [];
      }
      current.push(template.template);
      handleRawChange(JSON.stringify(current, null, 2));
    },
    [raw, handleRawChange],
  );

  const formatJson = useCallback(() => {
    try {
      handleRawChange(JSON.stringify(JSON.parse(raw), null, 2));
    } catch {
      // No-op if invalid
    }
  }, [raw, handleRawChange]);

  const blockSummary = useMemo(() => {
    if (!parsed) return [];
    return (parsed as Array<{ type: string }>).map((b, i) => ({ idx: i, type: b.type }));
  }, [parsed]);

  return (
    <section
      style={{
        background: CARD,
        border: `1px solid ${SURFACE_ALT}`,
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: NAVY, margin: 0 }}>
            Dynamic Content Blocks
          </h3>
          <p style={{ fontSize: '0.75rem', color: TEXT_MUTED, margin: '0.25rem 0 0', maxWidth: '54ch' }}>
            Rich bilingual content rendered after the Challenge/Solution section.
            FAQ + How-To blocks auto-emit JSON-LD structured data for Google AI Overviews
            + Perplexity citations.
          </p>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            color: blockCount > 0 ? NAVY : TEXT_MUTED,
            background: blockCount > 0 ? GOLD_PALE : 'transparent',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.375rem',
            fontWeight: 500,
          }}
        >
          {blockCount} block{blockCount === 1 ? '' : 's'}
        </span>
      </header>

      {/* Template picker */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.75rem', color: TEXT_MID, marginBottom: '0.375rem', fontWeight: 500 }}>
          Add a block (appends to end):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {TEMPLATES.map((t) => (
            <button
              key={t.type}
              type="button"
              disabled={!editing}
              onClick={() => addBlock(t)}
              title={t.description}
              style={{
                padding: '0.375rem 0.625rem',
                borderRadius: '0.375rem',
                border: `1px solid ${SURFACE_ALT}`,
                background: '#fff',
                color: NAVY,
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: editing ? 'pointer' : 'not-allowed',
                opacity: editing ? 1 : 0.5,
              }}
            >
              + {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Block summary (read-only overview) */}
      {blockSummary.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: TEXT_MID, marginBottom: '0.375rem', fontWeight: 500 }}>
            Current order:
          </div>
          <ol style={{ margin: 0, padding: '0 0 0 1.25rem', fontSize: '0.8125rem', color: TEXT_MID }}>
            {blockSummary.map((b) => (
              <li key={b.idx} style={{ marginBottom: '0.125rem' }}>
                <code style={{ background: SURFACE_ALT, padding: '0.0625rem 0.375rem', borderRadius: '0.25rem' }}>
                  {b.type}
                </code>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* JSON editor */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <label htmlFor="dynamicBlocksJson" style={{ fontSize: '0.75rem', color: TEXT_MID, fontWeight: 500 }}>
            Block JSON (edit directly for fine-grained control):
          </label>
          <button
            type="button"
            disabled={!editing || !!error}
            onClick={formatJson}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              border: 'none',
              background: 'transparent',
              color: GOLD,
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: editing && !error ? 'pointer' : 'not-allowed',
              opacity: editing && !error ? 1 : 0.4,
            }}
          >
            Format JSON
          </button>
        </div>
        <textarea
          id="dynamicBlocksJson"
          value={raw}
          onChange={(e) => handleRawChange(e.target.value)}
          disabled={!editing}
          rows={Math.min(24, Math.max(8, raw.split('\n').length))}
          style={{
            ...fieldStyle,
            fontSize: '0.8125rem',
            lineHeight: 1.45,
            resize: 'vertical',
            borderColor: error ? '#dc2626' : SURFACE_ALT,
          }}
          spellCheck={false}
        />
        {error && (
          <div
            style={{
              marginTop: '0.375rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(220, 38, 38, 0.08)',
              border: '1px solid rgba(220, 38, 38, 0.25)',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              color: '#b91c1c',
            }}
          >
            <strong>Invalid JSON:</strong> {error}
            <div style={{ marginTop: '0.25rem', color: TEXT_MUTED }}>
              The form will refuse to save until this is fixed.
            </div>
          </div>
        )}
      </div>

      {/* Hidden input — server-side parser reads the validated JSON from FormData */}
      <input type="hidden" name={name} value={error ? '' : raw} />
    </section>
  );
}
