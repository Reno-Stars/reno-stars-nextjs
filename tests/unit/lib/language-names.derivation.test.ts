import { describe, it, expect, vi } from 'vitest';

// Pretend Korean was just hired. If the supported-language list is genuinely
// derived from LOCALE_META.nativeSupport, the rendered sentence must pick ko up
// with no other change. A hardcoded list would not move.
vi.mock('@/i18n/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/i18n/config')>();
  const meta = {
    ...actual.LOCALE_META,
    ko: { ...actual.LOCALE_META.ko, nativeSupport: true },
  };
  return {
    ...actual,
    LOCALE_META: meta,
    hasNativeSupport: (loc: string) => meta[loc as keyof typeof meta].nativeSupport,
  };
});

const { nativeSupportLanguageList } = await import('@/lib/i18n/language-names');

// Pinned in the real (unmocked) suite — tests/unit/lib/language-names.test.ts
// asserts this exact string for 'en' against the real three-locale config.
// If the module under test is genuinely deriving from LOCALE_META rather than
// a hardcoded ['en', 'zh-Hans', 'zh-Hant'], flipping ko.nativeSupport here must
// change this string, not just add a fourth name alongside a frozen constant.
const REAL_EN_LIST = 'English, Simplified Chinese, and Traditional Chinese';

describe('nativeSupportLanguageList derivation', () => {
  it('picks up a newly-supported locale from LOCALE_META with no hardcoding', () => {
    const list = nativeSupportLanguageList('en');
    expect(list).toContain('Korean');
  });

  it('differs from the real (three-locale) English list once a locale flips supported', () => {
    const list = nativeSupportLanguageList('en');
    expect(list).not.toBe(REAL_EN_LIST);
  });
});
