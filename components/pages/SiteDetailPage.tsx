'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, MapPin, Calendar, DollarSign, Layers, X, Home } from 'lucide-react';
import { Link } from '@/navigation';
import type { Company, LocalizedSiteWithProjects, LocalizedProject } from '@/lib/types';
import { BeforeAfterBadge } from '@/components/ImageBadge';
import VisualBreadcrumb from '@/components/VisualBreadcrumb';
import ProductLink from '@/components/ProductLink';
import { SITE_IMAGE_SLUG } from '@/lib/db/helpers';
import {
  GOLD, GOLD_PALE, SURFACE, SURFACE_ALT,
  CARD, TEXT, TEXT_MID, TEXT_MUTED, neu,
} from '@/lib/theme';

interface SiteDetailPageProps {
  site: LocalizedSiteWithProjects;
  company: Company;
}

export default function SiteDetailPage({ site, company }: SiteDetailPageProps) {
  const t = useTranslations();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [areaFilter, setAreaFilter] = useState<string>('all');

  // Find first "after" image index helper
  const findFirstAfterIndex = useCallback((images: { is_before?: boolean }[]) => {
    const idx = images.findIndex((img) => !img.is_before);
    return idx >= 0 ? idx : 0;
  }, []);

  useEffect(() => {
    setActiveImageIndex(findFirstAfterIndex(site.aggregated.allImages));
    setAreaFilter('all');
  }, [site.slug, site.aggregated.allImages, findFirstAfterIndex]);

  const handleLightboxClose = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const handleLightboxOpen = useCallback(() => {
    setLightboxOpen(true);
  }, []);

  const handleLightboxKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLightboxOpen(true);
    }
  }, []);

  // Filter images by selected project
  const filteredImages = useMemo(() => {
    if (areaFilter === 'all') return site.aggregated.allImages;
    return site.aggregated.allImages.filter((img) => img.projectSlug === areaFilter);
  }, [site.aggregated.allImages, areaFilter]);

  // Area options for filter - memoize based on projects
  const areaOptions = useMemo(() => {
    const areas = new Map<string, string>();
    site.projects.forEach((project) => {
      areas.set(project.slug, project.title);
    });
    return Array.from(areas.entries()).map(([slug, title]) => ({ slug, title }));
  }, [site.projects]);

  const nextImage = useCallback(() => {
    if (filteredImages.length === 0) return;
    setActiveImageIndex((prev) => (prev + 1) % filteredImages.length);
  }, [filteredImages.length]);

  const prevImage = useCallback(() => {
    if (filteredImages.length === 0) return;
    setActiveImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  }, [filteredImages.length]);

  // Reset to first "after" image when filter changes
  useEffect(() => {
    setActiveImageIndex(findFirstAfterIndex(filteredImages));
  }, [areaFilter, filteredImages, findFirstAfterIndex]);

  const currentImage = filteredImages[activeImageIndex];

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
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Gallery with area filtering */}
            <div>
              <div
                className={`relative aspect-[4/3] rounded-2xl overflow-hidden${currentImage ? ' cursor-pointer' : ''}`}
                style={{ boxShadow: neu(6), backgroundColor: SURFACE_ALT }}
                {...(currentImage ? {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': t('projects.openLightbox'),
                  onClick: handleLightboxOpen,
                  onKeyDown: handleLightboxKeyDown,
                } : {})}
              >
                {currentImage ? (
                  <>
                    <Image
                      src={currentImage.src}
                      alt={currentImage.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                    />
                    <BeforeAfterBadge isBefore={currentImage.is_before} t={t} />
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
                {currentImage && currentImage.projectSlug !== SITE_IMAGE_SLUG && (
                  <span
                    className="absolute bottom-4 left-4 px-3 py-1 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
                  >
                    {currentImage.projectTitle}
                  </span>
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
                    {area.title}
                  </button>
                ))}
              </div>

              {/* Thumbnails - After first, then Before */}
              {filteredImages.length > 1 && (() => {
                const afterImages = filteredImages
                  .map((img, i) => ({ ...img, originalIndex: i }))
                  .filter((img) => !img.is_before);
                const beforeImages = filteredImages
                  .map((img, i) => ({ ...img, originalIndex: i }))
                  .filter((img) => img.is_before);

                const renderRow = (images: typeof afterImages, label: string) => images.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs font-medium uppercase tracking-wide mb-2 block" style={{ color: TEXT_MUTED }}>
                      {label}
                    </span>
                    <div className="flex gap-3 overflow-x-auto p-1">
                      {images.map((img) => (
                        <button
                          key={`${img.projectSlug}-${img.src}`}
                          onClick={() => setActiveImageIndex(img.originalIndex)}
                          className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0"
                          aria-label={`${t('projects.viewImage')} ${img.originalIndex + 1}`}
                          aria-pressed={img.originalIndex === activeImageIndex}
                          style={{
                            outline: img.originalIndex === activeImageIndex ? `2px solid ${GOLD}` : 'none',
                            outlineOffset: '2px',
                          }}
                        >
                          <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );

                return (
                  <>
                    {renderRow(afterImages, t('projects.afterLabel'))}
                    {renderRow(beforeImages, t('projects.beforeLabel'))}
                  </>
                );
              })()}
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
              <div className="grid grid-cols-2 gap-4 mb-6">
                {site.location_city && (
                  <div className="rounded-xl p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
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
                {site.aggregated.totalDuration && (
                  <div className="rounded-xl p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('wholeHouse.totalDuration')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {site.aggregated.totalDuration}
                    </span>
                  </div>
                )}
                {site.aggregated.totalBudget && (
                  <div className="rounded-xl p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4" style={{ color: GOLD }} />
                      <span className="text-sm uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
                        {t('wholeHouse.totalBudget')}
                      </span>
                    </div>
                    <span className="text-base font-semibold" style={{ color: TEXT }}>
                      {site.aggregated.totalBudget}
                    </span>
                  </div>
                )}
                <div className="rounded-xl p-4" style={{ boxShadow: neu(4), backgroundColor: CARD }}>
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

      {/* Included Projects Section */}
      {site.projects.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE_ALT }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-2" style={{ color: TEXT }}>
              {t('wholeHouse.includedAreas')}
            </h2>
            <p className="text-sm mb-8" style={{ color: TEXT_MID }}>
              {t('wholeHouse.childProjectsCount', { count: site.projects.length })}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {site.projects.map((project) => (
                <ProjectCard key={project.slug} project={project} t={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxOpen && filteredImages.length > 0 && (
        <LightboxDialog
          images={filteredImages}
          activeIndex={activeImageIndex}
          onClose={handleLightboxClose}
          onPrev={prevImage}
          onNext={nextImage}
          t={t}
        />
      )}
    </div>
  );
}

/** Card for a project within the site view (for whole-house renovations) */
function ProjectCard({
  project,
  t,
}: {
  project: LocalizedProject;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="block rounded-xl overflow-hidden transition-all duration-200 hover:translate-y-[-4px]"
      style={{ boxShadow: neu(4), backgroundColor: CARD }}
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={project.hero_image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-3"
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}
        >
          <span className="text-white text-lg font-semibold">{project.title}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-4 text-sm" style={{ color: TEXT_MID }}>
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
        <p className="text-sm mt-2 line-clamp-2" style={{ color: TEXT_MID }}>
          {project.description}
        </p>
        <span className="inline-block mt-3 text-sm font-semibold" style={{ color: GOLD }}>
          {t('wholeHouse.viewAreaProject', { area: project.category })} &rarr;
        </span>
      </div>
    </Link>
  );
}

/** Accessible lightbox dialog */
function LightboxDialog({
  images,
  activeIndex,
  onClose,
  onPrev,
  onNext,
  t,
}: {
  images: { src: string; alt: string; is_before?: boolean; projectTitle: string }[];
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])'
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
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    const closeBtn = dialogRef.current?.querySelector<HTMLElement>('button');
    closeBtn?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const currentImage = images[activeIndex];

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label={t('projects.imageGallery')}
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        onClick={onClose}
        aria-label={t('modal.close')}
      >
        <X className="w-6 h-6 text-white" aria-hidden="true" />
      </button>
      <button
        className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label={t('projects.previousImage')}
      >
        <ChevronLeft className="w-6 h-6 text-white" aria-hidden="true" />
      </button>
      <button
        className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label={t('projects.nextImage')}
      >
        <ChevronRight className="w-6 h-6 text-white" aria-hidden="true" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <span className="text-sm text-white/70" aria-live="polite">
          {activeIndex + 1} / {images.length}
        </span>
        {currentImage && (
          <span className="text-xs text-white/50">
            {currentImage.projectTitle}
          </span>
        )}
      </div>
      <div className="relative w-full max-w-4xl aspect-[4/3] mx-4" onClick={(e) => e.stopPropagation()}>
        {currentImage && (
          <>
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain"
            />
            <BeforeAfterBadge isBefore={currentImage.is_before} t={t} />
          </>
        )}
      </div>
    </div>
  );
}
