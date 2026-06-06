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

  it('scopes an MT backfill of one locale to just that locale', () => {
    const next = clone(base);
    next.localizations = { titleJa: 'タイトル', contentJa: '本文' };
    expect(blogChangedLocales(base, next)).toEqual(['ja']);
  });

  it('scopes a content-only translation edit to that locale', () => {
    const withJa = clone(base);
    withJa.localizations = { titleJa: 'タイトル', contentJa: '本文' };
    const next = clone(withJa);
    next.localizations = { titleJa: 'タイトル', contentJa: '本文（改訂）' };
    expect(blogChangedLocales(withJa, next)).toEqual(['ja']);
  });

  it('returns ALL locales on a global (non-localized) change', () => {
    expect(blogChangedLocales(base, { ...clone(base), featuredImageUrl: 'https://img/new.jpg' }).sort())
      .toEqual([...locales].sort());
    expect(blogChangedLocales(base, { ...clone(base), publishedAt: new Date('2026-02-02T00:00:00Z') }))
      .toHaveLength(locales.length);
    expect(blogChangedLocales(base, { ...clone(base), slug: 'renamed' })).toHaveLength(locales.length);
  });

  it('an EN body edit hits en + the fallback locales, but not zh (zh has its own body)', () => {
    const res = blogChangedLocales(base, { ...clone(base), contentEn: 'New body' });
    expect(res).toContain('en');
    expect(res).toContain('ja');
    expect(res).toContain('fr');
    expect(res).not.toContain('zh');
  });

  it('an EN body edit does NOT regenerate a locale that has its own native body', () => {
    const withNativeJa = clone(base);
    withNativeJa.localizations = { contentJa: '日本語の本文' };
    const next = clone(withNativeJa);
    next.contentEn = 'New EN body';
    const res = blogChangedLocales(withNativeJa, next);
    expect(res).toContain('en');
    expect(res).not.toContain('ja'); // ja renders its own contentJa, unaffected by EN
    expect(res).toContain('ko');     // ko falls back to EN
  });

  it('a ZH body edit hits zh + zh-Hant, not en/other locales', () => {
    const res = blogChangedLocales(base, { ...clone(base), contentZh: '新的正文' });
    expect(res).toContain('zh');
    expect(res).toContain('zh-Hant');
    expect(res).not.toContain('en');
    expect(res).not.toContain('ja');
  });

  it('a meta_overrides edit hits en + zh', () => {
    const res = blogChangedLocales(base, { ...clone(base), metaOverrides: { title: { en: 'A/B title' } } });
    expect(res).toContain('en');
    expect(res).toContain('zh');
    expect(res).not.toContain('ja');
  });

  it('ignores focus keyword (admin-only, not rendered)', () => {
    expect(blogChangedLocales(base, { ...clone(base), focusKeywordEn: 'kitchen reno' })).toEqual([]);
  });

  it('an EN title edit hits en + fallback locales', () => {
    const res = blogChangedLocales(base, { ...clone(base), titleEn: 'New Title' });
    expect(res).toContain('en');
    expect(res).toContain('vi');
    expect(res).not.toContain('zh');
  });
});
