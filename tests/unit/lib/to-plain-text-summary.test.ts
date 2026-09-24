import { describe, it, expect } from 'vitest';
import { toPlainTextSummary } from '@/lib/utils';

describe('toPlainTextSummary', () => {
  it('strips block and inline markdown and joins blocks into sentences', () => {
    const md = [
      '## Kitchen in [Vancouver](/en/areas/vancouver/)',
      '',
      '**Reno Stars** does *complete* `custom` work_with_underscores.',
      '',
      '- Item one',
      '* Item two',
      '1. Three',
      '> A quote',
      '![alt](https://example.com/a.jpg)',
      '---',
      '<p>Inline <strong>html</strong></p>',
    ].join('\n');
    expect(toPlainTextSummary(md)).toBe(
      'Kitchen in Vancouver. Reno Stars does complete custom work_with_underscores. Item one. Item two. Three. A quote Inline html',
    );
  });

  it('uses a CJK full stop for Chinese headings and keeps bold content', () => {
    expect(toPlainTextSummary('## 厨房装修\n中文**粗体**内容')).toBe('厨房装修。 中文粗体内容');
  });

  it('truncates at a word boundary with an ellipsis', () => {
    const out = toPlainTextSummary('word '.repeat(200), 300);
    expect(out.length).toBeLessThanOrEqual(301);
    expect(out).toMatch(/word…$/);
  });

  it('hard-cuts spaceless CJK text at the limit', () => {
    const out = toPlainTextSummary('中'.repeat(400), 300);
    expect(out).toBe(`${'中'.repeat(300)}…`);
  });

  it('returns short plain text unchanged and empty for empty input', () => {
    expect(toPlainTextSummary('Kitchen renovations in Vancouver.')).toBe('Kitchen renovations in Vancouver.');
    expect(toPlainTextSummary('')).toBe('');
  });
});
