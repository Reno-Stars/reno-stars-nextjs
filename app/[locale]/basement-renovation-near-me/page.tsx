import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale, PRERENDERED_LOCALES } from '@/i18n/config';
import NearMePage from '@/components/pages/NearMePage';
import { BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME } from '@/lib/utils';
import { getServiceAreasFromDb } from '@/lib/db/queries';

interface PageProps { params: Promise<{ locale: string }>; }
export const revalidate = 2592000; // 30d — Vercel ISR write reduction
export function generateStaticParams() { return PRERENDERED_LOCALES.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const title = isZh ? '附近地下室装修 | 大温哥华 | Reno Stars' : 'Basement Renovation Near Me | Vancouver Metro | Reno Stars';
  const description = isZh
    ? '大温哥华附近专业地下室装修：suite改造、家庭影院、活动室。$35K-$130K+，8-16周。许可证代办，防水保障。免费估价。'
    : 'Basement renovation near you in Metro Vancouver. Legal suites, family rooms, home theatres. $35K-$130K+, 8-16 wks. Permits handled, 3-yr warranty, $5M insured. Free quote.';
  const baseUrl = getBaseUrl();
  return {
    title, description,
    alternates: buildAlternates('/basement-renovation-near-me/', locale),
    openGraph: { title, description, url: `${baseUrl}/${locale}/basement-renovation-near-me/`, siteName: SITE_NAME, locale: ogLocaleMap[locale as Locale], type: 'website' },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [nav, t, areas] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'nearMe' }),
    getServiceAreasFromDb(),
  ]);
  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: locale === 'zh' ? '附近地下室装修' : 'Basement Renovation Near Me', url: `/${locale}/basement-renovation-near-me/` },
  ];
  const faqs = Array.from({ length: 6 }).map((_, i) => ({ question: t(`faq.q${i + 1}`), answer: t(`faq.a${i + 1}`) }));
  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <NearMePage locale={locale as Locale} areas={areas} />
    </>
  );
}
