'use client';

import { useMemo, useState, useCallback, useRef } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { SlidersHorizontal, MapPin, Eye, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { Locale, Company, Project, ImagePair } from '@/lib/types';
import CTASection from '@/components/CTASection';
import { NAVY, GOLD, SURFACE, SURFACE_ALT, CARD, TEXT, TEXT_MID, TEXT_MUTED, neu } from '@/lib/theme';

const ITEMS_PER_PAGE = 12;

interface BeforeAfterGalleryPageProps {
  locale: Locale;
  projects: Project[];
  company: Company;
}

interface GalleryItem {
  projectSlug: string;
  projectTitle: string;
  serviceType: string;
  locationCity: string;
  pair: ImagePair;
  pairIndex: number;
}

const SERVICE_FILTERS = ['all', 'bathroom', 'kitchen', 'whole-house', 'commercial'] as const;

export default function BeforeAfterGalleryPage({ locale, projects, company: _company }: BeforeAfterGalleryPageProps) {
  const t = useTranslations('beforeAfterPage');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const galleryRef = useRef<HTMLElement>(null);

  const galleryItems = useMemo((): GalleryItem[] => {
    const items: GalleryItem[] = [];
    for (const project of projects) {
      if (!project.image_pairs) continue;
      project.image_pairs.forEach((pair, idx) => {
        if (pair.beforeImage && pair.afterImage) {
          items.push({
            projectSlug: project.slug,
            projectTitle: project.title[locale] || project.title.en,
            serviceType: project.service_type || 'other',
            locationCity: project.location_city,
            pair,
            pairIndex: idx,
          });
        }
      });
    }
    return items;
  }, [projects, locale]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return galleryItems;
    return galleryItems.filter((item) => item.serviceType === activeFilter);
  }, [galleryItems, activeFilter]);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: galleryItems.length };
    for (const item of galleryItems) {
      counts[item.serviceType] = (counts[item.serviceType] || 0) + 1;
    }
    return counts;
  }, [galleryItems]);

  // Pagination
  const totalPages = useMemo(() => Math.ceil(filteredItems.length / ITEMS_PER_PAGE), [filteredItems.length]);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | 'ellipsis')[] = [1];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    if (left > 2) pages.push('ellipsis');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const cityCount = useMemo(() => {
    return new Set(projects.map((p) => p.location_city)).size;
  }, [projects]);

  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-24" style={{ backgroundColor: SURFACE }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ color: NAVY }}>
            {t('hero.title')}
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-8" style={{ color: TEXT_MID }}>
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {[
              { value: galleryItems.length, label: t('stats.transformations') },
              { value: projects.length, label: t('stats.projects') },
              { value: cityCount, label: t('stats.cities') },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: GOLD }}>{stat.value}+</div>
                <div className="text-sm" style={{ color: TEXT_MUTED }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-6 sticky top-0 z-20" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal className="w-4 h-4 shrink-0" style={{ color: TEXT_MUTED }} />
            {SERVICE_FILTERS.map((filter) => {
              const count = filterCounts[filter] || 0;
              if (filter !== 'all' && count === 0) return null;
              const isActive = activeFilter === filter;
              return (
                <button key={filter} onClick={() => handleFilterChange(filter)}
                  className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200"
                  style={{ backgroundColor: isActive ? NAVY : CARD, color: isActive ? '#fff' : TEXT_MID, boxShadow: isActive ? '0 2px 8px rgba(27,54,93,0.3)' : neu(3) }}>
                  {t(`filters.${filter}`)} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section ref={galleryRef} className="py-12 sm:py-16 scroll-mt-16" style={{ backgroundColor: SURFACE }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filteredItems.length === 0 ? (
            <p className="text-center py-12" style={{ color: TEXT_MUTED }}>{t('noResults')}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {paginatedItems.map((item, idx) => {
                  const itemKey = `${item.projectSlug}-${item.pairIndex}`;
                  const isHovered = hoveredItem === itemKey;
                  const pairTitle = (item.pair.title && item.pair.title[locale]) || item.projectTitle;
                  return (
                    <Link key={itemKey} href={`/projects/${item.projectSlug}` as '/projects/[slug]'} locale={locale}
                      className="group block rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                      style={{ boxShadow: neu(6), backgroundColor: CARD }}
                      onMouseEnter={() => setHoveredItem(itemKey)} onMouseLeave={() => setHoveredItem(null)}>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <div className="absolute inset-0 w-1/2 overflow-hidden">
                          <OptimizedImage src={item.pair.beforeImage!.src}
                            alt={(item.pair.beforeImage!.alt && item.pair.beforeImage!.alt[locale]) || `${pairTitle} - Before`}
                            fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 17vw"
                            className="object-cover" loading={idx < 6 ? 'eager' : 'lazy'} />
                          <div className="absolute bottom-2 left-2 px-2 py-1 text-xs font-semibold text-white rounded"
                            style={{ backgroundColor: NAVY }}>{t('labels.before')}</div>
                        </div>
                        <div className="absolute inset-0 left-1/2 w-1/2 overflow-hidden">
                          <OptimizedImage src={item.pair.afterImage!.src}
                            alt={(item.pair.afterImage!.alt && item.pair.afterImage!.alt[locale]) || `${pairTitle} - After`}
                            fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 17vw"
                            className="object-cover object-right" loading={idx < 6 ? 'eager' : 'lazy'} />
                          <div className="absolute bottom-2 right-2 px-2 py-1 text-xs font-semibold text-white rounded"
                            style={{ backgroundColor: GOLD }}>{t('labels.after')}</div>
                        </div>
                        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white z-10" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 bg-white"
                          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                          <SlidersHorizontal className="w-4 h-4" style={{ color: NAVY }} />
                        </div>
                        <div className="absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 pointer-events-none"
                          style={{ backgroundColor: 'rgba(27,54,93,0.4)', opacity: isHovered ? 1 : 0 }}>
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-sm font-medium" style={{ color: NAVY }}>
                            <Eye className="w-4 h-4" />{t('labels.viewProject')}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold line-clamp-1 mb-1" style={{ color: TEXT }}>{pairTitle}</h3>
                        <div className="flex items-center gap-1 text-xs" style={{ color: TEXT_MUTED }}>
                          <MapPin className="w-3 h-3" />{item.locationCity}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="mt-10 flex items-center justify-center gap-2"
                  aria-label={t('pagination.label')}
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage > 1 ? 'cursor-pointer hover:translate-x-[-2px] hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}`}
                    style={{
                      color: currentPage > 1 ? NAVY : TEXT_MUTED,
                      boxShadow: currentPage > 1 ? neu(3) : undefined,
                      backgroundColor: CARD,
                    }}
                    aria-label={t('pagination.previousPage')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('pagination.previous')}</span>
                  </button>

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
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className="min-w-[40px] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer hover:shadow-lg"
                          style={{
                            color: pageNum === currentPage ? 'white' : NAVY,
                            backgroundColor: pageNum === currentPage ? GOLD : CARD,
                            boxShadow: pageNum === currentPage ? `0 4px 12px ${GOLD}44` : neu(3),
                          }}
                          aria-current={pageNum === currentPage ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage < totalPages ? 'cursor-pointer hover:translate-x-[2px] hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}`}
                    style={{
                      color: currentPage < totalPages ? NAVY : TEXT_MUTED,
                      boxShadow: currentPage < totalPages ? neu(3) : undefined,
                      backgroundColor: CARD,
                    }}
                    aria-label={t('pagination.nextPage')}
                  >
                    <span className="hidden sm:inline">{t('pagination.next')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      {/* Why Before and After Section */}
      <section className="py-12 sm:py-16" style={{ backgroundColor: SURFACE_ALT }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8" style={{ color: NAVY }}>
            {t('whySection.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(['transparency', 'quality', 'inspiration'] as const).map((key) => (
              <div key={key} className="rounded-2xl p-6" style={{ boxShadow: neu(5), backgroundColor: CARD }}>
                <h3 className="text-lg font-bold mb-2" style={{ color: TEXT }}>{t(`whySection.${key}.title`)}</h3>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_MID }}>{t(`whySection.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16" style={{ backgroundColor: SURFACE }}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8" style={{ color: NAVY }}>
            {t('faqSection.title')}
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <details key={i} className="rounded-2xl overflow-hidden group" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                <summary className="cursor-pointer px-6 py-4 text-sm font-semibold list-none flex items-center justify-between" style={{ color: TEXT }}>
                  {t(`faq.q${i}`)}
                  <ArrowRight className="w-4 h-4 transition-transform group-open:rotate-90 shrink-0 ml-2" style={{ color: GOLD }} />
                </summary>
                <div className="px-6 pb-4 text-sm leading-relaxed" style={{ color: TEXT_MID }}>{t(`faq.a${i}`)}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection heading={t("cta.heading")} subtitle={t("cta.subtitle")} />
    </main>
  );
}
