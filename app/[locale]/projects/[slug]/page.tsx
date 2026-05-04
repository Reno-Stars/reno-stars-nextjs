import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedProject, getLocalizedSiteWithProjects } from '@/lib/data/projects';
import ProjectDetailPage from '@/components/pages/ProjectDetailPage';
import ProjectCategoryPage from '@/components/pages/ProjectCategoryPage';
import SiteDetailPage from '@/components/pages/SiteDetailPage';
import { BreadcrumbSchema, ProjectSchema, ProjectCategorySchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME, truncateMetaDescription, pickLocale, pickLocaleOptional, buildAlternateLocales} from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getProjectsFromDb, getSiteBySlugFromDb, getSitesAsProjectsFromDb, getServiceTypeToCategory, getCategoriesLocalized, getCategorySlugs } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 2592000; // 30d — Vercel ISR write reduction

// Build-time prerender: EN only. Non-EN locales lazy-generate on first
// request via dynamicParams=true. Saves ~9× the prerender count for projects,
// sites, and categories. SEO unaffected — crawlers trigger generation on
// first hit and the page is cached for 7d.
export async function generateStaticParams() {
  const [projects, sites, categorySlugs] = await Promise.all([
    getProjectsFromDb(),
    getSitesAsProjectsFromDb(),
    getCategorySlugs(),
  ]);
  const projectParams = projects.map((p) => ({ locale: 'en', slug: p.slug }));
  const siteParams = sites.map((s) => ({ locale: 'en', slug: s.slug }));
  const categoryParams = categorySlugs.map((slug) => ({ locale: 'en', slug }));
  return [...categoryParams, ...projectParams, ...siteParams];
}

async function isCategory(slug: string): Promise<boolean> {
  const categorySlugs = await getCategorySlugs();
  return categorySlugs.includes(slug);
}

