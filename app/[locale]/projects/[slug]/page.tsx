import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getCategoriesLocalized, CATEGORY_SLUGS, getLocalizedProject, getLocalizedSiteWithProjects } from '@/lib/data/projects';
import ProjectDetailPage from '@/components/pages/ProjectDetailPage';
import ProjectCategoryPage from '@/components/pages/ProjectCategoryPage';
import SiteDetailPage from '@/components/pages/SiteDetailPage';
import { BreadcrumbSchema, ProjectSchema } from '@/components/structured-data';
import { serviceTypeToCategory } from '@/lib/data/services';
import { getBaseUrl, buildAlternates, SITE_NAME, truncateMetaDescription } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getProjectsFromDb, getSiteBySlugFromDb, getSitesAsProjectsFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const [projects, sites] = await Promise.all([
    getProjectsFromDb(),
    getSitesAsProjectsFromDb(),
  ]);
  const projectParams = projects.flatMap((p) =>
    locales.map((locale) => ({ locale, slug: p.slug }))
  );
  const siteParams = sites.flatMap((s) =>
    locales.map((locale) => ({ locale, slug: s.slug }))
  );
  const categoryParams = CATEGORY_SLUGS.flatMap((slug) =>
    locales.map((locale) => ({ locale, slug }))
  );
  return [...categoryParams, ...projectParams, ...siteParams];
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

  // Check if it's a site
  const siteData = await getSiteBySlugFromDb(slug);

  if (siteData) {
    // Use dedicated SEO fields, fallback to title/description if not set
    const metaTitle = siteData.meta_title?.[locale as Locale] ?? `${siteData.title[locale as Locale]} | ${SITE_NAME}`;
    const metaDescription = siteData.meta_description?.[locale as Locale] ?? truncateMetaDescription(siteData.description[locale as Locale]);

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: siteData.seo_keywords?.[locale as Locale]?.split(',').map(k => k.trim()).filter(Boolean),
      alternates: buildAlternates(`/projects/${slug}/`, locale),
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: `${baseUrl}/${locale}/projects/${slug}/`,
        siteName: SITE_NAME,
        locale: ogLocaleMap[locale as Locale],
        type: 'article',
        images: siteData.hero_image ? [{ url: siteData.hero_image }] : [{ url: siteImages.hero }],
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: siteData.hero_image ? [siteData.hero_image] : [siteImages.hero],
      },
    };
  }

  return { title: 'Not Found', robots: { index: false, follow: false } };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, company, allProjects, googleReviews] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getCompanyFromDb(),
    getProjectsFromDb(),
    getGoogleReviews(),
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
          googleRating={googleReviews.rating}
          googleReviewCount={googleReviews.userRatingCount}
        />
        <ProjectDetailPage locale={locale as Locale} project={project} allProjects={allProjects} company={company} />
      </>
    );
  }

  // Check if it's a site
  const siteData = await getSiteBySlugFromDb(slug);

  if (siteData) {
    const localizedSite = getLocalizedSiteWithProjects(siteData, locale as Locale);

    const breadcrumbs = [
      { name: t('home'), url: `/${locale}/` },
      { name: t('projects'), url: `/${locale}/projects/` },
      { name: siteData.title[locale as Locale], url: `/${locale}/projects/${slug}/` },
    ];

    return (
      <>
        <BreadcrumbSchema items={breadcrumbs} />
        <ProjectSchema
          company={company}
          name={localizedSite.title}
          description={localizedSite.description}
          image={siteData.hero_image ?? ''}
          images={siteData.aggregated.allImages.map((img) => img.src)}
          location={siteData.location_city ?? ''}
          serviceType="Whole House"
          url={`/${locale}/projects/${slug}/`}
          googleRating={googleReviews.rating}
          googleReviewCount={googleReviews.userRatingCount}
        />
        <SiteDetailPage site={localizedSite} company={company} />
      </>
    );
  }

  // Not found
  notFound();
}
