import { describe, it, expect } from 'vitest';
import { buildAlternateLocales } from '@/lib/utils';
import { locales, ogLocaleMap, hasNativeSupport, INDEXABLE_LEAF_LOCALES, type Locale } from '@/i18n/config';

// `og:locale:alternate` is a CONTENT-AVAILABILITY signal: it tells crawlers which
// translations of this page exist. It is NOT a staffing signal.
//
// Those two facts live one field apart in LOCALE_META and were conflated once, on
// 2026-08-13, by a change that filtered this function on `nativeSupport` — the flag
// that records which languages a human can *speak*. That would have told crawlers
// that 11 real, indexed translations do not exist.
//
// It typechecked, and this function had no test, so CI was green and the only thing
// standing between it and main was a reviewer noticing the semantics. This file is
// that gate.
//
// The rule:
//   nativeSupport          -> who can talk to a customer (3 locales)
//   INDEXABLE_LEAF_LOCALES -> which translations exist and are indexed (all 14)
// Anything crawler-facing about translations belongs to the second.

describe('buildAlternateLocales — content availability, not staffing', () => {
  it('returns every locale except the current one', () => {
    for (const current of locales) {
      const got = buildAlternateLocales(current);
      expect(got).toHaveLength(locales.length - 1);
      expect(got).not.toContain(ogLocaleMap[current]);
    }
  });

  it('is NOT filtered by nativeSupport — the 2026-08-13 regression', () => {
    const got = buildAlternateLocales('en');
    const unstaffed = locales.filter((l) => l !== 'en' && !hasNativeSupport(l));

    // Every unstaffed locale is still a real, indexed translation and must be advertised.
    expect(unstaffed.length).toBeGreaterThan(0);
    for (const l of unstaffed) {
      expect(got).toContain(ogLocaleMap[l]);
    }
  });

  it('advertises exactly the indexable translations', () => {
    // If a locale is indexable, crawlers can reach that translation, so og:locale:alternate
    // must not contradict the sitemap and hreflang by omitting it.
    const got = buildAlternateLocales('en');
    const expected = INDEXABLE_LEAF_LOCALES.filter((l) => l !== 'en').map((l) => ogLocaleMap[l]);
    expect([...got].sort()).toEqual([...expected].sort());
  });

  it('emits valid OG codes, never raw BCP-47 tags', () => {
    // og:locale wants zh_CN, not zh-Hant — a raw tag here is silently wrong.
    for (const code of buildAlternateLocales('en')) {
      expect(code).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    }
  });

  it('agrees with hreflang: both derive from the indexable set, not the staffed set', () => {
    const staffed = locales.filter(hasNativeSupport);
    const advertised = buildAlternateLocales('en');
    // Guard the specific failure shape: advertising only the staffed set.
    const staffedOnly = staffed.filter((l) => l !== 'en').map((l: Locale) => ogLocaleMap[l]);
    expect([...advertised].sort()).not.toEqual([...staffedOnly].sort());
  });
});
