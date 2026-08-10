import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { locales, hasNativeSupport } from '@/i18n/config';

// Override the global tests/setup.ts mock (`useTranslations: () => (key) => key`,
// which discards its second argument) for THIS file only, so we can prove the
// component passes `language`/`supported` straight through to t() rather than
// recomputing them. Still an identity-style mock — it does not format the ICU
// sentence — it just makes the params visible in the output for assertion.
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) =>
    params ? `${key}::${JSON.stringify(params)}` : key,
  useLocale: () => 'en',
}));

const { default: LanguageSupportNotice } = await import('@/components/LanguageSupportNotice');

// renderToStaticMarkup + a locale PROP, matching ZhTrustSignals.test.tsx:
// tests/setup.ts mocks useLocale() to always return 'en', so a component that
// read its own locale from the hook could not be tested per-locale at all.
//
// That same setup mocks useTranslations to the identity function (key => key),
// so the rendered text is the message KEY, not the formatted sentence. This
// file therefore asserts render-vs-null and the structural/RTL properties;
// the sentence's content is covered by language-names.test.ts and its ICU
// validity by message-icu.test.ts.
//
// `language`/`supported` are passed in as props here — a real browser found
// that formatting them *inside* this client component produces raw BCP-47
// tags for some locales (Intl.DisplayNames/ListFormat coverage is
// inconsistent across browser ICU builds, verified for `pa`). They must be
// resolved server-side (Node's full ICU) and threaded down as plain strings,
// which is what these fixed test values stand in for.
const LANGUAGE = 'ਪੰਜਾਬੀ';
const SUPPORTED_TEXT = 'English, 简体中文, and 繁體中文';

const SUPPORTED = locales.filter(hasNativeSupport);
const NEEDS_NOTICE = locales.filter((loc) => !hasNativeSupport(loc));

describe('LanguageSupportNotice', () => {
  it.each(SUPPORTED)('renders nothing for %s — the team speaks it', (loc) => {
    expect(
      renderToStaticMarkup(
        <LanguageSupportNotice locale={loc} language={LANGUAGE} supported={SUPPORTED_TEXT} />,
      ),
    ).toBe('');
  });

  it.each(NEEDS_NOTICE)('renders the notice for %s', (loc) => {
    const html = renderToStaticMarkup(
      <LanguageSupportNotice locale={loc} language={LANGUAGE} supported={SUPPORTED_TEXT} />,
    );
    expect(html).not.toBe('');
    expect(html).toContain('languageSupportNotice');
  });

  it('covers exactly 11 locales', () => {
    expect(NEEDS_NOTICE).toHaveLength(11);
  });

  it('renders exactly the language/supported strings it is given, not a recomputed value', () => {
    // Proves the component is a pure renderer of its props — it must not
    // recompute these via Intl.DisplayNames/ListFormat itself.
    const html = renderToStaticMarkup(
      <LanguageSupportNotice locale="pa" language={LANGUAGE} supported={SUPPORTED_TEXT} />,
    );
    expect(html).toContain(LANGUAGE);
    expect(html).toContain(SUPPORTED_TEXT);
  });

  it('uses borderInlineStart so the accent bar flips in RTL', () => {
    // fa and ar both see this notice and both render right-to-left. A
    // hardcoded borderLeft would put the bar on the wrong edge for them.
    const html = renderToStaticMarkup(
      <LanguageSupportNotice locale="fa" language={LANGUAGE} supported={SUPPORTED_TEXT} />,
    );
    expect(html).toContain('border-inline-start');
    expect(html).not.toMatch(/border-left/);
  });

  it('passes through an extra className', () => {
    const html = renderToStaticMarkup(
      <LanguageSupportNotice
        locale="ko"
        language={LANGUAGE}
        supported={SUPPORTED_TEXT}
        className="mb-6"
      />,
    );
    expect(html).toContain('mb-6');
  });

  it('does not import @/lib/i18n/language-names — formatting must happen server-side', () => {
    // Regression guard for the bug where this client component called
    // localeSelfName()/nativeSupportLanguageList() during render: browser
    // Intl.DisplayNames/Intl.ListFormat coverage varies by engine/OS build
    // and silently mis-resolved for `pa` (DisplayNames.of('en') → the raw
    // string 'en'; ListFormat('pa') resolved to 'en-US'). Those must be
    // resolved in the Server Component and passed in as plain string props.
    const source = readFileSync(
      join(__dirname, '../../../components/LanguageSupportNotice.tsx'),
      'utf-8',
    );
    expect(source).not.toMatch(/from ['"]@\/lib\/i18n\/language-names['"]/);
    expect(source).not.toMatch(/localeSelfName|nativeSupportLanguageList/);
  });
});
