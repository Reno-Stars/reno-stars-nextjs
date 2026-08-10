import { describe, it, expect } from 'vitest';
import {
  locales, localeNames, ogLocaleMap, rtlLocales, isRtl,
  INDEXABLE_LEAF_LOCALES, isIndexableLeafLocale, PRERENDERED_LOCALES,
} from '@/i18n/config';
import { LOCALE_TO_SUFFIX, localeSuffix, fieldKey, isNativeLocale } from '@/lib/admin/locale-keys';
import { LOCALE_TO_DB_SUFFIX, pickLocale } from '@/lib/utils';
import { LOCALE_TARGETS } from '@/lib/share/matrix';
import { LOCALIZED_BRAND_NAMES, brandName, brandDisplay } from '@/lib/company-config';

// Characterization test for the LOCALE_META consolidation (2026-08-10).
//
// Every value below is the value these exports had BEFORE the refactor,
// transcribed as a literal. The refactor moves all of them into one table in
// i18n/config.ts and re-derives the exports; this file is the proof that the
// move changed nothing. It passed against the pre-refactor code, and it must
// keep passing after every step.
//
// If this fails during the refactor, the refactor is wrong. Do not edit the
// expectations to match new output — that defeats the entire purpose of the
// file. The only legitimate edit is ADDING coverage.
//
// Literals, deliberately, not toMatchSnapshot(): a snapshot regenerated
// mid-refactor silently blesses whatever the broken code produced.

describe('locales list', () => {
  it('is the 14 locales, en first', () => {
    expect(locales).toEqual([
      'en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa',
      'tl', 'fa', 'vi', 'ru', 'ar', 'hi', 'fr',
    ]);
  });
});

describe('localeNames', () => {
  it('matches the pre-refactor endonyms exactly', () => {
    expect(localeNames).toEqual({
      en: 'English',
      zh: '简体中文',
      'zh-Hant': '繁體中文',
      ja: '日本語',
      ko: '한국어',
      es: 'Español',
      pa: 'ਪੰਜਾਬੀ',
      tl: 'Tagalog',
      fa: 'فارسی',
      vi: 'Tiếng Việt',
      ru: 'Русский',
      ar: 'العربية',
      hi: 'हिन्दी',
      fr: 'Français',
    });
  });
});

describe('ogLocaleMap', () => {
  it('matches the pre-refactor og:locale codes exactly', () => {
    expect(ogLocaleMap).toEqual({
      en: 'en_US',
      zh: 'zh_CN',
      'zh-Hant': 'zh_TW',
      ja: 'ja_JP',
      ko: 'ko_KR',
      es: 'es_ES',
      pa: 'pa_IN',
      tl: 'tl_PH',
      fa: 'fa_IR',
      vi: 'vi_VN',
      ru: 'ru_RU',
      ar: 'ar_AE',
      hi: 'hi_IN',
      fr: 'fr_CA',
    });
  });
});

describe('writing direction', () => {
  it('rtlLocales is exactly fa and ar', () => {
    expect([...rtlLocales].sort()).toEqual(['ar', 'fa']);
  });

  it('isRtl agrees with rtlLocales for all 14', () => {
    for (const loc of locales) {
      expect(isRtl(loc)).toBe(loc === 'fa' || loc === 'ar');
    }
  });
});

describe('indexability', () => {
  it('all 14 leaf locales are indexable (opened 2026-08-07)', () => {
    expect([...INDEXABLE_LEAF_LOCALES].sort()).toEqual([...locales].sort());
  });

  it('isIndexableLeafLocale is true for all 14 and false for an unknown code', () => {
    for (const loc of locales) expect(isIndexableLeafLocale(loc)).toBe(true);
    expect(isIndexableLeafLocale('de')).toBe(false);
  });

  it('PRERENDERED_LOCALES is empty — the site is force-dynamic SSR', () => {
    expect([...PRERENDERED_LOCALES]).toEqual([]);
  });
});

