'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ExternalLink, Calendar, User } from 'lucide-react';
import { Link } from '@/navigation';
import OptimizedImage from '@/components/OptimizedImage';
import type { Locale } from '@/i18n/config';
import sanitizeHtml, { type IOptions } from 'sanitize-html';
import { marked } from 'marked';
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
  CARD, TEXT, TEXT_MID, neu,
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

            <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: TEXT }}>
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
              <p className="text-lg mb-8 leading-relaxed" style={{ color: TEXT_MID }}>
                {localizedPost.excerpt}
              </p>
            )}

            <div className="prose prose-lg max-w-none prose-img:rounded-xl prose-img:my-6 blog-content">
              {localizedPost.content ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(
                  // Accept both markdown AND HTML — marked passes HTML through unchanged,
                  // so pure-HTML content still renders correctly. Markdown (##, **bold**,
                  // |tables|) gets converted to proper HTML tags before sanitize.
                  marked.parse(localizedPost.content, { async: false }) as string,
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

            {/* Author Bio */}
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
        </div>
      </section>

    </div>
  );
}
