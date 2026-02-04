import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getBlogPostBySlug, blogPosts, getLocalizedBlogPost } from '@/lib/data';
import BlogPostPage from '@/components/pages/BlogPostPage';
import { BreadcrumbSchema, ArticleSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME } from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    for (const post of blogPosts) {
      params.push({ locale, slug: post.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Blog Post Not Found', robots: { index: false, follow: false } };
  }

  const localizedPost = getLocalizedBlogPost(post, locale as Locale);
  const baseUrl = getBaseUrl();

  return {
    title: `${localizedPost.title} | ${SITE_NAME}`,
    description: localizedPost.excerpt || localizedPost.title,
    alternates: buildAlternates(`/blog/${slug}/`, locale),
    openGraph: {
      title: `${localizedPost.title} | ${SITE_NAME}`,
      description: localizedPost.excerpt || localizedPost.title,
      url: `${baseUrl}/${locale}/blog/${slug}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      type: 'article',
      images: [{ url: siteImages.hero }],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const localizedPost = getLocalizedBlogPost(post, locale as Locale);

  const [t, company] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getCompanyFromDb(),
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
        url={`/${locale}/blog/${slug}/`}
      />
      <BlogPostPage locale={locale as Locale} postSlug={slug} company={company} />
    </>
  );
}
