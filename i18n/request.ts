import { getRequestConfig } from 'next-intl/server';
import { IntlErrorCode } from 'next-intl';
import { locales, defaultLocale, type Locale } from './config';
import { namespaces } from './namespaces';
import { guideSections } from './guideSections';

// Module-level cache: each Lambda instance pays the dynamic-import cost
// once per locale, then serves subsequent requests from the in-memory
// promise. Cuts warm-request i18n load from ~1ms to ~0.
const messageCache = new Map<Locale, Promise<Record<string, unknown>>>();

async function loadMessagesUncached(locale: Locale): Promise<Record<string, unknown>> {
  const merged: Record<string, unknown> = {};
  await Promise.all(
    namespaces.map(async (ns) => {
      const mod = (await import(`../messages/${locale}/${ns}.json`)) as {
        default: Record<string, unknown>;
      };
      Object.assign(merged, mod.default);
    }),
  );
  // `guides` is split into per-section files under messages/<locale>/guides/
  // — load each, then merge under merged.guides so existing consumers like
  // `useTranslations('guides.kitchenCost')` keep working unchanged.
  const guidesMerged: Record<string, unknown> = {};
  await Promise.all(
    guideSections.map(async (section) => {
      const mod = (await import(`../messages/${locale}/guides/${section}.json`)) as {
        default: Record<string, unknown>;
      };
      Object.assign(guidesMerged, mod.default);
    }),
  );
  merged.guides = guidesMerged;
  return merged;
}

function loadMessages(locale: Locale): Promise<Record<string, unknown>> {
  let p = messageCache.get(locale);
  if (!p) {
    p = loadMessagesUncached(locale);
    messageCache.set(locale, p);
  }
  return p;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  const messages = await loadMessages(locale as Locale);
  // EN is the source of truth for keys. Non-EN locales can lag on newly-added
  // keys, and a single missing key must NOT throw — that hard-crashed the
  // all-locale prerender build (`MISSING_MESSAGE: costGuidesSection (fa)`).
  // Fall back to the EN string instead. Both message sets are cached, so the
  // extra lookup costs nothing on warm requests.
  const fallbackMessages =
    locale === defaultLocale ? messages : await loadMessages(defaultLocale);

  return {
    locale,
    messages,
    // A missing translation is non-fatal — getMessageFallback serves EN below.
    // Every other intl error (bad ICU syntax, format failure) stays fatal so
    // real bugs still surface in dev and at build time.
    onError(error) {
      if (error.code === IntlErrorCode.MISSING_MESSAGE) return;
      throw error;
    },
    getMessageFallback({ namespace, key }) {
      const path = namespace ? `${namespace}.${key}` : key;
      const enValue = path
        .split('.')
        .reduce<unknown>(
          (node, part) =>
            node && typeof node === 'object'
              ? (node as Record<string, unknown>)[part]
              : undefined,
          fallbackMessages,
        );
      // EN string if we have it (ICU args still interpolate), else the key path.
      return typeof enValue === 'string' ? enValue : path;
    },
  };
});
