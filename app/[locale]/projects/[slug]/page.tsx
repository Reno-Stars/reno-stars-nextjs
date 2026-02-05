import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getCategoriesLocalized, CATEGORY_SLUGS, getLocalizedProject, getLocalizedHouseWithProjects } from '@/lib/data/projects';
import ProjectDetailPage from '@/components/pages/ProjectDetailPage';
import ProjectCategoryPage from '@/components/pages/ProjectCategoryPage';
import HouseDetailPage from '@/components/pages/HouseDetailPage';
import { BreadcrumbSchema, ProjectSchema } from '@/components/structured-data';
import { serviceTypeToCategory } from '@/lib/data/services';
import { getBaseUrl, buildAlternates, SITE_NAME, truncateMetaDescription } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getProjectsFromDb, getHouseBySlugFromDb, getHousesAsProjectsFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const [projects, houses] = await Promise.all([
    getProjectsFromDb(),
    getHousesAsProjectsFromDb(),
  ]);
  const projectParams = projects.flatMap((p) =>
    locales.map((locale) => ({ locale, slug: p.slug }))
  );
  const houseParams = houses.flatMap((h) =>
    locales.map((locale) => ({ locale, slug: h.slug }))
  );
  const categoryParams = CATEGORY_SLUGS.flatMap((slug) =>
    locales.map((locale) => ({ locale, slug }))
  );
  return [...categoryParams, ...projectParams, ...houseParams];
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
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [siteImages.hero],
      },
    };
  }

  // Check if it's a project
  const allProjects = await getProjectsFromDb();
  const project = allProjects.find((p) => p.slug === slug);

  if (project) {
    const localizedProject = getLocalizedProject(project, locale as Locale);
    const description = truncateMetaDescription(localizedProject.description);

    return {
      title: `${localizedProject.title} | ${SITE_NAME}`,
      description,
      alternates: buildAlternates(`/projects/${slug}/`, locale),
      openGraph: {
        title: `${localizedProject.title} | ${SITE_NAME}`,
        description,
        url: `${baseUrl}/${locale}/projects/${slug}/`,
        siteName: SITE_NAME,
        locale: ogLocaleMap[locale as Locale],
        type: 'article',
        images: [{ url: project.hero_image }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${localizedProject.title} | ${SITE_NAME}`,
        description,
        images: [project.hero_image],
      },
    };
  }

  // Check if it's a house
  const houseData = await getHouseBySlugFromDb(slug);

  if (houseData) {
    const title = houseData.title[locale as Locale];
    const description = truncateMetaDescription(houseData.description[locale as Locale]);

    return {
      title: `${title} | ${SITE_NAME}`,
      description,
      alternates: buildAlternates(`/projects/${slug}/`, locale),
      openGraph: {
        title: `${title} | ${SITE_NAME}`,
        description,
        url: `${baseUrl}/${locale}/projects/${slug}/`,
        siteName: SITE_NAME,
        locale: ogLocaleMap[locale as Locale],
        type: 'article',
        images: houseData.hero_image ? [{ url: houseData.hero_image }] : [{ url: siteImages.hero }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | ${SITE_NAME}`,
        description,
        images: houseData.hero_image ? [houseData.hero_image] : [siteImages.hero],
      },
    };
  }

  return { title: 'Not Found', robots: { index: false, follow: false } };
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

  // Check if it's a project
  const project = allProjects.find((p) => p.slug === slug);

  if (project) {
    const localizedProject = getLocalizedProject(project, locale as Locale);
    const serviceTypeName = serviceTypeToCategory[project.service_type]?.[locale as Locale] || project.service_type;

    const breadcrumbs = [
      { name: t('home'), url: `/${locale}/` },
      { name: t('projects'), url: `/${locale}/projects/` },
      { name: project.title[locale as Locale], url: `/${locale}/projects/${slug}/` },
    ];

    return (
      <>
        <BreadcrumbSchema items={breadcrumbs} />
        <ProjectSchema
          company={company}
          name={localizedProject.title}
          description={localizedProject.description}
          image={project.hero_image}
          images={project.images?.map((img) => img.src)}
          location={project.location_city}
          serviceType={serviceTypeName}
          url={`/${locale}/projects/${slug}/`}
        />
        <ProjectDetailPage locale={locale as Locale} project={project} allProjects={allProjects} company={company} />
      </>
    );
  }

  // Check if it's a house
  const houseData = await getHouseBySlugFromDb(slug);

  if (houseData) {
    const localizedHouse = getLocalizedHouseWithProjects(houseData, locale as Locale);

    const breadcrumbs = [
      { name: t('home'), url: `/${locale}/` },
      { name: t('projects'), url: `/${locale}/projects/` },
      { name: houseData.title[locale as Locale], url: `/${locale}/projects/${slug}/` },
    ];

    return (
      <>
        <BreadcrumbSchema items={breadcrumbs} />
        <ProjectSchema
          company={company}
          name={localizedHouse.title}
          description={localizedHouse.description}
          image={houseData.hero_image ?? ''}
          images={houseData.aggregated.allImages.map((img) => img.src)}
          location={houseData.location_city ?? ''}
          serviceType="Whole House"
          url={`/${locale}/projects/${slug}/`}
        />
        <HouseDetailPage locale={locale as Locale} house={localizedHouse} company={company} />
      </>
    );
  }

  // Not found
  notFound();
}
