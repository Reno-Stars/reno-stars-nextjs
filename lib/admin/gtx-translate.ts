import type { Locale } from '@/i18n/config';

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
export async function gtxTranslate(
  text: string,
  target: Locale,
  source: Locale = 'en',
): Promise<string> {
  if (!text.trim()) return '';
  if (target === source) return text;

  const url =
    'https://translate.googleapis.com/translate_a/single?' +
    new URLSearchParams({
      client: 'gtx',
      sl: GTX_LANG[source],
      tl: GTX_LANG[target],
      dt: 't',
      q: text,
    }).toString();

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) {
        await new Promise((s) => setTimeout(s, 1500 * (attempt + 1)));
        continue;
      }
      const data = (await r.json()) as Array<Array<[string, ...unknown[]]>>;
      return data[0].map((c) => c[0]).join('');
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise((s) => setTimeout(s, 1500 * (attempt + 1)));
    }
  }
  throw new Error('exhausted retries');
}
