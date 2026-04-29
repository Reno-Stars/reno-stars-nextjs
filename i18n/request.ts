import { getRequestConfig } from 'next-intl/server';
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

  return {
    locale,
    messages: await loadMessages(locale as Locale),
  };
});