describe('DB field suffixes', () => {
  it('LOCALE_TO_SUFFIX matches the pre-refactor map exactly', () => {
    expect(LOCALE_TO_SUFFIX).toEqual({
      en: 'En',
      zh: 'Zh',
      'zh-Hant': 'ZhHant',
      ja: 'Ja',
      ko: 'Ko',
      es: 'Es',
      pa: 'Pa',
      tl: 'Tl',
      fa: 'Fa',
      vi: 'Vi',
      ru: 'Ru',
      ar: 'Ar',
      hi: 'Hi',
      fr: 'Fr',
    });
  });

  it('localeSuffix and fieldKey are unchanged', () => {
    expect(localeSuffix('zh-Hant')).toBe('ZhHant');
    expect(fieldKey('title', 'ja')).toBe('titleJa');
    expect(fieldKey('description', 'zh-Hant')).toBe('descriptionZhHant');
    expect(fieldKey('title', 'en')).toBe('titleEn');
  });

  it('only en and zh have dedicated DB columns', () => {
    for (const loc of locales) {
      expect(isNativeLocale(loc)).toBe(loc === 'en' || loc === 'zh');
    }
  });

  it('LOCALE_TO_DB_SUFFIX covers the 12 jsonb locales and omits en/zh', () => {
    expect(LOCALE_TO_DB_SUFFIX).toEqual({
      'zh-Hant': 'ZhHant',
      ja: 'Ja',
      ko: 'Ko',
      es: 'Es',
      pa: 'Pa',
      tl: 'Tl',
      fa: 'Fa',
      vi: 'Vi',
      ru: 'Ru',
      ar: 'Ar',
      hi: 'Hi',
      fr: 'Fr',
    });
  });
});

describe('translation fallback chain (observable via pickLocale)', () => {
  it('zh-Hant falls back to zh before en', () => {
    expect(pickLocale({ en: 'EN', zh: 'ZH' }, 'zh-Hant')).toBe('ZH');
  });

  it('zh-Hant falls back to en when zh is absent', () => {
    expect(pickLocale({ en: 'EN' }, 'zh-Hant')).toBe('EN');
  });

  it('zh-Hant prefers its own value over the chain', () => {
    expect(pickLocale({ en: 'EN', zh: 'ZH', 'zh-Hant': 'HANT' }, 'zh-Hant')).toBe('HANT');
  });

  it('every other locale falls straight back to en', () => {
    for (const loc of locales) {
      if (loc === 'en' || loc === 'zh-Hant') continue;
      expect(pickLocale({ en: 'EN', zh: 'ZH' }, loc)).toBe(loc === 'zh' ? 'ZH' : 'EN');
    }
  });
});

describe('LOCALE_TARGETS — share platforms per locale, order significant', () => {
  it('matches the pre-refactor matrix exactly', () => {
    expect(LOCALE_TARGETS).toEqual({
      en: ['facebook', 'x', 'linkedin', 'pinterest', 'whatsapp', 'reddit', 'threads', 'bluesky', 'messenger', 'tumblr', 'sms'],
      fr: ['facebook', 'x', 'linkedin', 'whatsapp', 'pinterest', 'telegram', 'threads', 'messenger', 'sms'],
      es: ['whatsapp', 'facebook', 'x', 'messenger', 'telegram', 'pinterest', 'threads', 'sms'],
      tl: ['facebook', 'messenger', 'whatsapp', 'x', 'viber', 'telegram', 'pinterest', 'sms'],
      zh: ['wechat', 'weibo', 'qzone', 'x', 'facebook', 'line'],
      'zh-Hant': ['wechat', 'line', 'facebook', 'x', 'weibo', 'threads', 'telegram'],
      ja: ['line', 'x', 'facebook', 'threads', 'pinterest', 'tumblr'],
      ko: ['x', 'facebook', 'line', 'threads', 'pinterest'],
      hi: ['whatsapp', 'facebook', 'telegram', 'x', 'messenger', 'pinterest', 'sms'],
      pa: ['whatsapp', 'facebook', 'telegram', 'x', 'messenger', 'pinterest', 'sms'],
      ar: ['whatsapp', 'telegram', 'facebook', 'x', 'viber', 'pinterest', 'sms'],
      fa: ['whatsapp', 'telegram', 'facebook', 'x', 'viber', 'pinterest', 'sms'],
      ru: ['telegram', 'vk', 'whatsapp', 'viber', 'x', 'facebook'],
      vi: ['facebook', 'zalo', 'messenger', 'telegram', 'x', 'viber', 'pinterest'],
    });
  });

  it('covers every locale', () => {
    expect(Object.keys(LOCALE_TARGETS).sort()).toEqual([...locales].sort());
  });
});

describe('localized brand names', () => {
  it('only zh and zh-Hant have one', () => {
    expect(LOCALIZED_BRAND_NAMES).toEqual({
      zh: '聚星装修',
      'zh-Hant': '聚星裝修',
    });
  });

  it('brandName falls back to the English brand', () => {
    expect(brandName('zh')).toBe('聚星装修');
    expect(brandName('zh-Hant')).toBe('聚星裝修');
    expect(brandName('en')).toBe('Reno Stars');
    expect(brandName('ko')).toBe('Reno Stars');
  });

  it('brandDisplay surfaces both names — owner rule 2026-07-09', () => {
    expect(brandDisplay('zh')).toBe('聚星装修 (Reno Stars)');
    expect(brandDisplay('zh-Hant')).toBe('聚星裝修 (Reno Stars)');
    expect(brandDisplay('en')).toBe('Reno Stars');
  });
});
