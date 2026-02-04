import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localePrefix = 'always' as const;

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
};

export const ogLocaleMap: Record<Locale, string> = {
  en: 'en_US',
  zh: 'zh_CN',
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
});
