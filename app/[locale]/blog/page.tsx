import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import BlogPage from '@/components/pages/BlogPage';
import { BreadcrumbSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getBlogPostsPaginatedFromDb, BLOG_POSTS_PER_PAGE } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const { page } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'metadata.blog' });

  const baseUrl = getBaseUrl();
  const currentPage = Math.max(1, parseInt(page || '1', 10) || 1);
  const pageParam = currentPage > 1 ? `?page=${currentPage}` : '';

  const title = currentPage > 1 ? `${t('title')} - Page ${currentPage}` : t('title');

  return {
    title,
    description: t('description'),
    alternates: buildAlternates(`/blog/${pageParam}`, locale),
    openGraph: {
      title,
      description: t('description'),
      url: `${baseUrl}/${locale}/blog/${pageParam}`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: locale === 'en' ? ['zh_CN'] : ['en_US'],
      type: 'website',
      images: [{ url: siteImages.hero, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: t('description'),
      images: [{ url: siteImages.hero, alt: title }],
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page } = await searchParams;
  setRequestLocale(locale);

  const currentPage = Math.max(1, parseInt(page || '1', 10) || 1);

  const [t, company, paginatedPosts] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getCompanyFromDb(),
    getBlogPostsPaginatedFromDb(currentPage, BLOG_POSTS_PER_PAGE),
  ]);
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('blog'), url: `/${locale}/blog/` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <BlogPage
        locale={locale as Locale}
        company={company}
        blogPosts={paginatedPosts.posts}
        currentPage={paginatedPosts.currentPage}
        totalPages={paginatedPosts.totalPages}
        totalCount={paginatedPosts.totalCount}
        perPage={BLOG_POSTS_PER_PAGE}
      />
    </>
  );
}
