import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './config';
import { namespaces } from './namespaces';

async function loadMessages(locale: Locale): Promise<Record<string, unknown>> {
  const merged: Record<string, unknown> = {};
  await Promise.all(
    namespaces.map(async (ns) => {
      const mod = (await import(`../messages/${locale}/${ns}.json`)) as {
        default: Record<string, unknown>;
      };
      Object.assign(merged, mod.default);
    }),
  );
  return merged;
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
