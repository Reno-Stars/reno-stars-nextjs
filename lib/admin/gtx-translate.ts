import type { Locale } from '@/i18n/config';
import { BRAND } from '@/lib/company-config';

/**
 * Locale → Google Translate locale code. Google uses 'zh-CN' for Simplified
 * and 'zh-TW' for Traditional; everything else passes through.
 */
const GTX_LANG: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-CN',
  'zh-Hant': 'zh-TW',
  ja: 'ja',
  ko: 'ko',
  es: 'es',
  pa: 'pa',
  tl: 'tl',
  fa: 'fa',
  vi: 'vi',
  ru: 'ru',
  ar: 'ar',
  hi: 'hi',
  fr: 'fr',
};

/**
 * Translate `text` from `source` to `target` via Google's free gtx endpoint.
 * No API key required. Same call pattern as scripts/translate-*.ts —
 * polite-sleep on 5xx, three retries.
 */
/**
 * Brand / do-not-translate glossary. Machine translation mangles the brand
 * (里诺明星, リノスターズ, Cyrillic "Reno Starsс"…) — protect these verbatim.
 * Longest-first so "Reno Stars Construction Inc." is masked before "Reno Stars".
 */
const DO_NOT_TRANSLATE = [
  `${BRAND} Construction Inc.`,
  `${BRAND} Construction`,
  BRAND,
];
// Word-joiner-delimited sentinel MT leaves untouched (no spaces/letters to translate).
const mask = (i: number) => `\u2060RS${i}\u2060`;

function protectGlossary(text: string): { masked: string; restore: (s: string) => string } {
  let masked = text;
  const used: number[] = [];
  DO_NOT_TRANSLATE.forEach((term, i) => {
    if (masked.includes(term)) {
      masked = masked.split(term).join(mask(i));
      used.push(i);
    }
  });
  const restore = (s: string) => {
    let out = s;
    for (const i of used) out = out.split(mask(i)).join(DO_NOT_TRANSLATE[i]);
    return out;
  };
  return { masked, restore };
}

export async function gtxTranslate(
  text: string,
  target: Locale,
  source: Locale = 'en',
): Promise<string> {
  if (!text.trim()) return '';
  if (target === source) return text;

  const { masked, restore } = protectGlossary(text);

  const url =
    'https://translate.googleapis.com/translate_a/single?' +
    new URLSearchParams({
      client: 'gtx',
      sl: GTX_LANG[source],
      tl: GTX_LANG[target],
      dt: 't',
      q: masked,
    }).toString();

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) {
        await new Promise((s) => setTimeout(s, 1500 * (attempt + 1)));
        continue;
      }
      const data = (await r.json()) as Array<Array<[string, ...unknown[]]>>;
      return restore(data[0].map((c) => c[0]).join(''));
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise((s) => setTimeout(s, 1500 * (attempt + 1)));
    }
  }
  throw new Error('exhausted retries');
}
