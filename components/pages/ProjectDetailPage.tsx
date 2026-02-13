'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { MapPin, Calendar, DollarSign, Layers, ExternalLink, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/navigation';
import type { Locale } from '@/i18n/config';
import type { Company, Project, LocalizedProject, LocalizedImagePair } from '@/lib/types';
import { getLocalizedProject, imagesToPairs } from '@/lib/data/projects';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';
import { BeforeAfterBadge } from '@/components/ImageBadge';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import { useDragScroll } from '@/hooks/useDragScroll';
import {
  NAVY, GOLD, GOLD_PALE, NAVY_90, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
} from '@/lib/theme';

interface ProjectDetailPageProps {
  locale: Locale;
  project: Project;
  allProjects: Project[];
  company: Company;
}

/** Minimum swipe distance in pixels to trigger navigation */
const SWIPE_THRESHOLD = 50;

export default function ProjectDetailPage({ locale, project, allProjects, company }: ProjectDetailPageProps) {
  const t = useTranslations();
  const localizedProject = useMemo(() => getLocalizedProject(project, locale), [project, locale]);

  // Get image pairs (prefer new structure, fallback to legacy)
  const imagePairs = useMemo((): LocalizedImagePair[] => {
    if (localizedProject.image_pairs && localizedProject.image_pairs.length > 0) {
      return localizedProject.image_pairs;
    }
    if (localizedProject.images && localizedProject.images.length > 0) {
      return imagesToPairs(localizedProject.images);
    }
    return [];
  }, [localizedProject.image_pairs, localizedProject.images]);

  const [activePairIndex, setActivePairIndex] = useState(0);
  const [showBefore, setShowBefore] = useState(false);
  const [selectedProject, setSelectedProject] = useState<LocalizedProject | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset when project changes
  useEffect(() => {
    setActivePairIndex(0);
    setShowBefore(false);
  }, [project.slug]);

  const currentPair = imagePairs[activePairIndex];
  const hasBothImages = !!(currentPair?.beforeImage && currentPair?.afterImage);

  // Current display image (show after first, before when toggled)
  const displayImage = showBefore && currentPair?.beforeImage
    ? currentPair.beforeImage
    : currentPair?.afterImage || currentPair?.beforeImage;

  const handleCardClick = useCallback((p: LocalizedProject) => {
    setSelectedProject(p);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedProject(null);
  }, []);

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
    setActivePairIndex((prev) => (prev > 0 ? prev - 1 : imagePairs.length - 1));
    setShowBefore(false);
  }, [imagePairs.length]);

  const goToNext = useCallback(() => {
    setActivePairIndex((prev) => (prev < imagePairs.length - 1 ? prev + 1 : 0));
    setShowBefore(false);
  }, [imagePairs.length]);

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
  const openFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen(true);
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

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

  const relatedProjects = useMemo(() => {
    return allProjects
      .filter((p) => p.slug !== project.slug && p.service_type === project.service_type)
      .map((p) => getLocalizedProject(p, locale))
      .slice(0, 3);
  }, [allProjects, project.slug, project.service_type, locale]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: SURFACE }}>
      <VisualBreadcrumb variant="light" items={[
        { href: '/', label: t('nav.home') },
        { href: '/projects', label: t('nav.projects') },
        { label: localizedProject.title },
      ]} />

      {/* Main Content */}
      <section className="py-10 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Gallery - Image Pairs with Before/After Toggle */}
            <div>
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
                      alt={displayImage.alt || localizedProject.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
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
                      {t('projects.noImages')}
                    </p>
                  </div>
                )}
                {localizedProject.badge && (
                  <span
                    className="absolute top-4 right-4 px-3 py-1 rounded-lg text-sm font-semibold text-white"
                    style={{ backgroundColor: GOLD }}
                  >
                    {localizedProject.badge}
                  </span>
                )}

                {/* Navigation arrows */}
                {imagePairs.length > 1 && (
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
                {imagePairs.length > 1 && (
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
                      {imagePairs.map((pair, idx) => (
                        <button
                          key={`${pair.afterImage?.src || pair.beforeImage?.src || idx}-${idx}`}
                          onClick={(e) => handleThumbClick(e, idx)}
                          className={`relative rounded-lg overflow-hidden shrink-0 transition-all duration-200 h-[30px] sm:h-[60px] ${
                            pair.beforeImage && pair.afterImage ? 'w-[45px] sm:w-[90px]' : 'w-[30px] sm:w-[60px]'
                          } ${idx === activePairIndex ? 'opacity-85 sm:opacity-100' : 'opacity-50 sm:opacity-75'}`}
                          aria-label={`${t('projects.viewImage')} ${idx + 1} / ${imagePairs.length}`}
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
                                  alt={pair.beforeImage.alt || 'Before'}
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
                                  alt={pair.afterImage.alt || 'After'}
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
                                alt={(pair.afterImage || pair.beforeImage)!.alt || localizedProject.title}
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
            </div>

            {/* Details */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: TEXT }}>
                {localizedProject.title}
              </h1>
              <p className="text-base mb-6" style={{ color: TEXT_MID }}>
                {localizedProject.description}
              </p>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                <div className="rounded-xl p-3 sm:p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4" style={{ color: GOLD }} />
                    <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                      {t('modal.location')}
                    </span>
                  </div>
                  <span className="text-base font-semibold" style={{ color: TEXT }}>
                    {localizedProject.location_city}
                  </span>
                </div>
                {localizedProject.duration && (
                  <div className="rounded-xl p-3 sm:p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('modal.duration')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {localizedProject.duration}
                    </span>
                  </div>
                )}
                {localizedProject.budget_range && (
                  <div className="rounded-xl p-3 sm:p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('modal.budget')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {localizedProject.budget_range}
                    </span>
                  </div>
                )}
                {localizedProject.space_type && (
                  <div className="rounded-xl p-3 sm:p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('modal.spaceType')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {localizedProject.space_type}
                    </span>
                  </div>
                )}
              </div>

              {/* Service Scope */}
              {localizedProject.service_scope && localizedProject.service_scope.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-3" style={{ color: TEXT_MUTED }}>
                    {t('modal.serviceScope')}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {localizedProject.service_scope.map((scope) => (
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

              {/* External Products */}
              {localizedProject.external_products && localizedProject.external_products.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-3" style={{ color: TEXT_MUTED }}>
                    {t('projects.externalProducts')}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {localizedProject.external_products.map((ep) => (
                      <a
                        key={ep.url}
                        href={ep.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:brightness-95"
                        style={{ boxShadow: neu(3), backgroundColor: CARD }}
                      >
                        {ep.image_url && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: SURFACE_ALT }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ep.image_url} alt={ep.label} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="flex-1 text-sm font-medium" style={{ color: TEXT }}>
                          {ep.label}
                        </span>
                        <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: TEXT_MUTED }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenge & Solution */}
              {localizedProject.challenge && (
                <div className="mb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>
                    {t('modal.challenge')}
                  </h2>
                  <p className="text-base" style={{ color: TEXT_MID }}>
                    {localizedProject.challenge}
                  </p>
                </div>
              )}
              {localizedProject.solution && (
                <div className="mb-6">
                  <h2 className="text-base font-bold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>
                    {t('modal.solution')}
                  </h2>
                  <p className="text-base" style={{ color: TEXT_MID }}>
                    {localizedProject.solution}
                  </p>
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

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-8" style={{ color: TEXT }}>
              {t('projects.relatedProjects')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((rp) => (
                <ProjectCard key={rp.slug} project={rp} onClick={handleCardClick} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ProjectModal
        project={selectedProject}
        onClose={handleModalClose}
      />

      {/* Fullscreen Image Overlay */}
      {isFullscreen && displayImage && (
        <div
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
          {imagePairs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePairIndex((prev) => (prev > 0 ? prev - 1 : imagePairs.length - 1));
                setShowBefore(false);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer hidden sm:block"
              aria-label={t('projects.previousImage')}
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Next arrow */}
          {imagePairs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePairIndex((prev) => (prev < imagePairs.length - 1 ? prev + 1 : 0));
                setShowBefore(false);
              }}
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
              alt={displayImage.alt || localizedProject.title}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Thumbnail strip in fullscreen with horizontal scroll */}
          {imagePairs.length > 1 && (
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
                {imagePairs.map((pair, idx) => (
                  <button
                    key={`fs-${pair.afterImage?.src || pair.beforeImage?.src || idx}-${idx}`}
                    onClick={(e) => handleThumbClick(e, idx)}
                    className="relative rounded-lg overflow-hidden shrink-0 transition-all duration-200"
                    aria-label={`${t('projects.viewImage')} ${idx + 1} / ${imagePairs.length}`}
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
                            alt={pair.beforeImage.alt || 'Before'}
                            fill
                            sizes="50px"
                            className="object-cover"
                          />
                        </div>
                        <div className="w-px bg-white/80" />
                        <div className="relative w-1/2 h-full">
                          <Image
                            src={pair.afterImage.src}
                            alt={pair.afterImage.alt || 'After'}
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
                          alt={(pair.afterImage || pair.beforeImage)!.alt || localizedProject.title}
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
