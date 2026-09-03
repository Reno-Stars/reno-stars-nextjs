import { describe, it, expect } from 'vitest';
import { validateDraft } from '@/scripts/lib/blog-draft';

const ok = {
  slug: 'heat-pump-installation-vancouver-2026',
  titleEn: 'Heat Pump Installation in Vancouver',
  titleZh: '温哥华热泵安装',
  contentEn: '<p>x</p>', contentZh: '<p>x</p>',
  excerptEn: 'x', excerptZh: 'x',
  metaTitleEn: 'Heat Pump Installation Vancouver 2026',
  metaTitleZh: '温哥华热泵安装 2026',
  metaDescriptionEn: 'x', metaDescriptionZh: 'x',
};

describe('validateDraft', () => {
  it('accepts a complete draft', () => {
    expect(validateDraft(ok)).toEqual([]);
  });

  it('reports every missing required field rather than the first', () => {
    const problems = validateDraft({ slug: 'a-b' });
    expect(problems.length).toBeGreaterThan(5);
    expect(problems.every((p) => p.problem.includes('required'))).toBe(true);
  });

  // The 2026-09-02 hand-insert: meta_title_en was 78 chars against varchar(70).
  it('catches a meta title that exceeds its column', () => {
    const p = validateDraft({ ...ok, metaTitleEn: 'x'.repeat(78) });
    expect(p).toEqual([{ field: 'metaTitleEn', problem: '78 chars exceeds the varchar(70) column' }]);
  });

  it('catches a focus keyword that exceeds its column', () => {
    const p = validateDraft({ ...ok, focusKeywordEn: 'x'.repeat(58) });
    expect(p[0].problem).toContain('varchar(50)');
  });

  it('rejects a non-kebab-case slug', () => {
    expect(validateDraft({ ...ok, slug: 'Heat Pump 2026' })[0].field).toBe('slug');
  });

  it('rejects a transliterated Chinese brand name', () => {
    const p = validateDraft({ ...ok, contentZh: '<p>雷諾之星為您服務</p>' });
    expect(p[0].problem).toContain('聚星装修');
  });

  it('accepts the correct Chinese trade name', () => {
    expect(validateDraft({ ...ok, contentZh: '<p>聚星装修為您服務</p>' })).toEqual([]);
  });
});
