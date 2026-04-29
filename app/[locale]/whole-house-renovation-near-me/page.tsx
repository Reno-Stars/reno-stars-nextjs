import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import NearMePage from '@/components/pages/NearMePage';
import { BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME } from '@/lib/utils';
import { getServiceAreasFromDb } from '@/lib/db/queries';

interface PageProps { params: Promise<{ locale: string }>; }
export const revalidate = 604800; // 7d — Vercel quota optimization
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const title = isZh ? '附近全屋翻新 | 大温哥华 | Reno Stars' : 'Whole House Renovation Near Me | Vancouver Metro | Reno Stars';
  const description = isZh
    ? '大温哥华附近全屋翻新：厨房+卫浴+地板+油漆+照明一站式装修。$80K-$400K+，2-6个月。$500万保险，免费估价。'
    : 'Whole house renovation near you in Metro Vancouver. Kitchen + bath + flooring + paint + lighting — one team, one timeline. $80K-$400K+, 2-6 months. Free quotes.';
  const baseUrl = getBaseUrl();
  return {
    title, description,
    alternates: buildAlternates('/whole-house-renovation-near-me/', locale),
    openGraph: { title, description, url: `${baseUrl}/${locale}/whole-house-renovation-near-me/`, siteName: SITE_NAME, locale: ogLocaleMap[locale as Locale], type: 'website' },
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
    { name: locale === 'zh' ? '附近全屋翻新' : 'Whole House Renovation Near Me', url: `/${locale}/whole-house-renovation-near-me/` },
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
