import { describe, it, expect } from 'vitest';
import { locales, hasNativeSupport, type Locale } from '@/i18n/config';
import {
  nativeSupportLanguageList,
  localeSelfName,
  resolveNativeSupportNames,
} from '@/lib/i18n/language-names';

// Expected strings come from ICU/CLDR via Intl, not from us. Pinning them as
// literals means a Node or ICU upgrade that changes CLDR wording fails here
// loudly instead of silently changing what 11 locales read on the contact page.
const EXPECTED: Record<string, { self: string; list: string }> = {
  ja: { self: '日本語', list: '英語、簡体中国語、繁体中国語' },
  ko: { self: '한국어', list: '영어, 중국어(간체) 및 중국어(번체)' },
  es: { self: 'español', list: 'inglés, chino simplificado y chino tradicional' },
  pa: { self: 'ਪੰਜਾਬੀ', list: 'ਅੰਗਰੇਜ਼ੀ, ਚੀਨੀ (ਸਰਲ) ਅਤੇ ਚੀਨੀ (ਰਵਾਇਤੀ)' },
  tl: { self: 'Filipino', list: 'Ingles, Pinasimpleng Chinese, at Tradisyonal na Chinese' },
  fa: { self: 'فارسی', list: 'انگلیسی،‏ چینی ساده‌شده، و چینی سنتی' },
  vi: { self: 'Tiếng Việt', list: 'Tiếng Anh, Tiếng Trung (Giản thể) và Tiếng Trung (Phồn thể)' },
  ru: { self: 'русский', list: 'английский, китайский и кантонский' },
  ar: { self: 'العربية', list: 'الإنجليزية والصينية المبسطة والصينية التقليدية' },
  hi: { self: 'हिन्दी', list: 'अंग्रेज़ी, सरलीकृत चीनी, और पारंपरिक चीनी' },
  fr: { self: 'français', list: 'anglais, chinois simplifié et chinois traditionnel' },
};

const NEEDS_NOTICE = locales.filter((loc) => !hasNativeSupport(loc));

describe('localeSelfName', () => {
  it.each(NEEDS_NOTICE)('names %s in its own language', (loc) => {
    expect(localeSelfName(loc)).toBe(EXPECTED[loc].self);
  });

  it('never returns an empty string for any of the 14', () => {
    for (const loc of locales) expect(localeSelfName(loc).length).toBeGreaterThan(0);
  });
});

describe('nativeSupportLanguageList', () => {
  it.each(NEEDS_NOTICE)('lists the supported languages in %s', (loc) => {
    expect(nativeSupportLanguageList(loc)).toBe(EXPECTED[loc].list);
  });

  it('reads correctly in English', () => {
    expect(nativeSupportLanguageList('en'))
      .toBe('English, Simplified Chinese, and Traditional Chinese');
  });

  // Property, not just the pinned sentence above: the Russian regression this
  // branch fixes was ungrammatical because zh-Hans/zh-Hant CLDR names either
  // embed a comma ('dialect') or a FEMININE parenthetical
  // ('упрощенная'/'традиционная') sitting against the MASCULINE «китайский»
  // ('standard'). Asserting the shape means a future CLDR wording change that
  // still avoided the exact pinned string but reintroduced either failure
  // mode would still fail here.
  it('Russian output has no feminine parenthetical and no embedded separator', () => {
    const list = nativeSupportLanguageList('ru');
    expect(list).not.toMatch(/\(упрощенная\)|\(традиционная\)/);
    const names = resolveNativeSupportNames('ru');
    for (const name of names) {
      expect(name).not.toMatch(/[,،、]/);
    }
  });

  it('names three languages for every locale — one per supported locale', () => {
    const supportedCount = locales.filter(hasNativeSupport).length;
    expect(supportedCount).toBe(3);
    for (const loc of locales) {
      expect(nativeSupportLanguageList(loc).length).toBeGreaterThan(0);
    }
  });

  it('never leaks a raw BCP 47 tag into the prose', () => {
    for (const loc of locales) {
      const list = nativeSupportLanguageList(loc);
      expect(list).not.toContain('zh-Hans');
      expect(list).not.toContain('zh-Hant');
    }
  });

  // The invariant, not just the Russian string: a generated name that itself
  // contains a list-separator character is indistinguishable from a boundary
  // between two list items once Intl.ListFormat joins everything together
  // (this is exactly what went wrong for Russian's 'dialect' zh-Hans/zh-Hant
  // names, which contain a comma). Asserting the invariant for every locale
  // — not just 'ru' — means a future CLDR change tripping this in some other
  // locale fails loudly here instead of shipping an ambiguous sentence.
  it('never generates a language name containing a list separator', () => {
    for (const loc of locales) {
      const names = resolveNativeSupportNames(loc);
      for (const name of names) {
        expect(name).not.toMatch(/[,،、]/);
      }
    }
  });
});

describe('ICU failure path', () => {
  it('falls back to endonyms instead of throwing when Intl.DisplayNames is unavailable', () => {
    const original = Intl.DisplayNames;
    // @ts-expect-error — deliberately breaking Intl to exercise the catch branch
    delete Intl.DisplayNames;
    try {
      expect(() => nativeSupportLanguageList('pa' as Locale)).not.toThrow();
      expect(nativeSupportLanguageList('pa' as Locale)).toBe('English, 简体中文, 繁體中文');
      expect(localeSelfName('pa' as Locale)).toBe('ਪੰਜਾਬੀ');
    } finally {
      Intl.DisplayNames = original;
    }
  });
});
