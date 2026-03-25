import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedBlogPost } from '@/lib/data';
import BlogPostPage from '@/components/pages/BlogPostPage';
import { BreadcrumbSchema, ArticleSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME, truncateMetaDescription } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getBlogPostBySlugFromDb, getBlogPostSlugsFromDb, getServicesFromDb, getServiceAreasFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getBlogPostSlugsFromDb();
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    for (const post of posts) {
      params.push({ locale, slug: post.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlugFromDb(slug);

  if (!post) {
    return { title: 'Blog Post Not Found', robots: { index: false, follow: false } };
  }

  const localizedPost = getLocalizedBlogPost(post, locale as Locale);
  const baseUrl = getBaseUrl();
  const ogImage = post.featured_image || siteImages.hero;
  // Use dedicated SEO fields, fallback to excerpt/title if not set
  const metaTitle = post.meta_title?.[locale as Locale] || `${localizedPost.title} | ${SITE_NAME}`;
  const metaDescription = post.meta_description?.[locale as Locale] || truncateMetaDescription(localizedPost.excerpt || localizedPost.title);

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: post.seo_keywords?.[locale as Locale]?.split(',').map(k => k.trim()).filter(Boolean),
    alternates: buildAlternates(`/blog/${slug}/`, locale),
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${baseUrl}/${locale}/blog/${slug}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: locale === 'en' ? ['zh_CN'] : ['en_US'],
      type: 'article',
      publishedTime: post.published_at?.toISOString(),
      modifiedTime: post.updated_at?.toISOString(),
      images: [{ url: ogImage, width: 1200, height: 630, alt: localizedPost.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getBlogPostBySlugFromDb(slug);

  if (!post) {
    notFound();
  }

  const localizedPost = getLocalizedBlogPost(post, locale as Locale);

  const [t, company, services, areas] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getCompanyFromDb(),
    getServicesFromDb(),
    getServiceAreasFromDb(),
  ]);
  const breadcrumbs = [
    { name: t('home'), url: `/${locale}/` },
    { name: t('blog'), url: `/${locale}/blog/` },
    { name: localizedPost.title, url: `/${locale}/blog/${slug}/` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ArticleSchema
        company={company}
        headline={localizedPost.title}
        description={localizedPost.excerpt}
        datePublished={post.published_at?.toISOString()}
        dateModified={post.updated_at?.toISOString()}
        authorName={post.author}
        url={`/${locale}/blog/${slug}/`}
        image={post.featured_image}
      />
      <BlogPostPage locale={locale as Locale} post={post} company={company} services={services} areas={areas} />
    </>
  );
}
