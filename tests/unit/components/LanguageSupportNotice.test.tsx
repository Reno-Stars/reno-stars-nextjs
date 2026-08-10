import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import LanguageSupportNotice from '@/components/LanguageSupportNotice';
import { locales, hasNativeSupport } from '@/i18n/config';

// renderToStaticMarkup + a locale PROP, matching ZhTrustSignals.test.tsx:
// tests/setup.ts mocks useLocale() to always return 'en', so a component that
// read its own locale from the hook could not be tested per-locale at all.
//
// That same setup mocks useTranslations to the identity function (key => key),
// so the rendered text is the message KEY, not the formatted sentence. This
// file therefore asserts render-vs-null and the structural/RTL properties;
// the sentence's content is covered by language-names.test.ts and its ICU
// validity by message-icu.test.ts.

const SUPPORTED = locales.filter(hasNativeSupport);
const NEEDS_NOTICE = locales.filter((loc) => !hasNativeSupport(loc));

describe('LanguageSupportNotice', () => {
  it.each(SUPPORTED)('renders nothing for %s — the team speaks it', (loc) => {
    expect(renderToStaticMarkup(<LanguageSupportNotice locale={loc} />)).toBe('');
  });

  it.each(NEEDS_NOTICE)('renders the notice for %s', (loc) => {
    const html = renderToStaticMarkup(<LanguageSupportNotice locale={loc} />);
    expect(html).not.toBe('');
    expect(html).toContain('languageSupportNotice');
  });

  it('covers exactly 11 locales', () => {
    expect(NEEDS_NOTICE).toHaveLength(11);
  });

  it('uses borderInlineStart so the accent bar flips in RTL', () => {
    // fa and ar both see this notice and both render right-to-left. A
    // hardcoded borderLeft would put the bar on the wrong edge for them.
    const html = renderToStaticMarkup(<LanguageSupportNotice locale="fa" />);
    expect(html).toContain('border-inline-start');
    expect(html).not.toMatch(/border-left/);
  });

  it('passes through an extra className', () => {
    const html = renderToStaticMarkup(<LanguageSupportNotice locale="ko" className="mb-6" />);
    expect(html).toContain('mb-6');
  });
});
