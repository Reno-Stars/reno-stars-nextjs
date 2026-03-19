'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { X, MapPin, Tag, DollarSign, Home, Wrench, Clock, ArrowRight, ExternalLink, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import type { DisplayProject, LocalizedImagePair } from '@/lib/types';
import { imagesToPairs } from '@/lib/data/projects';
import { BeforeAfterBadge } from '@/components/ImageBadge';
import ProductLink from '@/components/ProductLink';
import {
  GOLD, GOLD_PALE, NAVY_90, SURFACE, SURFACE_ALT, SH_DARK,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu, neuIn,
} from '@/lib/theme';

interface ProjectModalProps {
  project: DisplayProject | null;
  onClose: () => void;
}

// Minimum swipe distance to trigger navigation (in pixels)
const SWIPE_THRESHOLD = 50;

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const t = useTranslations();
  const [activePairIndex, setActivePairIndex] = useState(0);
  const [showBefore, setShowBefore] = useState(false);
  const [visible, setVisible] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Build image pairs from image_pairs field, falling back to legacy images array
  const imagePairs = useMemo((): LocalizedImagePair[] => {
    if (!project) return [];
    if (project.image_pairs && project.image_pairs.length > 0) {
      return project.image_pairs;
    }
    if (project.images && project.images.length > 0) {
      return imagesToPairs(project.images);
    }
    // Last resort: hero image as single pair
    return [{ afterImage: { src: project.hero_image, alt: project.title } }];
  }, [project]);

  const currentPair = imagePairs[activePairIndex];
  const hasBothImages = !!(currentPair?.beforeImage && currentPair?.afterImage);
  const displayImage = showBefore && currentPair?.beforeImage
    ? currentPair.beforeImage
    : currentPair?.afterImage || currentPair?.beforeImage;

  // Store length in ref for stable callbacks
  const pairsLengthRef = useRef(imagePairs.length);
  pairsLengthRef.current = imagePairs.length;

  const handleClose = useCallback(() => {
    setVisible(false);
    closeTimerRef.current = setTimeout(() => onClose(), 200);
  }, [onClose]);

  // Toggle before/after on click
  const handleImageClick = useCallback(() => {
    if (hasBothImages) {
      setShowBefore((prev) => !prev);
    }
  }, [hasBothImages]);

  const handlePrevPair = useCallback(() => {
    setSlideDirection('right');
    setActivePairIndex((prev) => (prev > 0 ? prev - 1 : pairsLengthRef.current - 1));
    setShowBefore(false);
  }, []);

  const handleNextPair = useCallback(() => {
    setSlideDirection('left');
    setActivePairIndex((prev) => (prev < pairsLengthRef.current - 1 ? prev + 1 : 0));
    setShowBefore(false);
  }, []);

  // Touch swipe handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || pairsLengthRef.current <= 1) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;

    // Only trigger swipe if horizontal movement is greater than vertical (avoid scroll conflicts)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) {
        handleNextPair();
      } else {
        handlePrevPair();
      }
    }

    touchStartRef.current = null;
  }, [handleNextPair, handlePrevPair]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
    if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrevPair(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); handleNextPair(); }
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [handleClose, handlePrevPair, handleNextPair]);

  useEffect(() => {
    if (!project) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => setVisible(true));
    const closeButton = modalRef.current?.querySelector<HTMLElement>('button');
    closeButton?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [project, handleKeyDown]);

  // Reset to first pair (showing after) when project changes
  useEffect(() => {
    if (!project) return;
    setActivePairIndex(0);
    setShowBefore(false);
  }, [project]);

  if (!project) return null;

  // For whole house sites, use aggregated data; otherwise use project data
  const isSite = project.isSiteProject;
  const sidebarItems = [
    { icon: MapPin, label: t('modal.location'), value: project.location_city },
    { icon: Tag, label: t('modal.category'), value: project.category },
    { icon: DollarSign, label: t('modal.budget'), value: isSite ? project.totalBudget : project.budget_range },
    { icon: Home, label: t('modal.spaceType'), value: project.space_type },
    { icon: Clock, label: t('modal.duration'), value: isSite ? project.totalDuration : project.duration },
  ];

  // Areas included (for whole house sites)
  const childAreas = isSite ? project.childAreas : undefined;
  // Service scopes (for whole house sites, use aggregated; otherwise use project)
  const serviceScopes = isSite ? project.allServiceScopes : project.service_scope;
  // External products (for whole house sites, use aggregated; otherwise use project)
  const externalProducts = isSite ? project.allExternalProducts : project.external_products;

  return (
    <>
      {/* Slide animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-in-left {
          from { transform: translateX(100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(-100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes slide-in-left { from, to { transform: none; opacity: 1; } }
          @keyframes slide-in-right { from, to { transform: none; opacity: 1; } }
        }
      `}} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 transition-opacity duration-200"
        style={{
          opacity: visible ? 1 : 0,
          backgroundColor: 'rgba(27,54,93,0.45)',
          backdropFilter: 'blur(6px)',
        }}
        onClick={handleClose}
      >
        <div
          ref={modalRef}
          className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl transition-all duration-200"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.97)',
            backgroundColor: SURFACE,
            boxShadow: `0 25px 50px rgba(27,54,93,0.25)`,
            color: TEXT,
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4"
            style={{
              backgroundColor: SURFACE,
              boxShadow: `0 1px 3px ${SH_DARK}`,
            }}
          >
            <h2 id="modal-title" className="text-xl md:text-2xl font-bold truncate pr-4" style={{ color: TEXT }}>
              {project.title}
            </h2>
            <button
              onClick={handleClose}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              style={{
                boxShadow: neu(3),
                backgroundColor: CARD,
                color: TEXT_MID,
              }}
              aria-label={t('modal.close')}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row overflow-hidden">
            {/* Gallery + description */}
            <div className="flex-1 min-w-0 p-4 sm:p-6">
              <div
                className={`relative overflow-hidden rounded-xl aspect-[16/10] mb-4 group${hasBothImages ? ' cursor-pointer' : ''}`}
                style={{ boxShadow: neuIn(4), backgroundColor: SURFACE_ALT }}
                role={hasBothImages ? 'button' : undefined}
                aria-label={hasBothImages ? `Toggle to ${showBefore ? 'after' : 'before'} photo` : undefined}
                onClick={handleImageClick}
              >
                {/* Animated image wrapper — key only changes on pair navigation, not before/after toggle */}
                {displayImage && (
                  <div
                    key={activePairIndex}
                    className="absolute inset-0"
                    style={{
                      animation: slideDirection
                        ? `slide-in-${slideDirection} 0.3s ease-out`
                        : undefined,
                    }}
                    onAnimationEnd={() => setSlideDirection(null)}
                  >
                    <Image
                      key={`${activePairIndex}-${showBefore}`}
                      src={displayImage.src}
                      alt={displayImage.alt || `${project.title} - renovation project photo`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-contain"
                    />
                  </div>
                )}
                {/* Touch swipe overlay */}
                {imagePairs.length > 1 && (
                  <div
                    className="absolute inset-0 z-[5]"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    style={{ touchAction: 'pan-y pinch-zoom' }}
                  />
                )}
                <BeforeAfterBadge
                  isBefore={showBefore && hasBothImages}
                  t={t}
                  showClickTip={hasBothImages}
                  hasPair={hasBothImages}
                />

                {/* Navigation arrows */}
                {imagePairs.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrevPair(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full hidden sm:flex items-center justify-center transition-all sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer hover:scale-110 z-20"
                      style={{ backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: neu(3), color: TEXT }}
                      aria-label={t('lightbox.previous')}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNextPair(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full hidden sm:flex items-center justify-center transition-all sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer hover:scale-110 z-20"
                      style={{ backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: neu(3), color: TEXT }}
                      aria-label={t('lightbox.next')}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Image counter */}
                    <div
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-sm font-medium z-20"
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
                    >
                      {activePairIndex + 1} / {imagePairs.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails — split before/after like detail page */}
              {imagePairs.length > 1 && (
                <div className="mb-4 -mx-2">
                  <div className="flex gap-2 overflow-x-auto py-1 px-2" role="group" aria-label="Image thumbnails">
                    {imagePairs.map((pair, idx) => (
                      <button
                        key={`${(pair.afterImage || pair.beforeImage)?.src}-${idx}`}
                        onClick={() => { setActivePairIndex(idx); setShowBefore(false); }}
                        className={`relative rounded-lg overflow-hidden shrink-0 transition-all duration-200 cursor-pointer h-[30px] sm:h-[48px] ${
                          pair.beforeImage && pair.afterImage ? 'w-[45px] sm:w-[72px]' : 'w-[30px] sm:w-[48px]'
                        }`}
                        style={{
                          boxShadow: idx === activePairIndex ? `0 0 0 2px ${GOLD}` : neu(2),
                          opacity: idx === activePairIndex ? 1 : 0.7,
                        }}
                        aria-label={`${t('projects.viewImage')} ${idx + 1} / ${imagePairs.length}`}
                        aria-pressed={idx === activePairIndex}
                      >
                        {pair.beforeImage && pair.afterImage ? (
                          <div className="flex h-full">
                            <div className="relative w-1/2 h-full">
                              <Image
                                src={pair.beforeImage.src}
                                alt={pair.beforeImage.alt || `${project.title} - ${t('projects.beforeLabel')}`}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                              <span
                                className="absolute bottom-0 left-0 px-0.5 py-px text-[5px] font-semibold rounded-tr text-white"
                                style={{ backgroundColor: NAVY_90 }}
                              >
                                {t('projects.beforeLabel')}
                              </span>
                            </div>
                            <div className="w-px bg-white/80" />
                            <div className="relative w-1/2 h-full">
                              <Image
                                src={pair.afterImage.src}
                                alt={pair.afterImage.alt || `${project.title} - ${t('projects.afterLabel')}`}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                              <span
                                className="absolute bottom-0 right-0 px-0.5 py-px text-[5px] font-semibold rounded-tl text-white"
                                style={{ backgroundColor: GOLD }}
                              >
                                {t('projects.afterLabel')}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-full">
                            <Image
                              src={(pair.afterImage || pair.beforeImage)!.src}
                              alt={(pair.afterImage || pair.beforeImage)!.alt || project.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                            {pair.beforeImage && !pair.afterImage && (
                              <span
                                className="absolute bottom-0 left-0 px-0.5 py-px text-[5px] font-semibold rounded-tr text-white"
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

              <p className="text-sm sm:text-base leading-relaxed mb-4 sm:mb-8" style={{ color: TEXT_MID }}>
                {project.description}
              </p>

              {project.challenge && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: TEXT }}>{t('modal.challenge')}</h3>
                    <p className="leading-relaxed" style={{ color: TEXT_MID }}>{project.challenge}</p>
                  </div>
                  {project.solution && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: TEXT }}>{t('modal.solution')}</h3>
                      <p className="leading-relaxed" style={{ color: TEXT_MID }}>{project.solution}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div
              className="w-full lg:w-72 flex-shrink-0 p-4 sm:p-6"
              style={{
                backgroundColor: SURFACE_ALT,
                boxShadow: `inset 2px 0 4px -2px ${SH_DARK}`,
              }}
            >
              {/* Key details — 2-col grid on mobile, single column on desktop sidebar */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-5">
                {sidebarItems.map(({ icon: Icon, label, value }) =>
                  value ? (
                    <div key={label}>
                      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide mb-1" style={{ color: TEXT_MUTED }}>
                        <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" style={{ color: GOLD }} />
                        {label}
                      </div>
                      <div className="text-sm lg:text-base font-medium" style={{ color: TEXT }}>{value}</div>
                    </div>
                  ) : null
                )}
              </div>

              {/* Tags & links — always full width */}
              <div className="mt-4 space-y-3 sm:space-y-4 lg:space-y-5">
                {/* Areas Included (for whole house sites) */}
                {childAreas && childAreas.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide mb-2" style={{ color: TEXT_MUTED }}>
                      <Layers className="w-4 h-4" style={{ color: GOLD }} />
                      {t('wholeHouse.includedAreas')}
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {childAreas.map((area) => (
                        <span
                          key={area}
                          className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: GOLD_PALE, color: GOLD }}
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Scope */}
                {serviceScopes && serviceScopes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide mb-2" style={{ color: TEXT_MUTED }}>
                      <Wrench className="w-4 h-4" style={{ color: GOLD }} />
                      {t('modal.serviceScope')}
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {serviceScopes.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: GOLD_PALE, color: GOLD }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {externalProducts && externalProducts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide mb-2" style={{ color: TEXT_MUTED }}>
                      <ExternalLink className="w-4 h-4" style={{ color: GOLD }} />
                      {t('projects.externalProducts')}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {externalProducts.map((ep) => (
                        <ProductLink key={ep.url} product={ep} size="sm" />
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href={`/projects/${project.slug}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110"
                  style={{
                    backgroundColor: GOLD,
                    boxShadow: `0 4px 20px ${GOLD}44`,
                  }}
                  onClick={handleClose}
                >
                  {t('modal.viewDetails')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
