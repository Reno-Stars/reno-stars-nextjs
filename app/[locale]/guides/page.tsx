import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import GuidesIndexPage from '@/components/pages/GuidesIndexPage';
import { BreadcrumbSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME } from '@/lib/utils';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 86400; // 24h

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.guides' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'), t('description'));

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/guides/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/guides/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: locale === 'en' ? ['zh_CN'] : ['en_US'],
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: t('title') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [{ url: ogImage, alt: t('title') }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const nav = await getTranslations({ locale, namespace: 'nav' });

  const breadcrumbs = [
    { name: nav('home'), url: `/${locale}/` },
    { name: nav('guides'), url: `/${locale}/guides/` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <GuidesIndexPage locale={locale as Locale} />
    </>
  );
}
