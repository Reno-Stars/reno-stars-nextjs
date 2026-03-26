'use client';

import { useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, ChevronRight, ChevronLeft, Calendar, BookOpen } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Company, BlogPost } from '@/lib/types';
import CTASection from '@/components/CTASection';
import {
  NAVY, GOLD, SURFACE,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu, SURFACE_ALT,
} from '@/lib/theme';

interface BlogPageProps {
  locale: Locale;
  company: Company;
  blogPosts: BlogPost[];
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  perPage?: number;
}

export default function BlogPage({
  locale,
  company,
  blogPosts,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  perPage = 10,
}: BlogPageProps) {
  const t = useTranslations();
  const localizedPosts = useMemo(() => blogPosts.map((p) => ({
    slug: p.slug,
    title: p.title[locale],
    excerpt: p.excerpt?.[locale],
    featured_image: p.featured_image,
    published_at: p.published_at,
  })), [blogPosts, locale]);

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  }, [locale]);

  const hasPagination = totalPages > 1;

  // Generate page numbers to display (show current page, 2 before and 2 after)
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    // Always show first page
    pages.push(1);

    // Add ellipsis if needed
    if (left > 2) pages.push('ellipsis');

    // Add middle pages
    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (right < totalPages - 1) pages.push('ellipsis');

    // Always show last page if more than 1 page
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>

      {/* Hero */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: `${GOLD}20` }}>
            <BookOpen className="w-6 h-6" style={{ color: GOLD }} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {t('blog.title')}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-4">
            {t('blog.subtitle')}
          </p>
          {totalCount > 0 && (
            <span className="inline-block text-xs font-medium px-3 py-1 rounded-full" style={{ color: GOLD, backgroundColor: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
              {totalCount} {locale === 'zh' ? '篇文章' : totalCount === 1 ? 'Article' : 'Articles'}
            </span>
          )}
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-4xl mx-auto">
          {localizedPosts.length === 0 ? (
            <p className="text-center text-lg py-12" style={{ color: TEXT_MID }}>
              {t('blog.noPosts')}
            </p>
          ) : (
            <>
              <div className="space-y-4">
                {localizedPosts.map((post) => (
                  <article key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="rounded-xl overflow-hidden flex flex-col sm:flex-row transition-all duration-200 hover:translate-y-[-2px] block"
                      style={{ boxShadow: neu(5), backgroundColor: CARD }}
                    >
                      {post.featured_image && (
                        <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0">
                          <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 192px"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="text-lg font-bold mb-1.5 transition-colors" style={{ color: TEXT }}>
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-sm line-clamp-2" style={{ color: TEXT_MID }}>
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          {post.published_at && (
                            <span className="flex items-center gap-1.5 text-xs" style={{ color: TEXT_MUTED }}>
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(post.published_at)}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-sm font-medium" style={{ color: GOLD }}>
                            {t('blog.readMore')}
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {hasPagination && (
                <nav
                  className="mt-10 flex items-center justify-center gap-2"
                  aria-label={t('blog.pagination')}
                >
                  {/* Previous button */}
                  {currentPage > 1 ? (
                    <Link
                      href={currentPage === 2 ? '/blog' : `/blog?page=${currentPage - 1}`}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:translate-x-[-2px]"
                      style={{ color: NAVY, boxShadow: neu(3), backgroundColor: CARD }}
                      aria-label={t('blog.previousPage')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('blog.previous')}</span>
                    </Link>
                  ) : (
                    <span
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
                      style={{ color: TEXT_MUTED, backgroundColor: CARD }}
                      aria-disabled="true"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('blog.previous')}</span>
                    </span>
                  )}

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {pageNumbers.map((pageNum, idx) =>
                      pageNum === 'ellipsis' ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 py-2 text-sm"
                          style={{ color: TEXT_MUTED }}
                        >
                          …
                        </span>
                      ) : (
                        <Link
                          key={pageNum}
                          href={pageNum === 1 ? '/blog' : `/blog?page=${pageNum}`}
                          className="min-w-[40px] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200"
                          style={{
                            color: pageNum === currentPage ? 'white' : NAVY,
                            backgroundColor: pageNum === currentPage ? GOLD : CARD,
                            boxShadow: pageNum === currentPage ? `0 4px 12px ${GOLD}44` : neu(3),
                          }}
                          aria-current={pageNum === currentPage ? 'page' : undefined}
                        >
                          {pageNum}
                        </Link>
                      )
                    )}
                  </div>

                  {/* Next button */}
                  {currentPage < totalPages ? (
                    <Link
                      href={`/blog?page=${currentPage + 1}`}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:translate-x-[2px]"
                      style={{ color: NAVY, boxShadow: neu(3), backgroundColor: CARD }}
                      aria-label={t('blog.nextPage')}
                    >
                      <span className="hidden sm:inline">{t('blog.next')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <span
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
                      style={{ color: TEXT_MUTED, backgroundColor: CARD }}
                      aria-disabled="true"
                    >
                      <span className="hidden sm:inline">{t('blog.next')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  )}
                </nav>
              )}

              {/* Post count info */}
              {totalCount > 0 && (
                <p className="mt-4 text-center text-sm" style={{ color: TEXT_MUTED }}>
                  {t('blog.showingPosts', {
                    start: (currentPage - 1) * perPage + 1,
                    end: Math.min(currentPage * perPage, totalCount),
                    total: totalCount,
                  })}
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Internal Cross-Links */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('cta.viewAllServices')} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('cta.viewAllProjects')} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/workflow"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
            style={{ color: GOLD }}
          >
            {t('areas.processLinkText')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <CTASection
        heading={t('projects.readyToStart2')}
        subtitle={t('projects.ctaSubtitle')}
        showCallButton={false}
        phone={company.phone}
      />
    </div>
  );
}
