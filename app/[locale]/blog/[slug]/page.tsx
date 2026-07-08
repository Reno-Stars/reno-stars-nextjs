import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, ogLocaleMap, type Locale } from '@/i18n/config';
import { getLocalizedBlogPost } from '@/lib/data';
import BlogPostPage from '@/components/pages/BlogPostPage';
import { getLocalizedService, getLocalizedArea } from '@/lib/data';
import { BreadcrumbSchema, ArticleSchema, FAQSchema } from '@/components/structured-data';
import { getBaseUrl, buildAlternates, SITE_NAME, truncateMetaDescription, buildAlternateLocales} from '@/lib/utils';
import { images as siteImages } from '@/lib/data';
import { getCompanyFromDb, getBlogPostBySlugFromDb, getServicesFromDb, getServiceAreasFromDb } from '@/lib/db/queries';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Cached results from `unstable_cache` are JSON-serialized, so Date columns
// come back as strings on cache hits. Coerce defensively before formatting.
// Also tolerant of unparseable strings (returns undefined instead of throwing
// "Invalid time value" — that bug surfaced as a 5xx in May 2026 GSC).
function toIsoString(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}


/**
 * Pull FAQs out of a blog body — markdown OR HTML. The blog editor stores
 * bodies as HTML (`<h2>…</h2>` + `<h3>Q</h3><p>A</p>`); older WordPress-seeded
 * posts may be markdown (`## FAQ` + `### Q`). Looks for an FAQ section heading
 * (Frequently Asked Questions / FAQs / 常见问题 / 常見問題) and extracts each
 * question/answer pair. Returns [] if no recognizable FAQ block exists.
 *
 * Without the HTML path, HTML-authored posts silently emitted no FAQPage
 * structured data even when they had a clear FAQ section — a missed
 * rich-result / AI-citation opportunity (fixed 2026-07 GEO pass).
 */
