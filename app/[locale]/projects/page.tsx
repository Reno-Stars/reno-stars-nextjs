import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import ProjectsPage from '@/components/pages/ProjectsPage';
import { BreadcrumbSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME } from '@/lib/utils';
import { getCompanyFromDb, getProjectsFromDb, getSitesAsProjectsFromDb, getCategoriesLocalized } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.projects' });

  const baseUrl = getBaseUrl();
  const ogImage = buildOgImageUrl(t('title'));

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

  const [t, faqT, company, projects, sitesAsProjects, categories] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'projectsFaqs' }),
    getCompanyFromDb(),
    getProjectsFromDb(),
    getSitesAsProjectsFromDb(),
    getCategoriesLocalized(),
  ]);
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('projects'), url: `/${locale}/projects/` },
  ];

  const faqs = [
    { question: faqT('q1'), answer: faqT('a1') },
    { question: faqT('q2'), answer: faqT('a2') },
    { question: faqT('q3'), answer: faqT('a3') },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <ProjectsPage locale={locale as Locale} company={company} projects={projects} sitesAsProjects={sitesAsProjects} categories={categories} />
    </>
  );
}
