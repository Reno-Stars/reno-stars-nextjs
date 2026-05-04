import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedBlogPost } from '@/lib/data';
import BlogPostPage from '@/components/pages/BlogPostPage';
import { BreadcrumbSchema, ArticleSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME, truncateMetaDescription, buildAlternateLocales} from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getBlogPostBySlugFromDb, getBlogPostSlugsFromDb, getServicesFromDb, getServiceAreasFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Blog posts rarely change after publication. 30d ISR window — the admin
// update flow (app/actions/admin/blog.ts) calls revalidatePath() + IndexNow
// ping on every save, so editors still see changes within seconds when they
// actually edit a post.
export const revalidate = 2592000; // 30d

/**
 * Pull FAQs out of a markdown blog body. Looks for an FAQ section heading
 * (## Frequently Asked Questions / ## FAQs / ## 常见问题) and extracts each
 * `### Question` / answer-paragraph pair. Returns [] if no recognizable
 * FAQ block exists.
 */
function extractFaqsFromContent(content: string | null | undefined): { question: string; answer: string }[] {
  if (!content) return [];
  const faqHeading = content.match(/##\s*(?:Frequently Asked Questions|FAQs?|常见问题)\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (!faqHeading) return [];
  const block = faqHeading[1];
  const re = /###\s+(.+?)\n+([\s\S]*?)(?=\n###\s|\n##\s|$)/g;
  const out: { question: string; answer: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    const question = m[1].trim();
    const answer = m[2]
      .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
      .replace(/[*_`#>]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000);
    if (question && answer) out.push({ question, answer });
  }
  return out;
}

// Build-time prerender: EN slugs only. Other locales lazy-generate on first
// request (Next.js dynamicParams=true default) and stay cached for 30d via
// the page-level revalidate. Cuts ~107 × 9 = 963 unnecessary prerenders per
// build, slashes Vercel build time + ISR-write spend, no SEO hit (search
// engines trigger generation on first crawl, then cache).
export async function generateStaticParams() {
  const posts = await getBlogPostSlugsFromDb();
  return posts.map((post) => ({ locale: 'en', slug: post.slug }));
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

  // Blog post bodies are not yet translated for ja/ko/es. Pickling EN content
  // under a /ja/blog/[slug] URL with hreflang declarations creates duplicate-
  // content risk and contradicts the locale signal. Until per-locale bodies
  // exist (post.content_ja/ko/es present in localizations jsonb), noindex
  // these locale variants. EN and ZH have native bodies and stay indexed.
  const hasNativeBody = locale === 'en' || locale === 'zh'
    || Boolean((post.content as Record<string, string | undefined>)?.[locale]
        && (post.content as Record<string, string | undefined>)[locale] !== (post.content as Record<string, string | undefined>).en);

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: post.seo_keywords?.[locale as Locale]?.split(',').map(k => k.trim()).filter(Boolean),
    ...(hasNativeBody ? {} : { robots: { index: false, follow: true } }),
    alternates: buildAlternates(`/blog/${slug}/`, locale),
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${baseUrl}/${locale}/blog/${slug}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
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

  const faqs = extractFaqsFromContent(localizedPost.content);

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      {faqs.length > 0 && <FAQSchema faqs={faqs} locale={locale} />}
      <ArticleSchema
        company={company}
        headline={localizedPost.title}
        description={localizedPost.excerpt}
        datePublished={post.published_at?.toISOString()}
        dateModified={post.updated_at?.toISOString()}
        authorName={post.author}
        url={`/${locale}/blog/${slug}/`}
        image={post.featured_image}
        locale={locale}
      />
      <BlogPostPage locale={locale as Locale} post={post} company={company} services={services} areas={areas} />
    </>
  );
}
