import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import BlogPage from '@/components/pages/BlogPage';
import FaqSection from '@/components/home/FaqSection';
import { BreadcrumbSchema, BlogSchema, ItemListSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, buildOgImageUrl, SITE_NAME, buildAlternateLocales, pickLocale } from '@/lib/utils';
import { getCompanyFromDb, getBlogPostsPaginatedFromDb, getBlogPostsFromDb, BLOG_POSTS_PER_PAGE } from '@/lib/db/queries';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const { page } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'metadata.blog' });

  const baseUrl = getBaseUrl();
  const currentPage = Math.max(1, parseInt(page || '1', 10) || 1);
  const pageParam = currentPage > 1 ? `?page=${currentPage}` : '';

  const title = currentPage > 1 ? `${t('title')} - Page ${currentPage}` : t('title');
  const ogImage = buildOgImageUrl(t('title'));

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
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: t('description'),
      images: [{ url: ogImage, alt: title }],
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page } = await searchParams;
  setRequestLocale(locale);

  const currentPage = Math.max(1, parseInt(page || '1', 10) || 1);

  const [t, mt, ft, company, paginatedPosts, allPosts] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'metadata.blog' }),
    getTranslations({ locale, namespace: 'faq' }),
    getCompanyFromDb(),
    getBlogPostsPaginatedFromDb(currentPage, BLOG_POSTS_PER_PAGE),
    getBlogPostsFromDb(),
  ]);
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('blog'), url: `/${locale}/blog/` },
  ];

  const baseUrl = getBaseUrl();

  const blogFaqs = [
    {
      id: 'blog-faq-1',
      question: 'What renovation services does Reno Stars offer?',
      answer: 'Reno Stars offers kitchen, bathroom, basement, whole-house, and commercial renovations. Services include cabinet refacing, Poly-B pipe replacement, heat pump installation, and accessible bathroom renovations.',
    },
    {
      id: 'blog-faq-2',
      question: 'How much does a renovation cost in Metro Vancouver?',
      answer: 'Kitchen renovations in Vancouver typically range from $30,000-$80,000+. Bathroom renovations range from $20,000-$60,000+. Basement renovations for legal suites start around $50,000.',
    },
  ];

  const blogFaqTranslations = {
    title: ft('title'),
    subtitle: t('blog.faqSubtitle'),
  };

  return (
    <>
      {currentPage > 1 && (
        <link rel="prev" href={`${baseUrl}/${locale}/blog/${currentPage === 2 ? '' : `?page=${currentPage - 1}`}`} />
      )}
      {currentPage < paginatedPosts.totalPages && (
        <link rel="next" href={`${baseUrl}/${locale}/blog/?page=${currentPage + 1}`} />
      )}
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      {/* Blog schema — identifies this page as a blog listing for search engines.
          Renders on page 1 only (subsequent paginated pages don't need it).
          Source: on-page scanner finding on-page-2e8f4c6a1d3b (2026-08-04). */}
      {currentPage === 1 && (
        <BlogSchema name={mt('title')} description={mt('description')} locale={locale} />
      )}
      {currentPage === 1 && (
        <ItemListSchema
          items={allPosts.map((p) => ({
            name: pickLocale(p.title, locale as Locale),
            url: `/${locale}/blog/${p.slug}/`,
            image: p.featured_image ?? undefined,
          }))}
          name={mt('title')}
          description={mt('description')}
        />
      )}
      {/* FAQPage schema — FAQ for the blog index page.
          Source: on-page scanner finding on-page-3a8e1f2b3c4d (2026-08-05). */}
      {currentPage === 1 && (
        <FAQSchema
          faqs={blogFaqs.map((f) => ({ question: f.question, answer: f.answer }))}
          locale={locale}
        />
      )}
      <BlogPage
        locale={locale as Locale}
        company={company}
        blogPosts={paginatedPosts.posts}
        currentPage={paginatedPosts.currentPage}
        totalPages={paginatedPosts.totalPages}
        totalCount={paginatedPosts.totalCount}
        perPage={BLOG_POSTS_PER_PAGE}
      />
      {/* Blog index FAQ accordion — source: on-page scanner finding on-page-3a8e1f2b3c4d (2026-08-05). */}
      {currentPage === 1 && (
        <FaqSection faqs={blogFaqs} translations={blogFaqTranslations} />
      )}
    </>
  );
}
