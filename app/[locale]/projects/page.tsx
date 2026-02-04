import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import ProjectsPage from '@/components/pages/ProjectsPage';
import { BreadcrumbSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getProjectsFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.projects' });

  const baseUrl = getBaseUrl();

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/projects/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/projects/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      type: 'website',
      images: [{ url: siteImages.hero }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, company, projects] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getCompanyFromDb(),
    getProjectsFromDb(),
  ]);
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('projects'), url: `/${locale}/projects/` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ProjectsPage locale={locale as Locale} company={company} projects={projects} />
    </>
  );
}
