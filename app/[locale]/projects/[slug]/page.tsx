import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getProjectBySlug, getProjects, getLocalizedProject, getCategoriesLocalized, CATEGORY_SLUGS } from '@/lib/data/projects';
import ProjectDetailPage from '@/components/pages/ProjectDetailPage';
import ProjectCategoryPage from '@/components/pages/ProjectCategoryPage';
import { BreadcrumbSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function isCategory(slug: string): boolean {
  return CATEGORY_SLUGS.includes(slug);
}

export function generateStaticParams() {
  const projects = getProjects();
  const categories = getCategoriesLocalized();
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    // Add category slugs
    for (const cat of categories) {
      if (cat.en !== 'All') {
        const slug = cat.en.toLowerCase().replace(/\s+/g, '-');
        params.push({ locale, slug });
      }
    }

    // Add project slugs
    for (const project of projects) {
      params.push({ locale, slug: project.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const baseUrl = getBaseUrl();

  // Check if it's a category page
  if (isCategory(slug)) {
    const categories = getCategoriesLocalized();
    const categoryData = categories.find(
      (c) => c.en.toLowerCase().replace(/\s+/g, '-') === slug
    );

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

  // It's a project detail page
  const project = getProjectBySlug(slug);

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

  const [t, company] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getCompanyFromDb(),
  ]);

  // Check if it's a category page
  if (isCategory(slug)) {
    const categories = getCategoriesLocalized();
    const categoryData = categories.find(
      (c) => c.en.toLowerCase().replace(/\s+/g, '-') === slug
    );
    const categoryName = categoryData?.[locale as Locale];

    const breadcrumbs = [
      { name: t('home'), url: `/${locale}/` },
      { name: t('projects'), url: `/${locale}/projects/` },
      { name: categoryName || slug, url: `/${locale}/projects/${slug}/` },
    ];

    return (
      <>
        <BreadcrumbSchema items={breadcrumbs} />
        <ProjectCategoryPage locale={locale as Locale} categorySlug={slug} company={company} />
      </>
    );
  }

  // It's a project detail page
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const localizedProject = getLocalizedProject(project, locale as Locale);

  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('projects'), url: `/${locale}/projects/` },
    { name: localizedProject.title, url: `/${locale}/projects/${slug}/` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ProjectDetailPage locale={locale as Locale} projectSlug={slug} company={company} />
    </>
  );
}
