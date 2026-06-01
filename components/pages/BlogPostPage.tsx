'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ExternalLink, Calendar, User } from 'lucide-react';
import { Link } from '@/navigation';
import OptimizedImage from '@/components/OptimizedImage';
import type { Locale } from '@/i18n/config';
import sanitizeHtml, { type IOptions } from 'sanitize-html';
import { marked } from 'marked';
import { expandMarkdownLinksInHeadings } from '@/lib/utils';
import type { Company, BlogPost, Service, ServiceArea } from '@/lib/types';

const BLOG_SANITIZE_OPTIONS: IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height', 'loading'],
  },
};
import { getLocalizedBlogPost, getLocalizedService, getLocalizedArea } from '@/lib/data';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import {
  GOLD, SURFACE, SURFACE_ALT, NAVY,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
} from '@/lib/theme';

interface BlogPostPageProps {
  locale: Locale;
  post: BlogPost;
  company: Company;
  services?: Service[];
  areas?: ServiceArea[];
}

export default function BlogPostPage({ locale, post, company, services = [], areas = [] }: BlogPostPageProps) {
  const t = useTranslations();
  const localizedPost = useMemo(() => getLocalizedBlogPost(post, locale), [post, locale]);
  const localizedServices = useMemo(() => services.map((s) => getLocalizedService(s, locale)), [services, locale]);
  const localizedAreas = useMemo(() => areas.map((a) => getLocalizedArea(a, locale)), [areas, locale]);
  // unstable_cache JSON-serializes results so Date columns arrive as strings
  // on cache hits; rehydrate before formatting to avoid TypeError at runtime.
  const publishedAt = useMemo(
    () => (post.published_at ? new Date(post.published_at) : null),
    [post.published_at],
  );
  const updatedAt = useMemo(
    () => (post.updated_at ? new Date(post.updated_at) : null),
    [post.updated_at],
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      <VisualBreadcrumb variant="light" containerClassName="max-w-4xl mx-auto" items={[
        { href: '/', label: t('nav.home') },
        { href: '/blog', label: t('nav.blog') },
        { label: localizedPost.title, className: 'truncate' },
      ]} />

      {/* Article */}
      <article className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 md:p-12" style={{ boxShadow: neu(6), backgroundColor: CARD }}>
            {/* Featured image */}
            {post.featured_image && (
              <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden mb-6">
                <OptimizedImage
                  src={post.featured_image}
                  alt={localizedPost.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                />
              </div>
            )}

            <h1 id="article-headline" className="text-2xl md:text-3xl font-bold mb-4" style={{ color: TEXT }}>
              {localizedPost.title}
            </h1>

            {/* Article meta: date + author */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm" style={{ color: TEXT_MID }}>
              {publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={publishedAt.toISOString()}>
                    {new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(publishedAt)}
                  </time>
                </span>
              )}
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
              )}
              {updatedAt && publishedAt && updatedAt.getTime() > publishedAt.getTime() + 86400000 && (
                <span className="flex items-center gap-1.5" style={{ color: TEXT_MID }}>
                  {t('blog.updated')}{' '}
                  <time dateTime={updatedAt.toISOString()}>
                    {new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(updatedAt)}
                  </time>
                </span>
              )}
            </div>

            {localizedPost.excerpt && (
              <p id="article-lead" className="text-lg mb-8 leading-relaxed" style={{ color: TEXT_MID }}>
                {localizedPost.excerpt}
              </p>
            )}

            <div className="prose prose-lg max-w-none prose-img:rounded-xl prose-img:my-6 blog-content">
              {localizedPost.content ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(
                  // Accept both markdown AND HTML — marked passes HTML through unchanged,
                  // so pure-HTML content still renders correctly. Markdown (##, **bold**,
                  // |tables|) gets converted to proper HTML tags before sanitize.
                  //
                  // expandMarkdownLinksInHeadings repairs the one pathological case marked
                  // can't fix on its own: an HTML heading block authored with a markdown
                  // link inside it. Sibling to PR #57's truncateMetaDescription strip.
                  expandMarkdownLinksInHeadings(
                    marked.parse(localizedPost.content, { async: false }) as string,
                  ),
                  BLOG_SANITIZE_OPTIONS
                ) }} />
              ) : (
                <p>{t('blog.comingSoon')}</p>
              )}
            </div>

            {/* Related Project Section */}
            {localizedPost.related_project && (
              <div className="mt-10 pt-8 border-t" style={{ borderColor: `${TEXT}10` }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: TEXT }}>
                  {t('blog.relatedProject')}
                </h2>

                {/* Project Card */}
                <Link
                  href={`/projects/${localizedPost.related_project.slug}`}
                  className="block rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg"
                  style={{ boxShadow: neu(4), backgroundColor: SURFACE_ALT }}
                >
                  <div className="flex flex-col sm:flex-row">
                    {localizedPost.related_project.hero_image && (
                      <div className="relative w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
                        <OptimizedImage
                          src={localizedPost.related_project.hero_image}
                          alt={localizedPost.related_project.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 192px"
                        />
                      </div>
                    )}
                    <div className="p-4 flex flex-col justify-center">
                      <h3 className="font-semibold text-lg" style={{ color: NAVY }}>
                        {localizedPost.related_project.title}
                      </h3>
                      <span className="text-sm mt-1" style={{ color: GOLD }}>
                        {t('projects.viewProject')} →
                      </span>
                    </div>
                  </div>
                </Link>

                {/* External Products */}
                {localizedPost.related_project.external_products && localizedPost.related_project.external_products.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: TEXT }}>
                      {t('projects.externalProducts')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {localizedPost.related_project.external_products.map((product, idx) => (
                        <a
                          key={idx}
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:shadow-md"
                          style={{ backgroundColor: SURFACE_ALT, boxShadow: neu(2) }}
                        >
                          {product.image_url && (
                            <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                              <OptimizedImage
                                src={product.image_url}
                                alt={product.label}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          )}
                          <span className="text-sm font-medium flex-1 truncate" style={{ color: NAVY }}>
                            {product.label}
                          </span>
                          <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: TEXT_MID }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Author Bio — /about/ inbound link added on the
                seo/daily-2026-06-01 daily branch as the 4th surface in
                the /about/ inbound rollout (sibling to HomePage e1b3193,
                ServiceDetailPage 5260a96, AreaPage b115e67). The Author
                Bio is the canonical "about the author" surface on every
                blog post — semantically AND SEO-wise the strongest body-
                content signal for /about/ inbound. ArticleSchema already
                names the company as the author (E-E-A-T), so the bio
                block is the right place to give readers a discoverable
                hop into the full company profile.

                Label is i18n-aware via t('blog.aboutAuthor', defaultValue)
                fallback — keeps EN/ZH parity using the same locale-aware
                paragraph above, falls back to English for the 12 locales
                where the key isn't translated yet. */}
            <div className="mt-10 pt-8 border-t" style={{ borderColor: `${TEXT}10` }}>
              <div className="flex gap-4 items-start rounded-xl p-5" style={{ backgroundColor: SURFACE_ALT }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: NAVY }}>
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: NAVY }}>{company.name}</p>
                  <p className="text-sm mt-1" style={{ color: TEXT_MID }}>
                    {locale === 'zh'
                      ? `大温哥华地区专业装修公司，${company.yearsExperience}年以上经验，${company.liabilityCoverage} CGL保险，WCB工伤保障，至多3年质保。`
                      : `Professional renovation company serving Metro Vancouver with ${company.yearsExperience}+ years of experience, ${company.liabilityCoverage} CGL insurance, WCB coverage, and up to 3-year warranty.`}
                  </p>
                  <p className="text-sm mt-2">
                    <Link
                      href="/about"
                      className="font-semibold underline hover:no-underline"
                      style={{ color: GOLD }}
                    >
                      {locale === 'zh' ? '了解更多关于我们 →' : 'Learn more about Reno Stars →'}
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Blog */}
            <div className="mt-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: GOLD }}
              >
                <ArrowLeft className="w-4 h-4" />
                {t('blog.backToBlog')}
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Related Services */}
      {localizedServices.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-6" style={{ color: TEXT }}>
              {t('blog.relatedServices')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {localizedServices.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
                  style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
                >
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Areas */}
      {localizedAreas.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-6" style={{ color: TEXT }}>
              {t('blog.relatedAreas')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {localizedAreas.map((a) => (
                <Link
                  key={a.slug}
                  href={`/areas/${a.slug}`}
                  className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
                  style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
                >
                  {a.name}
                </Link>
              ))}
            </div>
            {/* /areas/ aggregation link — 4th surface of /areas/ inbound
                rollout (siblings: HomePage AreasLinkSection adbe51b
                shipped in PR #103, AreaPage Contextual Internal Links
                chip 3f7920a, ServiceDetailPage Areas We Serve 1d5e88c).
                Pre-rollout audit found /areas/ canonical directory had
                ZERO body refs site-wide. BlogPostPage Related Areas
                grid is the semantically-perfect placement — readers
                seeing the post-specific related-areas chips naturally
                ask "what other areas?" — exactly what /areas/ answers.
                ~100 posts × 14 locales = ~1400 surfaces now pass
                body-content link equity to the /areas/ directory. */}
            <p className="text-center mt-6 text-sm" style={{ color: TEXT_MID }}>
              <Link
                href="/areas"
                className="font-semibold underline hover:no-underline"
                style={{ color: GOLD }}
              >
                See all service areas →
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* Cost Guides — every blog post should funnel to at least one cost
          guide. Internal-link audit (2026-04-30) flagged that blog posts
          don't link to specific guides, breaking the topical-authority
          pyramid. Labels are English-only because i18n keys aren't wired
          up; an EN label on a /pa/blog/ page is acceptable vs a missing-
          key crash, and the URL paths route to localized guide pages
          regardless. */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-6" style={{ color: TEXT }}>
            Real Renovation Costs in Vancouver
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { slug: 'kitchen-renovation-cost-vancouver', label: 'Kitchen Renovation Cost' },
              { slug: 'bathroom-renovation-cost-vancouver', label: 'Bathroom Renovation Cost' },
              { slug: 'whole-house-renovation-cost-vancouver', label: 'Whole-House Renovation Cost' },
              { slug: 'basement-renovation-cost-vancouver', label: 'Basement Renovation Cost' },
              { slug: 'commercial-renovation-cost-vancouver', label: 'Commercial Renovation Cost' },
              { slug: 'cabinet-refinishing-cost-vancouver', label: 'Cabinet Refinishing Cost' },
            ].map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="block px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 hover:shadow-md"
                style={{ backgroundColor: CARD, boxShadow: neu(2), color: NAVY }}
              >
                {g.label}
              </Link>
            ))}
          </div>
          {/* Cross-link to financing — natural follow-up for a reader who's
              just absorbed cost ranges. Pre-fix BlogPostPage had zero links
              to /financing/, leaving the money page with no inbound flow
              from the blog cluster (~100 posts). Body-content inline link
              carries materially more PageRank weight than nav-area links;
              gives /financing/ real internal-link equity. */}
          <p className="text-center mt-6 text-sm" style={{ color: TEXT_MID }}>
            Wondering how to pay for your renovation?{' '}
            <Link
              href="/financing"
              className="font-semibold underline hover:no-underline"
              style={{ color: GOLD }}
            >
              See financing options →
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: TEXT }}>
            {t('projects.readyToStart2')}
          </h2>
          <p className="text-base mb-6" style={{ color: TEXT_MID }}>
            {t('projects.ctaSubtitle7', { years: company.yearsExperience })}
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 rounded-xl text-sm font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
          >
            {t('cta.getFreeQuote')}
          </Link>
          {/* Triple secondary CTAs below the primary "Get Free Quote":
              (1) /reviews/ — 4th surface of /reviews/ rollout
                  (siblings: ServiceDetailPage 7a8d289, AreaPage
                  62350e1, HomePage 8503156). Trust signal.
              (2) /workflow/ — 4th surface of /workflow/ rollout
                  (siblings: AreaPage baseline, ServiceDetailPage
                  0e6a6e8, HomePage ServicesSection 568128d). Pre-fix
                  BlogPostPage had ZERO /workflow/ refs. Process
                  documentation is a trust-builder for committing.
              (3) /showroom/ — added on seo/daily-2026-06-01 as 4th
                  surface of /showroom/ rollout (siblings: HomePage
                  ShowroomSection baseline, AreaPage 50ed7e1,
                  ServiceDetailPage d308538). Pre-rollout audit found
                  /showroom/ had only 1 inbound site-wide. "Visit our
                  showroom" is a high-conversion local-SEO CTA on the
                  blog cluster — readers researching renovations
                  before booking often want to see materials in
                  person before quoting.
              ~100 posts × 14 locales = ~1400 surfaces now pass body-
              content link equity to /reviews/ + /workflow/ + /showroom/.
              Three-link paragraph with `·` separators continues the
              FinancingPage hero pattern (commit 5121b5c). */}
          <p className="text-sm mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1" style={{ color: TEXT_MID }}>
            <Link
              href="/reviews"
              className="font-semibold underline hover:no-underline"
              style={{ color: NAVY }}
            >
              Read what our 70+ Vancouver clients say →
            </Link>
            <span aria-hidden="true" className="hidden sm:inline" style={{ color: TEXT_MUTED }}>·</span>
            <Link
              href="/workflow"
              className="font-semibold underline hover:no-underline"
              style={{ color: NAVY }}
            >
              See our renovation process →
            </Link>
            <span aria-hidden="true" className="hidden sm:inline" style={{ color: TEXT_MUTED }}>·</span>
            <Link
              href="/showroom"
              className="font-semibold underline hover:no-underline"
              style={{ color: NAVY }}
            >
              Visit our Burnaby showroom →
            </Link>
          </p>
        </div>
      </section>

    </div>
  );
}
