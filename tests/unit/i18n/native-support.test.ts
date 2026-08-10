import { describe, it, expect } from 'vitest';
import { locales, LOCALE_META, hasNativeSupport } from '@/i18n/config';

// nativeSupport is a STAFFING fact, not a translation-quality one. All 14
// locales are fully translated and all 14 are indexed — but Reno Stars staffs
// English, Mandarin and Cantonese only. Hiring is under way; when someone
// joins, their row flips here and the contact-page notice follows.

const SUPPORTED = ['en', 'zh', 'zh-Hant'];

describe('hasNativeSupport', () => {
  it('is true for exactly English, Simplified and Traditional Chinese', () => {
    const supported = locales.filter((loc) => LOCALE_META[loc].nativeSupport);
    expect([...supported].sort()).toEqual([...SUPPORTED].sort());
  });

  it('agrees with the field for all 14 locales', () => {
    for (const loc of locales) {
      expect(hasNativeSupport(loc)).toBe(SUPPORTED.includes(loc));
    }
  });

  it('leaves 11 locales needing the contact-page notice', () => {
    expect(locales.filter((loc) => !hasNativeSupport(loc))).toHaveLength(11);
  });
});
