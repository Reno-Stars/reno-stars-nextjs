'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Company, BlogPost } from '@/lib/types';
import CTASection from '@/components/CTASection';
import {
  NAVY, GOLD, SURFACE,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
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
  const localizedPosts = useMemo(() => blogPosts.map((p) => ({ slug: p.slug, title: p.title[locale], excerpt: p.excerpt?.[locale] })), [blogPosts, locale]);

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
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('blog.title')}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {t('blog.subtitle')}
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
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
                      className="rounded-xl p-6 flex items-start justify-between gap-4 transition-all duration-200 hover:translate-x-1 block"
                      style={{ boxShadow: neu(5), backgroundColor: CARD }}
                    >
                      <div>
                        <h3 className="text-lg font-bold mb-2 hover:text-gold transition-colors" style={{ color: TEXT }}>
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm" style={{ color: TEXT_MID }}>
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 shrink-0 mt-1" style={{ color: GOLD }} />
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

      <CTASection
        heading={t('projects.readyToStart2')}
        subtitle={t('projects.ctaSubtitle')}
        showCallButton={false}
        phone={company.phone}
      />
    </div>
  );
}
