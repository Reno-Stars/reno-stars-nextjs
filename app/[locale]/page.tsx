import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import HomePage from '@/components/pages/HomePage';
import { BreadcrumbSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import {
  getCompanyFromDb,
  getServicesFromDb,
  getTestimonialsFromDb,
  getAboutSectionsFromDb,
  getGalleryItemsFromDb,
  getTrustBadgesFromDb,
  getBlogPostsFromDb,
  getShowroomFromDb,
  getServiceAreasFromDb,
} from '@/lib/db/queries';

// Revalidate homepage every hour (ISR) - serves cached HTML instantly
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });

  const baseUrl = getBaseUrl();

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates('/', locale),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}/`,
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

  // Fetch all data in parallel - page waits for complete render (good for SEO)
  const [t, company, services, testimonials, aboutSections, gallery, trustBadges, blogPosts, showroom, areas] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getCompanyFromDb(),
    getServicesFromDb(),
    getTestimonialsFromDb(),
    getAboutSectionsFromDb(),
    getGalleryItemsFromDb(),
    getTrustBadgesFromDb(),
    getBlogPostsFromDb(),
    getShowroomFromDb(),
    getServiceAreasFromDb(),
  ]);

  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <HomePage
        locale={locale as Locale}
        company={company}
        services={services}
        testimonials={testimonials}
        aboutSections={aboutSections}
        gallery={gallery}
        trustBadges={trustBadges}
        blogPosts={blogPosts.slice(0, 5)}
        showroom={showroom}
        areas={areas}
      />
    </>
  );
}
