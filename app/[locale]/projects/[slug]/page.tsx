import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getCategoriesLocalized, CATEGORY_SLUGS, getLocalizedProject } from '@/lib/data/projects';
import ProjectDetailPage from '@/components/pages/ProjectDetailPage';
import ProjectCategoryPage from '@/components/pages/ProjectCategoryPage';
import { BreadcrumbSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getProjectsFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getProjectsFromDb();
  const projectParams = projects.flatMap((p) =>
    locales.map((locale) => ({ locale, slug: p.slug }))
  );
  const categoryParams = CATEGORY_SLUGS.flatMap((slug) =>
    locales.map((locale) => ({ locale, slug }))
  );
  return [...categoryParams, ...projectParams];
}

function isCategory(slug: string): boolean {
  return CATEGORY_SLUGS.includes(slug);
}

function findCategoryBySlug(slug: string) {
  const categories = getCategoriesLocalized();
  return categories.find((c) => c.en.toLowerCase().replace(/\s+/g, '-') === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const baseUrl = getBaseUrl();

  // Check if it's a category page
  if (isCategory(slug)) {
    const categoryData = findCategoryBySlug(slug);

    if (!categoryData) {
      return { title: 'Category Not Found', robots: { index: false, follow: false } };
    }

    const categoryName = categoryData[locale as Locale];
    const t = await getTranslations({ locale, namespace: 'metadata.projectCategory' });

    const title = t('title', { category: categoryName });
    const description = t('description', { category: categoryName });

    return {
      title,
      description,
      alternates: buildAlternates(`/projects/${slug}/`, locale),
      openGraph: {
        title,
        description,
        url: `${baseUrl}/${locale}/projects/${slug}/`,
        siteName: SITE_NAME,
        locale: ogLocaleMap[locale as Locale],
        type: 'website',
        images: [{ url: siteImages.hero }],
      },
    };
  }

  // It's a project detail page — uses getProjectsFromDb (deduped via React cache with Page)
  const allProjects = await getProjectsFromDb();
  const project = allProjects.find((p) => p.slug === slug);

  if (!project) {
    return { title: 'Project Not Found', robots: { index: false, follow: false } };
  }

  const localizedProject = getLocalizedProject(project, locale as Locale);

  return {
    title: `${localizedProject.title} | ${SITE_NAME}`,
    description: localizedProject.description,
    alternates: buildAlternates(`/projects/${slug}/`, locale),
    openGraph: {
      title: `${localizedProject.title} | ${SITE_NAME}`,
      description: localizedProject.description,
      url: `${baseUrl}/${locale}/projects/${slug}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      type: 'article',
      images: [{ url: project.hero_image }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, company, allProjects] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getCompanyFromDb(),
    getProjectsFromDb(),
  ]);

  // Check if it's a category page
  if (isCategory(slug)) {
    const categoryData = findCategoryBySlug(slug);
    if (!categoryData) notFound();
    const categoryName = categoryData[locale as Locale];

    const breadcrumbs = [
      { name: t('home'), url: `/${locale}/` },
      { name: t('projects'), url: `/${locale}/projects/` },
      { name: categoryName || slug, url: `/${locale}/projects/${slug}/` },
    ];

    return (
      <>
        <BreadcrumbSchema items={breadcrumbs} />
        <ProjectCategoryPage locale={locale as Locale} categorySlug={slug} company={company} projects={allProjects} />
      </>
    );
  }

  // It's a project detail page
  const project = allProjects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('projects'), url: `/${locale}/projects/` },
    { name: project.title[locale as Locale], url: `/${locale}/projects/${slug}/` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ProjectDetailPage locale={locale as Locale} project={project} allProjects={allProjects} company={company} />
    </>
  );
}
