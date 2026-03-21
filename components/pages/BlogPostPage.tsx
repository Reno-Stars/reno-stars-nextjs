'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ExternalLink, Calendar, User } from 'lucide-react';
import { Link } from '@/navigation';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import sanitizeHtml, { type IOptions } from 'sanitize-html';
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
                <Image
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
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.published_at.toISOString()}>
                    {new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(post.published_at)}
                  </time>
                </span>
              )}
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
              )}
              {post.updated_at && post.published_at && post.updated_at.getTime() > post.published_at.getTime() + 86400000 && (
                <span className="flex items-center gap-1.5" style={{ color: TEXT_MID }}>
                  {t('blog.updated')}{' '}
                  <time dateTime={post.updated_at.toISOString()}>
                    {new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(post.updated_at)}
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
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(localizedPost.content, BLOG_SANITIZE_OPTIONS) }} />
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
                        <Image
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
                              <Image
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

            {/* Back to Blog */}
            <div className="mt-10 pt-8 border-t" style={{ borderColor: `${TEXT}10` }}>
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
