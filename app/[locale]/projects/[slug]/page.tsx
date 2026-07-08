import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedProject, getLocalizedSiteWithProjects } from '@/lib/data/projects';
import ProjectDetailPage from '@/components/pages/ProjectDetailPage';
import ProjectCategoryPage from '@/components/pages/ProjectCategoryPage';
import SiteDetailPage from '@/components/pages/SiteDetailPage';
import { BreadcrumbSchema, ProjectSchema, ProjectCategorySchema, FAQSchema, HowToSchema, ItemListSchema, VideoObjectSchema } from '@/components/structured-data';
import { getJsonLdFromBlocks } from '@/lib/blocks/json-ld';
import type { Block } from '@/lib/blocks/types';
import { getBaseUrl, buildAlternates, SITE_NAME, truncateMetaDescription, pickLocale, pickLocaleOptional, buildAlternateLocales} from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getProjectsFromDb, getSiteBySlugFromDb, getServiceTypeToCategory, getCategoriesLocalized, getCategorySlugs, getServiceBlocksBySlug, getVideoWatchEntriesFromDb } from '@/lib/db/queries';
import { getGoogleReviews } from '@/lib/google-reviews';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
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

  // Project/site LEAF pages: only EN and ZH have native copy — the sitemap
  // restricts this route to en+zh (PROJECT_LEAF_LOCALES in app/sitemap.ts).
  // Noindex the other 12 locales and restrict hreflang to en/zh so Google
  // stops re-crawling ~750 duplicate leaf URLs ("Crawled - currently not
  // indexed", GSC 2026-07-07). Category pages above keep all locales.
  const isIndexableLocale = locale === 'en' || locale === 'zh';
  const leafRobots = isIndexableLocale ? {} : { robots: { index: false, follow: true } as const };

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
      ...leafRobots,
      alternates: buildAlternates(`/projects/${slug}/`, locale, ['en', 'zh']),
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
      ...leafRobots,
      alternates: buildAlternates(`/projects/${slug}/`, locale, ['en', 'zh']),
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

/**
 * VideoObject JSON-LD for a project/site hero (walkthrough) video, emitted on
 * the embedding case-study page with `url` pointed at the dedicated
 * /videos/[slug]/ watch page so Google consolidates video signals there
 * (this page itself is not a watch page — GSC "Video isn't on a watch page").
 * Returns null when the slug has no video watch entry.
 */
async function renderHeroVideoSchema(slug: string, locale: string): Promise<React.ReactElement | null> {
  const entry = (await getVideoWatchEntriesFromDb()).find((e) => e.slug === slug);
  if (!entry || !entry.thumbnailUrl || !entry.uploadDate) return null;
  const isZh = locale === 'zh';
  return (
    <VideoObjectSchema
      name={isZh ? entry.titleZh : entry.titleEn}
      description={truncateMetaDescription((isZh ? entry.descriptionZh : entry.descriptionEn) || (isZh ? entry.titleZh : entry.titleEn))}
      thumbnailUrl={entry.thumbnailUrl}
      contentUrl={entry.videoUrl}
      uploadDate={entry.uploadDate.toISOString()}
      url={`/${locale}/videos/${slug}/`}
      locale={locale}
    />
  );
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
    const categoryBlocks = await getServiceBlocksBySlug(slug);

    // Auto-emit FAQ/HowTo/ItemList JSON-LD from category dynamic_blocks.
    const categoryBlockSchema = getJsonLdFromBlocks(
      (categoryBlocks as Block[] | undefined) ?? null,
      locale,
      `${getBaseUrl()}/${locale}/projects/${slug}/`,
    );

    return (
      <>
        <BreadcrumbSchema items={breadcrumbs} locale={locale} />
        <ProjectCategorySchema
          categoryName={categoryName}
          locale={locale as Locale}
          projects={categoryProjects}
        />
        {categoryBlockSchema.faqs.map((faq, i) => (
          <FAQSchema key={`cat-faq-${i}`} faqs={faq.faqs} locale={faq.locale} />
        ))}
        {categoryBlockSchema.howtos.map((howto, i) => (
          <HowToSchema key={`cat-howto-${i}`} name={howto.name} description={howto.description} totalTime={howto.totalTime} steps={howto.steps} image={howto.image} locale={howto.locale} />
        ))}
        {categoryBlockSchema.imageList && (
          <ItemListSchema items={categoryBlockSchema.imageList.items} name={categoryBlockSchema.imageList.name} description={categoryBlockSchema.imageList.description} locale={categoryBlockSchema.imageList.locale} />
        )}
        <ProjectCategoryPage locale={locale as Locale} categorySlug={slug} company={company} projects={allProjects} categories={categories} categoryBlocks={categoryBlocks} />
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

    // Auto-emit FAQ/HowTo/ItemList JSON-LD from dynamic content blocks.
    // No-op when project.dynamic_blocks is empty/undefined.
    const blockSchema = getJsonLdFromBlocks(
      (project.dynamic_blocks as Block[] | undefined) ?? null,
      locale,
      `${getBaseUrl()}/${locale}/projects/${slug}/`,
    );

    return (
      <>
        <BreadcrumbSchema items={breadcrumbs} locale={locale} />
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
          locale={locale}
        />
        {blockSchema.faqs.map((faq, i) => (
          <FAQSchema key={`faq-${i}`} faqs={faq.faqs} locale={faq.locale} />
        ))}
        {blockSchema.howtos.map((howto, i) => (
          <HowToSchema key={`howto-${i}`} name={howto.name} description={howto.description} totalTime={howto.totalTime} steps={howto.steps} image={howto.image} locale={howto.locale} />
        ))}
        {blockSchema.imageList && (
          <ItemListSchema items={blockSchema.imageList.items} name={blockSchema.imageList.name} description={blockSchema.imageList.description} locale={blockSchema.imageList.locale} />
        )}
        {await renderHeroVideoSchema(slug, locale)}
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

    // Auto-emit FAQ/HowTo/ItemList JSON-LD from site dynamic_blocks.
    const siteBlockSchema = getJsonLdFromBlocks(
      (siteData.dynamic_blocks as Block[] | undefined) ?? null,
      locale,
      `${getBaseUrl()}/${locale}/projects/${slug}/`,
    );

    return (
      <>
        <BreadcrumbSchema items={breadcrumbs} locale={locale} />
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
          locale={locale}
        />
        {siteBlockSchema.faqs.map((faq, i) => (
          <FAQSchema key={`site-faq-${i}`} faqs={faq.faqs} locale={faq.locale} />
        ))}
        {siteBlockSchema.howtos.map((howto, i) => (
          <HowToSchema key={`site-howto-${i}`} name={howto.name} description={howto.description} totalTime={howto.totalTime} steps={howto.steps} image={howto.image} locale={howto.locale} />
        ))}
        {siteBlockSchema.imageList && (
          <ItemListSchema items={siteBlockSchema.imageList.items} name={siteBlockSchema.imageList.name} description={siteBlockSchema.imageList.description} locale={siteBlockSchema.imageList.locale} />
        )}
        {await renderHeroVideoSchema(slug, locale)}
        <SiteDetailPage site={localizedSite} company={company} />
      </>
    );
  }

  // Not found
  notFound();
}
