import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale, PRERENDERED_LOCALES } from '@/i18n/config';
import ProjectsPage from '@/components/pages/ProjectsPage';
import { BreadcrumbSchema, FAQSchema, ItemListSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales, pickLocale } from '@/lib/utils';
import { getCompanyFromDb, getProjectsListFromDb, getSitesAsProjectsFromDb, getCategoriesLocalized } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
}


export function generateStaticParams() {
  return PRERENDERED_LOCALES.map((locale) => ({ locale }));
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
      alternateLocale: buildAlternateLocales(locale as Locale),
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

export default async function Page({ params, searchParams }: PageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const [t, faqT, company, projects, sitesAsProjects, categories] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'projectsFaqs' }),
    getCompanyFromDb(),
    getProjectsListFromDb(),
    getSitesAsProjectsFromDb(),
    getCategoriesLocalized(),
  ]);

  // Validate searchParam against known categories (whitelist) before passing to client
  const requestedService = resolvedSearchParams.service;
  const initialService = categories.some((c) => c.serviceType === requestedService)
    ? requestedService
    : undefined;

  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('projects'), url: `/${locale}/projects/` },
  ];

  const faqs = [
    { question: faqT('q1'), answer: faqT('a1') },
    { question: faqT('q2'), answer: faqT('a2') },
    { question: faqT('q3'), answer: faqT('a3') },
  ];

  const loc = locale as Locale;
  const itemListItems = projects.map((p) => ({
    name: pickLocale(p.title, loc),
    url: `/${locale}/projects/${p.slug}/`,
    image: p.hero_image || p.images?.[0]?.src,
  }));

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />
      <ItemListSchema
        items={itemListItems}
        name={`${company.name} — Renovation Projects`}
        description={`${itemListItems.length} completed renovation projects across Metro Vancouver — kitchens, bathrooms, basements and whole-house remodels.`}
      />
      <ProjectsPage locale={locale as Locale} company={company} projects={projects} sitesAsProjects={sitesAsProjects} categories={categories} initialService={initialService} />
    </>
  );
}