async function findCategoryBySlug(slug: string) {
  const categories = await getCategoriesLocalized();
  return categories.find((c) => c.serviceType === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const baseUrl = getBaseUrl();

  // Check if it's a category page
  if (await isCategory(slug)) {
    const categoryData = await findCategoryBySlug(slug);

    if (!categoryData) {
      return { title: 'Category Not Found', robots: { index: false, follow: false } };
    }

    const categoryName = pickLocale(categoryData, locale as Locale);
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
        alternateLocale: buildAlternateLocales(locale as Locale),
        type: 'website',
        images: [{ url: siteImages.hero, width: 1200, height: 630, alt: categoryName }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [{ url: siteImages.hero, alt: categoryName }],
      },
    };
  }

  // Check if it's a project
  const allProjects = await getProjectsFromDb();
  const project = allProjects.find((p) => p.slug === slug);

  if (project) {
    const localizedProject = getLocalizedProject(project, locale as Locale);
    // Use dedicated SEO fields, fallback to location-enriched title if city exists
    const fallbackTitle = project.location_city
      ? (locale === 'zh'
        ? `${project.location_city}${localizedProject.title} | Reno Stars`
        : `${localizedProject.title} in ${project.location_city} | Reno Stars`)
      : `${localizedProject.title} | ${SITE_NAME}`;
    const metaTitle = project.meta_title?.[locale as Locale] || fallbackTitle;
    const metaDescription = project.meta_description?.[locale as Locale]
      || truncateMetaDescription(project.excerpt?.[locale as Locale] || localizedProject.description);

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: project.seo_keywords?.[locale as Locale]?.split(',').map(k => k.trim()).filter(Boolean),
      alternates: buildAlternates(`/projects/${slug}/`, locale),
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: `${baseUrl}/${locale}/projects/${slug}/`,
        siteName: SITE_NAME,
        locale: ogLocaleMap[locale as Locale],
        alternateLocale: buildAlternateLocales(locale as Locale),
        type: 'article',
        images: [{ url: project.hero_image, width: 1200, height: 630, alt: localizedProject.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: [project.hero_image],
      },
    };
  }

  // Check if it's a site
  const siteData = await getSiteBySlugFromDb(slug);

  if (siteData) {
    // Use dedicated SEO fields, fallback to location-enriched title if city exists
    const siteFallbackTitle = siteData.location_city
      ? (locale === 'zh'
        ? `${siteData.location_city}${pickLocale(siteData.title, locale as Locale)} | Reno Stars`
        : `${pickLocale(siteData.title, locale as Locale)} in ${siteData.location_city} | Reno Stars`)
      : `${pickLocale(siteData.title, locale as Locale)} | ${SITE_NAME}`;
    const metaTitle = pickLocaleOptional(siteData.meta_title, locale as Locale) ?? siteFallbackTitle;
    const metaDescription = pickLocaleOptional(siteData.meta_description, locale as Locale) ?? truncateMetaDescription(pickLocale(siteData.description, locale as Locale));

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: pickLocaleOptional(siteData.seo_keywords, locale as Locale)?.split(',').map(k => k.trim()).filter(Boolean),
      alternates: buildAlternates(`/projects/${slug}/`, locale),
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: `${baseUrl}/${locale}/projects/${slug}/`,
        siteName: SITE_NAME,
        locale: ogLocaleMap[locale as Locale],
        alternateLocale: buildAlternateLocales(locale as Locale),
        type: 'article',
        images: siteData.hero_image
          ? [{ url: siteData.hero_image, width: 1200, height: 630, alt: siteData.title[locale as Locale] }]
          : [{ url: siteImages.hero, width: 1200, height: 630, alt: siteData.title[locale as Locale] }],
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: siteData.hero_image
          ? [{ url: siteData.hero_image, alt: siteData.title[locale as Locale] }]
          : [{ url: siteImages.hero, alt: siteData.title[locale as Locale] }],
      },
    };
  }

  return { title: 'Not Found', robots: { index: false, follow: false } };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, company, allProjects, googleReviews, serviceTypeMap, categories] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getCompanyFromDb(),
    getProjectsFromDb(),
    getGoogleReviews(),
    getServiceTypeToCategory(),
    getCategoriesLocalized(),
  ]);

  // Check if it's a category page
  if (await isCategory(slug)) {
    const categoryData = await findCategoryBySlug(slug);
    if (!categoryData) notFound();
    const categoryName = pickLocale(categoryData, locale as Locale);

    const breadcrumbs = [
      { name: t('home'), url: `/${locale}/` },
      { name: t('projects'), url: `/${locale}/projects/` },
      { name: categoryName || slug, url: `/${locale}/projects/${slug}/` },
    ];

    const categoryProjects = allProjects.filter((p) => p.service_type === slug);

    return (
      <>
        <BreadcrumbSchema items={breadcrumbs} />
        <ProjectCategorySchema
          categoryName={categoryName}
          locale={locale as Locale}
          projects={categoryProjects}
        />
        <ProjectCategoryPage locale={locale as Locale} categorySlug={slug} company={company} projects={allProjects} categories={categories} />
      </>
    );
  }

  // Check if it's a project
  const project = allProjects.find((p) => p.slug === slug);

  if (project) {
    const localizedProject = getLocalizedProject(project, locale as Locale);
    const serviceTypeName = (project.service_type && serviceTypeMap[project.service_type] && pickLocale(serviceTypeMap[project.service_type], locale as Locale)) || project.service_type || '';

    const breadcrumbs = [
      { name: t('home'), url: `/${locale}/` },
      { name: t('projects'), url: `/${locale}/projects/` },
      ...(project.service_type && serviceTypeName
        ? [{ name: serviceTypeName, url: `/${locale}/projects/${project.service_type}/` }]
        : []),
      { name: pickLocale(project.title, locale as Locale), url: `/${locale}/projects/${slug}/` },
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
          duration={localizedProject.duration}
          budgetRange={project.budget_range}
          spaceType={localizedProject.space_type}
        />
        <ProjectDetailPage locale={locale as Locale} project={project} allProjects={allProjects} company={company} serviceType={project.service_type} serviceTypeName={serviceTypeName} />
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
      { name: pickLocale(siteData.title, locale as Locale), url: `/${locale}/projects/${slug}/` },
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