function extractFaqsFromContent(content: string | null | undefined): { question: string; answer: string }[] {
  if (!content) return [];
  const out: { question: string; answer: string }[] = [];

  function cleanAnswer(raw: string): string {
    return raw
      .replace(/<[^>]+>/g, ' ')                    // strip HTML tags (HTML bodies)
      .replace(/\[(.+?)\]\((.+?)\)/g, '$1')        // md links -> text
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
      .replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"')
      .replace(/^\s*#{1,6}\s+/gm, '')              // md heading marks (line-start only — keeps inline "#1")
      .replace(/^\s*>\s?/gm, '')                   // md blockquote marks
      .replace(/[*_`]/g, '')                       // md emphasis / inline code
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1000);
  }

  const FAQ_LABEL = '(?:Frequently Asked Questions|FAQs?|常见问题|常見問題)';

  // Markdown: the '## FAQ' section, then '### Q' or '**Q**' pairs.
  const mdHeading = content.match(new RegExp(`##\\s*${FAQ_LABEL}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i'));
  if (mdHeading) {
    const block = mdHeading[1];
    let m: RegExpExecArray | null;
    const reH3 = /###\s+(.+?)\n+([\s\S]*?)(?=\n###\s|\n##\s|$)/g;
    while ((m = reH3.exec(block)) !== null) {
      const question = m[1].trim();
      const answer = cleanAnswer(m[2]);
      if (question && answer) out.push({ question, answer });
    }
    if (out.length === 0) {
      const reBold = /^\*\*(.+?)\*\*\n([\s\S]*?)(?=\n\*\*|$)/gm;
      while ((m = reBold.exec(block)) !== null) {
        const question = m[1].trim();
        const answer = cleanAnswer(m[2]);
        if (question && answer) out.push({ question, answer });
      }
    }
  }

  // HTML: the FAQ <h2> section, then each <h3>Q</h3> + following answer block
  // (everything up to the next <h3>/<h2> — handles multi-<p> answers). Match the
  // heading by TEXT label (en/zh) OR by a translation-invariant id="faq" anchor:
  // machine translation rewrites the heading text away on ja/ko/es/… but keeps
  // the id attribute, so id="faq" keeps FAQPage schema working on every locale.
  if (out.length === 0) {
    const htmlHeading =
      content.match(new RegExp(`<h2[^>]*>\\s*${FAQ_LABEL}[^<]*</h2>([\\s\\S]*?)(?=<h2[\\s>]|$)`, 'i'))
      || content.match(/<h2[^>]*\bid=["']faq["'][^>]*>[\s\S]*?<\/h2>([\s\S]*?)(?=<h2[\s>]|$)/i);
    if (htmlHeading) {
      const block = htmlHeading[1];
      const reHtml = /<h3[^>]*>([\s\S]*?)<\/h3>\s*([\s\S]*?)(?=<h3[\s>]|<h2[\s>]|$)/gi;
      let m: RegExpExecArray | null;
      while ((m = reHtml.exec(block)) !== null) {
        const question = cleanAnswer(m[1]);
        const answer = cleanAnswer(m[2]);
        if (question && answer) out.push({ question, answer });
      }
    }
  }

  return out;
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlugFromDb(slug, locale);

  if (!post) {
    return { title: 'Blog Post Not Found', robots: { index: false, follow: false } };
  }

  const localizedPost = getLocalizedBlogPost(post, locale as Locale);
  const baseUrl = getBaseUrl();
  const ogImage = post.featured_image || siteImages.hero;
  // Resolution order:
  //   1. SEO-agent override (meta_overrides.{title,description}[locale]) —
  //      lets the agent A/B-test SERP titles without touching authored content
  //   2. Content-team authored meta_title / meta_description
  //   3. Fallback: composed from the post's title / excerpt
  const localeKey = locale as 'en' | 'zh';
  const metaTitle =
    post.meta_overrides?.title?.[localeKey]
    || post.meta_title?.[locale as Locale]
    || `${localizedPost.title} | ${SITE_NAME}`;
  const metaDescription =
    post.meta_overrides?.description?.[localeKey]
    || post.meta_description?.[locale as Locale]
    || truncateMetaDescription(localizedPost.excerpt || localizedPost.title);

  // Blog post bodies are not yet translated for ja/ko/es. Pickling EN content
  // under a /ja/blog/[slug] URL with hreflang declarations creates duplicate-
  // content risk and contradicts the locale signal. Until per-locale bodies
  // exist (post.content_ja/ko/es present in localizations jsonb), noindex
  // these locale variants. EN and ZH have native bodies and stay indexed.
  const contentMap = post.content as Record<string, string | undefined>;
  const hasNativeBody = locale === 'en' || locale === 'zh'
    || Boolean(contentMap?.[locale] && contentMap[locale] !== contentMap.en);

  // hreflang must only list indexable variants: en/zh always, minor locales
  // only once a native body exists. Must stay in sync with the sitemap's
  // nativeLocales filter (app/sitemap.ts) and the noindex condition above.
  const nativeLocales = locales.filter(
    loc => loc === 'en' || loc === 'zh' || Boolean(contentMap?.[loc] && contentMap[loc] !== contentMap.en),
  );

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: post.seo_keywords?.[locale as Locale]?.split(',').map(k => k.trim()).filter(Boolean),
    ...(hasNativeBody ? {} : { robots: { index: false, follow: true } }),
    alternates: buildAlternates(`/blog/${slug}/`, locale, nativeLocales),
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${baseUrl}/${locale}/blog/${slug}/`,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale as Locale],
      alternateLocale: buildAlternateLocales(locale as Locale),
      type: 'article',
      publishedTime: toIsoString(post.published_at),
      modifiedTime: toIsoString(post.updated_at),
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

  const post = await getBlogPostBySlugFromDb(slug, locale);

  if (!post) {
    notFound();
  }

  const localizedPost = getLocalizedBlogPost(post, locale as Locale);
  const ogImage = post.featured_image || siteImages.hero;

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
      <BreadcrumbSchema items={breadcrumbs} locale={locale} />
      {faqs.length > 0 && <FAQSchema faqs={faqs} locale={locale} />}
      <ArticleSchema
        company={company}
        headline={localizedPost.title}
        description={localizedPost.excerpt}
        datePublished={toIsoString(post.published_at)}
        dateModified={toIsoString(post.updated_at)}
        authorName={post.author}
        url={`/${locale}/blog/${slug}/`}
        image={ogImage}
        locale={locale}
        keywords={post.seo_keywords?.[locale as Locale]?.split(',').map(k => k.trim()).filter(Boolean)}
      />
      <BlogPostPage
        locale={locale as Locale}
        post={post}
        company={company}
        // Slim projections: the client component renders only slug+title link
        // chips. Passing the full Service/ServiceArea rows (every locale of
        // every long_description) serialized ~1.9MB of RSC flight data into
        // EVERY blog page (Semrush "Large HTML", 2026-07-08 audit).
        services={services.map((s) => { const l = getLocalizedService(s, locale as Locale); return { slug: l.slug, title: l.title }; })}
        areas={areas.map((a) => { const l = getLocalizedArea(a, locale as Locale); return { slug: l.slug, name: l.name }; })}
      />
    </>
  );
}
