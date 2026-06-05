import { describe, it, expect } from 'vitest';
import { blogChangedLocales } from '@/lib/admin/locale-invalidation';
import { locales } from '@/i18n/config';

// A fully-EN post with no per-locale overrides — every non-en/zh locale renders
// EN via fallback; zh/zh-Hant render the ZH base.
const base = {
  slug: 'kitchen-tips',
  isPublished: true,
  publishedAt: new Date('2026-01-01T00:00:00Z'),
  featuredImageUrl: 'https://img/x.jpg',
  author: 'Reno Stars',
  readingTimeMinutes: 5,
  projectId: null,
  titleEn: 'Title', titleZh: '标题',
  excerptEn: 'Excerpt', excerptZh: '摘要',
  contentEn: 'Body', contentZh: '正文',
  metaTitleEn: null, metaTitleZh: null,
  metaDescriptionEn: null, metaDescriptionZh: null,
  seoKeywordsEn: null, seoKeywordsZh: null,
  metaOverrides: null,
  localizations: {} as Record<string, unknown>,
};
const clone = (o: Record<string, unknown>) => ({ ...o, localizations: { ...(o.localizations as object) } });

describe('blogChangedLocales', () => {
  it('returns no locales when nothing changed', () => {
    expect(blogChangedLocales(base, clone(base))).toEqual([]);
  });

  // 2026-06-05: only en/zh/zh-Hant are served (i18n/config `locales`); the other
  // 11 locales 307-redirect to /en. So a change touching only an inactive
  // locale's override revalidates nothing — there is no served page for it.
  it('a backfill of an INACTIVE locale (ja) revalidates nothing — it is not served', () => {
    const next = clone(base);
    next.localizations = { titleJa: 'タイトル', contentJa: '本文' };
    expect(blogChangedLocales(base, next)).toEqual([]);
  });

  it('returns ALL active locales on a global (non-localized) change', () => {
    expect(blogChangedLocales(base, { ...clone(base), featuredImageUrl: 'https://img/new.jpg' }).sort())
      .toEqual([...locales].sort());
    expect(blogChangedLocales(base, { ...clone(base), publishedAt: new Date('2026-02-02T00:00:00Z') }))
      .toHaveLength(locales.length);
    expect(blogChangedLocales(base, { ...clone(base), slug: 'renamed' })).toHaveLength(locales.length);
  });

  it('an EN body edit hits en only — active zh/zh-Hant render the ZH base', () => {
    const res = blogChangedLocales(base, { ...clone(base), contentEn: 'New body' });
    expect(res).toContain('en');
    expect(res).not.toContain('zh');
    expect(res).not.toContain('zh-Hant'); // falls back to the present ZH base, not EN
  });

  it('zh-Hant fallback chain: an EN edit regenerates zh-Hant ONLY when the ZH base is absent', () => {
    // ZH base present → zh-Hant renders zh → immune to an EN change
    const res1 = blogChangedLocales(base, { ...clone(base), contentEn: 'New body' });
    expect(res1).not.toContain('zh-Hant');
    // ZH base absent → zh-Hant falls back to EN, so an EN change hits it
    const noZh = { ...clone(base), contentZh: null };
    const res2 = blogChangedLocales(noZh, { ...clone(noZh), contentEn: 'New body' });
    expect(res2).toContain('en');
    expect(res2).toContain('zh-Hant');
    expect(res2).not.toContain('zh');
  });

  it('a ZH body edit hits zh + zh-Hant, not en', () => {
    const res = blogChangedLocales(base, { ...clone(base), contentZh: '新的正文' });
    expect(res).toContain('zh');
    expect(res).toContain('zh-Hant');
    expect(res).not.toContain('en');
  });

  it('a meta_overrides edit hits en + zh', () => {
    const res = blogChangedLocales(base, { ...clone(base), metaOverrides: { title: { en: 'A/B title' } } });
    expect(res).toContain('en');
    expect(res).toContain('zh');
  });

  it('ignores focus keyword (admin-only, not rendered)', () => {
    expect(blogChangedLocales(base, { ...clone(base), focusKeywordEn: 'kitchen reno' })).toEqual([]);
  });

  it('an EN title edit hits en only while the ZH base is present', () => {
    const res = blogChangedLocales(base, { ...clone(base), titleEn: 'New Title' });
    expect(res).toContain('en');
    expect(res).not.toContain('zh');
    expect(res).not.toContain('zh-Hant');
  });
});
