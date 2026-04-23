import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import NearMePage from '@/components/pages/NearMePage';
import { BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME } from '@/lib/utils';
import { getServiceAreasFromDb } from '@/lib/db/queries';

interface PageProps { params: Promise<{ locale: string }>; }
export const revalidate = 86400;
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const title = isZh ? '附近卫浴装修 | 大温哥华 | Reno Stars' : 'Bathroom Renovation Near Me | Vancouver Metro | Reno Stars';
  const description = isZh
    ? '大温哥华附近专业卫浴装修：淋浴房改造、浴缸更换、瓷砖墙面、洗手柜。$15K-$45K，3-6周完工。70+五星好评，免费估价。'
    : 'Bathroom renovation near you in Vancouver, Richmond, Burnaby & 14+ Metro Vancouver cities. Walk-in showers, tub conversions, custom vanities. $15K-$45K, 3-6 wks. 3-yr warranty, $5M insured. Free quote.';
  const baseUrl = getBaseUrl();
  return {
    title, description,
    alternates: buildAlternates('/bathroom-renovation-near-me/', locale),
    openGraph: { title, description, url: `${baseUrl}/${locale}/bathroom-renovation-near-me/`, siteName: SITE_NAME, locale: ogLocaleMap[locale as Locale], type: 'website' },
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
    { name: locale === 'zh' ? '附近卫浴装修' : 'Bathroom Renovation Near Me', url: `/${locale}/bathroom-renovation-near-me/` },
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
