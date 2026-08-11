import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// zh-Hant/nearMe.json previously shipped five keys with untouched English
// values (hero.h1, why.point4.title, why.point5.title, faq.heading,
// services.cabinet.desc). The zh-Hant → zh fallback in i18n/request.ts never
// fires for these because the keys DO exist in the zh-Hant file — they just
// hold English text — so a Traditional Chinese visitor got an English H1
// over an otherwise-Chinese page.
//
// This asserts the PROPERTY (no leftover English), not the five known keys,
// so it keeps working as the file grows. A leaf is "untranslated" only if it
// is pure ASCII AND contains an actual English word (a 2+ letter run) AND is
// byte-identical to the EN source — that rules out legitimate Latin-only
// values that are correct in both languages on purpose, e.g. the numeric
// stats "20+" / "14" (no letters at all, so no word run) and "5.0★" (not
// pure ASCII). A brand name or URL that's intentionally identical across
// locales would only be flagged if it also contains an English word AND
// matches EN exactly — inspect any new failure before assuming it's a bug.

const EN_PATH = 'messages/en/nearMe.json';
const ZH_HANT_PATH = 'messages/zh-Hant/nearMe.json';

/** True if every character is in the 7-bit ASCII range (no CJK/other scripts). */
function isPureAscii(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) > 127) return false;
  }
  return true;
}

/** Pure ASCII (no CJK/other scripts) and contains a real word, not just digits/symbols. */
function looksLikeUntranslatedEnglish(value: string): boolean {
  const hasEnglishWord = /[A-Za-z]{2,}/.test(value);
  return isPureAscii(value) && hasEnglishWord;
}

function collectUntranslatedLeaves(
  enNode: unknown,
  translatedNode: unknown,
  path: string,
  out: string[],
): void {
  if (typeof enNode === 'string') {
    if (
      typeof translatedNode === 'string' &&
      translatedNode === enNode &&
      looksLikeUntranslatedEnglish(translatedNode)
    ) {
      out.push(`${path}: "${translatedNode}"`);
    }
    return;
  }
  if (enNode && typeof enNode === 'object' && !Array.isArray(enNode)) {
    const translatedObj =
      translatedNode && typeof translatedNode === 'object' && !Array.isArray(translatedNode)
        ? (translatedNode as Record<string, unknown>)
        : {};
    for (const [key, enChild] of Object.entries(enNode as Record<string, unknown>)) {
      collectUntranslatedLeaves(enChild, translatedObj[key], path ? `${path}.${key}` : key, out);
    }
  }
}

describe('zh-Hant/nearMe.json has no untranslated English values', () => {
  it('every leaf differs from EN, or is a legitimate non-word value shared across locales', () => {
    const en = JSON.parse(readFileSync(EN_PATH, 'utf8'));
    const zhHant = JSON.parse(readFileSync(ZH_HANT_PATH, 'utf8'));

    const untranslated: string[] = [];
    // Scan only the `nearMe` content root — `_translation_meta` is
    // machine-generated bookkeeping (source/target locale codes, a tool
    // hostname, a tier label), not reader-facing copy, and is expected to be
    // plain ASCII in every locale.
    collectUntranslatedLeaves(en.nearMe, zhHant.nearMe, 'nearMe', untranslated);

    expect(
      untranslated,
      `zh-Hant/nearMe.json has ${untranslated.length} untranslated English value(s):\n  ${untranslated.join('\n  ')}`,
    ).toEqual([]);
  });
});
