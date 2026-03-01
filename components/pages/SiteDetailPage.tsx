'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { MapPin, Calendar, DollarSign, Layers, Home, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/navigation';
import type { Company, LocalizedSiteWithProjects, LocalizedProject, LocalizedImagePair } from '@/lib/types';
import { BeforeAfterBadge } from '@/components/ImageBadge';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import ProductLink from '@/components/ProductLink';
import { SITE_IMAGE_SLUG } from '@/lib/db/helpers';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useFullscreenModal } from '@/hooks/useFullscreenModal';
import {
  NAVY, GOLD, GOLD_PALE, NAVY_90, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
} from '@/lib/theme';

interface SiteDetailPageProps {
  site: LocalizedSiteWithProjects;
  company: Company;
}

// Extended image pair with project attribution
interface AttributedImagePair extends LocalizedImagePair {
  projectSlug: string;
  projectTitle: string;
}

/** Minimum swipe distance in pixels to trigger navigation */
const SWIPE_THRESHOLD = 50;

export default function SiteDetailPage({ site, company }: SiteDetailPageProps) {
  const t = useTranslations();
  const [activePairIndex, setActivePairIndex] = useState(0);
  const [showBefore, setShowBefore] = useState(false);
  const [areaFilter, setAreaFilter] = useState<string>('all');

  // Build all image pairs from site and projects
  const allImagePairs = useMemo(() => {
    const pairs: AttributedImagePair[] = [];

    // Add site-level image pairs
    if (site.image_pairs) {
      for (const pair of site.image_pairs) {
        if (pair.beforeImage || pair.afterImage) {
          pairs.push({
            ...pair,
            projectSlug: SITE_IMAGE_SLUG,
            projectTitle: site.title,
          });
        }
      }
    }

    // Add project image pairs
    for (const project of site.projects) {
      if (project.image_pairs) {
        for (const pair of project.image_pairs) {
          if (pair.beforeImage || pair.afterImage) {
            pairs.push({
              ...pair,
              projectSlug: project.slug,
              projectTitle: project.title,
            });
          }
        }
      }
    }

    return pairs;
  }, [site]);

  // Filter pairs by selected project
  const filteredPairs = useMemo(() => {
    if (areaFilter === 'all') return allImagePairs;
    return allImagePairs.filter((pair) => pair.projectSlug === areaFilter);
  }, [allImagePairs, areaFilter]);

  // Area options for filter — use short category names with dedup (Kitchen, Kitchen 2)
  const areaOptions = useMemo(() => {
    const categoryCounts = new Map<string, number>();
    return site.projects.map((project) => {
      const cat = project.category;
      const count = (categoryCounts.get(cat) ?? 0) + 1;
      categoryCounts.set(cat, count);
      return { slug: project.slug, label: count > 1 ? `${cat} ${count}` : cat, category: cat };
    }).map((opt) => {
      // If a category appeared only once total, don't append "1"
      const total = categoryCounts.get(opt.category) ?? 1;
      return { slug: opt.slug, label: total > 1 ? opt.label : opt.category };
    });
  }, [site.projects]);

  // Reset when filter changes
  useEffect(() => {
    setActivePairIndex(0);
    setShowBefore(false);
  }, [areaFilter]);

  // Reset when site changes
  useEffect(() => {
    setActivePairIndex(0);
    setShowBefore(false);
    setAreaFilter('all');
  }, [site.slug]);

  const currentPair = filteredPairs[activePairIndex];
  const hasBothImages = !!(currentPair?.beforeImage && currentPair?.afterImage);

  // Current display image
  const displayImage = showBefore && currentPair?.beforeImage
    ? currentPair.beforeImage
    : currentPair?.afterImage || currentPair?.beforeImage;

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle before/after on click
  const handleImageClick = useCallback(() => {
    if (hasBothImages) {
      setShowBefore((prev) => !prev);
    }
  }, [hasBothImages]);

  // Select a pair from thumbnails
  const handleSelectPair = useCallback((index: number) => {
    setActivePairIndex(index);
    setShowBefore(false); // Reset to showing after when selecting new pair
  }, []);

  // Navigation handlers
  const goToPrev = useCallback(() => {
    setActivePairIndex((prev) => (prev > 0 ? prev - 1 : filteredPairs.length - 1));
    setShowBefore(false);
  }, [filteredPairs.length]);

  const goToNext = useCallback(() => {
    setActivePairIndex((prev) => (prev < filteredPairs.length - 1 ? prev + 1 : 0));
    setShowBefore(false);
  }, [filteredPairs.length]);

  // Swipe detection for touch devices
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        goToNext(); // Swipe left = next
      } else {
        goToPrev(); // Swipe right = prev
      }
    }
    touchStartX.current = null;
  }, [goToNext, goToPrev]);

  // Fullscreen handlers
  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  const fullscreenPrev = useCallback(() => {
    setActivePairIndex((prev) => (prev > 0 ? prev - 1 : filteredPairs.length - 1));
    setShowBefore(false);
  }, [filteredPairs.length]);

  const fullscreenNext = useCallback(() => {
    setActivePairIndex((prev) => (prev < filteredPairs.length - 1 ? prev + 1 : 0));
    setShowBefore(false);
  }, [filteredPairs.length]);

  const { overlayRef, captureTrigger } = useFullscreenModal({
    isOpen: isFullscreen,
    onClose: closeFullscreen,
    onPrev: filteredPairs.length > 1 ? fullscreenPrev : undefined,
    onNext: filteredPairs.length > 1 ? fullscreenNext : undefined,
  });

  const openFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    captureTrigger(e);
    setIsFullscreen(true);
  }, [captureTrigger]);

  // Drag to scroll for thumbnail strips with elastic bounce
  const {
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    wasJustDragging,
    stopPropagation,
  } = useDragScroll();

  // Thumbnail click handler (prevents firing after drag)
  const handleThumbClick = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (wasJustDragging()) {
      e.preventDefault();
      return;
    }
    handleSelectPair(index);
  }, [wasJustDragging, handleSelectPair]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      <VisualBreadcrumb variant="light" items={[
        { href: '/', label: t('nav.home') },
        { href: '/projects', label: t('nav.projects') },
        { label: site.title },
      ]} />

      {/* Hero Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Gallery - Image Pairs */}
            <div className="col-span-2">
              {/* Main Image */}
              <div
                className={`relative aspect-[4/3] rounded-2xl overflow-hidden${hasBothImages ? ' cursor-pointer' : ''}`}
                style={{ boxShadow: neu(6), backgroundColor: SURFACE_ALT }}
                onClick={hasBothImages ? handleImageClick : undefined}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {displayImage ? (
                  <>
                    <Image
                      src={displayImage.src}
                      alt={displayImage.alt || site.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 66vw"
                      className="object-contain"
                      priority
                    />
                    <BeforeAfterBadge
                      isBefore={showBefore && hasBothImages}
                      t={t}
                      showClickTip={hasBothImages}
                      hasPair={hasBothImages}
                    />

                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm" style={{ color: TEXT_MUTED }}>
                      {t('wholeHouse.noImagesForArea')}
                    </p>
                  </div>
                )}
                {site.badge && (
                  <span
                    className="absolute top-4 right-4 px-3 py-1 rounded-lg text-sm font-semibold text-white"
                    style={{ backgroundColor: GOLD }}
                  >
                    {site.badge}
                  </span>
                )}
                {/* bottom-14 on mobile clears 30px thumbnails + p-3 padding; bottom-24 on desktop clears 60px thumbnails */}
                {currentPair && currentPair.projectSlug !== SITE_IMAGE_SLUG && (
                  <span
                    className="absolute bottom-14 sm:bottom-24 left-4 px-3 py-1 rounded-lg text-xs font-medium z-10"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
                  >
                    {currentPair.projectTitle}
                  </span>
                )}

                {/* Navigation arrows */}
                {filteredPairs.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer hidden sm:block"
                      aria-label={t('projects.previousImage')}
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); goToNext(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer hidden sm:block"
                      aria-label={t('projects.nextImage')}
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}

                {/* Thumbnail Strip - Inside image, bottom left with horizontal scroll */}
                {filteredPairs.length > 1 && (
                  <div
                    className="absolute bottom-0 left-0 right-12 z-40 overflow-x-auto cursor-grab select-none touch-pan-x"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.5) transparent' }}
                    onClick={stopPropagation}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onPointerMove={handlePointerMove}
                  >
                    <div className="flex gap-1.5 p-3">
                      {filteredPairs.map((pair, idx) => (
                        <button
                          key={`${pair.projectSlug}-${idx}`}
                          onClick={(e) => handleThumbClick(e, idx)}
                          className={`relative rounded-lg overflow-hidden shrink-0 transition-all duration-200 h-[30px] sm:h-[60px] ${
                            pair.beforeImage && pair.afterImage ? 'w-[45px] sm:w-[90px]' : 'w-[30px] sm:w-[60px]'
                          } ${idx === activePairIndex ? 'opacity-85 sm:opacity-100' : 'opacity-50 sm:opacity-75'}`}
                          aria-label={`${t('projects.viewImage')} ${idx + 1} / ${filteredPairs.length}`}
                          aria-pressed={idx === activePairIndex}
                          style={{
                            outline: idx === activePairIndex ? '2px solid white' : '1px solid rgba(255,255,255,0.5)',
                            outlineOffset: '1px',
                          }}
                        >
                          {pair.beforeImage && pair.afterImage ? (
                            // Split view: before on left, after on right
                            <div className="flex h-full">
                              <div className="relative w-1/2 h-full">
                                <Image
                                  src={pair.beforeImage.src}
                                  alt={pair.beforeImage.alt || `${site.title} - ${t('projects.beforeLabel')}`}
                                  fill
                                  sizes="45px"
                                  className="object-cover"
                                />
                                <span
                                  className="absolute bottom-0.5 left-0.5 px-0.5 py-px text-[6px] font-semibold rounded text-white"
                                  style={{ backgroundColor: NAVY_90 }}
                                >
                                  {t('projects.beforeLabel')}
                                </span>
                              </div>
                              <div className="w-px bg-white/80" />
                              <div className="relative w-1/2 h-full">
                                <Image
                                  src={pair.afterImage.src}
                                  alt={pair.afterImage.alt || `${site.title} - ${t('projects.afterLabel')}`}
                                  fill
                                  sizes="45px"
                                  className="object-cover"
                                />
                                <span
                                  className="absolute bottom-0.5 right-0.5 px-0.5 py-px text-[6px] font-semibold rounded text-white"
                                  style={{ backgroundColor: GOLD }}
                                >
                                  {t('projects.afterLabel')}
                                </span>
                              </div>
                            </div>
                          ) : (
                            // Single image (before or after only)
                            <div className="relative w-full h-full">
                              <Image
                                src={(pair.afterImage || pair.beforeImage)!.src}
                                alt={(pair.afterImage || pair.beforeImage)!.alt || site.title}
                                fill
                                sizes="60px"
                                className="object-cover"
                              />
                              {pair.beforeImage && !pair.afterImage && (
                                <span
                                  className="absolute bottom-0.5 left-0.5 px-0.5 py-px text-[6px] font-semibold rounded text-white"
                                  style={{ backgroundColor: NAVY_90 }}
                                >
                                  {t('projects.beforeLabel')}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fullscreen button - bottom right */}
                {displayImage && (
                  <button
                    onClick={openFullscreen}
                    className="absolute bottom-3 right-3 z-40 p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors cursor-pointer"
                    aria-label={t('projects.viewFullscreen')}
                  >
                    <ZoomIn className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>

              {/* Area filter */}
              <div className="flex gap-2 mt-4 flex-wrap" role="tablist" aria-label={t('wholeHouse.filterByArea')}>
                <button
                  role="tab"
                  aria-selected={areaFilter === 'all'}
                  onClick={() => setAreaFilter('all')}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: areaFilter === 'all' ? GOLD : SURFACE_ALT,
                    color: areaFilter === 'all' ? 'white' : TEXT_MID,
                  }}
                >
                  {t('wholeHouse.allAreas')}
                </button>
                {areaOptions.map((area) => (
                  <button
                    key={area.slug}
                    role="tab"
                    aria-selected={areaFilter === area.slug}
                    onClick={() => setAreaFilter(area.slug)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: areaFilter === area.slug ? GOLD : SURFACE_ALT,
                      color: areaFilter === area.slug ? 'white' : TEXT_MID,
                    }}
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-5 h-5" style={{ color: GOLD }} />
                <span className="text-sm font-medium" style={{ color: GOLD }}>
                  {t('wholeHouse.projectOverview')}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: TEXT }}>
                {site.title}
              </h1>
              <p className="text-base mb-6" style={{ color: TEXT_MID }}>
                {site.description}
              </p>

              {/* Aggregated Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                {site.location_city && (
                  <div className="rounded-xl p-3 sm:p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('modal.location')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {site.location_city}
                    </span>
                  </div>
                )}
                {site.duration && (
                  <div className="rounded-xl p-3 sm:p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('wholeHouse.totalDuration')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {site.duration}
                    </span>
                  </div>
                )}
                {site.budget_range && (
                  <div className="rounded-xl p-3 sm:p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('wholeHouse.totalBudget')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {site.budget_range}
                    </span>
                  </div>
                )}
                <div className="rounded-xl p-3 sm:p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4" style={{ color: GOLD }} />
                    <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                      {t('wholeHouse.includedAreas')}
                    </span>
                  </div>
                  <span className="text-base font-semibold" style={{ color: TEXT }}>
                    {site.projects.length} {t('wholeHouse.areas')}
                  </span>
                </div>
              </div>

              {/* Aggregated Service Scope */}
              {site.aggregated.allServiceScopes.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-3" style={{ color: TEXT_MUTED }}>
                    {t('wholeHouse.allServiceScopes')}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {site.aggregated.allServiceScopes.map((scope) => (
                      <span
                        key={scope}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: GOLD_PALE, color: GOLD }}
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External Products Used */}
              {site.aggregated.allExternalProducts && site.aggregated.allExternalProducts.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-3" style={{ color: TEXT_MUTED }}>
                    {t('projects.externalProducts')}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {site.aggregated.allExternalProducts.map((ep) => (
                      <ProductLink key={ep.url} product={ep} />
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-xl text-base font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110"
                  style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
                >
                  {t('cta.getFreeQuote')}
                </Link>
                <a
                  href={`tel:${company.phone}`}
                  className="px-6 py-3 rounded-xl text-base font-semibold cursor-pointer transition-all duration-200"
                  style={{ boxShadow: neu(4), backgroundColor: CARD, color: TEXT }}
                >
                  {t('cta.callNow')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Area Breakdown Section */}
      {site.projects.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-2" style={{ color: TEXT }}>
              {t('wholeHouse.includedAreas')}
            </h2>
            <p className="text-sm mb-8" style={{ color: TEXT_MID }}>
              {t('wholeHouse.childProjectsCount', { count: site.projects.length })}
            </p>
            <div className="space-y-8">
              {site.projects.map((project, index) => (
                <AreaDetailCard key={project.slug} project={project} t={t} isEven={index % 2 === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fullscreen Image Overlay */}
      {isFullscreen && displayImage && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={site.title}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeFullscreen}
        >
          {/* Close button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            aria-label={t('modal.close')}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Before/After Badge in fullscreen */}
          {hasBothImages && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
              <span
                className="px-3 py-1.5 text-sm rounded-lg font-semibold text-white"
                style={{ backgroundColor: showBefore ? NAVY : GOLD }}
              >
                {showBefore ? t('projects.beforeLabel') : t('projects.afterLabel')}
              </span>
              <span className="text-white/70 text-sm">
                {t('projects.clickToToggle')}
              </span>
            </div>
          )}

          {/* Previous arrow */}
          {filteredPairs.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); fullscreenPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer hidden sm:block"
              aria-label={t('projects.previousImage')}
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Next arrow */}
          {filteredPairs.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); fullscreenNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer hidden sm:block"
              aria-label={t('projects.nextImage')}
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Fullscreen image */}
          <div
            className={`relative w-full h-full max-w-[90vw] max-h-[80vh]${hasBothImages ? ' cursor-pointer' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (hasBothImages) {
                setShowBefore((prev) => !prev);
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={displayImage.src}
              alt={displayImage.alt || site.title}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Thumbnail strip in fullscreen with horizontal scroll */}
          {filteredPairs.length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 max-w-[90vw] overflow-x-auto cursor-grab select-none touch-pan-x"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.5) transparent' }}
              onClick={stopPropagation}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerMove={handlePointerMove}
            >
              <div className="flex gap-2 p-4">
                {filteredPairs.map((pair, idx) => (
                  <button
                    key={`fs-${pair.projectSlug}-${idx}`}
                    onClick={(e) => handleThumbClick(e, idx)}
                    className="relative rounded-lg overflow-hidden shrink-0 transition-all duration-200"
                    aria-label={`${t('projects.viewImage')} ${idx + 1} / ${filteredPairs.length}`}
                    aria-pressed={idx === activePairIndex}
                    style={{
                      width: pair.beforeImage && pair.afterImage ? '100px' : '70px',
                      height: '70px',
                      outline: idx === activePairIndex ? '2px solid white' : '1px solid rgba(255,255,255,0.5)',
                      outlineOffset: '2px',
                      opacity: idx === activePairIndex ? 1 : 0.6,
                    }}
                  >
                    {pair.beforeImage && pair.afterImage ? (
                      <div className="flex h-full">
                        <div className="relative w-1/2 h-full">
                          <Image
                            src={pair.beforeImage.src}
                            alt={pair.beforeImage.alt || `${site.title} - ${t('projects.beforeLabel')}`}
                            fill
                            sizes="50px"
                            className="object-cover"
                          />
                        </div>
                        <div className="w-px bg-white/80" />
                        <div className="relative w-1/2 h-full">
                          <Image
                            src={pair.afterImage.src}
                            alt={pair.afterImage.alt || `${site.title} - ${t('projects.afterLabel')}`}
                            fill
                            sizes="50px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={(pair.afterImage || pair.beforeImage)!.src}
                          alt={(pair.afterImage || pair.beforeImage)!.alt || site.title}
                          fill
                          sizes="70px"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Detailed card for a project area within the site view */
function AreaDetailCard({
  project,
  t,
  isEven,
}: {
  project: LocalizedProject;
  t: ReturnType<typeof useTranslations>;
  isEven: boolean;
}) {
  // Flatten image pairs into individual images for grid display
  const cardImages = useMemo(() => {
    const imgs: { src: string; alt: string; is_before?: boolean }[] = [];
    if (project.image_pairs && project.image_pairs.length > 0) {
      // Extract individual images from pairs — after images first for better visual
      for (const pair of project.image_pairs) {
        if (pair.afterImage) imgs.push({ src: pair.afterImage.src, alt: pair.afterImage.alt, is_before: false });
        if (pair.beforeImage) imgs.push({ src: pair.beforeImage.src, alt: pair.beforeImage.alt, is_before: true });
      }
    } else if (project.images && project.images.length > 0) {
      imgs.push(...project.images);
    }
    return imgs.slice(0, 4);
  }, [project.image_pairs, project.images]);

  const hasMultipleImages = cardImages.length > 1;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ boxShadow: neu(4), backgroundColor: CARD }}
    >
      <div className={`grid ${hasMultipleImages ? 'lg:grid-cols-2' : cardImages.length === 1 ? 'lg:grid-cols-5' : 'lg:grid-cols-1'} gap-0`}>
        {/* Image Section */}
        {cardImages.length > 0 && (
          <div className={`${hasMultipleImages ? 'flex items-center' : 'lg:col-span-2'} ${!isEven && hasMultipleImages ? 'lg:order-2' : ''}`}>
            {hasMultipleImages ? (
              <div className="grid grid-cols-2 gap-1 w-full">
                {cardImages.map((img) => (
                  <div key={img.src} className="relative aspect-square">
                    <Image
                      src={img.src}
                      alt={img.alt || project.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    {img.is_before && (
                      <span
                        className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded text-white"
                        style={{ backgroundColor: 'rgba(27,54,93,0.8)' }}
                      >
                        {t('projects.beforeLabel')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full min-h-[250px]">
                <Image
                  src={cardImages[0].src}
                  alt={cardImages[0].alt || project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
                {cardImages[0].is_before && (
                  <span
                    className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded text-white"
                    style={{ backgroundColor: 'rgba(27,54,93,0.8)' }}
                  >
                    {t('projects.beforeLabel')}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className={`${!hasMultipleImages && cardImages.length === 1 ? 'lg:col-span-3' : ''} p-6 lg:p-8 flex flex-col`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
                style={{ backgroundColor: GOLD_PALE, color: GOLD }}
              >
                {project.category}
              </span>
              <h3 className="text-xl font-bold" style={{ color: TEXT }}>
                {project.title}
              </h3>
            </div>
            <div className="flex gap-3 text-sm" style={{ color: TEXT_MID }}>
              {project.duration && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {project.duration}
                </span>
              )}
              {project.budget_range && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {project.budget_range}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm mb-4" style={{ color: TEXT_MID }}>
            {project.description}
          </p>

          {/* Challenge & Solution */}
          {(project.challenge || project.solution) && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {project.challenge && (
                <div className="rounded-lg p-4" style={{ backgroundColor: SURFACE_ALT }}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>
                    {t('modal.challenge')}
                  </h4>
                  <p className="text-sm" style={{ color: TEXT_MID }}>
                    {project.challenge}
                  </p>
                </div>
              )}
              {project.solution && (
                <div className="rounded-lg p-4" style={{ backgroundColor: SURFACE_ALT }}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>
                    {t('modal.solution')}
                  </h4>
                  <p className="text-sm" style={{ color: TEXT_MID }}>
                    {project.solution}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Service Scope */}
          {project.service_scope && project.service_scope.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>
                {t('modal.serviceScope')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.service_scope.map((scope) => (
                  <span
                    key={scope}
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: SURFACE_ALT, color: TEXT_MID }}
                  >
                    {scope}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External Products */}
          {project.external_products && project.external_products.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>
                {t('projects.externalProducts')}
              </h4>
              <div className="flex flex-col gap-1">
                {project.external_products.slice(0, 3).map((ep) => (
                  <ProductLink key={ep.url} product={ep} size="sm" />
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-4">
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:brightness-110"
              style={{ color: GOLD }}
            >
              {t('wholeHouse.viewAreaDetails')} &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
